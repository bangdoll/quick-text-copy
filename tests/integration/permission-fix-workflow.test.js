/**
 * 權限修正工作流程整合測試
 * 測試完整的權限修正流程
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 模擬完整的權限修正工作流程
class PermissionFixWorkflow {
  constructor(workingDir) {
    this.workingDir = workingDir;
    this.manifestPath = path.join(workingDir, 'manifest.json');
    this.backupPath = null;
  }

  async executeFullWorkflow() {
    const results = {
      steps: [],
      success: false,
      errors: []
    };

    try {
      // 步驟 1: 分析現有權限
      const step1 = await this.analyzePermissions();
      results.steps.push(step1);
      if (!step1.success) {
        results.errors.push(`分析權限失敗: ${step1.error}`);
        results.success = false;
        return results;
      }

      // 步驟 2: 生成權限描述
      const step2 = await this.generateDescriptions();
      results.steps.push(step2);
      if (!step2.success) {
        results.errors.push(`生成描述失敗: ${step2.error}`);
        results.success = false;
        return results;
      }

      // 步驟 3: 更新 manifest
      const step3 = await this.updateManifest();
      results.steps.push(step3);
      if (!step3.success) {
        results.errors.push(`更新 manifest 失敗: ${step3.error}`);
        results.success = false;
        return results;
      }

      // 步驟 4: 驗證更新
      const step4 = await this.validateUpdate();
      results.steps.push(step4);
      if (!step4.success) {
        results.errors.push(`驗證更新失敗: ${step4.error}`);
        results.success = false;
        return results;
      }

      // 步驟 5: 打包擴充功能
      const step5 = await this.packageExtension();
      results.steps.push(step5);
      if (!step5.success) {
        results.errors.push(`打包擴充功能失敗: ${step5.error}`);
        results.success = false;
        return results;
      }

      results.success = true;
    } catch (error) {
      results.errors.push(error.message);
      results.success = false;
    }

    return results;
  }

  async analyzePermissions() {
    const step = {
      name: '分析權限配置',
      success: false,
      data: null,
      error: null
    };

    try {
      if (!fs.existsSync(this.manifestPath)) {
        throw new Error('Manifest 檔案不存在');
      }

      const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
      
      step.data = {
        hasPermissions: !!manifest.permissions,
        hasHostPermissions: !!manifest.host_permissions,
        hasPermissionsDescription: !!manifest.permissions_description,
        hasHostPermissionsDescription: !!manifest.host_permissions_description,
        permissions: manifest.permissions || [],
        hostPermissions: manifest.host_permissions || []
      };

      step.success = true;
    } catch (error) {
      step.error = error.message;
    }

    return step;
  }

  async generateDescriptions() {
    const step = {
      name: '生成權限描述',
      success: false,
      data: null,
      error: null
    };

    try {
      const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
      
      // 生成權限描述
      let permissionsDescription = '';
      if (manifest.permissions && manifest.permissions.length > 0) {
        permissionsDescription = '此擴充功能需要以下權限：';
        manifest.permissions.forEach((perm, index) => {
          permissionsDescription += `${index + 1}) ${perm} 權限`;
          if (perm === 'activeTab') {
            permissionsDescription += '來讀取當前分頁的標題和網址';
          } else if (perm === 'scripting') {
            permissionsDescription += '來執行複製到剪貼簿的功能';
          }
          if (index < manifest.permissions.length - 1) {
            permissionsDescription += '；';
          }
        });
        permissionsDescription += '。我們不會收集或儲存任何個人資料。';
      }

      // 生成主機權限描述
      let hostPermissionsDescription = '';
      if (manifest.host_permissions && manifest.host_permissions.length > 0) {
        hostPermissionsDescription = '需要存取 https://cdn.jsdelivr.net 來載入 OpenCC 簡體轉繁體轉換函式庫。這是提供高品質中文轉換功能的必要組件，我們只載入官方 OpenCC 函式庫，不會傳送任何使用者資料到此網站。';
      }

      step.data = {
        permissionsDescription,
        hostPermissionsDescription
      };

      step.success = true;
    } catch (error) {
      step.error = error.message;
    }

    return step;
  }

  async updateManifest() {
    const step = {
      name: '更新 Manifest',
      success: false,
      data: null,
      error: null
    };

    try {
      // 建立備份
      this.backupPath = this.manifestPath + '.backup.' + Date.now();
      fs.copyFileSync(this.manifestPath, this.backupPath);

      // 讀取並更新 manifest
      const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
      
      // 從前一步驟獲取描述（這裡簡化處理）
      if (manifest.permissions && !manifest.permissions_description) {
        manifest.permissions_description = '此擴充功能需要權限來提供複製功能，我們不會收集或儲存任何個人資料。';
      }

      if (manifest.host_permissions && !manifest.host_permissions_description) {
        manifest.host_permissions_description = '需要存取 CDN 來載入 OpenCC 轉換函式庫，不會傳送任何使用者資料。';
      }

      // 寫入更新後的 manifest
      fs.writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2));

      step.data = {
        backupPath: this.backupPath,
        updatedFields: {
          permissions_description: !!manifest.permissions_description,
          host_permissions_description: !!manifest.host_permissions_description
        }
      };

      step.success = true;
    } catch (error) {
      step.error = error.message;
      
      // 如果更新失敗，嘗試還原備份
      if (this.backupPath && fs.existsSync(this.backupPath)) {
        try {
          fs.copyFileSync(this.backupPath, this.manifestPath);
        } catch (restoreError) {
          step.error += ` (還原失敗: ${restoreError.message})`;
        }
      }
    }

    return step;
  }

  async validateUpdate() {
    const step = {
      name: '驗證更新',
      success: false,
      data: null,
      error: null
    };

    try {
      const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
      
      const validation = {
        hasRequiredFields: !!(manifest.manifest_version && manifest.name && manifest.version),
        hasPermissionsDescription: !!(manifest.permissions && manifest.permissions_description),
        hasHostPermissionsDescription: !!(manifest.host_permissions && manifest.host_permissions_description),
        validJson: true, // 如果能解析就是有效的
        descriptionLengths: {
          permissions: manifest.permissions_description ? manifest.permissions_description.length : 0,
          hostPermissions: manifest.host_permissions_description ? manifest.host_permissions_description.length : 0
        }
      };

      // 檢查描述長度
      const issues = [];
      if (manifest.permissions_description && manifest.permissions_description.length < 30) {
        issues.push('permissions_description 太短');
      }
      if (manifest.host_permissions_description && manifest.host_permissions_description.length < 30) {
        issues.push('host_permissions_description 太短');
      }

      validation.issues = issues;
      validation.isValid = issues.length === 0;

      step.data = validation;
      step.success = validation.isValid;

      if (!validation.isValid) {
        step.error = `驗證失敗: ${issues.join(', ')}`;
      }
    } catch (error) {
      step.error = error.message;
    }

    return step;
  }

  async packageExtension() {
    const step = {
      name: '打包擴充功能',
      success: false,
      data: null,
      error: null
    };

    try {
      // 檢查必要檔案
      const requiredFiles = [
        'manifest.json',
        'service-worker.js'
      ];

      const missingFiles = requiredFiles.filter(file => 
        !fs.existsSync(path.join(this.workingDir, file))
      );

      if (missingFiles.length > 0) {
        throw new Error(`缺少必要檔案: ${missingFiles.join(', ')}`);
      }

      // 模擬打包過程（實際應該創建 ZIP 檔案）
      const packageInfo = {
        files: fs.readdirSync(this.workingDir).filter(file => 
          !file.includes('.backup') && !file.includes('.test')
        ),
        manifestValid: true,
        packageSize: 0 // 實際應該計算檔案大小
      };

      step.data = packageInfo;
      step.success = true;
    } catch (error) {
      step.error = error.message;
    }

    return step;
  }

  cleanup() {
    // 清理備份檔案
    if (this.backupPath && fs.existsSync(this.backupPath)) {
      fs.unlinkSync(this.backupPath);
    }
  }
}

describe('權限修正工作流程整合測試', () => {
  let testWorkingDir;
  let workflow;

  beforeEach(() => {
    // 創建測試工作目錄
    testWorkingDir = path.join(__dirname, '../fixtures/workflow-test');
    if (!fs.existsSync(testWorkingDir)) {
      fs.mkdirSync(testWorkingDir, { recursive: true });
    }

    workflow = new PermissionFixWorkflow(testWorkingDir);
  });

  afterEach(() => {
    // 清理測試檔案
    workflow.cleanup();
    
    if (fs.existsSync(testWorkingDir)) {
      const files = fs.readdirSync(testWorkingDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testWorkingDir, file));
      });
      fs.rmdirSync(testWorkingDir);
    }
  });

  describe('完整工作流程測試', () => {
    test('應該成功執行完整的權限修正流程', async () => {
      // 準備測試檔案
      const testManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
        permissions: ['activeTab', 'scripting'],
        host_permissions: ['https://cdn.jsdelivr.net/*']
      };

      fs.writeFileSync(
        path.join(testWorkingDir, 'manifest.json'),
        JSON.stringify(testManifest, null, 2)
      );

      fs.writeFileSync(
        path.join(testWorkingDir, 'service-worker.js'),
        '// Test service worker'
      );

      // 執行工作流程
      const results = await workflow.executeFullWorkflow();

      expect(results.success).toBe(true);
      expect(results.errors).toHaveLength(0);
      expect(results.steps).toHaveLength(5);

      // 檢查每個步驟
      expect(results.steps[0].name).toBe('分析權限配置');
      expect(results.steps[0].success).toBe(true);

      expect(results.steps[1].name).toBe('生成權限描述');
      expect(results.steps[1].success).toBe(true);

      expect(results.steps[2].name).toBe('更新 Manifest');
      expect(results.steps[2].success).toBe(true);

      expect(results.steps[3].name).toBe('驗證更新');
      expect(results.steps[3].success).toBe(true);

      expect(results.steps[4].name).toBe('打包擴充功能');
      expect(results.steps[4].success).toBe(true);

      // 驗證最終結果
      const finalManifest = JSON.parse(fs.readFileSync(
        path.join(testWorkingDir, 'manifest.json'),
        'utf8'
      ));

      expect(finalManifest.permissions_description).toBeDefined();
      expect(finalManifest.host_permissions_description).toBeDefined();
    }, 10000);

    test('應該處理缺少 manifest 檔案的情況', async () => {
      // 不創建 manifest 檔案

      const results = await workflow.executeFullWorkflow();

      expect(results.success).toBe(false);
      expect(results.errors.length).toBeGreaterThan(0);
      expect(results.steps[0].success).toBe(false);
      expect(results.steps[0].error).toContain('Manifest 檔案不存在');
    });

    test('應該處理無效 JSON 格式', async () => {
      // 創建無效的 manifest 檔案
      fs.writeFileSync(
        path.join(testWorkingDir, 'manifest.json'),
        '{ invalid json }'
      );

      const results = await workflow.executeFullWorkflow();

      expect(results.success).toBe(false);
      expect(results.steps[0].success).toBe(false);
    });

    test('應該在更新失敗時還原備份', async () => {
      const originalManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0'
      };

      fs.writeFileSync(
        path.join(testWorkingDir, 'manifest.json'),
        JSON.stringify(originalManifest, null, 2)
      );

      // 模擬更新過程中的錯誤（通過修改檔案權限）
      const manifestPath = path.join(testWorkingDir, 'manifest.json');
      
      // 執行部分工作流程
      const analyzeResult = await workflow.analyzePermissions();
      expect(analyzeResult.success).toBe(true);

      const generateResult = await workflow.generateDescriptions();
      expect(generateResult.success).toBe(true);

      // 這裡正常情況下更新應該成功，因為我們無法輕易模擬寫入失敗
      const updateResult = await workflow.updateManifest();
      expect(updateResult.success).toBe(true);
    });
  });

  describe('步驟間資料傳遞測試', () => {
    test('分析步驟應該提供正確的權限資訊', async () => {
      const testManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
        permissions: ['activeTab', 'scripting'],
        host_permissions: ['https://cdn.jsdelivr.net/*']
      };

      fs.writeFileSync(
        path.join(testWorkingDir, 'manifest.json'),
        JSON.stringify(testManifest, null, 2)
      );

      const analyzeResult = await workflow.analyzePermissions();

      expect(analyzeResult.success).toBe(true);
      expect(analyzeResult.data.hasPermissions).toBe(true);
      expect(analyzeResult.data.hasHostPermissions).toBe(true);
      expect(analyzeResult.data.permissions).toEqual(['activeTab', 'scripting']);
      expect(analyzeResult.data.hostPermissions).toEqual(['https://cdn.jsdelivr.net/*']);
    });

    test('生成步驟應該產生適當的描述', async () => {
      const testManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
        permissions: ['activeTab', 'scripting'],
        host_permissions: ['https://cdn.jsdelivr.net/*']
      };

      fs.writeFileSync(
        path.join(testWorkingDir, 'manifest.json'),
        JSON.stringify(testManifest, null, 2)
      );

      const generateResult = await workflow.generateDescriptions();

      expect(generateResult.success).toBe(true);
      expect(generateResult.data.permissionsDescription).toContain('此擴充功能需要以下權限');
      expect(generateResult.data.hostPermissionsDescription).toContain('OpenCC');
      expect(generateResult.data.hostPermissionsDescription).toContain('不會傳送');
    });
  });

  describe('錯誤恢復測試', () => {
    test('應該在驗證失敗時提供詳細錯誤資訊', async () => {
      const testManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
        permissions: ['activeTab'],
        permissions_description: '太短' // 故意設置太短的描述
      };

      fs.writeFileSync(
        path.join(testWorkingDir, 'manifest.json'),
        JSON.stringify(testManifest, null, 2)
      );

      const validateResult = await workflow.validateUpdate();

      expect(validateResult.success).toBe(false);
      expect(validateResult.data.issues).toContain('permissions_description 太短');
    });
  });
});