/**
 * 簡單的簡體轉繁體測試
 */

// 模擬 Logger
class Logger {
  static info(message, details) {
    console.log(`[INFO] ${message}`, details || '');
  }
}

// 複製轉換器類別
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
    '电': '電', '话': '話', '码': '碼', '号': '號', '楼': '樓', '层': '層', '室': '室', '厅': '廳'
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

// 測試案例
const testCases = [
  '这个网站很好用',
  '我们来学习编程',
  '计算机软件开发',
  'GitHub - 程序员的代码仓库',
  '百度搜索 - 全球最大的中文搜索引擎',
  'JavaScript程序设计教程',
  '這是繁體中文',
  'English content'
];

console.log('🧪 測試簡體轉繁體功能:\n');

testCases.forEach((testCase, index) => {
  console.log(`測試 ${index + 1}: "${testCase}"`);
  const result = ChineseConverter.smartConvert(testCase);
  console.log(`結果: "${result}"`);
  console.log('---');
});

console.log('✅ 測試完成');