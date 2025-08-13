# 快速開始指南 - OpenCC 簡體轉繁體

## 🚀 5 分鐘快速上手

### 1. 安裝依賴
```bash
npm install opencc-js
```

### 2. 基本使用
```javascript
const OpenCCConverter = require('./opencc-converter');

// 創建轉換器（推薦使用 twp 配置）
const converter = new OpenCCConverter({ from: 'cn', to: 'twp' });

// 轉換文字
const result = converter.convert('这个软件很好用');
console.log(result); // 輸出: 這個軟體很好用
```

### 3. 智慧轉換
```javascript
// 只轉換包含簡體字的文字
console.log(converter.smartConvert('这个需要转换')); // → 這個需要轉換
console.log(converter.smartConvert('這個不需要轉換')); // → 這個不需要轉換
console.log(converter.smartConvert('English text')); // → English text
```

### 4. 批量轉換
```javascript
const texts = ['这是第一句', '这是第二句'];
const results = converter.convertArray(texts);
console.log(results); // ['這是第一句', '這是第二句']
```

## 🎯 推薦配置

| 配置 | 適用場景 | 轉換效果 |
|------|----------|----------|
| `{ from: 'cn', to: 'twp' }` | **台灣地區（推薦）** | 软件→軟體, 网络→網路 |
| `{ from: 'cn', to: 'tw' }` | 基本轉換 | 软件→軟件, 网络→網絡 |
| `{ from: 'cn', to: 'hk' }` | 香港地區 | 基本繁體轉換 |

## 🧪 測試運行

```bash
# 執行測試
npm run test-opencc

# 查看示例
npm run demo-opencc

# 查看整合示例
npm run demo-opencc-integration
```

## 📦 項目整合

```javascript
const { TextProcessor } = require('./opencc-integration-example');

const processor = new TextProcessor();

// 處理對象
const data = {
  title: '软件开发指南',
  content: '这是关于软件开发的教程'
};

const result = processor.processObject(data, ['title', 'content']);
console.log(result);
// {
//   title: '軟體開發指南',
//   content: '這是關於軟體開發的教程'
// }
```

## ⚡ 效能特色

- ✅ 使用 WASM 技術，轉換速度快
- ✅ 智慧檢測，避免不必要的轉換
- ✅ 批量處理支援
- ✅ 完整的錯誤處理
- ✅ 零服務器依賴

## 📚 更多資源

- [完整文檔](./OPENCC_README.md)
- [更新日誌](./CHANGELOG.md)
- [測試文件](./test-opencc-converter.js)
- [使用示例](./demo-opencc-usage.js)