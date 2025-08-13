/**
 * 簡體中文轉繁體中文功能測試
 */

// 模擬 Logger 類別（用於測試）
class Logger {
  static info(message, details = null) {
    console.log(`[INFO] ${message}`, details || '');
  }
  
  static debug(message, details = null) {
    console.log(`[DEBUG] ${message}`, details || '');
  }
  
  static error(message, details = null) {
    console.error(`[ERROR] ${message}`, details || '');
  }
}

// 複製 ChineseConverter 類別（從 service-worker.js）
class ChineseConverter {
  // 常用簡體轉繁體字典
  static conversionMap = {
    // 常用字詞對照表
    '个': '個', '么': '麼', '义': '義', '乌': '烏', '书': '書', '买': '買', '乱': '亂', '争': '爭',
    '于': '於', '亏': '虧', '云': '雲', '亚': '亞', '产': '產', '亩': '畝', '亲': '親', '亵': '褻',
    '从': '從', '仅': '僅', '仑': '崙', '仓': '倉', '仪': '儀', '们': '們', '价': '價', '众': '眾',
    '优': '優', '伙': '夥', '会': '會', '伟': '偉', '传': '傳', '伤': '傷', '伦': '倫', '伪': '偽',
    '伫': '佇', '体': '體', '余': '餘', '佣': '傭', '作': '作', '你': '你', '佛': '佛', '余': '餘',
    '使': '使', '例': '例', '供': '供', '依': '依', '侠': '俠', '侣': '侶', '侥': '僥', '侦': '偵',
    '侧': '側', '侨': '僑', '侩': '儈', '侪': '儕', '侬': '儂', '俣': '俁', '俦': '儔', '俨': '儼',
    '俩': '倆', '俪': '儷', '俫': '倈', '俭': '儉', '债': '債', '倾': '傾', '偬': '傯', '偻': '僂',
    '偾': '僨', '偿': '償', '傥': '儻', '傧': '儐', '储': '儲', '傩': '儺', '催': '催', '傲': '傲',
    '傻': '傻', '像': '像', '僵': '僵', '价': '價', '侄': '姪', '侦': '偵', '侧': '側', '侨': '僑',
    
    // 補充常用字
    '这': '這', '那': '那', '哪': '哪', '什': '什', '怎': '怎', '为': '為', '因': '因', '所': '所',
    '以': '以', '及': '及', '和': '和', '或': '或', '但': '但', '是': '是', '不': '不', '没': '沒',
    '有': '有', '在': '在', '到': '到', '了': '了', '的': '的', '得': '得', '地': '地', '着': '著',
    '过': '過', '还': '還', '再': '再', '就': '就', '都': '都', '也': '也', '只': '只', '才': '才',
    '能': '能', '可': '可', '要': '要', '会': '會', '应': '應', '该': '該', '将': '將', '已': '已',
    '被': '被', '让': '讓', '使': '使', '叫': '叫', '把': '把', '对': '對', '向': '向', '跟': '跟',
    '与': '與', '同': '同', '像': '像', '比': '比', '如': '如', '若': '若', '则': '則', '虽': '雖',
    '设': '設', '计': '計', '划': '劃', '议': '議', '论': '論', '谈': '談', '话': '話', '说': '說',
    
    // 科技相關詞彙
    '计算机': '電腦', '软件': '軟體', '硬件': '硬體', '网络': '網路', '网站': '網站', '网页': '網頁',
    '程序': '程式', '数据': '資料', '信息': '資訊', '系统': '系統', '文件': '檔案', '文档': '文件',
    '视频': '影片', '音频': '音訊', '图片': '圖片', '照片': '照片', '应用': '應用', '软体': '軟體',
    '硬体': '硬體', '网路': '網路', '资料': '資料', '资讯': '資訊', '档案': '檔案', '影像': '影像',
    '算': '算', '机': '機', '开': '開', '发': '發', '习': '習', '内': '內', '容': '容',
    
    // 常用動詞
    '发': '發', '说': '說', '读': '讀', '写': '寫', '听': '聽', '看': '看', '来': '來', '去': '去',
    '做': '做', '给': '給', '拿': '拿', '放': '放', '开': '開', '关': '關', '买': '買', '卖': '賣',
    '吃': '吃', '喝': '喝', '睡': '睡', '起': '起', '坐': '坐', '站': '站', '走': '走', '跑': '跑',
    '飞': '飛', '游': '游', '学': '學', '教': '教', '工': '工', '作': '作', '休': '休', '息': '息',
    
    // 常用形容詞
    '好': '好', '坏': '壞', '大': '大', '小': '小', '多': '多', '少': '少', '长': '長', '短': '短',
    '高': '高', '低': '低', '快': '快', '慢': '慢', '新': '新', '旧': '舊', '美': '美', '丑': '醜',
    '热': '熱', '冷': '冷', '干': '乾', '湿': '濕', '轻': '輕', '重': '重', '容': '容', '易': '易',
    '难': '難', '简': '簡', '复': '複', '杂': '雜', '清': '清', '楚': '楚', '明': '明', '白': '白',
    
    // 數字和量詞
    '个': '個', '只': '隻', '条': '條', '张': '張', '片': '片', '块': '塊', '颗': '顆', '粒': '粒',
    '滴': '滴', '点': '點', '线': '線', '面': '面', '体': '體', '层': '層', '级': '級', '类': '類',
    '种': '種', '样': '樣', '次': '次', '遍': '遍', '回': '回', '趟': '趟', '场': '場', '局': '局',
    
    // 時間相關
    '时': '時', '间': '間', '年': '年', '月': '月', '日': '日', '天': '天', '周': '週', '星': '星',
    '期': '期', '钟': '鐘', '分': '分', '秒': '秒', '刻': '刻', '早': '早', '晚': '晚', '午': '午',
    '夜': '夜', '今': '今', '明': '明', '昨': '昨', '前': '前', '后': '後', '现': '現', '在': '在',
    
    // 地點相關
    '国': '國', '省': '省', '市': '市', '县': '縣', '区': '區', '镇': '鎮', '村': '村', '街': '街',
    '路': '路', '巷': '巷', '号': '號', '楼': '樓', '层': '層', '室': '室', '家': '家', '店': '店',
    '厂': '廠', '场': '場', '园': '園', '馆': '館', '院': '院', '校': '校', '医': '醫', '院': '院'
  };

