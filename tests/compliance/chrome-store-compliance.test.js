/**
 * Chrome Web Store 合規性測試
 * 確保擴充功能符合 Chrome Web Store 的所有要求
 */

const fs = require('fs');
const path = require('path');

// Chrome Web Store 合規性檢查器
class ChromeStoreComplianceChecker {
  constructor() {
    this.rules = {
      manifest: {
        requiredFields: ['manifest_version', 'name', 'version', 'description'],
        manifestVersion: 3,
        maxNameLength: 75,
        maxDescriptionLength: 132,
        minDescriptionLength: 10
      },
      permissions: {
        requiresDescription: true,
        minDescriptionLength: 30,
        requiredKeywords: ['不會', '資料', '個人'],
        hostPermissionsRequireDescription: true
      },
      icons: {
        requiredSizes: [16, 32, 48, 128],
        maxFileSize: 1024 * 1024, // 1MB
        allowedFormats: ['.png', '.jpg', '.jpeg']
      },
      privacy: {
        requiresPrivacyPolicy: true,
        privacyPolicyFile: 'privacy-policy.html'
      },
      content: {
        prohibitedContent: [
          'eval(',
          'new Function(',
          'innerHTML =',
          'document.write('
        ],
        requiredContentSecurityPolicy: true
      }
    };
  }

  async checkManifestCompliance(manifestPath) {
    const results = {
      passed: true,
      errors: [],
      warnings: [],
      details: {}
    };

    try {
      if (!fs.existsSync(manifestPath)) {
        results.errors.push('Manifest 檔案不存在');
        results.passed = false;
        return results;
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      results.details.manifest = manifest;

      // 檢查必要欄位
      this.rules.manifest.requiredFields.forEach(field => {
        if (!manifest[field]) {
          results.errors.push(`缺少必要欄位: ${field}`);
          results.passed = false;
        }
      });

      // 檢查 manifest 版本
      if (manifest.manifest_version !== this.rules.manifest.manifestVersion) {
        results.errors.push(`不支援的 manifest 版本: ${manifest.manifest_version}，應該是 ${this.rules.manifest.manifestVersion}`);
        results.passed = false;
      }

      // 檢查名稱長度
      if (manifest.name && manifest.name.length > this.rules.manifest.maxNameLength) {
        results.errors.push(`擴充功能名稱太長: ${manifest.name.length} 字元，最多 ${this.rules.manifest.maxNameLength} 字元`);
        results.passed = false;
      }

      // 檢查描述長度
      if (manifest.description) {
        if (manifest.description.length < this.rules.manifest.minDescriptionLength) {
          results.errors.push(`描述太短: ${manifest.description.length} 字元，至少 ${this.rules.manifest.minDescriptionLength} 字元`);
          results.passed = false;
        }
        if (manifest.description.length > this.rules.manifest.maxDescriptionLength) {
          results.warnings.push(`描述可能太長: ${manifest.description.length} 字元，建議不超過 ${this.rules.manifest.maxDescriptionLength} 字元`);
        }
      }

      // 檢查圖示
      if (manifest.icons) {
        const iconCheck = this.checkIcons(manifest.icons, path.dirname(manifestPath));
        results.errors.push(...iconCheck.errors);
        results.warnings.push(...iconCheck.warnings);
        if (iconCheck.errors.length > 0) {
          results.passed = false;
        }
      } else {
        results.errors.push('缺少圖示配置');
        results.passed = false;
      }

    } catch (error) {
      results.errors.push(`解析 manifest 失敗: ${error.message}`);
      results.passed = false;
    }

    return results;
  }

  checkIcons(iconsConfig, extensionDir) {
    const results = {
      errors: [],
      warnings: []
    };

    // 檢查必要的圖示尺寸
    this.rules.icons.requiredSizes.forEach(size => {
      if (!iconsConfig[size]) {
        results.errors.push(`缺少 ${size}x${size} 圖示`);
      } else {
        const iconPath = path.join(extensionDir, iconsConfig[size]);
        if (!fs.existsSync(iconPath)) {
          results.errors.push(`圖示檔案不存在: ${iconsConfig[size]}`);
        } else {
          // 檢查檔案大小
          const stats = fs.statSync(iconPath);
          if (stats.size > this.rules.icons.maxFileSize) {
            results.errors.push(`圖示檔案太大: ${iconsConfig[size]} (${stats.size} bytes)`);
          }

          // 檢查檔案格式
          const ext = path.extname(iconPath).toLowerCase();
          if (!this.rules.icons.allowedFormats.includes(ext)) {
            results.errors.push(`不支援的圖示格式: ${ext}，支援格式: ${this.rules.icons.allowedFormats.join(', ')}`);
          }
        }
      }
    });

    return results;
  }

  async checkPermissionCompliance(manifestPath) {
    const results = {
      passed: true,
      errors: [],
      warnings: [],
      details: {}
    };

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      // 檢查權限描述
      if (manifest.permissions && manifest.permissions.length > 0) {
        if (!manifest.permissions_description) {
          results.errors.push('有權限但缺少 permissions_description');
          results.passed = false;
        } else {
          // 檢查描述長度
          if (manifest.permissions_description.length < this.rules.permissions.minDescriptionLength) {
            results.errors.push(`permissions_description 太短: ${manifest.permissions_description.length} 字元`);
            results.passed = false;
          }

          // 檢查必要關鍵字
          const missingKeywords = this.rules.permissions.requiredKeywords.filter(keyword => 
            !manifest.permissions_description.includes(keyword)
          );
          
          if (missingKeywords.length > 0) {
            results.warnings.push(`permissions_description 建議包含關鍵字: ${missingKeywords.join(', ')}`);
          }
        }
      }

      // 檢查主機權限描述
      if (manifest.host_permissions && manifest.host_permissions.length > 0) {
        if (!manifest.host_permissions_description) {
          results.errors.push('有主機權限但缺少 host_permissions_description');
          results.passed = false;
        } else {
          // 檢查描述長度
          if (manifest.host_permissions_description.length < this.rules.permissions.minDescriptionLength) {
            results.errors.push(`host_permissions_description 太短: ${manifest.host_permissions_description.length} 字元`);
            results.passed = false;
          }

          // 檢查 OpenCC 相關關鍵字
          const openccKeywords = ['OpenCC', '轉換', '函式庫'];
          const hasOpenccKeywords = openccKeywords.some(keyword => 
            manifest.host_permissions_description.includes(keyword)
          );

          if (!hasOpenccKeywords) {
            results.warnings.push('host_permissions_description 建議說明 OpenCC 用途');
          }

          // 檢查隱私聲明
          const privacyKeywords = ['不會', '傳送', '資料'];
          const hasPrivacyStatement = privacyKeywords.every(keyword => 
            manifest.host_permissions_description.includes(keyword)
          );

          if (!hasPrivacyStatement) {
            results.errors.push('host_permissions_description 必須包含隱私聲明');
            results.passed = false;
          }
        }
      }

      results.details.permissions = {
        permissions: manifest.permissions || [],
        hostPermissions: manifest.host_permissions || [],
        permissionsDescription: manifest.permissions_description || '',
        hostPermissionsDescription: manifest.host_permissions_description || ''
      };

    } catch (error) {
      results.errors.push(`檢查權限合規性失敗: ${error.message}`);
      results.passed = false;
    }

    return results;
  }

