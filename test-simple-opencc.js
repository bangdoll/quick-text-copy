// 簡化版 OpenCC 核心測試
class OpenCCCore {
  constructor() {
    this.conversionMap = new Map([
      // 您的測試案例相關詞彙
      ['你以为', '你以為'], ['智能表', '智慧錶'], ['可以取代', '可以取代'],
      ['传统腕表', '傳統腕錶'], ['传统', '傳統'], ['腕表', '腕錶'],
      ['新款', '新款'], ['卡西欧', '卡西歐'], ['比智能表', '比智慧錶'],
      ['还要', '還要'], ['更强', '更強'], ['很强', '很強'], ['最强', '最強'],
      ['强大', '強大'], ['强', '強'],
      
      // 其他常用詞彙
      ['这个', '這個'], ['软件', '軟體'], ['很好用', '很好用'],
      ['计算机', '電腦'], ['程序', '程式'], ['开发', '開發'],
      ['数据', '資料'], ['处理', '處理'], ['系统', '系統'],
      ['用户', '使用者'], ['界面', '界面'], ['设计', '設計'],
      ['网络', '網路'], ['应用', '應用'], ['程序', '程式'],
      ['人工智能', '人工智慧'], ['技术', '技術'], ['发展', '發展'],
      ['机器学习', '機器學習'], ['算法', '演算法'], ['优化', '最佳化'],
      ['智能手表', '智慧手錶'], ['功能', '功能'], ['强大', '強大'],
      ['工艺', '工藝'], ['精湛', '精湛'], ['品牌', '品牌'],
      ['历史', '歷史'], ['悠久', '悠久']
    ]);
  }

  convert(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    let result = text;
    
    // 按鍵長度排序，優先轉換長詞組
    const sortedEntries = Array.from(this.conversionMap.entries())
      .sort((a, b) => b[0].length - a[0].length);
    
    for (const [simplified, traditional] of sortedEntries) {
      if (result.includes(simplified)) {
        const regex = new RegExp(simplified.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        result = result.replace(regex, traditional);
      }
    }
    
    return result;
  }

  containsSimplified(text) {
    if (!text || typeof text !== 'string') {
      return false;
    }

    for (const simplified of this.conversionMap.keys()) {
      if (text.includes(simplified)) {
        return true;
      }
    }
    
    return false;
  }
}

// 測試
const opencc = new OpenCCCore();

console.log('🧪 測試修正版 OpenCC 核心功能');
console.log('');

// 測試您的實際案例
const testText = '你以为智能表可以取代传统腕表？新款卡西欧 比智能表還要强';
console.log('原文:', testText);
console.log('轉換:', opencc.convert(testText));
console.log('包含簡體:', opencc.containsSimplified(testText));
console.log('');

// 測試其他案例
const testCases = [
  '这个软件很好用',
  '计算机程序开发', 
  '数据处理系统',
  '用户界面设计',
  '网络应用程序',
  '智能手表功能强大',
  '传统腕表工艺精湛',
  '卡西欧品牌历史悠久',
  '人工智能技术发展',
  '机器学习算法优化'
];

testCases.forEach(text => {
  const converted = opencc.convert(text);
  const hasSimplified = opencc.containsSimplified(text);
  console.log('原文:', text);
  console.log('轉換:', converted);
  console.log('包含簡體:', hasSimplified);
  console.log('---');
});

console.log('✅ OpenCC 核心測試完成！');