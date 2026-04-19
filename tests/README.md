# 測試和品質保證系統

這個測試系統為 Chrome 擴充功能權限修正專案提供全面的測試覆蓋，確保所有功能正常運作並符合 Chrome Web Store 的要求。

## 測試架構

### 測試類型

1. **單元測試 (Unit Tests)** - `tests/unit/`
   - 測試個別函數和類別的功能
   - 快速執行，提供即時反饋
   - 覆蓋核心邏輯和邊界情況

2. **整合測試 (Integration Tests)** - `tests/integration/`
   - 測試多個組件之間的互動
   - 驗證完整的工作流程
   - 確保組件間的資料傳遞正確

3. **端到端測試 (E2E Tests)** - `tests/e2e/`
   - 模擬真實的使用者情境
   - 測試完整的擴充功能功能
   - 驗證使用者體驗流程

4. **合規性測試 (Compliance Tests)** - `tests/compliance/`
   - 確保符合 Chrome Web Store 政策
   - 驗證權限描述和隱私政策
   - 檢查安全性和內容合規性

## 快速開始

### 安裝依賴

```bash
npm install
```

### 執行所有測試

```bash
npm test
```

### 執行特定類型的測試

```bash
# 單元測試
npm run test:unit

# 整合測試
npm run test:integration

# 端到端測試
npm run test:e2e

# 合規性測試
npm run test:compliance
```

### 快速測試（推薦用於開發）

```bash
npm run test:quick
```

### 生成覆蓋率報告

```bash
npm run test:coverage
```

### 監視模式

```bash
npm run test:watch
```

## 測試命令詳解

### 使用測試執行器

我們提供了自訂的測試執行器 `run-tests.js`，提供更好的控制和報告：

```bash
# 執行所有測試
node run-tests.js all

# 執行特定套件
node run-tests.js unit
node run-tests.js integration
node run-tests.js e2e
node run-tests.js compliance

# 快速測試（只執行單元測試和合規性測試）
node run-tests.js quick

# 監視模式
node run-tests.js watch

# 生成覆蓋率報告
node run-tests.js coverage

# 自訂選項
node run-tests.js all --no-coverage --bail --report=./custom-report.json
```

### 直接使用 Jest

如果你偏好直接使用 Jest：

```bash
# 執行所有測試
npm run test:jest

# 執行特定模式的測試
npm run test:jest-unit
npm run test:jest-integration

# 覆蓋率報告
npm run test:jest-coverage

# 監視模式
npm run test:jest-watch
```

## 測試結構

### 單元測試

```
tests/unit/
├── permission-analyzer.test.js          # 權限分析器測試
├── permission-description-generator.test.js  # 權限描述生成器測試
└── manifest-updater.test.js             # Manifest 更新器測試
```

### 整合測試

```
tests/integration/
└── permission-fix-workflow.test.js      # 完整權限修正工作流程測試
```

### 端到端測試

```
tests/e2e/
└── chrome-extension-e2e.test.js         # Chrome 擴充功能端到端測試
```

### 合規性測試

```
tests/compliance/
└── chrome-store-compliance.test.js      # Chrome Web Store 合規性測試
```

## 測試配置

### Jest 配置

主要配置在 `jest.config.js`：

- 測試環境：jsdom
- 覆蓋率閾值：70%
- 超時時間：10 秒
- 設定檔案：`tests/setup.js`

### 測試設定

`tests/setup.js` 提供：

- Chrome 擴充功能 API 模擬
- DOM 環境模擬
- 全域測試工具函數
- 清理函數

## 編寫測試

### 測試命名規範

- 測試檔案：`*.test.js`
- 測試描述：使用中文，清楚描述測試目的
- 測試分組：使用 `describe` 組織相關測試

### 範例測試

```javascript
describe('權限分析器測試', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new PermissionAnalyzer();
  });

  test('應該正確分析 manifest 檔案', () => {
    const manifest = createMockManifest();
    const result = analyzer.analyzeManifest(manifest);
    
    expect(result.hasPermissions).toBe(true);
    expect(result.permissions).toContain('activeTab');
  });
});
```

### 模擬和工具

使用全域工具函數：

```javascript
// 創建模擬的 manifest
const manifest = createMockManifest({
  permissions: ['activeTab', 'scripting']
});

// 創建測試目錄
const testDir = createTestDirectory(__dirname, 'test-data');

// 清理測試目錄
cleanupTestDirectory(testDir);
```

## 持續整合

### 預提交檢查

使用 Husky 在提交前自動執行測試：

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:unit"
    }
  }
}
```

### GitHub Actions

建議的 CI/CD 工作流程：

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:quick
      - run: npm run test:compliance
```

## 測試報告

### 自動生成報告

測試執行器會自動生成：

- JSON 報告：`test-results.json`
- Markdown 報告：`test-results.md`
- 覆蓋率報告：`coverage/` 目錄

### 報告內容

- 測試統計（通過/失敗/跳過）
- 執行時間
- 覆蓋率資訊
- 錯誤詳情
- 各測試套件結果

## 故障排除

### 常見問題

1. **測試超時**
   - 增加 `jest.setTimeout()` 值
   - 檢查異步操作是否正確處理

2. **模擬問題**
   - 確保在 `tests/setup.js` 中正確設定模擬
   - 使用 `jest.clearAllMocks()` 清理模擬狀態

3. **檔案系統測試**
   - 使用臨時目錄進行檔案操作測試
   - 確保在測試後清理檔案

### 除錯技巧

```javascript
// 啟用詳細輸出
npm run test:jest -- --verbose

// 執行特定測試
npm run test:jest -- --testNamePattern="應該正確分析"

// 除錯模式
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 最佳實踐

1. **測試隔離**：每個測試應該獨立，不依賴其他測試的狀態
2. **清楚的斷言**：使用描述性的斷言訊息
3. **邊界測試**：測試邊界條件和錯誤情況
4. **模擬外部依賴**：避免測試依賴外部服務
5. **定期更新**：保持測試與程式碼同步更新

## 貢獻指南

1. 新功能必須包含對應的測試
2. 測試覆蓋率不得低於 70%
3. 所有測試必須通過才能合併
4. 使用中文編寫測試描述和註解

## 相關資源

- [Jest 官方文檔](https://jestjs.io/docs/getting-started)
- [Chrome 擴充功能測試指南](https://developer.chrome.com/docs/extensions/mv3/tut_testing/)
- [Chrome Web Store 政策](https://developer.chrome.com/docs/webstore/program-policies/)