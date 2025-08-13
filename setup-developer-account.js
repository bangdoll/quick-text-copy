#!/usr/bin/env node

/**
 * Chrome Web Store 開發者帳戶互動式設定工具
 * 協助開發者逐步完成帳戶設定流程
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class DeveloperAccountSetup {
    constructor() {
        this.configPath = path.join(__dirname, 'developer-account-config.json');
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    /**
     * 開始互動式設定流程
     */
    async startSetup() {
        console.log('🚀 Chrome Web Store 開發者帳戶設定助手\n');
        console.log('此工具將協助您完成開發者帳戶的設定流程。\n');

        try {
            // 載入現有配置
            const config = this.loadConfig();
            
            // 逐步設定
            await this.setupBasicInfo(config);
            await this.setupRegistration(config);
            await this.setupPayment(config);
            await this.setupNotifications(config);
            
            // 儲存配置
            this.saveConfig(config);
            
            // 顯示總結
            this.displaySummary(config);
            
        } catch (error) {
            console.error('❌ 設定過程中發生錯誤:', error.message);
        } finally {
            this.rl.close();
        }
    }

    /**
     * 載入現有配置
     */
    loadConfig() {
        if (fs.existsSync(this.configPath)) {
            try {
                return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
            } catch (error) {
                console.log('⚠️  配置檔案格式錯誤，將創建新的配置');
            }
        }
        
        return this.getDefaultConfig();
    }

    /**
     * 取得預設配置
     */
    getDefaultConfig() {
        return {
            developerName: "",
            contactEmail: "",
            developerType: "individual",
            registrationFeePaid: false,
            agreementAccepted: false,
            identityVerified: false,
            plansPaidApps: false,
            paymentSetup: {
                configured: false,
                merchantAccount: "",
                taxInfo: false
            },
            notifications: {
                email: true,
                reviewUpdates: true,
                policyUpdates: true
            },
            teamMembers: [],
            accountSetupDate: "",
            verificationCompletedDate: "",
            notes: "",
            setupChecklist: {
                registrationFeePaid: false,
                agreementAccepted: false,
                developerInfoCompleted: false,
                identityVerificationCompleted: false,
                paymentInfoConfigured: false,
                consoleAccessVerified: false
            }
        };
    }

    /**
     * 設定基本資訊
     */
    async setupBasicInfo(config) {
        console.log('📝 步驟 1: 基本開發者資訊\n');

        // 開發者名稱
        if (!config.developerName) {
            config.developerName = await this.question('請輸入開發者名稱（將顯示在Chrome Web Store上）: ');
        } else {
            console.log(`✅ 開發者名稱: ${config.developerName}`);
        }

        // 聯絡信箱
        if (!config.contactEmail) {
            config.contactEmail = await this.question('請輸入聯絡電子郵件地址: ');
        } else {
            console.log(`✅ 聯絡信箱: ${config.contactEmail}`);
        }

        // 開發者類型
        if (!config.developerType || config.developerType === '') {
            const typeChoice = await this.question('開發者類型 (1: 個人, 2: 公司) [1]: ');
            config.developerType = typeChoice === '2' ? 'company' : 'individual';
        } else {
            console.log(`✅ 開發者類型: ${config.developerType === 'individual' ? '個人' : '公司'}`);
        }

        config.setupChecklist.developerInfoCompleted = true;
        console.log('\n');
    }

    /**
     * 設定註冊資訊
     */
    async setupRegistration(config) {
        console.log('💳 步驟 2: 註冊和驗證\n');

        // 註冊費用
        if (!config.registrationFeePaid) {
            console.log('Chrome Web Store 開發者帳戶需要支付 $5 美元的一次性註冊費用。');
            console.log('請前往 https://chrome.google.com/webstore/devconsole 完成付款。\n');
            
            const feePaid = await this.question('您是否已完成 $5 註冊費用的支付？ (y/n): ');
            config.registrationFeePaid = feePaid.toLowerCase() === 'y';
            config.setupChecklist.registrationFeePaid = config.registrationFeePaid;
        } else {
            console.log('✅ 註冊費用已支付');
        }

        // 開發者協議
        if (!config.agreementAccepted) {
            console.log('\n請確認您已閱讀並接受Chrome Web Store開發者協議。');
            const agreementAccepted = await this.question('您是否已接受開發者協議？ (y/n): ');
            config.agreementAccepted = agreementAccepted.toLowerCase() === 'y';
            config.setupChecklist.agreementAccepted = config.agreementAccepted;
        } else {
            console.log('✅ 開發者協議已接受');
        }

        // 身份驗證
        if (!config.identityVerified) {
            console.log('\n某些情況下，Google 可能要求進行身份驗證。');
            const identityVerified = await this.question('您是否已完成身份驗證（如果需要）？ (y/n): ');
            config.identityVerified = identityVerified.toLowerCase() === 'y';
            config.setupChecklist.identityVerificationCompleted = config.identityVerified;
        } else {
            console.log('✅ 身份驗證已完成');
        }

        if (!config.accountSetupDate && config.registrationFeePaid && config.agreementAccepted) {
            config.accountSetupDate = new Date().toISOString().split('T')[0];
        }

        console.log('\n');
    }

    /**
     * 設定付款資訊
     */
    async setupPayment(config) {
        console.log('💰 步驟 3: 付款設定（可選）\n');

        // 是否計劃發佈付費應用程式
        const plansPaid = await this.question('您是否計劃發佈付費擴充功能？ (y/n): ');
        config.plansPaidApps = plansPaid.toLowerCase() === 'y';

        if (config.plansPaidApps) {
            console.log('\n由於您計劃發佈付費應用程式，需要設定付款資訊：');
            console.log('1. 設定 Google Payments 商家帳戶');
            console.log('2. 提供稅務資訊');
            console.log('3. 配置付款接收方式\n');

            const paymentConfigured = await this.question('您是否已完成付款資訊設定？ (y/n): ');
            config.paymentSetup.configured = paymentConfigured.toLowerCase() === 'y';
            
            if (config.paymentSetup.configured) {
                config.paymentSetup.merchantAccount = await this.question('請輸入商家帳戶ID（可選）: ');
                const taxInfo = await this.question('稅務資訊是否已提供？ (y/n): ');
                config.paymentSetup.taxInfo = taxInfo.toLowerCase() === 'y';
            }
        } else {
            console.log('✅ 僅發佈免費應用程式，無需付款設定');
            config.paymentSetup.configured = true; // 對於免費應用程式，視為已配置
        }

        config.setupChecklist.paymentInfoConfigured = config.paymentSetup.configured;
        console.log('\n');
    }

    /**
     * 設定通知偏好
     */
    async setupNotifications(config) {
        console.log('🔔 步驟 4: 通知設定\n');

        const emailNotifications = await this.question('是否接收電子郵件通知？ (y/n) [y]: ');
        config.notifications.email = emailNotifications.toLowerCase() !== 'n';

        const reviewUpdates = await this.question('是否接收審核狀態更新通知？ (y/n) [y]: ');
        config.notifications.reviewUpdates = reviewUpdates.toLowerCase() !== 'n';

        const policyUpdates = await this.question('是否接收政策更新通知？ (y/n) [y]: ');
        config.notifications.policyUpdates = policyUpdates.toLowerCase() !== 'n';

        console.log('\n');
    }

    /**
     * 儲存配置
     */
    saveConfig(config) {
        config.notes = `配置更新於 ${new Date().toLocaleString('zh-TW')}`;
        fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
        console.log(`💾 配置已儲存至: ${this.configPath}\n`);
    }

    /**
     * 顯示設定總結
     */
    displaySummary(config) {
        console.log('📋 設定總結:\n');

        const checklist = [
            { name: '註冊費用支付', status: config.setupChecklist.registrationFeePaid },
            { name: '開發者協議接受', status: config.setupChecklist.agreementAccepted },
            { name: '開發者資訊完成', status: config.setupChecklist.developerInfoCompleted },
            { name: '身份驗證完成', status: config.setupChecklist.identityVerificationCompleted },
            { name: '付款資訊配置', status: config.setupChecklist.paymentInfoConfigured }
        ];

        checklist.forEach(item => {
            const icon = item.status ? '✅' : '❌';
            console.log(`${icon} ${item.name}`);
        });

        const completedItems = checklist.filter(item => item.status).length;
        const totalItems = checklist.length;

        console.log(`\n📊 完成度: ${completedItems}/${totalItems}`);

        if (completedItems === totalItems) {
            console.log('\n🎉 恭喜！開發者帳戶設定已完成！');
            console.log('您現在可以開始上傳和發佈擴充功能了。');
        } else {
            console.log('\n⚠️  請完成剩餘的設定項目：');
            checklist.filter(item => !item.status).forEach(item => {
                console.log(`   • ${item.name}`);
            });
        }

        console.log('\n📚 下一步：');
        console.log('1. 準備擴充功能套件');
        console.log('2. 創建商店列表');
        console.log('3. 上傳到Chrome Web Store');
        console.log('\n使用 "node check-developer-account.js" 來檢查設定狀態。');
    }

    /**
     * 詢問問題並等待回答
     */
    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, (answer) => {
                resolve(answer.trim());
            });
        });
    }
}

// 執行設定
if (require.main === module) {
    const setup = new DeveloperAccountSetup();
    setup.startSetup().catch(console.error);
}

module.exports = DeveloperAccountSetup;