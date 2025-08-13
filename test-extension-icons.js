/**
 * Chrome 擴展圖標顯示測試
 * 模擬擴展在不同情境下的圖標顯示
 */

const fs = require('fs');
const path = require('path');

class ExtensionIconTester {
    constructor() {
        this.manifestPath = path.join(__dirname, 'manifest.json');
        this.iconsDir = path.join(__dirname, 'icons');
    }

    /**
     * 測試擴展載入配置
     */
    testExtensionLoad() {
        console.log('🔧 測試擴展載入配置...\n');
        
        try {
            // 讀取 manifest.json
            const manifestContent = fs.readFileSync(this.manifestPath, 'utf8');
            const manifest = JSON.parse(manifestContent);
            
            console.log('📋 Manifest 資訊:');
            console.log(`  名稱: ${manifest.name}`);
            console.log(`  版本: ${manifest.version}`);
            console.log(`  描述: ${manifest.description}`);
            console.log(`  Manifest 版本: ${manifest.manifest_version}`);
            
            // 檢查 action 配置
            if (manifest.action) {
                console.log('\n🔘 Action 按鈕配置:');
                console.log(`  工具提示: ${manifest.action.default_title}`);
                console.log(`  彈出頁面: ${manifest.action.default_popup || '無 (直接動作)'}`);
            }
            
            // 檢查圖標配置
            if (manifest.icons) {
                console.log('\n🎨 圖標配置:');
                Object.entries(manifest.icons).forEach(([size, path]) => {
                    const fullPath = path.startsWith('/') ? path : path;
                    const exists = fs.existsSync(fullPath);
                    console.log(`  ${size}px: ${path} ${exists ? '✅' : '❌'}`);
                });
            }
            
            // 檢查權限
            if (manifest.permissions) {
                console.log('\n🔐 權限配置:');
                manifest.permissions.forEach(permission => {
                    console.log(`  - ${permission}`);
                });
            }
            
            return true;
        } catch (error) {
            console.error(`❌ 載入 manifest.json 失敗: ${error.message}`);
            return false;
        }
    }

    /**
     * 模擬工具列顯示測試
     */
    testToolbarDisplay() {
        console.log('\n🔧 模擬工具列顯示測試...');
        
        const toolbarSizes = [16, 32]; // Chrome 工具列使用的尺寸
        
        toolbarSizes.forEach(size => {
            const iconPath = path.join(this.iconsDir, `icon${size}.png`);
            
            if (fs.existsSync(iconPath)) {
                const stats = fs.statSync(iconPath);
                console.log(`  ✅ 工具列圖標 ${size}px: 檔案大小 ${stats.size} bytes`);
                
                // 檢查檔案是否太小（可能是佔位符）
                if (stats.size < 100) {
                    console.log(`    ⚠️  警告: 檔案大小過小，可能是佔位符`);
                }
            } else {
                console.log(`  ❌ 工具列圖標 ${size}px: 檔案不存在`);
            }
        });
    }

    /**
     * 模擬擴展管理頁面顯示測試
     */
    testExtensionPageDisplay() {
        console.log('\n⚙️ 模擬擴展管理頁面顯示測試...');
        
        const managementSize = 48; // Chrome 擴展管理頁面使用的尺寸
        const iconPath = path.join(this.iconsDir, `icon${managementSize}.png`);
        
        if (fs.existsSync(iconPath)) {
            const stats = fs.statSync(iconPath);
            console.log(`  ✅ 管理頁面圖標 ${managementSize}px: 檔案大小 ${stats.size} bytes`);
        } else {
            console.log(`  ❌ 管理頁面圖標 ${managementSize}px: 檔案不存在`);
        }
    }

    /**
     * 模擬 Chrome Web Store 顯示測試
     */
    testWebStoreDisplay() {
        console.log('\n🏪 模擬 Chrome Web Store 顯示測試...');
        
        const storeSize = 128; // Chrome Web Store 使用的尺寸
        const iconPath = path.join(this.iconsDir, `icon${storeSize}.png`);
        
        if (fs.existsSync(iconPath)) {
            const stats = fs.statSync(iconPath);
            console.log(`  ✅ Web Store 圖標 ${storeSize}px: 檔案大小 ${stats.size} bytes`);
        } else {
            console.log(`  ❌ Web Store 圖標 ${storeSize}px: 檔案不存在`);
        }
    }

    /**
     * 生成 Chrome 載入指令
     */
    generateChromeLoadInstructions() {
        console.log('\n🚀 Chrome 擴展載入指令:');
        console.log('  1. 開啟 Chrome 瀏覽器');
        console.log('  2. 前往 chrome://extensions/');
        console.log('  3. 啟用「開發者模式」');
        console.log('  4. 點擊「載入未封裝項目」');
        console.log(`  5. 選擇此目錄: ${__dirname}`);
        console.log('  6. 確認擴展已載入並檢查圖標顯示');
        
        console.log('\n🔍 圖標顯示檢查點:');
        console.log('  - 工具列中的擴展按鈕圖標是否清晰');
        console.log('  - 滑鼠懸停時工具提示是否正確顯示');
        console.log('  - 擴展管理頁面中的圖標是否正確顯示');
        console.log('  - 圖標在不同解析度下是否保持清晰');
    }

    /**
     * 執行完整測試
     */
    runFullTest() {
        console.log('🎨 Quick Text Copy 擴展圖標顯示測試\n');
        console.log('=' .repeat(50));
        
        const loadSuccess = this.testExtensionLoad();
        
        if (loadSuccess) {
            this.testToolbarDisplay();
            this.testExtensionPageDisplay();
            this.testWebStoreDisplay();
            this.generateChromeLoadInstructions();
            
            console.log('\n' + '='.repeat(50));
            console.log('✅ 圖標顯示測試完成！');
            console.log('📝 請按照上述指令在 Chrome 中載入擴展以進行實際測試。');
        } else {
            console.log('\n❌ 擴展配置有問題，請先修復後再進行顯示測試。');
        }
        
        return loadSuccess;
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    const tester = new ExtensionIconTester();
    const success = tester.runFullTest();
    
    process.exit(success ? 0 : 1);
}

module.exports = ExtensionIconTester;