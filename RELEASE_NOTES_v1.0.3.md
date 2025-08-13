# 🚀 Quick Text Copy v1.0.3 發布說明

## 📅 發布日期
2025年1月9日

## 🎯 主要新功能

### OpenCC 簡體轉繁體轉換器
這個版本引入了基於 OpenCC WASM 技術的強大中文轉換功能：

#### ✨ 核心特色
- **高效準確**：使用 OpenCC WASM 引擎，轉換準確度高
- **多種配置**：支援 cn→tw, cn→hk, cn→twp 三種轉換模式
- **智慧轉換**：自動檢測簡體字，避免不必要的轉換
- **批量處理**：支援陣列和對象屬性批量轉換
- **零依賴**：純前端實現，無需服務器支援

#### 🔧 推薦配置
```javascript
// 推薦使用 twp 配置，提供更符合台灣使用習慣的轉換
const converter = new OpenCCConverter({ from: 'cn', to: 'twp' });
```

#### 📊 轉換效果對比
| 簡體原文 | tw 配置 | twp 配置（推薦） |
|----------|---------|------------------|
| 软件 | 軟件 | **軟體** |
| 计算机 | 計算機 | 計算機 |
| 程序 | 程序 | **程式** |
| 网络 | 網絡 | **網路** |
| 数据 | 數據 | **資料** |
| 用户 | 用戶 | **使用者** |

## 🛠️ 技術改進

### 新增文件
- `opencc-converter.js` - 核心轉換器類別
- `test-opencc-converter.js` - 完整測試套件
- `demo-opencc-usage.js` - 使用示例和配置對比
- `opencc-integration-example.js` - 項目整合示例
- `OPENCC_README.md` - 完整功能文檔
- `QUICK_START.md` - 5分鐘快速上手指南
- `CHANGELOG.md` - 版本更新日誌

### 新增 npm scripts
```bash
npm run test-opencc           # 執行 OpenCC 測試
npm run demo-opencc           # 查看使用示例
npm run demo-opencc-integration  # 查看整合示例
```

### 依賴更新
- 新增 `opencc-js: ^1.0.5` - OpenCC JavaScript/WASM 實現

## 🚀 快速開始

### 基本使用
```javascript
const OpenCCConverter = require('./opencc-converter');

// 創建轉換器
const converter = new OpenCCConverter({ from: 'cn', to: 'twp' });

// 轉換文字
console.log(converter.convert('这个软件很好用'));
// 輸出: 這個軟體很好用
```

### 智慧轉換
```javascript
// 只轉換包含簡體字的文字
console.log(converter.smartConvert('这个需要转换')); // → 這個需要轉換
console.log(converter.smartConvert('這個不需要轉換')); // → 這個不需要轉換
```

### 批量處理
```javascript
const texts = ['这是第一句', '这是第二句'];
const results = converter.convertArray(texts);
console.log(results); // ['這是第一句', '這是第二句']
```

## 📚 文檔資源

- [完整功能文檔](./OPENCC_README.md)
- [快速開始指南](./QUICK_START.md)
- [更新日誌](./CHANGELOG.md)
- [主要 README](./README.md)

## 🧪 測試驗證

所有新功能都經過完整測試：
- ✅ 基本轉換功能測試
- ✅ 多配置對比測試
- ✅ 智慧轉換測試
- ✅ 批量處理測試
- ✅ 錯誤處理測試
- ✅ 項目整合測試

## 🔄 向後兼容性

v1.0.3 完全向後兼容，所有現有功能保持不變，新增的 OpenCC 功能為獨立模組，不影響原有的 Chrome 擴充功能。

## 🎉 總結

v1.0.3 版本為 Quick Text Copy 項目帶來了強大的中文轉換功能，使其不僅是一個 Chrome 擴充功能，更成為一個完整的文字處理工具集。無論是個人使用還是項目整合，都能提供高效準確的簡體轉繁體轉換服務。

---

**立即體驗：**
```bash
npm run demo-opencc
```