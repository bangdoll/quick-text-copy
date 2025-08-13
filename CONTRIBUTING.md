# 貢獻指南

感謝你對 Quick Text Copy 專案的興趣！我們歡迎各種形式的貢獻。

## 🤝 如何貢獻

### 回報問題
1. 檢查 [Issues](https://github.com/bangdoll/quick-text-copy/issues) 確認問題尚未被回報
2. 使用問題模板創建新的 Issue
3. 提供詳細的問題描述和重現步驟

### 提交功能請求
1. 檢查現有的 Issues 和 Pull Requests
2. 創建新的 Feature Request Issue
3. 詳細描述功能需求和使用場景

### 提交程式碼
1. Fork 這個專案
2. 創建功能分支：`git checkout -b feature/your-feature-name`
3. 進行開發並測試
4. 提交更改：`git commit -m 'Add some feature'`
5. 推送到分支：`git push origin feature/your-feature-name`
6. 創建 Pull Request

## 🛠️ 開發環境設置

### 環境需求
- Node.js 14 或更高版本
- npm 6 或更高版本
- Chrome 瀏覽器（用於測試擴充功能）

### 設置步驟
```bash
# 克隆專案
git clone https://github.com/bangdoll/quick-text-copy.git
cd quick-text-copy

# 安裝依賴
npm install

# 執行測試
npm test
```

## 📝 程式碼規範

### JavaScript 風格
- 使用 ES6+ 語法
- 使用 2 空格縮排
- 使用單引號字串
- 行尾不加分號（除非必要）

### 命名規範
- 變數和函數使用 camelCase
- 常數使用 UPPER_SNAKE_CASE
- 類別使用 PascalCase
- 檔案名使用 kebab-case

### 註釋規範
- 使用 JSDoc 格式註釋函數
- 為複雜邏輯添加說明註釋
- 保持註釋與程式碼同步

### 範例
```javascript
/**
 * 轉換簡體中文為繁體中文
 * @param {string} text - 要轉換的文字
 * @returns {string} 轉換後的文字
 */
function convertToTraditional(text) {
  if (!text || typeof text !== 'string') {
    return text
  }
  
  // 使用 OpenCC 進行轉換
  return this.converter(text)
}
```

## 🧪 測試

### 執行測試
```bash
# 執行所有測試
npm test

# 執行 OpenCC 測試
npm run test-opencc

# 驗證 OpenCC 功能
npm run verify-opencc
```

### 測試要求
- 新功能必須包含測試
- 測試覆蓋率應保持在 80% 以上
- 所有測試必須通過

### 測試類型
- 單元測試：測試個別函數和方法
- 整合測試：測試模組間的互動
- 端到端測試：測試完整的使用流程

## 📚 文檔

### 文檔更新
- 新功能需要更新相關文檔
- API 變更需要更新 README
- 重大變更需要更新 CHANGELOG

### 文檔風格
- 使用清晰簡潔的語言
- 提供程式碼範例
- 包含使用場景說明

## 🔄 Pull Request 流程

### PR 檢查清單
- [ ] 程式碼遵循專案風格指南
- [ ] 包含適當的測試
- [ ] 所有測試通過
- [ ] 更新相關文檔
- [ ] 提供清晰的 PR 描述

### PR 模板
```markdown
## 變更描述
簡要描述這個 PR 的變更內容

## 變更類型
- [ ] Bug 修復
- [ ] 新功能
- [ ] 文檔更新
- [ ] 重構
- [ ] 其他

## 測試
- [ ] 已添加測試
- [ ] 所有測試通過
- [ ] 手動測試完成

## 檢查清單
- [ ] 程式碼遵循風格指南
- [ ] 自我審查完成
- [ ] 文檔已更新
```

## 🏷️ 版本發布

### 版本號規則
遵循 [Semantic Versioning](https://semver.org/)：
- MAJOR：不相容的 API 變更
- MINOR：向後相容的功能新增
- PATCH：向後相容的問題修正

### 發布流程
1. 更新版本號
2. 更新 CHANGELOG.md
3. 創建 Git tag
4. 發布到 GitHub Releases
5. 更新 Chrome Web Store

## 🐛 問題回報

### 問題模板
```markdown
## 問題描述
清楚簡潔地描述問題

## 重現步驟
1. 前往 '...'
2. 點擊 '....'
3. 滾動到 '....'
4. 看到錯誤

## 預期行為
描述你預期應該發生什麼

## 實際行為
描述實際發生了什麼

## 環境資訊
- OS: [例如 macOS 12.0]
- 瀏覽器: [例如 Chrome 96.0]
- 擴充功能版本: [例如 1.0.4]

## 額外資訊
添加任何其他相關資訊
```

## 💡 功能請求

### 請求模板
```markdown
## 功能描述
清楚簡潔地描述你想要的功能

## 問題解決
這個功能解決了什麼問題？

## 解決方案
描述你希望的解決方案

## 替代方案
描述你考慮過的其他替代方案

## 額外資訊
添加任何其他相關資訊或截圖
```

## 📞 聯絡

如果你有任何問題，可以通過以下方式聯絡：
- 創建 [Issue](https://github.com/bangdoll/quick-text-copy/issues)
- 發送 Pull Request

感謝你的貢獻！🎉