# Quick Text Copy - Chrome Extension

[![Version](https://img.shields.io/badge/version-1.0.5-blue.svg)](https://github.com/bangdoll/quick-text-copy)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-brightgreen.svg)](https://chrome.google.com/webstore)

> 🚀 一個功能強大的 Chrome 擴充功能，支援快速文字複製和簡體轉繁體功能

## ✨ 功能特色

### 📋 快速文字複製
- 一鍵複製當前頁面標題和網址
- 格式化輸出：`標題 網址`
- 支援快捷鍵操作
- 輕量化設計，不影響瀏覽體驗

### 🔄 OpenCC 簡體轉繁體 (v1.0.4 新功能)
- 🎯 使用 OpenCC WASM 引擎，轉換準確度高
- 🇹🇼 預設台灣繁體含慣用詞配置 (s2twp)
- 🧠 智慧轉換：自動檢測簡體字
- 📦 批量處理支援
- ⚡ 純前端實現，無需服務器

## 🚀 快速開始

### 安裝方式

#### 方式一：Chrome Web Store（推薦）
1. 前往 [Chrome Web Store](https://chrome.google.com/webstore)
2. 搜尋 "Quick Text Copy"
3. 點擊 "加到 Chrome"

#### 方式二：開發者模式安裝
1. 下載最新版本的 `quick-text-copy-clean.zip`
2. 解壓縮檔案
3. 開啟 Chrome 擴充功能頁面 (`chrome://extensions/`)
4. 開啟「開發者模式」
5. 點擊「載入未封裝項目」，選擇解壓後的資料夾

### 基本使用

#### 快速複製
1. 點擊瀏覽器工具列中的擴充功能圖示
2. 頁面標題和網址會自動複製到剪貼簿
3. 格式：`頁面標題 https://example.com`

#### 簡體轉繁體
```javascript
const OpenCCConverter = require('./opencc-converter');

// 使用預設配置（推薦）
const converter = new OpenCCConverter();

// 基本轉換
console.log(converter.convert('这个软件很好用'));
// 輸出: 這個軟體很好用

// 智慧轉換（只轉換包含簡體字的文字）
console.log(converter.smartConvert('这个需要转换'));
// 輸出: 這個需要轉換

console.log(converter.smartConvert('這個不需要轉換'));
// 輸出: 這個不需要轉換（不變）
```

## 🛠️ 開發

### 環境需求
- Node.js 14+
- npm 6+

### 安裝依賴
```bash
npm install
```

### 開發命令
```bash
# 建立擴充功能包
npm run build-clean

# 測試 OpenCC 功能
npm run test-opencc

# 驗證 OpenCC 功能
npm run verify-opencc

# 查看 OpenCC 使用示例
npm run demo-opencc

# 完整功能測試
npm run test
```

### 專案結構
```
quick-text-copy/
├── manifest.json           # Chrome 擴充功能配置
├── service-worker.js       # 背景服務
├── icons/                  # 擴充功能圖示
├── opencc-converter.js     # OpenCC 轉換器
├── test-opencc-converter.js # OpenCC 測試
├── demo-opencc-usage.js    # OpenCC 使用示例
└── docs/                   # 文檔
    ├── OPENCC_README.md
    ├── QUICK_START.md
    └── CHANGELOG.md
```

## 📊 OpenCC 轉換效果

| 簡體原文 | 基本繁體 (tw) | 台灣繁體 (twp) 推薦 |
|----------|---------------|-------------------|
| 软件 | 軟件 | **軟體** |
| 计算机 | 計算機 | 計算機 |
| 程序 | 程序 | **程式** |
| 网络 | 網絡 | **網路** |
| 数据 | 數據 | **資料** |
| 用户 | 用戶 | **使用者** |

## 🧪 測試

### 執行測試
```bash
# OpenCC 功能測試
npm run test-opencc

# 完整功能驗證
npm run verify-opencc

# 擴充功能測試
npm run test
```

### 測試覆蓋
- ✅ 基本轉換功能
- ✅ 智慧轉換功能
- ✅ 批量轉換功能
- ✅ 簡體字檢測
- ✅ 錯誤處理機制
- ✅ Chrome 擴充功能功能

## 📚 文檔

- [OpenCC 完整文檔](./OPENCC_README.md)
- [快速開始指南](./QUICK_START.md)
- [更新日誌](./CHANGELOG.md)
- [發布說明](./RELEASE_NOTES_v1.0.4.md)

## 🔄 版本歷史

### v1.0.4 (2025-01-11)
- 🔧 OpenCC 功能完全修復
- 🎯 測試通過率提升到 100%
- 🇹🇼 預設使用台灣繁體含慣用詞配置
- 📚 完整文檔和驗證工具

### v1.0.3 (2025-01-09)
- ✨ 新增 OpenCC 簡體轉繁體功能
- 🧠 智慧轉換和批量處理
- 📦 支援多種轉換配置

### v1.0.2 及更早版本
- 📋 基本快速文字複製功能
- 🔧 Chrome 擴充功能核心功能

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

### 開發流程
1. Fork 這個專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

### 程式碼規範
- 使用 ESLint 進行程式碼檢查
- 遵循現有的程式碼風格
- 為新功能添加測試
- 更新相關文檔

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- [OpenCC](https://github.com/BYVoid/OpenCC) - 優秀的中文轉換工具
- [opencc-js](https://github.com/nk2028/opencc-js) - JavaScript/WASM 實現
- Chrome Extensions API 文檔和社群

## 📞 聯絡

- 專案連結: [https://github.com/bangdoll/quick-text-copy](https://github.com/bangdoll/quick-text-copy)
- 問題回報: [Issues](https://github.com/bangdoll/quick-text-copy/issues)

---

⭐ 如果這個專案對你有幫助，請給個 Star！