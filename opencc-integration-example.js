/**
 * OpenCC 整合示例
 * 展示如何將 OpenCC 轉換器整合到現有項目中
 */

const OpenCCConverter = require('./opencc-converter');

class TextProcessor {
  constructor() {
    // 初始化 OpenCC 轉換器，使用台灣繁體（含慣用詞）配置
    this.converter = new OpenCCConverter({ from: 'cn', to: 'twp' });
  }

  /**
   * 處理文本內容，自動轉換簡體中文
   * @param {string} text - 要處理的文本
   * @returns {string} 處理後的文本
   */
  processText(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    // 使用智慧轉換，只轉換包含簡體字的文本
    return this.converter.smartConvert(text);
  }

  /**
   * 批量處理文本陣列
   * @param {string[]} texts - 文本陣列
   * @returns {string[]} 處理後的文本陣列
   */
  processTexts(texts) {
    if (!Array.isArray(texts)) {
      return texts;
    }

    return texts.map(text => this.processText(text));
  }

  /**
   * 處理對象中的文本屬性
   * @param {object} obj - 包含文本的對象
   * @param {string[]} textFields - 需要轉換的文本欄位名稱
   * @returns {object} 處理後的對象
   */
  processObject(obj, textFields = ['title', 'content', 'description']) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const processed = { ...obj };
    
    for (const field of textFields) {
      if (processed[field] && typeof processed[field] === 'string') {
        processed[field] = this.processText(processed[field]);
      }
    }

    return processed;
  }

  /**
   * 獲取轉換器狀態
   * @returns {object} 轉換器狀態
   */
  getStatus() {
    return this.converter.getStatus();
  }
}

// 使用示例
async function demonstrateIntegration() {
  console.log('🔧 OpenCC 整合示例\n');

  const processor = new TextProcessor();
  
  // 檢查轉換器狀態
  console.log('📊 轉換器狀態:', processor.getStatus());
  console.log('');

  // 示例 1: 處理單個文本
  console.log('📝 單個文本處理:');
  const singleText = '这个软件的用户界面很友好，数据处理速度也很快。';
  const processedText = processor.processText(singleText);
  console.log(`原文: ${singleText}`);
  console.log(`處理後: ${processedText}`);
  console.log('');

  // 示例 2: 批量處理文本
  console.log('📦 批量文本處理:');
  const textArray = [
    '这是一个测试文档',
    '软件开发需要注意用户体验',
    '数据库设计要考虑性能优化'
  ];
  const processedArray = processor.processTexts(textArray);
  
  console.log('原文陣列:');
  textArray.forEach((text, index) => {
    console.log(`  ${index + 1}. ${text}`);
  });
  
  console.log('處理後:');
  processedArray.forEach((text, index) => {
    console.log(`  ${index + 1}. ${text}`);
  });
  console.log('');

  // 示例 3: 處理對象
  console.log('🗂️  對象處理:');
  const dataObject = {
    id: 1,
    title: '软件开发最佳实践',
    content: '在软件开发过程中，我们需要关注代码质量、用户体验和系统性能。',
    description: '这篇文章介绍了现代软件开发的核心原则。',
    author: 'John Doe',
    date: '2025-01-09'
  };

  const processedObject = processor.processObject(dataObject);
  
  console.log('原始對象:');
  console.log(JSON.stringify(dataObject, null, 2));
  
  console.log('\n處理後對象:');
  console.log(JSON.stringify(processedObject, null, 2));
  console.log('');

  // 示例 4: 處理混合內容
  console.log('🌐 混合內容處理:');
  const mixedContents = [
    '這個已經是繁體中文了',
    'This is English text',
    '这是简体中文需要转换',
    '123456 數字不變',
    'Mixed 混合内容 content'
  ];

  console.log('混合內容處理結果:');
  mixedContents.forEach((content, index) => {
    const processed = processor.processText(content);
    const changed = content !== processed;
    console.log(`${index + 1}. ${content} ${changed ? '→' : '='} ${processed}`);
  });
}

// 執行示例
if (require.main === module) {
  demonstrateIntegration().catch(console.error);
}

module.exports = { TextProcessor, OpenCCConverter };