#!/usr/bin/env node

/**
 * 生成 Chrome Web Store 提交用的示例截圖
 * 由於無法製作真實截圖，這個工具會創建示例圖片檔案
 */

const fs = require('fs');
const path = require('path');

class ScreenshotGenerator {
    constructor() {
        this.screenshotsDir = 'chrome-store-listing/screenshots';
        this.ensureScreenshotsDirectory();
    }

    ensureScreenshotsDirectory() {
        if (!fs.existsSync(this.screenshotsDir)) {
            fs.mkdirSync(this.screenshotsDir, { recursive: true });
        }
    }

    /**
     * 創建 SVG 格式的示例截圖
     */
    createSVGScreenshot(filename, content) {
        const svgPath = path.join(this.screenshotsDir, filename.replace('.png', '.svg'));
        fs.writeFileSync(svgPath, content, 'utf8');
        console.log(`✅ 已創建示例截圖: ${svgPath}`);
        return svgPath;
    }

    /**
     * 生成截圖 1: 擴充功能圖示位置
     */
    generateScreenshot1() {
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1280" height="800" xmlns="http://www.w3.org/2000/svg">
  <!-- 瀏覽器視窗背景 -->
  <rect width="1280" height="800" fill="#f8f9fa"/>
  
  <!-- 瀏覽器標題列 -->
  <rect width="1280" height="80" fill="#e9ecef"/>
  <text x="20" y="50" font-family="Arial, sans-serif" font-size="16" fill="#495057">Chrome 瀏覽器</text>
  
  <!-- 網址列 -->
  <rect x="20" y="90" width="1000" height="40" fill="#ffffff" stroke="#dee2e6" stroke-width="1" rx="20"/>
  <text x="40" y="115" font-family="Arial, sans-serif" font-size="14" fill="#6c757d">https://www.google.com</text>
  
  <!-- 工具列 -->
  <rect x="1030" y="90" width="230" height="40" fill="#ffffff" stroke="#dee2e6" stroke-width="1"/>
  
  <!-- 擴充功能圖示區域 -->
  <rect x="1180" y="95" width="30" height="30" fill="#007bff" rx="4"/>
  <text x="1190" y="115" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" font-weight="bold">QTC</text>
  
  <!-- 紅色圓圈標示 -->
  <circle cx="1195" cy="110" r="25" fill="none" stroke="#dc3545" stroke-width="3"/>
  
  <!-- 箭頭指示 -->
  <path d="M1150 110 L1170 110" stroke="#dc3545" stroke-width="3" marker-end="url(#arrowhead)"/>
  
  <!-- 箭頭標記定義 -->
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#dc3545"/>
    </marker>
  </defs>
  
  <!-- 說明文字 -->
  <text x="1050" y="80" font-family="Arial, sans-serif" font-size="14" fill="#dc3545" font-weight="bold">Quick Text Copy</text>
  <text x="1080" y="65" font-family="Arial, sans-serif" font-size="12" fill="#6c757d">點擊此圖示</text>
  
  <!-- 網頁內容區域 -->
  <rect x="20" y="140" width="1240" height="640" fill="#ffffff" stroke="#dee2e6" stroke-width="1"/>
  
  <!-- Google 首頁模擬 -->
  <text x="640" y="300" font-family="Arial, sans-serif" font-size="48" fill="#4285f4" text-anchor="middle" font-weight="bold">Google</text>
  
  <!-- 搜尋框 -->
  <rect x="440" y="320" width="400" height="50" fill="#ffffff" stroke="#dadce0" stroke-width="2" rx="25"/>
  
  <!-- 搜尋按鈕 -->
  <rect x="540" y="390" width="100" height="40" fill="#f8f9fa" stroke="#dadce0" stroke-width="1" rx="4"/>
  <text x="590" y="415" font-family="Arial, sans-serif" font-size="14" fill="#3c4043" text-anchor="middle">Google 搜尋</text>
  
  <rect x="660" y="390" width="100" height="40" fill="#f8f9fa" stroke="#dadce0" stroke-width="1" rx="4"/>
  <text x="710" y="415" font-family="Arial, sans-serif" font-size="14" fill="#3c4043" text-anchor="middle">好手氣</text>
  
  <!-- 標題 -->
  <text x="640" y="200" font-family="Arial, sans-serif" font-size="24" fill="#202124" text-anchor="middle" font-weight="bold">Quick Text Copy 擴充功能圖示位置</text>
  <text x="640" y="230" font-family="Arial, sans-serif" font-size="16" fill="#5f6368" text-anchor="middle">在 Chrome 工具列中找到並點擊 Quick Text Copy 圖示</text>
</svg>`;

        return this.createSVGScreenshot('screenshot-1-extension-icon.svg', svg);
    }

    /**
     * 生成截圖 2: 使用前後對比
     */
    generateScreenshot2() {
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1280" height="800" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="1280" height="800" fill="#f8f9fa"/>
  
  <!-- 標題 -->
  <text x="640" y="50" font-family="Arial, sans-serif" font-size="24" fill="#202124" text-anchor="middle" font-weight="bold">Quick Text Copy 使用前後對比</text>
  
  <!-- 分割線 -->
  <line x1="640" y1="80" x2="640" y2="780" stroke="#dee2e6" stroke-width="2"/>
  
  <!-- 左側：使用前 -->
  <text x="320" y="100" font-family="Arial, sans-serif" font-size="18" fill="#495057" text-anchor="middle" font-weight="bold">使用前</text>
  
  <!-- 瀏覽器視窗 (左側) -->
  <rect x="20" y="120" width="600" height="400" fill="#ffffff" stroke="#dee2e6" stroke-width="2" rx="8"/>
  
  <!-- 網址列 (左側) -->
  <rect x="30" y="130" width="580" height="30" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
  <text x="40" y="150" font-family="Arial, sans-serif" font-size="12" fill="#6c757d">https://github.com/example/project</text>
  
  <!-- GitHub 頁面內容 (左側) -->
  <text x="40" y="190" font-family="Arial, sans-serif" font-size="16" fill="#24292f" font-weight="bold">example/project</text>
  <text x="40" y="220" font-family="Arial, sans-serif" font-size="14" fill="#656d76">一個很棒的開源專案</text>
  
  <!-- 步驟說明 (左側) -->
  <text x="40" y="260" font-family="Arial, sans-serif" font-size="12" fill="#dc3545">1. 手動選取標題</text>
  <text x="40" y="280" font-family="Arial, sans-serif" font-size="12" fill="#dc3545">2. 複製標題 (Ctrl+C)</text>
  <text x="40" y="300" font-family="Arial, sans-serif" font-size="12" fill="#dc3545">3. 複製網址</text>
  <text x="40" y="320" font-family="Arial, sans-serif" font-size="12" fill="#dc3545">4. 手動組合格式</text>
  
  <!-- 時間標示 (左側) -->
  <rect x="250" y="450" width="120" height="30" fill="#ffc107" rx="15"/>
  <text x="310" y="470" font-family="Arial, sans-serif" font-size="14" fill="#212529" text-anchor="middle" font-weight="bold">耗時 30-60 秒</text>
  
  <!-- 右側：使用後 -->
  <text x="960" y="100" font-family="Arial, sans-serif" font-size="18" fill="#495057" text-anchor="middle" font-weight="bold">使用後</text>
  
  <!-- 瀏覽器視窗 (右側) -->
  <rect x="660" y="120" width="600" height="200" fill="#ffffff" stroke="#dee2e6" stroke-width="2" rx="8"/>
  
  <!-- 網址列 (右側) -->
  <rect x="670" y="130" width="580" height="30" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
  <text x="680" y="150" font-family="Arial, sans-serif" font-size="12" fill="#6c757d">https://github.com/example/project</text>
  
  <!-- GitHub 頁面內容 (右側) -->
  <text x="680" y="190" font-family="Arial, sans-serif" font-size="16" fill="#24292f" font-weight="bold">example/project</text>
  <text x="680" y="220" font-family="Arial, sans-serif" font-size="14" fill="#656d76">一個很棒的開源專案</text>
  
  <!-- 擴充功能圖示點擊 -->
  <rect x="1200" y="170" width="30" height="30" fill="#007bff" rx="4"/>
  <text x="1210" y="190" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" font-weight="bold">QTC</text>
  <circle cx="1215" cy="185" r="20" fill="none" stroke="#28a745" stroke-width="3"/>
  <text x="1215" y="240" font-family="Arial, sans-serif" font-size="12" fill="#28a745" text-anchor="middle" font-weight="bold">點擊一次</text>
  
  <!-- 文字編輯器視窗 (右側) -->
  <rect x="660" y="340" width="600" height="180" fill="#2d3748" stroke="#4a5568" stroke-width="2" rx="8"/>
  <text x="670" y="360" font-family="Arial, sans-serif" font-size="12" fill="#a0aec0">記事本 - 已貼上內容</text>
  
  <!-- 複製的內容 -->
  <text x="680" y="390" font-family="Consolas, monospace" font-size="14" fill="#e2e8f0">example/project https://github.com/example/project</text>
  
  <!-- 成功標示 -->
  <rect x="680" y="420" width="80" height="25" fill="#28a745" rx="12"/>
  <text x="720" y="437" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" text-anchor="middle" font-weight="bold">已複製</text>
  
  <!-- 時間標示 (右側) -->
  <rect x="890" y="450" width="120" height="30" fill="#28a745" rx="15"/>
  <text x="950" y="470" font-family="Arial, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="bold">耗時 1-2 秒</text>
  
  <!-- 箭頭 -->
  <path d="M580 300 L700 300" stroke="#007bff" stroke-width="4" marker-end="url(#arrowhead2)"/>
  
  <!-- 箭頭標記定義 -->
  <defs>
    <marker id="arrowhead2" markerWidth="15" markerHeight="10" refX="14" refY="5" orient="auto">
      <polygon points="0 0, 15 5, 0 10" fill="#007bff"/>
    </marker>
  </defs>
  
  <!-- 效率提升標示 -->
  <text x="640" y="550" font-family="Arial, sans-serif" font-size="20" fill="#28a745" text-anchor="middle" font-weight="bold">效率提升 95%</text>
  <text x="640" y="580" font-family="Arial, sans-serif" font-size="16" fill="#6c757d" text-anchor="middle">從繁瑣的多步驟操作變成一鍵完成</text>
</svg>`;

        return this.createSVGScreenshot('screenshot-2-before-after.svg', svg);
    }

