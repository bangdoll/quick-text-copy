/**
 * 自動審核狀態監控器
 * 定期檢查Chrome Web Store的審核狀態
 */

const ReviewStatusMonitor = require('./review-status-monitor');
const fs = require('fs');

class AutoReviewMonitor {
    constructor() {
        this.monitor = new ReviewStatusMonitor();
        this.isRunning = false;
        this.intervalId = null;
        this.configFile = 'auto-monitor-config.json';
        this.loadConfig();
    }

    /**
     * 載入監控配置
     */
    loadConfig() {
        try {
            const data = fs.readFileSync(this.configFile, 'utf8');
            this.config = JSON.parse(data);
        } catch (error) {
            this.config = {
                enabled: false,
                checkInterval: 3600000, // 1小時
                notifications: {
                    statusChange: true,
                    newFeedback: true,
                    reviewComplete: true
                },
                workingHours: {
                    enabled: true,
                    start: 9,  // 9:00
                    end: 18    // 18:00
                },
                maxRetries: 3,
                retryDelay: 300000 // 5分鐘
            };
            this.saveConfig();
        }
    }

    /**
     * 儲存監控配置
     */
    saveConfig() {
        fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2), 'utf8');
    }

    /**
     * 啟動自動監控
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️  自動監控已在執行中');
            return;
        }

        if (!this.config.enabled) {
            console.log('⚠️  自動監控已停用，請先啟用');
            return;
        }

        this.isRunning = true;
        console.log('🚀 啟動自動審核狀態監控');
        console.log(`⏱️  檢查間隔: ${this.config.checkInterval / 1000 / 60} 分鐘`);

        // 立即執行一次檢查
        this.performCheck();

        // 設定定期檢查
        this.intervalId = setInterval(() => {
            this.performCheck();
        }, this.config.checkInterval);

        console.log('✅ 自動監控已啟動');
    }

    /**
     * 停止自動監控
     */
    stop() {
        if (!this.isRunning) {
            console.log('⚠️  自動監控未在執行');
            return;
        }

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isRunning = false;
        console.log('🛑 自動監控已停止');
    }

    /**
     * 執行狀態檢查
     */
    async performCheck() {
        try {
            // 檢查是否在工作時間內
            if (this.config.workingHours.enabled && !this.isWorkingHours()) {
                console.log('⏰ 非工作時間，跳過檢查');
                return;
            }

            console.log(`🔍 [${new Date().toLocaleString('zh-TW')}] 執行自動狀態檢查`);
            
            const previousStatus = this.monitor.loadStatusData();
            const currentStatus = this.monitor.checkReviewStatus();
            
            // 檢查狀態是否有變化
            if (previousStatus.status !== currentStatus.status) {
                this.handleStatusChange(previousStatus.status, currentStatus.status);
            }
            
            // 檢查是否需要提醒
            this.checkReminders(currentStatus);
            
        } catch (error) {
            console.error('❌ 自動檢查時發生錯誤:', error.message);
            this.handleError(error);
        }
    }

    /**
     * 處理狀態變化
     */
    handleStatusChange(oldStatus, newStatus) {
        console.log('🔄 檢測到狀態變化');
        console.log(`📊 ${this.monitor.getStatusDisplayName(oldStatus)} → ${this.monitor.getStatusDisplayName(newStatus)}`);
        
        if (this.config.notifications.statusChange) {
            this.sendNotification('狀態變化', `審核狀態已從「${this.monitor.getStatusDisplayName(oldStatus)}」變更為「${this.monitor.getStatusDisplayName(newStatus)}」`);
        }
        
        // 根據新狀態執行相應動作
        switch (newStatus) {
            case 'in_review':
                console.log('📝 審核已開始，建議保持關注');
                break;
            case 'approved':
                console.log('🎉 審核通過！準備發佈');
                if (this.config.notifications.reviewComplete) {
                    this.sendNotification('審核通過', '您的擴充功能已通過審核，可以發佈了！');
                }
                break;
            case 'rejected':
                console.log('❌ 審核被拒絕，請檢查回饋');
                if (this.config.notifications.reviewComplete) {
                    this.sendNotification('審核被拒絕', '您的擴充功能審核被拒絕，請查看詳細回饋');
                }
                break;
            case 'published':
                console.log('🚀 擴充功能已成功發佈！');
                if (this.config.notifications.reviewComplete) {
                    this.sendNotification('發佈成功', '您的擴充功能已成功發佈到Chrome Web Store！');
                }
                // 發佈後可以停止監控或降低檢查頻率
                this.handlePublished();
                break;
        }
    }

    /**
     * 檢查提醒事項
     */
    checkReminders(status) {
        if (!status.submittedAt) return;
        
        const submittedDate = new Date(status.submittedAt);
        const daysSinceSubmission = Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // 提交超過5天仍在審核中
        if (daysSinceSubmission >= 5 && status.status === 'in_review') {
            console.log('⚠️  審核時間較長，建議關注是否有新回饋');
        }
        
        // 提交超過7天仍無進展
        if (daysSinceSubmission >= 7 && status.status === 'submitted') {
            console.log('⚠️  提交已超過7天，建議檢查是否有問題');
        }
    }

    /**
     * 處理發佈完成
     */
    handlePublished() {
        console.log('🎯 擴充功能已發佈，調整監控策略');
        
        // 降低檢查頻率到每天一次
        this.config.checkInterval = 24 * 60 * 60 * 1000; // 24小時
        this.saveConfig();
        
        // 重新啟動監控以應用新的間隔
        if (this.isRunning) {
            this.stop();
            setTimeout(() => {
                this.start();
            }, 1000);
        }
    }

    /**
     * 檢查是否在工作時間內
     */
    isWorkingHours() {
        const now = new Date();
        const hour = now.getHours();
        return hour >= this.config.workingHours.start && hour < this.config.workingHours.end;
    }

    /**
     * 發送通知
     */
    sendNotification(title, message) {
        console.log(`🔔 通知: ${title}`);
        console.log(`📝 ${message}`);
        
        // 這裡可以整合其他通知方式，如：
        // - 電子郵件通知
        // - Slack 通知
        // - 桌面通知
        // - 推送通知等
        
        // 記錄通知歷史
        this.logNotification(title, message);
    }

    /**
     * 記錄通知歷史
     */
    logNotification(title, message) {
        const notificationLog = {
            timestamp: new Date().toISOString(),
            title: title,
            message: message
        };
        
        const logFile = 'notification-history.json';
        let history = [];
        
        try {
            const data = fs.readFileSync(logFile, 'utf8');
            history = JSON.parse(data);
        } catch (error) {
            // 檔案不存在或格式錯誤，使用空陣列
        }
        
        history.push(notificationLog);
        
        // 只保留最近100條記錄
        if (history.length > 100) {
            history = history.slice(-100);
        }
        
        fs.writeFileSync(logFile, JSON.stringify(history, null, 2), 'utf8');
    }

    /**
     * 處理錯誤
     */
    handleError(error) {
        console.error('❌ 監控過程中發生錯誤:', error.message);
        
        // 記錄錯誤
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack
        };
        
        const errorFile = 'monitor-errors.json';
        let errors = [];
        
        try {
            const data = fs.readFileSync(errorFile, 'utf8');
            errors = JSON.parse(data);
        } catch (e) {
            // 檔案不存在或格式錯誤，使用空陣列
        }
        
        errors.push(errorLog);
        
        // 只保留最近50條錯誤記錄
        if (errors.length > 50) {
            errors = errors.slice(-50);
        }
        
        fs.writeFileSync(errorFile, JSON.stringify(errors, null, 2), 'utf8');
    }

    /**
     * 獲取監控狀態
     */
    getMonitorStatus() {
        return {
            isRunning: this.isRunning,
            config: this.config,
            nextCheck: this.intervalId ? new Date(Date.now() + this.config.checkInterval).toISOString() : null
        };
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveConfig();
        console.log('✅ 監控配置已更新');
        
        // 如果監控正在執行且間隔時間有變化，重新啟動
        if (this.isRunning && newConfig.checkInterval) {
            console.log('🔄 重新啟動監控以應用新配置');
            this.stop();
            setTimeout(() => {
                this.start();
            }, 1000);
        }
    }
}

module.exports = AutoReviewMonitor;

// 如果直接執行此檔案
if (require.main === module) {
    const monitor = new AutoReviewMonitor();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'start':
            monitor.start();
            break;
        case 'stop':
            monitor.stop();
            break;
        case 'status':
            console.log(JSON.stringify(monitor.getMonitorStatus(), null, 2));
            break;
        case 'config':
            if (process.argv[3]) {
                try {
                    const newConfig = JSON.parse(process.argv[3]);
                    monitor.updateConfig(newConfig);
                } catch (error) {
                    console.error('❌ 配置格式錯誤:', error.message);
                }
            } else {
                console.log(JSON.stringify(monitor.config, null, 2));
            }
            break;
        default:
            console.log(`
🔧 自動審核監控器

使用方法:
  node auto-review-monitor.js start    啟動自動監控
  node auto-review-monitor.js stop     停止自動監控
  node auto-review-monitor.js status   查看監控狀態
  node auto-review-monitor.js config   查看配置
  node auto-review-monitor.js config '{"enabled":true}' 更新配置
`);
    }
}