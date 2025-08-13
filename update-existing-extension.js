#!/usr/bin/env node

/**
 * 更新現有 Chrome 擴充功能腳本
 * 擴充功能 ID: kcllpmnofcjhkiheggbcabdihhbbkkph
 */

const fs = require('fs');

class ExistingExtensionUpdater {
    constructor() {
        this.extensionId = 'kcllpmnofcjhkiheggbcabdihhbbkkph';
        this.extensionName = 'Quick Text Copy';
        this.storeUrl = `https://chrome.google.com/webstore/detail/${this.extensionId}`;
        this.developerUrl = `https://chrome.google.com/webstore/devconsole/items/${this.extensionId}`;
    }

    /**
     * 顯示擴充功能資訊
     */
    showExtensionInfo() {
        console.log('📋 現有擴充功能資訊:');
        console.log('─'.repeat(50));
        console.log(`📦 名稱: ${this.extensionName}`);
        console.log(`🆔 ID: ${this.extensionId}`);
        console.log(`🔗 商店連結: ${this.storeUrl}`);
        console.log(`⚙️  開發者控制台: ${this.developerUrl}`);
        console.log('');
    }

    /**
     * 檢查當前版本
     */
    getCurrentVersion() {
        try {
            const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
            return manifest.version;
        } catch (error) {
            console.error('❌ 無法讀取 manifest.json:', error.message);
            return null;
        }
    }

    /**
     * 生成更新指令
     */
    generateUpdateInstructions() {
        const version = this.getCurrentVersion();
        
        console.log('🚀 更新現有擴充功能步驟:');
        console.log('─'.repeat(50));
        console.log('');
        
        console.log('1️⃣ 執行更新前準備:');
        console.log('   npm run update-prepare');
        console.log('');
        
        console.log('2️⃣ 前往開發者控制台:');
        console.log(`   ${this.developerUrl}`);
        console.log('');
        
        console.log('3️⃣ 上傳新版本:');
        console.log('   • 點擊「套件」標籤');
        console.log('   • 點擊「上傳新套件」');
        console.log('   • 選擇 quick-text-copy-extension.zip');
        console.log('');
        
        console.log('4️⃣ 更新版本說明:');
        console.log('   複製以下內容到「此版本的新增功能」欄位:');
        console.log('');
        console.log('   ┌─────────────────────────────────────┐');
        console.log('   │ 版本 1.0.1 更新內容：              │');
        console.log('   │                                     │');
        console.log('   │ 🆕 新功能：                        │');
        console.log('   │ • 新增簡體中文轉繁體中文自動轉換    │');
        console.log('   │ • 智慧檢測簡體中文內容並自動轉換    │');
        console.log('   │ • 支援科技詞彙和日常用語轉換        │');
        console.log('   │                                     │');
        console.log('   │ 🔧 改進：                          │');
        console.log('   │ • 優化程式碼結構和效能              │');
        console.log('   │ • 增強錯誤處理機制                  │');
        console.log('   │ • 改善使用者體驗                    │');
        console.log('   │                                     │');
        console.log('   │ 📋 技術細節：                      │');
        console.log('   │ • 使用核心字典進行精確轉換          │');
        console.log('   │ • 保持原有格式和標點符號            │');
        console.log('   │ • 不影響繁體中文和其他語言內容      │');
        console.log('   └─────────────────────────────────────┘');
        console.log('');
        
        console.log('5️⃣ 提交審核:');
        console.log('   • 檢查所有資訊是否正確');
        console.log('   • 點擊「提交審核」按鈕');
        console.log('');
        
        console.log('6️⃣ 監控審核狀態:');
        console.log('   提交後執行以下命令:');
        console.log('   npm run review-status submit "提交ID" "1.0.1"');
        console.log('   npm run monitor-start');
        console.log('');
        
        console.log('📊 預期結果:');
        console.log('─'.repeat(30));
        console.log('• 審核時間: 3-5 個工作天');
        console.log('• 更新類型: 功能增強');
        console.log('• 成功率: 高（現有擴充功能更新）');
        console.log('');
        
        if (version) {
            console.log(`📦 當前準備更新版本: ${version}`);
        }
    }

    /**
     * 生成審核監控配置
     */
    setupReviewMonitoring() {
        const monitoringConfig = {
            extensionId: this.extensionId,
            extensionName: this.extensionName,
            storeUrl: this.storeUrl,
            developerUrl: this.developerUrl,
            currentVersion: this.getCurrentVersion(),
            updateType: 'feature_enhancement',
            expectedReviewTime: '3-5 business days',
            monitoringEnabled: true,
            notifications: {
                statusChange: true,
                reviewComplete: true,
                newFeedback: true
            }
        };

        fs.writeFileSync('extension-monitoring-config.json', JSON.stringify(monitoringConfig, null, 2), 'utf8');
        console.log('📊 審核監控配置已建立: extension-monitoring-config.json');
    }

    /**
     * 檢查擴充功能狀態
     */
    checkExtensionStatus() {
        console.log('🔍 檢查擴充功能狀態:');
        console.log('─'.repeat(50));
        console.log(`📦 擴充功能: ${this.extensionName}`);
        console.log(`🆔 ID: ${this.extensionId}`);
        console.log(`📊 當前版本: ${this.getCurrentVersion() || '未知'}`);
        console.log(`🔗 商店頁面: ${this.storeUrl}`);
        console.log(`⚙️  管理頁面: ${this.developerUrl}`);
        console.log('');
        console.log('💡 提示: 您可以在瀏覽器中開啟上述連結來檢查當前狀態');
    }

    /**
     * 執行完整更新流程
     */
    performUpdate() {
        console.log(`🎯 ${this.extensionName} 更新流程\n`);
        
        this.showExtensionInfo();
        this.generateUpdateInstructions();
        this.setupReviewMonitoring();
        
        console.log('\n✅ 更新準備完成！');
        console.log('📁 相關檔案和連結已準備就緒');
        console.log('🚀 現在可以前往開發者控制台進行更新');
    }
}

// 如果直接執行此檔案
if (require.main === module) {
    const updater = new ExistingExtensionUpdater();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'update':
            updater.performUpdate();
            break;
        case 'info':
            updater.showExtensionInfo();
            break;
        case 'status':
            updater.checkExtensionStatus();
            break;
        case 'instructions':
            updater.generateUpdateInstructions();
            break;
        default:
            console.log(`
🔧 現有擴充功能更新工具

擴充功能 ID: kcllpmnofcjhkiheggbcabdihhbbkkph

使用方法:
  node update-existing-extension.js update        執行完整更新流程
  node update-existing-extension.js info          顯示擴充功能資訊
  node update-existing-extension.js status        檢查擴充功能狀態
  node update-existing-extension.js instructions  顯示更新指令
`);
    }
}

module.exports = ExistingExtensionUpdater;