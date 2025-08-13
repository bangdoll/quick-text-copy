# 🔍 如何查找 Chrome Web Store 提交ID

## 📋 提交ID 是什麼？

提交ID（Submission ID）是 Chrome Web Store 為每次擴充功能提交分配的唯一識別碼，用於追蹤審核狀態。

## 🔎 查找提交ID 的方法

### 方法 1：在開發者控制台查看

1. **前往開發者控制台**
   - 網址：https://chrome.google.com/webstore/devconsole
   - 登入您的開發者帳戶

2. **找到您的擴充功能**
   - 點擊 "Quick Text Copy" 擴充功能

3. **查看提交歷史**
   - 點擊左側選單的「套件」或「Package」
   - 在套件列表中可以看到每次提交的資訊
   - 提交ID 通常顯示為類似這樣的格式：
     - `CWS_12345678_abcdef123456`
     - `SUBMISSION_20240807_xyz789`

4. **在審核狀態頁面查看**
   - 點擊「商店列表」或「Store Listing」
   - 查看頁面頂部的狀態訊息
   - 提交ID 可能顯示在狀態描述中

### 方法 2：從電子郵件通知獲取

Chrome Web Store 會發送電子郵件通知，包含：

1. **提交確認郵件**
   - 主旨：「Your Chrome Web Store item has been submitted for review」
   - 內容包含提交ID和相關資訊

2. **審核狀態更新郵件**
   - 審核開始、完成或需要修正時會收到通知
   - 郵件中會包含提交ID

### 方法 3：瀏覽器網路面板查看

如果您熟悉開發者工具：

1. **開啟開發者工具**
   - 在 Chrome Web Store 開發者控制台按 F12
   - 切換到「Network」標籤

2. **執行提交操作**
   - 上傳套件並提交審核
   - 觀察網路請求

3. **查找 API 回應**
   - 尋找包含提交資訊的 API 回應
   - 提交ID 會在回應資料中

## 📝 提交ID 格式範例

常見的提交ID 格式：
- `CWS_20240807_abc123def456`
- `SUBMISSION_1691234567_xyz789`
- `REV_20240807_quicktextcopy_v101`

## 🔧 記錄提交ID 的最佳實務

### 立即記錄
提交後立即使用我們的監控工具記錄：

```bash
# 替換為實際的提交ID
npm run review-status submit "您的實際提交ID" "1.0.1"
```

### 建立記錄表格
您可以建立一個簡單的記錄表：

| 日期 | 版本 | 提交ID | 狀態 | 備註 |
|------|------|--------|------|------|
| 2024-08-07 | 1.0.1 | CWS_20240807_abc123 | 審核中 | 新增簡繁轉換功能 |

## 🚨 如果找不到提交ID 怎麼辦？

### 暫時解決方案
如果暫時找不到提交ID，您仍然可以：

1. **使用臨時ID**
   ```bash
   # 使用日期和版本建立臨時ID
   npm run review-status submit "TEMP_20240807_v101" "1.0.1"
   ```

2. **稍後更新**
   找到實際提交ID後，可以更新記錄：
   ```bash
   npm run review-status update "submitted" "已找到實際提交ID: CWS_12345"
   ```

### 聯絡支援
如果完全無法找到提交ID：
- 可以聯絡 Chrome Web Store 支援團隊
- 提供擴充功能名稱和提交日期
- 他們可以協助查找提交記錄

## 📊 使用監控工具的完整流程

### 1. 提交前準備
```bash
npm run update-prepare
```

### 2. 手動提交到 Chrome Web Store
- 按照指南上傳套件
- 記下或截圖提交ID

### 3. 記錄提交資訊
```bash
# 使用實際的提交ID
npm run review-status submit "CWS_20240807_abc123" "1.0.1"
```

### 4. 啟動監控
```bash
npm run monitor-start
```

### 5. 檢查狀態
```bash
npm run review-status check
```

## 💡 實用提示

1. **截圖保存**：提交時截圖保存提交確認頁面
2. **郵件保存**：保存所有來自 Chrome Web Store 的郵件
3. **記錄習慣**：養成立即記錄提交ID的習慣
4. **備份資訊**：將提交資訊記錄在多個地方

## 🔄 更新現有記錄

如果後來找到了正確的提交ID：

```bash
# 查看當前狀態
npm run review-status status

# 手動更新提交ID（如果需要修正）
# 可以編輯 chrome-store-review-status.json 檔案
```

---

**記住**：提交ID 是在您點擊「提交審核」按鈕後才會產生的，所以需要在提交完成後才能獲得。