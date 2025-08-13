#!/usr/bin/env node

/**
 * 建立乾淨的Chrome擴充功能套件
 * 只包含必要的檔案，確保manifest.json在根目錄
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CleanExtensionBuilder {
    constructor() {
        this.buildDir = 'extension-package';
        this.zipName = 'quick-text-copy-clean.zip';
        this.requiredFiles = [
            'manifest.json',
            'service-worker.js',
            'privacy-policy.html'
        ];
        this.requiredDirs = [
            'icons'
        ];
    }

    /**
     * 建立乾淨的擴充功能套件
     */
    async buildCleanPackage() {
        console.log('🧹 開始建立乾淨的擴充功能套件...\n');

        try {
            // 清理並創建建置目錄
            this.cleanBuildDirectory();
            
            // 複製必要檔案
            this.copyRequiredFiles();
            
            // 驗證檔案
            this.validateFiles();
            
            // 創建 ZIP 套件
            this.createZipPackage();
            
            // 驗證套件
            this.validatePackage();
            
            console.log('✅ 乾淨的擴充功能套件建立完成！');
            console.log(`📦 套件檔案: ${this.zipName}`);
            
        } catch (error) {
            console.error('❌ 建立套件時發生錯誤:', error.message);
            process.exit(1);
        }
    }

    /**
     * 清理並創建建置目錄
     */
    cleanBuildDirectory() {
        console.log('📁 準備建置目錄...');
        
        // 刪除舊的建置目錄
        if (fs.existsSync(this.buildDir)) {
            fs.rmSync(this.buildDir, { recursive: true, force: true });
        }
        
        // 創建新的建置目錄
        fs.mkdirSync(this.buildDir, { recursive: true });
        
        console.log(`✅ 建置目錄已準備: ${this.buildDir}\n`);
    }

    /**
     * 複製必要檔案
     */
    copyRequiredFiles() {
        console.log('📋 複製必要檔案...');
        
        // 複製檔案
        this.requiredFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const destPath = path.join(this.buildDir, file);
                fs.copyFileSync(file, destPath);
                console.log(`✅ 已複製: ${file}`);
            } else {
                throw new Error(`必要檔案不存在: ${file}`);
            }
        });
        
        // 複製目錄
        this.requiredDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                const destPath = path.join(this.buildDir, dir);
                this.copyDirectory(dir, destPath);
                console.log(`✅ 已複製目錄: ${dir}`);
            } else {
                throw new Error(`必要目錄不存在: ${dir}`);
            }
        });
        
        console.log('');
    }

    /**
     * 遞迴複製目錄（只複製必要檔案）
     */
    copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const items = fs.readdirSync(src);
        
        items.forEach(item => {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item);
            
            if (fs.statSync(srcPath).isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                // 只複製必要的檔案
                if (src === 'icons') {
                    // 對於 icons 目錄，只複製 PNG 檔案
                    if (item.endsWith('.png')) {
                        fs.copyFileSync(srcPath, destPath);
                    }
                } else {
                    fs.copyFileSync(srcPath, destPath);
                }
            }
        });
    }

    /**
     * 驗證檔案
     */
    validateFiles() {
        console.log('🔍 驗證檔案...');
        
        // 檢查 manifest.json
        const manifestPath = path.join(this.buildDir, 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
            throw new Error('manifest.json 不存在於建置目錄中');
        }
        
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            console.log(`✅ manifest.json 格式正確 (版本: ${manifest.version})`);
        } catch (error) {
            throw new Error(`manifest.json 格式錯誤: ${error.message}`);
        }
        
        // 檢查 service worker
        const serviceWorkerPath = path.join(this.buildDir, 'service-worker.js');
        if (!fs.existsSync(serviceWorkerPath)) {
            throw new Error('service-worker.js 不存在');
        }
        console.log('✅ service-worker.js 存在');
        
        // 檢查圖示
        const iconsDir = path.join(this.buildDir, 'icons');
        if (!fs.existsSync(iconsDir)) {
            throw new Error('icons 目錄不存在');
        }
        
        const requiredIcons = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'];
        requiredIcons.forEach(icon => {
            const iconPath = path.join(iconsDir, icon);
            if (!fs.existsSync(iconPath)) {
                throw new Error(`必要圖示不存在: ${icon}`);
            }
        });
        console.log('✅ 所有必要圖示都存在');
        
        // 檢查隱私政策
        const privacyPath = path.join(this.buildDir, 'privacy-policy.html');
        if (!fs.existsSync(privacyPath)) {
            throw new Error('privacy-policy.html 不存在');
        }
        console.log('✅ privacy-policy.html 存在');
        
        console.log('');
    }

    /**
     * 創建 ZIP 套件
     */
    createZipPackage() {
        console.log('📦 創建 ZIP 套件...');
        
        // 刪除舊的 ZIP 檔案
        if (fs.existsSync(this.zipName)) {
            fs.unlinkSync(this.zipName);
        }
        
        try {
            // 使用 zip 命令創建套件
            const command = `cd ${this.buildDir} && zip -r ../${this.zipName} .`;
            execSync(command, { stdio: 'pipe' });
            
            console.log(`✅ ZIP 套件已創建: ${this.zipName}`);
            
            // 顯示檔案大小
            const stats = fs.statSync(this.zipName);
            const sizeKB = Math.round(stats.size / 1024);
            console.log(`📊 套件大小: ${sizeKB} KB`);
            
        } catch (error) {
            throw new Error(`創建 ZIP 套件失敗: ${error.message}`);
        }
        
        console.log('');
    }

    /**
     * 驗證套件
     */
    validatePackage() {
        console.log('🔍 驗證套件結構...');
        
        try {
            // 列出 ZIP 檔案內容
            const output = execSync(`unzip -l ${this.zipName}`, { encoding: 'utf8' });
            
            // 檢查 manifest.json 是否在根目錄
            if (!output.includes('manifest.json') || output.includes('/manifest.json')) {
                throw new Error('manifest.json 不在 ZIP 檔案的根目錄中');
            }
            
            console.log('✅ manifest.json 在根目錄中');
            
            // 檢查必要檔案
            const requiredInZip = [
                'manifest.json',
                'service-worker.js',
                'privacy-policy.html',
                'icons/icon16.png',
                'icons/icon32.png',
                'icons/icon48.png',
                'icons/icon128.png'
            ];
            
            requiredInZip.forEach(file => {
                if (!output.includes(file)) {
                    throw new Error(`ZIP 套件中缺少必要檔案: ${file}`);
                }
            });
            
            console.log('✅ 所有必要檔案都在 ZIP 套件中');
            
            // 顯示套件內容
            console.log('\n📋 套件內容:');
            const lines = output.split('\n');
            lines.forEach(line => {
                if (line.includes('.') && !line.includes('Archive:') && !line.includes('Length')) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 4) {
                        const filename = parts[parts.length - 1];
                        console.log(`   ${filename}`);
                    }
                }
            });
            
        } catch (error) {
            throw new Error(`驗證套件失敗: ${error.message}`);
        }
        
        console.log('');
    }

    /**
     * 顯示使用說明
     */
    showUsageInstructions() {
        console.log('📝 使用說明:');
        console.log('1. 將 quick-text-copy-clean.zip 上傳到 Chrome Web Store');
        console.log('2. 確保在開發者控制台中選擇正確的 ZIP 檔案');
        console.log('3. manifest.json 應該在 ZIP 檔案的根目錄中');
        console.log('4. 套件只包含必要的擴充功能檔案');
        console.log('');
        console.log('🔗 Chrome Web Store 開發者控制台:');
        console.log('https://chrome.google.com/webstore/devconsole');
    }
}

// 執行建置
if (require.main === module) {
    const builder = new CleanExtensionBuilder();
    builder.buildCleanPackage()
        .then(() => {
            builder.showUsageInstructions();
        })
        .catch(console.error);
}

module.exports = CleanExtensionBuilder;