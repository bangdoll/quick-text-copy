/**
 * Manifest 更新器單元測試
 * 測試 manifest.json 檔案更新功能
 */

const fs = require('fs');
const path = require('path');

// 模擬 Manifest 更新器
class ManifestUpdater {
  constructor() {
    this.backupSuffix = '.backup';
  }

  readManifest(manifestPath) {
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Manifest 檔案不存在: ${manifestPath}`);
    }

    try {
      const content = fs.readFileSync(manifestPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`無法解析 Manifest 檔案: ${error.message}`);
    }
  }

  writeManifest(manifestPath, manifest) {
    try {
      const content = JSON.stringify(manifest, null, 2);
      fs.writeFileSync(manifestPath, content, 'utf8');
      return true;
    } catch (error) {
      throw new Error(`無法寫入 Manifest 檔案: ${error.message}`);
    }
  }

  createBackup(manifestPath) {
    if (!fs.existsSync(manifestPath)) {
      throw new Error('原始檔案不存在，無法建立備份');
    }

    const backupPath = manifestPath + this.backupSuffix + '.' + Date.now();
    fs.copyFileSync(manifestPath, backupPath);
    return backupPath;
  }

  restoreBackup(backupPath, manifestPath) {
    if (!fs.existsSync(backupPath)) {
      throw new Error('備份檔案不存在');
    }

    fs.copyFileSync(backupPath, manifestPath);
    return true;
  }

  updatePermissionDescriptions(manifest, permissionsDescription, hostPermissionsDescription) {
    const updatedManifest = { ...manifest };

    if (permissionsDescription) {
      updatedManifest.permissions_description = permissionsDescription;
    }

    if (hostPermissionsDescription) {
      updatedManifest.host_permissions_description = hostPermissionsDescription;
    }

    return updatedManifest;
  }

  validateManifestStructure(manifest) {
    const errors = [];
    const warnings = [];

    // 必要欄位檢查
    const requiredFields = ['manifest_version', 'name', 'version'];
    requiredFields.forEach(field => {
      if (!manifest[field]) {
        errors.push(`缺少必要欄位: ${field}`);
      }
    });

    // 版本檢查
    if (manifest.manifest_version !== 3) {
      warnings.push('建議使用 Manifest V3');
    }

    // 權限檢查
    if (manifest.host_permissions && !manifest.host_permissions_description) {
      errors.push('有 host_permissions 但缺少 host_permissions_description');
    }

    if (manifest.permissions && !manifest.permissions_description) {
      warnings.push('建議為 permissions 添加 permissions_description');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  formatManifest(manifest) {
    // 確保欄位順序
    const orderedManifest = {};
    
    // 基本資訊
    if (manifest.manifest_version) orderedManifest.manifest_version = manifest.manifest_version;
    if (manifest.name) orderedManifest.name = manifest.name;
    if (manifest.version) orderedManifest.version = manifest.version;
    if (manifest.description) orderedManifest.description = manifest.description;

    // 權限
    if (manifest.permissions) orderedManifest.permissions = manifest.permissions;
    if (manifest.host_permissions) orderedManifest.host_permissions = manifest.host_permissions;
    if (manifest.permissions_description) orderedManifest.permissions_description = manifest.permissions_description;
    if (manifest.host_permissions_description) orderedManifest.host_permissions_description = manifest.host_permissions_description;

    // 其他欄位
    Object.keys(manifest).forEach(key => {
      if (!orderedManifest.hasOwnProperty(key)) {
        orderedManifest[key] = manifest[key];
      }
    });

    return orderedManifest;
  }
}

describe('Manifest 更新器測試', () => {
  let updater;
  let testManifestPath;
  let testBackupPath;

  beforeEach(() => {
    updater = new ManifestUpdater();
    testManifestPath = path.join(__dirname, '../fixtures/test-manifest-updater.json');
    testBackupPath = testManifestPath + '.backup.test';
  });

  afterEach(() => {
    // 清理測試檔案
    [testManifestPath, testBackupPath].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // 清理所有備份檔案
    const dir = path.dirname(testManifestPath);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (file.includes('.backup.')) {
          fs.unlinkSync(path.join(dir, file));
        }
      });
    }
  });

  describe('readManifest', () => {
    test('應該正確讀取有效的 manifest 檔案', () => {
      const testManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0'
      };

      // 創建測試目錄
      const fixturesDir = path.dirname(testManifestPath);
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }

      fs.writeFileSync(testManifestPath, JSON.stringify(testManifest, null, 2));

      const manifest = updater.readManifest(testManifestPath);

      expect(manifest).toEqual(testManifest);
    });

    test('應該在檔案不存在時拋出錯誤', () => {
      expect(() => {
        updater.readManifest('non-existent.json');
      }).toThrow('Manifest 檔案不存在');
    });

    test('應該在 JSON 格式錯誤時拋出錯誤', () => {
      const fixturesDir = path.dirname(testManifestPath);
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }

      fs.writeFileSync(testManifestPath, '{ invalid json }');

      expect(() => {
        updater.readManifest(testManifestPath);
      }).toThrow('無法解析 Manifest 檔案');
    });
  });

  describe('writeManifest', () => {
    test('應該正確寫入 manifest 檔案', () => {
      const testManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0'
      };

      const fixturesDir = path.dirname(testManifestPath);
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }

      const result = updater.writeManifest(testManifestPath, testManifest);

      expect(result).toBe(true);
      expect(fs.existsSync(testManifestPath)).toBe(true);

      const writtenContent = JSON.parse(fs.readFileSync(testManifestPath, 'utf8'));
      expect(writtenContent).toEqual(testManifest);
    });
  });

  describe('createBackup', () => {
    test('應該成功建立備份檔案', () => {
      const testManifest = { name: 'Test' };

      const fixturesDir = path.dirname(testManifestPath);
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }

      fs.writeFileSync(testManifestPath, JSON.stringify(testManifest));

      const backupPath = updater.createBackup(testManifestPath);

      expect(fs.existsSync(backupPath)).toBe(true);
      expect(backupPath).toContain('.backup.');

      const backupContent = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      expect(backupContent).toEqual(testManifest);

      // 清理
      fs.unlinkSync(backupPath);
    });

    test('應該在原始檔案不存在時拋出錯誤', () => {
      expect(() => {
        updater.createBackup('non-existent.json');
      }).toThrow('原始檔案不存在，無法建立備份');
    });
  });

  describe('restoreBackup', () => {
    test('應該成功還原備份檔案', () => {
      const originalManifest = { name: 'Original' };
      const modifiedManifest = { name: 'Modified' };

      const fixturesDir = path.dirname(testManifestPath);
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }

      // 創建原始檔案和備份
      fs.writeFileSync(testManifestPath, JSON.stringify(originalManifest));
      fs.writeFileSync(testBackupPath, JSON.stringify(originalManifest));

      // 修改原始檔案
      fs.writeFileSync(testManifestPath, JSON.stringify(modifiedManifest));

      // 還原備份
      const result = updater.restoreBackup(testBackupPath, testManifestPath);

      expect(result).toBe(true);

      const restoredContent = JSON.parse(fs.readFileSync(testManifestPath, 'utf8'));
      expect(restoredContent).toEqual(originalManifest);
    });

    test('應該在備份檔案不存在時拋出錯誤', () => {
      expect(() => {
        updater.restoreBackup('non-existent-backup.json', testManifestPath);
      }).toThrow('備份檔案不存在');
    });
  });

  describe('updatePermissionDescriptions', () => {
    test('應該正確更新權限描述', () => {
      const originalManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
        permissions: ['activeTab']
      };

      const permissionsDescription = '權限描述';
      const hostPermissionsDescription = '主機權限描述';

      const updatedManifest = updater.updatePermissionDescriptions(
        originalManifest,
        permissionsDescription,
        hostPermissionsDescription
      );

      expect(updatedManifest.permissions_description).toBe(permissionsDescription);
      expect(updatedManifest.host_permissions_description).toBe(hostPermissionsDescription);
      expect(updatedManifest.name).toBe(originalManifest.name); // 確保其他欄位不變
    });

    test('應該只更新提供的描述', () => {
      const originalManifest = {
        manifest_version: 3,
        name: 'Test Extension'
      };

      const updatedManifest = updater.updatePermissionDescriptions(
        originalManifest,
        '只有權限描述',
        null
      );

      expect(updatedManifest.permissions_description).toBe('只有權限描述');
      expect(updatedManifest.host_permissions_description).toBeUndefined();
    });
  });

  describe('validateManifestStructure', () => {
    test('應該驗證有效的 manifest 結構', () => {
      const validManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
        permissions: ['activeTab'],
        permissions_description: '權限描述'
      };

      const validation = updater.validateManifestStructure(validManifest);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('應該檢測缺少必要欄位', () => {
      const invalidManifest = {
        manifest_version: 3
        // 缺少 name 和 version
      };

      const validation = updater.validateManifestStructure(invalidManifest);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('缺少必要欄位: name');
      expect(validation.errors).toContain('缺少必要欄位: version');
    });

    test('應該檢測主機權限缺少描述', () => {
      const manifestWithHostPermissions = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
        host_permissions: ['https://example.com/*']
        // 缺少 host_permissions_description
      };

      const validation = updater.validateManifestStructure(manifestWithHostPermissions);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('有 host_permissions 但缺少 host_permissions_description');
    });
  });

  describe('formatManifest', () => {
    test('應該正確排序 manifest 欄位', () => {
      const unorderedManifest = {
        icons: { '16': 'icon16.png' },
        version: '1.0.0',
        manifest_version: 3,
        permissions_description: '權限描述',
        name: 'Test Extension',
        permissions: ['activeTab']
      };

      const formattedManifest = updater.formatManifest(unorderedManifest);
      const keys = Object.keys(formattedManifest);

      expect(keys[0]).toBe('manifest_version');
      expect(keys[1]).toBe('name');
      expect(keys[2]).toBe('version');
      expect(keys.indexOf('permissions')).toBeLessThan(keys.indexOf('permissions_description'));
    });

    test('應該保留所有原始欄位', () => {
      const originalManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
        custom_field: 'custom_value',
        permissions: ['activeTab']
      };

      const formattedManifest = updater.formatManifest(originalManifest);

      expect(formattedManifest.custom_field).toBe('custom_value');
      expect(Object.keys(formattedManifest)).toHaveLength(Object.keys(originalManifest).length);
    });
  });
});