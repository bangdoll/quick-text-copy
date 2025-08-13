# 🚀 Chrome 應用程式商店更新快速指南

## 📋 更新步驟總覽

### 1️⃣ 準備更新
```bash
npm run update-prepare
```
這個命令會：
- ✅ 檢查版本一致性
- ✅ 驗證 manifest.json
- ✅ 確認套件已建置
- ✅ 執行所有測試
- ✅ 生成更新說明

### 2️⃣ 前往開發者控制台
🔗 **網址**: https://chrome.google.com/webstore/devconsole

### 3️⃣ 上傳新版本
1. 找到 "Quick Text Copy" 擴充功能
2. 點擊「套件」標籤
3. 點擊「上傳新套件」
4. 選擇 `quick-text-copy-extension.zip`

### 4️⃣ 更新版本說明
複製以下內容到版本說明欄位：

```
版本 1.0.1 更新內容：

🆕 新功能：
• 新增簡體中文轉繁體中文自動轉換功能
• 智慧檢測簡體中文內容並自動轉換
• 支援科技詞彙和日常用語轉換

🔧 改進：
• 優化程式碼結構和效能
• 增強錯誤處理機制
• 改善使用者體驗

📋 技術細節：
• 使用核心字典進行精確轉換
• 保持原有格式和標點符號
• 不影響繁體中文和其他語言內容
```

### 5️⃣ 提交審核
點擊「提交審核」按鈕

### 6️⃣ 監控審核狀態
```bash
# 記錄提交（替換實際提交ID）
npm run review-status submit "CWS_UPDATE_12345" "1.0.1"

# 啟動自動監控
npm run monitor-start

# 手動檢查狀態
npm run review-status check
```

## 📊 當前版本資訊

- **版本號**: 1.0.1
- **主要新功能**: 簡體中文轉繁體中文自動轉換
- **套件大小**: ~19 KB
- **預期審核時間**: 3-5 個工作天

## 🔧 實用命令

| 命令 | 功能 |
|------|------|
| `npm run update-prepare` | 完整更新準備流程 |
| `npm run update-check` | 執行更新前檢查 |
| `npm run update-version` | 顯示當前版本 |
| `npm run build` | 建置套件 |
| `npm run test-extension` | 測試擴充功能 |
| `npm run compliance-check` | 合規性檢查 |

## ⚠️ 注意事項

1. **版本號**: 確保 manifest.json 和 package.json 版本一致
2. **測試**: 提交前必須通過所有測試
3. **套件大小**: 保持在合理範圍內（目前 19 KB）
4. **隱私政策**: 確認隱私政策連結有效

## 🎯 審核重點

Chrome Web Store 會特別檢查：
- ✅ 新功能是否如描述般運作
- ✅ 權限使用是否合理
- ✅ 隱私政策是否準確
- ✅ 程式碼品質和安全性

## 📞 如需協助

如果遇到問題：
1. 檢查 `update-history.json` 記錄
2. 查看 `update-notes-*.json` 詳細說明
3. 使用內建監控工具追蹤狀態
4. 參考完整指南 `chrome-store-update-guide.md`

---

**🎉 祝您更新順利！**