  async checkPrivacyCompliance(extensionDir) {
    const results = {
      passed: true,
      errors: [],
      warnings: [],
      details: {}
    };

    try {
      const privacyPolicyPath = path.join(extensionDir, this.rules.privacy.privacyPolicyFile);
      
      if (!fs.existsSync(privacyPolicyPath)) {
        results.errors.push(`缺少隱私政策檔案: ${this.rules.privacy.privacyPolicyFile}`);
        results.passed = false;
      } else {
        const privacyContent = fs.readFileSync(privacyPolicyPath, 'utf8');
        
        // 檢查隱私政策內容
        const requiredSections = [
          '資料收集',
          '資料使用',
          '第三方服務',
          'OpenCC'
        ];

        const missingSections = requiredSections.filter(section => 
          !privacyContent.includes(section)
        );

        if (missingSections.length > 0) {
          results.warnings.push(`隱私政策建議包含章節: ${missingSections.join(', ')}`);
        }

        // 檢查是否說明不收集資料
        if (!privacyContent.includes('不收集') && !privacyContent.includes('不會收集')) {
          results.warnings.push('隱私政策建議明確說明不收集個人資料');
        }

        results.details.privacyPolicy = {
          exists: true,
          length: privacyContent.length,
          hasSections: requiredSections.filter(section => privacyContent.includes(section))
        };
      }

    } catch (error) {
      results.errors.push(`檢查隱私政策失敗: ${error.message}`);
      results.passed = false;
    }

    return results;
  }

