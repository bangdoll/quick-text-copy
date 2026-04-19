/**
 * 權限分析器單元測試
 * 測試權限配置分析功能
 */

const fs = require('fs');
const path = require('path');

// 模擬權限分析器
class PermissionAnalyzer {
  constructor() {
    this.requiredPermissions = ['activeTab', 'scripting'];
    this.requiredHostPermissions = ['https://cdn.jsdelivr.net/*'];
  }

  analyzeManifest(manifestPath) {
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Manifest 檔案不存在');
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    return {
      hasPermissions: !!manifest.permissions,
      hasHostPermissions: !!manifest.host_permissions,
      hasPermissionsDescription: !!manifest.permissions_description,
      hasHostPermissionsDescription: !!manifest.host_permissions_description,
      permissions: manifest.permissions || [],
      hostPermissions: manifest.host_permissions || [],
      permissionsDescription: manifest.permissions_description || '',
      hostPermissionsDescription: manifest.host_permissions_description || ''
    };
  }

  validatePermissions(analysis) {
    const issues = [];

    // 檢查必要權限
    this.requiredPermissions.forEach(perm => {
      if (!analysis.permissions.includes(perm)) {
        issues.push(`缺少必要權限: ${perm}`);
      }
    });

    // 檢查主機權限
    if (analysis.hostPermissions.length > 0 && !analysis.hasHostPermissionsDescription) {
      issues.push('有主機權限但缺少 host_permissions_description');
    }

    // 檢查權限描述
    if (analysis.hasPermissions && !analysis.hasPermissionsDescription) {
      issues.push('有權限但缺少 permissions_description');
    }

    // 檢查描述長度
    if (analysis.permissionsDescription && analysis.permissionsDescription.length < 50) {
      issues.push('permissions_description 太短');
    }

    if (analysis.hostPermissionsDescription && analysis.hostPermissionsDescription.length < 30) {
      issues.push('host_permissions_description 太短');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

describe('權限分析器測試', () => {
  let analyzer;
  let testManifestPath;

  beforeEach(() => {
    analyzer = new PermissionAnalyzer();
    testManifestPath = path.join(__dirname, '../fixtures/test-manifest.json');
  });

  afterEach(() => {
    // 清理測試檔案
    if (fs.existsSync(testManifestPath)) {
      fs.unlinkSync(testManifestPath);
    }
  });

  describe('analyzeManifest', () => {
    test('應該正確分析完整的 manifest', () => {
      const testManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
        permissions: ['activeTab', 'scripting'],
        host_permissions: ['https://cdn.jsdelivr.net/*'],
        permissions_description: '這是權限描述，用於說明擴充功能需要的權限用途',
        host_permissions_description: '需要存取 CDN 來載入轉換函式庫'
      };

      // 創建測試目錄
      const fixturesDir = path.dirname(testManifestPath);
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }

      fs.writeFileSync(testManifestPath, JSON.stringify(testManifest, null, 2));

      const analysis = analyzer.analyzeManifest(testManifestPath);

      expect(analysis.hasPermissions).toBe(true);
      expect(analysis.hasHostPermissions).toBe(true);
      expect(analysis.hasPermissionsDescription).toBe(true);
      expect(analysis.hasHostPermissionsDescription).toBe(true);
      expect(analysis.permissions).toEqual(['activeTab', 'scripting']);
      expect(analysis.hostPermissions).toEqual(['https://cdn.jsdelivr.net/*']);
    });

    test('應該處理缺少權限描述的 manifest', () => {
      const testManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
        permissions: ['activeTab', 'scripting'],
        host_permissions: ['https://cdn.jsdelivr.net/*']
      };

      const fixturesDir = path.dirname(testManifestPath);
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }

      fs.writeFileSync(testManifestPath, JSON.stringify(testManifest, null, 2));

      const analysis = analyzer.analyzeManifest(testManifestPath);

      expect(analysis.hasPermissionsDescription).toBe(false);
      expect(analysis.hasHostPermissionsDescription).toBe(false);
      expect(analysis.permissionsDescription).toBe('');
      expect(analysis.hostPermissionsDescription).toBe('');
    });

    test('應該在檔案不存在時拋出錯誤', () => {
      expect(() => {
        analyzer.analyzeManifest('non-existent-file.json');
      }).toThrow('Manifest 檔案不存在');
    });
  });

  describe('validatePermissions', () => {
    test('應該驗證完整的權限配置', () => {
      const analysis = {
        hasPermissions: true,
        hasHostPermissions: true,
        hasPermissionsDescription: true,
        hasHostPermissionsDescription: true,
        permissions: ['activeTab', 'scripting'],
        hostPermissions: ['https://cdn.jsdelivr.net/*'],
        permissionsDescription: '這是一個足夠長的權限描述，說明了擴充功能需要的所有權限用途，我們不會收集任何個人資料，確保使用者隱私安全',
        hostPermissionsDescription: '需要存取 CDN 來載入 OpenCC 轉換函式庫，不會傳送任何使用者資料'
      };

      const validation = analyzer.validatePermissions(analysis);

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    test('應該檢測缺少的必要權限', () => {
      const analysis = {
        hasPermissions: true,
        hasHostPermissions: false,
        hasPermissionsDescription: true,
        hasHostPermissionsDescription: false,
        permissions: ['activeTab'], // 缺少 scripting
        hostPermissions: [],
        permissionsDescription: '這是一個足夠長的權限描述',
        hostPermissionsDescription: ''
      };

      const validation = analyzer.validatePermissions(analysis);

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('缺少必要權限: scripting');
    });

    test('應該檢測缺少的權限描述', () => {
      const analysis = {
        hasPermissions: true,
        hasHostPermissions: true,
        hasPermissionsDescription: false,
        hasHostPermissionsDescription: false,
        permissions: ['activeTab', 'scripting'],
        hostPermissions: ['https://cdn.jsdelivr.net/*'],
        permissionsDescription: '',
        hostPermissionsDescription: ''
      };

      const validation = analyzer.validatePermissions(analysis);

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('有權限但缺少 permissions_description');
      expect(validation.issues).toContain('有主機權限但缺少 host_permissions_description');
    });

    test('應該檢測描述長度不足', () => {
      const analysis = {
        hasPermissions: true,
        hasHostPermissions: true,
        hasPermissionsDescription: true,
        hasHostPermissionsDescription: true,
        permissions: ['activeTab', 'scripting'],
        hostPermissions: ['https://cdn.jsdelivr.net/*'],
        permissionsDescription: '太短', // 少於 50 字元
        hostPermissionsDescription: '短' // 少於 30 字元
      };

      const validation = analyzer.validatePermissions(analysis);

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('permissions_description 太短');
      expect(validation.issues).toContain('host_permissions_description 太短');
    });
  });
});