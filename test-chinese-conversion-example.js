#!/usr/bin/env node

/**
 * 測試中文轉換功能 - 使用實際例子
 */

// 從 service-worker.js 中提取的 ChineseConverter 類別
class ChineseConverter {
  // 擴展的簡繁對照字典
  static coreMap = {
    // 基本常用字
    '这': '這', '那': '那', '个': '個', '们': '們', '来': '來', '说': '說', '对': '對', '为': '為',
    '会': '會', '应': '應', '时': '時', '间': '間', '过': '過', '还': '還', '没': '沒', '让': '讓',
    '开': '開', '关': '關', '发': '發', '学': '學', '习': '習', '写': '寫', '读': '讀', '听': '聽',
    '买': '買', '卖': '賣', '长': '長', '短': '短', '热': '熱', '冷': '冷', '轻': '輕', '重': '重',
    '难': '難', '简': '簡', '复': '複', '杂': '雜', '新': '新', '旧': '舊', '美': '美', '丑': '醜',
    '干': '乾', '湿': '濕', '坏': '壞', '好': '好', '大': '大', '小': '小', '多': '多', '少': '少',
    
    // 科技詞彙
    '计算机': '電腦', '软件': '軟體', '硬件': '硬體', '网络': '網路', '网站': '網站', '网页': '網頁',
    '程序': '程式', '数据': '資料', '信息': '資訊', '系统': '系統', '文件': '檔案', '视频': '影片',
    '图片': '圖片', '应用': '應用', '设计': '設計', '开发': '開發', '内容': '內容', '功能': '功能',
    
    // 針對您的例子新增的詞彙
    '人工智能': '人工智慧', '于': '於', '地狱': '地獄', '处': '處', '望': '望', '天堂': '天堂',
    '谷歌': '谷歌', '前': '前', '高管': '高管', '最新': '最新', '访谈': '訪談',
    '反乌托邦': '反烏托邦', '权利': '權利', '两极化': '兩極化', '失去': '失去', '自由': '自由',
    '经济': '經濟', '剧变': '劇變', '竞赛': '競賽', '接管': '接管', '世界': '世界', '政府': '政府',
    
    // 常用單字補充
    '机': '機', '计': '計', '设': '設', '议': '議', '论': '論', '话': '話', '内': '內', '容': '容',
    '国': '國', '产': '產', '业': '業', '务': '務', '员': '員', '门': '門', '户': '戶', '车': '車',
    '电': '電', '话': '話', '码': '碼', '号': '號', '楼': '樓', '层': '層', '室': '室', '厅': '廳',
    '乌': '烏', '托': '托', '邦': '邦', '极': '極', '变': '變', '赛': '賽'
  };

  /**
   * 智慧轉換：檢測並轉換簡體中文
   */
  static smartConvert(text) {
    if (!text || typeof text !== 'string') return text;
    
    let convertedText = text;
    let hasConverted = false;
    
    // 使用字典進行轉換
    for (const [simplified, traditional] of Object.entries(this.coreMap)) {
      if (convertedText.includes(simplified)) {
        const regex = new RegExp(simplified, 'g');
        convertedText = convertedText.replace(regex, traditional);
        hasConverted = true;
      }
    }
    
    if (hasConverted) {
      console.log('檢測到簡體中文，已轉換為繁體中文');
      console.log('原文:', text);
      console.log('轉換後:', convertedText);
    }
    
    return convertedText;
  }

  /**
   * 檢測是否包含簡體中文
   */
  static containsSimplified(text) {
    if (!text || typeof text !== 'string') return false;
    
    for (const simplified in this.coreMap) {
      if (text.includes(simplified)) {
        return true;
      }
    }
    return false;
  }
}

// 測試您提供的例子
function testChineseConversion() {
  console.log('🧪 測試中文轉換功能\n');
  
  const testTitle = '【人工智能】于地狱处望天堂 | 谷歌前高管Mo Gawdat最新访谈 | 反乌托邦 | FACE RIPS | 权利两极化 | 失去自由 | 经济剧变 | AI竞赛 | AI接管世界政府 - YouTube';
  const testUrl = 'https://www.youtube.com/watch?v=VISuJrVy8h8';
  
  console.log('📋 原始標題:');
  console.log(testTitle);
  console.log('\n🔍 檢測是否包含簡體中文:', ChineseConverter.containsSimplified(testTitle));
  
  console.log('\n🔄 轉換結果:');
  const convertedTitle = ChineseConverter.smartConvert(testTitle);
  
  console.log('\n📝 最終格式化結果:');
  const finalResult = `${convertedTitle} ${testUrl}`;
  console.log(finalResult);
  
  console.log('\n✅ 轉換完成！');
  
  // 顯示轉換的詳細對比
  console.log('\n📊 轉換對比:');
  console.log('簡體 → 繁體');
  console.log('─'.repeat(50));
  
  const changes = [];
  for (const [simplified, traditional] of Object.entries(ChineseConverter.coreMap)) {
    if (testTitle.includes(simplified)) {
      changes.push(`${simplified} → ${traditional}`);
    }
  }
  
  if (changes.length > 0) {
    changes.forEach(change => console.log(change));
  } else {
    console.log('未檢測到需要轉換的簡體字');
  }
}

// 執行測試
testChineseConversion();