  /**
   * 檢測文字是否包含簡體中文
   */
  static containsSimplifiedChinese(text) {
    if (!text || typeof text !== 'string') return false;
    
    // 檢查是否包含簡體字典中的字詞
    for (const simplified in this.conversionMap) {
      if (text.includes(simplified)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 將簡體中文轉換為繁體中文
   */
  static convertToTraditional(text) {
    if (!text || typeof text !== 'string') return text;
    
    let convertedText = text;
    
    // 按照字典進行轉換
    for (const [simplified, traditional] of Object.entries(this.conversionMap)) {
      // 使用全域替換
      const regex = new RegExp(simplified, 'g');
      convertedText = convertedText.replace(regex, traditional);
    }
    
    return convertedText;
  }

  /**
   * 智慧轉換：只有檢測到簡體中文時才進行轉換
   */
  static smartConvert(text) {
    if (!text || typeof text !== 'string') return text;
    
    if (this.containsSimplifiedChinese(text)) {
      const converted = this.convertToTraditional(text);
      Logger.info('檢測到簡體中文，已轉換為繁體中文', {
        original: text,
        converted: converted
      });
      return converted;
    }
    
    return text;
  }
}

/**
 * 執行測試
 */
function runTests() {
  console.log('🧪 開始測試簡體中文轉繁體中文功能...\n');
  
  // 測試案例
  const testCases = [
    {
      name: '科技相關詞彙',
      input: '计算机软件开发网站',
      expected: '電腦軟體開發網站'
    },
    {
      name: '常用動詞',
      input: '我们来学习写程序',
      expected: '我們來學習寫程式'
    },
    {
      name: '混合內容',
      input: '这个网站的信息很有用',
      expected: '這個網站的資訊很有用'
    },
    {
      name: '繁體中文（不應轉換）',
      input: '這是繁體中文內容',
      expected: '這是繁體中文內容'
    },
    {
      name: '英文內容（不應轉換）',
      input: 'This is English content',
      expected: 'This is English content'
    },
    {
      name: '數字和符號',
      input: '第1个软件版本2.0',
      expected: '第1個軟體版本2.0'
    },
    {
      name: '網頁標題範例',
      input: '百度搜索 - 全球最大的中文搜索引擎',
      expected: '百度搜索 - 全球最大的中文搜索引擎'
    },
    {
      name: '技術文章標題',
      input: 'JavaScript程序设计教程 - 学习前端开发',
      expected: 'JavaScript程式設計教程 - 學習前端開發'
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    console.log(`📋 測試 ${index + 1}: ${testCase.name}`);
    console.log(`輸入: "${testCase.input}"`);
    
    // 執行轉換
    const result = ChineseConverter.smartConvert(testCase.input);
    console.log(`輸出: "${result}"`);
    console.log(`預期: "${testCase.expected}"`);
    
    // 檢查結果
    const passed = result === testCase.expected;
    if (passed) {
      console.log('✅ 測試通過\n');
      passedTests++;
    } else {
      console.log('❌ 測試失敗\n');
    }
  });
  
  // 額外功能測試
  console.log('📋 額外功能測試:');
  
  // 測試檢測功能
  console.log('\n🔍 測試簡體中文檢測功能:');
  const detectionTests = [
    { text: '这是简体中文', expected: true },
    { text: '這是繁體中文', expected: false },
    { text: 'English text', expected: false },
    { text: '混合内容 mixed content', expected: true }
  ];
  
  detectionTests.forEach(test => {
    const detected = ChineseConverter.containsSimplifiedChinese(test.text);
    const passed = detected === test.expected;
    console.log(`"${test.text}" -> 檢測結果: ${detected} (預期: ${test.expected}) ${passed ? '✅' : '❌'}`);
    if (passed) passedTests++;
    totalTests++;
  });
  
  // 測試邊界情況
  console.log('\n🧪 測試邊界情況:');
  const edgeCases = [
    { input: '', expected: '' },
    { input: null, expected: null },
    { input: undefined, expected: undefined },
    { input: '123456', expected: '123456' },
    { input: '!@#$%^&*()', expected: '!@#$%^&*()' }
  ];
  
  edgeCases.forEach(testCase => {
    const result = ChineseConverter.smartConvert(testCase.input);
    const passed = result === testCase.expected;
    console.log(`輸入: ${testCase.input} -> 輸出: ${result} ${passed ? '✅' : '❌'}`);
    if (passed) passedTests++;
    totalTests++;
  });
  
  // 測試結果摘要
  console.log('\n📊 測試結果摘要:');
  console.log(`✅ 通過測試: ${passedTests}`);
  console.log(`❌ 失敗測試: ${totalTests - passedTests}`);
  console.log(`📈 成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 所有測試都通過了！簡體轉繁體功能運作正常。');
  } else {
    console.log('\n⚠️  有部分測試失敗，請檢查轉換邏輯。');
  }
  
  // 生成測試報告
  const testReport = {
    timestamp: new Date().toISOString(),
    totalTests: totalTests,
    passedTests: passedTests,
    failedTests: totalTests - passedTests,
    successRate: Math.round((passedTests / totalTests) * 100),
    testCases: testCases.map((testCase, index) => ({
      name: testCase.name,
      input: testCase.input,
      expected: testCase.expected,
      actual: ChineseConverter.smartConvert(testCase.input),
      passed: ChineseConverter.smartConvert(testCase.input) === testCase.expected
    }))
  };
  
  // 儲存測試報告
  const fs = require('fs');
  fs.writeFileSync('chinese-conversion-test-report.json', JSON.stringify(testReport, null, 2), 'utf8');
  console.log('\n📄 測試報告已儲存至: chinese-conversion-test-report.json');
}

// 執行測試
if (require.main === module) {
  runTests();
}

module.exports = { ChineseConverter, runTests };