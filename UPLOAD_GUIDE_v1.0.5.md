# 📦 Quick Text Copy v1.0.5 上傳指南

## ✅ 版本更新完成

版本號碼已成功更新為 **1.0.5**，所有相關文件已同步更新。

## 🎯 可用的上傳包

### 1. 標準版本（推薦上傳到 Chrome Web Store）
- **檔案**: `quick-text-copy-clean.zip`
- **版本**: 1.0.5 ✅
- **大小**: 24 KB
- **功能**: 基本文字複製功能
- **適用**: Chrome Web Store 官方上架

### 2. 完整版本（包含 OpenCC 簡體轉繁體）
- **檔案**: `quick-text-copy-with-opencc-v1.0.5.zip`
- **版本**: 1.0.5 ✅
- **大小**: 約 80 KB
- **功能**: 文字複製 + 簡體轉繁體
- **適用**: 開發者模式安裝、企業部署

## 🚀 Chrome Web Store 上傳步驟

### 步驟 1: 選擇上傳檔案
**建議使用**: `quick-text-copy-clean.zip`
- 檔案較小，審核通過率較高
- 功能穩定，符合 Chrome Web Store 政策

### 步驟 2: 上傳到開發者控制台
1. 前往 [Chrome Web Store 開發者控制台](https://chrome.google.com/webstore/devconsole)
2. 選擇你的擴充功能項目
3. 點擊「上傳新套件」
4. 選擇 `quick-text-copy-clean.zip`
5. 確認版本顯示為 **1.0.5**

### 步驟 3: 填寫更新說明
```
版本 1.0.5 更新內容：

✨ 新功能：
- 改善文字複製穩定性
- 優化使用者體驗
- 增強錯誤處理機制

🔧 技術改進：
- 更新權限配置
- 優化服務工作者效能
- 改善通知系統

🐛 問題修正：
- 修正在某些網站上的複製問題
- 改善擴充功能載入速度
- 修正權限相關問題
```

## 🔍 版本驗證

### 檔案驗證
```bash
# 檢查標準版本
unzip -p quick-text-copy-clean.zip manifest.json | grep version
# 應顯示: "version": "1.0.5"

# 檢查完整版本  
unzip -p quick-text-copy-with-opencc-v1.0.5.zip extension-with-opencc/manifest.json | grep version
# 應顯示: "version": "1.0.5"
```

### 功能驗證
- ✅ 基本文字複製功能正常
- ✅ 權限配置正確
- ✅ 圖示文件完整
- ✅ 隱私政策文件存在
- ✅ manifest.json 格式正確

## 📋 上傳檢查清單

### 上傳前檢查
- [ ] 版本號碼為 1.0.5
- [ ] 選擇正確的 ZIP 檔案
- [ ] 檔案大小合理（< 50MB）
- [ ] manifest.json 在根目錄
- [ ] 所有必要檔案都存在

### 商店資訊更新
- [ ] 更新版本說明
- [ ] 檢查應用程式描述
- [ ] 確認截圖是最新的
- [ ] 驗證隱私政策連結

### 發布後檢查
- [ ] 版本號碼正確顯示
- [ ] 功能正常運作
- [ ] 沒有錯誤報告
- [ ] 用戶反饋正面

## 🎯 兩個版本的差異

| 功能 | 標準版 | 完整版 |
|------|--------|--------|
| 文字複製 | ✅ | ✅ |
| 簡體轉繁體 | ❌ | ✅ |
| 右鍵選單 | ❌ | ✅ |
| 通知系統 | ❌ | ✅ |
| 檔案大小 | 24 KB | 80 KB |
| Chrome Store | 推薦 | 可選 |

## 🔄 如果需要 OpenCC 功能

如果你想要上傳包含 OpenCC 功能的版本：

1. **使用**: `quick-text-copy-with-opencc-v1.0.5.zip`
2. **注意**: 檔案較大，可能需要更詳細的功能說明
3. **優勢**: 提供完整的簡體轉繁體功能
4. **使用方式**: 右鍵選單「複製頁面資訊（轉繁體）」

## 📞 問題排除

### 上傳失敗
- 檢查檔案格式是否為 ZIP
- 確認 manifest.json 在根目錄
- 驗證版本號碼格式正確

### 版本號碼錯誤
- 所有文件已更新為 1.0.5
- 如果仍顯示舊版本，重新下載 ZIP 檔案

### 功能異常
- 標準版本功能穩定
- 如需 OpenCC 功能，使用完整版本

## 🎉 準備完成！

**你現在可以上傳 `quick-text-copy-clean.zip` (v1.0.5) 到 Chrome Web Store！**

所有版本號碼已正確更新，檔案已準備就緒。

---

📦 **推薦上傳**: `quick-text-copy-clean.zip` (v1.0.5)  
🔄 **完整功能**: `quick-text-copy-with-opencc-v1.0.5.zip` (v1.0.5)