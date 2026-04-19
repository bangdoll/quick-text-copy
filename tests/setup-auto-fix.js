/**
 * 自動修正測試設定檔案
 * 為自動修正測試提供全域設定和工具函數
 */

const fs = require('fs');
const path = require('path');

// 全域測試設定
global.AUTO_FIX_TEST_CONFIG = {
  // 測試超時時間
  DEFAULT_TIMEOUT: 10000,
  
  // 測試目錄前綴
  TEST_DIR_PREFIX: 'auto-fix-test-',
  
  // 備份目錄
  BACKUP_DIR: './backups/test-backups',
  
  // 日誌等級
  LOG_LEVEL: 'error', // 測試時只顯示錯誤
  
  // 測試模式標記
  IS_TEST_MODE: true
};

// 全域測試工具函數
global.testUtils = {
  /**
   * 建立測試目錄
   */
  createTestDir: (suffix = '') => {
    const testDir = `${global.AUTO_FIX_TEST_CONFIG.TEST_DIR_PREFIX}${Date.now()}${suffix}`;
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    return testDir;
  },

  /**
   * 清理測試目錄
   */
  cleanupTestDir: (testDir) => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  },

  /**
   * 建立測試用的 manifest.json
   */
  createTestManifest: (testDir, customFields = {}) => {
    const defaultManifest = {
      "manifest_version": 3,
      "name": "Test Extension",
      "version": "1.0.0",
      "description": "測試用擴充功能",
      "permissions": ["activeTab", "scripting"],
      "host_permissions": ["<all_urls>"],
      "action": {
        "default_popup": "popup.html"
      },
      "background": {
        "service_worker": "service-worker.js"
      }
    };

    const manifest = { ...defaultManifest, ...customFields };
    const manifestPath = path.join(testDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    return { manifest, manifestPath };
  },

  /**
   * 建立測試用的 service-worker.js
   */
  createTestServiceWorker: (testDir, content = null) => {
    const defaultContent = `
      // Test Service Worker
      chrome.action.onClicked.addListener((tab) => {
        console.log('Test extension clicked');
      });
    `;

    const serviceWorkerContent = content || defaultContent;
    const serviceWorkerPath = path.join(testDir, 'service-worker.js');
    fs.writeFileSync(serviceWorkerPath, serviceWorkerContent);
    
    return { content: serviceWorkerContent, path: serviceWorkerPath };
  },

  /**
   * 建立完整的測試擴充功能結構
   */
  createTestExtension: (testDir, options = {}) => {
    const { manifest } = testUtils.createTestManifest(testDir, options.manifest);
    const { content: serviceWorkerContent } = testUtils.createTestServiceWorker(
      testDir, 
      options.serviceWorker
    );

    // 建立其他可選檔案
    if (options.includePopup !== false) {
      const popupPath = path.join(testDir, 'popup.html');
      fs.writeFileSync(popupPath, `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Test Popup</title>
        </head>
        <body>
          <h1>Test Extension</h1>
          <button id="test-btn">Test Button</button>
        </body>
        </html>
      `);
    }

    if (options.includeIcons) {
      const iconsDir = path.join(testDir, 'icons');
      fs.mkdirSync(iconsDir, { recursive: true });
      
      // 建立假的圖示檔案（空檔案）
      ['icon16.png', 'icon48.png', 'icon128.png'].forEach(iconFile => {
        fs.writeFileSync(path.join(iconsDir, iconFile), '');
      });
    }

    return {
      testDir,
      manifest,
      serviceWorkerContent,
      files: fs.readdirSync(testDir)
    };
  },

  /**
   * 比較兩個 manifest 物件
   */
  compareManifests: (manifest1, manifest2, ignoreFields = []) => {
    const clean1 = { ...manifest1 };
    const clean2 = { ...manifest2 };
    
    ignoreFields.forEach(field => {
      delete clean1[field];
      delete clean2[field];
    });

    return JSON.stringify(clean1, Object.keys(clean1).sort()) === 
           JSON.stringify(clean2, Object.keys(clean2).sort());
  },

  /**
   * 等待指定時間
   */
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * 檢查檔案是否存在且內容符合預期
   */
  validateFile: (filePath, expectedContent = null, shouldExist = true) => {
    const exists = fs.existsSync(filePath);
    
    if (shouldExist && !exists) {
      throw new Error(`檔案應該存在但不存在: ${filePath}`);
    }
    
    if (!shouldExist && exists) {
      throw new Error(`檔案不應該存在但存在: ${filePath}`);
    }
    
    if (expectedContent && exists) {
      const actualContent = fs.readFileSync(filePath, 'utf8');
      if (actualContent !== expectedContent) {
        throw new Error(`檔案內容不符合預期: ${filePath}`);
      }
    }
    
    return exists;
  },

  /**
   * 模擬檔案系統錯誤
   */
  simulateFileSystemError: (originalMethod, errorMessage) => {
    return () => {
      throw new Error(errorMessage);
    };
  }
};

// 設定測試環境變數
process.env.NODE_ENV = 'test';
process.env.AUTO_FIX_TEST_MODE = 'true';

// 設定全域錯誤處理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的 Promise 拒絕:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('未捕獲的例外:', error);
});

// Jest 全域設定
beforeAll(() => {
  // 建立測試備份目錄
  if (!fs.existsSync(global.AUTO_FIX_TEST_CONFIG.BACKUP_DIR)) {
    fs.mkdirSync(global.AUTO_FIX_TEST_CONFIG.BACKUP_DIR, { recursive: true });
  }
});

afterAll(() => {
  // 清理測試備份目錄
  if (fs.existsSync(global.AUTO_FIX_TEST_CONFIG.BACKUP_DIR)) {
    fs.rmSync(global.AUTO_FIX_TEST_CONFIG.BACKUP_DIR, { recursive: true, force: true });
  }
  
  // 清理所有測試目錄
  const currentDir = process.cwd();
  const files = fs.readdirSync(currentDir);
  
  files.forEach(file => {
    if (file.startsWith(global.AUTO_FIX_TEST_CONFIG.TEST_DIR_PREFIX)) {
      const fullPath = path.join(currentDir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
    }
  });
  
  // 清理測試日誌檔案
  files.forEach(file => {
    if (file.includes('auto-fix-engine-') && file.endsWith('.log')) {
      fs.unlinkSync(file);
    }
    if (file.includes('automated-fix-executor-') && file.endsWith('.log')) {
      fs.unlinkSync(file);
    }
  });
});

// 每個測試前的設定
beforeEach(() => {
  // 重置控制台輸出（避免測試輸出干擾）
  if (global.AUTO_FIX_TEST_CONFIG.LOG_LEVEL === 'error') {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  }
});

// 每個測試後的清理
afterEach(() => {
  // 恢復控制台輸出
  if (console.log.mockRestore) {
    console.log.mockRestore();
  }
  if (console.info.mockRestore) {
    console.info.mockRestore();
  }
  if (console.warn.mockRestore) {
    console.warn.mockRestore();
  }
});

// 匯出測試工具
module.exports = {
  testUtils: global.testUtils,
  testConfig: global.AUTO_FIX_TEST_CONFIG
};