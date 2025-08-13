/**
 * Quick Text Copy 簡體轉繁體功能演示
 */

console.log('🎯 Quick Text Copy - 簡體轉繁體功能演示\n');

// 模擬不同類型的網頁標題
const demoTitles = [
  {
    category: '新聞網站',
    examples: [
      '中国科技发展迅速 - 新华网',
      '这个软件很好用 - 科技新闻',
      '程序员的工作日常 - 技术博客'
    ]
  },
  {
    category: '教育網站',
    examples: [
      'JavaScript程序设计教程 - 在线学习',
      '计算机科学基础知识 - 教育平台',
      '我们来学习编程 - 程序员培训'
    ]
  },
  {
    category: '購物網站',
    examples: [
      '买电脑配件 - 网上商城',
      '这个产品质量很好 - 用户评价',
      '软件开发工具推荐 - 购物指南'
    ]
  },
  {
    category: '社交媒體',
    examples: [
      '分享一个有趣的网站 - 社交平台',
      '程序员的日常生活 - 个人博客',
      '这个应用功能很强大 - 用户分享'
    ]
  }
];

// 模擬 Logger 和轉換器
class Logger {
  static info(message, details) {
    console.log(`   💡 ${message}`);
    if (details) {
      console.log(`      原文: "${details.original}"`);
      console.log(`      轉換: "${details.converted}"`);
    }
  }
}

class ChineseConverter {
  static coreMap = {
    '这': '這', '那': '那', '个': '個', '们': '們', '来': '來', '说': '說', '对': '對', '为': '為',
    '会': '會', '应': '應', '时': '時', '间': '間', '过': '過', '还': '還', '没': '沒', '让': '讓',
    '开': '開', '关': '關', '发': '發', '学': '學', '习': '習', '写': '寫', '读': '讀', '听': '聽',
    '买': '買', '卖': '賣', '长': '長', '短': '短', '热': '熱', '冷': '冷', '轻': '輕', '重': '重',
    '难': '難', '简': '簡', '复': '複', '杂': '雜', '新': '新', '旧': '舊', '美': '美', '丑': '醜',
    '干': '乾', '湿': '濕', '坏': '壞', '好': '好', '大': '大', '小': '小', '多': '多', '少': '少',
    
    '计算机': '電腦', '软件': '軟體', '硬件': '硬體', '网络': '網路', '网站': '網站', '网页': '網頁',
    '程序': '程式', '数据': '資料', '信息': '資訊', '系统': '系統', '文件': '檔案', '视频': '影片',
    '图片': '圖片', '应用': '應用', '设计': '設計', '开发': '開發', '内容': '內容', '功能': '功能',
    
    '机': '機', '计': '計', '设': '設', '议': '議', '论': '論', '话': '話', '内': '內', '容': '容',
    '国': '國', '产': '產', '业': '業', '务': '務', '员': '員', '门': '門', '户': '戶', '车': '車',
    '电': '電', '话': '話', '码': '碼', '号': '號', '楼': '樓', '层': '層', '室': '室', '厅': '廳',
    '中': '中', '华': '華', '网': '網', '上': '上', '商': '商', '城': '城', '用': '用', '户': '戶',
    '评': '評', '价': '價', '质': '質', '量': '量', '推': '推', '荐': '薦', '指': '指', '南': '南',
    '分': '分', '享': '享', '有': '有', '趣': '趣', '平': '平', '台': '台', '日': '日', '常': '常',
    '生': '生', '活': '活', '强': '強', '大': '大', '科': '科', '技': '技', '迅': '迅', '速': '速',
    '新': '新', '华': '華', '博': '博', '客': '客', '基': '基', '础': '礎', '知': '知', '识': '識',
    '教': '教', '育': '育', '培': '培', '训': '訓', '配': '配', '件': '件', '工': '工', '具': '具'
  };

  static smartConvert(text) {
    if (!text || typeof text !== 'string') return text;
    
    let convertedText = text;
    let hasConverted = false;
    
    for (const [simplified, traditional] of Object.entries(this.coreMap)) {
      if (convertedText.includes(simplified)) {
        const regex = new RegExp(simplified, 'g');
        convertedText = convertedText.replace(regex, traditional);
        hasConverted = true;
      }
    }
    
    if (hasConverted) {
      Logger.info('檢測到簡體中文，已轉換為繁體中文', {
        original: text,
        converted: convertedText
      });
    }
    
    return convertedText;
  }
}

// 模擬複製功能
function simulateCopyFunction(title, url) {
  console.log(`📋 模擬複製操作:`);
  console.log(`   🌐 網址: ${url}`);
  console.log(`   📝 原始標題: "${title}"`);
  
  // 執行簡體轉繁體轉換
  const convertedTitle = ChineseConverter.smartConvert(title);
  
  // 格式化最終輸出
  const finalOutput = `${convertedTitle} ${url}`;
  
  console.log(`   📋 複製內容: "${finalOutput}"`);
  console.log(`   ✅ 已複製到剪貼簿\n`);
  
  return finalOutput;
}

// 執行演示
console.log('🎬 開始演示不同類型網站的標題轉換:\n');

demoTitles.forEach((category, categoryIndex) => {
  console.log(`📂 ${category.category}:`);
  console.log('─'.repeat(50));
  
  category.examples.forEach((title, index) => {
    const mockUrl = `https://example${categoryIndex + 1}-${index + 1}.com`;
    console.log(`\n${index + 1}. 網站: ${mockUrl}`);
    simulateCopyFunction(title, mockUrl);
  });
  
  console.log('\n');
});

// 功能特色說明
console.log('🌟 功能特色:');
console.log('─'.repeat(50));
console.log('✅ 自動檢測簡體中文內容');
console.log('✅ 智慧轉換為繁體中文');
console.log('✅ 保持原有格式和標點');
console.log('✅ 支援混合語言內容');
console.log('✅ 涵蓋科技和日常詞彙');
console.log('✅ 不影響繁體中文和英文');

console.log('\n🎯 使用方式:');
console.log('─'.repeat(50));
console.log('1. 瀏覽任何網頁');
console.log('2. 點擊 Quick Text Copy 圖示');
console.log('3. 自動轉換並複製標題和網址');
console.log('4. 貼上即可使用繁體中文內容');

console.log('\n🔧 測試指令:');
console.log('─'.repeat(50));
console.log('npm run test-chinese-conversion  # 測試轉換功能');
console.log('npm run test-extension          # 測試完整功能');

console.log('\n🎉 演示完成！Quick Text Copy 現在支援簡體轉繁體功能。');