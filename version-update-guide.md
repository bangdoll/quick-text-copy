# Chrome 擴充功能版本更新指南

## 概述

本指南說明如何管理 Quick Text Copy 擴充功能的版本更新，包括版本規劃、建置、測試、提交和發佈流程。

## 版本管理策略

### 語意化版本控制

採用 [Semantic Versioning](https://semver.org/) 格式：`MAJOR.MINOR.PATCH`

- **MAJOR (主版本)**：不相容的 API 變更
- **MINOR (次版本)**：向後相容的功能新增
- **PATCH (修補版本)**：向後相容的錯誤修正

### 版本類型範例

```
1.0.0 → 1.0.1  (PATCH)  修正複製功能錯誤
1.0.1 → 1.1.0  (MINOR)  新增快捷鍵功能
1.1.0 → 2.0.0  (MAJOR)  重新設計使用者介面
```

## 版本更新流程

### 階段一：版本規劃

1. **確定更新類型**
   ```bash
   # 檢查當前版本
   npm run version-current
   
   # 查看更新歷史
   npm run version-history
   ```

2. **制定更新計畫**
   - 列出要修正的問題
   - 規劃新增的功能
   - 評估相容性影響

### 階段二：開發和測試

1. **程式碼開發**
   - 實作新功能或修正
   - 更新相關文件
   - 確保程式碼品質

2. **本地測試**
   ```bash
   # 執行功能測試
   npm run test-extension
   
   # 執行合規性檢查
   npm run compliance-check
   
   # 驗證圖標和資源
   npm run verify-icons
   ```

### 階段三：版本建立

1. **建立新版本**
   ```bash
   # 建立修補版本 (1.0.0 → 1.0.1)
   npm run version-create patch "修正複製功能在某些網站失效的問題"
   
   # 建立次版本 (1.0.0 → 1.1.0)
   npm run version-create minor "新增快捷鍵 Ctrl+Shift+C 快速複製"
   
   # 建立主版本 (1.0.0 → 2.0.0)
   npm run version-create major "重新設計使用者介面和互動方式"
   ```

2. **版本資訊確認**
   ```bash
   # 查看版本詳情
   npm run version-info 1.0.1
   
   # 檢查版本狀態
   npm run version-status 1.0.1
   ```

### 階段四：建置和驗證

1. **建置更新套件**
   ```bash
   # 準備版本套件
   npm run version-prepare 1.0.1
   
   # 建置發佈套件
   npm run build
   ```

2. **套件驗證**
   ```bash
   # 驗證套件完整性
   unzip -t quick-text-copy-extension.zip
   
   # 檢查套件大小
   ls -lh quick-text-copy-extension.zip
   
   # 驗證 manifest 版本
   grep '"version"' manifest.json
   ```

### 階段五：提交更新

1. **Chrome Web Store 提交**
   ```bash
   # 提交版本更新
   npm run version-submit 1.0.1
   ```

2. **提交流程**
   - 登入 Chrome Web Store 開發者控制台
   - 選擇現有的擴充功能項目
   - 上傳新的 ZIP 套件
   - 更新版本說明
   - 提交審核

### 階段六：監控和發佈

1. **審核監控**
   ```bash
   # 啟動審核監控
   npm run monitor-start
   
   # 檢查審核狀態
   npm run review-status check
   ```

2. **發佈確認**
   ```bash
   # 確認發佈狀態
   npm run version-published 1.0.1
   
   # 啟動發佈後監控
   npm run post-launch-monitor
   ```

## 版本管理工具

### 版本建立工具

**基本命令：**
```bash
# 查看可用命令
npm run version-help

# 建立新版本
npm run version-create <type> <description>

# 準備版本套件
npm run version-prepare <version>

# 提交版本
npm run version-submit <version>
```

**進階命令：**
```bash
# 比較版本差異
npm run version-diff 1.0.0 1.0.1

# 回滾版本
npm run version-rollback 1.0.1

# 版本統計
npm run version-stats
```

### 自動化腳本

**版本更新管理器** (`version-update-manager.js`)：
- 自動版本號遞增
- 更新日誌維護
- 建置流程自動化
- 提交狀態追蹤

## 更新類型詳細說明

### 修補版本 (PATCH)

**適用情況：**
- 錯誤修正
- 安全性更新
- 效能最佳化
- 小幅改進

**範例：**
```bash
npm run version-create patch "修正在 Firefox 上複製功能異常的問題"
npm run version-create patch "改善記憶體使用效率"
npm run version-create patch "修正特殊字元處理錯誤"
```

**更新說明範本：**
```
版本 1.0.1 更新內容：
• 修正複製功能在某些網站失效的問題
• 改善擴充功能載入速度
• 修正特殊字元無法正確複製的錯誤
```

### 次版本 (MINOR)

**適用情況：**
- 新功能新增
- API 擴展
- 使用者體驗改善
- 向後相容的變更

**範例：**
```bash
npm run version-create minor "新增自訂複製格式功能"
npm run version-create minor "支援快捷鍵操作"
npm run version-create minor "新增複製歷史記錄"
```

**更新說明範本：**
```
版本 1.1.0 新功能：
• 新增快捷鍵 Ctrl+Shift+C 快速複製
• 支援自訂複製格式設定
• 新增複製成功的視覺回饋
• 改善設定介面使用體驗
```

### 主版本 (MAJOR)

**適用情況：**
- 重大架構變更
- 不相容的 API 變更
- 全新的使用者介面
- 重要功能重新設計

**範例：**
```bash
npm run version-create major "升級到 Manifest V3 架構"
npm run version-create major "重新設計使用者介面"
npm run version-create major "全新的複製引擎"
```

**更新說明範本：**
```
版本 2.0.0 重大更新：
• 升級到最新的 Manifest V3 架構
• 全新設計的使用者介面
• 重新開發的複製引擎，效能提升 50%
• 新增多種複製格式選項
• 支援批次複製功能

注意：此版本包含重大變更，建議查看更新說明
```

## 版本發佈策略

### 發佈時機

**定期發佈：**
- 每月一次次版本更新
- 每週一次修補版本（如有需要）
- 每季一次主版本評估

**緊急發佈：**
- 嚴重錯誤修正
- 安全性問題
- Chrome 政策變更

### 發佈前檢查清單

```bash
# 自動化檢查腳本
#!/bin/bash

echo "🔍 執行發佈前檢查..."

# 1. 程式碼品質檢查
npm run lint
npm run test

# 2. 功能測試
npm run test-extension

# 3. 合規性檢查
npm run compliance-check

# 4. 效能測試
npm run performance-test

# 5. 相容性測試
npm run compatibility-test

echo "✅ 發佈前檢查完成"
```

### 段階式發佈

1. **內部測試** (Alpha)
   - 開發團隊測試
   - 基本功能驗證

2. **有限發佈** (Beta)
   - 小範圍使用者測試
   - 收集初步回饋

3. **完整發佈** (Stable)
   - 全面發佈到 Chrome Web Store
   - 持續監控和支援

## 回滾和緊急處理

### 版本回滾

**何時需要回滾：**
- 發現嚴重錯誤
- 使用者大量負面回饋
- 相容性問題

**回滾流程：**
```bash
# 準備回滾版本
npm run version-rollback 1.0.1

# 建置回滾套件
npm run build

# 緊急提交
npm run emergency-submit "回滾到穩定版本 1.0.0"
```

### 緊急修正

**快速修正流程：**
1. 識別問題
2. 開發最小修正
3. 快速測試
4. 緊急發佈

```bash
# 建立緊急修正版本
npm run version-hotfix "修正嚴重的複製功能錯誤"

# 快速建置和提交
npm run build
npm run emergency-submit
```

## 版本文件管理

### 更新日誌維護

**CHANGELOG.md 格式：**
```markdown
# 更新日誌

## [1.0.1] - 2024-01-15

### 修正
- 修正複製功能在某些網站失效的問題
- 改善擴充功能載入速度

### 變更
- 最佳化記憶體使用

## [1.0.0] - 2024-01-01

### 新增
- 初始版本發佈
- 基本複製功能
```

### 版本標籤

```bash
# Git 標籤管理
git tag -a v1.0.1 -m "版本 1.0.1：修正複製功能錯誤"
git push origin v1.0.1
```

## 使用者溝通

### 更新通知

**Chrome Web Store 描述更新：**
- 在描述中突出新功能
- 說明重要修正
- 提供使用指導

**使用者回饋處理：**
```bash
# 監控使用者評價
npm run review-monitor

# 回應使用者問題
npm run user-support
```

### 版本遷移指導

**主版本更新時：**
- 提供遷移指南
- 說明變更影響
- 提供支援管道

## 最佳實務

### 版本規劃

1. **定期評估**
   - 每月檢視功能需求
   - 分析使用者回饋
   - 評估技術債務

2. **優先級排序**
   - 安全性修正優先
   - 使用者體驗改善
   - 新功能開發

### 品質保證

1. **測試策略**
   - 自動化測試
   - 手動功能測試
   - 使用者驗收測試

2. **程式碼審查**
   - 同儕審查
   - 安全性檢查
   - 效能評估

### 發佈管理

1. **時程控制**
   - 避免週五發佈
   - 考慮時區差異
   - 預留回滾時間

2. **監控準備**
   - 設定監控警告
   - 準備支援資源
   - 建立回滾計畫

---

**記住**：版本更新不只是程式碼變更，更是使用者體驗的持續改善。每次更新都應該為使用者帶來價值。