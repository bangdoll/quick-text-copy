# 🔄 OpenCC Chrome 擴充功能使用指南

## 📋 問題解決

如果你發現**簡體中文沒有轉換成繁體中文**，這裡提供完整的解決方案。

## 🎯 兩種 OpenCC 實作

### 1. Node.js 版本（用於開發和測試）
- **文件**: `opencc-converter.js`
- **用途**: 本地開發、測試、Node.js 環境
- **特色**: 使用完整的 OpenCC WASM 引擎
- **測試**: `npm run test-opencc`

### 2. 瀏覽器版本（用於 Chrome 擴充功能）
- **文件**: `opencc-browser.js`, `service-worker-with-opencc.js`
- **用途**: Chrome 擴充功能環境
- **特色**: 基於字典的轉換，適用於瀏覽器環境
- **測試**: 開啟 `test-opencc-browser.html`

## 🚀 使用 OpenCC 功能的 Chrome 擴充功能

### 安裝步驟

1. **下載擴充功能包**
   ```
   quick-text-copy-with-opencc.zip
   ```

2. **安裝到 Chrome**
   - 開啟 Chrome 瀏覽器
   - 前往 `chrome://extensions/`
   - 開啟「開發者模式」
   - 點擊「載入未封裝項目」
   - 選擇解壓後的 `extension-with-opencc` 資料夾

3. **驗證安裝**
   - 在瀏覽器工具列看到擴充功能圖示
   - 右鍵點擊頁面，看到「複製頁面資訊」和「複製頁面資訊（轉繁體）」選項

### 使用方式

#### 方式 1: 點擊擴充功能圖示
- 點擊瀏覽器工具列中的擴充功能圖示
- 頁面標題和網址會自動複製到剪貼簿
- **不會**自動轉換簡體中文

#### 方式 2: 使用右鍵選單（推薦）
- 在任何頁面右鍵點擊
- 選擇「複製頁面資訊（轉繁體）」
- 頁面標題和網址會複製到剪貼簿，**並自動轉換簡體中文為繁體中文**

### 轉換效果示例

```
原始標題: 这个软件很好用 - 计算机程序开发网站
轉換後: 這個軟體很好用 - 計算機程式開發網站

原始標題: 用户数据管理系统
轉換後: 使用者資料管理系統
```

## 🧪 測試 OpenCC 功能

### 1. 測試瀏覽器版本
開啟 `test-opencc-browser.html` 文件：
```bash
open test-opencc-browser.html
```

### 2. 測試 Node.js 版本
```bash
npm run test-opencc
npm run verify-opencc
```

### 3. 測試 Chrome 擴充功能
1. 安裝擴充功能
2. 前往任何包含簡體中文的網站
3. 右鍵選擇「複製頁面資訊（轉繁體）」
4. 貼上查看結果

## 🔧 故障排除

### 問題 1: 簡體中文沒有轉換
**原因**: 使用了錯誤的功能
**解決**: 使用右鍵選單的「複製頁面資訊（轉繁體）」選項

### 問題 2: 右鍵選單沒有出現
**原因**: 擴充功能權限不足
**解決**: 
1. 檢查 `manifest.json` 是否包含 `contextMenus` 權限
2. 重新載入擴充功能

### 問題 3: 轉換效果不理想
**原因**: 瀏覽器版本使用簡化字典
**解決**: 
1. 這是正常的，瀏覽器版本使用基於字典的轉換
2. 如需更準確的轉換，使用 Node.js 版本進行開發

### 問題 4: 擴充功能無法載入
**原因**: 文件結構或權限問題
**解決**:
1. 確認 `manifest.json` 格式正確
2. 確認所有必要文件都存在
3. 檢查 Chrome 開發者工具的錯誤訊息

## 📊 功能對比

| 功能 | Node.js 版本 | 瀏覽器版本 |
|------|-------------|------------|
| 轉換準確度 | 很高（OpenCC WASM） | 中等（字典） |
| 支援環境 | Node.js | Chrome 擴充功能 |
| 檔案大小 | 大（包含 WASM） | 小（純 JS） |
| 初始化速度 | 較慢 | 快 |
| 詞彙覆蓋 | 完整 | 常用詞彙 |

## 🎯 建議使用方式

### 開發和測試
使用 Node.js 版本：
```bash
npm run test-opencc
npm run demo-opencc
```

### 生產環境（Chrome 擴充功能）
使用瀏覽器版本：
- 安裝 `quick-text-copy-with-opencc.zip`
- 使用右鍵選單的轉繁體功能

### 自訂需求
如果需要更準確的轉換：
1. 修改 `opencc-browser.js` 中的 `conversionMap`
2. 添加更多詞彙對照
3. 重新打包擴充功能

## 📝 開發說明

### 添加新的轉換詞彙
編輯 `opencc-browser.js` 中的 `conversionMap`：
```javascript
const conversionMap = {
  // 添加新的轉換對照
  '新简体词': '新繁體詞',
  // ...
};
```

### 修改轉換邏輯
在 `service-worker-with-opencc.js` 中的 `TextProcessor.formatOutput` 方法中調整邏輯。

## 🎉 總結

現在你有兩個版本的 OpenCC 功能：

1. **完整版** (`opencc-converter.js`) - 用於開發和測試
2. **瀏覽器版** (`quick-text-copy-with-opencc.zip`) - 用於 Chrome 擴充功能

**要在 Chrome 擴充功能中使用簡體轉繁體功能，請使用右鍵選單的「複製頁面資訊（轉繁體）」選項！**

---

🔗 **相關文件**:
- [OpenCC 完整文檔](./OPENCC_README.md)
- [快速開始指南](./QUICK_START.md)
- [瀏覽器測試頁面](./test-opencc-browser.html)