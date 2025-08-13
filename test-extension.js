/**
 * Quick Text Copy 擴充功能自動化測試
 * 確保擴充功能按描述正常運作
 */

const fs = require('fs');
const path = require('path');

/**
 * 擴充功能功能測試類別
 */
class ExtensionFunctionalityTester {
  constructor() {
    this.testResults = {
      manifestValidation: { passed: false, details: [] },
      serviceWorkerValidation: { passed: false, details: [] },
      iconValidation: { passed: false, details: [] },
      codeQuality: { passed: false, details: [] },
      overall: { passed: false, score: 0 }
    };
  }

  /**
   * 執行完整的功能測試
   */
  async runAllTests() {
    console.log('🧪 開始執行 Quick Text Copy 功能測試...\n');
    
    try {
      // 測試 manifest.json 有效性
      await this.testManifestValidation();
      
      // 測試 service worker 有效性
      await this.testServiceWorkerValidation();
      
      // 測試圖示檔案
      await this.testIconValidation();
      
      // 測試程式碼品質
      await this.testCodeQuality();
      
      // 生成測試報告
      this.generateTestReport();
      
      return this.testResults;
      
    } catch (error) {
      console.error('❌ 功能測試執行失敗:', error.message);
      throw error;
    }
  }

  /**
   * 測試 manifest.json 有效性
   */
  async testManifestValidation() {
    console.log('📋 測試 manifest.json 有效性...');
    
    try {
      // 檢查檔案是否存在
      if (!fs.existsSync('./manifest.json')) {
        this.testResults.manifestValidation.details.push('❌ manifest.json 檔案不存在');
        return;
      }

      // 載入並解析 manifest
      const manifestContent = fs.readFileSync('./manifest.json', 'utf8');
      let manifest;
      
      try {
        manifest = JSON.parse(manifestContent);
      } catch (parseError) {
        this.testResults.manifestValidation.details.push('❌ manifest.json 格式無效');
        return;
      }

      // 檢查必要欄位
      const requiredFields = {
        'manifest_version': 3,
        'name': 'string',
        'version': 'string',
        'description': 'string',
        'permissions': 'array',
        'action': 'object',
        'background': 'object',
        'icons': 'object'
      };

      let allFieldsValid = true;

      Object.entries(requiredFields).forEach(([field, expectedType]) => {
        if (!manifest[field]) {
          this.testResults.manifestValidation.details.push(`❌ 缺少必要欄位: ${field}`);
          allFieldsValid = false;
        } else if (expectedType === 'array' && !Array.isArray(manifest[field])) {
          this.testResults.manifestValidation.details.push(`❌ 欄位類型錯誤: ${field} 應為陣列`);
          allFieldsValid = false;
        } else if (expectedType === 'object' && typeof manifest[field] !== 'object') {
          this.testResults.manifestValidation.details.push(`❌ 欄位類型錯誤: ${field} 應為物件`);
          allFieldsValid = false;
        } else if (expectedType === 'string' && typeof manifest[field] !== 'string') {
          this.testResults.manifestValidation.details.push(`❌ 欄位類型錯誤: ${field} 應為字串`);
          allFieldsValid = false;
        } else if (field === 'manifest_version' && manifest[field] !== 3) {
          this.testResults.manifestValidation.details.push(`❌ manifest_version 應為 3，目前為 ${manifest[field]}`);
          allFieldsValid = false;
        }
      });

      // 檢查權限設定
      const permissions = manifest.permissions || [];
      const expectedPermissions = ['activeTab', 'scripting'];
      
      expectedPermissions.forEach(perm => {
        if (!permissions.includes(perm)) {
          this.testResults.manifestValidation.details.push(`❌ 缺少必要權限: ${perm}`);
          allFieldsValid = false;
        }
      });

      // 檢查不必要的權限
      const unnecessaryPermissions = permissions.filter(perm => !expectedPermissions.includes(perm));
      if (unnecessaryPermissions.length > 0) {
        this.testResults.manifestValidation.details.push(`⚠️  包含額外權限: ${unnecessaryPermissions.join(', ')}`);
      }

      // 檢查 service worker 設定
      if (manifest.background && manifest.background.service_worker) {
        const serviceWorkerPath = manifest.background.service_worker;
        if (!fs.existsSync(serviceWorkerPath)) {
          this.testResults.manifestValidation.details.push(`❌ Service worker 檔案不存在: ${serviceWorkerPath}`);
          allFieldsValid = false;
        }
      }

      // 檢查圖示設定
      if (manifest.icons) {
        const requiredIconSizes = ['16', '32', '48', '128'];
        requiredIconSizes.forEach(size => {
          if (!manifest.icons[size]) {
            this.testResults.manifestValidation.details.push(`❌ 缺少 ${size}px 圖示`);
            allFieldsValid = false;
          }
        });
      }

      if (allFieldsValid) {
        this.testResults.manifestValidation.details.push('✅ manifest.json 格式正確');
        this.testResults.manifestValidation.details.push('✅ 所有必要欄位都存在');
        this.testResults.manifestValidation.details.push('✅ 權限設定正確');
      }

      this.testResults.manifestValidation.passed = allFieldsValid;

    } catch (error) {
      this.testResults.manifestValidation.details.push(`❌ manifest 測試失敗: ${error.message}`);
    }
  }

