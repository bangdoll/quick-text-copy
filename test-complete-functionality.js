/**
 * 完整功能測試：數字標記過濾 + 簡體轉繁體
 */

// 模擬 Logger
class Logger {
  static debug(message, details) {
    console.log(`[DEBUG] ${message}`, details || '');
  }
  
  static warn(message, details) {
    console.log(`[WARN] ${message}`, details || '');
  }
  
  static info(message, details) {
    console.log(`[INFO] ${message}`, details || '');
  }
}

// 簡體轉繁體轉換器
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
    '教': '教', '育': '育', '培': '培', '训': '訓', '配': '配', '件': '件', '工': '工', '具': '具',
    '齐': '齊', '模': '模', '型': '型'
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

// 完整的標題處理器
class TabInfoHandler {
  /**
   * 過濾標題開頭的數字標記
   */
  static filterNumberPrefix(title) {
    if (!title || typeof title !== 'string') {
      return title;
    }

    const patterns = [
      /^\(\d+\)\s*/,        // (3) 開頭
      /^\[\d+\]\s*/,        // [5] 開頭
      /^\{\d+\}\s*/,        // {2} 開頭
      /^\d+\.\s*/,          // 3. 開頭
      /^\d+\)\s*/,          // 3) 開頭
      /^\d+\s*-\s*/,        // 3 - 開頭
      /^\d+\s*\|\s*/,       // 3 | 開頭
      /^【\d+】\s*/,        // 【3】開頭
      /^〔\d+〕\s*/,        // 〔3〕開頭
      /^＜\d+＞\s*/,        // ＜3＞開頭
      /^《\d+》\s*/         // 《3》開頭
    ];

    let filteredTitle = title;
    let wasFiltered = false;

    for (const pattern of patterns) {
      if (pattern.test(filteredTitle)) {
        const originalTitle = filteredTitle;
        filteredTitle = filteredTitle.replace(pattern, '').trim();
        
        if (originalTitle !== filteredTitle) {
          wasFiltered = true;
          Logger.debug('過濾標題數字標記', {
            original: originalTitle,
            filtered: filteredTitle,
            pattern: pattern.toString()
          });
          break;
        }
      }
    }

    if (!filteredTitle || filteredTitle.length < 3) {
      Logger.warn('過濾後標題太短，使用原標題', {
        original: title,
        filtered: filteredTitle
      });
      return title;
    }

    return filteredTitle;
  }

  /**
   * 完整的標題格式化處理
   */
  static formatText(title, url) {
    try {
      if (!title || typeof title !== 'string') {
        throw new Error('標題必須是非空字串');
      }
      
      if (!url || typeof url !== 'string') {
        throw new Error('網址必須是非空字串');
      }

      // 1. 清理標題（移除多餘空白）
      let cleanTitle = title.trim().replace(/\s+/g, ' ');
      
      // 2. 過濾標題開頭的數字標記
      const filteredTitle = this.filterNumberPrefix(cleanTitle);
      
      // 3. 簡體中文轉繁體中文
      const convertedTitle = ChineseConverter.smartConvert(filteredTitle);
      
      // 4. 清理網址
      const cleanUrl = url.trim();
      
      // 5. 檢查標題長度
      const maxTitleLength = 150;
      const truncatedTitle = convertedTitle.length > maxTitleLength 
        ? convertedTitle.substring(0, maxTitleLength) + '...'
        : convertedTitle;

      // 6. 組合最終格式
      const formattedText = `${truncatedTitle} ${cleanUrl}`;
      
      Logger.debug('完整文字格式化完成', {
        originalTitle: title,
        filteredTitle: filteredTitle,
        convertedTitle: convertedTitle,
        finalTitle: truncatedTitle,
        url: cleanUrl,
        formattedText: formattedText,
        wasFiltered: title !== filteredTitle,
        wasConverted: filteredTitle !== convertedTitle
      });
      
      return formattedText;
      
    } catch (error) {
      Logger.error('文字格式化失敗', error);
      throw new Error(`文字格式化錯誤: ${error.message}`);
    }
  }
}

// 測試案例
const testCases = [
  {
    name: '您提供的範例',
    title: '(3) 【三大模型齐发】OpenAI GPT-OSS，Google Genie 3，Anthropic Claude Opus 4.1 - YouTube',
    url: 'https://www.youtube.com/watch?v=oideXFOvfdw',
    expected: '【三大模型齊發】OpenAI GPT-OSS，Google Genie 3，Anthropic Claude Opus 4.1 - YouTube https://www.youtube.com/watch?v=oideXFOvfdw'
  },
  {
    name: '簡體中文 + 數字標記',
    title: '[5] 这个软件很好用 - 技术博客',
    url: 'https://example.com/blog',
    expected: '這個軟體很好用 - 技术博客 https://example.com/blog'
  },
  {
    name: '繁體中文 + 數字標記',
    title: '(2) 這是繁體中文內容 - 台灣網站',
    url: 'https://taiwan.example.com',
    expected: '這是繁體中文內容 - 台灣網站 https://taiwan.example.com'
  },
  {
    name: '英文 + 數字標記',
    title: '{7} GitHub - The world\'s leading software development platform',
    url: 'https://github.com',
    expected: 'GitHub - The world\'s leading software development platform https://github.com'
  },
  {
    name: '無數字標記的簡體中文',
    title: '计算机程序设计教程',
    url: 'https://programming.example.com',
    expected: '電腦程式設計教程 https://programming.example.com'
  },
  {
    name: '無需處理的標題',
    title: 'React Documentation - Getting Started',
    url: 'https://reactjs.org/docs',
    expected: 'React Documentation - Getting Started https://reactjs.org/docs'
  }
];

// 執行測試
function runCompleteTests() {
  console.log('🧪 開始測試完整功能（數字過濾 + 簡體轉繁體）...\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    console.log(`📋 測試 ${index + 1}: ${testCase.name}`);
    console.log(`標題: "${testCase.title}"`);
    console.log(`網址: "${testCase.url}"`);
    
    const result = TabInfoHandler.formatText(testCase.title, testCase.url);
    console.log(`結果: "${result}"`);
    console.log(`預期: "${testCase.expected}"`);
    
    const passed = result === testCase.expected;
    if (passed) {
      console.log('✅ 測試通過\n');
      passedTests++;
    } else {
      console.log('❌ 測試失敗\n');
    }
  });
  
  // 測試結果摘要
  console.log('📊 完整功能測試結果:');
  console.log(`✅ 通過測試: ${passedTests}`);
  console.log(`❌ 失敗測試: ${totalTests - passedTests}`);
  console.log(`📈 成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 所有完整功能測試都通過了！');
    console.log('✅ 數字標記過濾功能正常');
    console.log('✅ 簡體轉繁體功能正常');
    console.log('✅ 標題格式化功能正常');
  } else {
    console.log('\n⚠️  有部分測試失敗，請檢查功能邏輯。');
  }
}

// 執行測試
if (require.main === module) {
  runCompleteTests();
}

module.exports = { TabInfoHandler, runCompleteTests };