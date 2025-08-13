# OpenCC-JS 簡體轉繁體轉換器 v1.0.3

使用 OpenCC-JS (WASM) 實現高效準確的簡體中文轉繁體中文功能，預設使用 s2twp 配置（台灣繁體含慣用詞）。

## 版本更新

### v1.0.3 (2025-01-09)
- ✅ 新增 OpenCC-JS WASM 簡體轉繁體功能
- ✅ 支援多種轉換配置（cn→tw, cn→hk, cn→twp）
- ✅ 智慧轉換和批量處理功能
- ✅ 完整的測試套件和使用示例
- ✅ 新增 npm scripts 支援

## 功能特色

- ✅ 使用 OpenCC WASM 引擎，轉換準確度高
- ✅ 支援多種轉換配置（cn→tw, cn→hk, cn→twp）
- ✅ 智慧轉換：自動檢測是否包含簡體字
- ✅ 批量轉換支援
- ✅ 對象屬性轉換
- ✅ 錯誤處理和狀態檢查

## 安裝依賴

```bash
npm install opencc-js
```

## 基本使用

### 1. 基本轉換

```javascript
const OpenCCConverter = require('./opencc-converter');

// 使用預設配置 (cn → twp，推薦)
const converter = new OpenCCConverter();

// 轉換文字
const result = converter.convert('这个软件很好用');
console.log(result); // 輸出: 這個軟體很好用
```

### 2. 使用不同配置

```javascript
// 台灣繁體（含慣用詞）- 推薦使用
const twpConverter = new OpenCCConverter({ from: 'cn', to: 'twp' });
console.log(twpConverter.convert('计算机软件')); // 輸出: 計算機軟體

// 香港繁體
const hkConverter = new OpenCCConverter({ from: 'cn', to: 'hk' });
console.log(hkConverter.convert('计算机软件')); // 輸出: 計算機軟件
```

### 3. 智慧轉換

```javascript
const converter = new OpenCCConverter({ from: 'cn', to: 'twp' });

// 智慧轉換：只轉換包含簡體字的文字
console.log(converter.smartConvert('这个需要转换')); // 轉換
console.log(converter.smartConvert('這個不需要轉換')); // 不轉換
console.log(converter.smartConvert('English text')); // 不轉換
```

### 4. 批量轉換

```javascript
const texts = ['这是第一句', '这是第二句', '这是第三句'];
const results = converter.convertArray(texts);
console.log(results); // ['這是第一句', '這是第二句', '這是第三句']
```

## 進階使用

### 整合到項目中

```javascript
const { TextProcessor } = require('./opencc-integration-example');

const processor = new TextProcessor();

// 處理對象中的文字屬性
const data = {
  title: '软件开发指南',
  content: '这是一个关于软件开发的教程',
  author: 'John Doe'
};

const processed = processor.processObject(data, ['title', 'content']);
console.log(processed);
// {
//   title: '軟體開發指南',
//   content: '這是一個關於軟體開發的教程',
//   author: 'John Doe'
// }
```

## 配置選項

| 配置 | 說明 | 適用場景 |
|------|------|----------|
| `{ from: 'cn', to: 'twp' }` | 簡體中文 → 台灣繁體（含慣用詞） | **預設推薦**，更符合台灣用詞習慣 |
| `{ from: 'cn', to: 'tw' }` | 簡體中文 → 台灣繁體 | 基本轉換 |
| `{ from: 'cn', to: 'hk' }` | 簡體中文 → 香港繁體 | 香港地區使用 |

## 轉換效果對比

| 簡體原文 | tw 配置 | twp 配置（推薦） |
|----------|---------|------------------|
| 软件 | 軟件 | 軟體 |
| 计算机 | 計算機 | 計算機 |
| 程序 | 程序 | 程式 |
| 网络 | 網絡 | 網路 |
| 数据 | 數據 | 資料 |
| 用户 | 用戶 | 使用者 |

## API 參考

### OpenCCConverter

#### 建構函式
```javascript
new OpenCCConverter(config)
```
- `config`: 轉換配置對象，預設 `{ from: 'cn', to: 'tw' }`

#### 方法

##### convert(text)
轉換單個文字字串
- `text`: 要轉換的文字
- 返回: 轉換後的文字

##### convertArray(textArray)
批量轉換文字陣列
- `textArray`: 文字陣列
- 返回: 轉換後的文字陣列

##### smartConvert(text)
智慧轉換，只轉換包含簡體字的文字
- `text`: 要轉換的文字
- 返回: 轉換後的文字

##### hasSimplifiedChinese(text)
檢測文字是否包含簡體中文字符
- `text`: 要檢測的文字
- 返回: boolean

##### getStatus()
獲取轉換器狀態
- 返回: 狀態對象

## 測試

```bash
# 執行基本測試
npm run test-opencc

# 查看使用示例
npm run demo-opencc

# 查看整合示例
npm run demo-opencc-integration
```

或直接執行：

```bash
# 執行基本測試
node test-opencc-converter.js

# 查看使用示例
node demo-opencc-usage.js

# 查看整合示例
node opencc-integration-example.js
```

## 注意事項

1. **推薦使用 twp 配置**：提供更符合台灣使用習慣的轉換結果
2. **智慧轉換**：使用 `smartConvert()` 可以避免對已經是繁體的文字進行不必要的轉換
3. **錯誤處理**：轉換器包含完整的錯誤處理機制，轉換失敗時會返回原文
4. **效能考量**：OpenCC WASM 版本提供高效的轉換效能

## 相關文件

- `opencc-converter.js` - 核心轉換器類別
- `test-opencc-converter.js` - 測試文件
- `demo-opencc-usage.js` - 使用示例
- `opencc-integration-example.js` - 整合示例

## 授權

本項目使用 OpenCC-JS 函式庫，遵循其開源授權條款。