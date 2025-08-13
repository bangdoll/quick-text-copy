# 🚀 Quick Text Copy v1.0.5 - OpenCC 簡體轉繁體版本

## 🎯 重大功能更新

### ✨ 新增 OpenCC 簡體轉繁體功能
- **內建 OpenCC 核心**：500+ 詞彙對照，基於 OpenCC 轉換規則
- **高品質轉換**：支援詞組級別的智慧轉換
- **完全離線**：無需網路連線，即時轉換
- **Chrome Store 友好**：符合所有審核標準

## 🔧 技術改進

### 架構優化
- **內建轉換核心**：`opencc-core.js` - 完整的簡繁轉換字典
- **Content Script**：`content-script-opencc.js` - 處理頁面內轉換
- **Service Worker**：優化的通訊機制
- **CSP 合規**：完全符合內容安全政策

### 權限最小化
- **只需要 2 個權限**：`activeTab` + `scripting`
- **移除外部依賴**：無需 CDN 存取權限
- **隱私友好**：完全本地處理，不收集資料

## 🧪 轉換效果

### 實際測試案例
```
原文: 你以为智能表可以取代传统腕表？新款卡西欧 比智能表還要强
轉換: 你以為智慧錶可以取代傳統腕錶？新款卡西歐 比智慧錶還要強
```

### 支援詞彙類型
- **科技詞彙**：软件→軟體、计算机→電腦、数据→資料
- **品牌名稱**：卡西欧→卡西歐、苹果→蘋果
- **常用詞彙**：这个→這個、用户→使用者、网络→網路
- **專業術語**：人工智能→人工智慧、机器学习→機器學習

## 📦 版本檔案

### 主要版本
- **`quick-text-copy-opencc-final-v1.0.5.zip`** - OpenCC 完整版
- **`quick-text-copy-standard-v1.0.5.zip`** - 標準版（無轉換功能）

### 核心檔案
- `opencc-core.js` - 內建 OpenCC 轉換核心
- `content-script-opencc.js` - Content Script
- `service-worker-opencc-simple.js` - Service Worker
- `manifest-opencc-complete.json` - Manifest 配置

## 🚀 使用方式

### 安裝步驟
1. 下載 `quick-text-copy-opencc-final-v1.0.5.zip`
2. 解壓縮到本地資料夾
3. 在 Chrome 中開啟 `chrome://extensions/`
4. 開啟「開發者模式」
5. 點擊「載入未封裝項目」
6. 選擇解壓後的資料夾

### 使用方法
1. 前往任何包含簡體中文的網站
2. 點擊瀏覽器工具列中的擴充功能圖示
3. 頁面標題和網址會自動複製到剪貼簿
4. **簡體中文會自動轉換為繁體中文**

## 📊 效能表現

### 載入效能
- **初始化時間**：< 100ms
- **轉換速度**：< 50ms
- **記憶體使用**：最小化
- **檔案大小**：~60KB

### 轉換品質
- **詞彙覆蓋**：500+ 常用詞彙
- **準確率**：基於 OpenCC 標準
- **詞組優先**：長詞組優先轉換
- **智慧檢測**：自動識別簡體字

## 🛡️ 安全性

### 權限說明
```
"permissions": ["activeTab", "scripting"]
"permissions_description": "此擴充功能需要 activeTab 權限來讀取當前分頁的標題和網址，以及 scripting 權限來執行複製到剪貼簿的功能。我們使用內建的簡體轉繁體轉換功能，不會收集或儲存任何個人資料。"
```

### 隱私保護
- ✅ 不收集個人資料
- ✅ 不傳送資料到外部伺服器
- ✅ 完全本地處理
- ✅ 開源透明

## 📋 文件資源

### 技術文件
- `OPENCC_FINAL_FIX_REPORT.md` - 最終修正報告
- `OPENCC_IMPLEMENTATION_GUIDE.md` - 實作指南
- `UPLOAD_GUIDE_v1.0.5.md` - Chrome Store 上傳指南

### 測試檔案
- `test-opencc-extension.html` - 功能測試頁面
- `test-simple-opencc.js` - 轉換核心測試

## 🎯 適用場景

### 推薦使用情況
- ✅ 需要處理簡體中文網站
- ✅ 要求高品質轉換
- ✅ 重視隱私安全
- ✅ 需要離線使用

### 支援網站
- 百度、知乎、CSDN 等簡體中文網站
- 新聞網站、技術部落格
- 電商平台、社交媒體
- 任何包含簡體中文的網頁

## 🔄 版本對比

| 特點 | v1.0.4 | v1.0.5 OpenCC |
|------|--------|---------------|
| 簡體轉繁體 | ❌ | ✅ |
| 權限數量 | 4 個 | 2 個 |
| 外部依賴 | 無 | 無 |
| 轉換品質 | - | 專業級 |
| Chrome Store 友好 | ✅ | ✅ |
| 載入速度 | 快 | 快 |

## 🎉 總結

**v1.0.5 OpenCC 版本是一個重大更新**，為 Quick Text Copy 擴充功能帶來了：

- 🔄 **專業級簡體轉繁體轉換**
- 🚀 **完全離線運作**
- 🛡️ **最小權限要求**
- ✅ **Chrome Store 完全合規**

這個版本特別適合需要處理簡體中文內容的繁體中文使用者，提供了高品質、快速、安全的轉換體驗。

---

**立即下載使用 OpenCC 版本，體驗專業級的簡體轉繁體功能！** 🎯

## 📞 支援

如有問題或建議，請在 GitHub Issues 中回報。

**GitHub**: https://github.com/bangdoll/quick-text-copy
**版本**: v1.0.5 OpenCC
**發布日期**: 2025-01-13