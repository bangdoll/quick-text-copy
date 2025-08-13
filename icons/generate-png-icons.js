/**
 * 使用 Node.js 生成 Quick Text Copy 圖示
 * 需要安裝: npm install canvas
 */

const fs = require('fs');
const path = require('path');

// 如果沒有 canvas 模組，提供替代方案
let Canvas;
try {
  Canvas = require('canvas');
} catch (error) {
  console.log('Canvas 模組未安裝，將生成 SVG 檔案');
  Canvas = null;
}

function generateTextCopyIconSVG(size) {
  const iconSize = size;
  const strokeWidth = Math.max(1, size / 16);
  const fontSize = Math.max(8, size / 6);
  
  return `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#357ABD;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="copyGradient${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.95" />
      <stop offset="100%" style="stop-color:#F0F8FF;stop-opacity:0.9" />
    </linearGradient>
  </defs>
  
  <!-- 背景圓形 -->
  <circle cx="${iconSize/2}" cy="${iconSize/2}" r="${iconSize/2 - strokeWidth}" 
          fill="url(#bgGradient${size})" stroke="#2C5282" stroke-width="${strokeWidth}"/>
  
  <!-- 文件/頁面圖示 (背景) -->
  <rect x="${iconSize * 0.15}" y="${iconSize * 0.25}" 
        width="${iconSize * 0.35}" height="${iconSize * 0.5}" 
        fill="url(#copyGradient${size})" stroke="#2C5282" stroke-width="${strokeWidth * 0.8}" 
        rx="${iconSize * 0.03}"/>
  
  <!-- 複製的文件 (前景) -->
  <rect x="${iconSize * 0.25}" y="${iconSize * 0.15}" 
        width="${iconSize * 0.35}" height="${iconSize * 0.5}" 
        fill="url(#copyGradient${size})" stroke="#2C5282" stroke-width="${strokeWidth * 0.8}" 
        rx="${iconSize * 0.03}"/>
  
  <!-- 文字線條 -->
  <line x1="${iconSize * 0.3}" y1="${iconSize * 0.28}" 
        x2="${iconSize * 0.52}" y2="${iconSize * 0.28}" 
        stroke="#4A90E2" stroke-width="${strokeWidth * 0.8}" stroke-linecap="round"/>
  <line x1="${iconSize * 0.3}" y1="${iconSize * 0.38}" 
        x2="${iconSize * 0.55}" y2="${iconSize * 0.38}" 
        stroke="#4A90E2" stroke-width="${strokeWidth * 0.8}" stroke-linecap="round"/>
  <line x1="${iconSize * 0.3}" y1="${iconSize * 0.48}" 
        x2="${iconSize * 0.5}" y2="${iconSize * 0.48}" 
        stroke="#4A90E2" stroke-width="${strokeWidth * 0.8}" stroke-linecap="round"/>
  
  <!-- 複製箭頭/指示器 -->
  <path d="M ${iconSize * 0.68} ${iconSize * 0.72} 
           L ${iconSize * 0.78} ${iconSize * 0.77} 
           L ${iconSize * 0.68} ${iconSize * 0.82} 
           Z" 
        fill="#FFFFFF" stroke="#2C5282" stroke-width="${strokeWidth * 0.6}"/>
  
  <!-- 小的 "C" 字母表示複製 (Copy) -->
  <text x="${iconSize * 0.73}" y="${iconSize * 0.9}" 
        font-family="Arial, sans-serif" font-size="${fontSize}" 
        font-weight="bold" fill="#FFFFFF" text-anchor="middle">C</text>
</svg>`;
}

// 生成所有尺寸的圖示
const sizes = [16, 32, 48, 128];

console.log('🎨 開始生成 Quick Text Copy 圖示...');

sizes.forEach(size => {
  const svgContent = generateTextCopyIconSVG(size);
  
  // 儲存 SVG 檔案
  const svgPath = path.join(__dirname, `icon${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ 已生成 SVG: icon${size}.svg`);
  
  // 如果有 Canvas 模組，也生成 PNG
  if (Canvas) {
    try {
      const canvas = Canvas.createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // 使用 Canvas 的 loadImage 來載入 SVG
      const img = new Canvas.Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        
        // 儲存為 PNG
        const pngPath = path.join(__dirname, `icon${size}.png`);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(pngPath, buffer);
        console.log(`✅ 已生成 PNG: icon${size}.png`);
      };
      
      img.onerror = (err) => {
        console.log(`⚠️  PNG 生成失敗 (${size}x${size}):`, err.message);
      };
      
      // 設定 SVG 資料
      img.src = Buffer.from(svgContent);
      
    } catch (error) {
      console.log(`⚠️  PNG 生成失敗 (${size}x${size}):`, error.message);
    }
  }
});

// 生成簡化版本的 Base64 圖示（用於快速測試）
function generateBase64Icons() {
  const base64Content = `// Quick Text Copy 圖示 Base64 編碼
// 可以直接在 CSS 或 HTML 中使用

const iconBase64 = {
${sizes.map(size => {
  const svgContent = generateTextCopyIconSVG(size);
  const base64 = Buffer.from(svgContent).toString('base64');
  return `  icon${size}: 'data:image/svg+xml;base64,${base64}'`;
}).join(',\n')}
};

// 使用範例:
// <img src="\${iconBase64.icon32}" alt="Quick Text Copy" />

module.exports = iconBase64;
`;

  const base64Path = path.join(__dirname, 'icon-base64.js');
  fs.writeFileSync(base64Path, base64Content);
  console.log('✅ 已生成 Base64 圖示檔案: icon-base64.js');
}

generateBase64Icons();

console.log(`
🎉 圖示生成完成！

生成的檔案：
${sizes.map(size => `- icon${size}.svg`).join('\n')}
${Canvas ? sizes.map(size => `- icon${size}.png`).join('\n') : ''}
- icon-base64.js

${!Canvas ? `
📝 注意：要生成 PNG 檔案，請安裝 canvas 模組：
npm install canvas

或者使用瀏覽器版本的生成器：
開啟 icons/generate-text-copy-icons.html
` : ''}

🚀 現在您可以在 Chrome 擴充功能中使用這些圖示了！
`);