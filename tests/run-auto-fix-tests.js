#!/usr/bin/env node

/**
 * 自動修正測試執行器
 * 執行所有修正動作相關的測試
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoFixTestRunner {
  constructor() {
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      suites: []
    };
    
    this.testSuites = [
      {
        name: '修正策略測試',
        file: 'tests/unit/auto-fix-strategies.test.js',
        description: '測試各種修正策略的正確性'
      },
      {
        name: '安全性測試',
        file: 'tests/unit/auto-fix-security.test.js',
        description: '驗證自動化修正的安全性'
      }
    ];
  }

  /**
   * 檢查測試環境
   */
  checkTestEnvironment() {
    console.log('🔍 檢查測試環境...');
    
    // 檢查 Jest 是否安裝
    try {
      execSync('npx jest --version', { stdio: 'pipe' });
      console.log('✅ Jest 已安裝');
    } catch (error) {
      console.log('❌ Jest 未安裝，嘗試安裝...');
      try {
        execSync('npm install --save-dev jest', { stdio: 'inherit' });
        console.log('✅ Jest 安裝完成');
      } catch (installError) {
        console.error('❌ Jest 安裝失敗:', installError.message);
        return false;
      }
    }

    // 檢查測試檔案是否存在
    for (const suite of this.testSuites) {
      if (!fs.existsSync(suite.file)) {
        console.error(`❌ 測試檔案不存在: ${suite.file}`);
        return false;
      }
      console.log(`✅ 測試檔案存在: ${suite.file}`);
    }

    // 檢查被測試的模組是否存在
    const requiredModules = [
      'auto-fix-engine.js',
      'automated-fix-executor.js'
    ];

    for (const module of requiredModules) {
      if (!fs.existsSync(module)) {
        console.error(`❌ 必要模組不存在: ${module}`);
        return false;
      }
      console.log(`✅ 模組存在: ${module}`);
    }

    return true;
  }

  /**
   * 執行單個測試套件
   */
  async runTestSuite(suite) {
    console.log(`\n🧪 執行測試套件: ${suite.name}`);
    console.log(`📝 描述: ${suite.description}`);
    console.log('-'.repeat(60));

    try {
      const startTime = Date.now();
      
      // 執行 Jest 測試
      const output = execSync(`npx jest ${suite.file} --verbose --no-cache`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 解析測試結果
      const testResult = this.parseJestOutput(output);
      testResult.name = suite.name;
      testResult.file = suite.file;
      testResult.duration = duration;
      testResult.status = 'passed';

      this.testResults.suites.push(testResult);
      this.testResults.total += testResult.total;
      this.testResults.passed += testResult.passed;
      this.testResults.failed += testResult.failed;

      console.log(`✅ ${suite.name} 完成`);
      console.log(`   通過: ${testResult.passed}/${testResult.total}`);
      console.log(`   耗時: ${duration}ms`);

      return testResult;
    } catch (error) {
      const testResult = {
        name: suite.name,
        file: suite.file,
        status: 'failed',
        error: error.message,
        total: 0,
        passed: 0,
        failed: 1,
        duration: 0
      };

      this.testResults.suites.push(testResult);
      this.testResults.total += 1;
      this.testResults.failed += 1;

      console.log(`❌ ${suite.name} 失敗`);
      console.log(`   錯誤: ${error.message}`);

      return testResult;
    }
  }

  /**
   * 解析 Jest 輸出
   */
  parseJestOutput(output) {
    const result = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };

    // 解析測試統計
    const statsMatch = output.match(/Tests:\s+(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/);
    if (statsMatch) {
      result.failed = parseInt(statsMatch[1]);
      result.passed = parseInt(statsMatch[2]);
      result.total = parseInt(statsMatch[3]);
    } else {
      // 如果沒有失敗的測試，嘗試其他格式
      const passedMatch = output.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/);
      if (passedMatch) {
        result.passed = parseInt(passedMatch[1]);
        result.total = parseInt(passedMatch[2]);
        result.failed = 0;
      }
    }

    // 解析個別測試結果
    const testLines = output.split('\n').filter(line => 
      line.includes('✓') || line.includes('✗') || line.includes('×')
    );

    testLines.forEach(line => {
      if (line.includes('✓')) {
        result.details.push({ status: 'passed', name: line.trim() });
      } else if (line.includes('✗') || line.includes('×')) {
        result.details.push({ status: 'failed', name: line.trim() });
      }
    });

    return result;
  }

  /**
   * 執行所有測試
   */
  async runAllTests() {
    console.log('🚀 開始執行自動修正測試套件');
    console.log('='.repeat(60));

    // 檢查測試環境
    if (!this.checkTestEnvironment()) {
      console.error('❌ 測試環境檢查失敗，無法執行測試');
      return false;
    }

    console.log('\n✅ 測試環境檢查通過');

    // 執行所有測試套件
    for (const suite of this.testSuites) {
      await this.runTestSuite(suite);
    }

    // 顯示測試摘要
    this.displayTestSummary();

    // 生成測試報告
    await this.generateTestReport();

    return this.testResults.failed === 0;
  }

  /**
   * 顯示測試摘要
   */
  displayTestSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 測試結果摘要');
    console.log('='.repeat(60));

    const successRate = this.testResults.total > 0 ? 
      Math.round((this.testResults.passed / this.testResults.total) * 100) : 0;

    console.log(`總測試數: ${this.testResults.total}`);
    console.log(`✅ 通過: ${this.testResults.passed} (${successRate}%)`);
    console.log(`❌ 失敗: ${this.testResults.failed}`);

    console.log('\n📋 測試套件詳情:');
    this.testResults.suites.forEach(suite => {
      const status = suite.status === 'passed' ? '✅' : '❌';
      const rate = suite.total > 0 ? 
        Math.round((suite.passed / suite.total) * 100) : 0;
      
      console.log(`${status} ${suite.name}: ${suite.passed}/${suite.total} (${rate}%) - ${suite.duration}ms`);
      
      if (suite.status === 'failed' && suite.error) {
        console.log(`   錯誤: ${suite.error}`);
      }
    });

    if (this.testResults.failed === 0) {
      console.log('\n🎉 所有測試通過！自動修正功能已準備就緒。');
    } else {
      console.log('\n⚠️  有測試失敗，請檢查並修正問題。');
    }

    console.log('='.repeat(60));
  }

  /**
   * 生成測試報告
   */
  async generateTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        successRate: this.testResults.total > 0 ? 
          Math.round((this.testResults.passed / this.testResults.total) * 100) : 0
      },
      suites: this.testResults.suites,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        cwd: process.cwd(),
        testRunner: 'Jest'
      },
      recommendations: this.generateRecommendations()
    };

    // 生成 JSON 報告
    const jsonReportPath = `auto-fix-test-report-${Date.now()}.json`;
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

    // 生成 Markdown 報告
    const markdownReport = this.generateMarkdownReport(report);
    const mdReportPath = `auto-fix-test-report-${Date.now()}.md`;
    fs.writeFileSync(mdReportPath, markdownReport);

    console.log(`\n📄 測試報告已生成:`);
    console.log(`   JSON: ${jsonReportPath}`);
    console.log(`   Markdown: ${mdReportPath}`);

    return { jsonReportPath, mdReportPath };
  }

  /**
   * 生成建議
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.testResults.failed > 0) {
      recommendations.push('修正失敗的測試案例，確保所有修正策略都能正常工作');
    }

    if (this.testResults.total < 50) {
      recommendations.push('考慮增加更多測試案例，提高測試覆蓋率');
    }

    const securitySuite = this.testResults.suites.find(s => s.name.includes('安全性'));
    if (securitySuite && securitySuite.failed > 0) {
      recommendations.push('優先修正安全性測試失敗，確保自動修正的安全性');
    }

    if (recommendations.length === 0) {
      recommendations.push('所有測試通過，自動修正功能已準備就緒');
    }

    return recommendations;
  }

  /**
   * 生成 Markdown 報告
   */
  generateMarkdownReport(report) {
    return `# 自動修正測試報告

## 測試摘要

- **執行時間**: ${report.timestamp}
- **總測試數**: ${report.summary.total}
- **通過**: ${report.summary.passed}
- **失敗**: ${report.summary.failed}
- **成功率**: ${report.summary.successRate}%

## 測試套件結果

${report.suites.map(suite => `
### ${suite.name}

- **狀態**: ${suite.status === 'passed' ? '✅ 通過' : '❌ 失敗'}
- **檔案**: \`${suite.file}\`
- **測試數**: ${suite.total}
- **通過**: ${suite.passed}
- **失敗**: ${suite.failed}
- **耗時**: ${suite.duration}ms

${suite.error ? `**錯誤**: ${suite.error}` : ''}
`).join('\n')}

