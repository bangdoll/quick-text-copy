#!/usr/bin/env node

/**
 * Chrome Web Store 合規性檢查執行器
 * 整合所有合規性檢查工具並生成完整報告
 */

const ComplianceChecker = require('./compliance-checker');
const ExtensionFunctionalityTester = require('./test-extension');
const fs = require('fs');
const path = require('path');

/**
 * 主要合規性檢查協調器
 */
class ComplianceCheckRunner {
  constructor() {
    this.complianceChecker = new ComplianceChecker();
    this.functionalityTester = new ExtensionFunctionalityTester();
    this.finalReport = {
      timestamp: new Date().toISOString(),
      extension: 'Quick Text Copy',
      compliance: null,
      functionality: null,
      overall: {
        passed: false,
        score: 0,
        readyForSubmission: false
      }
    };
  }

  /**
   * 執行完整的合規性檢查流程
   */
  async runFullComplianceCheck() {
    console.log('🚀 開始執行 Chrome Web Store 完整合規性檢查\n');
    console.log('=' .repeat(70));
    console.log('📦 擴充功能: Quick Text Copy');
    console.log('🎯 目標: Chrome Web Store 發佈準備');
    console.log('📅 檢查時間:', new Date().toLocaleString('zh-TW'));
    console.log('='.repeat(70));
    console.log('');

    try {
      // 第一階段：合規性檢查
      console.log('🔍 第一階段：執行合規性檢查...');
      console.log('-'.repeat(50));
      this.finalReport.compliance = await this.complianceChecker.runFullCheck();
      
      console.log('\n');
      
      // 第二階段：功能性測試
      console.log('🧪 第二階段：執行功能性測試...');
      console.log('-'.repeat(50));
      this.finalReport.functionality = await this.functionalityTester.runAllTests();
      
      console.log('\n');
      
      // 第三階段：生成綜合報告
      console.log('📊 第三階段：生成綜合報告...');
      console.log('-'.repeat(50));
      this.generateFinalReport();
      
      // 儲存報告
      await this.saveFinalReport();
      
      return this.finalReport;
      
    } catch (error) {
      console.error('❌ 合規性檢查執行失敗:', error.message);
      throw error;
    }
  }

  /**
   * 生成最終綜合報告
   */
  generateFinalReport() {
    console.log('\n📋 生成 Chrome Web Store 發佈準備報告...\n');
    
    // 計算總體分數
    const complianceScore = this.finalReport.compliance?.overall?.score || 0;
    const functionalityScore = this.finalReport.functionality?.overall?.score || 0;
    const overallScore = Math.round((complianceScore + functionalityScore) / 2);
    
    // 判斷是否通過所有檢查
    const compliancePassed = this.finalReport.compliance?.overall?.passed || false;
    const functionalityPassed = this.finalReport.functionality?.overall?.passed || false;
    const allPassed = compliancePassed && functionalityPassed;
    
    this.finalReport.overall = {
      passed: allPassed,
      score: overallScore,
      readyForSubmission: allPassed && overallScore >= 90
    };

    // 顯示最終報告
    console.log('='.repeat(70));
    console.log('📋 Chrome Web Store 發佈準備報告');
    console.log('='.repeat(70));
    console.log(`📅 報告時間: ${new Date().toLocaleString('zh-TW')}`);
    console.log(`📦 擴充功能: Quick Text Copy`);
    console.log(`🎯 總體評分: ${overallScore}%`);
    console.log(`✅ 發佈準備: ${this.finalReport.overall.readyForSubmission ? '已就緒' : '需要改進'}`);
    console.log('');

    // 各項檢查結果摘要
    console.log('📊 檢查結果摘要:');
    console.log(`   🔍 合規性檢查: ${compliancePassed ? '✅ 通過' : '❌ 失敗'} (${complianceScore}%)`);
    console.log(`   🧪 功能性測試: ${functionalityPassed ? '✅ 通過' : '❌ 失敗'} (${functionalityScore}%)`);
    console.log('');

    // 詳細問題列表
    if (!allPassed) {
      console.log('⚠️  需要解決的問題:');
      
      if (!compliancePassed) {
        console.log('   📋 合規性問題:');
        Object.entries(this.finalReport.compliance).forEach(([category, result]) => {
          if (result.issues && result.issues.length > 0) {
            result.issues.forEach(issue => {
              console.log(`      - ${issue}`);
            });
          }
        });
      }
      
      if (!functionalityPassed) {
        console.log('   🧪 功能性問題:');
        Object.entries(this.finalReport.functionality).forEach(([category, result]) => {
          if (result.details && result.details.length > 0) {
            const issues = result.details.filter(detail => detail.startsWith('❌'));
            issues.forEach(issue => {
              console.log(`      - ${issue.substring(2)}`);
            });
          }
        });
      }
      console.log('');
    }

    // 下一步建議
    console.log('💡 下一步建議:');
    if (this.finalReport.overall.readyForSubmission) {
      console.log('   🎉 恭喜！您的擴充功能已準備好提交到 Chrome Web Store');
      console.log('   📤 可以進行以下步驟:');
      console.log('      1. 執行 npm run build-package 建立發佈套件');
      console.log('      2. 登入 Chrome Web Store 開發者控制台');
      console.log('      3. 上傳 ZIP 套件並填寫商店列表資訊');
      console.log('      4. 提交審核申請');
    } else if (allPassed) {
      console.log('   ✅ 所有檢查都通過了，但建議進一步最佳化');
      console.log('   🔧 可以考慮的改進:');
      console.log('      - 添加更詳細的錯誤處理');
      console.log('      - 增加程式碼註解和文件');
      console.log('      - 最佳化使用者體驗');
    } else {
      console.log('   🔧 請先解決上述問題，然後重新執行檢查');
      console.log('   📋 修正問題後執行: npm run compliance-check');
      console.log('   ✅ 確保所有檢查都通過後再進行發佈');
    }

    console.log('='.repeat(70));
  }

