/**
 * OpenCC 功能驗證腳本
 * 確保簡體轉繁體功能正常運作
 */

const OpenCCConverter = require('./opencc-converter');

function verifyOpenCCFunctionality() {
  console.log('🔧 OpenCC 功能驗證\n');

  // 測試不同配置
  const configs = [
    { from: 'cn', to: 'tw', name: '基本繁體' },
    { from: 'cn', to: 'twp', name: '台灣繁體（推薦）' },
    { from: 'cn', to: 'hk', name: '香港繁體' }
  ];

  const testText = '这个软件的计算机程序很好用，数据处理网络功能都很强大。';

  console.log(`📝 測試文字: ${testText}\n`);

  for (const config of configs) {
    console.log(`🔍 配置: ${config.name} (${config.from} → ${config.to})`);
    
    try {
      const converter = new OpenCCConverter(config);
      
      if (!converter.isReady) {
        console.log('❌ 轉換器初始化失敗');
        continue;
      }

      const result = converter.convert(testText);
      const hasSimplified = converter.hasSimplifiedChinese(testText);
      const smartResult = converter.smartConvert(testText);

      console.log(`   轉換結果: ${result}`);
      console.log(`   檢測簡體: ${hasSimplified ? '是' : '否'}`);
      console.log(`   智慧轉換: ${smartResult}`);
      console.log(`   狀態: ✅ 正常運作`);
      
    } catch (error) {
      console.log(`   狀態: ❌ 錯誤 - ${error.message}`);
    }
    
    console.log('');
  }

  // 測試批量轉換
  console.log('📦 批量轉換測試:');
  const converter = new OpenCCConverter(); // 使用預設配置
  const batchTexts = [
    '这是第一个测试',
    '软件开发很重要',
    '数据库管理系统'
  ];

  try {
    const batchResults = converter.convertArray(batchTexts);
    console.log('   原文:', batchTexts);
    console.log('   轉換:', batchResults);
    console.log('   狀態: ✅ 批量轉換正常');
  } catch (error) {
    console.log(`   狀態: ❌ 批量轉換錯誤 - ${error.message}`);
  }

  console.log('');

  // 測試智慧轉換
  console.log('🧠 智慧轉換測試:');
  const smartTests = [
    { text: '这个需要转换', shouldConvert: true },
    { text: '這個不需要轉換', shouldConvert: false },
    { text: 'English text', shouldConvert: false },
    { text: '123456', shouldConvert: false }
  ];

  for (const test of smartTests) {
    const hasSimplified = converter.hasSimplifiedChinese(test.text);
    const smartResult = converter.smartConvert(test.text);
    const changed = test.text !== smartResult;
    
    console.log(`   "${test.text}"`);
    console.log(`     檢測簡體: ${hasSimplified}`);
    console.log(`     轉換結果: "${smartResult}"`);
    console.log(`     是否改變: ${changed}`);
    console.log(`     預期改變: ${test.shouldConvert}`);
    console.log(`     狀態: ${changed === test.shouldConvert ? '✅' : '❌'}`);
    console.log('');
  }

  console.log('🎉 OpenCC 功能驗證完成！');
}

// 執行驗證
if (require.main === module) {
  verifyOpenCCFunctionality();
}

module.exports = verifyOpenCCFunctionality;