// Jest 測試環境設定檔案

// 設定測試超時時間
jest.setTimeout(15000);

// 全域測試設定
global.console = {
  ...console,
  // 在測試中隱藏某些日誌
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 模擬 Chrome 擴充功能 API
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    onInstalled: {
      addListener: jest.fn()
    },
    onStartup: {
      addListener: jest.fn()
    },
    getManifest: jest.fn(() => ({
      version: '1.0.5',
      name: 'Quick Text Copy',
    })),
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
    create: jest.fn(),
    executeScript: jest.fn()
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
    },
  },
  action: {
    onClicked: {
      addListener: jest.fn(),
    },
  },
  scripting: {
    executeScript: jest.fn()
  }
};

// 模擬 DOM 環境
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com',
    origin: 'https://example.com',
    hostname: 'example.com'
  },
  writable: true,
});

// 模擬 clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(undefined)
  },
  writable: true
});

// 模擬 fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve('// Mock OpenCC library code'),
    json: () => Promise.resolve({})
  })
);

// 全域測試工具函數
global.createMockManifest = (overrides = {}) => {
  return {
    manifest_version: 3,
    name: 'Test Extension',
    version: '1.0.0',
    description: 'Test extension description',
    permissions: ['activeTab', 'scripting'],
    host_permissions: ['https://cdn.jsdelivr.net/*'],
    permissions_description: '此擴充功能需要權限來提供複製功能，我們不會收集或儲存任何個人資料。',
    host_permissions_description: '需要存取 CDN 來載入 OpenCC 轉換函式庫，不會傳送任何使用者資料。',
    ...overrides
  };
};

// 創建測試目錄的輔助函數
global.createTestDirectory = (basePath, name) => {
  const fs = require('fs');
  const path = require('path');
  
  const testDir = path.join(basePath, name);
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  return testDir;
};

// 清理測試目錄的輔助函數
global.cleanupTestDirectory = (dirPath) => {
  const fs = require('fs');
  
  if (fs.existsSync(dirPath)) {
    const removeDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = require('path').join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          removeDirectory(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      });
      fs.rmdirSync(dir);
    };
    
    removeDirectory(dirPath);
  }
};

// 模擬 OpenCC 函式庫
global.mockOpenCC = {
  Converter: jest.fn(() => ({
    convert: jest.fn((text) => text.replace(/简/g, '簡').replace(/体/g, '體'))
  }))
};

// 測試前清理
beforeEach(() => {
  jest.clearAllMocks();
});

// 測試後清理
afterEach(() => {
  jest.restoreAllMocks();
  
  // 重置 fetch mock
  if (global.fetch && global.fetch.mockClear) {
    global.fetch.mockClear();
  }
});