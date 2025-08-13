#!/usr/bin/env node

/**
 * Chrome Web Store 開發者帳戶檢查工具
 * 協助驗證開發者帳戶設定狀態
 */

const fs = require('fs');
const path = require('path');

class DeveloperAccountChecker {
    constructor() {
        this.configPath = path.join(__dirname, 'developer-account-config.json');
        this.checkResults = [];
    }

    /**
     * 執行完整的帳戶檢查
     */
    async runFullCheck() {
        console.log('🔍 開始檢查Chrome Web Store開發者帳戶設定...\n');

        // 檢查配置檔案
        this.checkConfigFile();
        
        // 檢查必要資訊
        this.checkRequiredInfo();
        
        // 檢查付款設定
        this.checkPaymentSetup();
        
        // 顯示結果
        this.displayResults();
        
        // 生成報告
        this.generateReport();
    }

    /**
     * 檢查配置檔案是否存在
     */
    checkConfigFile() {
        const exists = fs.existsSync(this.configPath);
        
        if (!exists) {
            this.addResult('配置檔案', false, '請創建 developer-account-config.json 檔案');
            this.createSampleConfig();
        } else {
            this.addResult('配置檔案', true, '配置檔案存在');
        }
    }

    /**
     * 檢查必要資訊是否完整
     */
    checkRequiredInfo() {
        if (!fs.existsSync(this.configPath)) {
            this.addResult('開發者資訊', false, '配置檔案不存在');
            return;
        }

        try {
            const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
            
            // 檢查必要欄位
            const requiredFields = [
                'developerName',
                'contactEmail',
                'developerType',
                'registrationFeePaid',
                'agreementAccepted'
            ];

            let missingFields = [];
            
            requiredFields.forEach(field => {
                if (!config[field] || config[field] === '') {
                    missingFields.push(field);
                }
            });

            if (missingFields.length === 0) {
                this.addResult('開發者資訊', true, '所有必要資訊已填寫');
            } else {
                this.addResult('開發者資訊', false, `缺少欄位: ${missingFields.join(', ')}`);
            }

            // 檢查註冊費用
            if (config.registrationFeePaid === true) {
                this.addResult('註冊費用', true, '$5註冊費用已支付');
            } else {
                this.addResult('註冊費用', false, '尚未支付$5註冊費用');
            }

            // 檢查協議接受
            if (config.agreementAccepted === true) {
                this.addResult('開發者協議', true, '開發者協議已接受');
            } else {
                this.addResult('開發者協議', false, '尚未接受開發者協議');
            }

        } catch (error) {
            this.addResult('開發者資訊', false, `配置檔案格式錯誤: ${error.message}`);
        }
    }

    /**
     * 檢查付款設定
     */
    checkPaymentSetup() {
        if (!fs.existsSync(this.configPath)) {
            return;
        }

        try {
            const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
            
            if (config.plansPaidApps === true) {
                if (config.paymentSetup && config.paymentSetup.configured === true) {
                    this.addResult('付款設定', true, '付款資訊已配置');
                } else {
                    this.addResult('付款設定', false, '計劃發佈付費應用程式但未設定付款資訊');
                }
            } else {
                this.addResult('付款設定', true, '僅發佈免費應用程式，無需付款設定');
            }

        } catch (error) {
            this.addResult('付款設定', false, `無法檢查付款設定: ${error.message}`);
        }
    }

    /**
     * 新增檢查結果
     */
    addResult(category, passed, message) {
        this.checkResults.push({
            category,
            passed,
            message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 顯示檢查結果
     */
    displayResults() {
        console.log('📋 檢查結果:\n');
        
        this.checkResults.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`${icon} ${result.category}: ${result.message}`);
        });

        const passedCount = this.checkResults.filter(r => r.passed).length;
        const totalCount = this.checkResults.length;
        
        console.log(`\n📊 總結: ${passedCount}/${totalCount} 項檢查通過`);
        
        if (passedCount === totalCount) {
            console.log('🎉 開發者帳戶設定完成！');
        } else {
            console.log('⚠️  請完成剩餘的設定項目');
        }
    }

    /**
     * 生成檢查報告
     */
    generateReport() {
        const report = {
            checkDate: new Date().toISOString(),
            results: this.checkResults,
            summary: {
                total: this.checkResults.length,
                passed: this.checkResults.filter(r => r.passed).length,
                failed: this.checkResults.filter(r => !r.passed).length
            },
            recommendations: this.generateRecommendations()
        };

        const reportPath = path.join(__dirname, 'developer-account-check-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`\n📄 詳細報告已儲存至: ${reportPath}`);
    }

    /**
     * 生成建議
     */
    generateRecommendations() {
        const recommendations = [];
        
        this.checkResults.forEach(result => {
            if (!result.passed) {
                switch (result.category) {
                    case '配置檔案':
                        recommendations.push('請填寫 developer-account-config.json 檔案中的開發者資訊');
                        break;
                    case '開發者資訊':
                        recommendations.push('請完成開發者資訊的填寫');
                        break;
                    case '註冊費用':
                        recommendations.push('請前往Chrome Web Store開發者控制台支付$5註冊費用');
                        break;
                    case '開發者協議':
                        recommendations.push('請閱讀並接受Chrome Web Store開發者協議');
                        break;
                    case '付款設定':
                        recommendations.push('如計劃發佈付費應用程式，請設定付款資訊');
                        break;
                }
            }
        });

        return recommendations;
    }

    /**
     * 創建範例配置檔案
     */
    createSampleConfig() {
        const sampleConfig = {
            "developerName": "",
            "contactEmail": "",
            "developerType": "individual",
            "registrationFeePaid": false,
            "agreementAccepted": false,
            "identityVerified": false,
            "plansPaidApps": false,
            "paymentSetup": {
                "configured": false,
                "merchantAccount": "",
                "taxInfo": false
            },
            "notifications": {
                "email": true,
                "reviewUpdates": true,
                "policyUpdates": true
            },
            "teamMembers": [],
            "notes": "請填寫此配置檔案以追蹤開發者帳戶設定狀態"
        };

        fs.writeFileSync(this.configPath, JSON.stringify(sampleConfig, null, 2));
        console.log(`📝 已創建範例配置檔案: ${this.configPath}`);
        console.log('請編輯此檔案並填寫您的開發者資訊\n');
    }
}

// 執行檢查
if (require.main === module) {
    const checker = new DeveloperAccountChecker();
    checker.runFullCheck().catch(console.error);
}

module.exports = DeveloperAccountChecker;