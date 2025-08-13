/**
 * Quick Text Copy 數字標記過濾功能演示
 */

console.log('🎯 Quick Text Copy - 數字標記過濾功能演示\n');

// 模擬不同網站的標題（包含數字標記）
const demoTitles = [
  {
    category: '影片網站',
    examples: [
      {
        original: '(3) 【三大模型齐发】OpenAI GPT-OSS，Google Genie 3，Anthropic Claude Opus 4.1 - YouTube',
        url: 'https://www.youtube.com/watch?v=oideXFOvfdw'
      },
      {
        original: '[5] 最新科技新聞直播 - YouTube',
        url: 'https://www.youtube.com/watch?v=abc123'
      },
      {
        original: '{2} JavaScript 教學影片 - 程式設計頻道',
        url: 'https://www.youtube.com/watch?v=def456'
      }
    ]
  },
  {
    category: '新聞網站',
    examples: [
      {
        original: '(7) 台灣科技產業最新動態 - 科技新聞網',
        url: 'https://tech-news.example.com/article/123'
      },
      {
        original: '【12】重要經濟政策發佈 - 財經新聞',
        url: 'https://finance.example.com/news/456'
      },
      {
        original: '9 | 國際科技趨勢分析 - 全球科技',
        url: 'https://global-tech.example.com/analysis/789'
      }
    ]
  },
  {
    category: '社交媒體',
    examples: [
      {
        original: '(15) 有趣的程式設計討論 - Reddit',
        url: 'https://reddit.com/r/programming/comments/abc123'
      },
      {
        original: '[8] 最新開源專案分享 - GitHub Trending',
        url: 'https://github.com/trending'
      },
      {
        original: '〔6〕技術文章推薦 - 開發者社群',
        url: 'https://dev-community.example.com/post/123'
      }
    ]
  },
  {
    category: '購物網站',
    examples: [
      {
        original: '(2) 程式設計書籍推薦 - 網路書店',
        url: 'https://bookstore.example.com/programming'
      },
      {
        original: '4. 最新筆記型電腦評比 - 3C購物',
        url: 'https://3c-shop.example.com/laptops'
      },
      {
        original: '《3》軟體開發工具特價 - 開發者商店',
        url: 'https://dev-tools.example.com/sale'
      }
    ]
  }
];

// 模擬完整的處理邏輯
function simulateProcessing(title, url) {
  console.log(`📋 處理標題:`);
  console.log(`   🌐 網址: ${url}`);
  console.log(`   📝 原始標題: "${title}"`);
  
  // 步驟 1: 過濾數字標記
  const filteredTitle = filterNumberPrefix(title);
  if (title !== filteredTitle) {
    console.log(`   🔧 過濾數字標記: "${filteredTitle}"`);
  }
  
  // 步驟 2: 簡體轉繁體（簡化版）
  const convertedTitle = simpleChineseConvert(filteredTitle);
  if (filteredTitle !== convertedTitle) {
    console.log(`   🔄 簡體轉繁體: "${convertedTitle}"`);
  }
  
  // 步驟 3: 最終格式化
  const finalOutput = `${convertedTitle} ${url}`;
  console.log(`   📋 最終輸出: "${finalOutput}"`);
  console.log(`   ✅ 已複製到剪貼簿\n`);
  
  return finalOutput;
}

// 簡化的數字標記過濾
function filterNumberPrefix(title) {
  const patterns = [
    /^\(\d+\)\s*/,    // (3)
    /^\[\d+\]\s*/,    // [5]
    /^\{\d+\}\s*/,    // {2}
    /^\d+\.\s*/,      // 3.
    /^\d+\)\s*/,      // 3)
    /^\d+\s*-\s*/,    // 3 -
    /^\d+\s*\|\s*/,   // 3 |
    /^【\d+】\s*/,    // 【3】
    /^〔\d+〕\s*/,    // 〔3〕
    /^＜\d+＞\s*/,    // ＜3＞
    /^《\d+》\s*/     // 《3》
  ];

  for (const pattern of patterns) {
    if (pattern.test(title)) {
      return title.replace(pattern, '').trim();
    }
  }
  return title;
}

// 簡化的簡體轉繁體
function simpleChineseConvert(text) {
  const simpleMap = {
    '齐': '齊', '发': '發', '这': '這', '个': '個', '软': '軟', '件': '件',
    '很': '很', '好': '好', '用': '用', '技': '技', '术': '術', '博': '博',
    '客': '客', '计': '計', '算': '算', '机': '機', '程': '程', '序': '式',
    '设': '設', '计': '計', '教': '教', '学': '學', '视': '視', '频': '頻',
    '网': '網', '站': '站', '开': '開', '发': '發', '工': '工', '具': '具'
  };
  
  let converted = text;
  for (const [simplified, traditional] of Object.entries(simpleMap)) {
    converted = converted.replace(new RegExp(simplified, 'g'), traditional);
  }
  return converted;
}

// 執行演示
console.log('🎬 開始演示數字標記過濾功能:\n');

demoTitles.forEach((category, categoryIndex) => {
  console.log(`📂 ${category.category}:`);
  console.log('─'.repeat(60));
  
  category.examples.forEach((example, index) => {
    console.log(`\n${index + 1}. 網站範例:`);
    simulateProcessing(example.original, example.url);
  });
  
  console.log('\n');
});

// 功能說明
console.log('🌟 數字標記過濾功能特色:');
console.log('─'.repeat(60));
console.log('✅ 自動識別並移除標題開頭的數字標記');
console.log('✅ 支援多種數字標記格式：(3)、[5]、{2}、3.、3)、3-、3|');
console.log('✅ 支援中文數字標記：【3】、〔3〕、＜3＞、《3》');
console.log('✅ 智慧保護：過濾後標題太短時保持原樣');
console.log('✅ 不影響標題中間或結尾的數字');
console.log('✅ 與簡體轉繁體功能完美整合');

console.log('\n🎯 使用場景:');
console.log('─'.repeat(60));
console.log('📺 YouTube 影片標題的未讀通知數量');
console.log('📰 新聞網站的文章編號');
console.log('💬 社交媒體的未讀訊息數量');
console.log('🛒 購物網站的商品編號');
console.log('📚 教學網站的章節編號');
console.log('📧 郵件標題的未讀郵件數量');

console.log('\n🔧 技術實作:');
console.log('─'.repeat(60));
console.log('• 使用正則表達式精確匹配各種數字標記格式');
console.log('• 優先處理最常見的格式以提高效能');
console.log('• 包含安全檢查避免過度過濾');
console.log('• 與現有的簡體轉繁體功能無縫整合');

console.log('\n🎉 演示完成！Quick Text Copy 現在能智慧過濾數字標記。');
console.log('📋 複製的內容更加乾淨整潔，提升使用體驗！');