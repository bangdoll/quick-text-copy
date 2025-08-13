# Chrome Web Store 審核狀態監控指南

## 概述

此指南說明如何使用審核狀態監控系統來追蹤您的 Chrome 擴充功能在 Chrome Web Store 的審核進度。

## 功能特色

### 🔍 審核狀態追蹤
- 即時監控審核進度
- 自動記錄狀態變更歷史
- 預估審核完成時間

### 💬 回饋處理
- 記錄審核團隊的回饋意見
- 自動生成行動計畫
- 追蹤問題解決狀態

### 📊 報告生成
- 詳細的狀態報告
- 審核歷史記錄
- 統計分析資料

### 🤖 自動監控
- 定期檢查審核狀態
- 狀態變更通知
- 工作時間內監控

## 快速開始

### 1. 初始設定

首次使用時，系統會自動建立必要的配置檔案：

```bash
# 檢查當前狀態
npm run review-status check
```

### 2. 記錄提交資訊

當您提交擴充功能到 Chrome Web Store 後，記錄提交資訊：

```bash
# 記錄提交（替換為實際的提交ID）
npm run review-status submit "CWS_12345_abcdef" "1.0.0"
```

### 3. 監控審核狀態

定期檢查審核狀態：

```bash
# 手動檢查狀態
npm run review-status check

# 查看詳細狀態
npm run review-status status
```

## 命令參考

### 基本命令

```bash
# 檢查審核狀態
npm run review-status check

# 顯示詳細狀態資訊
npm run review-status status

# 生成狀態報告
npm run review-status report
```

### 狀態管理

```bash
# 更新提交狀態
npm run review-status submit <提交ID> [版本號]

# 手動更新審核狀態
npm run review-status update <狀態> [評論]

# 範例：更新為審核中
npm run review-status update "in_review" "審核已開始"
```

### 回饋處理

```bash
# 添加審核回饋
npm run review-status feedback <類型> <訊息>

# 範例：權限相關回饋
npm run review-status feedback "permissions" "需要移除不必要的權限"

# 標記回饋為已解決
npm run review-status resolve <回饋ID> <解決方案>
```

### 重新提交準備

```bash
# 檢查是否可以重新提交
npm run review-status resubmit
```

## 自動監控

### 啟動自動監控

```bash
# 啟動自動監控
npm run monitor-start

# 停止自動監控
npm run monitor-stop

# 查看監控狀態
npm run monitor-status
```

### 監控配置

```bash
# 查看當前配置
node auto-review-monitor.js config

# 更新配置（啟用監控，每30分鐘檢查一次）
node auto-review-monitor.js config '{"enabled":true,"checkInterval":1800000}'
```

### 配置選項

- `enabled`: 是否啟用自動監控
- `checkInterval`: 檢查間隔（毫秒）
- `notifications`: 通知設定
- `workingHours`: 工作時間設定
- `maxRetries`: 最大重試次數
- `retryDelay`: 重試延遲時間

## 審核狀態說明

### 狀態類型

| 狀態 | 說明 |
|------|------|
| `not_submitted` | 尚未提交 |
| `submitted` | 已提交 |
| `pending_review` | 等待審核 |
| `in_review` | 審核中 |
| `approved` | 已核准 |
| `rejected` | 被拒絕 |
| `published` | 已發佈 |
| `preparing_resubmission` | 準備重新提交 |

### 回饋類型

| 類型 | 說明 |
|------|------|
| `permissions` | 權限相關問題 |
| `functionality` | 功能性問題 |
| `metadata` | 中繼資料問題 |
| `privacy` | 隱私政策問題 |
| `security` | 安全性問題 |
| `other` | 其他問題 |

## 整合提交流程

### 完整提交檢查

```bash
# 執行提交前檢查
npm run submission-check

# 準備提交資料
npm run submission-prepare

# 執行完整提交流程
npm run submission-submit
```

### 提交前檢查項目

1. **套件建置檢查**：確認 ZIP 套件存在
2. **合規性檢查**：執行完整合規性驗證
3. **功能測試**：驗證擴充功能功能正常
4. **圖標驗證**：確認所有圖標檔案存在

## 檔案說明

### 狀態檔案

- `chrome-store-review-status.json`: 審核狀態資料
- `chrome-store-review-feedback.json`: 審核回饋資料
- `auto-monitor-config.json`: 自動監控配置
- `chrome-store-submission-config.json`: 提交配置

### 報告檔案

- `review-status-report-*.json`: 狀態報告
- `notification-history.json`: 通知歷史
- `monitor-errors.json`: 監控錯誤記錄

## 最佳實務

### 1. 定期檢查

- 每天至少檢查一次審核狀態
- 使用自動監控功能保持關注
- 及時回應審核團隊的回饋

### 2. 回饋處理

- 詳細記錄所有審核回饋
- 按照建議的行動計畫執行
- 確認問題解決後再重新提交

### 3. 狀態追蹤

- 保持狀態資料的準確性
- 定期生成報告進行分析
- 記錄重要的時間節點

### 4. 預防措施

- 提交前執行完整檢查
- 確保符合所有政策要求
- 準備應急處理計畫

## 故障排除

### 常見問題

**Q: 監控系統無法啟動**
A: 檢查配置檔案是否正確，確認 `enabled` 設為 `true`

**Q: 狀態檢查失敗**
A: 確認網路連線正常，檢查 Chrome Web Store 是否可存取

**Q: 回饋記錄遺失**
A: 檢查 `chrome-store-review-feedback.json` 檔案是否存在

**Q: 自動監控頻率過高**
A: 調整 `checkInterval` 設定，建議不少於30分鐘

### 錯誤處理

系統會自動記錄錯誤到 `monitor-errors.json` 檔案中，您可以查看此檔案來診斷問題。

## 支援與回饋

如果您在使用過程中遇到問題或有改進建議，請：

1. 檢查錯誤記錄檔案
2. 確認配置設定正確
3. 查看系統生成的報告
4. 聯絡技術支援團隊

---

**注意**: 此監控系統是輔助工具，實際的審核狀態請以 Chrome Web Store 開發者控制台為準。