/**
 * OpenCC 使用示例
 * 展示不同配置的轉換效果
 */

const OpenCCConverter = require('./opencc-converter');

async function demoOpenCCUsage() {
  console.log('🚀 OpenCC 簡體轉繁體示例\n');

  // 測試文本
  const testTexts = [
    '这个软件很好用',
    '计算机程序开发',
    '我们正在开发一个新的网络应用程序',
    '数据库管理系统',
    '人工智能和机器学习',
    '版本1.0.2已经发布了！'
  ];

  // 不同的轉換配置
  const configs = [
    { from: 'cn', to: 'tw', name: '簡體中文 → 台灣繁體' },
    { from: 'cn', to: 'hk', name: '簡體中文 → 香港繁體' },
    { from: 'cn', to: 'twp', name: '簡體中文 → 台灣繁體（含慣用詞）' }
  ];

  for (const config of configs) {
    console.log(`📝 配置: ${config.name}`);
    console.log('─'.repeat(50));
    
    const converter = new OpenCCConverter(config);
    
    if (!converter.isReady) {
      console.log('❌ 轉換器初始化失敗');
      continue;
    }

    for (const text of testTexts) {
      const result = converter.convert(text);
      console.log(`原文: ${text}`);
      console.log(`轉換: ${result}`);
      console.log('');
    }
    
    console.log('');
  }

  // 展示批量轉換
  console.log('📦 批量轉換示例:');
  console.log('─'.repeat(50));
  
  const converter = new OpenCCConverter();
  const batchTexts = [
    '这是第一个句子',
    '这是第二个句子',
    '这是第三个句子'
  ];
  
  const batchResults = converter.convertArray(batchTexts);
  
  console.log('原文陣列:');
  batchTexts.forEach((text, index) => {
    console.log(`  ${index + 1}. ${text}`);
  });
  
  console.log('\n轉換結果:');
  batchResults.forEach((text, index) => {
    console.log(`  ${index + 1}. ${text}`);
  });

  // 展示智慧轉換
  console.log('\n🧠 智慧轉換示例:');
  console.log('─'.repeat(50));
  
  const smartTexts = [
    '这个需要转换',      // 包含簡體字
    '這個不需要轉換',    // 已經是繁體
    'Hello World',       // 英文
    '123456',           // 數字
    '这是mixed文字'      // 混合文字
  ];
  
  for (const text of smartTexts) {
    const hasSimplified = converter.hasSimplifiedChinese(text);
    const smartResult = converter.smartConvert(text);
    const normalResult = converter.convert(text);
    
    console.log(`原文: ${text}`);
    console.log(`包含簡體: ${hasSimplified ? '是' : '否'}`);
    console.log(`智慧轉換: ${smartResult}`);
    console.log(`普通轉換: ${normalResult}`);
    console.log('');
  }
}

// 執行示例
if (require.main === module) {
  demoOpenCCUsage().catch(console.error);
}

module.exports = demoOpenCCUsage;