## 建議

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## 環境資訊

- **Node.js 版本**: ${report.environment.nodeVersion}
- **平台**: ${report.environment.platform}
- **測試執行器**: ${report.environment.testRunner}
- **工作目錄**: ${report.environment.cwd}

---

*報告生成時間: ${report.timestamp}*
`;
  }

  /**
   * 執行特定測試套件
   */
  async runSpecificSuite(suiteName) {
    const suite = this.testSuites.find(s => 
      s.name.toLowerCase().includes(suiteName.toLowerCase())
    );

    if (!suite) {
      console.error(`❌ 找不到測試套件: ${suiteName}`);
      console.log('可用的測試套件:');
      this.testSuites.forEach(s => console.log(`  - ${s.name}`));
      return false;
    }

    console.log(`🚀 執行特定測試套件: ${suite.name}`);
    console.log('='.repeat(60));

    if (!this.checkTestEnvironment()) {
      return false;
    }

    const result = await this.runTestSuite(suite);
    
    console.log('\n📊 測試結果:');
    console.log(`通過: ${result.passed}/${result.total}`);
    console.log(`狀態: ${result.status}`);

    return result.status === 'passed';
  }
}

// 命令列介面
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const runner = new AutoFixTestRunner();
  
  switch (command) {
    case 'all':
    case undefined:
      runner.runAllTests()
        .then(success => {
          process.exit(success ? 0 : 1);
        })
        .catch(error => {
          console.error('測試執行失敗:', error);
          process.exit(1);
        });
      break;
      
    case 'strategies':
      runner.runSpecificSuite('策略')
        .then(success => {
          process.exit(success ? 0 : 1);
        })
        .catch(error => {
          console.error('測試執行失敗:', error);
          process.exit(1);
        });
      break;
      
    case 'security':
      runner.runSpecificSuite('安全性')
        .then(success => {
          process.exit(success ? 0 : 1);
        })
        .catch(error => {
          console.error('測試執行失敗:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log(`
自動修正測試執行器使用方法:
  node tests/run-auto-fix-tests.js [command]

命令:
  all         執行所有測試 (預設)
  strategies  只執行修正策略測試
  security    只執行安全性測試

範例:
  node tests/run-auto-fix-tests.js
  node tests/run-auto-fix-tests.js strategies
  node tests/run-auto-fix-tests.js security
      `);
      break;
  }
}

module.exports = AutoFixTestRunner;