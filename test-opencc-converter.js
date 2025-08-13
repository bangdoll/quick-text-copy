/**
 * OpenCC 轉換器測試
 * 測試簡體轉繁體功能
 */

const OpenCCConverter = require('./opencc-converter');

async function testOpenCCConverter() {
  console.log('🧪 開始測試 OpenCC 轉換器...\n');

  // 使用推薦的 twp 配置進行測試
  const converter = new OpenCCConverter({ from: 'cn', to: 'twp' });
  
  // 檢查轉換器狀態
  console.log('📊 轉換器狀態:', converter.getStatus());
  console.log('');

  // 測試案例 - 使用 twp 配置的預期結果
  const testCases = [
    {
      name: '基本詞彙轉換',
      input: '这个软件很好用',
      expected: '這個軟體很好用'
    },
    {
      name: '科技詞彙轉換',
      input: '计算机程序开发',
      expected: '計算機程式開發'
    },
    {
      name: '長句轉換',
      input: '我们正在开发一个新的网络应用程序，它可以帮助用户更好地管理他们的数据。',
      expected: '我們正在開發一個新的網路應用程式，它可以幫助使用者更好地管理他們的資料。'
    },
    {
      name: '混合文字',
      input: '这是一个English和中文混合的sentence。',
      expected: '這是一個English和中文混合的sentence。'
    },
    {
      name: '數字和符號',
      input: '版本1.0.2已经发布了！',
      expected: '版本1.0.2已經發布了！'
    },
    {
      name: '繁體文字（不應改變）',
      input: '這個軟體很好用',
      expected: '這個軟體很好用'
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`🔍 測試: ${testCase.name}`);
    console.log(`   輸入: ${testCase.input}`);
    
    const result = converter.convert(testCase.input);
    console.log(`   輸出: ${result}`);
    console.log(`   預期: ${testCase.expected}`);
    
    const passed = result === testCase.expected;
    console.log(`   結果: ${passed ? '✅ 通過' : '❌ 失敗'}`);
    
    if (passed) passedTests++;
    console.log('');
  }

  // 測試批量轉換
  console.log('🔍 測試批量轉換:');
  const textArray = ['这个', '软件', '很好用'];
  const convertedArray = converter.convertArray(textArray);
  console.log(`   輸入陣列: [${textArray.join(', ')}]`);
  console.log(`   輸出陣列: [${convertedArray.join(', ')}]`);
  console.log('');

  // 測試簡體字檢測
  console.log('🔍 測試簡體字檢測:');
  const detectionTests = [
    { text: '这个软件', expected: true },
    { text: '這個軟體', expected: false },
    { text: 'Hello World', expected: false },
    { text: '计算机程序', expected: true }
  ];

  for (const test of detectionTests) {
    const hasSimplified = converter.hasSimplifiedChinese(test.text);
    const passed = hasSimplified === test.expected;
    console.log(`   "${test.text}" -> ${hasSimplified} (預期: ${test.expected}) ${passed ? '✅' : '❌'}`);
  }
  console.log('');

  // 測試智慧轉換
  console.log('🔍 測試智慧轉換:');
  const smartTests = [
    '这个需要转换',  // 應該轉換
    '這個不需要轉換', // 不應該轉換
    'English text'   // 不應該轉換
  ];

  for (const text of smartTests) {
    const result = converter.smartConvert(text);
    console.log(`   "${text}" -> "${result}"`);
  }
  console.log('');

  // 總結
  console.log('📊 測試總結:');
  console.log(`   通過測試: ${passedTests}/${totalTests}`);
  console.log(`   成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有測試通過！OpenCC 轉換器運作正常。');
  } else {
    console.log('⚠️  部分測試失敗，請檢查轉換邏輯。');
  }

  return {
    passed: passedTests,
    total: totalTests,
    success: passedTests === totalTests
  };
}

// 執行測試
if (require.main === module) {
  testOpenCCConverter().catch(console.error);
}

module.exports = testOpenCCConverter;