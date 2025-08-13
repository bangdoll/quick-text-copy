/**
 * Chrome Web Store 審核狀態監控器
 * 用於追蹤擴充功能的審核進度並處理審核回饋
 */

const fs = require('fs');
const path = require('path');

class ReviewStatusMonitor {
    constructor() {
        this.statusFile = 'chrome-store-review-status.json';
        this.feedbackFile = 'chrome-store-review-feedback.json';
        this.configFile = 'developer-account-config.json';
        this.initializeStatusTracking();
    }

    /**
     * 初始化審核狀態追蹤
     */
    initializeStatusTracking() {
        if (!fs.existsSync(this.statusFile)) {
            const initialStatus = {
                submissionId: null,
                status: 'not_submitted',
                submittedAt: null,
                reviewStartedAt: null,
                completedAt: null,
                estimatedReviewTime: '3-5 business days',
                currentVersion: '1.0.0',
                reviewHistory: [],
                lastChecked: null,
                autoCheckEnabled: true,
                checkInterval: 3600000 // 1小時檢查一次
            };
            this.saveStatusData(initialStatus);
        }
    }

    /**
     * 更新提交狀態
     */
    updateSubmissionStatus(submissionData) {
        const statusData = this.loadStatusData();
        
        statusData.submissionId = submissionData.submissionId;
        statusData.status = 'submitted';
        statusData.submittedAt = new Date().toISOString();
        statusData.currentVersion = submissionData.version || '1.0.0';
        statusData.lastChecked = new Date().toISOString();
        
        // 記錄到歷史
        statusData.reviewHistory.push({
            action: 'submitted',
            timestamp: statusData.submittedAt,
            version: statusData.currentVersion,
            submissionId: statusData.submissionId
        });

        this.saveStatusData(statusData);
        
        console.log('✅ 提交狀態已更新');
        console.log(`📋 提交ID: ${statusData.submissionId}`);
        console.log(`📅 提交時間: ${statusData.submittedAt}`);
        
        return statusData;
    }

    /**
     * 檢查審核狀態
     */
    checkReviewStatus() {
        const statusData = this.loadStatusData();
        
        if (statusData.status === 'not_submitted') {
            console.log('⚠️  擴充功能尚未提交審核');
            return statusData;
        }

        statusData.lastChecked = new Date().toISOString();
        
        // 模擬狀態檢查（實際應用中需要調用Chrome Web Store API）
        console.log('🔍 檢查審核狀態中...');
        console.log(`📋 提交ID: ${statusData.submissionId}`);
        console.log(`📊 當前狀態: ${this.getStatusDisplayName(statusData.status)}`);
        console.log(`📅 上次檢查: ${statusData.lastChecked}`);
        
        if (statusData.submittedAt) {
            const submittedDate = new Date(statusData.submittedAt);
            const daysSinceSubmission = Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
            console.log(`⏱️  已提交 ${daysSinceSubmission} 天`);
        }

        this.saveStatusData(statusData);
        return statusData;
    }

    /**
     * 手動更新審核狀態
     */
    updateReviewStatus(newStatus, reviewerComments = null) {
        const statusData = this.loadStatusData();
        const previousStatus = statusData.status;
        
        statusData.status = newStatus;
        statusData.lastChecked = new Date().toISOString();
        
        // 根據狀態更新時間戳
        switch (newStatus) {
            case 'in_review':
                if (!statusData.reviewStartedAt) {
                    statusData.reviewStartedAt = new Date().toISOString();
                }
                break;
            case 'approved':
            case 'rejected':
            case 'published':
                statusData.completedAt = new Date().toISOString();
                break;
        }
        
        // 記錄狀態變更到歷史
        statusData.reviewHistory.push({
            action: 'status_changed',
            timestamp: statusData.lastChecked,
            previousStatus: previousStatus,
            newStatus: newStatus,
            comments: reviewerComments
        });

        this.saveStatusData(statusData);
        
        console.log('✅ 審核狀態已更新');
        console.log(`📊 狀態變更: ${this.getStatusDisplayName(previousStatus)} → ${this.getStatusDisplayName(newStatus)}`);
        
        if (reviewerComments) {
            console.log(`💬 審核意見: ${reviewerComments}`);
        }
        
        return statusData;
    }

