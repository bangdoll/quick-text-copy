/**
 * 測試套件執行器
 * 統一執行所有測試並生成報告
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestSuiteRunner {
  constructor() {
    this.testSuites = {
      unit: {
        name: '單元測試',
        pattern: 'tests/unit',
        timeout: 5000
      },
      integration: {
        name: '整合測試',
        pattern: 'tests/integration',
        timeout: 10000
      },
      e2e: {
        name: '端到端測試',
        pattern: 'tests/e2e',
        timeout: 15000
      },
      compliance: {
        name: '合規性測試',
        pattern: 'tests/compliance',
        timeout: 10000
      }
    };

    this.results = {
      overall: false,
      suites: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      coverage: null,
      startTime: null,
      endTime: null,
      duration: 0
    };
  }

  async runAllTests(options = {}) {
    console.log('🚀 開始執行完整測試套件...\n');
    
    this.results.startTime = new Date();
    
    try {
      // 執行各個測試套件
      for (const [suiteKey, suite] of Object.entries(this.testSuites)) {
        if (options.suites && !options.suites.includes(suiteKey)) {
          console.log(`⏭️  跳過 ${suite.name}`);
          continue;
        }

        console.log(`📋 執行 ${suite.name}...`);
        this.results.suites[suiteKey] = await this.runTestSuite(suiteKey, suite, options);
        
        if (this.results.suites[suiteKey].success) {
          console.log(`✅ ${suite.name} 通過`);
        } else {
          console.log(`❌ ${suite.name} 失敗`);
        }
        console.log('');
      }

      // 生成覆蓋率報告
      if (options.coverage !== false) {
        console.log('📊 生成覆蓋率報告...');
        this.results.coverage = await this.generateCoverageReport();
      }

      // 計算總結果
      this.calculateSummary();
      
      this.results.endTime = new Date();
      this.results.duration = this.results.endTime - this.results.startTime;

      // 生成報告
      await this.generateReport(options.reportPath);

      console.log('🎉 測試套件執行完成！');
      this.printSummary();

    } catch (error) {
      console.error('💥 測試套件執行失敗:', error.message);
      this.results.overall = false;
    }

    return this.results;
  }

  async runTestSuite(suiteKey, suite, options = {}) {
    const result = {
      name: suite.name,
      success: false,
      tests: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      duration: 0,
      output: '',
      errors: []
    };

    try {
      const startTime = Date.now();
      
      // 構建 Jest 命令
      const jestArgs = [
        '--testPathPattern=' + suite.pattern,
        '--testTimeout=' + suite.timeout,
        '--verbose',
        '--json'
      ];

      if (options.coverage !== false) {
        jestArgs.push('--coverage');
      }

      if (options.bail) {
        jestArgs.push('--bail');
      }

      const command = `npx jest ${jestArgs.join(' ')}`;
      
      // 執行測試
      const output = execSync(command, { 
        encoding: 'utf8',
        cwd: process.cwd(),
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });

      result.output = output;
      
      // 解析 Jest JSON 輸出
      const lines = output.split('\n');
      const jsonLine = lines.find(line => line.startsWith('{') && line.includes('"success"'));
      
      if (jsonLine) {
        const jestResult = JSON.parse(jsonLine);
        result.tests.total = jestResult.numTotalTests;
        result.tests.passed = jestResult.numPassedTests;
        result.tests.failed = jestResult.numFailedTests;
        result.tests.skipped = jestResult.numPendingTests;
        result.success = jestResult.success;
      } else {
        // 如果無法解析 JSON，假設成功
        result.success = true;
      }

      result.duration = Date.now() - startTime;

    } catch (error) {
      result.success = false;
      result.errors.push(error.message);
      result.output = error.stdout || error.message;
    }

    return result;
  }

  async generateCoverageReport() {
    try {
      // 執行覆蓋率測試
      const command = 'npx jest --coverage --coverageReporters=json-summary --silent';
      execSync(command, { encoding: 'utf8' });

      // 讀取覆蓋率報告
      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
      
      if (fs.existsSync(coveragePath)) {
        const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        return {
          lines: coverageData.total.lines,
          functions: coverageData.total.functions,
          branches: coverageData.total.branches,
          statements: coverageData.total.statements
        };
      }

      return null;
    } catch (error) {
      console.warn('⚠️  無法生成覆蓋率報告:', error.message);
      return null;
    }
  }

  calculateSummary() {
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    let allSuitesSuccess = true;

    Object.values(this.results.suites).forEach(suite => {
      totalTests += suite.tests.total;
      passedTests += suite.tests.passed;
      failedTests += suite.tests.failed;
      skippedTests += suite.tests.skipped;
      
      if (!suite.success) {
        allSuitesSuccess = false;
      }
    });

    this.results.summary = {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      skipped: skippedTests
    };

    this.results.overall = allSuitesSuccess && failedTests === 0;
  }

  async generateReport(reportPath) {
    const report = {
      timestamp: new Date().toISOString(),
      overall: this.results.overall,
      duration: this.results.duration,
      summary: this.results.summary,
      coverage: this.results.coverage,
      suites: this.results.suites,
      environment: {
        node: process.version,
        platform: process.platform,
        cwd: process.cwd()
      }
    };

    // JSON 報告
    const jsonReportPath = reportPath || path.join(process.cwd(), 'test-results.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

    // Markdown 報告
    const markdownReport = this.generateMarkdownReport(report);
    const mdReportPath = jsonReportPath.replace('.json', '.md');
    fs.writeFileSync(mdReportPath, markdownReport);

    console.log(`📄 測試報告已生成:`);
    console.log(`   JSON: ${jsonReportPath}`);
    console.log(`   Markdown: ${mdReportPath}`);
  }

  generateMarkdownReport(report) {
    const duration = Math.round(report.duration / 1000);
    const successRate = report.summary.total > 0 
      ? Math.round((report.summary.passed / report.summary.total) * 100) 
      : 0;

    let markdown = `# 測試報告

## 總覽

- **執行時間**: ${new Date(report.timestamp).toLocaleString('zh-TW')}
- **總體結果**: ${report.overall ? '✅ 通過' : '❌ 失敗'}
- **執行時長**: ${duration} 秒
- **成功率**: ${successRate}%

## 測試統計

| 項目 | 數量 |
|------|------|
| 總測試數 | ${report.summary.total} |
| 通過 | ${report.summary.passed} |
| 失敗 | ${report.summary.failed} |
| 跳過 | ${report.summary.skipped} |

`;

    // 覆蓋率報告
    if (report.coverage) {
      markdown += `## 程式碼覆蓋率

| 類型 | 覆蓋率 |
|------|--------|
| 行覆蓋率 | ${report.coverage.lines.pct}% (${report.coverage.lines.covered}/${report.coverage.lines.total}) |
| 函數覆蓋率 | ${report.coverage.functions.pct}% (${report.coverage.functions.covered}/${report.coverage.functions.total}) |
| 分支覆蓋率 | ${report.coverage.branches.pct}% (${report.coverage.branches.covered}/${report.coverage.branches.total}) |
| 語句覆蓋率 | ${report.coverage.statements.pct}% (${report.coverage.statements.covered}/${report.coverage.statements.total}) |

`;
    }

    // 各測試套件詳情
    markdown += `## 測試套件詳情

`;

    Object.entries(report.suites).forEach(([key, suite]) => {
      const suiteSuccessRate = suite.tests.total > 0 
        ? Math.round((suite.tests.passed / suite.tests.total) * 100) 
        : 0;
      const suiteDuration = Math.round(suite.duration / 1000);

      markdown += `### ${suite.name}

- **結果**: ${suite.success ? '✅ 通過' : '❌ 失敗'}
- **執行時長**: ${suiteDuration} 秒
- **成功率**: ${suiteSuccessRate}%
- **測試統計**: ${suite.tests.passed}/${suite.tests.total} 通過

`;

      if (suite.errors.length > 0) {
        markdown += `**錯誤訊息**:
\`\`\`
${suite.errors.join('\n')}
\`\`\`

`;
      }
    });

    return markdown;
  }

  printSummary() {
    console.log('\n📊 測試結果總覽:');
    console.log('================');
    console.log(`總體結果: ${this.results.overall ? '✅ 通過' : '❌ 失敗'}`);
    console.log(`執行時長: ${Math.round(this.results.duration / 1000)} 秒`);
    console.log(`總測試數: ${this.results.summary.total}`);
    console.log(`通過: ${this.results.summary.passed}`);
    console.log(`失敗: ${this.results.summary.failed}`);
    console.log(`跳過: ${this.results.summary.skipped}`);
    
    if (this.results.coverage) {
      console.log(`\n覆蓋率: ${this.results.coverage.lines.pct}% (行)`);
    }

    console.log('\n各測試套件:');
    Object.entries(this.results.suites).forEach(([key, suite]) => {
      const status = suite.success ? '✅' : '❌';
      console.log(`  ${status} ${suite.name}: ${suite.tests.passed}/${suite.tests.total}`);
    });
  }

  async runSpecificSuite(suiteName, options = {}) {
    if (!this.testSuites[suiteName]) {
      throw new Error(`未知的測試套件: ${suiteName}`);
    }

    console.log(`🚀 執行 ${this.testSuites[suiteName].name}...`);
    
    const result = await this.runTestSuite(suiteName, this.testSuites[suiteName], options);
    
    if (result.success) {
      console.log(`✅ ${this.testSuites[suiteName].name} 通過`);
    } else {
      console.log(`❌ ${this.testSuites[suiteName].name} 失敗`);
      if (result.errors.length > 0) {
        console.log('錯誤:', result.errors.join('\n'));
      }
    }

    return result;
  }
}

// CLI 介面
if (require.main === module) {
  const args = process.argv.slice(2);
  const runner = new TestSuiteRunner();

  const options = {
    coverage: !args.includes('--no-coverage'),
    bail: args.includes('--bail'),
    suites: null,
    reportPath: null
  };

  // 解析命令列參數
  const suiteArg = args.find(arg => arg.startsWith('--suite='));
  if (suiteArg) {
    options.suites = [suiteArg.split('=')[1]];
  }

  const reportArg = args.find(arg => arg.startsWith('--report='));
  if (reportArg) {
    options.reportPath = reportArg.split('=')[1];
  }

  // 執行測試
  runner.runAllTests(options)
    .then(results => {
      process.exit(results.overall ? 0 : 1);
    })
    .catch(error => {
      console.error('測試執行失敗:', error);
      process.exit(1);
    });
}

module.exports = TestSuiteRunner;