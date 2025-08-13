# 設計文件

## 概述

Quick Text Copy 是一個 Chrome Manifest V3 擴展，提供簡單的一鍵解決方案來複製當前頁面的標題和網址到剪貼簿。此擴展使用 service worker 架構，配合現代剪貼簿 API 和完整的錯誤處理。

## 架構

### 擴展結構
- **Manifest V3**：現代 Chrome 擴展格式，使用 service worker
- **Service Worker**：處理按鈕點擊和剪貼簿操作的背景腳本
- **內容腳本注入**：動態腳本注入以存取剪貼簿
- **無彈出介面**：直接動作按鈕，無彈出介面

### 核心元件
1. **Service Worker** (`service-worker.js`)：主要背景邏輯
2. **Manifest** (`manifest.json`)：擴展配置和權限
3. **圖標**：多種尺寸的視覺資源 (16px, 32px, 48px, 128px)
4. **測試頁面** (`test-page.html`)：開發測試介面

## 元件與介面

### TabInfoHandler 類別
**目的**：管理分頁資訊檢索和驗證

**主要方法**：
- `getCurrentActiveTab()`：使用 chrome.tabs.query() 檢索當前活躍分頁
- `validateTabInfo(tab)`：驗證分頁物件並過濾不支援的頁面
- `formatText(title, url)`：以「標題 網址」格式格式化文字，包含標題截斷
- `getFormattedText()`：協調分頁資訊檢索和格式化

**輸入**：Chrome 分頁物件
**輸出**：格式化文字字串或驗證錯誤

### ClipboardHandler 類別
**目的**：處理剪貼簿操作與備用機制

**主要方法**：
- `copyToClipboard(text, tabId)`：執行雙方法剪貼簿複製

**剪貼簿策略**：
1. **主要**：現代 `navigator.clipboard.writeText()` API
2. **備用**：傳統 `document.execCommand('copy')` 方法
3. **錯誤處理**：優雅降級與詳細日誌記錄

**輸入**：文字字串和分頁 ID
**輸出**：布林成功狀態

### MainEventHandler 類別
**目的**：協調完整的複製工作流程

**主要方法**：
- `handleTextCopy(tab)`：主要工作流程協調
- `validateTabObject(tab)`：預檢分頁驗證

**工作流程**：
1. 驗證分頁物件
2. 透過 TabInfoHandler 取得格式化文字
3. 透過 ClipboardHandler 執行剪貼簿複製
4. 回傳操作結果與時間

### Logger 類別
**目的**：多層級的集中式日誌記錄系統

**日誌層級**：INFO、WARN、ERROR、DEBUG
**功能**：
- 時間戳記包含
- 擴展名稱前綴
- 結構化資料日誌記錄
- 控制台輸出路由

## 資料模型

### 分頁資訊物件
```javascript
{
  id: number,           // Chrome 分頁 ID
  title: string,        // 頁面標題
  url: string,          // 頁面網址
  active: boolean,      // 分頁活躍狀態
  currentWindow: boolean // 當前視窗狀態
}
```

### 格式化文字資訊
```javascript
{
  formattedText: string,    // 「標題 網址」格式
  originalTitle: string,    // 未修改的標題
  url: string,             // 頁面網址
  tabId: number            // 分頁識別碼
}
```

### 操作結果
```javascript
{
  success: boolean,        // 操作成功狀態
  action: string,          // 動作類型識別碼
  text?: string,           // 複製的文字（如果成功）
  error?: string,          // 錯誤訊息（如果失敗）
  duration: number,        // 操作時間（毫秒）
  tabInfo: object         // 分頁上下文資訊
}
```

## 錯誤處理

### 驗證錯誤
- **空分頁物件**：優雅跳過並記錄警告
- **無效網址**：過濾 chrome://、chrome-extension://、moz-extension://、edge:// 頁面
- **缺失標題/網址**：驗證失敗並詳細記錄

### 剪貼簿錯誤
- **API 不可用**：自動回退到 execCommand
- **權限被拒**：錯誤記錄而不崩潰
- **逾時**：2 秒操作逾時並優雅失敗

### 腳本注入錯誤
- **分頁存取被拒**：記錄錯誤與上下文
- **腳本執行失敗**：詳細錯誤報告
- **結果處理**：空結果處理

## 測試策略

### 單元測試方法
- **TabInfoHandler**：模擬 chrome.tabs.query() 回應
- **ClipboardHandler**：模擬剪貼簿 API 和 execCommand
- **MainEventHandler**：使用模擬依賴的整合測試
- **Logger**：輸出驗證和層級過濾

### 整合測試
- **端到端流程**：按鈕點擊到剪貼簿複製
- **錯誤情境**：無效分頁、剪貼簿失敗、逾時
- **跨瀏覽器**：Chrome 版本相容性測試

### 手動測試
- **測試頁面**：專用 HTML 頁面進行開發測試
- **真實網站**：GitHub、Google、Stack Overflow、Wikipedia
- **邊緣情況**：長標題、特殊字元、受限頁面

### 效能測試
- **操作時間**：次秒級複製操作
- **記憶體使用**：Service worker 效率
- **錯誤恢復**：優雅失敗處理

## 安全考量

### 權限
- **activeTab**：僅存取當前分頁資訊
- **scripting**：內容腳本注入以存取剪貼簿
- **最小範圍**：無持久權限或廣泛存取

### 資料處理
- **無儲存**：無持久資料儲存
- **無網路**：無外部 API 呼叫或資料傳輸
- **僅本地**：所有操作在瀏覽器上下文內

### 內容安全
- **腳本注入**：暫時的、函數範圍注入
- **DOM 操作**：最小化、僅專注於剪貼簿
- **清理**：複製操作後自動移除元素