  /**
   * 儲存最終報告到檔案
   */
  async saveFinalReport() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFilename = `chrome-store-compliance-report-${timestamp}.json`;
      
      // 儲存 JSON 格式報告
      fs.writeFileSync(reportFilename, JSON.stringify(this.finalReport, null, 2), 'utf8');
      
      // 生成 Markdown 格式報告
      const markdownReport = this.generateMarkdownReport();
      const markdownFilename = `chrome-store-compliance-report-${timestamp}.md`;
      fs.writeFileSync(markdownFilename, markdownReport, 'utf8');
      
      console.log(`\n📄 報告已儲存:`);
      console.log(`   📊 JSON 格式: ${reportFilename}`);
      console.log(`   📝 Markdown 格式: ${markdownFilename}`);
      
    } catch (error) {
      console.error('❌ 儲存報告失敗:', error.message);
    }
  }

  /**
   * 生成 Markdown 格式報告
   */
  generateMarkdownReport() {
    const timestamp = new Date().toLocaleString('zh-TW');
    const overallScore = this.finalReport.overall.score;
    const readyForSubmission = this.finalReport.overall.readyForSubmission;
    
    let markdown = `# Chrome Web Store 合規性檢查報告

## 基本資訊
- **擴充功能名稱**: Quick Text Copy
- **檢查時間**: ${timestamp}
- **總體評分**: ${overallScore}%
- **發佈準備狀態**: ${readyForSubmission ? '✅ 已就緒' : '❌ 需要改進'}

## 檢查結果摘要

### 合規性檢查 (${this.finalReport.compliance?.overall?.score || 0}%)
`;

    // 添加合規性檢查詳情
    if (this.finalReport.compliance) {
      Object.entries(this.finalReport.compliance).forEach(([category, result]) => {
        if (category !== 'overall' && result.passed !== undefined) {
          const status = result.passed ? '✅ 通過' : '❌ 失敗';
          const categoryName = this.getCategoryName(category);
          markdown += `- **${categoryName}**: ${status}\n`;
          
          if (result.issues && result.issues.length > 0) {
            result.issues.forEach(issue => {
              markdown += `  - ${issue}\n`;
            });
          }
        }
      });
    }

    markdown += `\n### 功能性測試 (${this.finalReport.functionality?.overall?.score || 0}%)
`;

    // 添加功能性測試詳情
    if (this.finalReport.functionality) {
      Object.entries(this.finalReport.functionality).forEach(([category, result]) => {
        if (category !== 'overall' && result.passed !== undefined) {
          const status = result.passed ? '✅ 通過' : '❌ 失敗';
          const categoryName = this.getFunctionalityTestName(category);
          markdown += `- **${categoryName}**: ${status}\n`;
          
          if (result.details && result.details.length > 0) {
            result.details.forEach(detail => {
              markdown += `  - ${detail}\n`;
            });
          }
        }
      });
    }

    // 添加建議
    markdown += `\n## 建議事項

`;

    if (readyForSubmission) {
      markdown += `🎉 **恭喜！您的擴充功能已準備好提交到 Chrome Web Store**

### 下一步驟：
1. 執行 \`npm run build-package\` 建立發佈套件
2. 登入 Chrome Web Store 開發者控制台
3. 上傳 ZIP 套件並填寫商店列表資訊
4. 提交審核申請
`;
    } else {
      markdown += `⚠️ **需要先解決以下問題才能提交**

### 修正步驟：
1. 解決上述標記為 ❌ 的問題
2. 重新執行合規性檢查：\`npm run compliance-check\`
3. 確保所有檢查都通過後再進行發佈
`;
    }

    markdown += `
---
*此報告由 Chrome Web Store 合規性檢查工具自動生成*
`;

    return markdown;
  }

  /**
   * 取得合規性檢查分類名稱
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
   * 取得功能性測試分類名稱
   */
  getFunctionalityTestName(category) {
    const names = {
      manifestValidation: 'Manifest 驗證',
      serviceWorkerValidation: 'Service Worker 驗證',
      iconValidation: '圖示檔案驗證',
      codeQuality: '程式碼品質檢查'
    };
    return names[category] || category;
  }
}

// 如果直接執行此檔案，則運行完整檢查
if (require.main === module) {
  const runner = new ComplianceCheckRunner();
  runner.runFullComplianceCheck()
    .then(results => {
      const exitCode = results.overall.readyForSubmission ? 0 : 1;
      console.log(`\n🏁 檢查完成，退出代碼: ${exitCode}`);
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('\n❌ 合規性檢查執行失敗:', error);
      process.exit(1);
    });
}

module.exports = ComplianceCheckRunner;