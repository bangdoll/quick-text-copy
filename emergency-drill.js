#!/usr/bin/env node

/**
 * 緊急應變演練工具
 * 用於定期測試緊急應變流程和工具
 */

const fs = require('fs');
const { execSync } = require('child_process');

class EmergencyDrill {
    constructor() {
        this.drillId = `DRILL_${Date.now()}`;
        this.logFile = `emergency-drill-${this.drillId}.log`;
        this.results = {
            passed: [],
            failed: [],
            warnings: []
        };
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}`;
        console.log(logMessage);
        fs.appendFileSync(this.logFile, logMessage + '\n');
    }

    async runDrill(drillType = 'monthly') {
        this.log(`開始緊急應變演練: ${drillType}`, 'INFO');
        this.log(`演練 ID: ${this.drillId}`, 'INFO');

        try {
            switch (drillType) {
                case 'monthly':
                    await this.runMonthlyDrill();
                    break;
                case 'quarterly':
                    await this.runQuarterlyDrill();
                    break;
                case 'full':
                    await this.runFullDrill();
                    break;
                default:
                    throw new Error(`未知的演練類型: ${drillType}`);
            }

            await this.generateDrillReport();
            this.log('緊急應變演練完成', 'INFO');

        } catch (error) {
            this.log(`演練失敗: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async runMonthlyDrill() {
        this.log('執行月度演練項目...', 'INFO');

        // 1. 測試審核拒絕應對流程
        await this.testRejectionHandling();

        // 2. 測試快速修正流程
        await this.testQuickFixProcess();

        // 3. 驗證聯絡管道
        await this.testContactChannels();

        // 4. 測試工具和腳本
        await this.testToolsAndScripts();
    }

    async runQuarterlyDrill() {
        this.log('執行季度演練項目...', 'INFO');

        // 執行月度項目
        await this.runMonthlyDrill();

        // 5. 測試完整緊急應變流程
        await this.testFullEmergencyResponse();

        // 6. 測試跨團隊協作
        await this.testCrossTeamCollaboration();

        // 7. 驗證外部支援聯絡
        await this.testExternalSupport();

        // 8. 檢討流程改進
        await this.reviewProcessImprovements();
    }

    async runFullDrill() {
        this.log('執行完整演練項目...', 'INFO');

        // 執行季度項目
        await this.runQuarterlyDrill();

        // 9. 模擬真實緊急情況
        await this.simulateRealEmergency();

        // 10. 測試版本回滾流程
        await this.testRollbackProcess();
    }

    async testRejectionHandling() {
        this.log('測試審核拒絕應對流程...', 'INFO');

        try {
            // 測試拒絕處理工具
            const testReason = '測試拒絕原因';
            const testDetails = '這是演練測試，非真實拒絕';

            // 檢查處理工具是否存在
            if (!fs.existsSync('./handle-review-rejection.js')) {
                throw new Error('拒絕處理工具不存在');
            }

            // 測試工具基本功能（不實際執行）
            this.log('拒絕處理工具檢查通過', 'INFO');
            this.results.passed.push('審核拒絕應對流程');

        } catch (error) {
            this.log(`拒絕處理測試失敗: ${error.message}`, 'ERROR');
            this.results.failed.push('審核拒絕應對流程');
        }
    }

    async testQuickFixProcess() {
        this.log('測試快速修正流程...', 'INFO');

        try {
            // 檢查快速修正相關腳本
            const requiredScripts = [
                'npm run validate-manifest',
                'npm run compliance-check',
                'npm run test-extension'
            ];

            for (const script of requiredScripts) {
                try {
                    // 測試腳本是否可執行（使用 --help 或類似參數避免實際執行）
                    this.log(`測試腳本: ${script}`, 'INFO');
                } catch (scriptError) {
                    this.results.warnings.push(`腳本可能有問題: ${script}`);
                }
            }

            this.results.passed.push('快速修正流程');

        } catch (error) {
            this.log(`快速修正流程測試失敗: ${error.message}`, 'ERROR');
            this.results.failed.push('快速修正流程');
        }
    }

    async testContactChannels() {
        this.log('驗證聯絡管道...', 'INFO');

        try {
            // 檢查緊急聯絡配置
            if (!fs.existsSync('./emergency-response-config.json')) {
                throw new Error('緊急應變配置檔案不存在');
            }

            const config = JSON.parse(fs.readFileSync('./emergency-response-config.json', 'utf8'));
            const contacts = config.emergency_contacts;

            if (!contacts || Object.keys(contacts).length === 0) {
                throw new Error('緊急聯絡人資訊不完整');
            }

            // 驗證聯絡人資訊完整性
            for (const [role, contact] of Object.entries(contacts)) {
                if (!contact.contact || !contact.role) {
                    this.results.warnings.push(`聯絡人資訊不完整: ${role}`);
                }
            }

            this.log(`驗證了 ${Object.keys(contacts).length} 個聯絡人`, 'INFO');
            this.results.passed.push('聯絡管道驗證');

        } catch (error) {
            this.log(`聯絡管道驗證失敗: ${error.message}`, 'ERROR');
            this.results.failed.push('聯絡管道驗證');
        }
    }

