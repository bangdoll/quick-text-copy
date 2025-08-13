# Chrome Web Store 開發者帳戶設定工具

本目錄包含協助設定和管理Chrome Web Store開發者帳戶的工具和文件。

## 📁 檔案說明

### 文件
- `chrome-store-account-setup.md` - 完整的開發者帳戶設定指南
- `developer-account-config.json` - 開發者帳戶配置檔案
- `DEVELOPER_ACCOUNT_README.md` - 本說明文件

### 工具腳本
- `setup-developer-account.js` - 互動式帳戶設定助手
- `check-developer-account.js` - 帳戶設定狀態檢查工具

## 🚀 快速開始

### 1. 互動式設定
使用互動式設定助手來逐步完成開發者帳戶設定：

```bash
npm run setup-account
# 或
node setup-developer-account.js
```

這個工具會引導您完成：
- 基本開發者資訊填寫
- 註冊費用支付確認
- 開發者協議接受確認
- 付款資訊設定（如需要）
- 通知偏好設定

### 2. 檢查設定狀態
隨時檢查您的開發者帳戶設定狀態：

```bash
npm run check-account
# 或
node check-developer-account.js
```

這個工具會：
- 檢查配置檔案完整性
- 驗證必要資訊是否填寫
- 確認註冊和付款狀態
- 生成詳細的檢查報告

## 📋 設定清單

完成開發者帳戶設定需要以下步驟：

### 必要步驟
- [ ] 支付 $5 美元註冊費用
- [ ] 接受Chrome Web Store開發者協議
- [ ] 填寫完整的開發者資訊
- [ ] 完成身份驗證（如需要）
- [ ] 驗證開發者控制台存取權限

### 可選步驟
- [ ] 設定付款資訊（僅限付費應用程式）
- [ ] 配置團隊成員權限
- [ ] 設定通知偏好

## 🔧 配置檔案說明

`developer-account-config.json` 檔案包含以下欄位：

```json
{
  "developerName": "您的開發者名稱",
  "contactEmail": "聯絡電子郵件",
  "developerType": "individual|company",
  "registrationFeePaid": false,
  "agreementAccepted": false,
  "identityVerified": false,
  "plansPaidApps": false,
  "paymentSetup": {
    "configured": false,
    "merchantAccount": "",
    "taxInfo": false
  },
  "notifications": {
    "email": true,
    "reviewUpdates": true,
    "policyUpdates": true
  }
}
```

## 📊 檢查報告

檢查工具會生成 `developer-account-check-report.json` 報告，包含：

- 檢查日期和時間
- 詳細的檢查結果
- 通過/失敗統計
- 改進建議

## ⚠️ 重要注意事項

1. **註冊費用**：Chrome Web Store 開發者帳戶需要支付 $5 美元的一次性註冊費用，此費用不可退還。

2. **身份驗證**：某些情況下，Google 可能要求進行額外的身份驗證，這可能需要 1-3 個工作天。

3. **付費應用程式**：如果您計劃發佈付費擴充功能，需要額外設定 Google Payments 商家帳戶和稅務資訊。

4. **政策遵循**：請確保您的擴充功能符合 Chrome Web Store 的開發者政策。

## 🔗 相關資源

- [Chrome Web Store 開發者控制台](https://chrome.google.com/webstore/devconsole)
- [Chrome Web Store 開發者文件](https://developer.chrome.com/docs/webstore/)
- [開發者政策](https://developer.chrome.com/docs/webstore/program-policies/)
- [開發者支援](https://support.google.com/chrome_webstore/contact/developer_support)

## 🆘 故障排除

### 常見問題

**Q: 無法存取開發者控制台**
A: 確認您已使用正確的 Google 帳戶登入，並已完成註冊費用支付。

**Q: 身份驗證被拒絕**
A: 請確保提供的身份證明文件清晰可讀，並符合 Google 的要求。

**Q: 付款設定失敗**
A: 檢查您的銀行帳戶資訊是否正確，並確認支援您所在地區。

### 取得協助

如果遇到問題，可以：
1. 查看 Chrome Web Store 開發者文件
2. 聯絡 Google 開發者支援
3. 檢查 Google 開發者社群論壇

## 📝 更新記錄

- 2024-01-15: 初始版本，包含基本設定和檢查功能
- 支援繁體中文介面
- 包含互動式設定流程
- 自動生成檢查報告