/**
 * Chrome Web Store 發佈後監控系統
 * 提供使用統計、評價監控、版本管理等功能
 */

const fs = require('fs');
const path = require('path');

class PostLaunchMonitor {
    constructor() {
        this.configPath = './post-launch-config.json';
        this.dataPath = './monitoring-data';
        this.reportsPath = './monitoring-reports';
        
        this.ensureDirectories();
        this.loadConfig();
    }

    /**
     * 確保必要的目錄存在
     */
    ensureDirectories() {
        [this.dataPath, this.reportsPath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * 載入監控配置
     */
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
            } else {
                this.config = this.getDefaultConfig();
                this.saveConfig();
            }
        } catch (error) {
            console.error('載入配置失敗:', error.message);
            this.config = this.getDefaultConfig();
        }
    }

    /**
     * 取得預設配置
     */
    getDefaultConfig() {
        return {
            extensionId: '', // Chrome Web Store 擴充功能 ID
            monitoringInterval: 3600000, // 1小時 (毫秒)
            alertThresholds: {
                minRating: 4.0,
                maxNegativeReviews: 5,
                minInstalls: 100
            },
            notifications: {
                email: '',
                webhook: ''
            },
            features: {
                usageStats: true,
                reviewMonitoring: true,
                performanceTracking: true,
                errorTracking: true
            }
        };
    }

    /**
     * 儲存配置
     */
    saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
            console.log('✅ 配置已儲存');
        } catch (error) {
            console.error('❌ 儲存配置失敗:', error.message);
        }
    }

    /**
     * 建立使用統計監控儀表板
     */
    async createUsageStatsDashboard() {
        console.log('🔄 建立使用統計監控儀表板...');
        
        const dashboardData = {
            timestamp: new Date().toISOString(),
            stats: {
                totalInstalls: 0,
                activeUsers: 0,
                dailyActiveUsers: 0,
                weeklyActiveUsers: 0,
                monthlyActiveUsers: 0,
                uninstalls: 0,
                crashRate: 0,
                averageSessionDuration: 0
            },
            trends: {
                installTrend: [],
                usageTrend: [],
                performanceTrend: []
            },
            demographics: {
                countries: {},
                languages: {},
                chromeVersions: {},
                operatingSystems: {}
            }
        };

        // 模擬統計資料（實際應用中會從 Chrome Web Store API 獲取）
        dashboardData.stats = {
            totalInstalls: Math.floor(Math.random() * 10000) + 1000,
            activeUsers: Math.floor(Math.random() * 5000) + 500,
            dailyActiveUsers: Math.floor(Math.random() * 1000) + 100,
            weeklyActiveUsers: Math.floor(Math.random() * 3000) + 300,
            monthlyActiveUsers: Math.floor(Math.random() * 5000) + 500,
            uninstalls: Math.floor(Math.random() * 100) + 10,
            crashRate: (Math.random() * 0.05).toFixed(3),
            averageSessionDuration: Math.floor(Math.random() * 300) + 60
        };

        const reportPath = path.join(this.reportsPath, `usage-stats-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(dashboardData, null, 2));

        console.log('✅ 使用統計儀表板已建立');
        console.log(`📊 總安裝數: ${dashboardData.stats.totalInstalls}`);
        console.log(`👥 活躍使用者: ${dashboardData.stats.activeUsers}`);
        console.log(`📈 每日活躍使用者: ${dashboardData.stats.dailyActiveUsers}`);
        console.log(`📉 卸載數: ${dashboardData.stats.uninstalls}`);
        console.log(`⚡ 當機率: ${dashboardData.stats.crashRate}%`);

        return dashboardData;
    }

    /**
     * 設定使用者評價和回饋監控
     */
    async setupReviewMonitoring() {
        console.log('🔄 設定使用者評價和回饋監控...');

        const reviewData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalReviews: 0,
                averageRating: 0,
                ratingDistribution: {
                    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
                }
            },
            recentReviews: [],
            alerts: []
        };

        // 模擬評價資料
        const totalReviews = Math.floor(Math.random() * 500) + 50;
        reviewData.summary.totalReviews = totalReviews;
        
        // 生成評分分佈
        const ratings = [5, 4, 3, 2, 1];
        let remainingReviews = totalReviews;
        
        ratings.forEach((rating, index) => {
            if (index === ratings.length - 1) {
                reviewData.summary.ratingDistribution[rating] = remainingReviews;
            } else {
                const count = Math.floor(Math.random() * (remainingReviews / (ratings.length - index)));
                reviewData.summary.ratingDistribution[rating] = count;
                remainingReviews -= count;
            }
        });

        // 計算平均評分
        let totalScore = 0;
        Object.entries(reviewData.summary.ratingDistribution).forEach(([rating, count]) => {
            totalScore += parseInt(rating) * count;
        });
        reviewData.summary.averageRating = (totalScore / totalReviews).toFixed(2);

        // 生成最近評價
        for (let i = 0; i < 5; i++) {
            const rating = Math.floor(Math.random() * 5) + 1;
            reviewData.recentReviews.push({
                id: `review_${Date.now()}_${i}`,
                rating: rating,
                title: this.generateReviewTitle(rating),
                comment: this.generateReviewComment(rating),
                date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                helpful: Math.floor(Math.random() * 10),
                language: 'zh-TW'
            });
        }

        // 檢查警告條件
        if (parseFloat(reviewData.summary.averageRating) < this.config.alertThresholds.minRating) {
            reviewData.alerts.push({
                type: 'low_rating',
                message: `平均評分 ${reviewData.summary.averageRating} 低於閾值 ${this.config.alertThresholds.minRating}`,
                severity: 'warning',
                timestamp: new Date().toISOString()
            });
        }

        const negativeReviews = reviewData.summary.ratingDistribution[1] + reviewData.summary.ratingDistribution[2];
        if (negativeReviews > this.config.alertThresholds.maxNegativeReviews) {
            reviewData.alerts.push({
                type: 'negative_reviews',
                message: `負面評價數量 ${negativeReviews} 超過閾值 ${this.config.alertThresholds.maxNegativeReviews}`,
                severity: 'critical',
                timestamp: new Date().toISOString()
            });
        }

        const reportPath = path.join(this.reportsPath, `review-monitoring-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(reviewData, null, 2));

        console.log('✅ 評價監控已設定');
        console.log(`⭐ 平均評分: ${reviewData.summary.averageRating}/5.0`);
        console.log(`📝 總評價數: ${reviewData.summary.totalReviews}`);
        console.log(`🚨 警告數量: ${reviewData.alerts.length}`);

        return reviewData;
    }

    /**
     * 生成評價標題
     */
    generateReviewTitle(rating) {
        const titles = {
            5: ['非常好用！', '完美的工具', '推薦使用', '五星好評'],
            4: ['很不錯', '好用的擴充功能', '值得推薦', '功能實用'],
            3: ['還可以', '普通', '有改進空間', '基本功能正常'],
            2: ['不太好用', '有問題', '需要改進', '功能有限'],
            1: ['很差', '不推薦', '有嚴重問題', '浪費時間']
        };
        
        const titleList = titles[rating] || titles[3];
        return titleList[Math.floor(Math.random() * titleList.length)];
    }

    /**
     * 生成評價內容
     */
    generateReviewComment(rating) {
        const comments = {
            5: [
                '這個擴充功能真的很好用，一鍵複製功能非常方便！',
                '介面簡潔，功能實用，完全符合我的需求。',
                '安裝後立即可用，沒有複雜的設定，讚！'
            ],
            4: [
                '功能不錯，但希望能增加更多自訂選項。',
                '基本功能很好，偶爾會有小問題。',
                '整體來說很滿意，值得推薦給朋友。'
            ],
            3: [
                '功能正常，但沒有特別突出的地方。',
                '可以使用，但希望介面能更美觀一些。',
                '基本需求可以滿足，但還有改進空間。'
            ],
            2: [
                '有時候會失效，需要重新載入頁面。',
                '功能有限，希望能增加更多特色。',
                '安裝後發現與描述不太符合。'
            ],
            1: [
                '完全無法使用，安裝後沒有任何反應。',
                '會導致瀏覽器變慢，已經卸載了。',
                '功能有嚴重問題，不建議安裝。'
            ]
        };
        
        const commentList = comments[rating] || comments[3];
        return commentList[Math.floor(Math.random() * commentList.length)];
    }
}

module.exports = PostLaunchMonitor;

// 如果直接執行此檔案
if (require.main === module) {
    const monitor = new PostLaunchMonitor();
    
    async function runMonitoring() {
        try {
            console.log('🚀 啟動發佈後監控系統...\n');
            
            await monitor.createUsageStatsDashboard();
            console.log('');
            await monitor.setupReviewMonitoring();
            
            console.log('\n✅ 監控系統初始化完成！');
            console.log('📁 報告儲存位置:', monitor.reportsPath);
            
        } catch (error) {
            console.error('❌ 監控系統執行失敗:', error.message);
        }
    }
    
    runMonitoring();
}