    /**
     * 處理審核回饋
     */
    handleReviewFeedback(feedback) {
        const feedbackData = this.loadFeedbackData();
        const timestamp = new Date().toISOString();
        
        const newFeedback = {
            id: Date.now().toString(),
            timestamp: timestamp,
            type: feedback.type || 'general',
            severity: feedback.severity || 'medium',
            category: feedback.category || 'other',
            message: feedback.message,
            actionRequired: feedback.actionRequired || false,
            resolved: false,
            resolution: null,
            resolvedAt: null
        };
        
        feedbackData.feedback.push(newFeedback);
        feedbackData.lastUpdated = timestamp;
        feedbackData.totalFeedback = feedbackData.feedback.length;
        feedbackData.unresolvedCount = feedbackData.feedback.filter(f => !f.resolved).length;
        
        this.saveFeedbackData(feedbackData);
        
        console.log('📝 新的審核回饋已記錄');
        console.log(`🏷️  類型: ${feedback.type}`);
        console.log(`⚠️  嚴重程度: ${feedback.severity}`);
        console.log(`📋 訊息: ${feedback.message}`);
        
        if (feedback.actionRequired) {
            console.log('🚨 需要採取行動！');
            this.generateActionPlan(newFeedback);
        }
        
        return newFeedback;
    }

    /**
     * 生成行動計畫
     */
    generateActionPlan(feedback) {
        const actionPlan = {
            feedbackId: feedback.id,
            category: feedback.category,
            suggestedActions: [],
            estimatedTime: '1-2 hours',
            priority: feedback.severity === 'high' ? 'urgent' : 'normal'
        };
        
        // 根據回饋類型生成建議行動
        switch (feedback.category) {
            case 'permissions':
                actionPlan.suggestedActions = [
                    '檢查 manifest.json 中的權限設定',
                    '移除不必要的權限',
                    '更新權限說明文件',
                    '重新執行合規性檢查'
                ];
                break;
            case 'functionality':
                actionPlan.suggestedActions = [
                    '測試擴充功能的核心功能',
                    '修正功能問題',
                    '更新功能描述',
                    '執行完整功能測試'
                ];
                break;
            case 'metadata':
                actionPlan.suggestedActions = [
                    '檢查商店列表資訊',
                    '更新描述和截圖',
                    '確認分類設定',
                    '檢查關鍵字和標籤'
                ];
                break;
            case 'privacy':
                actionPlan.suggestedActions = [
                    '檢查隱私政策',
                    '確認資料處理聲明',
                    '更新隱私相關文件',
                    '執行隱私合規檢查'
                ];
                break;
            default:
                actionPlan.suggestedActions = [
                    '詳細分析回饋內容',
                    '制定具體解決方案',
                    '實施必要修正',
                    '驗證問題已解決'
                ];
        }
        
        console.log('\n📋 建議行動計畫:');
        actionPlan.suggestedActions.forEach((action, index) => {
            console.log(`${index + 1}. ${action}`);
        });
        console.log(`⏱️  預估時間: ${actionPlan.estimatedTime}`);
        console.log(`🎯 優先級: ${actionPlan.priority}`);
        
        return actionPlan;
    }

    /**
     * 標記回饋為已解決
     */
    resolveFeedback(feedbackId, resolution) {
        const feedbackData = this.loadFeedbackData();
        const feedback = feedbackData.feedback.find(f => f.id === feedbackId);
        
        if (!feedback) {
            console.log('❌ 找不到指定的回饋記錄');
            return false;
        }
        
        feedback.resolved = true;
        feedback.resolution = resolution;
        feedback.resolvedAt = new Date().toISOString();
        
        feedbackData.lastUpdated = new Date().toISOString();
        feedbackData.unresolvedCount = feedbackData.feedback.filter(f => !f.resolved).length;
        
        this.saveFeedbackData(feedbackData);
        
        console.log('✅ 回饋已標記為已解決');
        console.log(`📝 解決方案: ${resolution}`);
        
        return true;
    }

