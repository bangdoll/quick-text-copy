/**
 * 為 Quick Text Copy 擴充功能生成圖示
 * 設計理念：結合文字和複製符號，容易識別
 */

// 生成不同尺寸的 SVG 圖示
function generateTextCopyIcon(size) {
  const iconSize = size;
  const strokeWidth = Math.max(1, size / 16);
  const fontSize = Math.max(8, size / 6);
  
  return `
<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#357ABD;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="copyGradient${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:#F0F8FF;stop-opacity:0.8" />
    </linearGradient>
  </defs>
  
  <!-- 背景圓形 -->
  <circle cx="${iconSize/2}" cy="${iconSize/2}" r="${iconSize/2 - strokeWidth}" 
          fill="url(#bgGradient${size})" stroke="#2C5282" stroke-width="${strokeWidth}"/>
  
  <!-- 文件/頁面圖示 (背景) -->
  <rect x="${iconSize * 0.15}" y="${iconSize * 0.2}" 
        width="${iconSize * 0.4}" height="${iconSize * 0.55}" 
        fill="url(#copyGradient${size})" stroke="#2C5282" stroke-width="${strokeWidth * 0.8}" 
        rx="${iconSize * 0.03}"/>
  
  <!-- 複製的文件 (前景) -->
  <rect x="${iconSize * 0.25}" y="${iconSize * 0.1}" 
        width="${iconSize * 0.4}" height="${iconSize * 0.55}" 
        fill="url(#copyGradient${size})" stroke="#2C5282" stroke-width="${strokeWidth * 0.8}" 
        rx="${iconSize * 0.03}"/>
  
  <!-- 文字線條 -->
  <line x1="${iconSize * 0.3}" y1="${iconSize * 0.25}" 
        x2="${iconSize * 0.55}" y2="${iconSize * 0.25}" 
        stroke="#4A90E2" stroke-width="${strokeWidth * 0.8}" stroke-linecap="round"/>
  <line x1="${iconSize * 0.3}" y1="${iconSize * 0.35}" 
        x2="${iconSize * 0.6}" y2="${iconSize * 0.35}" 
        stroke="#4A90E2" stroke-width="${strokeWidth * 0.8}" stroke-linecap="round"/>
  <line x1="${iconSize * 0.3}" y1="${iconSize * 0.45}" 
        x2="${iconSize * 0.5}" y2="${iconSize * 0.45}" 
        stroke="#4A90E2" stroke-width="${strokeWidth * 0.8}" stroke-linecap="round"/>
  
  <!-- 複製箭頭/指示器 -->
  <path d="M ${iconSize * 0.7} ${iconSize * 0.7} 
           L ${iconSize * 0.8} ${iconSize * 0.75} 
           L ${iconSize * 0.7} ${iconSize * 0.8} 
           Z" 
        fill="#FFFFFF" stroke="#2C5282" stroke-width="${strokeWidth * 0.6}"/>
  
  <!-- 小的 "T" 字母表示文字 -->
  <text x="${iconSize * 0.75}" y="${iconSize * 0.9}" 
        font-family="Arial, sans-serif" font-size="${fontSize}" 
        font-weight="bold" fill="#FFFFFF" text-anchor="middle">T</text>
</svg>`;
}

// 生成所有尺寸的圖示
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
  const svgContent = generateTextCopyIcon(size);
  
  // 建立 SVG 檔案
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);
  
  // 建立下載連結
  const downloadLink = document.createElement('a');
  downloadLink.href = svgUrl;
  downloadLink.download = `text-copy-icon${size}.svg`;
  downloadLink.textContent = `下載 ${size}x${size} SVG`;
  downloadLink.style.display = 'block';
  downloadLink.style.margin = '10px 0';
  document.body.appendChild(downloadLink);
  
  // 轉換為 PNG
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = size;
  canvas.height = size;
  
  const img = new Image();
  img.onload = function() {
    ctx.drawImage(img, 0, 0, size, size);
    
    // 轉換為 PNG 並下載
    canvas.toBlob(function(blob) {
      const pngUrl = URL.createObjectURL(blob);
      const pngLink = document.createElement('a');
      pngLink.href = pngUrl;
      pngLink.download = `icon${size}.png`;
      pngLink.textContent = `下載 ${size}x${size} PNG`;
      pngLink.style.display = 'block';
      pngLink.style.margin = '10px 0';
      pngLink.style.color = '#007bff';
      document.body.appendChild(pngLink);
    }, 'image/png');
  };
  
  img.src = svgUrl;
});

console.log('圖示生成完成！點擊連結下載對應的檔案。');