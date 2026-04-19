/**
 * 權限描述生成器單元測試
 * 測試權限描述生成功能
 */

// 模擬權限描述生成器
class PermissionDescriptionGenerator {
  constructor() {
    this.templates = {
      hostPermissions: {
        'https://cdn.jsdelivr.net/*': '需要存取 https://cdn.jsdelivr.net 來載入 OpenCC 簡體轉繁體轉換函式庫。這是提供高品質中文轉換功能的必要組件，我們只載入官方 OpenCC 函式庫，不會傳送任何使用者資料到此網站。'
      },
      permissions: {
        'activeTab': '讀取當前分頁的標題和網址',
        'scripting': '執行複製到剪貼簿的功能'
      }
    };
  }

  generateHostPermissionsDescription(hostPermissions) {
    if (!hostPermissions || hostPermissions.length === 0) {
      return '';
    }

    const descriptions = hostPermissions.map(permission => {
      return this.templates.hostPermissions[permission] || `需要存取 ${permission}`;
    });

    return descriptions.join('；');
  }

  generatePermissionsDescription(permissions, hostPermissions = []) {
    if (!permissions || permissions.length === 0) {
      return '';
    }

    let description = '此擴充功能需要以下權限：';
    
    permissions.forEach((permission, index) => {
      const permDesc = this.templates.permissions[permission] || permission;
      description += `${index + 1}) ${permission} 權限來${permDesc}`;
      if (index < permissions.length - 1) {
        description += '；';
      }
    });

    // 如果有主機權限，添加說明
    if (hostPermissions && hostPermissions.length > 0) {
      description += `；${hostPermissions.length + permissions.length}) 存取 ${hostPermissions.join(', ')} 來載入官方 OpenCC 簡體轉繁體轉換函式庫`;
    }

    description += '。我們使用 OpenCC 進行高品質的簡體轉繁體轉換，只載入必要的轉換函式庫，不會收集或儲存任何個人資料。';

    return description;
  }

  validateDescription(description, minLength = 50) {
    const issues = [];

    if (!description || description.trim().length === 0) {
      issues.push('描述不能為空');
      return { isValid: false, issues };
    }

    if (description.length < minLength) {
      issues.push(`描述太短，至少需要 ${minLength} 個字元`);
    }

    // 檢查是否包含隱私相關關鍵字
    const privacyKeywords = ['不會', '資料'];
    const hasPrivacyStatement = privacyKeywords.some(keyword => 
      description.includes(keyword)
    );

    if (!hasPrivacyStatement) {
      issues.push(`建議包含隱私聲明關鍵字: ${privacyKeywords.join(' 或 ')}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      length: description.length
    };
  }
}

describe('權限描述生成器測試', () => {
  let generator;

  beforeEach(() => {
    generator = new PermissionDescriptionGenerator();
  });

  describe('generateHostPermissionsDescription', () => {
    test('應該為 CDN 權限生成正確描述', () => {
      const hostPermissions = ['https://cdn.jsdelivr.net/*'];
      const description = generator.generateHostPermissionsDescription(hostPermissions);

      expect(description).toContain('OpenCC');
      expect(description).toContain('不會傳送');
      expect(description).toContain('必要組件');
      expect(description).toContain('https://cdn.jsdelivr.net');
    });

    test('應該處理多個主機權限', () => {
      const hostPermissions = ['https://cdn.jsdelivr.net/*', 'https://example.com/*'];
      const description = generator.generateHostPermissionsDescription(hostPermissions);

      expect(description).toContain('https://cdn.jsdelivr.net');
      expect(description).toContain('https://example.com');
      expect(description).toContain('；');
    });

    test('應該處理空的主機權限', () => {
      const description = generator.generateHostPermissionsDescription([]);
      expect(description).toBe('');
    });

    test('應該處理 null 或 undefined', () => {
      expect(generator.generateHostPermissionsDescription(null)).toBe('');
      expect(generator.generateHostPermissionsDescription(undefined)).toBe('');
    });
  });

  describe('generatePermissionsDescription', () => {
    test('應該為標準權限生成正確描述', () => {
      const permissions = ['activeTab', 'scripting'];
      const description = generator.generatePermissionsDescription(permissions);

      expect(description).toContain('此擴充功能需要以下權限');
      expect(description).toContain('activeTab 權限來讀取當前分頁');
      expect(description).toContain('scripting 權限來執行複製');
      expect(description).toContain('不會收集或儲存任何個人資料');
    });

    test('應該包含主機權限說明', () => {
      const permissions = ['activeTab', 'scripting'];
      const hostPermissions = ['https://cdn.jsdelivr.net/*'];
      const description = generator.generatePermissionsDescription(permissions, hostPermissions);

      expect(description).toContain('存取 https://cdn.jsdelivr.net');
      expect(description).toContain('OpenCC 簡體轉繁體轉換函式庫');
    });

    test('應該處理單一權限', () => {
      const permissions = ['activeTab'];
      const description = generator.generatePermissionsDescription(permissions);

      expect(description).toContain('1) activeTab 權限');
      expect(description).not.toContain('；');
    });

    test('應該處理空權限陣列', () => {
      const description = generator.generatePermissionsDescription([]);
      expect(description).toBe('');
    });
  });

  describe('validateDescription', () => {
    test('應該驗證有效的描述', () => {
      const description = '此擴充功能需要以下權限來提供完整的功能服務，我們承諾不會收集或儲存任何個人資料，確保使用者隱私安全。';
      const validation = generator.validateDescription(description);

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
      expect(validation.length).toBe(description.length);
    });

    test('應該檢測空描述', () => {
      const validation = generator.validateDescription('');

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('描述不能為空');
    });

    test('應該檢測太短的描述', () => {
      const validation = generator.validateDescription('太短', 50);

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('描述太短，至少需要 50 個字元');
    });

    test('應該檢測缺少必要關鍵字', () => {
      const description = '這是一個很長的描述但是缺少必要的關鍵字來通過驗證測試';
      const validation = generator.validateDescription(description);

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('建議包含隱私聲明關鍵字: 不會 或 資料');
    });

    test('應該使用自訂最小長度', () => {
      const description = '短描述';
      const validation = generator.validateDescription(description, 10);

      expect(validation.issues).not.toContain('描述太短，至少需要 50 個字元');
      expect(validation.issues).toContain('描述太短，至少需要 10 個字元');
    });
  });
});