/**
 * Chrome Web Store 合規性檢查工具
 * 確保 Quick Text Copy 擴充功能符合 Chrome Web Store 政策要求
 */

const fs = require('fs');
const path = require('path');

/**
 * 合規性檢查器主類別
 */
class ComplianceChecker {
  constructor() {
    this.manifestPath = './manifest.json';
    this.serviceWorkerPath = './service-worker.js';
    this.checkResults = {
      permissions: { passed: false, issues: [] },
      privacy: { passed: false, issues: [] },
      security: { passed: false, issues: [] },
      functionality: { passed: false, issues: [] },
      overall: { passed: false, score: 0 }
    };
  }

  /**
   * 執行完整的合規性檢查
   */
  async runFullCheck() {
    console.log('🔍 開始執行 Chrome Web Store 合規性檢查...\n');
    
    try {
      // 檢查權限
      await this.checkPermissions();
      
      // 檢查隱私政策
      await this.checkPrivacyPolicy();
      
      // 檢查內容安全政策
      await this.checkContentSecurityPolicy();
      
      // 檢查功能性
      await this.checkFunctionality();
      
      // 生成最終報告
      this.generateReport();
      
      return this.checkResults;
      
    } catch (error) {
      console.error('❌ 合規性檢查執行失敗:', error.message);
      throw error;
    }
  }

