# 🚀 GitHub 上架指南

這份指南將幫助你將 Quick Text Copy 專案上架到 GitHub。

## 📋 準備工作

### 1. 檢查文件
確保以下文件已準備完成：
- ✅ `README_GITHUB.md` - GitHub 主要說明文件
- ✅ `.gitignore` - Git 忽略文件
- ✅ `LICENSE` - MIT 授權文件
- ✅ `CONTRIBUTING.md` - 貢獻指南
- ✅ `.github/workflows/` - GitHub Actions 工作流程
- ✅ `.github/ISSUE_TEMPLATE/` - Issue 模板
- ✅ `.github/pull_request_template.md` - PR 模板

### 2. 清理敏感文件
以下文件已在 `.gitignore` 中排除，不會上傳到 GitHub：
- Chrome Store 相關配置文件
- 開發者帳號資訊
- 測試報告和日誌
- 建置輸出文件

## 🔧 上架步驟

### 步驟 1: 初始化 Git 倉庫
```bash
# 初始化 Git 倉庫
git init

# 添加所有文件
git add .

# 提交初始版本
git commit -m "Initial commit: Quick Text Copy v1.0.4 with OpenCC support"
```

### 步驟 2: 創建 GitHub 倉庫
1. 前往 [GitHub](https://github.com)
2. 點擊右上角的 "+" 按鈕
3. 選擇 "New repository"
4. 填寫倉庫資訊：
   - **Repository name**: `quick-text-copy`
   - **Description**: `A powerful Chrome extension with quick text copy and OpenCC Simplified to Traditional Chinese conversion features`
   - **Visibility**: Public（推薦）或 Private
   - **不要**勾選 "Add a README file"（我們已經有了）
   - **不要**勾選 "Add .gitignore"（我們已經有了）
   - **不要**勾選 "Choose a license"（我們已經有了）

### 步驟 3: 連接本地倉庫到 GitHub
```bash
# 添加遠端倉庫（替換 yourusername 為你的 GitHub 用戶名）
git remote add origin https://github.com/yourusername/quick-text-copy.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 步驟 4: 更新文件中的 GitHub 連結
更新以下文件中的 `yourusername` 為你的實際 GitHub 用戶名：
- `README_GITHUB.md`
- `package.json`
- `CONTRIBUTING.md`

```bash
# 使用 sed 命令批量替換（macOS/Linux）
sed -i 's/yourusername/你的GitHub用戶名/g' README_GITHUB.md
sed -i 's/yourusername/你的GitHub用戶名/g' package.json
sed -i 's/yourusername/你的GitHub用戶名/g' CONTRIBUTING.md

# 提交更新
git add .
git commit -m "Update GitHub username in documentation"
git push
```

### 步驟 5: 設置 GitHub 倉庫
1. 前往你的 GitHub 倉庫頁面
2. 點擊 "Settings" 標籤
3. 在 "General" 設定中：
   - 設置 "Website" 為 Chrome Web Store 連結（如果有）
   - 添加 "Topics"：`chrome-extension`, `opencc`, `chinese-conversion`, `productivity`

### 步驟 6: 創建第一個 Release
1. 前往 "Releases" 頁面
2. 點擊 "Create a new release"
3. 填寫資訊：
   - **Tag version**: `v1.0.4`
   - **Release title**: `Quick Text Copy v1.0.4`
   - **Description**: 複製 `RELEASE_NOTES_v1.0.4.md` 的內容
4. 上傳 `quick-text-copy-clean.zip` 作為附件
5. 點擊 "Publish release"

## 📚 文件結構

上架後的 GitHub 倉庫結構：
```
quick-text-copy/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── release.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
├── icons/
├── docs/
│   ├── OPENCC_README.md
│   ├── QUICK_START.md
│   └── CHANGELOG.md
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
├── README.md (重命名自 README_GITHUB.md)
├── manifest.json
├── service-worker.js
├── opencc-converter.js
├── package.json
└── 其他核心文件...
```

## 🔄 後續維護

### 版本更新流程
1. 更新版本號（`package.json`, `manifest.json`）
2. 更新 `CHANGELOG.md`
3. 提交更改並推送
4. 創建新的 Git tag 和 GitHub Release
5. GitHub Actions 會自動執行 CI/CD

### 自動化功能
- **CI**: 每次 push 和 PR 都會執行測試
- **Release**: 創建 tag 時自動建立 Release
- **Issue 管理**: 使用模板標準化問題回報
- **PR 管理**: 使用模板標準化代碼貢獻

## 🎯 最佳實踐

### README 優化
- 使用徽章顯示版本、授權等資訊
- 提供清晰的安裝和使用說明
- 包含截圖和 GIF 演示
- 添加貢獻指南連結

### 社群建設
- 及時回應 Issues 和 PRs
- 維護 CHANGELOG
- 定期發布 Release
- 鼓勵社群貢獻

### SEO 優化
- 使用相關的 topics 標籤
- 撰寫詳細的專案描述
- 提供完整的文檔

## 🚀 完成！

完成以上步驟後，你的 Quick Text Copy 專案就成功上架到 GitHub 了！

### 下一步
1. 分享你的 GitHub 倉庫連結
2. 在 Chrome Web Store 中添加 GitHub 連結
3. 考慮提交到相關的 awesome 列表
4. 在社群中推廣你的專案

---

🎉 恭喜！你的專案現在已經在 GitHub 上了！