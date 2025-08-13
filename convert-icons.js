/**
 * 將 SVG 圖示轉換為 PNG 格式
 * 使用 Canvas API 進行轉換
 */

const fs = require('fs');
const path = require('path');

// 簡單的 SVG 到 PNG 轉換函數（使用 base64 編碼）
function createPNGFromSVG(svgContent, size) {
  // 建立一個簡單的 PNG 資料（實際上這需要更複雜的轉換）
  // 這裡我們建立一個基本的 PNG 檔案結構
  
  const canvas = `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <!-- 藍色圓形背景 -->
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="#4A90E2" stroke="#2C5282" stroke-width="2"/>
    
    <!-- 文件圖示 -->
    <rect x="${size * 0.25}" y="${size * 0.2}" width="${size * 0.3}" height="${size * 0.5}" 
          fill="white" stroke="#2C5282" stroke-width="1" rx="2"/>
    <rect x="${size * 0.45}" y="${size * 0.15}" width="${size * 0.3}" height="${size * 0.5}" 
          fill="white" stroke="#2C5282" stroke-width="1" rx="2"/>
    
    <!-- 文字線條 -->
    <line x1="${size * 0.5}" y1="${size * 0.3}" x2="${size * 0.7}" y2="${size * 0.3}" 
          stroke="#4A90E2" stroke-width="2" stroke-linecap="round"/>
    <line x1="${size * 0.5}" y1="${size * 0.4}" x2="${size * 0.65}" y2="${size * 0.4}" 
          stroke="#4A90E2" stroke-width="2" stroke-linecap="round"/>
    <line x1="${size * 0.5}" y1="${size * 0.5}" x2="${size * 0.7}" y2="${size * 0.5}" 
          stroke="#4A90E2" stroke-width="2" stroke-linecap="round"/>
    
    <!-- 複製箭頭 -->
    <path d="M ${size * 0.15} ${size * 0.45} L ${size * 0.25} ${size * 0.4} L ${size * 0.25} ${size * 0.5} Z" 
          fill="white" stroke="#2C5282" stroke-width="1"/>
  </svg>`;
  
  return canvas;
}

// 建立所有尺寸的圖示
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
  const svgContent = createPNGFromSVG('', size);
  
  // 將 SVG 內容寫入檔案
  fs.writeFileSync(`icons/icon${size}_simple.svg`, svgContent);
  
  console.log(`已建立 icon${size}_simple.svg`);
});

console.log('\n圖示檔案已建立完成！');
console.log('請使用以下方法之一將 SVG 轉換為 PNG：');
console.log('1. 線上工具：https://convertio.co/svg-png/');
console.log('2. 使用 Inkscape 或 GIMP 等軟體');
console.log('3. 使用 Node.js 套件如 sharp 或 puppeteer');

// 如果有 sharp 套件，可以使用以下程式碼
try {
  const sharp = require('sharp');
  
  sizes.forEach(async (size) => {
    try {
      const svgBuffer = Buffer.from(createPNGFromSVG('', size));
      await sharp(svgBuffer)
        .png()
        .resize(size, size)
        .toFile(`icons/icon${size}.png`);
      
      console.log(`已轉換 icon${size}.png`);
    } catch (error) {
      console.log(`轉換 icon${size}.png 失敗:`, error.message);
    }
  });
  
} catch (error) {
  console.log('\n未安裝 sharp 套件，請手動轉換 SVG 為 PNG');
  console.log('或執行: npm install sharp');
}