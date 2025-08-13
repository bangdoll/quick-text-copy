#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PackageBuilder {
  constructor() {
    this.projectRoot = process.cwd();
    this.buildDir = path.join(this.projectRoot, 'build');
    this.packageName = 'quick-text-copy-extension.zip';

    // Files and directories to exclude from the package
    this.excludePatterns = [
      'node_modules',
      '.git',
      '.vscode',
      '.kiro',
      'build',
      'test-*.js',
      'test-*.html',
      'package.json',
      'package-lock.json',
      'README.md',
      'convert-icons.js',
      'verify-icons.js',
      'build-package.js',
      '*.zip',
      'icons/create-*.html',
      'icons/create-*.js',
      'icons/generate-*.js',
      'icons/generate-*.html',
      'icons/base64-icons.js',
      'icons/icon-base64.js',
      'icons/*.svg'
    ];

    // Required files for Chrome Web Store
    this.requiredFiles = [
      'manifest.json',
      'service-worker.js',
      'icons/icon16.png',
      'icons/icon32.png',
      'icons/icon48.png',
      'icons/icon128.png'
    ];

    // Required manifest fields for Chrome Web Store
    this.requiredManifestFields = [
      'manifest_version',
      'name',
      'version',
      'description',
      'permissions',
      'icons'
    ];
  }

  /**
   * Validate manifest.json completeness and Chrome Web Store requirements
   */
  validateManifest() {
    console.log('🔍 Validating manifest.json...');

    const manifestPath = path.join(this.projectRoot, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error('manifest.json not found');
    }

    let manifest;
    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      manifest = JSON.parse(manifestContent);
    } catch (error) {
      throw new Error(`Invalid manifest.json format: ${error.message}`);
    }

    // Check required fields
    for (const field of this.requiredManifestFields) {
      if (!manifest[field]) {
        throw new Error(`Missing required manifest field: ${field}`);
      }
    }

    // Validate manifest version
    if (manifest.manifest_version !== 3) {
      throw new Error('Chrome Web Store requires manifest_version 3');
    }

    // Validate name length (max 45 characters for Chrome Web Store)
    if (manifest.name.length > 45) {
      throw new Error('Extension name must be 45 characters or less');
    }

    // Validate description length (max 132 characters for Chrome Web Store)
    if (manifest.description.length > 132) {
      throw new Error('Extension description must be 132 characters or less');
    }

    // Validate version format
    const versionRegex = /^\d+(\.\d+)*$/;
    if (!versionRegex.test(manifest.version)) {
      throw new Error('Invalid version format. Use format like 1.0.0');
    }

    // Validate permissions (should only request necessary permissions)
    const allowedPermissions = ['activeTab', 'scripting'];
    if (manifest.permissions) {
      for (const permission of manifest.permissions) {
        if (!allowedPermissions.includes(permission)) {
          console.warn(`⚠️  Warning: Permission '${permission}' may require justification`);
        }
      }
    }

    console.log('✅ Manifest validation passed');
    return manifest;
  }

  /**
   * Check all icon files existence and format correctness
   */
  validateIcons() {
    console.log('🖼️  Validating icon files...');

    const iconSizes = [16, 32, 48, 128];
    const missingIcons = [];

    for (const size of iconSizes) {
      const iconPath = path.join(this.projectRoot, 'icons', `icon${size}.png`);
      if (!fs.existsSync(iconPath)) {
        missingIcons.push(`icon${size}.png`);
        continue;
      }

      // Check if file is actually a PNG by reading the header
      try {
        const buffer = fs.readFileSync(iconPath);
        const isPNG = buffer.length >= 8 &&
          buffer[0] === 0x89 && buffer[1] === 0x50 &&
          buffer[2] === 0x4E && buffer[3] === 0x47;

        if (!isPNG) {
          throw new Error(`icon${size}.png is not a valid PNG file`);
        }

        console.log(`✅ icon${size}.png validated`);
      } catch (error) {
        throw new Error(`Error validating icon${size}.png: ${error.message}`);
      }
    }

    if (missingIcons.length > 0) {
      throw new Error(`Missing required icon files: ${missingIcons.join(', ')}`);
    }

    console.log('✅ All icon files validated');
  }

  /**
   * Check if file/directory should be excluded from package
   */
  shouldExclude(filePath) {
    const relativePath = path.relative(this.projectRoot, filePath);

    return this.excludePatterns.some(pattern => {
      if (pattern.endsWith('/')) {
        // Directory pattern
        return relativePath.startsWith(pattern.slice(0, -1)) ||
          relativePath.includes('/' + pattern.slice(0, -1));
      } else if (pattern.includes('*')) {
        // Wildcard pattern
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(relativePath);
      } else {
        // Exact match
        return relativePath === pattern || relativePath.endsWith('/' + pattern);
      }
    });
  }

  /**
   * Copy files to build directory, excluding development files
   */
  copyFiles() {
    console.log('📁 Copying files to build directory...');

    // Clean and create build directory
    if (fs.existsSync(this.buildDir)) {
      fs.rmSync(this.buildDir, { recursive: true, force: true });
    }
    fs.mkdirSync(this.buildDir, { recursive: true });

    const copyRecursive = (src, dest) => {
      const stats = fs.statSync(src);

      if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }

        const files = fs.readdirSync(src);
        for (const file of files) {
          const srcPath = path.join(src, file);
          const destPath = path.join(dest, file);

          if (!this.shouldExclude(srcPath)) {
            copyRecursive(srcPath, destPath);
          }
        }
      } else {
        fs.copyFileSync(src, dest);
        console.log(`  ✅ ${path.relative(this.projectRoot, src)}`);
      }
    };

    // Copy all non-excluded files
    const files = fs.readdirSync(this.projectRoot);
    for (const file of files) {
      const srcPath = path.join(this.projectRoot, file);
      const destPath = path.join(this.buildDir, file);

      if (!this.shouldExclude(srcPath)) {
        copyRecursive(srcPath, destPath);
      }
    }

    console.log('✅ Files copied successfully');
  }

  /**
   * Verify all required files are present in build directory
   */
  verifyRequiredFiles() {
    console.log('🔍 Verifying required files in build directory...');

    const missingFiles = [];
    for (const file of this.requiredFiles) {
      const filePath = path.join(this.buildDir, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      throw new Error(`Missing required files in build: ${missingFiles.join(', ')}`);
    }

    console.log('✅ All required files present');
  }

  /**
   * Calculate package size and check limits
   */
  calculatePackageSize() {
    console.log('📊 Calculating package size...');

    let totalSize = 0;
    const maxSize = 128 * 1024 * 1024; // 128MB Chrome Web Store limit

    const calculateDirSize = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          calculateDirSize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    };

    calculateDirSize(this.buildDir);

    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`📦 Package size: ${sizeMB} MB`);

    if (totalSize > maxSize) {
      throw new Error(`Package size (${sizeMB} MB) exceeds Chrome Web Store limit (128 MB)`);
    }

    return totalSize;
  }

  /**
   * Create ZIP package file
   */
  createZipPackage() {
    console.log('📦 Creating ZIP package...');

    const zipPath = path.join(this.projectRoot, this.packageName);

    // Remove existing package if it exists
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    try {
      // Use system zip command to create the package
      const command = `cd "${this.buildDir}" && zip -r "../${this.packageName}" .`;
      execSync(command, { stdio: 'pipe' });

      console.log(`✅ ZIP package created: ${this.packageName}`);

      // Verify ZIP file was created and get its size
      if (fs.existsSync(zipPath)) {
        const zipStats = fs.statSync(zipPath);
        const zipSizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);
        console.log(`📦 Final ZIP size: ${zipSizeMB} MB`);
        return zipPath;
      } else {
        throw new Error('ZIP file was not created successfully');
      }
    } catch (error) {
      throw new Error(`Failed to create ZIP package: ${error.message}`);
    }
  }

  /**
   * Generate build report
   */
  generateReport(zipPath) {
    console.log('\n📋 Build Report');
    console.log('================');

    const manifest = JSON.parse(fs.readFileSync(path.join(this.buildDir, 'manifest.json'), 'utf8'));
    const zipStats = fs.statSync(zipPath);

    console.log(`Extension Name: ${manifest.name}`);
    console.log(`Version: ${manifest.version}`);
    console.log(`Package File: ${this.packageName}`);
    console.log(`Package Size: ${(zipStats.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Build Directory: ${this.buildDir}`);
    console.log(`Required Files: ✅ All present`);
    console.log(`Manifest: ✅ Valid`);
    console.log(`Icons: ✅ All validated`);
    console.log(`Ready for Chrome Web Store: ✅ Yes`);
  }

  /**
   * Main build process
   */
  async build() {
    try {
      console.log('🚀 Starting Chrome Web Store package build...\n');

      // Step 1: Validate manifest.json
      this.validateManifest();

      // Step 2: Validate icon files
      this.validateIcons();

      // Step 3: Copy files (excluding development files)
      this.copyFiles();

      // Step 4: Verify required files are present
      this.verifyRequiredFiles();

      // Step 5: Calculate package size
      this.calculatePackageSize();

      // Step 6: Create ZIP package
      const zipPath = this.createZipPackage();

      // Step 7: Generate report
      this.generateReport(zipPath);

      console.log('\n🎉 Package build completed successfully!');
      console.log(`📦 Your Chrome Web Store package is ready: ${this.packageName}`);

    } catch (error) {
      console.error(`\n❌ Build failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run the build if this script is executed directly
if (require.main === module) {
  const builder = new PackageBuilder();
  builder.build();
}

module.exports = PackageBuilder;