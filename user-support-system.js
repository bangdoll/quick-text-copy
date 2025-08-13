/**
 * 使用者支援系統
 * 處理使用者回饋、問題報告和支援請求
 */

const fs = require('fs');
const path = require('path');

class UserSupportSystem {
    constructor() {
        this.supportDataPath = './support-data';
        this.templatesPath = './support-templates';
        this.configPath = './support-config.json';
        
        this.ensureDirectories();
        this.loadConfig();
        this.initializeTemplates();
    }

    /**
     * 確保必要的目錄存在
     */
    ensureDirectories() {
        [this.supportDataPath, this.templatesPath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * 載入支援配置
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
            console.error('載入支援配置失敗:', error.message);
            this.config = this.getDefaultConfig();
        }
    }

    /**
     * 取得預設配置
     */
    getDefaultConfig() {
        return {
            supportEmail: 'support@example.com',
            responseTime: {
                critical: 2, // 小時
                high: 24,    // 小時
                medium: 72,  // 小時
                low: 168     // 小時 (1週)
            },
            autoResponse: true,
            categories: [
                '功能問題',
                '安裝問題',
                '相容性問題',
                '功能建議',
                '錯誤報告',
                '其他'
            ],
            languages: ['zh-TW', 'zh-CN', 'en'],
            workingHours: {
                start: 9,
                end: 18,
                timezone: 'Asia/Taipei',
                workdays: [1, 2, 3, 4, 5] // 週一到週五
            }
        };
    }

