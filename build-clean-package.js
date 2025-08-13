#!/usr/bin/env node

/**
 * Chrome Web Store 乾淨套件建置工具
 * 只包含擴充功能運行所需的核心檔案
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CleanPackageBuilder {
    constructor() {
        this.projectRoot = process.cwd();
        this.buildDir = path.join(this.projectRoot, 'clean-build');
        this.packageName = 'quick-text-copy-extension.zip';
        
        // 只包含這些核心檔案
        this.coreFiles = [
            'manifest.json',
            'service-worker.js',
            'privacy-policy.md'
        ];
        
        // 只包含這些目錄
        this.coreDirectories = [
            'icons'
        ];
        
        // 圖標檔案
        this.iconFiles = [
            'icons/icon16.png',
            'icons/icon32.png',
            'icons/icon48.png',
            'icons/icon128.png'
        ];
    }

    async build() {
        console.log('🚀 開始建置乾淨的 Chrome Web Store 套件...');
        
        try {
            // 步驟 1: 清理並創建建置目錄
            await this.cleanBuildDirectory();
            
            // 步驟 2: 驗證必要檔案
            await this.validateRequiredFiles();
            
            // 步驟 3: 複製核心檔案
            await this.copyCoreFiles();
            
            // 步驟 4: 驗證建置結果
            await this.validateBuild();
            
            // 步驟 5: 創建 ZIP 套件
            await this.createZipPackage();
            
            // 步驟 6: 生成建置報告
            await this.generateBuildReport();
            
            console.log('🎉 乾淨套件建置完成！');
            
        } catch (error) {
            console.error('❌ 建置失敗:', error.message);
            process.exit(1);
        }
    }

    async cleanBuildDirectory() {
        console.log('🧹 清理建置目錄...');
        
        if (fs.existsSync(this.buildDir)) {
            execSync(`rm -rf "${this.buildDir}"`);
        }
        
        fs.mkdirSync(this.buildDir, { recursive: true });
        fs.mkdirSync(path.join(this.buildDir, 'icons'), { recursive: true });
        
        console.log('✅ 建置目錄已清理');
    }

    async validateRequiredFiles() {
        console.log('🔍 驗證必要檔案...');
        
        // 檢查核心檔案
        for (const file of this.coreFiles) {
            const filePath = path.join(this.projectRoot, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`必要檔案缺失: ${file}`);
            }
        }
        
        // 檢查圖標檔案
        for (const iconFile of this.iconFiles) {
            const iconPath = path.join(this.projectRoot, iconFile);
            if (!fs.existsSync(iconPath)) {
                throw new Error(`圖標檔案缺失: ${iconFile}`);
            }
        }
        
        // 驗證 manifest.json
        const manifestPath = path.join(this.projectRoot, 'manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        const requiredFields = ['manifest_version', 'name', 'version', 'description'];
        for (const field of requiredFields) {
            if (!manifest[field]) {
                throw new Error(`manifest.json 缺少必要欄位: ${field}`);
            }
        }
        
        console.log('✅ 所有必要檔案驗證通過');
    }

    async copyCoreFiles() {
        console.log('📁 複製核心檔案...');
        
        // 複製核心檔案
        for (const file of this.coreFiles) {
            const sourcePath = path.join(this.projectRoot, file);
            const targetPath = path.join(this.buildDir, file);
            
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`  ✅ ${file}`);
        }
        
        // 複製圖標檔案
        for (const iconFile of this.iconFiles) {
            const sourcePath = path.join(this.projectRoot, iconFile);
            const targetPath = path.join(this.buildDir, iconFile);
            
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`  ✅ ${iconFile}`);
        }
        
        console.log('✅ 核心檔案複製完成');
    }

    async validateBuild() {
        console.log('🔍 驗證建置結果...');
        
        // 檢查建置目錄中的檔案
        const buildFiles = this.getAllFiles(this.buildDir);
        const expectedFiles = [
            ...this.coreFiles,
            ...this.iconFiles
        ];
        
        for (const expectedFile of expectedFiles) {
            const buildFilePath = path.join(this.buildDir, expectedFile);
            if (!fs.existsSync(buildFilePath)) {
                throw new Error(`建置檔案缺失: ${expectedFile}`);
            }
        }
        
        // 檢查是否有不應該存在的檔案
        const relativeBuildFiles = buildFiles.map(file => 
            path.relative(this.buildDir, file)
        );
        
        const unexpectedFiles = relativeBuildFiles.filter(file => 
            !expectedFiles.includes(file) && !file.startsWith('.')
        );
        
        if (unexpectedFiles.length > 0) {
            console.log('⚠️  發現意外檔案:', unexpectedFiles);
        }
        
        console.log('✅ 建置結果驗證通過');
    }

    getAllFiles(dir) {
        let files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files = files.concat(this.getAllFiles(fullPath));
            } else {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    async createZipPackage() {
        console.log('📦 創建 ZIP 套件...');
        
        // 刪除舊的 ZIP 檔案
        const zipPath = path.join(this.projectRoot, this.packageName);
        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
        }
        
        // 創建新的 ZIP 檔案
        const buildFiles = this.getAllFiles(this.buildDir);
        const relativeFiles = buildFiles.map(file => 
            path.relative(this.buildDir, file)
        ).join(' ');
        
        execSync(`cd "${this.buildDir}" && zip -r "../${this.packageName}" ${relativeFiles}`, {
            stdio: 'inherit'
        });
        
        // 檢查 ZIP 檔案大小
        const zipStats = fs.statSync(zipPath);
        const zipSizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);
        
        console.log(`✅ ZIP 套件已創建: ${this.packageName} (${zipSizeMB} MB)`);
        
        // 驗證 ZIP 檔案內容
        console.log('🔍 驗證 ZIP 檔案內容...');
        execSync(`unzip -l "${zipPath}"`, { stdio: 'inherit' });
    }

    async generateBuildReport() {
        console.log('📊 生成建置報告...');
        
        const manifest = JSON.parse(fs.readFileSync(path.join(this.buildDir, 'manifest.json'), 'utf8'));
        const zipPath = path.join(this.projectRoot, this.packageName);
        const zipStats = fs.statSync(zipPath);
        
        const report = {
            buildTime: new Date().toISOString(),
            extensionName: manifest.name,
            version: manifest.version,
            packageFile: this.packageName,
            packageSize: `${(zipStats.size / (1024 * 1024)).toFixed(2)} MB`,
            coreFiles: this.coreFiles.length,
            iconFiles: this.iconFiles.length,
            totalFiles: this.coreFiles.length + this.iconFiles.length,
            manifestVersion: manifest.manifest_version,
            readyForStore: true
        };
        
        console.log('\n📋 建置報告');
        console.log('================');
        console.log(`擴充功能名稱: ${report.extensionName}`);
        console.log(`版本: ${report.version}`);
        console.log(`套件檔案: ${report.packageFile}`);
        console.log(`套件大小: ${report.packageSize}`);
        console.log(`總檔案數: ${report.totalFiles}`);
        console.log(`Manifest 版本: ${report.manifestVersion}`);
        console.log(`Chrome Web Store 就緒: ✅ 是`);
        
        // 保存報告
        const reportPath = path.join(this.projectRoot, 'clean-build-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📄 詳細報告已保存: ${reportPath}`);
    }
}

// 執行建置
if (require.main === module) {
    const builder = new CleanPackageBuilder();
    builder.build();
}

module.exports = CleanPackageBuilder;