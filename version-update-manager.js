/**
 * 版本更新管理系統
 * 處理擴充功能的版本更新流程
 */

const fs = require('fs');
const path = require('path');

class VersionUpdateManager {
    constructor() {
        this.manifestPath = './manifest.json';
        this.changelogPath = './CHANGELOG.md';
        this.updateConfigPath = './update-config.json';
        this.updateHistoryPath = './update-history.json';
        
        this.loadManifest();
        this.loadUpdateConfig();
        this.loadUpdateHistory();
    }

    /**
     * 載入 manifest.json
     */
    loadManifest() {
        try {
            this.manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
        } catch (error) {
            console.error('❌ 載入 manifest.json 失敗:', error.message);
            throw error;
        }
    }

    /**
     * 載入更新配置
     */
    loadUpdateConfig() {
        try {
            if (fs.existsSync(this.updateConfigPath)) {
                this.updateConfig = JSON.parse(fs.readFileSync(this.updateConfigPath, 'utf8'));
            } else {
                this.updateConfig = this.getDefaultUpdateConfig();
                this.saveUpdateConfig();
            }
        } catch (error) {
            console.error('載入更新配置失敗:', error.message);
            this.updateConfig = this.getDefaultUpdateConfig();
        }
    }

    /**
     * 取得預設更新配置
     */
    getDefaultUpdateConfig() {
        return {
            autoUpdate: false,
            updateChannel: 'stable', // stable, beta, dev
            rolloutPercentage: 100,
            minimumChromeVersion: '88',
            updateNotifications: true,
            backupBeforeUpdate: true,
            testingRequired: true,
            approvalRequired: true
        };
    }

    /**
     * 載入更新歷史
     */
    loadUpdateHistory() {
        try {
            if (fs.existsSync(this.updateHistoryPath)) {
                this.updateHistory = JSON.parse(fs.readFileSync(this.updateHistoryPath, 'utf8'));
            } else {
                this.updateHistory = { updates: [] };
                this.saveUpdateHistory();
            }
        } catch (error) {
            console.error('載入更新歷史失敗:', error.message);
            this.updateHistory = { updates: [] };
        }
    }

    /**
     * 儲存更新配置
     */
    saveUpdateConfig() {
        try {
            fs.writeFileSync(this.updateConfigPath, JSON.stringify(this.updateConfig, null, 2));
        } catch (error) {
            console.error('❌ 儲存更新配置失敗:', error.message);
        }
    }

    /**
     * 儲存更新歷史
     */
    saveUpdateHistory() {
        try {
            fs.writeFileSync(this.updateHistoryPath, JSON.stringify(this.updateHistory, null, 2));
        } catch (error) {
            console.error('❌ 儲存更新歷史失敗:', error.message);
        }
    }

    /**
     * 創建新版本
     */
    createNewVersion(versionType = 'patch', changelog = '') {
        console.log(`🔄 創建新版本 (${versionType})...`);

        const currentVersion = this.manifest.version;
        const newVersion = this.incrementVersion(currentVersion, versionType);

        console.log(`📦 當前版本: ${currentVersion}`);
        console.log(`🆕 新版本: ${newVersion}`);

        // 更新 manifest.json
        this.manifest.version = newVersion;
        fs.writeFileSync(this.manifestPath, JSON.stringify(this.manifest, null, 2));

        // 更新 CHANGELOG.md
        this.updateChangelog(newVersion, changelog);

        // 記錄更新歷史
        const updateRecord = {
            version: newVersion,
            previousVersion: currentVersion,
            type: versionType,
            changelog: changelog,
            createdAt: new Date().toISOString(),
            status: 'created',
            rolloutPercentage: this.updateConfig.rolloutPercentage
        };

        this.updateHistory.updates.unshift(updateRecord);
        this.saveUpdateHistory();

        console.log('✅ 新版本創建完成');
        return updateRecord;
    }

    /**
     * 版本號遞增
     */
    incrementVersion(version, type) {
        const parts = version.split('.').map(Number);
        
        switch (type) {
            case 'major':
                parts[0]++;
                parts[1] = 0;
                parts[2] = 0;
                break;
            case 'minor':
                parts[1]++;
                parts[2] = 0;
                break;
            case 'patch':
            default:
                parts[2]++;
                break;
        }
        
        return parts.join('.');
    }