    /**
     * 儲存配置
     */
    saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('❌ 儲存支援配置失敗:', error.message);
        }
    }

    /**
     * 初始化支援範本
     */
    initializeTemplates() {
        const templates = {
            'auto-response.md': this.getAutoResponseTemplate(),
            'bug-report-guide.md': this.getBugReportGuide(),
            'feature-request-guide.md': this.getFeatureRequestGuide(),
            'troubleshooting-guide.md': this.getTroubleshootingGuide(),
            'faq.md': this.getFAQTemplate()
        };

        Object.entries(templates).forEach(([filename, content]) => {
            const filePath = path.join(this.templatesPath, filename);
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, content);
            }
        });

        console.log('✅ 支援範本已初始化');
    }

    /**
     * 自動回覆範本
     */
    getAutoResponseTemplate() {
        return `# 自動回覆範本

感謝您聯絡 Quick Text Copy 支援團隊！

我們已收到您的訊息，將在 {responseTime} 內回覆您。

## 常見問題快速解答

### 擴充功能無法使用
1. 請確認擴充功能已啟用
2. 重新載入頁面後再試
3. 檢查是否有瀏覽器更新

### 複製功能失效
1. 確認頁面允許複製操作
2. 檢查瀏覽器權限設定
3. 嘗試重新安裝擴充功能

### 其他問題
請參考我們的 [故障排除指南](troubleshooting-guide.md)

---
Quick Text Copy 支援團隊
`;
    }

    /**
     * 錯誤報告指南
     */
    getBugReportGuide() {
        return `# 錯誤報告指南

為了幫助我們更快解決問題，請在報告錯誤時提供以下資訊：

## 必要資訊

### 環境資訊
- 瀏覽器版本：
- 作業系統：
- 擴充功能版本：

### 問題描述
- 發生什麼問題：
- 預期的行為：
- 實際的行為：

### 重現步驟
1. 
2. 
3. 

### 錯誤訊息
如果有錯誤訊息，請完整複製：
\`\`\`
[錯誤訊息]
\`\`\`

### 螢幕截圖
如果可能，請提供相關的螢幕截圖。

## 額外資訊

### 頻率
- [ ] 每次都發生
- [ ] 偶爾發生
- [ ] 只發生一次

### 影響範圍
- [ ] 特定網站
- [ ] 所有網站
- [ ] 特定操作

感謝您的協助！
`;
    }

    /**
     * 功能建議指南
     */
    getFeatureRequestGuide() {
        return `# 功能建議指南

我們歡迎您的功能建議！請按照以下格式提交：

## 功能描述
請詳細描述您希望的功能：

## 使用場景
說明這個功能在什麼情況下會用到：

## 預期效益
這個功能會如何改善您的使用體驗：

## 優先級
- [ ] 必要功能
- [ ] 重要功能
- [ ] 建議功能

## 類似功能
是否有其他工具提供類似功能：

感謝您的建議！我們會仔細評估每個建議。
`;
    }

    /**
     * 故障排除指南
     */
    getTroubleshootingGuide() {
        return `# 故障排除指南

## 常見問題解決方案

### 1. 擴充功能圖示沒有出現
**解決方案：**
- 檢查擴充功能是否已啟用
- 重新啟動瀏覽器
- 重新安裝擴充功能

### 2. 複製功能無效
**解決方案：**
- 確認頁面允許複製操作
- 檢查瀏覽器剪貼簿權限
- 嘗試在不同網站測試

### 3. 快捷鍵不起作用
**解決方案：**
- 檢查快捷鍵設定
- 確認沒有與其他擴充功能衝突
- 重新設定快捷鍵

### 4. 在某些網站無法使用
**解決方案：**
- 檢查網站的內容安全政策
- 確認擴充功能有權限存取該網站
- 重新載入頁面

### 5. 效能問題
**解決方案：**
- 關閉不必要的擴充功能
- 清除瀏覽器快取
- 重新啟動瀏覽器

## 進階故障排除

### 檢查控制台錯誤
1. 按 F12 開啟開發者工具
2. 切換到 Console 標籤
3. 重現問題並查看錯誤訊息

### 重設擴充功能
1. 停用擴充功能
2. 重新啟用
3. 測試功能是否正常

如果問題仍然存在，請聯絡我們的支援團隊。
`;
    }

    /**
     * 常見問題範本
     */
    getFAQTemplate() {
        return `# 常見問題 (FAQ)

## 一般問題

### Q: Quick Text Copy 是什麼？
A: Quick Text Copy 是一個 Chrome 擴充功能，可以讓您一鍵複製頁面標題和網址。

### Q: 如何使用這個擴充功能？
A: 安裝後，點擊瀏覽器工具列上的擴充功能圖示，即可複製當前頁面的標題和網址。

### Q: 支援哪些瀏覽器？
A: 目前支援 Chrome 88 以上版本。

## 功能問題

### Q: 為什麼有些網站無法複製？
A: 某些網站可能有安全限制，阻止擴充功能存取頁面內容。

### Q: 可以自訂複製格式嗎？
A: 目前版本提供標準格式，未來版本會考慮加入自訂功能。

### Q: 有快捷鍵嗎？
A: 您可以在 Chrome 擴充功能設定中自訂快捷鍵。

## 技術問題

### Q: 擴充功能會收集我的資料嗎？
A: 不會。我們不收集任何使用者資料，所有操作都在本地執行。

### Q: 為什麼需要「activeTab」權限？
A: 這個權限讓擴充功能能夠讀取當前頁面的標題和網址。

### Q: 如何回報問題？
A: 請透過 Chrome Web Store 的評價功能或聯絡我們的支援團隊。

## 更新問題

### Q: 如何更新擴充功能？
A: Chrome 會自動更新擴充功能，您也可以手動檢查更新。

### Q: 更新後設定會遺失嗎？
A: 不會，您的設定會保留。

如果您的問題沒有在這裡找到答案，請聯絡我們的支援團隊。
`;
    }

    /**
     * 創建支援票據
     */
    createSupportTicket(ticketData) {
        console.log('🎫 創建支援票據...');

        const ticket = {
            id: `TICKET_${Date.now()}`,
            subject: ticketData.subject || '無主旨',
            category: ticketData.category || '其他',
            priority: this.calculatePriority(ticketData),
            status: 'open',
            userInfo: {
                email: ticketData.email || '',
                browser: ticketData.browser || '',
                os: ticketData.os || '',
                extensionVersion: ticketData.extensionVersion || ''
            },
            content: ticketData.content || '',
            attachments: ticketData.attachments || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            assignedTo: null,
            responses: []
        };

        // 儲存票據
        const ticketPath = path.join(this.supportDataPath, `${ticket.id}.json`);
        fs.writeFileSync(ticketPath, JSON.stringify(ticket, null, 2));

        // 發送自動回覆
        if (this.config.autoResponse) {
            this.sendAutoResponse(ticket);
        }

        console.log(`✅ 支援票據已創建: ${ticket.id}`);
        console.log(`📧 類別: ${ticket.category}`);
        console.log(`⚡ 優先級: ${ticket.priority}`);
        console.log(`⏰ 預計回覆時間: ${this.config.responseTime[ticket.priority]} 小時`);

        return ticket;
    }

    /**
     * 計算優先級
     */
    calculatePriority(ticketData) {
        const content = (ticketData.content || '').toLowerCase();
        const subject = (ticketData.subject || '').toLowerCase();
        const text = content + ' ' + subject;

        // 關鍵字優先級判斷
        if (text.includes('無法使用') || text.includes('完全失效') || text.includes('當機')) {
            return 'critical';
        }
        
        if (text.includes('錯誤') || text.includes('問題') || text.includes('失效')) {
            return 'high';
        }
        
        if (text.includes('建議') || text.includes('改進') || text.includes('功能')) {
            return 'low';
        }
        
        return 'medium';
    }

    /**
     * 發送自動回覆
     */
    sendAutoResponse(ticket) {
        const responseTime = this.config.responseTime[ticket.priority];
        const autoResponse = {
            id: `RESPONSE_${Date.now()}`,
            type: 'auto',
            content: `感謝您聯絡我們！我們已收到您的支援請求 (票據編號: ${ticket.id})，將在 ${responseTime} 小時內回覆您。`,
            createdAt: new Date().toISOString(),
            author: 'system'
        };

        ticket.responses.push(autoResponse);
        
        const ticketPath = path.join(this.supportDataPath, `${ticket.id}.json`);
        fs.writeFileSync(ticketPath, JSON.stringify(ticket, null, 2));

        console.log('📧 自動回覆已發送');
    }

    /**
     * 列出支援票據
     */
    listSupportTickets(status = 'all', limit = 10) {
        console.log('🎫 支援票據列表:');
        console.log('─'.repeat(80));

        try {
            const files = fs.readdirSync(this.supportDataPath)
                .filter(file => file.endsWith('.json'))
                .slice(0, limit);

            if (files.length === 0) {
                console.log('   目前沒有支援票據');
                return;
            }

            files.forEach(file => {
                const ticketPath = path.join(this.supportDataPath, file);
                const ticket = JSON.parse(fs.readFileSync(ticketPath, 'utf8'));

                if (status !== 'all' && ticket.status !== status) {
                    return;
                }

                const date = new Date(ticket.createdAt).toLocaleDateString('zh-TW');
                const statusIcon = this.getStatusIcon(ticket.status);
                const priorityIcon = this.getPriorityIcon(ticket.priority);

                console.log(`${statusIcon} ${ticket.id} - ${ticket.subject}`);
                console.log(`   📅 ${date} | 📂 ${ticket.category} | ${priorityIcon} ${ticket.priority}`);
                console.log(`   👤 ${ticket.userInfo.email || '匿名'}`);
                console.log('');
            });
        } catch (error) {
            console.error('❌ 讀取支援票據失敗:', error.message);
        }
    }

    /**
     * 取得狀態圖示
     */
    getStatusIcon(status) {
        const icons = {
            'open': '🟢',
            'in_progress': '🟡',
            'waiting': '🟠',
            'resolved': '✅',
            'closed': '⚫'
        };
        return icons[status] || '❓';
    }

    /**
     * 取得優先級圖示
     */
    getPriorityIcon(priority) {
        const icons = {
            'critical': '🔴',
            'high': '🟠',
            'medium': '🟡',
            'low': '🟢'
        };
        return icons[priority] || '⚪';
    }

    /**
     * 更新票據狀態
     */
    updateTicketStatus(ticketId, newStatus, comment = '') {
        try {
            const ticketPath = path.join(this.supportDataPath, `${ticketId}.json`);
            
            if (!fs.existsSync(ticketPath)) {
                console.error(`❌ 找不到票據: ${ticketId}`);
                return false;
            }

            const ticket = JSON.parse(fs.readFileSync(ticketPath, 'utf8'));
            const oldStatus = ticket.status;
            
            ticket.status = newStatus;
            ticket.updatedAt = new Date().toISOString();

            if (comment) {
                const response = {
                    id: `RESPONSE_${Date.now()}`,
                    type: 'status_update',
                    content: comment,
                    createdAt: new Date().toISOString(),
                    author: 'support',
                    statusChange: {
                        from: oldStatus,
                        to: newStatus
                    }
                };
                ticket.responses.push(response);
            }

            fs.writeFileSync(ticketPath, JSON.stringify(ticket, null, 2));

            console.log(`✅ 票據 ${ticketId} 狀態已更新: ${oldStatus} → ${newStatus}`);
            return true;
        } catch (error) {
            console.error('❌ 更新票據狀態失敗:', error.message);
            return false;
        }
    }

    /**
     * 生成支援統計報告
     */
    generateSupportReport() {
        console.log('📊 生成支援統計報告...');

        try {
            const files = fs.readdirSync(this.supportDataPath)
                .filter(file => file.endsWith('.json'));

            const report = {
                timestamp: new Date().toISOString(),
                totalTickets: files.length,
                statusDistribution: {},
                categoryDistribution: {},
                priorityDistribution: {},
                averageResponseTime: 0,
                satisfactionRate: 0
            };

            let totalResponseTime = 0;
            let responseCount = 0;

            files.forEach(file => {
                const ticketPath = path.join(this.supportDataPath, file);
                const ticket = JSON.parse(fs.readFileSync(ticketPath, 'utf8'));

                // 狀態分佈
                report.statusDistribution[ticket.status] = 
                    (report.statusDistribution[ticket.status] || 0) + 1;

                // 類別分佈
                report.categoryDistribution[ticket.category] = 
                    (report.categoryDistribution[ticket.category] || 0) + 1;

                // 優先級分佈
                report.priorityDistribution[ticket.priority] = 
                    (report.priorityDistribution[ticket.priority] || 0) + 1;

                // 計算回應時間
                if (ticket.responses.length > 1) {
                    const created = new Date(ticket.createdAt);
                    const firstResponse = new Date(ticket.responses[1].createdAt);
                    const responseTime = (firstResponse - created) / (1000 * 60 * 60); // 小時
                    totalResponseTime += responseTime;
                    responseCount++;
                }
            });

            if (responseCount > 0) {
                report.averageResponseTime = (totalResponseTime / responseCount).toFixed(2);
            }

            // 儲存報告
            const reportPath = path.join(this.supportDataPath, `support-report-${Date.now()}.json`);
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

            console.log('✅ 支援統計報告已生成');
            console.log(`📊 總票據數: ${report.totalTickets}`);
            console.log(`⏱️  平均回應時間: ${report.averageResponseTime} 小時`);
            console.log(`📈 狀態分佈:`, report.statusDistribution);

            return report;
        } catch (error) {
            console.error('❌ 生成支援報告失敗:', error.message);
            return null;
        }
    }
}

