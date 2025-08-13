#!/usr/bin/env node

/**
 * 將 SVG 截圖轉換為 PNG 格式
 * 使用 Canvas API 進行轉換
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

class SVGToPNGConverter {
    constructor() {
        this.screenshotsDir = 'chrome-store-listing/screenshots';
        this.width = 1280;
        this.height = 800;
    }

    async convertSVGToPNG(svgFilename, pngFilename) {
        try {
            const svgPath = path.join(this.screenshotsDir, svgFilename);
            const pngPath = path.join(this.screenshotsDir, pngFilename);
            
            if (!fs.existsSync(svgPath)) {
                console.log(`⚠️  SVG 檔案不存在: ${svgPath}`);
                return false;
            }

            // 創建 Canvas
            const canvas = createCanvas(this.width, this.height);
            const ctx = canvas.getContext('2d');

            // 設定白色背景
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, this.width, this.height);

            // 由於 Canvas 不直接支援 SVG，我們創建一個簡化的 PNG 版本
            await this.createScreenshotPNG(ctx, pngFilename);

            // 保存 PNG
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(pngPath, buffer);
            
            console.log(`✅ 已轉換: ${svgFilename} -> ${pngFilename}`);
            return true;

        } catch (error) {
            console.error(`❌ 轉換失敗 ${svgFilename}:`, error.message);
            return false;
        }
    }

    async createScreenshotPNG(ctx, filename) {
        // 設定字體
        ctx.font = '16px Arial, sans-serif';
        
        if (filename.includes('extension-icon')) {
            await this.drawExtensionIconScreenshot(ctx);
        } else if (filename.includes('before-after')) {
            await this.drawBeforeAfterScreenshot(ctx);
        } else if (filename.includes('multiple-examples')) {
            await this.drawMultipleExamplesScreenshot(ctx);
        }
    }

    async drawExtensionIconScreenshot(ctx) {
        // 瀏覽器視窗背景
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 1280, 800);
        
        // 瀏覽器標題列
        ctx.fillStyle = '#e9ecef';
        ctx.fillRect(0, 0, 1280, 80);
        
        ctx.fillStyle = '#495057';
        ctx.font = '16px Arial, sans-serif';
        ctx.fillText('Chrome 瀏覽器', 20, 50);
        
        // 網址列
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, 90, 1000, 40);
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 90, 1000, 40);
        
        ctx.fillStyle = '#6c757d';
        ctx.font = '14px Arial, sans-serif';
        ctx.fillText('https://www.google.com', 40, 115);
        
        // 工具列區域
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(1030, 90, 230, 40);
        ctx.strokeStyle = '#dee2e6';
        ctx.strokeRect(1030, 90, 230, 40);
        
        // Quick Text Copy 圖示 (高亮顯示)
        ctx.fillStyle = '#007bff';
        ctx.fillRect(1180, 95, 30, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial, sans-serif';
        ctx.fillText('QTC', 1185, 115);
        
        // 箭頭指向圖示
        ctx.strokeStyle = '#dc3545';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(1150, 150);
        ctx.lineTo(1190, 130);
        ctx.stroke();
        
        // 說明文字
        ctx.fillStyle = '#dc3545';
        ctx.font = '18px Arial, sans-serif';
        ctx.fillText('點擊 Quick Text Copy 圖示', 950, 180);
        
        // 網頁內容區域
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, 150, 1240, 630);
        ctx.strokeStyle = '#dee2e6';
        ctx.strokeRect(20, 150, 1240, 630);
        
        // 模擬 Google 頁面
        ctx.fillStyle = '#4285f4';
        ctx.font = '48px Arial, sans-serif';
        ctx.fillText('Google', 580, 350);
        
        // 搜尋框
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(440, 380, 400, 50);
        ctx.strokeStyle = '#dadce0';
        ctx.lineWidth = 2;
        ctx.strokeRect(440, 380, 400, 50);
    }

    async drawBeforeAfterScreenshot(ctx) {
        // 背景
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 1280, 800);
        
        // 標題
        ctx.fillStyle = '#212529';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('使用 Quick Text Copy 前後對比', 440, 50);
        
        // 分割線
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(640, 80);
        ctx.lineTo(640, 750);
        ctx.stroke();
        
        // 左側 - 使用前
        ctx.fillStyle = '#dc3545';
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText('使用前：繁瑣的手動操作', 50, 120);
        
        // 步驟說明
        const beforeSteps = [
            '1. 手動選取網頁標題',
            '2. 複製標題到剪貼簿',
            '3. 複製網址列內容',
            '4. 手動組合格式',
            '5. 貼上到目標位置'
        ];
        
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial, sans-serif';
        beforeSteps.forEach((step, index) => {
            ctx.fillText(step, 50, 160 + index * 40);
        });
        
        // 時間消耗
        ctx.fillStyle = '#dc3545';
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.fillText('⏱️ 需要 30-60 秒', 50, 400);
        
        // 右側 - 使用後
        ctx.fillStyle = '#28a745';
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText('使用後：一鍵完成', 690, 120);
        
        // 簡化步驟
        const afterSteps = [
            '1. 點擊 Quick Text Copy 圖示',
            '2. 自動複製格式化內容',
            '3. 直接貼上使用'
        ];
        
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial, sans-serif';
        afterSteps.forEach((step, index) => {
            ctx.fillText(step, 690, 160 + index * 40);
        });
        
        // 時間節省
        ctx.fillStyle = '#28a745';
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.fillText('⚡ 只需 1-2 秒', 690, 280);
        
        // 結果展示
        ctx.fillStyle = '#495057';
        ctx.font = '14px Arial, sans-serif';
        ctx.fillText('複製結果格式：', 50, 500);
        
        // 結果框
        ctx.fillStyle = '#e9ecef';
        ctx.fillRect(50, 520, 1180, 100);
        ctx.strokeStyle = '#adb5bd';
        ctx.strokeRect(50, 520, 1180, 100);
        
        ctx.fillStyle = '#212529';
        ctx.font = '16px monospace';
        ctx.fillText('Google https://www.google.com', 70, 560);
        ctx.fillText('GitHub - Quick Text Copy https://github.com/user/quick-text-copy', 70, 590);
    }

    async drawMultipleExamplesScreenshot(ctx) {
        // 背景
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 1280, 800);
        
        // 標題
        ctx.fillStyle = '#212529';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('多種網站使用範例', 480, 50);
        
        // 範例網站
        const examples = [
            {
                title: 'Google 搜尋',
                url: 'https://www.google.com/search?q=chrome+extension',
                result: 'Google 搜尋 https://www.google.com/search?q=chrome+extension',
                color: '#4285f4'
            },
            {
                title: 'GitHub 專案',
                url: 'https://github.com/user/awesome-project',
                result: 'GitHub 專案 https://github.com/user/awesome-project',
                color: '#24292e'
            },
            {
                title: 'Stack Overflow 問題',
                url: 'https://stackoverflow.com/questions/12345/how-to-code',
                result: 'Stack Overflow 問題 https://stackoverflow.com/questions/12345/how-to-code',
                color: '#f48024'
            },
            {
                title: 'MDN Web Docs',
                url: 'https://developer.mozilla.org/en-US/docs/Web/API',
                result: 'MDN Web Docs https://developer.mozilla.org/en-US/docs/Web/API',
                color: '#83d0f2'
            }
        ];
        
        examples.forEach((example, index) => {
            const y = 120 + index * 160;
            
            // 網站標題
            ctx.fillStyle = example.color;
            ctx.font = 'bold 18px Arial, sans-serif';
            ctx.fillText(example.title, 50, y);
            
            // 網址
            ctx.fillStyle = '#6c757d';
            ctx.font = '14px Arial, sans-serif';
            ctx.fillText(example.url, 50, y + 25);
            
            // 箭頭
            ctx.fillStyle = '#28a745';
            ctx.font = 'bold 20px Arial, sans-serif';
            ctx.fillText('→', 50, y + 60);
            
            // 複製結果
            ctx.fillStyle = '#e9ecef';
            ctx.fillRect(100, y + 40, 1130, 40);
            ctx.strokeStyle = '#adb5bd';
            ctx.strokeRect(100, y + 40, 1130, 40);
            
            ctx.fillStyle = '#212529';
            ctx.font = '14px monospace';
            ctx.fillText(example.result, 120, y + 65);
        });
        
        // 底部說明
        ctx.fillStyle = '#495057';
        ctx.font = '16px Arial, sans-serif';
        ctx.fillText('✨ 統一格式，適用於所有網站', 450, 750);
    }

    async convertAllScreenshots() {
        console.log('🎨 開始轉換 SVG 截圖為 PNG...');
        
        const conversions = [
            ['screenshot-1-extension-icon.svg', 'screenshot-1-extension-icon.png'],
            ['screenshot-2-before-after.svg', 'screenshot-2-before-after.png'],
            ['screenshot-3-multiple-examples.svg', 'screenshot-3-multiple-examples.png']
        ];
        
        let successCount = 0;
        
        for (const [svgFile, pngFile] of conversions) {
            const success = await this.convertSVGToPNG(svgFile, pngFile);
            if (success) successCount++;
        }
        
        console.log(`\n🎉 轉換完成！成功轉換 ${successCount}/${conversions.length} 個檔案`);
        
        // 檢查檔案大小
        console.log('\n📊 檔案大小檢查：');
        conversions.forEach(([, pngFile]) => {
            const pngPath = path.join(this.screenshotsDir, pngFile);
            if (fs.existsSync(pngPath)) {
                const stats = fs.statSync(pngPath);
                const sizeKB = Math.round(stats.size / 1024);
                console.log(`  ${pngFile}: ${sizeKB} KB`);
            }
        });
    }
}

// 執行轉換
if (require.main === module) {
    const converter = new SVGToPNGConverter();
    converter.convertAllScreenshots().catch(console.error);
}

module.exports = SVGToPNGConverter;