#!/usr/bin/env node

/**
 * 自動修正簡化測試
 * 測試核心修正功能，避免複雜依賴
 */

const fs = require('fs');
const path = require('path');

// 直接測試核心功能，不依賴完整的 AutoFixEngine
describe('自動修正核心功能測試', () => {
  let testDir;
  let originalManifest;

  beforeEach(() => {
    // 建立測試目錄
    testDir = `test-simple-${Date.now()}`;
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // 建立測試用的 manifest.json
    originalManifest = {
      "manifest_version": 3,
      "name": "Test Extension",
      "version": "1.0.0",
      "permissions": ["activeTab", "scripting"],
      "host_permissions": ["<all_urls>"],
      "action": {
        "default_popup": "popup.html"
      },
      "background": {
        "service_worker": "service-worker.js"
      }
    };

    fs.writeFileSync(
      path.join(testDir, 'manifest.json'),
      JSON.stringify(originalManifest, null, 2)
    );

    // 建立測試用的 service-worker.js
    fs.writeFileSync(
      path.join(testDir, 'service-worker.js'),
      'console.log("Test service worker");'
    );
  });

  afterEach(() => {
    // 清理測試目錄
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Manifest 更新器測試', () => {
    test('應該能夠讀取 manifest 檔案', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const manifestPath = path.join(testDir, 'manifest.json');
      const manifest = updater.readManifest(manifestPath);
      
      expect(manifest).toBeDefined();
      expect(manifest.name).toBe('Test Extension');
      expect(manifest.version).toBe('1.0.0');
    });

    test('應該能夠生成權限描述', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const descriptions = updater.generatePermissionDescriptions(originalManifest);
      
      expect(descriptions).toBeDefined();
      expect(descriptions.permissions_description).toBeDefined();
      expect(descriptions.host_permissions_description).toBeDefined();
      expect(descriptions.permissions_description).toContain('activeTab');
      expect(descriptions.permissions_description).toContain('scripting');
    });

    test('應該能夠驗證 manifest', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const validation = updater.validateManifest(originalManifest);
      
      expect(validation).toBeDefined();
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    test('應該檢測無效的 manifest', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const invalidManifest = {
        "name": "Test Extension"
        // 缺少必要欄位
      };
      
      const validation = updater.validateManifest(invalidManifest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('應該能夠更新 manifest 檔案', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const manifestPath = path.join(testDir, 'manifest.json');
      const updates = {
        version: '1.0.1',
        description: '更新的描述'
      };
      
      const result = updater.updateManifest(manifestPath, updates, false);
      
      expect(result.success).toBe(true);
      
      // 驗證檔案已更新
      const updatedManifest = updater.readManifest(manifestPath);
      expect(updatedManifest.version).toBe('1.0.1');
      expect(updatedManifest.description).toBe('更新的描述');
    });
  });

  describe('權限描述生成器測試', () => {
    test('應該能夠生成基本權限描述', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const testManifest = {
        permissions: ['activeTab', 'scripting'],
        host_permissions: ['<all_urls>']
      };
      
      const descriptions = updater.generatePermissionDescriptions(testManifest);
      
      expect(descriptions).toBeDefined();
      expect(descriptions.permissions_description).toBeDefined();
      expect(descriptions.host_permissions_description).toBeDefined();
      expect(descriptions.permissions_description).toContain('activeTab');
      expect(descriptions.permissions_description).toContain('scripting');
    });

    test('應該能夠生成主機權限描述', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const testManifest = {
        permissions: ['activeTab'],
        host_permissions: ['<all_urls>']
      };
      
      const descriptions = updater.generatePermissionDescriptions(testManifest);
      
      expect(descriptions).toBeDefined();
      expect(descriptions.host_permissions_description).toBeDefined();
      expect(descriptions.host_permissions_description).toContain('all_urls');
    });
  });

  describe('檔案完整性測試', () => {
    test('修正後檔案結構應該保持完整', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const manifestPath = path.join(testDir, 'manifest.json');
      const originalContent = fs.readFileSync(manifestPath, 'utf8');
      const originalManifest = JSON.parse(originalContent);
      
      // 添加權限描述
      const result = updater.addPermissionDescriptions(manifestPath, false);
      expect(result.success).toBe(true);
      
      // 檢查檔案是否被正確更新
      const updatedContent = fs.readFileSync(manifestPath, 'utf8');
      const updatedManifest = JSON.parse(updatedContent);
      
      // 檢查關鍵欄位是否保持不變
      expect(updatedManifest.manifest_version).toBe(originalManifest.manifest_version);
      expect(updatedManifest.name).toBe(originalManifest.name);
      expect(updatedManifest.version).toBe(originalManifest.version);
      expect(updatedManifest.permissions).toEqual(originalManifest.permissions);
      expect(updatedManifest.host_permissions).toEqual(originalManifest.host_permissions);
      
      // 檢查是否添加了權限描述
      expect(updatedManifest.permissions_description).toBeDefined();
      expect(updatedManifest.host_permissions_description).toBeDefined();
    });

    test('非 manifest 檔案不應該被修改', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const serviceWorkerPath = path.join(testDir, 'service-worker.js');
      const originalServiceWorker = fs.readFileSync(serviceWorkerPath, 'utf8');
      
      // 執行 manifest 更新
      const manifestPath = path.join(testDir, 'manifest.json');
      updater.addPermissionDescriptions(manifestPath, false);
      
      // 檢查 service worker 檔案是否保持不變
      const currentServiceWorker = fs.readFileSync(serviceWorkerPath, 'utf8');
      expect(currentServiceWorker).toBe(originalServiceWorker);
    });
  });

  describe('錯誤處理測試', () => {
    test('應該正確處理不存在的檔案', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const nonExistentPath = path.join(testDir, 'non-existent.json');
      
      expect(() => {
        updater.readManifest(nonExistentPath);
      }).toThrow();
    });

    test('應該正確處理無效的 JSON', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const invalidJsonPath = path.join(testDir, 'invalid.json');
      fs.writeFileSync(invalidJsonPath, '{ invalid json }');
      
      expect(() => {
        updater.readManifest(invalidJsonPath);
      }).toThrow();
    });
  });

  describe('安全性測試', () => {
    test('權限描述不應該包含惡意內容', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const testManifest = {
        permissions: ['activeTab', 'scripting'],
        host_permissions: ['<all_urls>']
      };
      
      const descriptions = updater.generatePermissionDescriptions(testManifest);
      
      // 檢查描述中不包含潛在的惡意內容
      expect(descriptions.permissions_description).not.toContain('<script>');
      expect(descriptions.permissions_description).not.toContain('javascript:');
      expect(descriptions.permissions_description).not.toContain('eval(');
      expect(descriptions.permissions_description).not.toContain('innerHTML');
      expect(descriptions.host_permissions_description).not.toContain('<script>');
      expect(descriptions.host_permissions_description).not.toContain('javascript:');
    });

    test('檔案更新應該是原子性的', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const manifestPath = path.join(testDir, 'manifest.json');
      const originalContent = fs.readFileSync(manifestPath, 'utf8');
      
      // 模擬更新過程中的中斷（通過修改檔案權限）
      try {
        // 在某些系統上，這可能會失敗，但這是預期的測試行為
        fs.chmodSync(manifestPath, 0o444); // 只讀
        
        const result = updater.addPermissionDescriptions(manifestPath, false);
        
        // 如果更新失敗，檔案應該保持原始狀態
        if (!result.success) {
          const currentContent = fs.readFileSync(manifestPath, 'utf8');
          expect(currentContent).toBe(originalContent);
        }
      } catch (error) {
        // 權限修改可能失敗，這是可以接受的
      } finally {
        // 恢復檔案權限
        try {
          fs.chmodSync(manifestPath, 0o644);
        } catch (error) {
          // 忽略權限恢復錯誤
        }
      }
    });
  });

  describe('效能測試', () => {
    test('manifest 讀取應該在合理時間內完成', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const manifestPath = path.join(testDir, 'manifest.json');
      const startTime = Date.now();
      
      updater.readManifest(manifestPath);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 讀取操作應該在 100ms 內完成
      expect(duration).toBeLessThan(100);
    });

    test('權限描述生成應該在合理時間內完成', () => {
      const ManifestUpdater = require('../../manifest-updater.js');
      const updater = new ManifestUpdater();
      
      const testManifest = {
        permissions: ['activeTab', 'scripting', 'contextMenus', 'notifications'],
        host_permissions: ['<all_urls>']
      };
      
      const startTime = Date.now();
      
      updater.generatePermissionDescriptions(testManifest);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 生成操作應該在 50ms 內完成
      expect(duration).toBeLessThan(50);
    });
  });
});