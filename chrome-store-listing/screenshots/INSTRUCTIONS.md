# 截圖檔案說明

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
   ```bash
   # 使用 Inkscape
   inkscape --export-type=png --export-width=1280 --export-height=800 screenshot-1-extension-icon.svg
   
   # 使用 ImageMagick
   convert -size 1280x800 screenshot-1-extension-icon.svg screenshot-1-extension-icon.png
   ```

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
