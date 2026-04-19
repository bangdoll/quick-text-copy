/**
 * Jest 配置 - 自動修正測試專用
 */

module.exports = {
  // 測試環境
  testEnvironment: 'node',
  
  // 測試檔案模式 - 只針對自動修正相關測試
  testMatch: [
    '<rootDir>/tests/unit/auto-fix-*.test.js'
  ],
  
  // 覆蓋率設定
  collectCoverage: true,
  collectCoverageFrom: [
    'auto-fix-engine.js',
    'automated-fix-executor.js',
    'automated-permissions-fix.js',
    'manifest-updater.js',
    '!node_modules/**',
    '!tests/**',
    '!coverage/**'
  ],
  
  // 覆蓋率報告格式
  coverageReporters: [
    'text',
    'html',
    'lcov',
    'json-summary'
  ],
  
  // 覆蓋率輸出目錄
  coverageDirectory: 'coverage/auto-fix',
  
  // 覆蓋率閾值
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './auto-fix-engine.js': {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60
    },
    './automated-fix-executor.js': {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  
  // 測試超時時間 (30秒)
  testTimeout: 30000,
  
  // 詳細輸出
  verbose: true,
  
  // 清除模擬
  clearMocks: true,
  
  // 重置模擬
  resetMocks: true,
  
  // 恢復模擬
  restoreMocks: true,
  
  // 設定檔案
  setupFilesAfterEnv: ['<rootDir>/tests/setup-auto-fix.js'],
  
  // 全域變數
  globals: {
    'AUTO_FIX_TEST_MODE': true
  },
  
  // 模組路徑對應
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // 忽略的檔案模式
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/'
  ],
  
  // 轉換忽略模式
  transformIgnorePatterns: [
    '/node_modules/(?!(some-es6-module)/)'
  ],
  
  // 錯誤處理
  errorOnDeprecated: true,
  
  // 快照序列化器
  snapshotSerializers: [],
  
  // 測試結果處理器
  testResultsProcessor: undefined,
  
  // 監視模式忽略模式
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/',
    '\\.log$',
    '\\.backup\\.'
  ],
  
  // 強制退出
  forceExit: true,
  
  // 檢測開放句柄
  detectOpenHandles: true,
  
  // 最大工作進程數
  maxWorkers: 2
};