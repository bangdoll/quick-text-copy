#!/usr/bin/env node

/**
 * Chrome Web Store 審核狀態監控 CLI 工具
 */

const ReviewStatusMonitor = require('./review-status-monitor');

function showHelp() {
    console.log(`
📋 Chrome Web Store 審核狀態監控工具

使用方法:
  node review-status-cli.js <命令> [選項]

命令:
  check                    檢查當前審核狀態
  status                   顯示詳細狀態資訊
  submit <id> [version]    更新提交狀態
  update <status> [comment] 手動更新審核狀態
  feedback <type> <message> 添加審核回饋
  resolve <id> <solution>  標記回饋為已解決
  resubmit                 準備重新提交
  report                   生成狀態報告
  help                     顯示此幫助訊息

狀態值:
  submitted, in_review, pending_review, approved, rejected, published

回饋類型:
  permissions, functionality, metadata, privacy, security, other

範例:
  node review-status-cli.js check
  node review-status-cli.js submit "abc123" "1.0.0"
  node review-status-cli.js update "in_review" "審核已開始"
  node review-status-cli.js feedback "permissions" "需要移除不必要的權限"
  node review-status-cli.js resolve "1234567890" "已移除多餘權限"
`);
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === 'help') {
        showHelp();
        return;
    }
    
    const monitor = new ReviewStatusMonitor();
    const command = args[0];
    
    try {
        switch (command) {
            case 'check':
                monitor.checkReviewStatus();
                break;
                
            case 'status':
                const status = monitor.loadStatusData();
                console.log('📊 當前審核狀態:');
                console.log(JSON.stringify(status, null, 2));
                break;
                
            case 'submit':
                if (args.length < 2) {
                    console.log('❌ 請提供提交ID');
                    console.log('用法: node review-status-cli.js submit <提交ID> [版本]');
                    return;
                }
                const submissionData = {
                    submissionId: args[1],
                    version: args[2] || '1.0.0'
                };
                monitor.updateSubmissionStatus(submissionData);
                break;
                
            case 'update':
                if (args.length < 2) {
                    console.log('❌ 請提供新狀態');
                    console.log('用法: node review-status-cli.js update <狀態> [評論]');
                    return;
                }
                monitor.updateReviewStatus(args[1], args[2]);
                break;
                
            case 'feedback':
                if (args.length < 3) {
                    console.log('❌ 請提供回饋類型和訊息');
                    console.log('用法: node review-status-cli.js feedback <類型> <訊息>');
                    return;
                }
                const feedback = {
                    type: args[1],
                    message: args.slice(2).join(' '),
                    category: args[1],
                    actionRequired: true,
                    severity: 'medium'
                };
                monitor.handleReviewFeedback(feedback);
                break;
                
            case 'resolve':
                if (args.length < 3) {
                    console.log('❌ 請提供回饋ID和解決方案');
                    console.log('用法: node review-status-cli.js resolve <回饋ID> <解決方案>');
                    return;
                }
                monitor.resolveFeedback(args[1], args.slice(2).join(' '));
                break;
                
            case 'resubmit':
                monitor.prepareResubmission();
                break;
                
            case 'report':
                monitor.generateStatusReport();
                break;
                
            default:
                console.log(`❌ 未知命令: ${command}`);
                showHelp();
        }
    } catch (error) {
        console.error('❌ 執行錯誤:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };