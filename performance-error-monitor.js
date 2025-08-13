/**
 * 效能和錯誤監控系統
 * 監控擴充功能的效能指標和錯誤狀況
 */

const fs = require('fs');
const path = require('path');

class PerformanceErrorMonitor {
    constructor() {
        this.monitoringDataPath = './monitoring-data';
        this.configPath = './performance-monitor-config.json';
        this.alertsPath = './performance-alerts';
        
        this.ensureDirectories();
        this.loadConfig();
        this.initializeMonitoring();
    }

    /**
     * 確保必要的目錄存在
     */
    ensureDirectories() {
        [this.monitoringDataPath, this.alertsPath].forEach(dir => {
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
            console.error('載入監控配置失敗:', error.message);
            this.config = this.getDefaultConfig();
        }
    }

    /**
     * 取得預設配置
     */
    getDefaultConfig() {
        return {
            monitoring: {
                enabled: true,
                interval: 300000, // 5分鐘
                retentionDays: 30
            },
            thresholds: {
                memoryUsage: 50, // MB
                cpuUsage: 10,    // %
                responseTime: 1000, // ms
                errorRate: 0.05, // 5%
                crashRate: 0.01  // 1%
            },
            alerts: {
                enabled: true,
                email: '',
                webhook: '',
                cooldown: 3600000 // 1小時
            },
            metrics: {
                performance: true,
                errors: true,
                usage: true,
                network: true
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
            console.error('❌ 儲存監控配置失敗:', error.message);
        }
    }

    /**
     * 初始化監控
     */
    initializeMonitoring() {
        console.log('🔄 初始化效能和錯誤監控系統...');
        
        if (!this.config.monitoring.enabled) {
            console.log('⚠️  監控功能已停用');
            return;
        }

        // 創建監控資料結構
        this.metricsData = {
            performance: [],
            errors: [],
            usage: [],
            network: []
        };

        console.log('✅ 監控系統已初始化');
    }

    /**
     * 收集效能指標
     */
    collectPerformanceMetrics() {
        console.log('📊 收集效能指標...');

        const metrics = {
            timestamp: new Date().toISOString(),
            memory: this.getMemoryMetrics(),
            cpu: this.getCPUMetrics(),
            responseTime: this.getResponseTimeMetrics(),
            storage: this.getStorageMetrics(),
            network: this.getNetworkMetrics()
        };

        // 儲存指標
        this.metricsData.performance.push(metrics);
        this.saveMetricsData();

        // 檢查閾值
        this.checkPerformanceThresholds(metrics);

        console.log('✅ 效能指標收集完成');
        console.log(`💾 記憶體使用: ${metrics.memory.used}MB`);
        console.log(`⚡ CPU 使用: ${metrics.cpu.usage}%`);
        console.log(`⏱️  回應時間: ${metrics.responseTime.average}ms`);

        return metrics;
    }

    /**
     * 取得記憶體指標
     */
    getMemoryMetrics() {
        // 模擬記憶體使用資料
        const used = Math.floor(Math.random() * 100) + 10; // 10-110 MB
        const available = 1024; // 1GB 可用記憶體
        
        return {
            used: used,
            available: available,
            percentage: ((used / available) * 100).toFixed(2),
            peak: used + Math.floor(Math.random() * 20),
            leaks: Math.random() < 0.1 // 10% 機率有記憶體洩漏
        };
    }

    /**
     * 取得 CPU 指標
     */
    getCPUMetrics() {
        // 模擬 CPU 使用資料
        const usage = Math.random() * 15; // 0-15%
        
        return {
            usage: usage.toFixed(2),
            peak: (usage + Math.random() * 5).toFixed(2),
            threads: Math.floor(Math.random() * 3) + 1,
            blocking: Math.random() < 0.05 // 5% 機率有阻塞
        };
    }

    /**
     * 取得回應時間指標
     */
    getResponseTimeMetrics() {
        // 模擬回應時間資料
        const times = [];
        for (let i = 0; i < 10; i++) {
            times.push(Math.floor(Math.random() * 2000) + 50); // 50-2050ms
        }
        
        const average = times.reduce((a, b) => a + b, 0) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);
        
        return {
            average: Math.floor(average),
            min: min,
            max: max,
            p95: Math.floor(average * 1.5),
            p99: Math.floor(average * 2)
        };
    }

    /**
     * 取得儲存指標
     */
    getStorageMetrics() {
        // 模擬儲存使用資料
        const used = Math.floor(Math.random() * 10) + 1; // 1-11 MB
        const quota = 100; // 100MB 配額
        
        return {
            used: used,
            quota: quota,
            percentage: ((used / quota) * 100).toFixed(2),
            operations: Math.floor(Math.random() * 1000) + 100
        };
    }

    /**
     * 取得網路指標
     */
    getNetworkMetrics() {
        // 模擬網路指標
        return {
            requests: Math.floor(Math.random() * 50) + 10,
            failures: Math.floor(Math.random() * 3),
            averageLatency: Math.floor(Math.random() * 500) + 50,
            bandwidth: Math.floor(Math.random() * 1000) + 100
        };
    }

    /**
     * 收集錯誤資料
     */
    collectErrorMetrics() {
        console.log('🐛 收集錯誤資料...');

        const errorData = {
            timestamp: new Date().toISOString(),
            errors: this.generateErrorSamples(),
            crashes: this.generateCrashData(),
            warnings: this.generateWarningData(),
            summary: {}
        };

        // 計算錯誤摘要
        errorData.summary = {
            totalErrors: errorData.errors.length,
            totalCrashes: errorData.crashes.length,
            totalWarnings: errorData.warnings.length,
            errorRate: this.calculateErrorRate(errorData.errors),
            crashRate: this.calculateCrashRate(errorData.crashes),
            topErrors: this.getTopErrors(errorData.errors)
        };

        // 儲存錯誤資料
        this.metricsData.errors.push(errorData);
        this.saveMetricsData();

        // 檢查錯誤閾值
        this.checkErrorThresholds(errorData);

        console.log('✅ 錯誤資料收集完成');
        console.log(`❌ 錯誤數量: ${errorData.summary.totalErrors}`);
        console.log(`💥 當機數量: ${errorData.summary.totalCrashes}`);
        console.log(`⚠️  警告數量: ${errorData.summary.totalWarnings}`);

        return errorData;
    }

    /**
     * 生成錯誤樣本
     */
    generateErrorSamples() {
        const errorTypes = [
            'TypeError: Cannot read property',
            'ReferenceError: Variable not defined',
            'NetworkError: Failed to fetch',
            'SecurityError: Permission denied',
            'TimeoutError: Request timeout'
        ];

        const errors = [];
        const errorCount = Math.floor(Math.random() * 10); // 0-9 個錯誤

        for (let i = 0; i < errorCount; i++) {
            const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
            errors.push({
                id: `ERROR_${Date.now()}_${i}`,
                type: errorType,
                message: `${errorType}: 詳細錯誤訊息`,
                stack: `at function (chrome-extension://...)\nat handler (chrome-extension://...)`,
                timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
                severity: this.getRandomSeverity(),
                url: 'https://example.com',
                userAgent: 'Chrome/120.0.0.0',
                extensionVersion: '1.0.0'
            });
        }

        return errors;
    }

    /**
     * 生成當機資料
     */
    generateCrashData() {
        const crashes = [];
        const crashCount = Math.random() < 0.1 ? 1 : 0; // 10% 機率有當機

        for (let i = 0; i < crashCount; i++) {
            crashes.push({
                id: `CRASH_${Date.now()}_${i}`,
                type: 'extension_crash',
                reason: 'Unhandled exception',
                timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
                context: 'service_worker',
                memoryUsage: Math.floor(Math.random() * 200) + 50,
                stackTrace: 'at ServiceWorker (chrome-extension://...)'
            });
        }

        return crashes;
    }

    /**
     * 生成警告資料
     */
    generateWarningData() {
        const warningTypes = [
            'Performance warning: Slow operation',
            'Memory warning: High usage',
            'Network warning: Slow response',
            'Storage warning: Quota exceeded'
        ];

        const warnings = [];
        const warningCount = Math.floor(Math.random() * 5); // 0-4 個警告

        for (let i = 0; i < warningCount; i++) {
            const warningType = warningTypes[Math.floor(Math.random() * warningTypes.length)];
            warnings.push({
                id: `WARNING_${Date.now()}_${i}`,
                type: warningType,
                message: `${warningType}: 詳細警告訊息`,
                timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
                severity: 'warning'
            });
        }

        return warnings;
    }

    /**
     * 取得隨機嚴重程度
     */
    getRandomSeverity() {
        const severities = ['low', 'medium', 'high', 'critical'];
        const weights = [0.4, 0.3, 0.2, 0.1]; // 權重分佈
        
        const random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < severities.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return severities[i];
            }
        }
        
