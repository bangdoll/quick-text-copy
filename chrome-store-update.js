#!/usr/bin/env node

/**
 * Chrome 應用程式商店更新自動化腳本
 */

const fs = require('fs');
const path = require('path');

class ChromeStoreUpdater {
    constructor() {
        this.manifestPath = 'manifest.json';
        this.packagePath = 'package.json';
        this.updateLogPath = 'update-history.json';
    }

    /**
     * 獲取當前版本資訊
     */
    getCurrentVersion() {
        try {
            const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
            const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
            
            return {
                manifestVersion: manifest.version,
                packageVersion: packageJson.version,
                name: manifest.name,
                description: manifest.description
            };
        } catch (error) {
            console.error('❌ 無法讀取版本資訊:', error.message);
            return null;
        }
    }

    /**
     * 執行更新前檢查
     */
    async performPreUpdateChecks() {
        console.log('🔍 執行更新前檢查...\n');
        
        const checks = {
            versionConsistency: false,
            manifestValid: false,
            packageBuilt: false,
            testsPass: false,
            complianceCheck: false
        };

        try {
            // 1. 檢查版本一致性
            console.log('📋 檢查版本一致性...');
            const versionInfo = this.getCurrentVersion();
            if (versionInfo && versionInfo.manifestVersion === versionInfo.packageVersion) {
                console.log(`✅ 版本一致: ${versionInfo.manifestVersion}`);
                checks.versionConsistency = true;
            } else {
                console.log('❌ manifest.json 和 package.json 版本不一致');
                return checks;
            }

            // 2. 驗證 manifest.json
            console.log('📋 驗證 manifest.json...');
            if (this.validateManifest()) {
                console.log('✅ manifest.json 格式正確');
                checks.manifestValid = true;
            } else {
                console.log('❌ manifest.json 格式有誤');
                return checks;
            }

            // 3. 檢查套件是否已建置
            console.log('📋 檢查套件建置...');
            const packageFile = 'quick-text-copy-extension.zip';
            if (fs.existsSync(packageFile)) {
                const stats = fs.statSync(packageFile);
                const sizeKB = Math.round(stats.size / 1024);
                console.log(`✅ 套件已建置: ${packageFile} (${sizeKB} KB)`);
                checks.packageBuilt = true;
            } else {
                console.log('⚠️  套件未建置，將自動建置...');
                await this.buildPackage();
                checks.packageBuilt = true;
            }

            // 4. 執行測試
            console.log('📋 執行功能測試...');
            if (await this.runTests()) {
                console.log('✅ 所有測試通過');
                checks.testsPass = true;
            } else {
                console.log('❌ 測試失敗');
                return checks;
            }

            // 5. 合規性檢查
            console.log('📋 執行合規性檢查...');
            if (await this.runComplianceCheck()) {
                console.log('✅ 合規性檢查通過');
                checks.complianceCheck = true;
            } else {
                console.log('❌ 合規性檢查失敗');
                return checks;
            }

            console.log('\n🎉 所有更新前檢查都通過！');
            return checks;

        } catch (error) {
            console.error('❌ 更新前檢查時發生錯誤:', error.message);
            return checks;
        }
    }

    /**
     * 驗證 manifest.json
     */
    validateManifest() {
        try {
            const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
            
            // 檢查必要欄位
            const requiredFields = ['manifest_version', 'name', 'version', 'description'];
            for (const field of requiredFields) {
                if (!manifest[field]) {
                    console.log(`❌ 缺少必要欄位: ${field}`);
                    return false;
                }
            }

            // 檢查版本格式
            const versionRegex = /^\d+\.\d+\.\d+$/;
            if (!versionRegex.test(manifest.version)) {
                console.log('❌ 版本格式不正確，應為 x.y.z 格式');
                return false;
            }

            return true;
        } catch (error) {
            console.log('❌ manifest.json 格式錯誤:', error.message);
            return false;
        }
    }

    /**
     * 建置套件
     */
    async buildPackage() {
        try {
            const { execSync } = require('child_process');
            console.log('📦 正在建置套件...');
            execSync('npm run build', { stdio: 'inherit' });
            console.log('✅ 套件建置完成');
            return true;
        } catch (error) {
            console.error('❌ 套件建置失敗:', error.message);
            return false;
        }
    }

    /**
     * 執行測試
     */
    async runTests() {
        try {
            const { execSync } = require('child_process');
            
            // 執行擴充功能測試
            execSync('npm run test-extension', { stdio: 'pipe' });
            
            // 執行簡體轉繁體測試
            execSync('npm run test-chinese-conversion', { stdio: 'pipe' });
            
            return true;
        } catch (error) {
            console.error('測試失敗:', error.message);
            return false;
        }
    }

    /**
     * 執行合規性檢查
     */
    async runComplianceCheck() {
        try {
            const { execSync } = require('child_process');
            execSync('npm run compliance-check', { stdio: 'pipe' });
            return true;
        } catch (error) {
            console.error('合規性檢查失敗:', error.message);
            return false;
        }
    }

