@echo off
chcp 65001 >nul
echo 🚀 Quick Text Copy - GitHub 設置腳本
echo ======================================

REM 檢查是否已經是 Git 倉庫
if exist ".git" (
    echo ⚠️  檢測到現有的 Git 倉庫
    set /p "choice=是否要重新初始化？(y/N): "
    if /i "%choice%"=="y" (
        rmdir /s /q .git
        echo ✅ 已清除現有 Git 倉庫
    ) else (
        echo ❌ 取消設置
        pause
        exit /b 1
    )
)

REM 獲取 GitHub 用戶名
set /p "github_username=bangdoll: "

if "%github_username%"=="" (
    echo ❌ GitHub 用戶名不能為空
    pause
    exit /b 1
)

echo 📝 更新文件中的 GitHub 用戶名...

REM 更新文件中的用戶名（使用 PowerShell）
powershell -Command "(Get-Content README_GITHUB.md) -replace 'yourusername', '%github_username%' | Set-Content README_GITHUB.md"
powershell -Command "(Get-Content package.json) -replace 'yourusername', '%github_username%' | Set-Content package.json"
powershell -Command "(Get-Content CONTRIBUTING.md) -replace 'yourusername', '%github_username%' | Set-Content CONTRIBUTING.md"

REM 重命名 README 文件
if exist "README_GITHUB.md" (
    move README_GITHUB.md README.md >nul
    echo ✅ 已重命名 README_GITHUB.md 為 README.md
)

REM 初始化 Git 倉庫
echo 🔧 初始化 Git 倉庫...
git init

REM 添加所有文件
echo 📁 添加文件到 Git...
git add .

REM 提交初始版本
echo 💾 提交初始版本...
git commit -m "Initial commit: Quick Text Copy v1.0.4 with OpenCC support" -m "Features:" -m "- 📋 Quick text copy functionality" -m "- 🔄 OpenCC Simplified to Traditional Chinese conversion" -m "- 🧠 Smart conversion with automatic detection" -m "- 📦 Batch processing support" -m "- 🧪 Complete test suite" -m "- 📚 Comprehensive documentation"

REM 設置主分支
git branch -M main

REM 添加遠端倉庫
echo 🌐 添加遠端倉庫...
git remote add origin "https://github.com/%github_username%/quick-text-copy.git"

echo.
echo ✅ Git 倉庫設置完成！
echo.
echo 📋 下一步：
echo 1. 前往 GitHub 創建新倉庫: https://github.com/new
echo    - Repository name: quick-text-copy
echo    - Description: A powerful Chrome extension with quick text copy and OpenCC features
echo    - 設為 Public
echo    - 不要添加 README, .gitignore, 或 license（我們已經有了）
echo.
echo 2. 創建倉庫後，執行以下命令推送代碼：
echo    git push -u origin main
echo.
echo 3. 設置倉庫 Topics（在 GitHub 倉庫頁面的 About 區域）：
echo    chrome-extension, opencc, chinese-conversion, productivity, wasm
echo.
echo 4. 創建第一個 Release:
echo    - Tag: v1.0.4
echo    - Title: Quick Text Copy v1.0.4
echo    - 上傳 quick-text-copy-clean.zip
echo.
echo 🎉 完成後你的專案就成功上架到 GitHub 了！
echo.
pause