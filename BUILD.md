# Chrome Web Store Package Build

This document describes how to build the Chrome extension package for submission to the Chrome Web Store.

## Quick Start

To build the extension package, run:

```bash
npm run build
```

Or directly:

```bash
node build-package.js
```

## What the Build Script Does

The automated build script (`build-package.js`) performs the following tasks:

### 1. Manifest Validation
- ✅ Checks `manifest.json` exists and is valid JSON
- ✅ Validates all required fields are present
- ✅ Ensures manifest version is 3 (required for Chrome Web Store)
- ✅ Validates extension name length (≤45 characters)
- ✅ Validates description length (≤132 characters)
- ✅ Checks version format
- ✅ Reviews permissions for necessity

### 2. Icon Validation
- ✅ Verifies all required icon sizes exist (16px, 32px, 48px, 128px)
- ✅ Validates PNG file format by checking file headers
- ✅ Confirms icons are properly referenced in manifest

### 3. File Filtering
The build process excludes development files and includes only what's needed for the Chrome Web Store:

**Included Files:**
- `manifest.json`
- `service-worker.js`
- `icons/icon16.png`
- `icons/icon32.png`
- `icons/icon48.png`
- `icons/icon128.png`

**Excluded Files:**
- `node_modules/`
- `.git/`
- `.vscode/`
- `.kiro/`
- `build/`
- Development scripts (`test-*.js`, `build-package.js`, etc.)
- Documentation files (`README.md`, `BUILD.md`)
- Package management files (`package.json`, `package-lock.json`)
- Icon generation scripts and SVG files
- ZIP packages

### 4. Package Creation
- ✅ Creates a clean `build/` directory
- ✅ Copies only necessary files
- ✅ Verifies all required files are present
- ✅ Calculates package size (Chrome Web Store limit: 128MB)
- ✅ Creates ZIP package: `quick-text-copy-extension.zip`

## Build Output

After a successful build, you'll see:

```
📋 Build Report
================
Extension Name: Quick Text Copy
Version: 1.0.0
Package File: quick-text-copy-extension.zip
Package Size: 0.02 MB
Build Directory: /path/to/build
Required Files: ✅ All present
Manifest: ✅ Valid
Icons: ✅ All validated
Ready for Chrome Web Store: ✅ Yes
```

## Files Generated

- `build/` - Clean build directory with only necessary files
- `quick-text-copy-extension.zip` - Ready-to-upload Chrome Web Store package

## Troubleshooting

If the build fails, check:

1. **Missing Icons**: Ensure all PNG icon files exist in the `icons/` directory
2. **Invalid Manifest**: Verify `manifest.json` syntax and required fields
3. **File Permissions**: Ensure the script has permission to create directories and files
4. **ZIP Command**: The script requires the `zip` command to be available in your system

## Chrome Web Store Requirements Met

✅ **Package Format**: ZIP file  
✅ **Manifest Version**: 3  
✅ **Required Icons**: All sizes (16, 32, 48, 128px)  
✅ **File Size**: Under 128MB limit  
✅ **Clean Package**: No development files included  
✅ **Valid Structure**: Proper directory structure  
✅ **Permissions**: Only necessary permissions requested  

Your package is ready for Chrome Web Store submission!