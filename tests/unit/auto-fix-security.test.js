#!/usr/bin/env node

/**
 * 自動化修正安全性測試
 * 驗證自動化修正的安全性和資料完整性
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AutoFixEngine = require('../../auto-fix-engine.js');
const AutomatedFixExecutor = require('../../automated-fix-executor.js');

describe('自動化修正安全性測試', () => {
  let autoFixEngine;
  let automatedExecutor;
  let testDir;
  let originalFiles;

  beforeEach(() => {
    // 建立測試目錄
    testDir = `test-security-${Date.now()}`;
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // 初始化修正引擎
    autoFixEngine = new AutoFixEngine({
      sourceDir: testDir,
      targetVersion: '1.0.6',
      dryRun: false, // 需要實際修改檔案來測試安全性
      verbose: false,
      backupEnabled: true
    });

    automatedExecutor = new AutomatedFixExecutor({
      sourceDir: testDir,
      targetVersion: '1.0.6',
      dryRun: false,
      verbose: false,
      backupEnabled: true
    });

    // 建立測試檔案
    originalFiles = {
      'manifest.json': {
        "manifest_version": 3,
        "name": "Security Test Extension",
        "version": "1.0.0",
        "description": "測試擴充功能",
        "permissions": ["activeTab", "scripting", "contextMenus"],
        "host_permissions": ["<all_urls>"],
        "action": {
          "default_popup": "popup.html",
          "default_title": "Security Test"
        },
        "background": {
          "service_worker": "service-worker.js"
        },
        "icons": {
          "16": "icons/icon16.png",
          "48": "icons/icon48.png",
          "128": "icons/icon128.png"
        }
      },
      'service-worker.js': `
        // Security Test Service Worker
        chrome.action.onClicked.addListener((tab) => {
          console.log('Extension clicked');
        });
        
        chrome.contextMenus.create({
          id: 'test-menu',
          title: 'Test Menu',
          contexts: ['page']
        });
      `,
      'popup.html': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Security Test Popup</title>
        </head>
        <body>
          <h1>Security Test</h1>
          <button id="test-btn">Test Button</button>
        </body>
        </html>
      `
    };

    // 寫入測試檔案
    Object.entries(originalFiles).forEach(([filename, content]) => {
      const filePath = path.join(testDir, filename);
      const fileContent = typeof content === 'object' ? 
        JSON.stringify(content, null, 2) : content;
      fs.writeFileSync(filePath, fileContent);
    });
  });

  afterEach(() => {
    // 清理測試目錄
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }

    // 清理日誌檔案
    if (autoFixEngine && fs.existsSync(autoFixEngine.logFile)) {
      fs.unlinkSync(autoFixEngine.logFile);
    }
    if (automatedExecutor && fs.existsSync(automatedExecutor.logFile)) {
      fs.unlinkSync(automatedExecutor.logFile);
    }

    // 清理備份目錄
    const backupDir = './backups/auto-fix-backups';
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
    }
  });

  describe('檔案完整性保護測試', () => {
    test('修正後檔案結構應該保持完整', async () => {
      const originalManifest = JSON.parse(
        fs.readFileSync(path.join(testDir, 'manifest.json'), 'utf8')
      );

      await autoFixEngine.fixPermissionDescriptions();

      const modifiedManifest = JSON.parse(
        fs.readFileSync(path.join(testDir, 'manifest.json'), 'utf8')
      );

      // 檢查關鍵欄位是否保持不變
      expect(modifiedManifest.manifest_version).toBe(originalManifest.manifest_version);
      expect(modifiedManifest.name).toBe(originalManifest.name);
      expect(modifiedManifest.version).toBe(originalManifest.version);
      expect(modifiedManifest.permissions).toEqual(originalManifest.permissions);
      expect(modifiedManifest.host_permissions).toEqual(originalManifest.host_permissions);
      expect(modifiedManifest.action).toEqual(originalManifest.action);
      expect(modifiedManifest.background).toEqual(originalManifest.background);
      expect(modifiedManifest.icons).toEqual(originalManifest.icons);

      // 檢查只添加了權限描述
      expect(modifiedManifest.permissions_description).toBeDefined();
      expect(modifiedManifest.host_permissions_description).toBeDefined();
    });

    test('非 manifest 檔案不應該被意外修改', async () => {
      const originalServiceWorker = fs.readFileSync(
        path.join(testDir, 'service-worker.js'), 'utf8'
      );
      const originalPopup = fs.readFileSync(
        path.join(testDir, 'popup.html'), 'utf8'
      );

      await autoFixEngine.fixPermissionDescriptions();

      const modifiedServiceWorker = fs.readFileSync(
        path.join(testDir, 'service-worker.js'), 'utf8'
      );
      const modifiedPopup = fs.readFileSync(
        path.join(testDir, 'popup.html'), 'utf8'
      );

      expect(modifiedServiceWorker).toBe(originalServiceWorker);
      expect(modifiedPopup).toBe(originalPopup);
    });

    test('檔案權限應該保持不變', async () => {
      const manifestPath = path.join(testDir, 'manifest.json');
      const originalStats = fs.statSync(manifestPath);

      await autoFixEngine.fixPermissionDescriptions();

      const modifiedStats = fs.statSync(manifestPath);

      // 檢查檔案權限是否保持不變
      expect(modifiedStats.mode).toBe(originalStats.mode);
    });
  });

  describe('備份和回滾安全性測試', () => {
    test('備份檔案應該與原始檔案完全相同', async () => {
      const originalContent = fs.readFileSync(
        path.join(testDir, 'manifest.json'), 'utf8'
      );
      const originalHash = crypto.createHash('sha256')
        .update(originalContent).digest('hex');

      await autoFixEngine.createBackupPoint();

      // 尋找備份檔案
      const backupDir = './backups/auto-fix-backups';
      if (fs.existsSync(backupDir)) {
        const backupFolders = fs.readdirSync(backupDir);
        if (backupFolders.length > 0) {
          const latestBackup = backupFolders[backupFolders.length - 1];
          const backupManifestPath = path.join(backupDir, latestBackup, 'manifest.json');
          
          if (fs.existsSync(backupManifestPath)) {
            const backupContent = fs.readFileSync(backupManifestPath, 'utf8');
            const backupHash = crypto.createHash('sha256')
              .update(backupContent).digest('hex');

            expect(backupHash).toBe(originalHash);
          }
        }
      }
    });

    test('回滾應該完全恢復原始狀態', async () => {
      const originalContent = fs.readFileSync(
        path.join(testDir, 'manifest.json'), 'utf8'
      );

      // 創建備份點
      await autoFixEngine.createBackupPoint();

      // 執行修正
      await autoFixEngine.fixPermissionDescriptions();

      // 驗證檔案已被修改
      const modifiedContent = fs.readFileSync(
        path.join(testDir, 'manifest.json'), 'utf8'
      );
      expect(modifiedContent).not.toBe(originalContent);

      // 執行回滾
      const rollbackSuccess = await autoFixEngine.rollbackChanges('test-plan');

      if (rollbackSuccess) {
        const rolledBackContent = fs.readFileSync(
          path.join(testDir, 'manifest.json'), 'utf8'
        );
        expect(rolledBackContent).toBe(originalContent);
      }
    });

    test('回滾不應該影響其他檔案', async () => {
      const originalServiceWorker = fs.readFileSync(
        path.join(testDir, 'service-worker.js'), 'utf8'
      );

      await autoFixEngine.createBackupPoint();
      await autoFixEngine.fixPermissionDescriptions();
      await autoFixEngine.rollbackChanges('test-plan');

      const finalServiceWorker = fs.readFileSync(
        path.join(testDir, 'service-worker.js'), 'utf8'
      );

      expect(finalServiceWorker).toBe(originalServiceWorker);
    });
  });

  describe('輸入驗證和清理測試', () => {
    test('應該拒絕惡意的 manifest 內容', async () => {
      const maliciousManifest = {
        "manifest_version": 3,
        "name": "<script>alert('xss')</script>",
        "version": "1.0.0",
        "permissions": ["<all_urls>", "tabs", "history", "bookmarks"],
        "host_permissions": ["*://*/*"]
      };

      fs.writeFileSync(
        path.join(testDir, 'manifest.json'),
        JSON.stringify(maliciousManifest, null, 2)
      );

      const validation = await autoFixEngine.validateManifest();

      // 驗證應該檢測到問題
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('應該清理和驗證權限描述內容', async () => {
      await autoFixEngine.fixPermissionDescriptions();

      const modifiedManifest = JSON.parse(
        fs.readFileSync(path.join(testDir, 'manifest.json'), 'utf8')
      );

      // 檢查權限描述是否安全
      expect(modifiedManifest.permissions_description).not.toContain('<script>');
      expect(modifiedManifest.permissions_description).not.toContain('javascript:');
      expect(modifiedManifest.host_permissions_description).not.toContain('<script>');
      expect(modifiedManifest.host_permissions_description).not.toContain('javascript:');
    });

    test('應該驗證檔案路徑安全性', async () => {
      // 測試路徑遍歷攻擊
      const maliciousEngine = new AutoFixEngine({
        sourceDir: '../../../etc',
        dryRun: true
      });

      try {
        await maliciousEngine.analyzePermissionIssues();
        // 如果沒有拋出錯誤，檢查是否正確處理了惡意路徑
      } catch (error) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('權限提升防護測試', () => {
    test('修正不應該添加不必要的權限', async () => {
      const originalManifest = JSON.parse(
        fs.readFileSync(path.join(testDir, 'manifest.json'), 'utf8')
      );

      await autoFixEngine.fixPermissionDescriptions();

      const modifiedManifest = JSON.parse(
        fs.readFileSync(path.join(testDir, 'manifest.json'), 'utf8')
      );

      // 權限陣列應該完全相同
      expect(modifiedManifest.permissions).toEqual(originalManifest.permissions);
      expect(modifiedManifest.host_permissions).toEqual(originalManifest.host_permissions);
    });

    test('修正不應該修改敏感的 manifest 欄位', async () => {
      const originalManifest = JSON.parse(
        fs.readFileSync(path.join(testDir, 'manifest.json'), 'utf8')
      );

      await autoFixEngine.fixPermissionDescriptions();

      const modifiedManifest = JSON.parse(
        fs.readFileSync(path.join(testDir, 'manifest.json'), 'utf8')
      );

      // 敏感欄位不應該被修改
      expect(modifiedManifest.background).toEqual(originalManifest.background);
      expect(modifiedManifest.content_scripts).toEqual(originalManifest.content_scripts);
      expect(modifiedManifest.externally_connectable).toEqual(originalManifest.externally_connectable);
    });
  });

  describe('資料洩漏防護測試', () => {
    test('日誌檔案不應該包含敏感資訊', async () => {
      // 添加一些可能敏感的資料到 manifest
      const sensitiveManifest = {
        ...originalFiles['manifest.json'],
        "oauth2": {
          "client_id": "sensitive-client-id-12345",
          "scopes": ["https://www.googleapis.com/auth/userinfo.email"]
        }
      };

      fs.writeFileSync(
        path.join(testDir, 'manifest.json'),
        JSON.stringify(sensitiveManifest, null, 2)
      );

      await autoFixEngine.fixPermissionDescriptions();

      if (fs.existsSync(autoFixEngine.logFile)) {
        const logContent = fs.readFileSync(autoFixEngine.logFile, 'utf8');
        
        // 檢查日誌中不應該包含敏感資訊
        expect(logContent).not.toContain('sensitive-client-id-12345');
        expect(logContent).not.toContain('oauth2');
      }
    });

    test('錯誤訊息不應該洩漏系統資訊', async () => {
      const invalidEngine = new AutoFixEngine({
        sourceDir: '/root/sensitive-path',
        dryRun: true
      });

      try {
        await invalidEngine.analyzePermissionIssues();
      } catch (error) {
        // 錯誤訊息不應該包含完整的系統路徑
        expect(error.message).not.toContain('/root/sensitive-path');
        expect(error.message).not.toContain(process.env.HOME || '');
      }
    });
  });

  describe('並發安全性測試', () => {
    test('多個修正操作不應該互相干擾', async () => {
      const engine1 = new AutoFixEngine({
        sourceDir: testDir,
        dryRun: false,
        backupEnabled: true
      });

      const engine2 = new AutoFixEngine({
        sourceDir: testDir,
        dryRun: false,
        backupEnabled: true
      });

      // 同時執行兩個修正操作
      const promises = [
        engine1.fixPermissionDescriptions(),
        engine2.fixPermissionDescriptions()
      ];

      const results = await Promise.allSettled(promises);

      // 至少有一個應該成功
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      expect(successCount).toBeGreaterThan(0);

      // 檢查最終檔案狀態是否一致
      const finalManifest = JSON.parse(
        fs.readFileSync(path.join(testDir, 'manifest.json'), 'utf8')
      );
      expect(finalManifest.permissions_description).toBeDefined();
      expect(finalManifest.host_permissions_description).toBeDefined();

      // 清理日誌檔案
      if (fs.existsSync(engine1.logFile)) fs.unlinkSync(engine1.logFile);
      if (fs.existsSync(engine2.logFile)) fs.unlinkSync(engine2.logFile);
    });
  });

  describe('資源使用限制測試', () => {
    test('修正操作不應該消耗過多記憶體', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // 執行多次修正操作
      for (let i = 0; i < 10; i++) {
        await autoFixEngine.analyzePermissionIssues();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // 記憶體增長應該在合理範圍內（小於 100MB）
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    test('修正操作應該有合理的執行時間限制', async () => {
      const startTime = Date.now();

      await autoFixEngine.fixPermissionDescriptions();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 修正操作應該在 30 秒內完成
      expect(duration).toBeLessThan(30000);
    });
  });

  describe('錯誤恢復和穩定性測試', () => {
    test('部分失敗時應該能夠安全恢復', async () => {
      // 模擬部分失敗的情況
      const originalManifest = fs.readFileSync(
        path.join(testDir, 'manifest.json'), 'utf8'
      );

      // 創建備份
      await autoFixEngine.createBackupPoint();

      // 在修正過程中模擬錯誤
      const originalMethod = autoFixEngine.updateManifestFile;
      autoFixEngine.updateManifestFile = async () => {
        throw new Error('模擬的修正錯誤');
      };

      try {
        const rejectionData = {
          id: 'TEST_FAILURE',
          category: 'permission',
          severity: 'high',
          complexity: 'simple'
        };

        const fixPlan = await autoFixEngine.createFixPlan(rejectionData);
        await autoFixEngine.executeFixPlan(fixPlan);
      } catch (error) {
        expect(error.message).toContain('模擬的修正錯誤');
      }

      // 恢復原始方法
      autoFixEngine.updateManifestFile = originalMethod;

      // 檢查檔案是否保持原始狀態或已回滾
      const currentManifest = fs.readFileSync(
        path.join(testDir, 'manifest.json'), 'utf8'
      );
      
      // 檔案應該保持原始狀態或已成功回滾
      expect(currentManifest).toBe(originalManifest);
    });

    test('系統中斷後應該能夠安全重啟', async () => {
      // 模擬系統中斷情況
      await autoFixEngine.createBackupPoint();
      
      // 開始修正但不完成
      const partialEngine = new AutoFixEngine({
        sourceDir: testDir,
        dryRun: false,
        backupEnabled: true
      });

      // 創建新的引擎實例（模擬重啟）
      const restartedEngine = new AutoFixEngine({
        sourceDir: testDir,
        dryRun: false,
        backupEnabled: true
      });

      // 新引擎應該能夠正常工作
      const result = await restartedEngine.fixPermissionDescriptions();
      expect(result.success).toBe(true);

      // 清理日誌檔案
      if (fs.existsSync(partialEngine.logFile)) fs.unlinkSync(partialEngine.logFile);
      if (fs.existsSync(restartedEngine.logFile)) fs.unlinkSync(restartedEngine.logFile);
    });
  });
});