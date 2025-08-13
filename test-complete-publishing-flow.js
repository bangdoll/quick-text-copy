#!/usr/bin/env node

/**
 * Chrome Web Store 完整發佈流程測試
 * 整合所有發佈相關工具，執行端到端測試
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 引入現有的工具類別
const PackageBuilder = require('./build-package.js');
const ComplianceChecker = require('./compliance-checker.js');
const ExtensionFunctionalityTester = require('./test-extension.js');
const ChromeStoreSubmission = require('./chrome-store-submission.js');

class CompletePublishingFlowTester {
    constructor() {
        this.testStartTime = new Date();
        this.testResults = {
            packageBuild: { passed: false, details: [], duration: 0 },
            storeListing: { passed: false, details: [], duration: 0 },
            complianceCheck: { passed: false, details: [], duration: 0 },
            uploadSimulation: { passed: false, details: [], duration: 0 },
            monitoringTest: { passed: false, details: [], duration: 0 },
            overall: { passed: false, score: 0, totalDuration: 0 }
        };
        
        this.tempFiles = []; // 追蹤測試過程中創建的臨時檔案
    }

    /**
     * 執行完整發佈流程測試
     */
    async runCompleteTest() {
        console.log('🚀 開始執行 Chrome Web Store 完整發佈流程測試...\n');
        console.log('='.repeat(70));
        console.log('📋 測試項目：');
        console.log('   1. 套件建置流程驗證');
        console.log('   2. 商店列表完整性和準確性測試');
        console.log('   3. 合規性檢查有效性驗證');
        console.log('   4. 上傳和提交流程模擬');
        console.log('   5. 監控和管理功能測試');
        console.log('='.repeat(70));
        console.log('');

        try {
            // 1. 測試套件建置流程
            await this.testPackageBuildFlow();
            
            // 2. 測試商店列表
            await this.testStoreListingIntegrity();
            
            // 3. 測試合規性檢查
            await this.testComplianceCheckEffectiveness();
            
            // 4. 模擬上傳和提交流程
            await this.testUploadAndSubmissionFlow();
            
            // 5. 測試監控和管理功能
            await this.testMonitoringAndManagement();
            
            // 生成最終報告
            this.generateFinalReport();
            
            // 清理臨時檔案
            this.cleanup();
            
            return this.testResults;
            
        } catch (error) {
            console.error('❌ 完整發佈流程測試失敗:', error.message);
            this.cleanup();
            throw error;
        }
    }

    /**
     * 1. 測試套件建置流程
     */
    async testPackageBuildFlow() {
        console.log('📦 1. 測試套件建置流程...');
        const startTime = Date.now();
        
        try {
            // 檢查必要檔案是否存在
            const requiredFiles = [
                'manifest.json',
                'service-worker.js',
                'icons/icon16.png',
                'icons/icon32.png',
                'icons/icon48.png',
                'icons/icon128.png'
            ];
            
            let missingFiles = [];
            requiredFiles.forEach(file => {
                if (!fs.existsSync(file)) {
                    missingFiles.push(file);
                }
            });
            
            if (missingFiles.length > 0) {
                this.testResults.packageBuild.details.push(`❌ 缺少必要檔案: ${missingFiles.join(', ')}`);
                this.testResults.packageBuild.passed = false;
                return;
            }
            
            this.testResults.packageBuild.details.push('✅ 所有必要檔案都存在');
            
            // 執行套件建置
            const builder = new PackageBuilder();
            
            // 驗證 manifest
            try {
                const manifest = builder.validateManifest();
                this.testResults.packageBuild.details.push('✅ Manifest 驗證通過');
                this.testResults.packageBuild.details.push(`   - 擴充功能名稱: ${manifest.name}`);
                this.testResults.packageBuild.details.push(`   - 版本: ${manifest.version}`);
            } catch (error) {
                this.testResults.packageBuild.details.push(`❌ Manifest 驗證失敗: ${error.message}`);
                this.testResults.packageBuild.passed = false;
                return;
            }
            
            // 驗證圖標
            try {
                builder.validateIcons();
                this.testResults.packageBuild.details.push('✅ 圖標驗證通過');
            } catch (error) {
                this.testResults.packageBuild.details.push(`❌ 圖標驗證失敗: ${error.message}`);
                this.testResults.packageBuild.passed = false;
                return;
            }
            
            // 執行完整建置
            try {
                await builder.build();
                this.testResults.packageBuild.details.push('✅ 套件建置成功');
                
                // 檢查生成的 ZIP 檔案
                const zipFile = 'quick-text-copy-extension.zip';
                if (fs.existsSync(zipFile)) {
                    const stats = fs.statSync(zipFile);
                    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                    this.testResults.packageBuild.details.push(`✅ ZIP 檔案已生成 (${sizeMB} MB)`);
                    this.tempFiles.push(zipFile);
                } else {
                    this.testResults.packageBuild.details.push('❌ ZIP 檔案未生成');
                    this.testResults.packageBuild.passed = false;
                    return;
                }
                
            } catch (error) {
                this.testResults.packageBuild.details.push(`❌ 套件建置失敗: ${error.message}`);
                this.testResults.packageBuild.passed = false;
                return;
            }
            
            this.testResults.packageBuild.passed = true;
            
        } catch (error) {
            this.testResults.packageBuild.details.push(`❌ 套件建置測試失敗: ${error.message}`);
            this.testResults.packageBuild.passed = false;
        } finally {
            this.testResults.packageBuild.duration = Date.now() - startTime;
            console.log(`   完成時間: ${this.testResults.packageBuild.duration}ms\n`);
        }
    }

    /**
     * 2. 測試商店列表完整性和準確性
     */
    async testStoreListingIntegrity() {
        console.log('🏪 2. 測試商店列表完整性和準確性...');
        const startTime = Date.now();
        
        try {
            // 檢查商店列表配置檔案
            const storeListingFiles = [
                'chrome-store-listing/store-description.md',
                'chrome-store-listing/store-listing-config.json',
                'chrome-store-listing/screenshot-guide.md',
                'chrome-store-listing/submission-checklist.md'
            ];
            
            let existingFiles = [];
            let missingFiles = [];
            
            storeListingFiles.forEach(file => {
                if (fs.existsSync(file)) {
                    existingFiles.push(file);
                } else {
                    missingFiles.push(file);
                }
            });
            
            this.testResults.storeListing.details.push(`✅ 找到 ${existingFiles.length} 個商店列表檔案`);
            
            if (missingFiles.length > 0) {
                this.testResults.storeListing.details.push(`⚠️  缺少檔案: ${missingFiles.join(', ')}`);
            }
            
            // 檢查商店描述
            if (fs.existsSync('chrome-store-listing/store-description.md')) {
                const description = fs.readFileSync('chrome-store-listing/store-description.md', 'utf8');
                
                if (description.length > 100) {
                    this.testResults.storeListing.details.push('✅ 商店描述內容充足');
                } else {
                    this.testResults.storeListing.details.push('⚠️  商店描述內容較少，建議擴充');
                }
                
                // 檢查是否包含關鍵資訊
                const keyInfo = ['功能', '使用方法', '特色', '安裝'];
                const foundInfo = keyInfo.filter(info => description.includes(info));
                
                if (foundInfo.length >= 2) {
                    this.testResults.storeListing.details.push(`✅ 包含關鍵資訊: ${foundInfo.join(', ')}`);
                } else {
                    this.testResults.storeListing.details.push('⚠️  建議添加更多功能說明');
                }
            }
            
            // 檢查截圖檔案
            const screenshotDir = 'chrome-store-listing/screenshots';
            if (fs.existsSync(screenshotDir)) {
                const screenshots = fs.readdirSync(screenshotDir)
                    .filter(file => file.endsWith('.png') || file.endsWith('.jpg'));
                
                if (screenshots.length >= 1) {
                    this.testResults.storeListing.details.push(`✅ 找到 ${screenshots.length} 個截圖檔案`);
                } else {
                    this.testResults.storeListing.details.push('❌ 至少需要 1 個截圖檔案');
                    this.testResults.storeListing.passed = false;
                    return;
                }
            } else {
                this.testResults.storeListing.details.push('❌ 截圖目錄不存在');
                this.testResults.storeListing.passed = false;
                return;
            }
            
            // 檢查商店列表配置
            if (fs.existsSync('chrome-store-listing/store-listing-config.json')) {
                try {
                    const config = JSON.parse(fs.readFileSync('chrome-store-listing/store-listing-config.json', 'utf8'));
                    
                    const requiredFields = ['name', 'summary', 'description', 'category'];
                    const missingConfigFields = requiredFields.filter(field => !config[field]);
                    
                    if (missingConfigFields.length === 0) {
                        this.testResults.storeListing.details.push('✅ 商店列表配置完整');
                    } else {
                        this.testResults.storeListing.details.push(`⚠️  配置缺少欄位: ${missingConfigFields.join(', ')}`);
                    }
                    
                } catch (error) {
                    this.testResults.storeListing.details.push('❌ 商店列表配置格式錯誤');
                    this.testResults.storeListing.passed = false;
                    return;
                }
            }
            
            // 檢查中繼資料
            const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
            
            // 檢查名稱長度（Chrome Web Store 限制）
            if (manifest.name.length <= 45) {
                this.testResults.storeListing.details.push('✅ 擴充功能名稱長度符合要求');
            } else {
                this.testResults.storeListing.details.push('❌ 擴充功能名稱過長（超過 45 字元）');
                this.testResults.storeListing.passed = false;
                return;
            }
            
            // 檢查描述長度
            if (manifest.description.length <= 132) {
                this.testResults.storeListing.details.push('✅ 擴充功能描述長度符合要求');
            } else {
                this.testResults.storeListing.details.push('❌ 擴充功能描述過長（超過 132 字元）');
                this.testResults.storeListing.passed = false;
                return;
            }
            
            this.testResults.storeListing.passed = true;
            
        } catch (error) {
            this.testResults.storeListing.details.push(`❌ 商店列表測試失敗: ${error.message}`);
            this.testResults.storeListing.passed = false;
        } finally {
            this.testResults.storeListing.duration = Date.now() - startTime;
            console.log(`   完成時間: ${this.testResults.storeListing.duration}ms\n`);
        }
    }

    /**
     * 3. 測試合規性檢查有效性
     */
    async testComplianceCheckEffectiveness() {
        console.log('📋 3. 測試合規性檢查有效性...');
        const startTime = Date.now();
        
        try {
            // 執行合規性檢查
            const complianceChecker = new ComplianceChecker();
            const complianceResults = await complianceChecker.runFullCheck();
            
            // 分析合規性檢查結果
            const categories = ['permissions', 'privacy', 'security', 'functionality'];
            let passedCategories = 0;
            
            categories.forEach(category => {
                if (complianceResults[category].passed) {
                    passedCategories++;
                    this.testResults.complianceCheck.details.push(`✅ ${this.getCategoryName(category)} 通過`);
                } else {
                    this.testResults.complianceCheck.details.push(`❌ ${this.getCategoryName(category)} 未通過`);
                    complianceResults[category].issues.forEach(issue => {
                        this.testResults.complianceCheck.details.push(`   - ${issue}`);
                    });
                }
            });
            
            const complianceScore = Math.round((passedCategories / categories.length) * 100);
            this.testResults.complianceCheck.details.push(`📊 合規性評分: ${complianceScore}%`);
            
            // 執行功能測試
            const functionalityTester = new ExtensionFunctionalityTester();
            const functionalityResults = await functionalityTester.runAllTests();
            
            if (functionalityResults.overall.passed) {
                this.testResults.complianceCheck.details.push('✅ 功能測試通過');
            } else {
                this.testResults.complianceCheck.details.push('❌ 功能測試未完全通過');
                this.testResults.complianceCheck.details.push(`   功能測試評分: ${functionalityResults.overall.score}%`);
            }
            
            // 儲存合規性報告
            const reportFile = `chrome-store-compliance-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            await complianceChecker.saveReportToFile(reportFile);
            this.tempFiles.push(reportFile);
            
            const functionalityReportFile = `functionality-test-report-${Date.now()}.json`;
            await functionalityTester.saveTestReport(functionalityReportFile);
            this.tempFiles.push(functionalityReportFile);
            
            this.testResults.complianceCheck.details.push(`📄 報告已儲存: ${reportFile}`);
            
            // 判斷整體合規性
            this.testResults.complianceCheck.passed = 
                complianceResults.overall.passed && functionalityResults.overall.passed;
            
        } catch (error) {
            this.testResults.complianceCheck.details.push(`❌ 合規性檢查測試失敗: ${error.message}`);
            this.testResults.complianceCheck.passed = false;
        } finally {
            this.testResults.complianceCheck.duration = Date.now() - startTime;
            console.log(`   完成時間: ${this.testResults.complianceCheck.duration}ms\n`);
        }
    }

    /**
     * 4. 模擬上傳和提交流程
     */
    async testUploadAndSubmissionFlow() {
        console.log('🚀 4. 模擬上傳和提交流程...');
        const startTime = Date.now();
        
        try {
            // 檢查套件檔案是否存在
            const packageFile = 'quick-text-copy-extension.zip';
            if (!fs.existsSync(packageFile)) {
                this.testResults.uploadSimulation.details.push('❌ 套件檔案不存在，無法進行上傳測試');
                this.testResults.uploadSimulation.passed = false;
                return;
            }
            
            this.testResults.uploadSimulation.details.push('✅ 套件檔案存在');
            
            // 模擬提交前檢查
            const submission = new ChromeStoreSubmission();
            const preCheckResults = await submission.performPreSubmissionChecks();
            
            if (preCheckResults.overall) {
                this.testResults.uploadSimulation.details.push('✅ 提交前檢查通過');
            } else {
                this.testResults.uploadSimulation.details.push('❌ 提交前檢查未通過');
                
                Object.entries(preCheckResults).forEach(([check, passed]) => {
                    if (check !== 'overall') {
                        const status = passed ? '✅' : '❌';
                        this.testResults.uploadSimulation.details.push(`   ${status} ${this.getCheckName(check)}`);
                    }
                });
            }
            
            // 準備提交資料
            const submissionData = submission.prepareSubmissionData();
            this.testResults.uploadSimulation.details.push('✅ 提交資料準備完成');
            this.testResults.uploadSimulation.details.push(`   - 版本: ${submissionData.version}`);
            this.testResults.uploadSimulation.details.push(`   - 套件大小: ${submissionData.packageSize.readable}`);
            this.testResults.uploadSimulation.details.push(`   - 校驗和: ${submissionData.checksumMD5}`);
            
            // 模擬提交
            const submissionResult = await submission.simulateSubmission(submissionData);
            
            if (submissionResult.success) {
                this.testResults.uploadSimulation.details.push('✅ 模擬提交成功');
                this.testResults.uploadSimulation.details.push(`   - 提交 ID: ${submissionResult.submissionId}`);
                this.testResults.uploadSimulation.details.push(`   - 預估審核時間: ${submissionResult.estimatedReviewTime}`);
            } else {
                this.testResults.uploadSimulation.details.push('❌ 模擬提交失敗');
                this.testResults.uploadSimulation.passed = false;
                return;
            }
            
            // 檢查開發者帳戶配置
            if (fs.existsSync('developer-account-config.json')) {
                this.testResults.uploadSimulation.details.push('✅ 開發者帳戶配置存在');
            } else {
                this.testResults.uploadSimulation.details.push('⚠️  開發者帳戶配置不存在');
            }
            
            // 檢查提交配置
            if (fs.existsSync('chrome-store-submission-config.json')) {
                this.testResults.uploadSimulation.details.push('✅ 提交配置存在');
            } else {
                this.testResults.uploadSimulation.details.push('⚠️  提交配置不存在');
            }
            
            this.testResults.uploadSimulation.passed = preCheckResults.overall && submissionResult.success;
            
        } catch (error) {
            this.testResults.uploadSimulation.details.push(`❌ 上傳和提交流程測試失敗: ${error.message}`);
            this.testResults.uploadSimulation.passed = false;
        } finally {
            this.testResults.uploadSimulation.duration = Date.now() - startTime;
            console.log(`   完成時間: ${this.testResults.uploadSimulation.duration}ms\n`);
        }
    }

    /**
     * 5. 測試監控和管理功能
     */
    async testMonitoringAndManagement() {
        console.log('📊 5. 測試監控和管理功能...');
        const startTime = Date.now();
        
        try {
            // 檢查監控相關檔案
            const monitoringFiles = [
                'review-status-monitor.js',
                'post-launch-monitor.js',
                'performance-error-monitor.js',
                'user-support-system.js',
                'version-update-manager.js'
            ];
            
            let existingMonitoringFiles = [];
            monitoringFiles.forEach(file => {
                if (fs.existsSync(file)) {
                    existingMonitoringFiles.push(file);
                }
            });
            
            this.testResults.monitoringTest.details.push(`✅ 找到 ${existingMonitoringFiles.length} 個監控檔案`);
            
            // 測試審核狀態監控
            if (fs.existsSync('review-status-monitor.js')) {
                try {
                    const ReviewStatusMonitor = require('./review-status-monitor.js');
                    const monitor = new ReviewStatusMonitor();
                    
                    // 測試狀態報告生成
                    const report = monitor.generateStatusReport();
                    this.testResults.monitoringTest.details.push('✅ 審核狀態監控功能正常');
                    
                } catch (error) {
                    this.testResults.monitoringTest.details.push(`❌ 審核狀態監控測試失敗: ${error.message}`);
                }
            }
            
            // 檢查監控配置檔案
            const configFiles = [
                'post-launch-config.json',
                'performance-monitor-config.json',
                'support-config.json',
                'update-config.json'
            ];
            
            let existingConfigs = [];
            configFiles.forEach(file => {
                if (fs.existsSync(file)) {
                    existingConfigs.push(file);
                }
            });
            
            this.testResults.monitoringTest.details.push(`✅ 找到 ${existingConfigs.length} 個監控配置檔案`);
            
            // 檢查監控資料目錄
            const monitoringDirs = [
                'monitoring-data',
                'monitoring-reports',
                'support-data',
                'performance-alerts'
            ];
            
            let existingDirs = [];
            monitoringDirs.forEach(dir => {
                if (fs.existsSync(dir)) {
                    existingDirs.push(dir);
                }
            });
            
            this.testResults.monitoringTest.details.push(`✅ 找到 ${existingDirs.length} 個監控資料目錄`);
            
            // 測試監控儀表板
            if (fs.existsSync('monitoring-dashboard.html')) {
                this.testResults.monitoringTest.details.push('✅ 監控儀表板存在');
            } else {
                this.testResults.monitoringTest.details.push('⚠️  監控儀表板不存在');
            }
            
            // 檢查支援文件
            const supportFiles = [
                'user-support-guide.md',
                'maintenance-best-practices.md',
                'version-update-guide.md',
                'POST_LAUNCH_MONITORING_GUIDE.md'
            ];
            
            let existingSupportFiles = [];
            supportFiles.forEach(file => {
                if (fs.existsSync(file)) {
                    existingSupportFiles.push(file);
                }
            });
            
            this.testResults.monitoringTest.details.push(`✅ 找到 ${existingSupportFiles.length} 個支援文件`);
            
            // 測試版本更新功能
            if (fs.existsSync('version-update-manager.js')) {
                try {
                    // 簡單的語法檢查
                    const updateManager = fs.readFileSync('version-update-manager.js', 'utf8');
                    if (updateManager.includes('class') && updateManager.includes('updateVersion')) {
                        this.testResults.monitoringTest.details.push('✅ 版本更新管理器結構正確');
                    }
                } catch (error) {
                    this.testResults.monitoringTest.details.push(`⚠️  版本更新管理器檢查失敗: ${error.message}`);
                }
            }
            
            // 判斷監控功能是否完整
            const minRequiredFiles = 3; // 至少需要 3 個監控檔案
            const minRequiredConfigs = 2; // 至少需要 2 個配置檔案
            
            this.testResults.monitoringTest.passed = 
                existingMonitoringFiles.length >= minRequiredFiles && 
                existingConfigs.length >= minRequiredConfigs;
            
            if (this.testResults.monitoringTest.passed) {
                this.testResults.monitoringTest.details.push('✅ 監控和管理功能完整');
            } else {
                this.testResults.monitoringTest.details.push('⚠️  監控和管理功能需要改進');
            }
            
        } catch (error) {
            this.testResults.monitoringTest.details.push(`❌ 監控和管理功能測試失敗: ${error.message}`);
            this.testResults.monitoringTest.passed = false;
        } finally {
            this.testResults.monitoringTest.duration = Date.now() - startTime;
            console.log(`   完成時間: ${this.testResults.monitoringTest.duration}ms\n`);
        }
    }

    /**
     * 生成最終測試報告
     */
    generateFinalReport() {
        console.log('📊 生成完整發佈流程測試報告...\n');
        
        const categories = ['packageBuild', 'storeListing', 'complianceCheck', 'uploadSimulation', 'monitoringTest'];
        let passedCount = 0;
        let totalDuration = 0;
        
        categories.forEach(category => {
            if (this.testResults[category].passed) {
                passedCount++;
            }
            totalDuration += this.testResults[category].duration;
        });
        
        this.testResults.overall.score = Math.round((passedCount / categories.length) * 100);
        this.testResults.overall.passed = passedCount === categories.length;
        this.testResults.overall.totalDuration = totalDuration;
        
        console.log('='.repeat(80));
        console.log('🎯 Chrome Web Store 完整發佈流程測試報告');
        console.log('='.repeat(80));
        console.log(`📅 測試時間: ${this.testStartTime.toLocaleString('zh-TW')}`);
        console.log(`⏱️  總測試時間: ${totalDuration}ms (${(totalDuration/1000).toFixed(2)}秒)`);
        console.log(`📦 擴充功能: Quick Text Copy`);
        console.log(`🎯 整體評分: ${this.testResults.overall.score}%`);
        console.log(`✅ 整體狀態: ${this.testResults.overall.passed ? '✅ 通過' : '❌ 需要改進'}`);
        console.log(`📊 通過項目: ${passedCount}/${categories.length}`);
        console.log('');
        
        // 詳細測試結果
        const categoryNames = {
            packageBuild: '📦 套件建置流程',
            storeListing: '🏪 商店列表完整性',
            complianceCheck: '📋 合規性檢查',
            uploadSimulation: '🚀 上傳提交流程',
            monitoringTest: '📊 監控管理功能'
        };

        categories.forEach(category => {
            const result = this.testResults[category];
            const status = result.passed ? '✅ 通過' : '❌ 失敗';
            const categoryName = categoryNames[category];
            const duration = `(${result.duration}ms)`;
            
            console.log(`${status} ${categoryName} ${duration}`);
            
            if (result.details.length > 0) {
                result.details.forEach(detail => {
                    console.log(`   ${detail}`);
                });
            }
            console.log('');
        });
        
        // 總結和建議
        console.log('💡 測試總結和建議:');
        if (this.testResults.overall.passed) {
            console.log('   🎉 恭喜！完整發佈流程測試全部通過');
            console.log('   ✅ 擴充功能已準備好提交到 Chrome Web Store');
            console.log('   🚀 建議執行步驟：');
            console.log('      1. 最終檢查所有檔案和配置');
            console.log('      2. 登入 Chrome Web Store 開發者控制台');
            console.log('      3. 上傳套件並填寫商店列表資訊');
            console.log('      4. 提交審核並啟動監控系統');
        } else {
            console.log('   ⚠️  部分測試項目需要改進');
            console.log('   🔧 請修正上述失敗項目後重新測試');
            console.log('   📋 確保所有測試通過後再進行實際提交');
            console.log('   💡 建議優先處理：');
            
            categories.forEach(category => {
                if (!this.testResults[category].passed) {
                    console.log(`      - ${categoryNames[category]}`);
                }
            });
        }
        
        console.log('='.repeat(80));
        
        // 儲存測試報告
        this.saveTestReport();
    }

    /**
     * 儲存測試報告到檔案
     */
    saveTestReport() {
        try {
            const reportData = {
                timestamp: this.testStartTime.toISOString(),
                extension: 'Quick Text Copy',
                testType: 'Complete Publishing Flow Test',
                results: this.testResults,
                summary: {
                    totalTests: 5,
                    passedTests: Object.values(this.testResults).filter(r => r.passed && r.passed !== undefined).length,
                    score: this.testResults.overall.score,
                    passed: this.testResults.overall.passed,
                    totalDuration: this.testResults.overall.totalDuration
                },
                environment: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    testDate: this.testStartTime.toISOString()
                }
            };
            
            const reportFile = `complete-publishing-flow-test-report-${Date.now()}.json`;
            fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2), 'utf8');
            
            // 生成 Markdown 報告
            const markdownReport = this.generateMarkdownReport(reportData);
            const markdownFile = `complete-publishing-flow-test-report-${Date.now()}.md`;
            fs.writeFileSync(markdownFile, markdownReport, 'utf8');
            
            console.log(`\n📄 詳細報告已儲存:`);
            console.log(`   JSON: ${reportFile}`);
            console.log(`   Markdown: ${markdownFile}`);
            
            this.tempFiles.push(reportFile, markdownFile);
            
        } catch (error) {
            console.error('❌ 儲存測試報告失敗:', error.message);
        }
    }

    /**
     * 生成 Markdown 格式報告
     */
    generateMarkdownReport(reportData) {
        const { results, summary } = reportData;
        
        let markdown = `# Chrome Web Store 完整發佈流程測試報告\n\n`;
        markdown += `**測試時間:** ${new Date(reportData.timestamp).toLocaleString('zh-TW')}\n`;
        markdown += `**擴充功能:** Quick Text Copy\n`;
        markdown += `**整體評分:** ${summary.score}%\n`;
        markdown += `**測試狀態:** ${summary.passed ? '✅ 通過' : '❌ 需要改進'}\n`;
        markdown += `**通過項目:** ${summary.passedTests}/${summary.totalTests}\n`;
        markdown += `**總測試時間:** ${(summary.totalDuration/1000).toFixed(2)}秒\n\n`;
        
        markdown += `## 測試結果詳情\n\n`;
        
        const categoryNames = {
            packageBuild: '套件建置流程',
            storeListing: '商店列表完整性',
            complianceCheck: '合規性檢查',
            uploadSimulation: '上傳提交流程',
            monitoringTest: '監控管理功能'
        };
        
        Object.entries(categoryNames).forEach(([category, name]) => {
            const result = results[category];
            const status = result.passed ? '✅ 通過' : '❌ 失敗';
            
            markdown += `### ${status} ${name}\n\n`;
            markdown += `**測試時間:** ${result.duration}ms\n\n`;
            
            if (result.details.length > 0) {
                markdown += `**詳細結果:**\n`;
                result.details.forEach(detail => {
                    markdown += `- ${detail}\n`;
                });
                markdown += `\n`;
            }
        });
        
        markdown += `## 建議事項\n\n`;
        if (summary.passed) {
            markdown += `- 🎉 恭喜！完整發佈流程測試全部通過\n`;
            markdown += `- ✅ 擴充功能已準備好提交到 Chrome Web Store\n`;
            markdown += `- 🚀 可以進行實際的提交流程\n`;
        } else {
            markdown += `- ⚠️ 部分測試項目需要改進\n`;
            markdown += `- 🔧 請修正失敗項目後重新測試\n`;
            markdown += `- 📋 確保所有測試通過後再進行實際提交\n`;
        }
        
        return markdown;
    }

    /**
     * 清理臨時檔案
     */
    cleanup() {
        console.log('\n🧹 清理臨時檔案...');
        
        this.tempFiles.forEach(file => {
            try {
                if (fs.existsSync(file)) {
                    // 不刪除重要的報告檔案，只清理真正的臨時檔案
                    if (!file.includes('report') && !file.includes('quick-text-copy-extension.zip')) {
                        fs.unlinkSync(file);
                        console.log(`   ✅ 已刪除: ${file}`);
                    }
                }
            } catch (error) {
                console.log(`   ⚠️  無法刪除 ${file}: ${error.message}`);
            }
        });
        
        // 清理 build 目錄
        if (fs.existsSync('build')) {
            try {
                fs.rmSync('build', { recursive: true, force: true });
                console.log('   ✅ 已清理 build 目錄');
            } catch (error) {
                console.log(`   ⚠️  無法清理 build 目錄: ${error.message}`);
            }
        }
    }

    /**
     * 取得分類名稱
     */
    getCategoryName(category) {
        const names = {
            permissions: '權限檢查',
            privacy: '隱私政策檢查',
            security: '內容安全政策檢查',
            functionality: '功能性檢查'
        };
        return names[category] || category;
    }

    /**
     * 取得檢查項目名稱
     */
    getCheckName(check) {
        const names = {
            buildPackage: '套件建置',
            complianceCheck: '合規性檢查',
            functionalityTest: '功能測試',
            iconValidation: '圖標驗證'
        };
        return names[check] || check;
    }
}

// 如果直接執行此檔案，則運行完整測試
if (require.main === module) {
    const tester = new CompletePublishingFlowTester();
    
    tester.runCompleteTest()
        .then(results => {
            console.log('\n🎯 測試完成！');
            process.exit(results.overall.passed ? 0 : 1);
        })
        .catch(error => {
            console.error('\n❌ 測試執行失敗:', error.message);
            process.exit(1);
        });
}

module.exports = CompletePublishingFlowTester;