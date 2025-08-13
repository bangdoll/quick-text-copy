#!/usr/bin/env node

/**
 * 測試 OpenCC-JS 中文轉換功能
 */

async function testOpenCCConversion() {
  console.log('🧪 測試 OpenCC-JS 中文轉換功能\n');
  
  // 測試用的標題和網址
  const testTitle = '【人工智能】于地狱处望天堂 | 谷歌前高管Mo Gawdat最新访谈 | 反乌托邦 | FACE RIPS | 权利两极化 | 失去自由 | 经济剧变 | AI竞赛 | AI接管世界政府 - YouTube';
  const testUrl = 'https://www.youtube.com/watch?v=VISuJrVy8h8';
  
  try {
    // 嘗試不同的導入方式
    let converter;
    
    try {
      // 方式 1: ES6 動態導入
      const { Converter } = await import('opencc-js');
      converter = Converter({ from: 's', to: 'tw' });
      console.log('✅ 使用 ES6 導入成功');
    } catch (esError) {
      console.log('⚠️  ES6 導入失敗，嘗試 CommonJS 導入');
      
      // 方式 2: CommonJS 導入
      const opencc = require('opencc-js');
      converter = opencc.Converter({ from: 's', to: 'tw' });
      console.log('✅ 使用 CommonJS 導入成功');
    }
    
    console.log('✅ OpenCC 轉換器初始化成功\n');
    
    console.log('📋 原始標題:');
    console.log(testTitle);
    
    console.log('\n🔄 OpenCC 轉換結果:');
    const convertedTitle = converter(testTitle);
    console.log(convertedTitle);
    
    console.log('\n📝 最終格式化結果:');
    const finalResult = `${convertedTitle} ${testUrl}`;
    console.log(finalResult);
    
    console.log('\n📊 轉換統計:');
    console.log(`原始長度: ${testTitle.length} 字符`);
    console.log(`轉換後長度: ${convertedTitle.length} 字符`);
    console.log(`是否有轉換: ${testTitle !== convertedTitle ? '是' : '否'}`);
    
    // 顯示主要轉換差異
    console.log('\n🔍 主要轉換差異:');
    const differences = [];
    
    // 簡單的差異檢測
    const originalChars = testTitle.split('');
    const convertedChars = convertedTitle.split('');
    
    for (let i = 0; i < Math.min(originalChars.length, convertedChars.length); i++) {
      if (originalChars[i] !== convertedChars[i]) {
        differences.push(`${originalChars[i]} → ${convertedChars[i]}`);
      }
    }
    
    // 去重並顯示
    const uniqueDifferences = [...new Set(differences)];
    uniqueDifferences.slice(0, 10).forEach(diff => {
      console.log(`  ${diff}`);
    });
    
    if (uniqueDifferences.length > 10) {
      console.log(`  ... 還有 ${uniqueDifferences.length - 10} 個轉換`);
    }
    
    console.log('\n✅ OpenCC 測試完成！');
    
  } catch (error) {
    console.error('❌ OpenCC 測試失敗:', error.message);
    console.log('\n🔄 嘗試備用方案...');
    
    // 測試備用字典方案
    const fallbackMap = {
      '人工智能': '人工智慧', '于': '於', '地狱': '地獄', '处': '處', '访谈': '訪談',
      '反乌托邦': '反烏托邦', '权利': '權利', '两极化': '兩極化', '经济': '經濟',
      '剧变': '劇變', '竞赛': '競賽', '接管': '接管', '世界': '世界', '政府': '政府'
    };
    
    let fallbackResult = testTitle;
    for (const [simplified, traditional] of Object.entries(fallbackMap)) {
      if (fallbackResult.includes(simplified)) {
        fallbackResult = fallbackResult.replace(new RegExp(simplified, 'g'), traditional);
      }
    }
    
    console.log('📋 備用方案轉換結果:');
    console.log(fallbackResult);
    console.log('\n⚠️  建議檢查 opencc-js 安裝是否正確');
  }
}

// 執行測試
testOpenCCConversion();