    /**
     * 更新 CHANGELOG.md
     */
    updateChangelog(version, changelog) {
        const date = new Date().toISOString().split('T')[0];
        const changelogEntry = `\n## [${version}] - ${date}\n\n${changelog || '- 錯誤修正和效能改善'}\n`;

        try {
            let existingChangelog = '';
            if (fs.existsSync(this.changelogPath)) {
                existingChangelog = fs.readFileSync(this.changelogPath, 'utf8');
            } else {
                existingChangelog = '# 更新日誌\n\n所有重要的專案變更都會記錄在此檔案中。\n';
            }

            // 在第一個版本條目之前插入新條目
            const lines = existingChangelog.split('\n');
            const insertIndex = lines.findIndex(line => line.startsWith('## [')) || lines.length;
            
            lines.splice(insertIndex, 0, ...changelogEntry.split('\n'));
            
            fs.writeFileSync(this.changelogPath, lines.join('\n'));
            console.log('📝 CHANGELOG.md 已更新');
        } catch (error) {
            console.error('❌ 更新 CHANGELOG.md 失敗:', error.message);
        }
    }

    /**
     * 準備更新套件
     */
    async prepareUpdatePackage(version) {
        console.log(`🔄 準備版本 ${version} 的更新套件...`);

        // 執行建置流程
        const { execSync } = require('child_process');
        
        try {
            // 執行測試
            if (this.updateConfig.testingRequired) {
                console.log('🧪 執行測試...');
                execSync('npm test', { stdio: 'inherit' });
                console.log('✅ 測試通過');
            }

            // 執行合規性檢查
            console.log('🔍 執行合規性檢查...');
            execSync('npm run compliance-check', { stdio: 'inherit' });
            console.log('✅ 合規性檢查通過');

            // 建置套件
            console.log('📦 建置更新套件...');
            execSync('npm run build', { stdio: 'inherit' });
            console.log('✅ 套件建置完成');

            // 更新歷史記錄
            const updateIndex = this.updateHistory.updates.findIndex(u => u.version === version);
            if (updateIndex !== -1) {
                this.updateHistory.updates[updateIndex].status = 'packaged';
                this.updateHistory.updates[updateIndex].packagedAt = new Date().toISOString();
                this.saveUpdateHistory();
            }

            return true;
        } catch (error) {
            console.error('❌ 準備更新套件失敗:', error.message);
            
            // 更新失敗狀態
            const updateIndex = this.updateHistory.updates.findIndex(u => u.version === version);
            if (updateIndex !== -1) {
                this.updateHistory.updates[updateIndex].status = 'failed';
                this.updateHistory.updates[updateIndex].error = error.message;
                this.saveUpdateHistory();
            }
            
            return false;
        }
    }

