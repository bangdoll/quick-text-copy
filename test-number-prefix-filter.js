/**
 * 測試標題數字標記過濾功能
 */

// 模擬 Logger
class Logger {
  static debug(message, details) {
    console.log(`[DEBUG] ${message}`, details || '');
  }
  
  static warn(message, details) {
    console.log(`[WARN] ${message}`, details || '');
  }
  
  static info(message, details) {
    console.log(`[INFO] ${message}`, details || '');
  }
}

// 複製過濾方法
class TitleFilter {
  /**
   * 過濾標題開頭的數字標記
   */
  static filterNumberPrefix(title) {
    if (!title || typeof title !== 'string') {
      return title;
    }

    // 定義各種數字標記的正則表達式模式
    const patterns = [
      /^\(\d+\)\s*/,        // (3) 開頭
      /^\[\d+\]\s*/,        // [5] 開頭
      /^\{\d+\}\s*/,        // {2} 開頭
      /^\d+\.\s*/,          // 3. 開頭
      /^\d+\)\s*/,          // 3) 開頭
      /^\d+\s*-\s*/,        // 3 - 開頭
      /^\d+\s*\|\s*/,       // 3 | 開頭
      /^【\d+】\s*/,        // 【3】開頭
      /^〔\d+〕\s*/,        // 〔3〕開頭
      /^＜\d+＞\s*/,        // ＜3＞開頭
      /^《\d+》\s*/         // 《3》開頭
    ];

    let filteredTitle = title;
    let wasFiltered = false;

    // 嘗試匹配並移除各種模式
    for (const pattern of patterns) {
      if (pattern.test(filteredTitle)) {
        const originalTitle = filteredTitle;
        filteredTitle = filteredTitle.replace(pattern, '').trim();
        
        if (originalTitle !== filteredTitle) {
          wasFiltered = true;
          Logger.debug('過濾標題數字標記', {
            original: originalTitle,
            filtered: filteredTitle,
            pattern: pattern.toString()
          });
          break; // 只處理第一個匹配的模式
        }
      }
    }

    // 如果過濾後標題為空或太短，返回原標題
    if (!filteredTitle || filteredTitle.length < 3) {
      Logger.warn('過濾後標題太短，使用原標題', {
        original: title,
        filtered: filteredTitle
      });
      return title;
    }

    return filteredTitle;
  }
}

// 測試案例
const testCases = [
  {
    name: '圓括號數字標記',
    input: '(3) 【三大模型齐发】OpenAI GPT-OSS，Google Genie 3，Anthropic Claude Opus 4.1 - YouTube',
    expected: '【三大模型齐发】OpenAI GPT-OSS，Google Genie 3，Anthropic Claude Opus 4.1 - YouTube'
  },
  {
    name: '方括號數字標記',
    input: '[5] 最新科技新聞 - 科技網站',
    expected: '最新科技新聞 - 科技網站'
  },
  {
    name: '大括號數字標記',
    input: '{2} 程式設計教學 - 學習平台',
    expected: '程式設計教學 - 學習平台'
  },
  {
    name: '數字點標記',
    input: '1. 第一章：JavaScript 基礎',
    expected: '第一章：JavaScript 基礎'
  },
  {
    name: '數字括號標記',
    input: '3) 如何使用 Chrome 擴充功能',
    expected: '如何使用 Chrome 擴充功能'
  },
  {
    name: '數字橫線標記',
    input: '7 - 網頁開發最佳實務',
    expected: '網頁開發最佳實務'
  },
  {
    name: '數字豎線標記',
    input: '4 | 前端框架比較',
    expected: '前端框架比較'
  },
  {
    name: '中文方括號標記',
    input: '【9】最新消息更新',
    expected: '最新消息更新'
  },
  {
    name: '中文圓括號標記',
    input: '〔12〕重要通知',
    expected: '重要通知'
  },
  {
    name: '全形角括號標記',
    input: '＜6＞系統維護公告',
    expected: '系統維護公告'
  },
  {
    name: '書名號數字標記',
    input: '《8》技術文檔',
    expected: '技術文檔'
  },
  {
    name: '無數字標記（不應過濾）',
    input: 'GitHub - 開源代碼倉庫',
    expected: 'GitHub - 開源代碼倉庫'
  },
  {
    name: '標題中間的數字（不應過濾）',
    input: 'Vue 3.0 新功能介紹',
    expected: 'Vue 3.0 新功能介紹'
  },
  {
    name: '多個數字但不在開頭（不應過濾）',
    input: 'React 18.2.0 更新日誌',
    expected: 'React 18.2.0 更新日誌'
  },
  {
    name: '過濾後太短的標題',
    input: '(1) AB',
    expected: '(1) AB'  // 應該保持原樣
  }
];

// 執行測試
function runTests() {
  console.log('🧪 開始測試標題數字標記過濾功能...\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    console.log(`📋 測試 ${index + 1}: ${testCase.name}`);
    console.log(`輸入: "${testCase.input}"`);
    
    const result = TitleFilter.filterNumberPrefix(testCase.input);
    console.log(`輸出: "${result}"`);
    console.log(`預期: "${testCase.expected}"`);
    
    const passed = result === testCase.expected;
    if (passed) {
      console.log('✅ 測試通過\n');
      passedTests++;
    } else {
      console.log('❌ 測試失敗\n');
    }
  });
  
  // 測試結果摘要
  console.log('📊 測試結果摘要:');
  console.log(`✅ 通過測試: ${passedTests}`);
  console.log(`❌ 失敗測試: ${totalTests - passedTests}`);
  console.log(`📈 成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 所有測試都通過了！數字標記過濾功能運作正常。');
  } else {
    console.log('\n⚠️  有部分測試失敗，請檢查過濾邏輯。');
  }
  
  // 生成測試報告
  const testReport = {
    timestamp: new Date().toISOString(),
    totalTests: totalTests,
    passedTests: passedTests,
    failedTests: totalTests - passedTests,
    successRate: Math.round((passedTests / totalTests) * 100),
    testCases: testCases.map((testCase, index) => ({
      name: testCase.name,
      input: testCase.input,
      expected: testCase.expected,
      actual: TitleFilter.filterNumberPrefix(testCase.input),
      passed: TitleFilter.filterNumberPrefix(testCase.input) === testCase.expected
    }))
  };
  
  // 儲存測試報告
  const fs = require('fs');
  fs.writeFileSync('number-prefix-filter-test-report.json', JSON.stringify(testReport, null, 2), 'utf8');
  console.log('\n📄 測試報告已儲存至: number-prefix-filter-test-report.json');
}

// 執行測試
if (require.main === module) {
  runTests();
}

module.exports = { TitleFilter, runTests };