  async checkContentCompliance(extensionDir) {
    const results = {
      passed: true,
      errors: [],
      warnings: [],
      details: {}
    };

    try {
      // 檢查 JavaScript 檔案
      const jsFiles = this.findJavaScriptFiles(extensionDir);
      
      for (const jsFile of jsFiles) {
        const content = fs.readFileSync(jsFile, 'utf8');
        
        // 檢查禁止的內容
        this.rules.content.prohibitedContent.forEach(prohibited => {
          if (content.includes(prohibited)) {
            results.errors.push(`檔案 ${path.relative(extensionDir, jsFile)} 包含禁止的內容: ${prohibited}`);
            results.passed = false;
          }
        });

        // 檢查是否使用了外部資源
        const externalUrls = content.match(/https?:\/\/[^\s"']+/g);
        if (externalUrls) {
          const allowedDomains = ['cdn.jsdelivr.net'];
          const unauthorizedUrls = externalUrls.filter(url => 
            !allowedDomains.some(domain => url.includes(domain))
          );
          
          if (unauthorizedUrls.length > 0) {
            results.warnings.push(`檔案 ${path.relative(extensionDir, jsFile)} 使用了未授權的外部資源: ${unauthorizedUrls.join(', ')}`);
          }
        }
      }

      results.details.jsFiles = jsFiles.map(file => path.relative(extensionDir, file));

    } catch (error) {
      results.errors.push(`檢查內容合規性失敗: ${error.message}`);
      results.passed = false;
    }

    return results;
  }

  findJavaScriptFiles(dir) {
    const jsFiles = [];
    
    const scanDirectory = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          scanDirectory(itemPath);
        } else if (stat.isFile() && item.endsWith('.js')) {
          jsFiles.push(itemPath);
        }
      });
    };

    scanDirectory(dir);
    return jsFiles;
  }

  async runFullComplianceCheck(extensionDir) {
    const results = {
      overall: true,
      checks: {},
      summary: {
        passed: 0,
        failed: 0,
        total: 0
      },
      allErrors: [],
      allWarnings: []
    };

    try {
      const manifestPath = path.join(extensionDir, 'manifest.json');

      // 執行所有合規性檢查
      results.checks.manifest = await this.checkManifestCompliance(manifestPath);
      results.checks.permissions = await this.checkPermissionCompliance(manifestPath);
      results.checks.privacy = await this.checkPrivacyCompliance(extensionDir);
      results.checks.content = await this.checkContentCompliance(extensionDir);

      // 計算結果
      const checkNames = Object.keys(results.checks);
      results.summary.total = checkNames.length;
      results.summary.passed = checkNames.filter(name => results.checks[name].passed).length;
      results.summary.failed = results.summary.total - results.summary.passed;
      results.overall = results.summary.failed === 0;

      // 收集所有錯誤和警告
      checkNames.forEach(checkName => {
        const check = results.checks[checkName];
        results.allErrors.push(...check.errors.map(error => `${checkName}: ${error}`));
        results.allWarnings.push(...check.warnings.map(warning => `${checkName}: ${warning}`));
      });

    } catch (error) {
      results.error = error.message;
      results.overall = false;
    }

    return results;
  }
}

