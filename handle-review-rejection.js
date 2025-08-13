#!/usr/bin/env node

/**
 * Chrome Web Store 審核拒絕處理工具
 * 自動分析拒絕原因並提供修正建議
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ReviewRejectionHandler {
    constructor() {
        this.configPath = './emergency-response-config.json';
        this.config = this.loadConfig();
        this.rejectionLogPath = './rejection-logs/';
        this.solutionsPath = './rejection-solutions/';
        
        // 確保目錄存在
        this.ensureDirectories();
    }

    loadConfig() {
        try {
            return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        } catch (error) {
            console.error('無法載入配置檔案:', error.message);
            return {};
        }
    }

    ensureDirectories() {
        [this.rejectionLogPath, this.solutionsPath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    async handleRejection(rejectionReason, rejectionDetails) {
        const timestamp = Date.now();
        const rejectionId = `REJ_${timestamp}`;
        
        console.log(`處理審核拒絕 ID: ${rejectionId}`);
        
        try {
            // 步驟 1: 記錄拒絕資訊
            const rejectionData = await this.recordRejection(rejectionId, rejectionReason, rejectionDetails);
            
            // 步驟 2: 分析拒絕原因
            const analysis = await this.analyzeRejection(rejectionData);
            
            // 步驟 3: 生成解決方案
            const solutions = await this.generateSolutions(analysis);
            
            // 步驟 4: 創建修正計畫
            const fixPlan = await this.createFixPlan(solutions);
            
            // 步驟 5: 生成報告
            await this.generateRejectionReport(rejectionId, rejectionData, analysis, solutions, fixPlan);
            
            console.log(`拒絕處理完成，報告已生成: ${rejectionId}`);
            return { rejectionId, analysis, solutions, fixPlan };
            
        } catch (error) {
            console.error(`處理拒絕時發生錯誤: ${error.message}`);
            throw error;
        }
    }

    async recordRejection(rejectionId, reason, details) {
        const rejectionData = {
            id: rejectionId,
            timestamp: new Date().toISOString(),
            reason: reason,
            details: details,
            currentVersion: this.getCurrentVersion(),
            submissionHistory: this.getSubmissionHistory()
        };
        
        // 保存拒絕記錄
        const logFile = path.join(this.rejectionLogPath, `${rejectionId}.json`);
        fs.writeFileSync(logFile, JSON.stringify(rejectionData, null, 2));
        
        console.log(`拒絕記錄已保存: ${logFile}`);
        return rejectionData;
    }

    getCurrentVersion() {
        try {
            const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));
            return manifest.version;
        } catch (error) {
            return 'unknown';
        }
    }

    getSubmissionHistory() {
        try {
            const reviewStatus = JSON.parse(fs.readFileSync('./chrome-store-review-status.json', 'utf8'));
            return reviewStatus.reviewHistory || [];
        } catch (error) {
            return [];
        }
    }

    async analyzeRejection(rejectionData) {
        console.log('分析拒絕原因...');
        
        const analysis = {
            category: this.categorizeRejection(rejectionData.reason),
            severity: this.assessSeverity(rejectionData.reason, rejectionData.details),
            complexity: this.assessComplexity(rejectionData.reason),
            estimatedFixTime: this.estimateFixTime(rejectionData.reason),
            affectedComponents: this.identifyAffectedComponents(rejectionData.reason),
            riskLevel: this.assessRiskLevel(rejectionData.reason)
        };
        
        console.log(`分析結果: ${analysis.category} (嚴重程度: ${analysis.severity})`);
        return analysis;
    }

    categorizeRejection(reason) {
        const categories = {
            'permission': ['權限', 'permission', '許可'],
            'privacy': ['隱私', 'privacy', '資料收集'],
            'functionality': ['功能', 'function', '運作'],
            'metadata': ['描述', '截圖', 'metadata', '中繼資料'],
            'policy': ['政策', 'policy', '違反'],
            'technical': ['技術', 'technical', '程式碼'],
            'security': ['安全', 'security', '漏洞']
        };
        
        const reasonLower = reason.toLowerCase();
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => reasonLower.includes(keyword))) {
                return category;
            }
        }
        
        return 'unknown';
    }

    assessSeverity(reason, details) {
        const highSeverityKeywords = ['安全', '漏洞', '惡意', '違法'];
        const mediumSeverityKeywords = ['功能', '權限', '政策'];
        
        const text = `${reason} ${details}`.toLowerCase();
        
        if (highSeverityKeywords.some(keyword => text.includes(keyword))) {
            return 'high';
        } else if (mediumSeverityKeywords.some(keyword => text.includes(keyword))) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    assessComplexity(reason) {
        const complexKeywords = ['架構', '重新設計', '大幅修改'];
        const simpleKeywords = ['描述', '截圖', '文字'];
        
        const reasonLower = reason.toLowerCase();
        
        if (complexKeywords.some(keyword => reasonLower.includes(keyword))) {
            return 'complex';
        } else if (simpleKeywords.some(keyword => reasonLower.includes(keyword))) {
            return 'simple';
        } else {
            return 'medium';
        }
    }

    estimateFixTime(reason) {
        const complexity = this.assessComplexity(reason);
        
        const timeEstimates = {
            'simple': '< 2 小時',
            'medium': '2-8 小時',
            'complex': '> 8 小時'
        };
        
        return timeEstimates[complexity] || '未知';
    }

    identifyAffectedComponents(reason) {
        const components = [];
        const reasonLower = reason.toLowerCase();
        
        const componentMap = {
            'manifest.json': ['manifest', '配置', '權限'],
            'service-worker.js': ['功能', '腳本', '服務'],
            'icons/': ['圖標', 'icon', '圖片'],
            'store-listing': ['描述', '截圖', '商店'],
            'privacy-policy': ['隱私', '政策', '資料']
        };
        
        for (const [component, keywords] of Object.entries(componentMap)) {
            if (keywords.some(keyword => reasonLower.includes(keyword))) {
                components.push(component);
            }
        }
        
        return components;
    }

    assessRiskLevel(reason) {
        const highRiskKeywords = ['安全', '惡意', '違法', '帳戶停用'];
        const reasonLower = reason.toLowerCase();
        
        if (highRiskKeywords.some(keyword => reasonLower.includes(keyword))) {
            return 'high';
        } else {
            return 'medium';
        }
    }

    async generateSolutions(analysis) {
        console.log('生成解決方案...');
        
        const solutions = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            preventive: []
        };
        
        // 根據分類生成解決方案
        switch (analysis.category) {
            case 'permission':
                solutions.immediate.push('檢查 manifest.json 中的權限設定');
                solutions.immediate.push('移除不必要的權限請求');
                solutions.shortTerm.push('更新權限說明文件');
                solutions.preventive.push('建立權限檢查清單');
                break;
                
            case 'privacy':
                solutions.immediate.push('更新隱私政策聲明');
                solutions.immediate.push('確認不收集使用者資料');
                solutions.shortTerm.push('添加資料處理透明度說明');
                solutions.preventive.push('定期隱私政策審查');
                break;
                
            case 'functionality':
                solutions.immediate.push('執行完整功能測試');
                solutions.immediate.push('修正發現的功能問題');
                solutions.shortTerm.push('改進錯誤處理機制');
                solutions.preventive.push('建立自動化測試流程');
                break;
                
            case 'metadata':
                solutions.immediate.push('更新商店描述內容');
                solutions.immediate.push('重新製作截圖');
                solutions.shortTerm.push('優化關鍵字和標籤');
                solutions.preventive.push('建立內容審查流程');
                break;
                
            case 'technical':
                solutions.immediate.push('檢查程式碼品質');
                solutions.immediate.push('修正技術問題');
                solutions.shortTerm.push('改進程式碼結構');
                solutions.preventive.push('建立程式碼審查機制');
                break;
                
            default:
                solutions.immediate.push('詳細分析拒絕原因');
                solutions.immediate.push('諮詢技術專家');
                break;
        }
        
        return solutions;
    }

    async createFixPlan(solutions) {
        console.log('創建修正計畫...');
        
        const fixPlan = {
            phase1: {
                name: '立即修正 (0-2 小時)',
                tasks: solutions.immediate,
                priority: 'high'
            },
            phase2: {
                name: '短期改進 (2-24 小時)',
                tasks: solutions.shortTerm,
                priority: 'medium'
            },
            phase3: {
                name: '長期優化 (1-7 天)',
                tasks: solutions.longTerm,
                priority: 'low'
            },
            preventive: {
                name: '預防措施',
                tasks: solutions.preventive,
                priority: 'ongoing'
            }
        };
        
        return fixPlan;
    }

    async generateRejectionReport(rejectionId, rejectionData, analysis, solutions, fixPlan) {
        const report = {
            summary: {
                rejectionId,
                timestamp: rejectionData.timestamp,
                category: analysis.category,
                severity: analysis.severity,
                estimatedFixTime: analysis.estimatedFixTime
            },
            details: {
                reason: rejectionData.reason,
                details: rejectionData.details,
                currentVersion: rejectionData.currentVersion
            },
            analysis,
            solutions,
            fixPlan,
            nextSteps: this.generateNextSteps(analysis, fixPlan),
            contacts: this.getRelevantContacts(analysis.category)
        };
        
        // 保存 JSON 報告
        const jsonReportPath = path.join(this.solutionsPath, `${rejectionId}-report.json`);
        fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
        
        // 生成 Markdown 報告
        const markdownReport = this.generateMarkdownReport(report);
        const mdReportPath = path.join(this.solutionsPath, `${rejectionId}-report.md`);
        fs.writeFileSync(mdReportPath, markdownReport);
        
        console.log(`報告已生成:`);
        console.log(`- JSON: ${jsonReportPath}`);
        console.log(`- Markdown: ${mdReportPath}`);
        
        return report;
    }

    generateNextSteps(analysis, fixPlan) {
        const steps = [
            '1. 立即執行第一階段修正任務',
            '2. 執行修正後的驗證測試',
            '3. 重新建置發佈套件',
            '4. 提交修正版本'
        ];
        
        if (analysis.severity === 'high') {
            steps.unshift('0. 立即通知相關負責人');
        }
        
        return steps;
    }

    getRelevantContacts(category) {
        const contacts = this.config.emergency_contacts || {};
        
        const relevantContacts = {
            'permission': ['technical_lead'],
            'privacy': ['legal_advisor'],
            'functionality': ['technical_lead'],
            'metadata': ['product_manager'],
            'technical': ['technical_lead'],
            'security': ['technical_lead', 'legal_advisor']
        };
        
        const contactKeys = relevantContacts[category] || ['technical_lead'];
        
        return contactKeys.map(key => contacts[key]).filter(contact => contact);
    }

    generateMarkdownReport(report) {
        return `# 審核拒絕處理報告

## 基本資訊
- **拒絕 ID**: ${report.summary.rejectionId}
- **時間**: ${report.summary.timestamp}
- **分類**: ${report.summary.category}
- **嚴重程度**: ${report.summary.severity}
- **預估修正時間**: ${report.summary.estimatedFixTime}

## 拒絕詳情
**原因**: ${report.details.reason}

**詳細說明**: ${report.details.details}

**當前版本**: ${report.details.currentVersion}

## 分析結果
- **分類**: ${report.analysis.category}
- **嚴重程度**: ${report.analysis.severity}
- **複雜度**: ${report.analysis.complexity}
- **影響元件**: ${report.analysis.affectedComponents.join(', ')}
- **風險等級**: ${report.analysis.riskLevel}

## 解決方案

### 立即行動
${report.solutions.immediate.map(item => `- ${item}`).join('\n')}

### 短期改進
${report.solutions.shortTerm.map(item => `- ${item}`).join('\n')}

### 長期優化
${report.solutions.longTerm.map(item => `- ${item}`).join('\n')}

### 預防措施
${report.solutions.preventive.map(item => `- ${item}`).join('\n')}

## 修正計畫

### 第一階段：${report.fixPlan.phase1.name}
${report.fixPlan.phase1.tasks.map(task => `- [ ] ${task}`).join('\n')}

### 第二階段：${report.fixPlan.phase2.name}
${report.fixPlan.phase2.tasks.map(task => `- [ ] ${task}`).join('\n')}

### 第三階段：${report.fixPlan.phase3.name}
${report.fixPlan.phase3.tasks.map(task => `- [ ] ${task}`).join('\n')}

### 預防措施
${report.fixPlan.preventive.tasks.map(task => `- [ ] ${task}`).join('\n')}

## 下一步行動
${report.nextSteps.map(step => `${step}`).join('\n')}

## 相關聯絡人
${report.contacts.map(contact => `- **${contact.role}**: ${contact.contact}`).join('\n')}

---
*報告生成時間: ${new Date().toLocaleString('zh-TW')}*
`;
    }

    async executeQuickFix(rejectionId) {
        console.log(`執行快速修正: ${rejectionId}`);
        
        try {
            // 載入報告
            const reportPath = path.join(this.solutionsPath, `${rejectionId}-report.json`);
            const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            
            // 執行第一階段任務
            const phase1Tasks = report.fixPlan.phase1.tasks;
            
            for (const task of phase1Tasks) {
                console.log(`執行任務: ${task}`);
                await this.executeTask(task);
            }
            
            console.log('快速修正完成');
            
        } catch (error) {
            console.error(`快速修正失敗: ${error.message}`);
            throw error;
        }
    }

    async executeTask(task) {
        // 根據任務內容執行相應的修正動作
        const taskLower = task.toLowerCase();
        
        if (taskLower.includes('manifest')) {
            await this.fixManifestIssues();
        } else if (taskLower.includes('權限')) {
            await this.fixPermissionIssues();
        } else if (taskLower.includes('隱私')) {
            await this.fixPrivacyIssues();
        } else if (taskLower.includes('功能測試')) {
            await this.runFunctionalityTests();
        } else if (taskLower.includes('描述')) {
            await this.fixStoreListingIssues();
        }
        
        // 等待一秒，避免操作過快
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    async fixManifestIssues() {
        console.log('檢查並修正 manifest.json 問題...');
        execSync('npm run validate-manifest', { stdio: 'inherit' });
    }

    async fixPermissionIssues() {
        console.log('檢查權限設定...');
        execSync('node compliance-checker.js --focus=permissions', { stdio: 'inherit' });
    }

    async fixPrivacyIssues() {
        console.log('更新隱私政策...');
        // 這裡可以添加隱私政策更新邏輯
    }

    async runFunctionalityTests() {
        console.log('執行功能測試...');
        execSync('npm run test-extension', { stdio: 'inherit' });
    }

    async fixStoreListingIssues() {
        console.log('檢查商店列表問題...');
        execSync('node validate-store-listing.js', { stdio: 'inherit' });
    }
}

// 命令列介面
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    const handler = new ReviewRejectionHandler();
    
    switch (command) {
        case 'handle':
            const reason = args[1] || '未指定原因';
            const details = args[2] || '無詳細說明';
            
            handler.handleRejection(reason, details)
                .then(result => {
                    console.log('拒絕處理完成');
                    console.log(`報告 ID: ${result.rejectionId}`);
                })
                .catch(error => {
                    console.error('處理失敗:', error.message);
                    process.exit(1);
                });
            break;
            
        case 'quick-fix':
            const rejectionId = args[1];
            if (!rejectionId) {
                console.error('請提供拒絕 ID');
                process.exit(1);
            }
            
            handler.executeQuickFix(rejectionId)
                .then(() => {
                    console.log('快速修正完成');
                })
                .catch(error => {
                    console.error('快速修正失敗:', error.message);
                    process.exit(1);
                });
            break;
            
        default:
            console.log(`
使用方法:
  node handle-review-rejection.js handle "拒絕原因" "詳細說明"
  node handle-review-rejection.js quick-fix [拒絕ID]

範例:
  node handle-review-rejection.js handle "權限問題" "請求了不必要的權限"
  node handle-review-rejection.js quick-fix REJ_1234567890
            `);
            break;
    }
}

module.exports = ReviewRejectionHandler;