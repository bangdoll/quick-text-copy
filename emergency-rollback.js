#!/usr/bin/env node

/**
 * Chrome Web Store 緊急回滾工具
 * 用於快速回滾到前一個穩定版本
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EmergencyRollback {
    constructor() {
        this.configPath = './emergency-response-config.json';
        this.config = this.loadConfig();
        this.backupPath = this.config.backup_versions.storage_path || './backups/';
        this.logFile = `emergency-rollback-${Date.now()}.log`;
    }

    loadConfig() {
        try {
            return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        } catch (error) {
            console.error('無法載入緊急應變配置檔案:', error.message);
            process.exit(1);
        }
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        
        // 寫入日誌檔案
        fs.appendFileSync(this.logFile, logMessage + '\n');
    }

    async executeEmergencyRollback(targetVersion = 'previous') {
        this.log('=== 開始緊急回滾流程 ===');
        
        try {
            // 步驟 1: 暫停當前版本
            await this.pauseCurrentVersion();
            
            // 步驟 2: 準備回滾版本
            const rollbackVersion = await this.prepareRollbackVersion(targetVersion);
            
            // 步驟 3: 執行回滾
            await this.executeRollback(rollbackVersion);
            
            // 步驟 4: 驗證回滾
            await this.verifyRollback();
            
            // 步驟 5: 通知相關人員
            await this.notifyStakeholders('rollback_completed');
            
            this.log('=== 緊急回滾流程完成 ===');
            
        } catch (error) {
            this.log(`緊急回滾失敗: ${error.message}`);
            await this.notifyStakeholders('rollback_failed', error.message);
            throw error;
        }
    }

    async pauseCurrentVersion() {
        this.log('暫停當前版本...');
        
        // 記錄當前版本資訊
        const currentManifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));
        const currentVersion = currentManifest.version;
        
        this.log(`當前版本: ${currentVersion}`);
        
        // 創建暫停標記檔案
        const pauseInfo = {
            version: currentVersion,
            pausedAt: new Date().toISOString(),
            reason: 'emergency_rollback'
        };
        
        fs.writeFileSync('./version-paused.json', JSON.stringify(pauseInfo, null, 2));
        this.log('當前版本已暫停');
    }

    async prepareRollbackVersion(targetVersion) {
        this.log(`準備回滾版本: ${targetVersion}`);
        
        let rollbackVersion;
        
        if (targetVersion === 'previous') {
            // 尋找最新的備份版本
            rollbackVersion = this.findLatestBackup();
        } else {
            // 使用指定版本
            rollbackVersion = targetVersion;
        }
        
        if (!rollbackVersion) {
            throw new Error('找不到可用的回滾版本');
        }
        
        this.log(`選定回滾版本: ${rollbackVersion}`);
        
        // 驗證回滾版本的完整性
        await this.validateRollbackVersion(rollbackVersion);
        
        return rollbackVersion;
    }

    findLatestBackup() {
        try {
            if (!fs.existsSync(this.backupPath)) {
                return null;
            }
            
            const backups = fs.readdirSync(this.backupPath)
                .filter(file => file.endsWith('.zip'))
                .map(file => {
                    const stats = fs.statSync(path.join(this.backupPath, file));
                    return {
                        file,
                        mtime: stats.mtime
                    };
                })
                .sort((a, b) => b.mtime - a.mtime);
            
            return backups.length > 0 ? backups[0].file.replace('.zip', '') : null;
            
        } catch (error) {
            this.log(`尋找備份版本時發生錯誤: ${error.message}`);
            return null;
        }
    }

    async validateRollbackVersion(version) {
        this.log(`驗證回滾版本: ${version}`);
        
        const backupFile = path.join(this.backupPath, `${version}.zip`);
        
        if (!fs.existsSync(backupFile)) {
            throw new Error(`回滾版本檔案不存在: ${backupFile}`);
        }
        
        // 檢查檔案大小
        const stats = fs.statSync(backupFile);
        if (stats.size === 0) {
            throw new Error('回滾版本檔案為空');
        }
        
        this.log('回滾版本驗證通過');
    }

    async executeRollback(version) {
        this.log(`執行回滾到版本: ${version}`);
        
        try {
            // 備份當前狀態
            await this.backupCurrentState();
            
            // 解壓回滾版本
            const backupFile = path.join(this.backupPath, `${version}.zip`);
            execSync(`unzip -o "${backupFile}" -d ./rollback-temp/`);
            
            // 替換當前檔案
            this.replaceCurrentFiles('./rollback-temp/');
            
            // 清理臨時檔案
            execSync('rm -rf ./rollback-temp/');
            
            this.log('回滾執行完成');
            
        } catch (error) {
            this.log(`回滾執行失敗: ${error.message}`);
            throw error;
        }
    }

    async backupCurrentState() {
        this.log('備份當前狀態...');
        
        const timestamp = Date.now();
        const backupName = `emergency-backup-${timestamp}`;
        
        // 創建當前狀態的備份
        execSync(`zip -r "${this.backupPath}${backupName}.zip" . -x "node_modules/*" "backups/*" "*.log"`);
        
        this.log(`當前狀態已備份: ${backupName}.zip`);
    }

    replaceCurrentFiles(sourcePath) {
        this.log('替換當前檔案...');
        
        const filesToReplace = [
            'manifest.json',
            'service-worker.js',
            'icons/'
        ];
        
        filesToReplace.forEach(file => {
            const sourcefile = path.join(sourcePath, file);
            const targetFile = `./${file}`;
            
            if (fs.existsSync(sourcefile)) {
                if (fs.statSync(sourcefile).isDirectory()) {
                    execSync(`cp -r "${sourcefile}" "${targetFile}"`);
                } else {
                    execSync(`cp "${sourcefile}" "${targetFile}"`);
                }
                this.log(`已替換: ${file}`);
            }
        });
    }

    async verifyRollback() {
        this.log('驗證回滾結果...');
        
        try {
            // 檢查必要檔案存在
            const requiredFiles = ['manifest.json', 'service-worker.js'];
            
            for (const file of requiredFiles) {
                if (!fs.existsSync(file)) {
                    throw new Error(`必要檔案缺失: ${file}`);
                }
            }
            
            // 驗證 manifest.json 格式
            const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));
            if (!manifest.version || !manifest.name) {
                throw new Error('manifest.json 格式不正確');
            }
            
            // 執行快速功能測試
            execSync('npm run quick-test', { stdio: 'inherit' });
            
            this.log('回滾驗證通過');
            
        } catch (error) {
            this.log(`回滾驗證失敗: ${error.message}`);
            throw error;
        }
    }

    async notifyStakeholders(event, details = '') {
        this.log(`發送通知: ${event}`);
        
        const notifications = this.config.notification_channels;
        const contacts = this.config.emergency_contacts;
        
        const message = this.generateNotificationMessage(event, details);
        
        // Email 通知
        if (notifications.email && notifications.email.enabled) {
            this.sendEmailNotification(message, notifications.email.recipients);
        }
        
        // 其他通知管道可以在這裡添加
        
        this.log('通知已發送');
    }

    generateNotificationMessage(event, details) {
        const timestamp = new Date().toLocaleString('zh-TW');
        
        const messages = {
            rollback_completed: `
緊急回滾完成通知

時間: ${timestamp}
狀態: 成功
詳情: 系統已成功回滾到前一個穩定版本

請檢查系統狀態並確認功能正常。
            `,
            rollback_failed: `
緊急回滾失敗通知

時間: ${timestamp}
狀態: 失敗
錯誤: ${details}

請立即檢查系統狀態並採取必要行動。
            `
        };
        
        return messages[event] || `系統事件通知: ${event}`;
    }

    sendEmailNotification(message, recipients) {
        // 這裡可以整合實際的郵件發送服務
        this.log(`郵件通知內容: ${message}`);
        this.log(`收件人: ${recipients.join(', ')}`);
        
        // 暫時寫入檔案作為通知記錄
        const notificationFile = `notification-${Date.now()}.txt`;
        fs.writeFileSync(notificationFile, message);
        this.log(`通知已記錄到: ${notificationFile}`);
    }
}

// 命令列介面
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    const targetVersion = args[1] || 'previous';
    
    const rollback = new EmergencyRollback();
    
    switch (command) {
        case 'execute':
            rollback.executeEmergencyRollback(targetVersion)
                .then(() => {
                    console.log('緊急回滾完成');
                    process.exit(0);
                })
                .catch(error => {
                    console.error('緊急回滾失敗:', error.message);
                    process.exit(1);
                });
            break;
            
        case 'prepare':
            rollback.prepareRollbackVersion(targetVersion)
                .then(version => {
                    console.log(`回滾版本準備完成: ${version}`);
                })
                .catch(error => {
                    console.error('準備回滾版本失敗:', error.message);
                    process.exit(1);
                });
            break;
            
        case 'verify':
            rollback.verifyRollback()
                .then(() => {
                    console.log('回滾驗證通過');
                })
                .catch(error => {
                    console.error('回滾驗證失敗:', error.message);
                    process.exit(1);
                });
            break;
            
        default:
            console.log(`
使用方法:
  node emergency-rollback.js execute [version]  - 執行緊急回滾
  node emergency-rollback.js prepare [version]  - 準備回滾版本
  node emergency-rollback.js verify             - 驗證回滾結果

範例:
  node emergency-rollback.js execute           - 回滾到前一版本
  node emergency-rollback.js execute 1.0.0     - 回滾到指定版本
            `);
            break;
    }
}

module.exports = EmergencyRollback;