    /**
     * 生成截圖 3: 多種網站示例
     */
    generateScreenshot3() {
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1280" height="800" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="1280" height="800" fill="#f8f9fa"/>
  
  <!-- 標題 -->
  <text x="640" y="50" font-family="Arial, sans-serif" font-size="24" fill="#202124" text-anchor="middle" font-weight="bold">Quick Text Copy 多種網站使用示例</text>
  <text x="640" y="80" font-family="Arial, sans-serif" font-size="16" fill="#6c757d" text-anchor="middle">在不同類型的網站上都能完美運作，格式統一</text>
  
  <!-- 文字編輯器視窗 -->
  <rect x="40" y="120" width="1200" height="640" fill="#2d3748" stroke="#4a5568" stroke-width="2" rx="8"/>
  
  <!-- 編輯器標題列 -->
  <rect x="40" y="120" width="1200" height="40" fill="#4a5568" rx="8 8 0 0"/>
  <text x="60" y="145" font-family="Arial, sans-serif" font-size="14" fill="#e2e8f0">記事本 - Quick Text Copy 收集的網頁資料</text>
  
  <!-- 編輯器內容區域 -->
  <rect x="60" y="180" width="1160" height="560" fill="#1a202c"/>
  
  <!-- 複製的內容示例 -->
  <text x="80" y="210" font-family="Arial, sans-serif" font-size="14" fill="#a0aec0">// 使用 Quick Text Copy 一鍵收集的網頁資料：</text>
  
  <!-- GitHub 示例 -->
  <text x="80" y="250" font-family="Consolas, monospace" font-size="13" fill="#68d391">1. GitHub 開源專案：</text>
  <text x="80" y="270" font-family="Consolas, monospace" font-size="13" fill="#e2e8f0">   microsoft/vscode https://github.com/microsoft/vscode</text>
  
  <!-- Stack Overflow 示例 -->
  <text x="80" y="310" font-family="Consolas, monospace" font-size="13" fill="#68d391">2. Stack Overflow 問答：</text>
  <text x="80" y="330" font-family="Consolas, monospace" font-size="13" fill="#e2e8f0">   How to use async/await in JavaScript https://stackoverflow.com/questions/...</text>
  
  <!-- 維基百科示例 -->
  <text x="80" y="370" font-family="Consolas, monospace" font-size="13" fill="#68d391">3. 維基百科條目：</text>
  <text x="80" y="390" font-family="Consolas, monospace" font-size="13" fill="#e2e8f0">   人工智慧 - 維基百科 https://zh.wikipedia.org/wiki/人工智慧</text>
  
  <!-- 新聞網站示例 -->
  <text x="80" y="430" font-family="Consolas, monospace" font-size="13" fill="#68d391">4. 新聞文章：</text>
  <text x="80" y="450" font-family="Consolas, monospace" font-size="13" fill="#e2e8f0">   科技新聞：AI 發展趨勢分析 https://news.example.com/ai-trends</text>
  
  <!-- 技術文件示例 -->
  <text x="80" y="490" font-family="Consolas, monospace" font-size="13" fill="#68d391">5. 技術文件：</text>
  <text x="80" y="510" font-family="Consolas, monospace" font-size="13" fill="#e2e8f0">   React 官方文件 - 快速開始 https://react.dev/learn</text>
  
  <!-- 部落格示例 -->
  <text x="80" y="550" font-family="Consolas, monospace" font-size="13" fill="#68d391">6. 技術部落格：</text>
  <text x="80" y="570" font-family="Consolas, monospace" font-size="13" fill="#e2e8f0">   JavaScript 最佳實踐指南 https://blog.example.com/js-best-practices</text>
  
  <!-- 學術論文示例 -->
  <text x="80" y="610" font-family="Consolas, monospace" font-size="13" fill="#68d391">7. 學術資源：</text>
  <text x="80" y="630" font-family="Consolas, monospace" font-size="13" fill="#e2e8f0">   機器學習基礎理論 https://arxiv.org/abs/example</text>
  
  <!-- 統計資訊 -->
  <rect x="900" y="650" width="300" height="80" fill="#4a5568" rx="8"/>
  <text x="1050" y="675" font-family="Arial, sans-serif" font-size="14" fill="#e2e8f0" text-anchor="middle" font-weight="bold">收集統計</text>
  <text x="920" y="700" font-family="Arial, sans-serif" font-size="12" fill="#a0aec0">• 7 個不同類型網站</text>
  <text x="920" y="720" font-family="Arial, sans-serif" font-size="12" fill="#a0aec0">• 格式完全統一</text>
  
  <!-- 特色標籤 -->
  <rect x="80" y="670" width="100" height="25" fill="#007bff" rx="12"/>
  <text x="130" y="687" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" text-anchor="middle" font-weight="bold">格式統一</text>
  
  <rect x="200" y="670" width="100" height="25" fill="#28a745" rx="12"/>
  <text x="250" y="687" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" text-anchor="middle" font-weight="bold">一鍵複製</text>
  
  <rect x="320" y="670" width="100" height="25" fill="#6f42c1" rx="12"/>
  <text x="370" y="687" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" text-anchor="middle" font-weight="bold">廣泛相容</text>
</svg>`;

        return this.createSVGScreenshot('screenshot-3-multiple-examples.svg', svg);
    }

    /**
     * 創建截圖說明檔案
     */
    createScreenshotInstructions() {
        const instructions = `# 截圖檔案說明

## 已生成的示例截圖

本工具已生成以下 SVG 格式的示例截圖：

1. **screenshot-1-extension-icon.svg** - 擴充功能圖示位置
   - 展示 Quick Text Copy 圖示在 Chrome 工具列中的位置
   - 使用紅色圓圈和箭頭標示圖示位置
   - 背景為 Google 首頁

2. **screenshot-2-before-after.svg** - 使用前後對比
   - 左側展示傳統的手動複製流程（耗時 30-60 秒）
   - 右側展示使用 Quick Text Copy 的一鍵操作（耗時 1-2 秒）
   - 突出顯示效率提升 95%

3. **screenshot-3-multiple-examples.svg** - 多種網站示例
   - 展示在文字編輯器中收集的多個網站資料
   - 包含 GitHub、Stack Overflow、維基百科等不同類型網站
   - 展示統一的「標題 網址」格式

## 轉換為 PNG 格式

Chrome Web Store 需要 PNG 或 JPEG 格式的截圖。您可以：

1. **使用線上轉換工具**：
   - 將 SVG 檔案上傳到線上 SVG 轉 PNG 工具
   - 設定輸出尺寸為 1280x800 像素
   - 下載 PNG 檔案並重新命名

2. **使用設計軟體**：
   - 在 Figma、Canva 或 Adobe Illustrator 中開啟 SVG
   - 匯出為 PNG 格式，尺寸 1280x800

3. **使用命令列工具**（如果已安裝）：
   \`\`\`bash
   # 使用 Inkscape
   inkscape --export-type=png --export-width=1280 --export-height=800 screenshot-1-extension-icon.svg
   
   # 使用 ImageMagick
   convert -size 1280x800 screenshot-1-extension-icon.svg screenshot-1-extension-icon.png
   \`\`\`

## 截圖要求確認

✅ **尺寸**: 1280x800 像素
✅ **格式**: SVG (需轉換為 PNG)
✅ **內容**: 展示核心功能和使用方式
✅ **品質**: 高清晰度，文字可讀
✅ **數量**: 3 張截圖

## 使用建議

這些示例截圖展示了 Quick Text Copy 的核心功能和價值：

1. **圖示位置** - 幫助使用者找到擴充功能
2. **效率對比** - 突出顯示時間節省和便利性
3. **廣泛適用** - 展示在不同網站上的一致表現

您可以直接使用這些示例，或根據實際需求進行調整。
`;

        const instructionsPath = path.join(this.screenshotsDir, 'INSTRUCTIONS.md');
        fs.writeFileSync(instructionsPath, instructions, 'utf8');
        console.log(`✅ 已創建截圖說明檔案: ${instructionsPath}`);
    }

    /**
     * 生成所有示例截圖
     */
    generateAllScreenshots() {
        console.log('🎨 開始生成示例截圖...\n');

        this.generateScreenshot1();
        this.generateScreenshot2();
        this.generateScreenshot3();
        this.createScreenshotInstructions();

        console.log('\n🎉 所有示例截圖已生成完成！');
        console.log('\n📋 接下來的步驟：');
        console.log('1. 將 SVG 檔案轉換為 PNG 格式 (1280x800 像素)');
        console.log('2. 檢查截圖品質和清晰度');
        console.log('3. 如需要，可以根據實際情況調整截圖內容');
        console.log('4. 將最終的 PNG 檔案放置在 screenshots 目錄中');
    }
}

// 主程式執行
if (require.main === module) {
    const generator = new ScreenshotGenerator();
    generator.generateAllScreenshots();
}

module.exports = ScreenshotGenerator;