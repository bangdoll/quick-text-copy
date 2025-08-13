#!/bin/bash

# Quick Text Copy - GitHub 設置腳本
# 這個腳本會幫助你快速設置 GitHub 倉庫

echo "🚀 Quick Text Copy - GitHub 設置腳本"
echo "======================================"

# 檢查是否已經是 Git 倉庫
if [ -d ".git" ]; then
    echo "⚠️  檢測到現有的 Git 倉庫"
    read -p "是否要重新初始化？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf .git
        echo "✅ 已清除現有 Git 倉庫"
    else
        echo "❌ 取消設置"
        exit 1
    fi
fi

# 獲取 GitHub 用戶名
read -p "請輸入你的 GitHub 用戶名: " bangdoll

if [ -z "$github_username" ]; then
    echo "❌ GitHub 用戶名不能為空"
    exit 1
fi

echo "📝 更新文件中的 GitHub 用戶名..."

# 更新文件中的用戶名
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/yourusername/$github_username/g" README_GITHUB.md
    sed -i '' "s/yourusername/$github_username/g" package.json
    sed -i '' "s/yourusername/$github_username/g" CONTRIBUTING.md
else
    # Linux
    sed -i "s/yourusername/$github_username/g" README_GITHUB.md
    sed -i "s/yourusername/$github_username/g" package.json
    sed -i "s/yourusername/$github_username/g" CONTRIBUTING.md
fi

# 重命名 README 文件
if [ -f "README_GITHUB.md" ]; then
    mv README_GITHUB.md README.md
    echo "✅ 已重命名 README_GITHUB.md 為 README.md"
fi

# 初始化 Git 倉庫
echo "🔧 初始化 Git 倉庫..."
git init

# 添加所有文件
echo "📁 添加文件到 Git..."
git add .

# 提交初始版本
echo "💾 提交初始版本..."
git commit -m "Initial commit: Quick Text Copy v1.0.4 with OpenCC support

Features:
- 📋 Quick text copy functionality
- 🔄 OpenCC Simplified to Traditional Chinese conversion
- 🧠 Smart conversion with automatic detection
- 📦 Batch processing support
- 🧪 Complete test suite
- 📚 Comprehensive documentation"

# 設置主分支
git branch -M main

# 添加遠端倉庫
echo "🌐 添加遠端倉庫..."
git remote add origin "https://github.com/bangdoll/quick-text-copy.git"

echo ""
echo "✅ Git 倉庫設置完成！"
echo ""
echo "📋 下一步："
echo "1. 前往 GitHub 創建新倉庫: https://github.com/new"
echo "   - Repository name: quick-text-copy"
echo "   - Description: A powerful Chrome extension with quick text copy and OpenCC features"
echo "   - 設為 Public"
echo "   - 不要添加 README, .gitignore, 或 license（我們已經有了）"
echo ""
echo "2. 創建倉庫後，執行以下命令推送代碼："
echo "   git push -u origin main"
echo ""
echo "3. 設置倉庫 Topics（在 GitHub 倉庫頁面的 About 區域）："
echo "   chrome-extension, opencc, chinese-conversion, productivity, wasm"
echo ""
echo "4. 創建第一個 Release:"
echo "   - Tag: v1.0.4"
echo "   - Title: Quick Text Copy v1.0.4"
echo "   - 上傳 quick-text-copy-clean.zip"
echo ""
echo "🎉 完成後你的專案就成功上架到 GitHub 了！"