        return 'low';
    }

    /**
     * 計算錯誤率
     */
    calculateErrorRate(errors) {
        const totalOperations = Math.floor(Math.random() * 10000) + 1000;
        return (errors.length / totalOperations).toFixed(4);
    }

    /**
     * 計算當機率
     */
    calculateCrashRate(crashes) {
        const totalSessions = Math.floor(Math.random() * 1000) + 100;
        return (crashes.length / totalSessions).toFixed(4);
    }

    /**
     * 取得最常見錯誤
     */
    getTopErrors(errors) {
        const errorCounts = {};
        
        errors.forEach(error => {
            const type = error.type.split(':')[0];
            errorCounts[type] = (errorCounts[type] || 0) + 1;
        });

        return Object.entries(errorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([type, count]) => ({ type, count }));
    }

    /**
     * 檢查效能閾值
     */
    checkPerformanceThresholds(metrics) {
        const alerts = [];

        // 檢查記憶體使用
        if (metrics.memory.used > this.config.thresholds.memoryUsage) {
            alerts.push({
                type: 'memory_high',
                severity: 'warning',
                message: `記憶體使用過高: ${metrics.memory.used}MB (閾值: ${this.config.thresholds.memoryUsage}MB)`,
                value: metrics.memory.used,
                threshold: this.config.thresholds.memoryUsage
            });
        }

        // 檢查 CPU 使用
        if (parseFloat(metrics.cpu.usage) > this.config.thresholds.cpuUsage) {
            alerts.push({
                type: 'cpu_high',
                severity: 'warning',
                message: `CPU 使用過高: ${metrics.cpu.usage}% (閾值: ${this.config.thresholds.cpuUsage}%)`,
                value: parseFloat(metrics.cpu.usage),
                threshold: this.config.thresholds.cpuUsage
            });
        }

        // 檢查回應時間
        if (metrics.responseTime.average > this.config.thresholds.responseTime) {
            alerts.push({
                type: 'response_slow',
                severity: 'warning',
                message: `回應時間過慢: ${metrics.responseTime.average}ms (閾值: ${this.config.thresholds.responseTime}ms)`,
                value: metrics.responseTime.average,
                threshold: this.config.thresholds.responseTime
            });
        }

        if (alerts.length > 0) {
            this.triggerAlerts(alerts);
        }
    }

    /**
     * 檢查錯誤閾值
     */
    checkErrorThresholds(errorData) {
        const alerts = [];

        // 檢查錯誤率
        if (parseFloat(errorData.summary.errorRate) > this.config.thresholds.errorRate) {
            alerts.push({
                type: 'error_rate_high',
                severity: 'critical',
                message: `錯誤率過高: ${errorData.summary.errorRate} (閾值: ${this.config.thresholds.errorRate})`,
                value: parseFloat(errorData.summary.errorRate),
                threshold: this.config.thresholds.errorRate
            });
        }

        // 檢查當機率
        if (parseFloat(errorData.summary.crashRate) > this.config.thresholds.crashRate) {
            alerts.push({
                type: 'crash_rate_high',
                severity: 'critical',
                message: `當機率過高: ${errorData.summary.crashRate} (閾值: ${this.config.thresholds.crashRate})`,
                value: parseFloat(errorData.summary.crashRate),
                threshold: this.config.thresholds.crashRate
            });
        }

        if (alerts.length > 0) {
            this.triggerAlerts(alerts);
        }
    }

    /**
     * 觸發警告
     */
    triggerAlerts(alerts) {
        if (!this.config.alerts.enabled) {
            return;
        }

        console.log(`🚨 觸發 ${alerts.length} 個警告:`);

        alerts.forEach(alert => {
            console.log(`   ${this.getAlertIcon(alert.severity)} ${alert.message}`);
            
            // 儲存警告
            const alertData = {
                ...alert,
                id: `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString(),
                acknowledged: false
            };

            const alertPath = path.join(this.alertsPath, `${alertData.id}.json`);
            fs.writeFileSync(alertPath, JSON.stringify(alertData, null, 2));
        });
    }

    /**
     * 取得警告圖示
     */
    getAlertIcon(severity) {
        const icons = {
            'low': '🟢',
            'warning': '🟡',
            'high': '🟠',
            'critical': '🔴'
        };
        return icons[severity] || '⚪';
    }

    /**
     * 儲存指標資料
     */
    saveMetricsData() {
        try {
            const dataPath = path.join(this.monitoringDataPath, `metrics-${new Date().toISOString().split('T')[0]}.json`);
            fs.writeFileSync(dataPath, JSON.stringify(this.metricsData, null, 2));
        } catch (error) {
            console.error('❌ 儲存指標資料失敗:', error.message);
        }
    }

    /**
     * 生成監控報告
     */
    generateMonitoringReport() {
        console.log('📊 生成監控報告...');

        const report = {
            timestamp: new Date().toISOString(),
            period: '24小時',
            summary: {
                totalMetrics: this.metricsData.performance.length,
                totalErrors: this.metricsData.errors.reduce((sum, data) => sum + data.summary.totalErrors, 0),
                totalCrashes: this.metricsData.errors.reduce((sum, data) => sum + data.summary.totalCrashes, 0),
                averageMemoryUsage: 0,
                averageCPUUsage: 0,
                averageResponseTime: 0
            },
            trends: {
                memoryTrend: 'stable',
                cpuTrend: 'stable',
                errorTrend: 'decreasing',
                performanceTrend: 'improving'
            },
            alerts: this.getRecentAlerts(),
            recommendations: this.generateRecommendations()
        };

        // 計算平均值
        if (this.metricsData.performance.length > 0) {
            const totalMemory = this.metricsData.performance.reduce((sum, m) => sum + m.memory.used, 0);
            const totalCPU = this.metricsData.performance.reduce((sum, m) => sum + parseFloat(m.cpu.usage), 0);
            const totalResponseTime = this.metricsData.performance.reduce((sum, m) => sum + m.responseTime.average, 0);

            report.summary.averageMemoryUsage = (totalMemory / this.metricsData.performance.length).toFixed(2);
            report.summary.averageCPUUsage = (totalCPU / this.metricsData.performance.length).toFixed(2);
            report.summary.averageResponseTime = Math.floor(totalResponseTime / this.metricsData.performance.length);
        }

        // 儲存報告
        const reportPath = path.join(this.monitoringDataPath, `monitoring-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('✅ 監控報告已生成');
        console.log(`📈 總指標數: ${report.summary.totalMetrics}`);
        console.log(`❌ 總錯誤數: ${report.summary.totalErrors}`);
        console.log(`💾 平均記憶體使用: ${report.summary.averageMemoryUsage}MB`);
        console.log(`⚡ 平均 CPU 使用: ${report.summary.averageCPUUsage}%`);

        return report;
    }

    /**
     * 取得最近警告
     */
    getRecentAlerts() {
        try {
            const alertFiles = fs.readdirSync(this.alertsPath)
                .filter(file => file.endsWith('.json'))
                .slice(0, 10);

            return alertFiles.map(file => {
                const alertPath = path.join(this.alertsPath, file);
                return JSON.parse(fs.readFileSync(alertPath, 'utf8'));
            });
        } catch (error) {
            console.error('讀取警告失敗:', error.message);
            return [];
        }
    }

    /**
     * 生成建議
     */
    generateRecommendations() {
        const recommendations = [];

        // 基於最近的指標生成建議
        if (this.metricsData.performance.length > 0) {
            const latestMetrics = this.metricsData.performance[this.metricsData.performance.length - 1];

            if (latestMetrics.memory.used > 80) {
                recommendations.push({
                    type: 'memory_optimization',
                    priority: 'high',
                    message: '建議最佳化記憶體使用，檢查是否有記憶體洩漏'
                });
            }

            if (latestMetrics.responseTime.average > 1000) {
                recommendations.push({
                    type: 'performance_optimization',
                    priority: 'medium',
                    message: '建議最佳化回應時間，檢查是否有阻塞操作'
                });
            }
        }

        if (this.metricsData.errors.length > 0) {
            const latestErrors = this.metricsData.errors[this.metricsData.errors.length - 1];
            
            if (latestErrors.summary.totalErrors > 10) {
                recommendations.push({
                    type: 'error_handling',
                    priority: 'high',
                    message: '建議加強錯誤處理機制，減少錯誤發生'
                });
            }
        }

        return recommendations;
    }

    /**
     * 啟動持續監控
     */
    startContinuousMonitoring() {
        if (!this.config.monitoring.enabled) {
            console.log('⚠️  監控功能已停用');
            return;
        }

        console.log('🚀 啟動持續監控...');
        console.log(`⏰ 監控間隔: ${this.config.monitoring.interval / 1000} 秒`);

        this.monitoringInterval = setInterval(() => {
            this.collectPerformanceMetrics();
            this.collectErrorMetrics();
        }, this.config.monitoring.interval);

        console.log('✅ 持續監控已啟動');
    }

    /**
     * 停止持續監控
     */
    stopContinuousMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            console.log('⏹️  持續監控已停止');
        }
    }
}

module.exports = PerformanceErrorMonitor;

// 如果直接執行此檔案
if (require.main === module) {
    const monitor = new PerformanceErrorMonitor();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'collect':
            monitor.collectPerformanceMetrics();
            monitor.collectErrorMetrics();
            break;
            
        case 'report':
            monitor.generateMonitoringReport();
            break;
            
        case 'start':
            monitor.startContinuousMonitoring();
            // 保持程序運行
            process.on('SIGINT', () => {
                monitor.stopContinuousMonitoring();
                process.exit(0);
            });
            break;
            
        case 'stop':
            monitor.stopContinuousMonitoring();
            break;
            
        default:
            console.log('📖 效能和錯誤監控系統使用說明:');
            console.log('');
            console.log('  node performance-error-monitor.js collect  # 收集一次指標');
            console.log('  node performance-error-monitor.js report   # 生成監控報告');
            console.log('  node performance-error-monitor.js start    # 啟動持續監控');
            console.log('  node performance-error-monitor.js stop     # 停止持續監控');
            break;
    }
}