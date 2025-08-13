/**
 * Quick Text Copy 圖標驗證腳本
 * 驗證所有圖標檔案是否正確生成且符合規格
 */

const fs = require('fs');
const path = require('path');

class IconValidator {
    constructor() {
        this.requiredSizes = [16, 32, 48, 128];
        this.iconsDir = path.join(__dirname, 'icons');
        this.manifestPath = path.join(__dirname, 'manifest.json');
    }

    /**
     * 驗證圖標檔案是否存在
     */
    validateIconFiles() {
        console.log('🔍 驗證圖標檔案存在性...');
        const results = [];
        
        for (const size of this.requiredSizes) {
            const pngPath = path.join(this.iconsDir, `icon${size}.png`);
            const svgPath = path.join(this.iconsDir, `icon${size}.svg`);
            
            // 檢查 PNG 檔案
            if (fs.existsSync(pngPath)) {
                const stats = fs.statSync(pngPath);
                if (stats.size > 100) { // 確保不是空檔案或 1x1 佔位符
                    results.push(`✅ icon${size}.png 存在且大小合理 (${stats.size} bytes)`);
                } else {
                    results.push(`❌ icon${size}.png 檔案太小，可能是佔位符 (${stats.size} bytes)`);
                }
            } else {
                results.push(`❌ icon${size}.png 不存在`);
            }
            
            // 檢查 SVG 檔案
            if (fs.existsSync(svgPath)) {
                results.push(`✅ icon${size}.svg 存在`);
            } else {
                results.push(`⚠️  icon${size}.svg 不存在`);
            }
        }
        
        return results;
    }

    /**
     * 驗證 manifest.json 中的圖標配置
     */
    validateManifestIcons() {
        console.log('🔍 驗證 manifest.json 圖標配置...');
        const results = [];
        
        try {
            const manifestContent = fs.readFileSync(this.manifestPath, 'utf8');
            const manifest = JSON.parse(manifestContent);
            
            if (manifest.icons) {
                for (const size of this.requiredSizes) {
                    const expectedPath = `icons/icon${size}.png`;
                    if (manifest.icons[size] === expectedPath) {
                        results.push(`✅ manifest.json 中 ${size}px 圖標路徑正確`);
                    } else {
                        results.push(`❌ manifest.json 中 ${size}px 圖標路徑錯誤: ${manifest.icons[size]} (應為 ${expectedPath})`);
                    }
                }
            } else {
                results.push('❌ manifest.json 中缺少 icons 配置');
            }
        } catch (error) {
            results.push(`❌ 讀取 manifest.json 失敗: ${error.message}`);
        }
        
        return results;
    }

    /**
     * 驗證圖標內容不是佔位符
     */
    validateIconContent() {
        console.log('🔍 驗證圖標內容...');
        const results = [];
        
        for (const size of this.requiredSizes) {
            const pngPath = path.join(this.iconsDir, `icon${size}.png`);
            
            if (fs.existsSync(pngPath)) {
                try {
                    const buffer = fs.readFileSync(pngPath);
                    
                    // 檢查 PNG 檔案頭
                    if (buffer.length >= 8 && 
                        buffer[0] === 0x89 && buffer[1] === 0x50 && 
                        buffer[2] === 0x4E && buffer[3] === 0x47) {
                        
                        // 讀取圖像尺寸 (PNG 格式中位於第 16-23 字節)
                        if (buffer.length >= 24) {
                            const width = buffer.readUInt32BE(16);
                            const height = buffer.readUInt32BE(20);
                            
                            if (width === size && height === size) {
                                results.push(`✅ icon${size}.png 尺寸正確: ${width}x${height}`);
                            } else {
                                results.push(`❌ icon${size}.png 尺寸錯誤: ${width}x${height} (應為 ${size}x${size})`);
                            }
                            
                            // 檢查是否為 1x1 佔位符
                            if (width === 1 && height === 1) {
                                results.push(`❌ icon${size}.png 是 1x1 像素佔位符`);
                            }
                        } else {
                            results.push(`⚠️  icon${size}.png PNG 檔案格式可能有問題`);
                        }
                    } else {
                        results.push(`❌ icon${size}.png 不是有效的 PNG 檔案`);
                    }
                } catch (error) {
                    results.push(`❌ 讀取 icon${size}.png 失敗: ${error.message}`);
                }
            }
        }
        
        return results;
    }

    /**
     * 執行完整驗證
     */
    runFullValidation() {
        console.log('🎨 開始 Quick Text Copy 圖標完整驗證...\n');
        
        const fileResults = this.validateIconFiles();
        const manifestResults = this.validateManifestIcons();
        const contentResults = this.validateIconContent();
        
        console.log('📁 檔案存在性驗證:');
        fileResults.forEach(result => console.log(`  ${result}`));
        
        console.log('\n📋 Manifest 配置驗證:');
        manifestResults.forEach(result => console.log(`  ${result}`));
        
        console.log('\n🖼️  圖標內容驗證:');
        contentResults.forEach(result => console.log(`  ${result}`));
        
        // 統計結果
        const allResults = [...fileResults, ...manifestResults, ...contentResults];
        const successCount = allResults.filter(r => r.startsWith('✅')).length;
        const errorCount = allResults.filter(r => r.startsWith('❌')).length;
        const warningCount = allResults.filter(r => r.startsWith('⚠️')).length;
        
        console.log('\n📊 驗證摘要:');
        console.log(`  ✅ 成功: ${successCount}`);
        console.log(`  ❌ 錯誤: ${errorCount}`);
        console.log(`  ⚠️  警告: ${warningCount}`);
        
        if (errorCount === 0) {
            console.log('\n🎉 所有圖標驗證通過！擴展已準備好使用。');
            return true;
        } else {
            console.log('\n⚠️  發現問題，請檢查上述錯誤並修復。');
            return false;
        }
    }

    /**
     * 生成驗證報告
     */
    generateReport() {
        const timestamp = new Date().toISOString();
        const report = {
            timestamp,
            validator: 'Quick Text Copy Icon Validator',
            version: '1.0.0',
            results: {
                files: this.validateIconFiles(),
                manifest: this.validateManifestIcons(),
                content: this.validateIconContent()
            }
        };
        
        const reportPath = path.join(__dirname, 'icon-validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 驗證報告已儲存至: ${reportPath}`);
        
        return report;
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    const validator = new IconValidator();
    const success = validator.runFullValidation();
    validator.generateReport();
    
    process.exit(success ? 0 : 1);
}

module.exports = IconValidator;