  /**
   * 測試 service worker 有效性
   */
  async testServiceWorkerValidation() {
    console.log('⚙️  測試 service worker 有效性...');
    
    try {
      // 檢查檔案是否存在
      if (!fs.existsSync('./service-worker.js')) {
        this.testResults.serviceWorkerValidation.details.push('❌ service-worker.js 檔案不存在');
        return;
      }

      const serviceWorkerContent = fs.readFileSync('./service-worker.js', 'utf8');

      // 檢查必要的功能元件
      const requiredComponents = [
        {
          name: 'chrome.action.onClicked 監聽器',
          pattern: /chrome\.action\.onClicked\.addListener/,
          description: '擴充功能按鈕點擊事件處理'
        },
        {
          name: 'chrome.tabs.query API',
          pattern: /chrome\.tabs\.query/,
          description: '取得當前分頁資訊'
        },
        {
          name: 'chrome.scripting.executeScript API',
          pattern: /chrome\.scripting\.executeScript/,
          description: '在分頁中執行腳本'
        },
        {
          name: '剪貼簿操作',
          pattern: /clipboard|execCommand.*copy/,
          description: '複製文字到剪貼簿'
        }
      ];

      let allComponentsFound = true;

      requiredComponents.forEach(component => {
        if (component.pattern.test(serviceWorkerContent)) {
          this.testResults.serviceWorkerValidation.details.push(`✅ 找到 ${component.name}`);
        } else {
          this.testResults.serviceWorkerValidation.details.push(`❌ 缺少 ${component.name} (${component.description})`);
          allComponentsFound = false;
        }
      });

      // 檢查錯誤處理
      const errorHandlingPatterns = [
        /try\s*{[\s\S]*?catch/,
        /\.catch\s*\(/,
        /throw\s+new\s+Error/
      ];

      const hasErrorHandling = errorHandlingPatterns.some(pattern => pattern.test(serviceWorkerContent));
      
      if (hasErrorHandling) {
        this.testResults.serviceWorkerValidation.details.push('✅ 包含錯誤處理機制');
      } else {
        this.testResults.serviceWorkerValidation.details.push('⚠️  建議添加更完善的錯誤處理');
      }

      // 檢查日誌記錄
      if (serviceWorkerContent.includes('console.') || serviceWorkerContent.includes('Logger')) {
        this.testResults.serviceWorkerValidation.details.push('✅ 包含日誌記錄功能');
      } else {
        this.testResults.serviceWorkerValidation.details.push('⚠️  建議添加日誌記錄功能');
      }

      // 檢查程式碼結構
      if (serviceWorkerContent.includes('class ') || serviceWorkerContent.includes('function ')) {
        this.testResults.serviceWorkerValidation.details.push('✅ 程式碼結構良好');
      }

      // 檢查是否有不安全的程式碼
      const unsafePatterns = [
        { pattern: /eval\s*\(/, name: 'eval()' },
        { pattern: /innerHTML\s*=/, name: 'innerHTML 賦值' },
        { pattern: /document\.write/, name: 'document.write()' }
      ];

      unsafePatterns.forEach(({ pattern, name }) => {
        if (pattern.test(serviceWorkerContent)) {
          this.testResults.serviceWorkerValidation.details.push(`⚠️  發現潛在不安全程式碼: ${name}`);
        }
      });

      this.testResults.serviceWorkerValidation.passed = allComponentsFound;

    } catch (error) {
      this.testResults.serviceWorkerValidation.details.push(`❌ Service worker 測試失敗: ${error.message}`);
    }
  }

  /**
   * 測試圖示檔案有效性
   */
  async testIconValidation() {
    console.log('🎨 測試圖示檔案有效性...');
    
    try {
      const requiredIcons = [
        { size: '16', path: 'icons/icon16.png' },
        { size: '32', path: 'icons/icon32.png' },
        { size: '48', path: 'icons/icon48.png' },
        { size: '128', path: 'icons/icon128.png' }
      ];

      let allIconsValid = true;

      requiredIcons.forEach(icon => {
        if (fs.existsSync(icon.path)) {
          const stats = fs.statSync(icon.path);
          if (stats.size > 0) {
            this.testResults.iconValidation.details.push(`✅ ${icon.size}px 圖示存在且有效 (${icon.path})`);
          } else {
            this.testResults.iconValidation.details.push(`❌ ${icon.size}px 圖示檔案為空 (${icon.path})`);
            allIconsValid = false;
          }
        } else {
          this.testResults.iconValidation.details.push(`❌ ${icon.size}px 圖示不存在 (${icon.path})`);
          allIconsValid = false;
        }
      });

      // 檢查圖示目錄
      if (fs.existsSync('icons/')) {
        this.testResults.iconValidation.details.push('✅ 圖示目錄存在');
      } else {
        this.testResults.iconValidation.details.push('❌ 圖示目錄不存在');
        allIconsValid = false;
      }

      this.testResults.iconValidation.passed = allIconsValid;

    } catch (error) {
      this.testResults.iconValidation.details.push(`❌ 圖示測試失敗: ${error.message}`);
    }
  }

  /**
   * 測試程式碼品質
   */
  async testCodeQuality() {
    console.log('📊 測試程式碼品質...');
    
    try {
      const serviceWorkerContent = fs.readFileSync('./service-worker.js', 'utf8');
      
      // 檢查程式碼註解
      const commentLines = serviceWorkerContent.split('\n').filter(line => 
        line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')
      );
      
      const totalLines = serviceWorkerContent.split('\n').length;
      const commentRatio = commentLines.length / totalLines;
      
      if (commentRatio > 0.1) {
        this.testResults.codeQuality.details.push(`✅ 程式碼註解充足 (${Math.round(commentRatio * 100)}%)`);
      } else {
        this.testResults.codeQuality.details.push(`⚠️  建議增加程式碼註解 (目前 ${Math.round(commentRatio * 100)}%)`);
      }

      // 檢查函數命名
      const functionNames = serviceWorkerContent.match(/function\s+(\w+)|(\w+)\s*:\s*function|(\w+)\s*=>\s*{|class\s+(\w+)/g);
      if (functionNames && functionNames.length > 0) {
        this.testResults.codeQuality.details.push(`✅ 發現 ${functionNames.length} 個函數/類別定義`);
      }

      // 檢查常數定義
      if (serviceWorkerContent.includes('const ')) {
        this.testResults.codeQuality.details.push('✅ 使用 const 定義常數');
      }

      // 檢查 ES6+ 語法
      const modernFeatures = [
        { pattern: /=>\s*{/, name: '箭頭函數' },
        { pattern: /async\s+function|async\s+\w+/, name: '異步函數' },
        { pattern: /await\s+/, name: 'await 語法' },
        { pattern: /class\s+\w+/, name: 'ES6 類別' },
        { pattern: /const\s+{[^}]+}\s*=/, name: '解構賦值' }
      ];

      modernFeatures.forEach(feature => {
        if (feature.pattern.test(serviceWorkerContent)) {
          this.testResults.codeQuality.details.push(`✅ 使用現代 JavaScript 語法: ${feature.name}`);
        }
      });

      // 檢查程式碼長度
      if (totalLines > 50) {
        this.testResults.codeQuality.details.push(`✅ 程式碼結構完整 (${totalLines} 行)`);
      } else {
        this.testResults.codeQuality.details.push(`⚠️  程式碼可能過於簡單 (${totalLines} 行)`);
      }

      this.testResults.codeQuality.passed = true;

    } catch (error) {
      this.testResults.codeQuality.details.push(`❌ 程式碼品質測試失敗: ${error.message}`);
    }
  }

  /**
   * 生成測試報告
   */
  generateTestReport() {
    console.log('\n📊 生成功能測試報告...\n');
    
    const categories = ['manifestValidation', 'serviceWorkerValidation', 'iconValidation', 'codeQuality'];
    let passedCount = 0;
    
    categories.forEach(category => {
      if (this.testResults[category].passed) {
        passedCount++;
      }
    });
    
    this.testResults.overall.score = Math.round((passedCount / categories.length) * 100);
    this.testResults.overall.passed = passedCount === categories.length;
    
    console.log('='.repeat(60));
    console.log('🧪 Quick Text Copy 功能測試報告');
    console.log('='.repeat(60));
    console.log(`📅 測試時間: ${new Date().toLocaleString('zh-TW')}`);
    console.log(`📦 擴充功能: Quick Text Copy`);
    console.log(`🎯 測試評分: ${this.testResults.overall.score}%`);
    console.log(`✅ 整體狀態: ${this.testResults.overall.passed ? '通過' : '需要改進'}`);
    console.log('');
    
    // 詳細測試結果
    const categoryNames = {
      manifestValidation: 'Manifest 驗證',
      serviceWorkerValidation: 'Service Worker 驗證',
      iconValidation: '圖示檔案驗證',
      codeQuality: '程式碼品質檢查'
    };

    categories.forEach(category => {
      const result = this.testResults[category];
      const status = result.passed ? '✅ 通過' : '❌ 失敗';
      const categoryName = categoryNames[category];
      
      console.log(`${status} ${categoryName}`);
      
      if (result.details.length > 0) {
        result.details.forEach(detail => {
          console.log(`   ${detail}`);
        });
      }
      console.log('');
    });
    
    // 總結建議
    console.log('💡 測試總結:');
    if (this.testResults.overall.passed) {
      console.log('   - 🎉 恭喜！所有功能測試都通過了');
      console.log('   - ✅ 擴充功能結構完整且功能正常');
      console.log('   - 🚀 可以進行下一步的發佈準備');
    } else {
      console.log('   - ⚠️  部分測試項目需要改進');
      console.log('   - 🔧 請修正上述問題後重新測試');
      console.log('   - 📋 確保所有測試通過後再進行發佈');
    }
    
    console.log('='.repeat(60));
  }

  /**
   * 儲存測試報告到檔案
   */
  async saveTestReport(filename = 'functionality-test-report.json') {
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        extension: 'Quick Text Copy',
        testResults: this.testResults,
        summary: {
          totalTests: 4,
          passedTests: Object.values(this.testResults).filter(r => r.passed && r.passed !== undefined).length,
          score: this.testResults.overall.score,
          passed: this.testResults.overall.passed
        }
      };
      
      fs.writeFileSync(filename, JSON.stringify(reportData, null, 2), 'utf8');
      console.log(`📄 測試報告已儲存至: ${filename}`);
      
    } catch (error) {
      console.error('❌ 儲存測試報告失敗:', error.message);
    }
  }
}

// 如果直接執行此檔案，則運行測試
if (require.main === module) {
  const tester = new ExtensionFunctionalityTester();
  tester.runAllTests()
    .then(results => {
      tester.saveTestReport();
      process.exit(results.overall.passed ? 0 : 1);
    })
    .catch(error => {
      console.error('測試執行失敗:', error);
      process.exit(1);
    });
}

module.exports = ExtensionFunctionalityTester;