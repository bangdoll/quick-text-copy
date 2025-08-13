#!/usr/bin/env node

/**
 * 檢查 Chrome Web Store 擴充功能狀態
 */

const fs = require('fs');

class StoreStatusChecker {
    constructor() {
        this.extensionId = 'kcllpmnofcjhkiheggbcabdihhbbkkph';
        this.extensionName = 'Quick Text Copy';
        this.storeUrl = `https://chrome.google.com/webstore/detail/${this.extensionId}`;
        this.developerUrl = `https://chrome.google.com/webstore/devconsole/items/${this.extensionId}`;
    }

    /**
     * 獲取本地版本資訊
     */
    getLocalVersion() {
        try {
            const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            
            return {
                manifestVersion: manifest.version,
                packageVersion: packageJson.version,
                name: manifest.name,
                description: manifest.description,
                lastModified: this.getFileModificationTime('manifest.json')
            };
        } catch (error) {
            console.error('❌ 無法讀取本地版本資訊:', error.message);
            return null;
        }
    }

    /**
     * 獲取檔案修改時間
     */
    getFileModificationTime(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.mtime.toISOString();
        } catch (error) {
            return '未知';
        }
    }

    /**
     * 檢查審核狀態記錄
     */
    checkReviewStatus() {
        try {
            const statusFile = 'chrome-store-review-status.json';
            if (fs.existsSync(statusFile)) {
                const status = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
                return status;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * 檢查更新歷史
     */
    checkUpdateHistory() {
        try {
            const historyFile = 'update-history.json';
            if (fs.existsSync(historyFile)) {
                const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
                return history;
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    /**
     * 檢查套件建置狀態
     */
    checkPackageStatus() {
        const packageFile = 'quick-text-copy-extension.zip';
        
        if (!fs.existsSync(packageFile)) {
            return {
                exists: false,
                message: '套件檔案不存在，需要重新建置'
            };
        }

        const stats = fs.statSync(packageFile);
        const manifestStats = fs.statSync('manifest.json');
        const serviceWorkerStats = fs.statSync('service-worker.js');

        const packageTime = stats.mtime.getTime();
        const manifestTime = manifestStats.mtime.getTime();
        const serviceWorkerTime = serviceWorkerStats.mtime.getTime();

        const isUpToDate = packageTime > manifestTime && packageTime > serviceWorkerTime;

        return {
            exists: true,
            size: Math.round(stats.size / 1024) + ' KB',
            lastModified: stats.mtime.toISOString(),
            isUpToDate: isUpToDate,
            message: isUpToDate ? '套件是最新的' : '套件需要重新建置'
        };
    }

    /**
     * 生成狀態報告
     */
    generateStatusReport() {
        console.log('🔍 檢查 Chrome Web Store 擴充功能狀態\n');

        // 基本資訊
        console.log('📋 擴充功能資訊:');
        console.log('─'.repeat(50));
        console.log(`📦 名稱: ${this.extensionName}`);
        console.log(`🆔 ID: ${this.extensionId}`);
        console.log(`🔗 商店頁面: ${this.storeUrl}`);
        console.log(`⚙️  開發者控制台: ${this.developerUrl}`);
        console.log('');

        // 本地版本資訊
        const localVersion = this.getLocalVersion();
        if (localVersion) {
            console.log('💻 本地版本資訊:');
            console.log('─'.repeat(50));
            console.log(`📊 當前版本: ${localVersion.manifestVersion}`);
            console.log(`📅 最後修改: ${localVersion.lastModified}`);
            console.log(`✅ 版本一致性: ${localVersion.manifestVersion === localVersion.packageVersion ? '一致' : '不一致'}`);
            console.log('');
        }

        // 套件狀態
        const packageStatus = this.checkPackageStatus();
        console.log('📦 套件建置狀態:');
        console.log('─'.repeat(50));
        console.log(`📁 檔案存在: ${packageStatus.exists ? '✅ 是' : '❌ 否'}`);
        if (packageStatus.exists) {
            console.log(`📏 檔案大小: ${packageStatus.size}`);
            console.log(`📅 建置時間: ${packageStatus.lastModified}`);
            console.log(`🔄 是否最新: ${packageStatus.isUpToDate ? '✅ 是' : '⚠️  否'}`);
        }
        console.log(`💡 狀態: ${packageStatus.message}`);
        console.log('');

        // 審核狀態
        const reviewStatus = this.checkReviewStatus();
        console.log('📊 審核狀態記錄:');
        console.log('─'.repeat(50));
        if (reviewStatus) {
            console.log(`📋 提交ID: ${reviewStatus.submissionId || '未記錄'}`);
            console.log(`📊 當前狀態: ${reviewStatus.status || '未知'}`);
            console.log(`📅 提交時間: ${reviewStatus.submittedAt || '未記錄'}`);
            console.log(`📅 上次檢查: ${reviewStatus.lastChecked || '未記錄'}`);
        } else {
            console.log('⚠️  無審核狀態記錄');
        }
        console.log('');

        // 更新歷史
        const updateHistory = this.checkUpdateHistory();
        console.log('📚 更新歷史:');
        console.log('─'.repeat(50));
        if (updateHistory.length > 0) {
            updateHistory.slice(0, 3).forEach((update, index) => {
                console.log(`${index + 1}. 版本 ${update.version} - ${update.date || '未知日期'}`);
                console.log(`   狀態: ${update.status || '未知'}`);
                if (update.submissionId) {
                    console.log(`   提交ID: ${update.submissionId}`);
                }
            });
        } else {
            console.log('⚠️  無更新歷史記錄');
        }
        console.log('');

        // 建議行動
        this.generateRecommendations(localVersion, packageStatus, reviewStatus);
    }

    /**
     * 生成建議行動
     */
    generateRecommendations(localVersion, packageStatus, reviewStatus) {
        console.log('💡 建議行動:');
        console.log('─'.repeat(50));

        const recommendations = [];

        // 檢查套件狀態
        if (!packageStatus.exists) {
            recommendations.push('🔧 執行 npm run build 建置套件');
        } else if (!packageStatus.isUpToDate) {
            recommendations.push('🔄 執行 npm run build 重新建置套件');
        }

        // 檢查版本狀態
        if (localVersion && localVersion.manifestVersion === '1.0.2') {
            if (!reviewStatus || reviewStatus.status === 'not_submitted') {
                recommendations.push('🚀 版本 1.0.2 準備就緒，可以上傳到 Chrome Web Store');
                recommendations.push('📋 執行 npm run update-existing 查看上傳指南');
            } else if (reviewStatus.status === 'submitted' || reviewStatus.status === 'in_review') {
                recommendations.push('⏳ 版本 1.0.2 已提交審核，請耐心等待');
                recommendations.push('🔍 執行 npm run review-status check 檢查狀態');
            }
        }

        // 檢查測試狀態
        recommendations.push('🧪 執行 npm run test-complete 驗證所有功能');

        if (recommendations.length === 0) {
            recommendations.push('✅ 目前狀態良好，無需特別行動');
        }

        recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec}`);
        });

        console.log('');
        console.log('🔗 快速連結:');
        console.log(`   商店頁面: ${this.storeUrl}`);
        console.log(`   開發者控制台: ${this.developerUrl}`);
    }

    /**
     * 檢查是否需要上傳新版本
     */
    checkIfUpdateNeeded() {
        const localVersion = this.getLocalVersion();
        const reviewStatus = this.checkReviewStatus();
        const packageStatus = this.checkPackageStatus();

        console.log('🎯 版本上傳狀態檢查\n');

        if (!localVersion) {
            console.log('❌ 無法獲取本地版本資訊');
            return false;
        }

        console.log(`📊 本地版本: ${localVersion.manifestVersion}`);

        // 檢查是否有未提交的新版本
        if (!reviewStatus || reviewStatus.status === 'not_submitted') {
            console.log('🚀 狀態: 新版本準備就緒，尚未上傳');
            console.log('💡 建議: 立即上傳到 Chrome Web Store');
            return true;
        }

        if (reviewStatus.status === 'submitted' || reviewStatus.status === 'in_review') {
            console.log('⏳ 狀態: 版本已提交，正在審核中');
            console.log('💡 建議: 等待審核完成');
            return false;
        }

        if (reviewStatus.status === 'published') {
            console.log('✅ 狀態: 版本已發佈');
            console.log('💡 建議: 目前版本已上線');
            return false;
        }

        console.log('⚠️  狀態: 未知狀態');
        return true;
    }
}

// 如果直接執行此檔案
if (require.main === module) {
    const checker = new StoreStatusChecker();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'status':
            checker.generateStatusReport();
            break;
        case 'check-update':
            checker.checkIfUpdateNeeded();
            break;
        case 'quick':
            const localVersion = checker.getLocalVersion();
            const reviewStatus = checker.checkReviewStatus();
            console.log(`📊 本地版本: ${localVersion?.manifestVersion || '未知'}`);
            console.log(`📋 審核狀態: ${reviewStatus?.status || '未記錄'}`);
            console.log(`🔗 開發者控制台: ${checker.developerUrl}`);
            break;
        default:
            console.log(`
🔧 Chrome Web Store 狀態檢查工具

使用方法:
  node check-store-status.js status        顯示完整狀態報告
  node check-store-status.js check-update  檢查是否需要上傳新版本
  node check-store-status.js quick         快速狀態檢查
`);
    }
}

module.exports = StoreStatusChecker;