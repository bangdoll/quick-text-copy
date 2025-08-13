# 更新日誌

## [1.0.5] - 2025-01-13

### 🔄 OpenCC Chrome 擴充功能整合
- ✅ **新增瀏覽器版 OpenCC**: 專為 Chrome 擴充功能設計的簡體轉繁體功能
- ✅ **右鍵選單支援**: 新增「複製頁面資訊（轉繁體）」選項
- ✅ **智慧轉換**: 自動檢測簡體字並轉換
- ✅ **通知系統**: 複製成功時顯示通知

### 🛠️ 技術改進
- 新增 `opencc-browser.js` - 瀏覽器環境專用轉換器
- 新增 `service-worker-with-opencc.js` - 整合 OpenCC 的服務工作者
- 新增 `contextMenus` 和 `notifications` 權限
- 創建 `quick-text-copy-with-opencc.zip` 完整功能包

### 📚 文檔更新
- 新增 `OPENCC_CHROME_EXTENSION_GUIDE.md` - Chrome 擴充功能使用指南
- 新增 `test-opencc-browser.html` - 瀏覽器版本測試頁面
- 更新使用說明和故障排除指南

### 🎯 轉換效果
- `软件` → `軟體`
- `计算机程序` → `計算機程式`
- `网络应用` → `網路應用`
- `数据处理` → `資料處理`
- `用户界面` → `使用者介面`

## [1.0.4] - 2025-01-11

### 🔧 重要修正
- ✅ **OpenCC 功能完全修復**
  - 修正預設配置為 `{ from: 'cn', to: 'twp' }`
  - 測試通過率從 33% 提升到 100%
  - 提供更符合台灣使用習慣的轉換結果

### 🧪 測試改進
- 修正所有測試案例的預期結果
- 新增 `verify-opencc-fix.js` 完整驗證腳本
- 新增 `npm run verify-opencc` 驗證命令

### 📚 文檔更新
- 新增 `OPENCC_FIX_REPORT.md` 詳細修正報告
- 更新 `OPENCC_README.md` 反映新配置
- 新增版本發布說明

### 🎯 轉換效果改善
- `软件` → `軟體`（而非 `軟件`）
- `程序` → `程式`（而非 `程序`）
- `网络` → `網路`（而非 `網絡`）
- `数据` → `資料`（而非 `數據`）
- `用户` → `使用者`（而非 `用戶`）

## [1.0.3] - 2025-01-09

### 新增功能
- ✅ **OpenCC-JS 簡體轉繁體轉換器**
  - 使用 OpenCC WASM 引擎實現高效準確的中文轉換
  - 支援多種轉換配置：cn→tw, cn→hk, cn→twp
  - 預設使用 s2tw 配置（簡體中文轉台灣繁體）

- ✅ **智慧轉換功能**
  - 自動檢測文字是否包含簡體中文字符
  - 只轉換需要轉換的文字，避免不必要的處理
  - 支援混合語言文字處理

- ✅ **批量處理支援**
  - 文字陣列批量轉換
  - 對象屬性批量轉換
  - 完整的錯誤處理機制

- ✅ **完整的測試套件**
  - 基本功能測試 (`test-opencc-converter.js`)
  - 使用示例和配置對比 (`demo-opencc-usage.js`)
  - 項目整合示例 (`opencc-integration-example.js`)

- ✅ **新增 npm scripts**
  - `npm run test-opencc` - 執行 OpenCC 測試
  - `npm run demo-opencc` - 查看使用示例
  - `npm run demo-opencc-integration` - 查看整合示例

### 技術改進
- 使用 OpenCC WASM 技術，無需服務器端支援
- 支援 twp 配置，提供更符合台灣使用習慣的轉換結果
- 完整的 JSDoc 文檔註釋
- 模組化設計，易於整合到現有項目

### 文件更新
- 新增 `OPENCC_README.md` - OpenCC 功能完整文檔
- 新增 `CHANGELOG.md` - 版本更新日誌
- 更新 `package.json` - 新增依賴和 scripts

### 依賴更新
- 新增 `opencc-js: ^1.0.5` - OpenCC JavaScript/WASM 實現

## [1.0.2] - 之前版本

### 現有功能
- 快速文字複製功能
- Chrome 擴充功能支援
- 多種文字處理工具
- 完整的測試和合規檢查系統

---

## 轉換效果對比

| 簡體原文 | tw 配置 | twp 配置（推薦） |
|----------|---------|------------------|
| 软件 | 軟件 | 軟體 |
| 计算机 | 計算機 | 計算機 |
| 程序 | 程序 | 程式 |
| 网络 | 網絡 | 網路 |
| 数据 | 數據 | 資料 |
| 用户 | 用戶 | 使用者 |

## 使用建議

1. **推薦使用 twp 配置**：`{ from: 'cn', to: 'twp' }`
2. **智慧轉換**：使用 `smartConvert()` 方法
3. **批量處理**：使用 `convertArray()` 或 `TextProcessor` 類別
4. **錯誤處理**：轉換器包含完整的錯誤處理機制