  /**
   * 檢查權限設定
   * 確保只請求必要權限（activeTab、scripting）
   */
  async checkPermissions() {
    console.log('📋 檢查權限設定...');
    
    try {
      const manifest = this.loadManifest();
      const permissions = manifest.permissions || [];
      
      // 必要權限清單
      const requiredPermissions = ['activeTab', 'scripting'];
      const allowedPermissions = ['activeTab', 'scripting'];
      
      // 檢查是否包含所有必要權限
      const missingPermissions = requiredPermissions.filter(
        perm => !permissions.includes(perm)
      );
      
      if (missingPermissions.length > 0) {
        this.checkResults.permissions.issues.push(
          `缺少必要權限: ${missingPermissions.join(', ')}`
        );
      }
      
      // 檢查是否有不必要的權限
      const unnecessaryPermissions = permissions.filter(
        perm => !allowedPermissions.includes(perm)
      );
      
      if (unnecessaryPermissions.length > 0) {
        this.checkResults.permissions.issues.push(
          `包含不必要權限: ${unnecessaryPermissions.join(', ')}`
        );
      }
      
      // 檢查權限用途說明
      if (!manifest.permissions_description && permissions.length > 0) {
        this.checkResults.permissions.issues.push(
          '建議在 manifest.json 中添加 permissions_description 說明權限用途'
        );
      }
      
      this.checkResults.permissions.passed = this.checkResults.permissions.issues.length === 0;
      
      if (this.checkResults.permissions.passed) {
        console.log('✅ 權限檢查通過');
      } else {
        console.log('❌ 權限檢查發現問題:');
        this.checkResults.permissions.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
      
    } catch (error) {
      this.checkResults.permissions.issues.push(`權限檢查失敗: ${error.message}`);
      console.log('❌ 權限檢查失敗:', error.message);
    }
  }

  /**
   * 檢查隱私政策
   * 確認不收集使用者資料
   */
  async checkPrivacyPolicy() {
    console.log('🔒 檢查隱私政策...');
    
    try {
      const manifest = this.loadManifest();
      const serviceWorkerContent = this.loadServiceWorker();
      
      // 檢查是否有資料收集相關的 API 使用
      const dataCollectionAPIs = [
        'chrome.storage.sync',
        'chrome.storage.local',
        'chrome.identity',
        'chrome.cookies',
        'chrome.history',
        'chrome.bookmarks',
        'fetch(',
        'XMLHttpRequest',
        'navigator.sendBeacon',
        'analytics',
        'gtag',
        'ga('
      ];
      
      const foundDataCollection = dataCollectionAPIs.filter(api => 
        serviceWorkerContent.includes(api)
      );
      
      if (foundDataCollection.length > 0) {
        this.checkResults.privacy.issues.push(
          `發現可能的資料收集 API: ${foundDataCollection.join(', ')}`
        );
      }
      
      // 檢查是否有實際的網路請求（排除註解中的網址）
      const codeWithoutComments = serviceWorkerContent
        .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行註解
        .replace(/\/\/.*$/gm, ''); // 移除單行註解
      
      const networkPatterns = [
        /fetch\s*\(/g,
        /XMLHttpRequest/g,
        /new\s+XMLHttpRequest/g,
        /navigator\.sendBeacon/g
      ];
      
      networkPatterns.forEach(pattern => {
        const matches = codeWithoutComments.match(pattern);
        if (matches && matches.length > 0) {
          this.checkResults.privacy.issues.push(
            `發現網路請求 API: ${matches.slice(0, 3).join(', ')}`
          );
        }
      });
      
      // 檢查 manifest 中的 host_permissions
      if (manifest.host_permissions && manifest.host_permissions.length > 0) {
        this.checkResults.privacy.issues.push(
          `包含主機權限，可能涉及資料存取: ${manifest.host_permissions.join(', ')}`
        );
      }
      
      this.checkResults.privacy.passed = this.checkResults.privacy.issues.length === 0;
      
      if (this.checkResults.privacy.passed) {
        console.log('✅ 隱私政策檢查通過 - 未發現資料收集行為');
      } else {
        console.log('⚠️  隱私政策檢查發現潛在問題:');
        this.checkResults.privacy.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
      
    } catch (error) {
      this.checkResults.privacy.issues.push(`隱私政策檢查失敗: ${error.message}`);
      console.log('❌ 隱私政策檢查失敗:', error.message);
    }
  }

  /**
   * 檢查內容安全政策
   */
  async checkContentSecurityPolicy() {
    console.log('🛡️  檢查內容安全政策...');
    
    try {
      const manifest = this.loadManifest();
      const serviceWorkerContent = this.loadServiceWorker();
      
      // 檢查是否有 CSP 設定
      if (!manifest.content_security_policy) {
        this.checkResults.security.issues.push(
          '建議設定 content_security_policy 以增強安全性'
        );
      }
      
      // 檢查是否使用 eval 或類似的不安全函數
      const unsafeFunctions = [
        'eval(',
        'Function(',
        'setTimeout(',
        'setInterval(',
        'innerHTML',
        'outerHTML',
        'document.write'
      ];
      
      const foundUnsafe = unsafeFunctions.filter(func => 
        serviceWorkerContent.includes(func)
      );
      
      if (foundUnsafe.length > 0) {
        this.checkResults.security.issues.push(
          `發現潛在不安全函數: ${foundUnsafe.join(', ')}`
        );
      }
      
      // 檢查是否有內聯腳本
      if (serviceWorkerContent.includes('javascript:')) {
        this.checkResults.security.issues.push(
          '發現 javascript: 協議使用，可能違反 CSP'
        );
      }
      
      // 檢查 manifest version
      if (manifest.manifest_version !== 3) {
        this.checkResults.security.issues.push(
          `使用舊版 manifest (v${manifest.manifest_version})，建議升級到 v3`
        );
      }
      
      this.checkResults.security.passed = this.checkResults.security.issues.length === 0;
      
      if (this.checkResults.security.passed) {
        console.log('✅ 內容安全政策檢查通過');
      } else {
        console.log('⚠️  內容安全政策檢查發現問題:');
        this.checkResults.security.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
      
    } catch (error) {
      this.checkResults.security.issues.push(`安全政策檢查失敗: ${error.message}`);
      console.log('❌ 安全政策檢查失敗:', error.message);
    }
  }

  /**
   * 檢查功能性
   * 確保擴充功能按描述正常運作
   */
  async checkFunctionality() {
    console.log('⚙️  檢查功能性...');
    
    try {
      const manifest = this.loadManifest();
      const serviceWorkerContent = this.loadServiceWorker();
      
      // 檢查必要的功能元件
      const requiredComponents = [
        { name: 'action.onClicked 監聽器', pattern: /chrome\.action\.onClicked/g },
        { name: '分頁查詢功能', pattern: /chrome\.tabs\.query/g },
        { name: '腳本注入功能', pattern: /chrome\.scripting\.executeScript/g },
        { name: '剪貼簿操作', pattern: /clipboard|execCommand.*copy/g }
      ];
      
      requiredComponents.forEach(component => {
        if (!component.pattern.test(serviceWorkerContent)) {
          this.checkResults.functionality.issues.push(
            `缺少必要功能: ${component.name}`
          );
        }
      });
      
      // 檢查錯誤處理
      const errorHandlingPatterns = [
        /try\s*{[\s\S]*?catch/g,
        /\.catch\s*\(/g,
        /throw\s+new\s+Error/g
      ];
      
      const hasErrorHandling = errorHandlingPatterns.some(pattern => 
        pattern.test(serviceWorkerContent)
      );
      
      if (!hasErrorHandling) {
        this.checkResults.functionality.issues.push(
          '建議添加更完善的錯誤處理機制'
        );
      }
      
      // 檢查日誌記錄
      if (!serviceWorkerContent.includes('console.') && !serviceWorkerContent.includes('Logger')) {
        this.checkResults.functionality.issues.push(
          '建議添加日誌記錄以便除錯'
        );
      }
      
      // 檢查 manifest 完整性
      const requiredManifestFields = ['name', 'version', 'description', 'permissions', 'action'];
      const missingFields = requiredManifestFields.filter(field => !manifest[field]);
      
      if (missingFields.length > 0) {
        this.checkResults.functionality.issues.push(
          `manifest.json 缺少必要欄位: ${missingFields.join(', ')}`
        );
      }
      
      this.checkResults.functionality.passed = this.checkResults.functionality.issues.length === 0;
      
      if (this.checkResults.functionality.passed) {
        console.log('✅ 功能性檢查通過');
      } else {
        console.log('⚠️  功能性檢查發現問題:');
        this.checkResults.functionality.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
      
    } catch (error) {
      this.checkResults.functionality.issues.push(`功能性檢查失敗: ${error.message}`);
      console.log('❌ 功能性檢查失敗:', error.message);
    }
  }

  /**
   * 載入 manifest.json
   */
  loadManifest() {
    try {
      const manifestContent = fs.readFileSync(this.manifestPath, 'utf8');
      return JSON.parse(manifestContent);
    } catch (error) {
      throw new Error(`無法載入 manifest.json: ${error.message}`);
    }
  }

  /**
   * 載入 service worker
   */
  loadServiceWorker() {
    try {
      return fs.readFileSync(this.serviceWorkerPath, 'utf8');
    } catch (error) {
      throw new Error(`無法載入 service worker: ${error.message}`);
    }
  }

  /**
   * 生成合規性檢查報告
   */
  generateReport() {
    console.log('\n📊 生成合規性檢查報告...\n');
    
    const categories = ['permissions', 'privacy', 'security', 'functionality'];
    let passedCount = 0;
    
    categories.forEach(category => {
      if (this.checkResults[category].passed) {
        passedCount++;
      }
    });
    
    this.checkResults.overall.score = Math.round((passedCount / categories.length) * 100);
    this.checkResults.overall.passed = passedCount === categories.length;
    
    console.log('='.repeat(60));
    console.log('📋 Chrome Web Store 合規性檢查報告');
    console.log('='.repeat(60));
    console.log(`📅 檢查時間: ${new Date().toLocaleString('zh-TW')}`);
    console.log(`📦 擴充功能: Quick Text Copy`);
    console.log(`🎯 總體評分: ${this.checkResults.overall.score}%`);
    console.log(`✅ 整體狀態: ${this.checkResults.overall.passed ? '通過' : '需要改進'}`);
    console.log('');
    
    // 詳細結果
    categories.forEach(category => {
      const result = this.checkResults[category];
      const status = result.passed ? '✅ 通過' : '❌ 失敗';
      const categoryName = this.getCategoryName(category);
      
      console.log(`${status} ${categoryName}`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
      console.log('');
    });
    
    // 建議
    console.log('💡 建議事項:');
    if (this.checkResults.overall.passed) {
      console.log('   - 恭喜！您的擴充功能已通過所有合規性檢查');
      console.log('   - 可以準備提交到 Chrome Web Store');
    } else {
      console.log('   - 請修正上述問題後重新執行檢查');
      console.log('   - 確保所有檢查項目都通過後再提交');
    }
    
    console.log('='.repeat(60));
  }

  /**
   * 取得分類名稱
   */
  getCategoryName(category) {
    const names = {
      permissions: '權限檢查',
      privacy: '隱私政策檢查',
      security: '內容安全政策檢查',
      functionality: '功能性檢查'
    };
    return names[category] || category;
  }

  /**
   * 儲存報告到檔案
   */
  async saveReportToFile(filename = 'compliance-report.json') {
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        extension: 'Quick Text Copy',
        results: this.checkResults,
        summary: {
          totalChecks: 4,
          passedChecks: Object.values(this.checkResults).filter(r => r.passed && r.passed !== undefined).length,
          score: this.checkResults.overall.score,
          passed: this.checkResults.overall.passed
        }
      };
      
      fs.writeFileSync(filename, JSON.stringify(reportData, null, 2), 'utf8');
      console.log(`📄 報告已儲存至: ${filename}`);
      
    } catch (error) {
      console.error('❌ 儲存報告失敗:', error.message);
    }
  }
}

module.exports = ComplianceChecker;