module.exports = UserSupportSystem;

// 如果直接執行此檔案
if (require.main === module) {
    const support = new UserSupportSystem();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'create':
            // 示例票據
            const sampleTicket = {
                subject: '複製功能無法使用',
                category: '功能問題',
                email: 'user@example.com',
                browser: 'Chrome 120',
                os: 'Windows 11',
                extensionVersion: '1.0.0',
                content: '點擊擴充功能圖示後沒有任何反應，無法複製頁面標題和網址。'
            };
            support.createSupportTicket(sampleTicket);
            break;
            
        case 'list':
            const status = process.argv[3] || 'all';
            const limit = parseInt(process.argv[4]) || 10;
            support.listSupportTickets(status, limit);
            break;
            
        case 'update':
            const ticketId = process.argv[3];
            const newStatus = process.argv[4];
            const comment = process.argv[5] || '';
            if (ticketId && newStatus) {
                support.updateTicketStatus(ticketId, newStatus, comment);
            } else {
                console.error('❌ 請提供票據 ID 和新狀態');
            }
            break;
            
        case 'report':
            support.generateSupportReport();
            break;
            
        default:
            console.log('📖 使用者支援系統使用說明:');
            console.log('');
            console.log('  node user-support-system.js create');
            console.log('  node user-support-system.js list [status] [limit]');
            console.log('  node user-support-system.js update <ticketId> <status> [comment]');
            console.log('  node user-support-system.js report');
            console.log('');
            console.log('狀態選項: open, in_progress, waiting, resolved, closed');
            break;
    }
}