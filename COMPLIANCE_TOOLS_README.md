# Chrome Web Store 合規性檢查工具

這個工具集幫助確保 Quick Text Copy 擴充功能符合 Chrome Web Store 的政策要求，並能順利通過審核流程。

## 🛠️ 工具組件

### 1. 合規性檢查器 (`compliance-checker.js`)
主要的合規性檢查工具，包含以下檢查項目：

#### 權限檢查
- ✅ 驗證只請求必要權限（activeTab、scripting）
- ✅ 檢查權限說明是否完整
- ✅ 確保沒有不必要的權限請求

#### 隱私政策檢查
- ✅ 掃描是否有資料收集相關的 API
- ✅ 檢查網路請求和外部通訊
- ✅ 驗證不收集使用者資料的聲明

#### 內容安全政策檢查
- ✅ 檢查 CSP 設定
- ✅ 掃描不安全的程式碼模式
- ✅ 驗證 Manifest V3 合規性

#### 功能性檢查
- ✅ 驗證必要功能元件存在
- ✅ 檢查錯誤處理機制
- ✅ 確認 manifest.json 完整性

### 2. 功能測試器 (`test-extension.js`)
自動化功能測試工具，包含：

#### Manifest 驗證
- ✅ JSON 格式正確性
- ✅ 必要欄位完整性
- ✅ 權限設定正確性
- ✅ 圖示和 Service Worker 路徑

#### Service Worker 驗證
- ✅ 必要 API 使用檢查
- ✅ 事件監聽器設定
- ✅ 錯誤處理機制
- ✅ 程式碼安全性

#### 圖示檔案驗證
- ✅ 所有尺寸圖示存在（16px, 32px, 48px, 128px）
- ✅ 檔案有效性檢查
- ✅ 目錄結構正確性

#### 程式碼品質檢查
- ✅ 註解覆蓋率
- ✅ 現代 JavaScript 語法使用
- ✅ 程式碼結構評估

### 3. 合規性檢查執行器 (`run-compliance-check.js`)
整合所有檢查工具的主要執行器：
- 🔍 執行完整合規性檢查
- 🧪 執行功能性測試
- 📊 生成綜合報告
- 📄 儲存 JSON 和 Markdown 格式報告

### 4. 隱私政策聲明 (`privacy-policy.md`)
完整的隱私政策文件，包含：
- 📋 資料收集聲明（不收集任何資料）
- 🔒 權限使用說明
- 🛡️ 安全措施說明
- 📞 聯絡資訊

## 🚀 使用方法

### 快速開始
```bash
# 執行完整合規性檢查
npm run compliance-check

# 或直接執行
node run-compliance-check.js
```

### 個別檢查命令
```bash
# 只檢查權限
npm run check-permissions

# 只檢查隱私政策
npm run check-privacy

# 只檢查安全政策
npm run check-security

# 只檢查功能性
npm run check-functionality

# 只執行功能測試
npm run test
```

## 📊 報告輸出

### 控制台輸出
工具會在控制台顯示詳細的檢查過程和結果，包括：
- 🔍 各項檢查的進度
- ✅ 通過的檢查項目
- ❌ 需要修正的問題
- 💡 改進建議

### 檔案報告
每次執行會生成兩種格式的報告：

#### JSON 報告 (`chrome-store-compliance-report-[timestamp].json`)
```json
{
  "timestamp": "2025-07-31T02:29:16.135Z",
  "extension": "Quick Text Copy",
  "compliance": { ... },
  "functionality": { ... },
  "overall": {
    "passed": true,
    "score": 100,
    "readyForSubmission": true
  }
}
```

#### Markdown 報告 (`chrome-store-compliance-report-[timestamp].md`)
人類可讀的詳細報告，包含：
- 📋 基本資訊和評分
- 📊 各項檢查結果摘要
- 💡 下一步建議

## 🎯 評分標準

### 總體評分計算
- **合規性檢查**: 25% × 4 項 = 100%
- **功能性測試**: 25% × 4 項 = 100%
- **總體評分**: (合規性評分 + 功能性評分) ÷ 2

### 發佈準備標準
- ✅ 所有檢查項目都必須通過
- ✅ 總體評分達到 90% 以上
- ✅ 沒有任何 ❌ 標記的問題

## 🔧 常見問題修正

### 權限問題
```json
// manifest.json 中添加權限說明
"permissions_description": "說明權限用途..."
```

### 安全政策問題
```json
// manifest.json 中添加 CSP
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'"
}
```

### 隱私問題
- 移除不必要的網路請求
- 確保不收集使用者資料
- 更新隱私政策聲明

## 📝 最佳實務

### 開發流程
1. 🔄 定期執行合規性檢查
2. 🐛 及時修正發現的問題
3. 📊 確保評分保持在 90% 以上
4. 📋 發佈前執行完整檢查

### 程式碼品質
- 📝 保持充足的程式碼註解
- 🛡️ 使用現代 JavaScript 語法
- ⚠️ 實作完善的錯誤處理
- 🔒 遵循安全程式設計原則

### 檔案管理
- 📁 保持檔案結構整潔
- 🎨 確保所有圖示檔案存在
- 📋 定期更新 manifest.json
- 🔍 移除不必要的開發檔案

## 🚀 發佈準備檢查清單

在提交到 Chrome Web Store 之前，請確認：

- [ ] ✅ 執行 `npm run compliance-check` 並通過所有檢查
- [ ] 📊 總體評分達到 100%
- [ ] 🎯 顯示「發佈準備: 已就緒」
- [ ] 📄 檢查生成的報告無任何問題
- [ ] 🔍 確認隱私政策聲明正確
- [ ] 📦 準備好所有必要檔案

## 📞 支援

如果遇到問題或需要協助：
1. 📋 檢查生成的報告中的詳細說明
2. 🔍 參考 Chrome Web Store 開發者政策
3. 💡 查看報告中的建議事項
4. 🛠️ 根據錯誤訊息進行修正

---

*此工具集確保您的 Chrome 擴充功能符合所有發佈要求，讓審核過程更加順利。*