describe('Chrome Web Store 合規性測試', () => {
  let complianceChecker;
  let testExtensionDir;

  beforeEach(() => {
    complianceChecker = new ChromeStoreComplianceChecker();
    testExtensionDir = path.join(__dirname, '../fixtures/compliance-test-extension');
    
    if (!fs.existsSync(testExtensionDir)) {
      fs.mkdirSync(testExtensionDir, { recursive: true });
    }
  });

  afterEach(() => {
    // 清理測試檔案
    if (fs.existsSync(testExtensionDir)) {
      const removeDirectory = (dirPath) => {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
          const filePath = path.join(dirPath, file);
          if (fs.statSync(filePath).isDirectory()) {
            removeDirectory(filePath);
          } else {
            fs.unlinkSync(filePath);
          }
        });
        fs.rmdirSync(dirPath);
      };
      
      removeDirectory(testExtensionDir);
    }
  });

  describe('Manifest 合規性測試', () => {
    test('應該通過有效的 manifest 檢查', async () => {
      const validManifest = {
        manifest_version: 3,
        name: 'Quick Text Copy Test',
        version: '1.0.0',
        description: '這是一個測試擴充功能的描述',
        permissions: ['activeTab', 'scripting'],
        host_permissions: ['https://cdn.jsdelivr.net/*'],
        permissions_description: '此擴充功能需要權限來提供複製功能，我們不會收集或儲存任何個人資料。',
        host_permissions_description: '需要存取 CDN 來載入 OpenCC 轉換函式庫，不會傳送任何使用者資料。',
        icons: {
          '16': 'icons/icon16.png',
          '32': 'icons/icon32.png',
          '48': 'icons/icon48.png',
          '128': 'icons/icon128.png'
        }
      };

      // 創建測試檔案
      fs.writeFileSync(
        path.join(testExtensionDir, 'manifest.json'),
        JSON.stringify(validManifest, null, 2)
      );

      // 創建圖示目錄和檔案
      const iconsDir = path.join(testExtensionDir, 'icons');
      fs.mkdirSync(iconsDir, { recursive: true });
      [16, 32, 48, 128].forEach(size => {
        fs.writeFileSync(
          path.join(iconsDir, `icon${size}.png`),
          `fake png content for ${size}x${size}`
        );
      });

      const result = await complianceChecker.checkManifestCompliance(
        path.join(testExtensionDir, 'manifest.json')
      );

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('應該檢測缺少必要欄位', async () => {
      const invalidManifest = {
        manifest_version: 3,
        name: 'Test Extension'
        // 缺少 version 和 description
      };

      fs.writeFileSync(
        path.join(testExtensionDir, 'manifest.json'),
        JSON.stringify(invalidManifest, null, 2)
      );

      const result = await complianceChecker.checkManifestCompliance(
        path.join(testExtensionDir, 'manifest.json')
      );

      expect(result.passed).toBe(false);
      expect(result.errors).toContain('缺少必要欄位: version');
      expect(result.errors).toContain('缺少必要欄位: description');
    });

    test('應該檢測不支援的 manifest 版本', async () => {
      const invalidManifest = {
        manifest_version: 2, // 舊版本
        name: 'Test Extension',
        version: '1.0.0',
        description: '測試描述'
      };

      fs.writeFileSync(
        path.join(testExtensionDir, 'manifest.json'),
        JSON.stringify(invalidManifest, null, 2)
      );

      const result = await complianceChecker.checkManifestCompliance(
        path.join(testExtensionDir, 'manifest.json')
      );

      expect(result.passed).toBe(false);
      expect(result.errors).toContain('不支援的 manifest 版本: 2，應該是 3');
    });
  });

  describe('權限合規性測試', () => {
    test('應該通過有效的權限配置', async () => {
      const validManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
        permissions: ['activeTab', 'scripting'],
        host_permissions: ['https://cdn.jsdelivr.net/*'],
        permissions_description: '此擴充功能需要權限來提供複製功能，我們不會收集或儲存任何個人資料。',
        host_permissions_description: '需要存取 CDN 來載入 OpenCC 轉換函式庫，不會傳送任何使用者資料。'
      };

      fs.writeFileSync(
        path.join(testExtensionDir, 'manifest.json'),
        JSON.stringify(validManifest, null, 2)
      );

      const result = await complianceChecker.checkPermissionCompliance(
        path.join(testExtensionDir, 'manifest.json')
      );

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('應該檢測缺少權限描述', async () => {
      const invalidManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
        permissions: ['activeTab', 'scripting'],
        host_permissions: ['https://cdn.jsdelivr.net/*']
        // 缺少權限描述
      };

      fs.writeFileSync(
        path.join(testExtensionDir, 'manifest.json'),
        JSON.stringify(invalidManifest, null, 2)
      );

      const result = await complianceChecker.checkPermissionCompliance(
        path.join(testExtensionDir, 'manifest.json')
      );

      expect(result.passed).toBe(false);
      expect(result.errors).toContain('有權限但缺少 permissions_description');
      expect(result.errors).toContain('有主機權限但缺少 host_permissions_description');
    });

    test('應該檢測權限描述太短', async () => {
      const invalidManifest = {
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
        permissions: ['activeTab'],
        permissions_description: '太短', // 少於 30 字元
        host_permissions: ['https://cdn.jsdelivr.net/*'],
        host_permissions_description: '短' // 少於 30 字元
      };

      fs.writeFileSync(
        path.join(testExtensionDir, 'manifest.json'),
        JSON.stringify(invalidManifest, null, 2)
      );

      const result = await complianceChecker.checkPermissionCompliance(
        path.join(testExtensionDir, 'manifest.json')
      );

      expect(result.passed).toBe(false);
      expect(result.errors).toContain('permissions_description 太短: 2 字元');
      expect(result.errors).toContain('host_permissions_description 太短: 1 字元');
    });
  });

  describe('隱私政策合規性測試', () => {
    test('應該通過有效的隱私政策', async () => {
      const privacyPolicy = `
        <html>
        <head><title>隱私政策</title></head>
        <body>
          <h1>隱私政策</h1>
          <h2>資料收集</h2>
          <p>我們不收集任何個人資料。</p>
          <h2>資料使用</h2>
          <p>我們不會使用任何個人資料。</p>
          <h2>第三方服務</h2>
          <p>我們使用 OpenCC 函式庫進行文字轉換。</p>
        </body>
        </html>
      `;

      fs.writeFileSync(
        path.join(testExtensionDir, 'privacy-policy.html'),
        privacyPolicy
      );

      const result = await complianceChecker.checkPrivacyCompliance(testExtensionDir);

      expect(result.passed).toBe(true);
      expect(result.details.privacyPolicy.exists).toBe(true);
    });

    test('應該檢測缺少隱私政策檔案', async () => {
      const result = await complianceChecker.checkPrivacyCompliance(testExtensionDir);

      expect(result.passed).toBe(false);
      expect(result.errors).toContain('缺少隱私政策檔案: privacy-policy.html');
    });
  });

  describe('內容合規性測試', () => {
    test('應該通過安全的 JavaScript 程式碼', async () => {
      const safeCode = `
        // 安全的程式碼
        function copyText(text) {
          navigator.clipboard.writeText(text);
        }
        
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
          if (request.action === 'copy') {
            copyText(request.text);
          }
        });
      `;

      fs.writeFileSync(
        path.join(testExtensionDir, 'content-script.js'),
        safeCode
      );

      const result = await complianceChecker.checkContentCompliance(testExtensionDir);

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('應該檢測禁止的程式碼', async () => {
      const unsafeCode = `
        // 不安全的程式碼
        eval('console.log("dangerous")');
        document.innerHTML = userInput;
      `;

      fs.writeFileSync(
        path.join(testExtensionDir, 'unsafe-script.js'),
        unsafeCode
      );

      const result = await complianceChecker.checkContentCompliance(testExtensionDir);

      expect(result.passed).toBe(false);
      expect(result.errors.some(error => error.includes('eval('))).toBe(true);
      expect(result.errors.some(error => error.includes('innerHTML ='))).toBe(true);
    });
  });

  describe('完整合規性檢查', () => {
    test('應該通過完整的合規性檢查', async () => {
      // 創建完整的測試擴充功能
      const validManifest = {
        manifest_version: 3,
        name: 'Quick Text Copy Compliance Test',
        version: '1.0.0',
        description: '這是一個完整的合規性測試擴充功能',
        permissions: ['activeTab', 'scripting'],
        host_permissions: ['https://cdn.jsdelivr.net/*'],
        permissions_description: '此擴充功能需要權限來提供複製功能，我們不會收集或儲存任何個人資料。',
        host_permissions_description: '需要存取 CDN 來載入 OpenCC 轉換函式庫，不會傳送任何使用者資料。',
        icons: {
          '16': 'icons/icon16.png',
          '32': 'icons/icon32.png',
          '48': 'icons/icon48.png',
          '128': 'icons/icon128.png'
        }
      };

      fs.writeFileSync(
        path.join(testExtensionDir, 'manifest.json'),
        JSON.stringify(validManifest, null, 2)
      );

      // 創建圖示
      const iconsDir = path.join(testExtensionDir, 'icons');
      fs.mkdirSync(iconsDir, { recursive: true });
      [16, 32, 48, 128].forEach(size => {
        fs.writeFileSync(
          path.join(iconsDir, `icon${size}.png`),
          `fake png content for ${size}x${size}`
        );
      });

      // 創建隱私政策
      const privacyPolicy = `
        <html>
        <head><title>隱私政策</title></head>
        <body>
          <h1>隱私政策</h1>
          <h2>資料收集</h2>
          <p>我們不收集任何個人資料。</p>
          <h2>第三方服務</h2>
          <p>我們使用 OpenCC 函式庫。</p>
        </body>
        </html>
      `;

      fs.writeFileSync(
        path.join(testExtensionDir, 'privacy-policy.html'),
        privacyPolicy
      );

      // 創建安全的 JavaScript 檔案
      fs.writeFileSync(
        path.join(testExtensionDir, 'service-worker.js'),
        'chrome.runtime.onInstalled.addListener(() => { console.log("Extension installed"); });'
      );

      const result = await complianceChecker.runFullComplianceCheck(testExtensionDir);

      expect(result.overall).toBe(true);
      expect(result.summary.failed).toBe(0);
      expect(result.allErrors).toHaveLength(0);
    }, 10000);
  });
});