    /**
     * 準備重新提交
     */
    prepareResubmission() {
        const statusData = this.loadStatusData();
        const feedbackData = this.loadFeedbackData();
        
        // 檢查是否有未解決的回饋
        const unresolvedFeedback = feedbackData.feedback.filter(f => !f.resolved);
        
        if (unresolvedFeedback.length > 0) {
            console.log('⚠️  發現未解決的回饋，建議先處理以下問題:');
            unresolvedFeedback.forEach((feedback, index) => {
                console.log(`${index + 1}. [${feedback.category}] ${feedback.message}`);
            });
            return false;
        }
        
        // 更新狀態為準備重新提交
        statusData.status = 'preparing_resubmission';
        statusData.lastChecked = new Date().toISOString();
        
        statusData.reviewHistory.push({
            action: 'preparing_resubmission',
            timestamp: statusData.lastChecked,
            resolvedIssues: feedbackData.feedback.filter(f => f.resolved).length
        });
        
        this.saveStatusData(statusData);
        
        console.log('✅ 準備重新提交');
        console.log(`📊 已解決問題數量: ${feedbackData.feedback.filter(f => f.resolved).length}`);
        console.log('📋 建議執行以下步驟:');
        console.log('1. 執行完整的合規性檢查');
        console.log('2. 重新建置擴充功能套件');
        console.log('3. 測試所有功能');
        console.log('4. 提交新版本');
        
        return true;
    }

    /**
     * 生成狀態報告
     */
    generateStatusReport() {
        const statusData = this.loadStatusData();
        const feedbackData = this.loadFeedbackData();
        
        const report = {
            timestamp: new Date().toISOString(),
            submissionInfo: {
                id: statusData.submissionId,
                version: statusData.currentVersion,
                status: statusData.status,
                submittedAt: statusData.submittedAt,
                reviewStartedAt: statusData.reviewStartedAt,
                completedAt: statusData.completedAt
            },
            timeline: {
                daysSinceSubmission: statusData.submittedAt ? 
                    Math.floor((Date.now() - new Date(statusData.submittedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
                estimatedReviewTime: statusData.estimatedReviewTime
            },
            feedback: {
                total: feedbackData.totalFeedback,
                unresolved: feedbackData.unresolvedCount,
                resolved: feedbackData.totalFeedback - feedbackData.unresolvedCount
            },
            history: statusData.reviewHistory
        };
        
        // 儲存報告
        const reportFile = `review-status-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf8');
        
        console.log('📊 審核狀態報告已生成');
        console.log(`📁 報告檔案: ${reportFile}`);
        console.log('\n📋 摘要:');
        console.log(`📊 當前狀態: ${this.getStatusDisplayName(report.submissionInfo.status)}`);
        console.log(`📅 提交天數: ${report.timeline.daysSinceSubmission} 天`);
        console.log(`💬 總回饋數: ${report.feedback.total}`);
        console.log(`✅ 已解決: ${report.feedback.resolved}`);
        console.log(`⚠️  未解決: ${report.feedback.unresolved}`);
        
        return report;
    }

    /**
     * 獲取狀態顯示名稱
     */
    getStatusDisplayName(status) {
        const statusNames = {
            'not_submitted': '尚未提交',
            'submitted': '已提交',
            'in_review': '審核中',
            'pending_review': '等待審核',
            'approved': '已核准',
            'rejected': '被拒絕',
            'published': '已發佈',
            'preparing_resubmission': '準備重新提交'
        };
        return statusNames[status] || status;
    }

    /**
     * 載入狀態資料
     */
    loadStatusData() {
        try {
            const data = fs.readFileSync(this.statusFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.log('⚠️  無法載入狀態資料，使用預設值');
            return {
                submissionId: null,
                status: 'not_submitted',
                submittedAt: null,
                reviewStartedAt: null,
                completedAt: null,
                estimatedReviewTime: '3-5 business days',
                currentVersion: '1.0.0',
                reviewHistory: [],
                lastChecked: null,
                autoCheckEnabled: true,
                checkInterval: 3600000
            };
        }
    }

    /**
     * 儲存狀態資料
     */
    saveStatusData(data) {
        fs.writeFileSync(this.statusFile, JSON.stringify(data, null, 2), 'utf8');
    }

    /**
     * 載入回饋資料
     */
    loadFeedbackData() {
        try {
            const data = fs.readFileSync(this.feedbackFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return {
                feedback: [],
                totalFeedback: 0,
                unresolvedCount: 0,
                lastUpdated: null
            };
        }
    }

    /**
     * 儲存回饋資料
     */
    saveFeedbackData(data) {
        fs.writeFileSync(this.feedbackFile, JSON.stringify(data, null, 2), 'utf8');
    }
}

module.exports = ReviewStatusMonitor;