    /**
     * 生成更新說明
     */
    generateUpdateNotes(version) {
        const updateNotes = {
            version: version,
            date: new Date().toISOString().split('T')[0],
            features: [
                '🆕 新增簡體中文轉繁體中文自動轉換功能',
                '🔍 智慧檢測簡體中文內容並自動轉換',
                '📚 支援科技詞彙和日常用語轉換',
                '⚡ 優化程式碼結構和效能',
                '🛡️ 增強錯誤處理機制',
                '✨ 改善使用者體驗'
            ],
            technicalDetails: [
                '使用核心字典進行精確轉換',
                '保持原有格式和標點符號',
                '不影響繁體中文和其他語言內容',
                '完全本地處理，保護使用者隱私'
            ],
            storeDescription: `版本 ${version} 更新內容：

🆕 新功能：
• 新增簡體中文轉繁體中文自動轉換功能
• 智慧檢測簡體中文內容並自動轉換
• 支援科技詞彙和日常用語轉換

🔧 改進：
• 優化程式碼結構和效能
• 增強錯誤處理機制
• 改善使用者體驗

📋 技術細節：
• 使用核心字典進行精確轉換
• 保持原有格式和標點符號
• 不影響繁體中文和其他語言內容`
        };

        // 儲存更新說明
        const notesFile = `update-notes-${version.replace(/\./g, '-')}.json`;
        fs.writeFileSync(notesFile, JSON.stringify(updateNotes, null, 2), 'utf8');
        
        console.log(`📝 更新說明已生成: ${notesFile}`);
        return updateNotes;
    }

    /**
     * 記錄更新歷史
     */
    recordUpdateHistory(version, updateNotes) {
        let history = [];
        
        try {
            if (fs.existsSync(this.updateLogPath)) {
                const data = JSON.parse(fs.readFileSync(this.updateLogPath, 'utf8'));
                history = Array.isArray(data) ? data : [];
            }
        } catch (error) {
            console.log('建立新的更新歷史記錄');
            history = [];
        }

        const updateRecord = {
            version: version,
            date: new Date().toISOString(),
            status: 'prepared',
            notes: updateNotes,
            submissionId: null,
            reviewStatus: 'not_submitted'
        };

        history.unshift(updateRecord);
        
        // 只保留最近10次更新記錄
        if (history.length > 10) {
            history = history.slice(0, 10);
        }

        fs.writeFileSync(this.updateLogPath, JSON.stringify(history, null, 2), 'utf8');
        console.log('📊 更新歷史已記錄');
    }

    /**
     * 顯示更新指南
     */
    showUpdateInstructions(version) {
        console.log('\n📋 Chrome 應用程式商店更新步驟:');
        console.log('─'.repeat(50));
        console.log('1. 前往 Chrome Web Store 開發者控制台');
        console.log('   https://chrome.google.com/webstore/devconsole');
        console.log('');
        console.log('2. 找到 "Quick Text Copy" 擴充功能');
        console.log('');
        console.log('3. 點擊「套件」標籤 → 「上傳新套件」');
        console.log('');
        console.log('4. 上傳檔案: quick-text-copy-extension.zip');
        console.log('');
        console.log('5. 更新版本說明（複製以下內容）:');
        console.log('─'.repeat(30));
        
        const updateNotes = this.generateUpdateNotes(version);
        console.log(updateNotes.storeDescription);
        
        console.log('─'.repeat(30));
        console.log('');
        console.log('6. 點擊「提交審核」');
        console.log('');
        console.log('7. 使用監控工具追蹤審核狀態:');
        console.log('   npm run review-status submit "提交ID" "' + version + '"');
        console.log('   npm run monitor-start');
        console.log('');
        console.log('🎯 預期審核時間: 3-5 個工作天');
    }

    /**
     * 執行完整更新準備流程
     */
    async prepareUpdate() {
        console.log('🚀 開始準備 Chrome 應用程式商店更新...\n');

        // 獲取版本資訊
        const versionInfo = this.getCurrentVersion();
        if (!versionInfo) {
            console.log('❌ 無法獲取版本資訊，更新準備失敗');
            return false;
        }

        console.log(`📦 準備更新版本: ${versionInfo.manifestVersion}`);
        console.log(`📋 擴充功能: ${versionInfo.name}\n`);

        // 執行更新前檢查
        const checkResults = await this.performPreUpdateChecks();
        
        const allChecksPassed = Object.values(checkResults).every(result => result === true);
        
        if (!allChecksPassed) {
            console.log('\n❌ 更新前檢查未完全通過，請修正問題後重試');
            console.log('檢查結果:', checkResults);
            return false;
        }

        // 生成更新說明和記錄歷史
        const updateNotes = this.generateUpdateNotes(versionInfo.manifestVersion);
        this.recordUpdateHistory(versionInfo.manifestVersion, updateNotes);

        // 顯示更新指南
        this.showUpdateInstructions(versionInfo.manifestVersion);

        console.log('\n✅ 更新準備完成！');
        console.log('📁 相關檔案:');
        console.log('   • quick-text-copy-extension.zip (上傳套件)');
        console.log('   • update-notes-*.json (更新說明)');
        console.log('   • update-history.json (更新歷史)');

        return true;
    }
}

// 如果直接執行此檔案
if (require.main === module) {
    const updater = new ChromeStoreUpdater();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'prepare':
            updater.prepareUpdate();
            break;
        case 'check':
            updater.performPreUpdateChecks();
            break;
        case 'version':
            const versionInfo = updater.getCurrentVersion();
            if (versionInfo) {
                console.log(`當前版本: ${versionInfo.manifestVersion}`);
                console.log(`擴充功能: ${versionInfo.name}`);
            }
            break;
        default:
            console.log(`
🔧 Chrome 應用程式商店更新工具

使用方法:
  node chrome-store-update.js prepare   準備完整更新流程
  node chrome-store-update.js check     執行更新前檢查
  node chrome-store-update.js version   顯示當前版本資訊
`);
    }
}

module.exports = ChromeStoreUpdater;