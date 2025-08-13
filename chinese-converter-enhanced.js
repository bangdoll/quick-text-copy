/**
 * 增強版簡體中文轉繁體中文轉換器
 * 使用更完整的字典和更智慧的轉換邏輯
 */

class EnhancedChineseConverter {
  // 核心簡繁對照字典
  static coreMap = {
    // 最常用的簡繁對照
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
    
    // 常用單字
    '机': '機', '计': '計', '设': '設', '议': '議', '论': '論', '话': '話', '内': '內', '容': '容',
    '国': '國', '产': '產', '业': '業', '务': '務', '员': '員', '门': '門', '户': '戶', '车': '車',
    '电': '電', '话': '話', '码': '碼', '号': '號', '楼': '樓', '层': '層', '室': '室', '厅': '廳'
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

module.exports = EnhancedChineseConverter;