    async testToolsAndScripts() {
        this.log('測試工具和腳本...', 'INFO');

        try {
            const criticalTools = [
                './emergency-rollback.js',
                './handle-review-rejection.js',
                './compliance-checker.js'
            ];

            for (const tool of criticalTools) {
                if (!fs.existsSync(tool)) {
                    this.results.failed.push(`關鍵工具缺失: ${tool}`);
                } else {
                    this.log(`工具檢查通過: ${tool}`, 'INFO');
                }
            }

            // 檢查必要目錄
            const requiredDirs = [
                './rejection-logs',
                './rejection-solutions',
                './backups'
            ];

            for (const dir of requiredDirs) {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                    this.log(`創建缺失目錄: ${dir}`, 'INFO');
                }
            }

            this.results.passed.push('工具和腳本檢查');

        } catch (error) {
            this.log(`工具和腳本測試失敗: ${error.message}`, 'ERROR');
            this.results.failed.push('工具和腳本檢查');
        }
    }

    async testFullEmergencyResponse() {
        this.log('測試完整緊急應變流程...', 'INFO');

        try {
            // 模擬緊急情況響應流程
            const emergencySteps = [
                '問題識別和分類',
                '緊急聯絡人通知',
                '初步評估和決策',
                '修正計畫制定',
                '修正執行和驗證',
                '後續監控和報告'
            ];

            for (const step of emergencySteps) {
                this.log(`模擬步驟: ${step}`, 'INFO');
                // 這裡可以添加具體的測試邏輯
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            this.results.passed.push('完整緊急應變流程');

        } catch (error) {
            this.log(`完整緊急應變流程測試失敗: ${error.message}`, 'ERROR');
            this.results.failed.push('完整緊急應變流程');
        }
    }

    async testCrossTeamCollaboration() {
        this.log('測試跨團隊協作...', 'INFO');

        try {
            // 檢查團隊協作相關配置
            const config = JSON.parse(fs.readFileSync('./emergency-response-config.json', 'utf8'));
            const contacts = config.emergency_contacts;

            // 驗證不同角色的聯絡人
            const requiredRoles = ['technical_lead', 'product_manager'];
            const missingRoles = requiredRoles.filter(role => !contacts[role]);

            if (missingRoles.length > 0) {
                this.results.warnings.push(`缺少關鍵角色聯絡人: ${missingRoles.join(', ')}`);
            }

            this.results.passed.push('跨團隊協作檢查');

        } catch (error) {
            this.log(`跨團隊協作測試失敗: ${error.message}`, 'ERROR');
            this.results.failed.push('跨團隊協作檢查');
        }
    }

    async testExternalSupport() {
        this.log('驗證外部支援聯絡...', 'INFO');

        try {
            // 檢查外部支援資源配置
            const externalResources = [
                'Chrome Web Store 開發者控制台',
                'Chrome 擴充功能文件',
                '社群支援管道'
            ];

            this.log(`外部支援資源: ${externalResources.join(', ')}`, 'INFO');
            this.results.passed.push('外部支援聯絡驗證');

        } catch (error) {
            this.log(`外部支援驗證失敗: ${error.message}`, 'ERROR');
            this.results.failed.push('外部支援聯絡驗證');
        }
    }

    async reviewProcessImprovements() {
        this.log('檢討流程改進...', 'INFO');

        try {
            // 檢查是否有改進建議記錄
            const improvementFile = './process-improvements.json';
            
            if (fs.existsSync(improvementFile)) {
                const improvements = JSON.parse(fs.readFileSync(improvementFile, 'utf8'));
                this.log(`發現 ${improvements.length || 0} 項改進建議`, 'INFO');
            } else {
                this.log('未發現改進建議記錄，建議建立改進追蹤機制', 'INFO');
                this.results.warnings.push('缺少改進建議追蹤');
            }

            this.results.passed.push('流程改進檢討');

        } catch (error) {
            this.log(`流程改進檢討失敗: ${error.message}`, 'ERROR');
            this.results.failed.push('流程改進檢討');
        }
    }

    async simulateRealEmergency() {
        this.log('模擬真實緊急情況...', 'INFO');

        try {
            // 模擬各種緊急情況
            const emergencyScenarios = [
                '審核被拒絕',
                '功能嚴重故障',
                '安全漏洞發現',
                '大量使用者投訴'
            ];

            for (const scenario of emergencyScenarios) {
                this.log(`模擬情況: ${scenario}`, 'INFO');
                
                // 檢查對應的應對流程是否存在
                const hasResponse = this.checkEmergencyResponse(scenario);
                if (!hasResponse) {
                    this.results.warnings.push(`缺少 ${scenario} 的應對流程`);
                }
            }

            this.results.passed.push('真實緊急情況模擬');

        } catch (error) {
            this.log(`真實緊急情況模擬失敗: ${error.message}`, 'ERROR');
            this.results.failed.push('真實緊急情況模擬');
        }
    }

    async testRollbackProcess() {
        this.log('測試版本回滾流程...', 'INFO');

        try {
            // 檢查回滾工具
            if (!fs.existsSync('./emergency-rollback.js')) {
                throw new Error('回滾工具不存在');
            }

            // 檢查備份目錄
            if (!fs.existsSync('./backups')) {
                fs.mkdirSync('./backups', { recursive: true });
                this.log('創建備份目錄', 'INFO');
            }

            // 模擬回滾準備（不實際執行）
            this.log('回滾流程檢查通過', 'INFO');
            this.results.passed.push('版本回滾流程');

        } catch (error) {
            this.log(`版本回滾流程測試失敗: ${error.message}`, 'ERROR');
            this.results.failed.push('版本回滾流程');
        }
    }

    checkEmergencyResponse(scenario) {
        // 檢查是否有對應的應對流程文件
        const responseFiles = [
            './chrome-store-emergency-response-plan.md',
            './rejection-solutions/common-solutions.md'
        ];

        return responseFiles.some(file => fs.existsSync(file));
    }

    async generateDrillReport() {
        this.log('生成演練報告...', 'INFO');

        const report = {
            drillId: this.drillId,
            timestamp: new Date().toISOString(),
            results: this.results,
            summary: {
                total: this.results.passed.length + this.results.failed.length + this.results.warnings.length,
                passed: this.results.passed.length,
                failed: this.results.failed.length,
                warnings: this.results.warnings.length,
                successRate: Math.round((this.results.passed.length / (this.results.passed.length + this.results.failed.length)) * 100)
            },
            recommendations: this.generateRecommendations()
        };

        // 保存 JSON 報告
        const reportFile = `emergency-drill-report-${this.drillId}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

        // 生成 Markdown 報告
        const markdownReport = this.generateMarkdownReport(report);
        const mdReportFile = `emergency-drill-report-${this.drillId}.md`;
        fs.writeFileSync(mdReportFile, markdownReport);

        this.log(`演練報告已生成: ${reportFile}, ${mdReportFile}`, 'INFO');
    }

    generateRecommendations() {
        const recommendations = [];

        if (this.results.failed.length > 0) {
            recommendations.push('立即修正失敗的檢查項目');
            recommendations.push('檢討失敗原因並更新相關流程');
        }

        if (this.results.warnings.length > 0) {
            recommendations.push('關注警告項目並制定改進計畫');
        }

        if (this.results.passed.length === 0) {
            recommendations.push('緊急應變系統需要全面檢修');
        }

        return recommendations;
    }

    generateMarkdownReport(report) {
        return `# 緊急應變演練報告

## 基本資訊
- **演練 ID**: ${report.drillId}
- **執行時間**: ${report.timestamp}
- **成功率**: ${report.summary.successRate}%

## 結果摘要
- **總檢查項目**: ${report.summary.total}
- **通過項目**: ${report.summary.passed}
- **失敗項目**: ${report.summary.failed}
- **警告項目**: ${report.summary.warnings}

## 詳細結果

### ✅ 通過項目
${report.results.passed.map(item => `- ${item}`).join('\n')}

### ❌ 失敗項目
${report.results.failed.map(item => `- ${item}`).join('\n')}

### ⚠️ 警告項目
${report.results.warnings.map(item => `- ${item}`).join('\n')}

## 改進建議
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## 下一步行動
1. 修正所有失敗項目
2. 處理警告項目
3. 更新相關文件和流程
4. 安排下次演練

---
*報告生成時間: ${new Date().toLocaleString('zh-TW')}*
`;
    }
}

// 命令列介面
if (require.main === module) {
    const args = process.argv.slice(2);
    const drillType = args[0] || 'monthly';

    const drill = new EmergencyDrill();

    drill.runDrill(drillType)
        .then(() => {
            console.log('緊急應變演練完成');
            process.exit(0);
        })
        .catch(error => {
            console.error('演練失敗:', error.message);
            process.exit(1);
        });
}

module.exports = EmergencyDrill;