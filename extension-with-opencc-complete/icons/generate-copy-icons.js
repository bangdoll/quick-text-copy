/**
 * 生成文字複製擴充功能圖示
 * 設計概念：結合複製符號和文字符號，使用藍色主題
 */

// 建立 SVG 圖示
const createCopyTextIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#357ABD;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="paperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F8F9FA;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景圓形 -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="url(#bgGradient)" stroke="#2C5282" stroke-width="1"/>
  
  <!-- 後面的文件（被複製的） -->
  <rect x="${size * 0.2}" y="${size * 0.25}" width="${size * 0.45}" height="${size * 0.55}" 
        fill="url(#paperGradient)" stroke="#CBD5E0" stroke-width="1" rx="2"/>
  
  <!-- 前面的文件（複製到的） -->
  <rect x="${size * 0.35}" y="${size * 0.15}" width="${size * 0.45}" height="${size * 0.55}" 
        fill="url(#paperGradient)" stroke="#4A90E2" stroke-width="1.5" rx="2"/>
  
  <!-- 文字線條 -->
  <line x1="${size * 0.4}" y1="${size * 0.3}" x2="${size * 0.7}" y2="${size * 0.3}" 
        stroke="#4A90E2" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="${size * 0.4}" y1="${size * 0.4}" x2="${size * 0.65}" y2="${size * 0.4}" 
        stroke="#4A90E2" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="${size * 0.4}" y1="${size * 0.5}" x2="${size * 0.7}" y2="${size * 0.5}" 
        stroke="#4A90E2" stroke-width="1.5" stroke-linecap="round"/>
  
  <!-- 複製箭頭 -->
  <path d="M ${size * 0.15} ${size * 0.45} L ${size * 0.25} ${size * 0.4} L ${size * 0.25} ${size * 0.5} Z" 
        fill="#FFFFFF" stroke="#2C5282" stroke-width="0.5"/>
</svg>`;
};

// 建立不同尺寸的 SVG
const sizes = [16, 32, 48, 128];
const svgIcons = {};

sizes.forEach(size => {
  svgIcons[size] = createCopyTextIcon(size);
});

console.log('SVG 圖示已生成');
console.log('請將以下 SVG 內容轉換為 PNG 檔案：');

sizes.forEach(size => {
  console.log(`\n=== ${size}x${size} SVG ===`);
  console.log(svgIcons[size]);
});

// 如果在 Node.js 環境中，可以使用以下程式碼將 SVG 轉換為 PNG
if (typeof require !== 'undefined') {
  try {
    const fs = require('fs');
    
    // 儲存 SVG 檔案
    sizes.forEach(size => {
      fs.writeFileSync(`icons/icon${size}.svg`, svgIcons[size]);
    });
    
    console.log('\nSVG 檔案已儲存到 icons/ 資料夾');
    console.log('請使用線上工具或圖像編輯軟體將 SVG 轉換為 PNG');
    
  } catch (error) {
    console.log('無法儲存檔案，請手動建立');
  }
}