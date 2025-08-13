# Chrome Web Store 上傳問題修正指南

## 🚨 問題描述
上傳套件時出現錯誤：「在套件中找到多個資訊清單：clean-build/manifest.json, manifest.json」

## ✅ 解決方案

### 1. 使用乾淨的套件建置工具
```bash
npm run build-clean
```

或直接執行：
```bash
node build-clean-extension.js
```

### 2. 上傳正確的檔案
- ❌ **不要上傳**: `quick-text-copy-extension.zip` (包含多個 manifest.json)
- ✅ **請上傳**: `quick-text-copy-clean.zip` (只有一個 manifest.json 在根目錄)

### 3. 🆕 增強的中文轉換功能
新版本包含完整的簡繁轉換功能，能自動將簡體中文標題轉換為繁體中文：

**轉換範例：**
- 原文：`【人工智能】于地狱处望天堂 | 谷歌前高管Mo Gawdat最新访谈 | 反乌托邦`
- 轉換：`【人工智慧】於地獄處望天堂 | 谷歌前高管Mo Gawdat最新訪談 | 反烏托邦`

**支援的轉換類型：**
- 科技詞彙：人工智能→人工智慧、软件→軟體、网络→網路
- 政治社會：权利→權利、经济→經濟、政府→政府
- 媒體詞彙：访谈→訪談、新闻→新聞、媒体→媒體
- 特殊詞彙：反乌托邦→反烏托邦、竞赛→競賽

### 3. 驗證套件內容
新的乾淨套件只包含以下必要檔案：
```
quick-text-copy-clean.zip
├── manifest.json          (在根目錄)
├── service-worker.js
├── privacy-policy.html
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## 📊 套件資訊
- **檔案大小**: 約 22 KB
- **檔案數量**: 8 個檔案
- **manifest.json 位置**: 根目錄（符合 Chrome Web Store 要求）

## 🔍 問題原因
原本的套件包含了：
1. 根目錄的 `manifest.json`
2. `clean-build/manifest.json`
3. 其他開發工具和不必要的檔案

Chrome Web Store 要求：
- 只能有一個 `manifest.json` 檔案
- `manifest.json` 必須在 ZIP 檔案的根目錄
- 套件應該只包含擴充功能運行所需的檔案

## 🚀 上傳步驟
1. 前往 [Chrome Web Store 開發者控制台](https://chrome.google.com/webstore/devconsole)
2. 選擇「上傳新套件」或更新現有套件
3. 選擇 `quick-text-copy-clean.zip` 檔案
4. 確認上傳成功

## 🛠️ 未來避免此問題
- 始終使用 `npm run build-clean` 建立上傳套件
- 上傳前檢查套件內容：`unzip -l quick-text-copy-clean.zip`
- 確認只有一個 `manifest.json` 在根目錄

## ⚠️ 注意事項
- 不要手動修改 ZIP 檔案
- 不要包含開發工具或測試檔案
- 確保所有圖示檔案都是 PNG 格式
- 隱私政策檔案必須包含在套件中