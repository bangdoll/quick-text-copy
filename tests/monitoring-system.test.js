/**
 * 監控系統 Jest 單元測試
 * 與現有測試框架整合的版本
 * 
 * 需求: 5.1, 5.4
 */

const FixHistoryManager = require('../fix-history-manager');
const PreventiveRulesEngine = require('../preventive-rules-engine');

describe('監控系統單元測試', () => {
    let historyManager;
    let rulesEngine;
    
    beforeEach(() => {
        historyManager = new FixHistoryManager();
        rulesEngine = new PreventiveRulesEngine();
    });

    describe('日誌記錄準確性測試', () => {
        test('應該能正確創建修正記錄', () => {
            const testFixData = {
                rejectionId: 'JEST_TEST_001',
                issueType: 'permissions',
                severity: 'high',
                fixPlan: {
                    phases: ['analysis', 'implementation'],
                    estimatedDuration: 60
                },
                estimatedDuration: 60,
                startedBy: 'jest_test'
            };

            const fixId = historyManager.recordFixStart(testFixData);
            
            expect(fixId).toBeDefined();
            expect(typeof fixId).toBe('string');
            expect(fixId).toMatch(/^FIX_\d+_[A-F0-9]+$/);
            
            const record = historyManager.loadFixRecord(fixId);
            expect(record).not.toBeNull();
            expect(record.fixId).toBe(fixId);
            expect(record.rejectionId).toBe(testFixData.rejectionId);
            expect(record.issueType).toBe(testFixData.issueType);
            expect(record.status).toBe('started');
        });

        test('應該能正確記錄修正動作', () => {
            const fixId = historyManager.recordFixStart({
                rejectionId: 'JEST_TEST_002',
                issueType: 'metadata',
                severity: 'medium',
                fixPlan: { phases: ['update'] },
                estimatedDuration: 30
            });

            const actionData = {
                type: 'manifest_update',
                description: '更新 manifest 檔案',
                filesModified: ['manifest.json'],
                success: true,
                duration: 15
            };

            const actionId = historyManager.recordFixAction(fixId, actionData);
            
            expect(actionId).toBeDefined();
            expect(typeof actionId).toBe('string');
            expect(actionId).toMatch(/^ACTION_\d+_[A-F0-9]+$/);
            
            const record = historyManager.loadFixRecord(fixId);
            expect(record.actions).toHaveLength(1);
            expect(record.actions[0].type).toBe(actionData.type);
            expect(record.actions[0].success).toBe(true);
        });

        test('應該能正確記錄時間戳記', () => {
            const startTime = Date.now();
            
            const fixId = historyManager.recordFixStart({
                rejectionId: 'JEST_TEST_003',
                issueType: 'functionality',
                severity: 'critical',
                fixPlan: { phases: ['test'] },
                estimatedDuration: 45
            });
            
            const record = historyManager.loadFixRecord(fixId);
            const recordTime = new Date(record.timestamp).getTime();
            
            // 允許 1 秒的時間差
            expect(Math.abs(recordTime - startTime)).toBeLessThan(1000);
            expect(record.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });

        test('應該能正確處理錯誤日誌', () => {
            const fixId = historyManager.recordFixStart({
                rejectionId: 'JEST_TEST_004',
                issueType: 'security',
                severity: 'high',
                fixPlan: { phases: ['security_fix'] },
                estimatedDuration: 90
            });

            // 記錄失敗的動作
            historyManager.recordFixAction(fixId, {
                type: 'security_check',
                description: '執行安全檢查',
                success: false,
                duration: 20,
                errorMessage: 'Security vulnerability detected'
            });

            // 記錄修正失敗
            historyManager.recordFixCompletion(fixId, {
                success: false,
                totalDuration: 30,
                errorMessage: 'Unable to fix security issues',
                rollbackRequired: true
            });

            const record = historyManager.loadFixRecord(fixId);
            expect(record.success).toBe(false);
            expect(record.status).toBe('failed');
            expect(record.errorMessage).toBeDefined();
            expect(record.rollbackRequired).toBe(true);
            
            const failedAction = record.actions.find(action => !action.success);
            expect(failedAction).toBeDefined();
            expect(failedAction.errorMessage).toBeDefined();
        });

        test('應該能正確生成統計資料', () => {
            // 創建多個測試記錄
            const testCases = [
                { issueType: 'permissions', success: true },
                { issueType: 'permissions', success: false },
                { issueType: 'metadata', success: true }
            ];

            testCases.forEach((testCase, index) => {
                const fixId = historyManager.recordFixStart({
                    rejectionId: `JEST_STATS_${index}`,
                    issueType: testCase.issueType,
                    severity: 'medium',
                    fixPlan: { phases: ['fix'] },
                    estimatedDuration: 60
                });

                historyManager.recordFixCompletion(fixId, {
                    success: testCase.success,
                    totalDuration: 45
                });
            });

            const stats = historyManager.getFixHistoryStats();
            
            expect(stats).toBeDefined();
            expect(typeof stats.totalFixes).toBe('number');
            expect(typeof stats.successfulFixes).toBe('number');
            expect(typeof stats.failedFixes).toBe('number');
            expect(stats.issueTypeBreakdown).toBeDefined();
            expect(stats.issueTypeBreakdown.permissions).toBeDefined();
            expect(stats.issueTypeBreakdown.metadata).toBeDefined();
        });
    });

    describe('預防性檢查有效性測試', () => {
        test('應該能正確初始化規則引擎', () => {
            expect(rulesEngine.rules).toBeDefined();
            expect(rulesEngine.rulesConfig).toBeDefined();
            
            const expectedCategories = [
                'manifestRules',
                'permissionRules',
                'codeQualityRules',
                'securityRules',
                'performanceRules',
                'complianceRules',
                'historicalRules'
            ];
            
            expectedCategories.forEach(category => {
                expect(rulesEngine.rules[category]).toBeDefined();
                expect(Array.isArray(rulesEngine.rules[category])).toBe(true);
            });
        });

        test('應該能正確驗證 Manifest 檔案', async () => {
            const validManifest = {
                manifest_version: 3,
                name: 'Test Extension',
                version: '1.0.0',
                description: 'This is a comprehensive test extension for validation.'
            };

            const manifestRules = rulesEngine.rules.manifestRules;
            expect(manifestRules.length).toBeGreaterThan(0);

            for (const rule of manifestRules) {
                const result = await rulesEngine.executeRule(rule, { manifest: validManifest });
                expect(result).toBeDefined();
                expect(typeof result.passed).toBe('boolean');
                
                if (!result.passed) {
                    expect(result.message).toBeDefined();
                    expect(result.recommendation).toBeDefined();
                }
            }
        });

        test('應該能檢測權限問題', async () => {
            const overPermissionedManifest = {
                manifest_version: 3,
                name: 'Test Extension',
                version: '1.0.0',
                description: 'Test extension',
                permissions: ['<all_urls>', 'tabs', 'history'],
                host_permissions: ['<all_urls>']
            };

            const permissionRules = rulesEngine.rules.permissionRules;
            const minimalPermissionRule = permissionRules.find(rule => 
                rule.id === 'minimal_permissions_check'
            );

            if (minimalPermissionRule) {
                const result = await rulesEngine.executeRule(minimalPermissionRule, { 
                    manifest: overPermissionedManifest 
                });
                
                expect(result.passed).toBe(false);
                expect(result.message).toContain('過度權限');
            }
        });

        test('應該能檢測安全性問題', async () => {
            const unsafeManifest = {
                manifest_version: 3,
                name: 'Test Extension',
                version: '1.0.0',
                description: 'Test extension',
                content_security_policy: {
                    extension_pages: "script-src 'self' 'unsafe-eval'; object-src 'self'"
                }
            };

            const securityRules = rulesEngine.rules.securityRules;
            const cspRule = securityRules.find(rule => rule.id === 'csp_check');

            if (cspRule) {
                const result = await rulesEngine.executeRule(cspRule, { 
                    manifest: unsafeManifest 
                });
                
                expect(result.passed).toBe(false);
                expect(result.message).toContain('不安全');
            }
        });

        test('應該能檢測程式碼品質問題', async () => {
            const poorCodeAnalysis = {
                consoleLogs: [
                    { file: 'test.js', code: 'console.log("debug")' }
                ],
                uncaughtExceptions: 2,
                missingTryCatch: 1
            };

            const codeQualityRules = rulesEngine.rules.codeQualityRules;
            
            for (const rule of codeQualityRules) {
                const result = await rulesEngine.executeRule(rule, { 
                    codeAnalysis: poorCodeAnalysis 
                });
                
                expect(result).toBeDefined();
                expect(typeof result.passed).toBe('boolean');
            }
        });

        test('應該能執行完整的預防性掃描', async () => {
            const scanResult = await rulesEngine.runPreventiveScan({
                includeCodeAnalysis: false,
                includePackageInfo: false
            });

            expect(scanResult).toBeDefined();
            expect(scanResult.scanId).toBeDefined();
            expect(scanResult.timestamp).toBeDefined();
            expect(scanResult.results).toBeDefined();
            expect(Array.isArray(scanResult.issues)).toBe(true);
            expect(Array.isArray(scanResult.recommendations)).toBe(true);
            
            const results = scanResult.results;
            expect(typeof results.passed).toBe('number');
            expect(typeof results.failed).toBe('number');
            expect(typeof results.warnings).toBe('number');
            expect(typeof results.critical).toBe('number');
            
            // 驗證問題結構
            scanResult.issues.forEach(issue => {
                expect(issue.ruleId).toBeDefined();
                expect(issue.ruleName).toBeDefined();
                expect(issue.category).toBeDefined();
                expect(issue.severity).toBeDefined();
                expect(issue.message).toBeDefined();
            });
        });

        test('應該能正確處理規則執行錯誤', async () => {
            const invalidRule = {
                id: 'invalid_test_rule',
                name: 'Invalid Test Rule',
                category: 'test',
                severity: 'low',
                check: () => {
                    throw new Error('Test error');
                }
            };

            // 測試錯誤處理 - 應該拋出錯誤
            await expect(async () => {
                await rulesEngine.executeRule(invalidRule, {});
            }).rejects.toThrow('Test error');
        });
    });

    describe('系統整合測試', () => {
        test('應該能整合日誌記錄和預防性檢查', async () => {
            // 創建修正記錄
            const fixId = historyManager.recordFixStart({
                rejectionId: 'JEST_INTEGRATION_001',
                issueType: 'permissions',
                severity: 'high',
                fixPlan: { phases: ['analysis', 'fix'] },
                estimatedDuration: 120
            });

            // 執行預防性掃描
            const scanResult = await rulesEngine.runPreventiveScan({
                includeCodeAnalysis: false,
                includePackageInfo: false
            });

            // 記錄掃描結果作為修正動作
            historyManager.recordFixAction(fixId, {
                type: 'preventive_scan',
                description: '執行預防性掃描',
                success: scanResult.results.critical === 0,
                duration: 30,
                result: {
                    scanId: scanResult.scanId,
                    issuesFound: scanResult.results.failed,
                    criticalIssues: scanResult.results.critical
                }
            });

            // 完成修正
            historyManager.recordFixCompletion(fixId, {
                success: scanResult.results.critical === 0,
                totalDuration: 60
            });

            const record = historyManager.loadFixRecord(fixId);
            expect(record).toBeDefined();
            expect(record.actions).toHaveLength(1);
            expect(record.actions[0].type).toBe('preventive_scan');
            expect(record.status).toMatch(/^(completed|failed)$/);
        });
    });

    // 清理測試資料
    afterEach(() => {
        // 清理測試創建的修正記錄
        try {
            const allRecords = historyManager.getAllFixRecords();
            allRecords.forEach(record => {
                if (record.rejectionId && record.rejectionId.startsWith('JEST_')) {
                    const fs = require('fs');
                    const path = require('path');
                    const filePath = path.join('./fix-history', `${record.fixId}.json`);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            });
        } catch (error) {
            // 忽略清理錯誤
        }
    });
});