    /**
     * 提交更新到 Chrome Web Store
     */
    async submitUpdate(version) {
        console.log(`🔄 提交版本 ${version} 到 Chrome Web Store...`);

        try {
            // 這裡應該整合 Chrome Web Store API
            // 目前使用模擬提交
            console.log('📤 上傳更新套件...');
            
            // 模擬上傳延遲
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('📋 填寫更新資訊...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('🚀 提交審核...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 更新歷史記錄
            const updateIndex = this.updateHistory.updates.findIndex(u => u.version === version);
            if (updateIndex !== -1) {
                this.updateHistory.updates[updateIndex].status = 'submitted';
                this.updateHistory.updates[updateIndex].submittedAt = new Date().toISOString();
                this.updateHistory.updates[updateIndex].submissionId = `update_${Date.now()}`;
                this.saveUpdateHistory();
            }

            console.log('✅ 更新已提交審核');
            console.log('⏳ 預計審核時間: 1-3 個工作天');
            
            return true;
        } catch (error) {
            console.error('❌ 提交更新失敗:', error.message);
            
            // 更新失敗狀態
            const updateIndex = this.updateHistory.updates.findIndex(u => u.version === version);
            if (updateIndex !== -1) {
                this.updateHistory.updates[updateIndex].status = 'submission_failed';
                this.updateHistory.updates[updateIndex].error = error.message;
                this.saveUpdateHistory();
            }
            
            return false;
        }
    }

    /**
     * 檢查更新狀態
     */
    checkUpdateStatus(version) {
        const update = this.updateHistory.updates.find(u => u.version === version);
        
        if (!update) {
            console.log(`❌ 找不到版本 ${version} 的更新記錄`);
            return null;
        }

        console.log(`📊 版本 ${version} 更新狀態:`);
        console.log(`   狀態: ${this.getStatusText(update.status)}`);
        console.log(`   創建時間: ${new Date(update.createdAt).toLocaleString('zh-TW')}`);
        
        if (update.submittedAt) {
            console.log(`   提交時間: ${new Date(update.submittedAt).toLocaleString('zh-TW')}`);
        }
        
        if (update.error) {
            console.log(`   錯誤訊息: ${update.error}`);
        }

        return update;
    }

    /**
     * 取得狀態文字
     */
    getStatusText(status) {
        const statusMap = {
            'created': '已創建',
            'packaged': '已打包',
            'submitted': '已提交審核',
            'approved': '審核通過',
            'published': '已發佈',
            'failed': '失敗',
            'submission_failed': '提交失敗',
            'rejected': '審核被拒'
        };
        
        return statusMap[status] || status;
    }

    /**
     * 列出更新歷史
     */
    listUpdateHistory(limit = 10) {
        console.log('📋 更新歷史:');
        console.log('─'.repeat(60));
        
        const updates = this.updateHistory.updates.slice(0, limit);
        
        if (updates.length === 0) {
            console.log('   尚無更新記錄');
            return;
        }

        updates.forEach(update => {
            const date = new Date(update.createdAt).toLocaleDateString('zh-TW');
            const status = this.getStatusText(update.status);
            console.log(`📦 ${update.version} (${update.type}) - ${date} - ${status}`);
            
            if (update.changelog) {
                console.log(`   ${update.changelog}`);
            }
        });
    }

    /**
     * 回滾到前一版本
     */
    rollbackToPreviousVersion(targetVersion) {
        console.log(`🔄 回滾到版本 ${targetVersion}...`);

        const update = this.updateHistory.updates.find(u => u.version === targetVersion);
        
        if (!update) {
            console.error(`❌ 找不到版本 ${targetVersion}`);
            return false;
        }

        try {
            // 更新 manifest.json
            this.manifest.version = targetVersion;
            fs.writeFileSync(this.manifestPath, JSON.stringify(this.manifest, null, 2));

            // 記錄回滾操作
            const rollbackRecord = {
                version: `${this.manifest.version}-rollback`,
                previousVersion: this.manifest.version,
                type: 'rollback',
                changelog: `回滾到版本 ${targetVersion}`,
                createdAt: new Date().toISOString(),
                status: 'created',
                rollbackTarget: targetVersion
            };

            this.updateHistory.updates.unshift(rollbackRecord);
            this.saveUpdateHistory();

            console.log('✅ 回滾完成');
            console.log('⚠️  請記得重新建置和提交套件');
            
            return true;
        } catch (error) {
            console.error('❌ 回滾失敗:', error.message);
            return false;
        }
    }
}

module.exports = VersionUpdateManager;

// 如果直接執行此檔案
if (require.main === module) {
    const manager = new VersionUpdateManager();
    
    const command = process.argv[2];
    const arg1 = process.argv[3];
    const arg2 = process.argv[4];
    
    switch (command) {
        case 'create':
            const versionType = arg1 || 'patch';
            const changelog = arg2 || '';
            manager.createNewVersion(versionType, changelog);
            break;
            
        case 'prepare':
            if (!arg1) {
                console.error('❌ 請指定版本號');
                process.exit(1);
            }
            manager.prepareUpdatePackage(arg1);
            break;
            
        case 'submit':
            if (!arg1) {
                console.error('❌ 請指定版本號');
                process.exit(1);
            }
            manager.submitUpdate(arg1);
            break;
            
        case 'status':
            if (!arg1) {
                console.error('❌ 請指定版本號');
                process.exit(1);
            }
            manager.checkUpdateStatus(arg1);
            break;
            
        case 'history':
            const limit = parseInt(arg1) || 10;
            manager.listUpdateHistory(limit);
            break;
            
        case 'rollback':
            if (!arg1) {
                console.error('❌ 請指定目標版本號');
                process.exit(1);
            }
            manager.rollbackToPreviousVersion(arg1);
            break;
            
        default:
            console.log('📖 版本更新管理系統使用說明:');
            console.log('');
            console.log('  node version-update-manager.js create [patch|minor|major] [changelog]');
            console.log('  node version-update-manager.js prepare <version>');
            console.log('  node version-update-manager.js submit <version>');
            console.log('  node version-update-manager.js status <version>');
            console.log('  node version-update-manager.js history [limit]');
            console.log('  node version-update-manager.js rollback <version>');
            console.log('');
            console.log('範例:');
            console.log('  node version-update-manager.js create patch "修正複製功能錯誤"');
            console.log('  node version-update-manager.js prepare 1.0.1');
            console.log('  node version-update-manager.js submit 1.0.1');
            break;
    }
}