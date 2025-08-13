# 截圖製作指南

## 截圖要求

根據 Chrome Web Store 的要求，我們需要準備以下截圖：

### 主要截圖 (必需)
- **尺寸**: 1280x800 或 640x400 像素
- **格式**: PNG 或 JPEG
- **數量**: 至少 1 張，建議 3-5 張
- **內容**: 展示擴充功能的核心功能

## 建議的截圖內容

### 截圖 1: 擴充功能圖示位置
**檔名**: `screenshot-1-extension-icon.png`
**內容描述**:
- 顯示 Chrome 瀏覽器工具列
- 突出顯示 Quick Text Copy 的圖示位置
- 可以用紅色圓圈或箭頭標示圖示
- 背景可以是一個常見的網站（如 Google 首頁）

### 截圖 2: 使用前後對比
**檔名**: `screenshot-2-before-after.png`
**內容描述**:
- 分割畫面顯示使用前後的效果
- 左側：顯示網頁（如 GitHub 首頁）
- 右側：顯示文字編輯器或記事本，貼上複製的內容
- 展示格式化後的「標題 網址」格式

### 截圖 3: 多種網站示例
**檔名**: `screenshot-3-multiple-examples.png`
**內容描述**:
- 展示在不同網站上的使用效果
- 可以是一個文字編輯器，顯示多行複製的結果
- 包含不同類型的網站（新聞、技術、教育等）

## 製作步驟

### 準備工作
1. 確保 Quick Text Copy 擴充功能已安裝並正常運作
2. 準備截圖工具（Chrome 內建截圖或第三方工具）
3. 選擇適當的測試網站

### 截圖製作流程

#### 截圖 1 製作步驟
1. 開啟 Chrome 瀏覽器
2. 前往 https://www.google.com
3. 確保 Quick Text Copy 圖示在工具列中可見
4. 使用截圖工具擷取瀏覽器視窗
5. 使用圖片編輯軟體添加紅色圓圈標示圖示位置
6. 儲存為 `screenshot-1-extension-icon.png`

#### 截圖 2 製作步驟
1. 開啟 GitHub 首頁 (https://github.com)
2. 點擊 Quick Text Copy 圖示
3. 開啟記事本或文字編輯器
4. 貼上複製的內容 (Ctrl+V)
5. 使用分割畫面或拼接方式製作對比圖
6. 儲存為 `screenshot-2-before-after.png`

#### 截圖 3 製作步驟
1. 依序訪問以下網站並複製：
   - https://github.com
   - https://stackoverflow.com
   - https://www.google.com
   - https://zh.wikipedia.org
2. 將所有複製的內容貼到一個文字編輯器中
3. 截圖顯示多行格式化結果
4. 儲存為 `screenshot-3-multiple-examples.png`

## 截圖品質要求

### 技術規格
- 解析度: 高清晰度 (建議 1280x800)
- 色彩: 真彩色，避免失真
- 壓縮: 適度壓縮，保持清晰度
- 檔案大小: 每張不超過 5MB

### 視覺要求
- 畫面清晰，文字可讀
- 色彩對比度適中
- 避免個人隱私資訊出現
- 保持專業和整潔的外觀

### 標註建議
- 使用紅色圓圈或箭頭指示重要元素
- 添加簡潔的文字說明
- 保持標註風格一致
- 避免過度裝飾

## 替代方案

如果無法製作實際截圖，可以考慮：

1. **模擬截圖**: 使用設計軟體製作模擬的瀏覽器介面
2. **示意圖**: 創建簡化的示意圖展示功能流程
3. **動畫 GIF**: 製作簡短的操作演示動畫（如果 Chrome Web Store 支援）

## 檔案命名規範

- `screenshot-1-extension-icon.png` - 擴充功能圖示位置
- `screenshot-2-before-after.png` - 使用前後對比
- `screenshot-3-multiple-examples.png` - 多種網站示例

所有截圖檔案應放置在 `chrome-store-listing/screenshots/` 目錄中。