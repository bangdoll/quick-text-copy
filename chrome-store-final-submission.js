#!/usr/bin/env node

/**
 * Chrome Web Store 最終提交工具
 * 提供實際的提交步驟指導和檢查清單
 */

const fs = require('fs');
const path = require('path');

class FinalSubmissionTool {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            const configPath = path.join(__dirname, 'chrome-store-listing', 'store-listing-config.json');
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
            console.error('❌ 無法載入商店列表配置:', error.message);
            process.exit(1);
        }
    }

    /**
     * 顯示最終提交檢查清單
     */
    showFinalChecklist() {
        console.log('📋 Chrome Web Store 最終提交檢查清單\n');
        
        console.log('🔍 提交前最終確認：\n');
        
        const checklist = [
            '✅ 開發者帳戶已註冊並支付 $5 費用',
            '✅ ZIP 套件檔案已準備完成 (quick-text-copy-extension.zip)',
            '✅ 所有圖示檔案已包含在套件中',
            '✅ 截圖檔案已準備完成 (3 張)',
            '✅ 商店列表資料已完整填寫',
            '✅ 權限說明已準備完成',
            '✅ 隱私政策已撰寫完成',
            '✅ 功能測試已通過'
        ];

        checklist.forEach(item => console.log(item));
        
        console.log('\n🚀 如果以上項目都已完成，您可以開始實際提交流程！\n');
    }

    /**
     * 顯示實際提交步驟
     */
    showSubmissionSteps() {
        console.log('📝 實際提交步驟指南\n');
        
        console.log('🌐 步驟 1: 前往 Chrome Web Store 開發者控制台');
        console.log('   網址: https://chrome.google.com/webstore/devconsole');
        console.log('   使用您的 Google 帳戶登入\n');
        
        console.log('📦 步驟 2: 上傳擴充功能套件');
        console.log('   1. 點擊「新增項目」或「Add new item」');
        console.log('   2. 選擇「上傳 ZIP 檔案」');
        console.log('   3. 上傳 quick-text-copy-extension.zip');
        console.log('   4. 等待檔案處理完成\n');
        
        console.log('📝 步驟 3: 填寫商店列表資訊');
        console.log('   基本資訊：');
        console.log(`   - 名稱: ${this.config.basicInfo.name}`);
        console.log(`   - 摘要: ${this.config.basicInfo.summary}`);
        console.log(`   - 類別: ${this.config.basicInfo.category}`);
        console.log(`   - 語言: ${this.config.basicInfo.language}\n`);
        
        console.log('🖼️  步驟 4: 上傳媒體資源');
        console.log('   - 主要圖示: icons/icon128.png');
        console.log('   - 截圖: chrome-store-listing/screenshots/ 中的 3 張圖片\n');
        
        console.log('⚙️  步驟 5: 設定分發選項');
        console.log(`   - 可見性: ${this.config.distribution.visibility}`);
        console.log(`   - 定價: ${this.config.pricing.type}`);
        console.log(`   - 地區: ${this.config.distribution.regions}\n`);
        
        console.log('🔒 步驟 6: 隱私設定');
        console.log('   - 確認「不收集使用者資料」');
        console.log('   - 填寫隱私政策聲明');
        console.log('   - 確認權限使用說明\n');
        
        console.log('🚀 步驟 7: 提交審核');
        console.log('   1. 檢查所有資訊無誤');
        console.log('   2. 點擊「提交審核」');
        console.log('   3. 等待審核結果 (通常 3-5 個工作天)\n');
    }

    /**
     * 顯示提交後的監控指南
     */
    showPostSubmissionGuide() {
        console.log('📊 提交後監控指南\n');
        
        console.log('🔍 審核狀態監控：');
        console.log('   - 定期檢查開發者控制台');
        console.log('   - 注意審核團隊的回饋');
        console.log('   - 準備回應可能的問題\n');
        
        console.log('📈 發佈後管理：');
        console.log('   - 監控安裝數量和評分');
        console.log('   - 回應使用者評論');
        console.log('   - 收集使用者回饋');
        console.log('   - 準備版本更新\n');
        
        console.log('🆘 問題處理：');
        console.log('   - 如果審核被拒，仔細閱讀拒絕原因');
        console.log('   - 根據回饋修正問題');
        console.log('   - 重新提交審核');
        console.log('   - 必要時聯絡 Chrome Web Store 支援\n');
    }

    /**
     * 生成提交用的資料包
     */
    generateSubmissionPackage() {
        console.log('📦 生成提交資料包...\n');
        
        const packageData = {
            timestamp: new Date().toISOString(),
            extensionInfo: {
                name: this.config.basicInfo.name,
                version: this.config.basicInfo.version,
                zipFile: 'quick-text-copy-extension.zip'
            },
            storeListingData: {
                name: this.config.basicInfo.name,
                summary: this.config.basicInfo.summary,
                description: this.config.basicInfo.detailedDescription,
                category: this.config.basicInfo.category,
                language: this.config.basicInfo.language,
                keywords: this.config.metadata.keywords.join(', '),
                privacyPolicy: this.config.metadata.privacyPolicy
            },
            mediaFiles: {
                icon: this.config.media.icon,
                screenshots: [
                    'chrome-store-listing/screenshots/screenshot-1-extension-icon.png',
                    'chrome-store-listing/screenshots/screenshot-2-before-after.png',
                    'chrome-store-listing/screenshots/screenshot-3-multiple-examples.png'
                ]
            },
            distributionSettings: {
                visibility: this.config.distribution.visibility,
                pricing: this.config.pricing.type,
                regions: this.config.distribution.regions
            },
            permissions: {
                requested: this.config.permissions.requested,
                justifications: this.config.permissions.justification
            }
        };

        const packagePath = 'chrome-store-submission-package.json';
        fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2), 'utf8');
        console.log(`✅ 提交資料包已生成: ${packagePath}\n`);
        
        return packageData;
    }

    /**
     * 顯示快速參考資料
     */
    showQuickReference() {
        console.log('📚 快速參考資料\n');
        
        console.log('🔗 重要連結：');
        console.log('   - Chrome Web Store 開發者控制台: https://chrome.google.com/webstore/devconsole');
        console.log('   - Chrome Web Store 政策: https://developer.chrome.com/docs/webstore/program-policies/');
        console.log('   - 開發者支援: https://support.google.com/chrome_webstore/\n');
        
        console.log('📋 必要資料：');
        console.log(`   - 擴充功能名稱: ${this.config.basicInfo.name}`);
        console.log(`   - 版本: ${this.config.basicInfo.version}`);
        console.log(`   - ZIP 檔案: quick-text-copy-extension.zip`);
        console.log(`   - 截圖數量: 3 張`);
        console.log(`   - 權限: ${this.config.permissions.requested.join(', ')}\n`);
        
        console.log('⏰ 預期時程：');
        console.log('   - 提交準備: 已完成');
        console.log('   - 實際提交: 30-60 分鐘');
        console.log('   - 審核等待: 3-5 個工作天');
        console.log('   - 發佈上線: 審核通過後立即生效\n');
    }

    /**
     * 執行完整的最終提交指導
     */
    runFinalSubmissionGuide() {
        console.log('🎯 Chrome Web Store 最終提交指導\n');
        console.log('=' .repeat(60) + '\n');
        
        this.showFinalChecklist();
        console.log('=' .repeat(60) + '\n');
        
        this.showSubmissionSteps();
        console.log('=' .repeat(60) + '\n');
        
        this.showPostSubmissionGuide();
        console.log('=' .repeat(60) + '\n');
        
        this.generateSubmissionPackage();
        console.log('=' .repeat(60) + '\n');
        
        this.showQuickReference();
        console.log('=' .repeat(60) + '\n');
        
        console.log('🎉 準備完成！您現在可以開始實際的提交流程了！');
        console.log('\n💡 提示：建議先在瀏覽器中開啟 Chrome Web Store 開發者控制台，');
        console.log('   然後按照上述步驟逐一完成提交。\n');
        
        console.log('🔗 立即前往: https://chrome.google.com/webstore/devconsole\n');
    }
}

// 主程式執行
if (require.main === module) {
    const tool = new FinalSubmissionTool();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'checklist':
            tool.showFinalChecklist();
            break;
        case 'steps':
            tool.showSubmissionSteps();
            break;
        case 'monitor':
            tool.showPostSubmissionGuide();
            break;
        case 'package':
            tool.generateSubmissionPackage();
            break;
        case 'reference':
            tool.showQuickReference();
            break;
        case 'guide':
        default:
            tool.runFinalSubmissionGuide();
            break;
    }
}

module.exports = FinalSubmissionTool;