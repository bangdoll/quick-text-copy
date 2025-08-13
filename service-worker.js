/**
 * Chrome 文字複製擴充功能 Service Worker
 * 提供快速複製頁面資訊到剪貼簿的功能
 * 
 * 輸出格式：標題 網址
 * 例如：蔡正信教練的電腦教學經驗 https://rd.coach/teaching-experience/
 */

// 常數定義
const EXTENSION_NAME = 'Quick Text Copy';
const OPERATION_TIMEOUT = 2000; // 2秒操作逾時

/**
 * 日誌記錄系統
 */
class Logger {
  static log(level, message, details = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${EXTENSION_NAME}] [${level}] ${message}`;
    
    switch (level) {
      case 'ERROR':
        console.error(logMessage, details || '');
        break;
      case 'WARN':
        console.warn(logMessage, details || '');
        break;
      case 'DEBUG':
        console.debug(logMessage, details || '');
        break;
      default:
        console.log(logMessage, details || '');
    }
  }

  static info(message, details = null) {
    this.log('INFO', message, details);
  }

  static warn(message, details = null) {
    this.log('WARN', message, details);
  }

  static error(message, details = null) {
    this.log('ERROR', message, details);
  }

  static debug(message, details = null) {
    this.log('DEBUG', message, details);
  }
}

/**
 * 簡體中文轉繁體中文轉換器 - 高效能字典方案
 */
class ChineseConverter {
  static conversionMap = null;
  static isInitialized = false;

  /**
   * 初始化轉換字典
   */
  static initialize() {
    if (this.isInitialized) {
      return;
    }

    // 建立完整的簡繁轉換字典
    this.conversionMap = new Map([
      // 多字詞組（優先處理）
      ['人工智能', '人工智慧'], ['机器学习', '機器學習'], ['深度学习', '深度學習'], 
      ['神经网络', '神經網路'], ['计算机', '電腦'], ['软件', '軟體'], ['硬件', '硬體'],
      ['网络', '網路'], ['网站', '網站'], ['网页', '網頁'], ['程序', '程式'], 
      ['数据', '資料'], ['信息', '資訊'], ['系统', '系統'], ['文件', '檔案'],
      ['视频', '影片'], ['图片', '圖片'], ['应用', '應用'], ['设计', '設計'],
      ['开发', '開發'], ['内容', '內容'], ['功能', '功能'], ['数据库', '資料庫'],
      ['云计算', '雲端運算'], ['区块链', '區塊鏈'], ['算法', '演算法'],
      
      // 媒體和網路詞彙
      ['访谈', '訪談'], ['采访', '採訪'], ['报道', '報導'], ['新闻', '新聞'], 
      ['媒体', '媒體'], ['网红', '網紅'], ['直播', '直播'], ['评论', '評論'], 
      ['分享', '分享'], ['订阅', '訂閱'],
      
      // 政治和社會詞彙
      ['政府', '政府'], ['权利', '權利'], ['权力', '權力'], ['民主', '民主'], 
      ['自由', '自由'], ['经济', '經濟'], ['社会', '社會'], ['国家', '國家'], 
      ['世界', '世界'], ['全球', '全球'], ['两极化', '兩極化'], ['极端', '極端'], 
      ['剧变', '劇變'], ['变化', '變化'], ['发展', '發展'],
      
      // 特殊詞彙
      ['反乌托邦', '反烏托邦'], ['乌托邦', '烏托邦'], ['竞赛', '競賽'], 
      ['竞争', '競爭'], ['接管', '接管'], ['控制', '控制'], ['管理', '管理'], 
      ['监管', '監管'],
      
      // 地理和方位詞彙
      ['地狱', '地獄'], ['天堂', '天堂'], ['东', '東'], ['西', '西'], 
      ['南', '南'], ['北', '北'], ['中', '中'],
      
      // 雙字詞組
      ['这个', '這個'], ['那个', '那個'], ['他们', '他們'], ['我们', '我們'], 
      ['你们', '你們'], ['来说', '來說'], ['对于', '對於'], ['为了', '為了'],
      ['会议', '會議'], ['应该', '應該'], ['时间', '時間'], ['过程', '過程'], 
      ['还是', '還是'], ['没有', '沒有'], ['让人', '讓人'], ['开始', '開始'],
      ['关于', '關於'], ['发现', '發現'], ['学习', '學習'], ['写作', '寫作'],
      ['读书', '讀書'], ['听说', '聽說'], ['买卖', '買賣'], ['长短', '長短'],
      ['热门', '熱門'], ['轻松', '輕鬆'], ['难道', '難道'], ['简单', '簡單'],
      ['复杂', '複雜'], ['旧版', '舊版'], ['丑陋', '醜陋'], ['干净', '乾淨'],
      ['湿润', '濕潤'], ['坏事', '壞事'],
      
      // 單字轉換
      ['这', '這'], ['个', '個'], ['们', '們'], ['来', '來'], ['说', '說'], 
      ['对', '對'], ['为', '為'], ['会', '會'], ['应', '應'], ['时', '時'], 
      ['间', '間'], ['过', '過'], ['还', '還'], ['没', '沒'], ['让', '讓'], 
      ['开', '開'], ['关', '關'], ['发', '發'], ['学', '學'], ['习', '習'], 
      ['写', '寫'], ['读', '讀'], ['听', '聽'], ['买', '買'], ['卖', '賣'], 
      ['长', '長'], ['短', '短'], ['热', '熱'], ['冷', '冷'], ['轻', '輕'], 
      ['重', '重'], ['难', '難'], ['简', '簡'], ['复', '複'], ['杂', '雜'], 
      ['新', '新'], ['旧', '舊'], ['美', '美'], ['丑', '醜'], ['干', '乾'], 
      ['湿', '濕'], ['坏', '壞'], ['好', '好'], ['大', '大'], ['小', '小'], 
      ['多', '多'], ['少', '少'], ['机', '機'], ['计', '計'], ['设', '設'], 
      ['议', '議'], ['论', '論'], ['话', '話'], ['内', '內'], ['容', '容'], 
      ['国', '國'], ['产', '產'], ['业', '業'], ['务', '務'], ['员', '員'], 
      ['门', '門'], ['户', '戶'], ['车', '車'], ['电', '電'], ['话', '話'], 
      ['码', '碼'], ['号', '號'], ['楼', '樓'], ['层', '層'], ['室', '室'], 
      ['厅', '廳'], ['于', '於'], ['处', '處'], ['望', '望'], ['乌', '烏'], 
      ['托', '托'], ['邦', '邦'], ['极', '極'], ['变', '變'], ['赛', '賽'], 
      ['争', '爭'], ['监', '監'], ['管', '管'], ['谷', '谷'], ['歌', '歌'], 
      ['访', '訪'], ['谈', '談'], ['采', '採']
    ]);

    // 按鍵長度排序，優先處理較長的詞組
    this.sortedEntries = Array.from(this.conversionMap.entries())
      .sort((a, b) => b[0].length - a[0].length);

    this.isInitialized = true;
    Logger.info('中文轉換字典初始化完成', {
      totalEntries: this.conversionMap.size,
      method: 'enhanced-dictionary'
    });
  }

  /**
   * 智慧轉換：檢測並轉換簡體中文
   */
  static smartConvert(text) {
    if (!text || typeof text !== 'string') return text;
    
    // 確保字典已初始化
    if (!this.isInitialized) {
      this.initialize();
    }
    
    let convertedText = text;
    let hasConverted = false;
    
    // 使用排序後的條目進行轉換
    for (const [simplified, traditional] of this.sortedEntries) {
      if (convertedText.includes(simplified)) {
        // 使用全局替換，並轉義特殊字符
        const escapedSimplified = simplified.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedSimplified, 'g');
        const beforeConversion = convertedText;
        convertedText = convertedText.replace(regex, traditional);
        
        if (beforeConversion !== convertedText) {
          hasConverted = true;
        }
      }
    }
    
    if (hasConverted) {
      Logger.info('檢測到簡體中文，已轉換為繁體中文', {
        original: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        converted: convertedText.substring(0, 100) + (convertedText.length > 100 ? '...' : ''),
        method: 'enhanced-dictionary',
        originalLength: text.length,
        convertedLength: convertedText.length
      });
    }
    
    return convertedText;
  }

  /**
   * 檢測是否包含簡體中文
   */
  static containsSimplified(text) {
    if (!text || typeof text !== 'string') return false;
    
    // 確保字典已初始化
    if (!this.isInitialized) {
      this.initialize();
    }
    
    // 檢查是否包含任何簡體字
    for (const simplified of this.conversionMap.keys()) {
      if (text.includes(simplified)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 獲取轉換統計信息
   */
  static getConversionStats(originalText, convertedText) {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    const conversions = [];
    
    for (const [simplified, traditional] of this.conversionMap.entries()) {
      if (originalText.includes(simplified)) {
        const count = (originalText.match(new RegExp(simplified, 'g')) || []).length;
        conversions.push({
          simplified,
          traditional,
          count
        });
      }
    }
    
    return {
      totalConversions: conversions.length,
      conversions,
      hasChanged: originalText !== convertedText
    };
  }

  /**
   * 獲取轉換器狀態
   */
  static getStatus() {
    return {
      isInitialized: this.isInitialized,
      dictionarySize: this.conversionMap ? this.conversionMap.size : 0,
      method: 'enhanced-dictionary'
    };
  }
}

/**
 * 分頁資訊處理類別
 */
class TabInfoHandler {
  /**
   * 取得當前活躍分頁資訊
   */
  static async getCurrentActiveTab() {
    try {
      Logger.debug('開始取得當前活躍分頁資訊');
      
      const tabs = await chrome.tabs.query({ 
        active: true, 
        currentWindow: true 
      });
      
      if (!tabs || tabs.length === 0) {
        throw new Error('找不到當前活躍分頁');
      }
      
      const activeTab = tabs[0];
      Logger.debug('成功取得活躍分頁', {
        id: activeTab.id,
        title: activeTab.title,
        url: activeTab.url
      });
      
      return activeTab;
      
    } catch (error) {
      Logger.error('取得當前分頁失敗', error);
      throw new Error(`無法取得當前分頁資訊: ${error.message}`);
    }
  }

  /**
   * 驗證分頁資訊的有效性
   */
  static validateTabInfo(tab) {
    if (!tab) {
      Logger.warn('分頁物件為空');
      return false;
    }

    if (!tab.url || typeof tab.url !== 'string' || tab.url.trim() === '') {
      Logger.warn('分頁網址無效', { url: tab.url });
      return false;
    }

    if (!tab.title || typeof tab.title !== 'string') {
      Logger.warn('分頁標題無效', { title: tab.title });
      return false;
    }

    // 檢查是否為特殊頁面
    if (tab.url.startsWith('chrome://') || 
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('moz-extension://') ||
        tab.url.startsWith('edge://')) {
      Logger.warn('無法處理瀏覽器內部頁面', { url: tab.url });
      return false;
    }

    return true;
  }

  /**
   * 過濾標題開頭的數字標記
   * 例如：(3) 標題 → 標題、[5] 標題 → 標題、{2} 標題 → 標題
   */
  static filterNumberPrefix(title) {
    if (!title || typeof title !== 'string') {
      return title;
    }

    // 定義各種數字標記的正則表達式模式
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

    // 嘗試匹配並移除各種模式
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
          break; // 只處理第一個匹配的模式
        }
      }
    }

    // 如果過濾後標題為空或太短，返回原標題
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
   * 格式化文字內容（異步版本）
   * 格式：標題 網址
   * 例如：蔡正信教練的電腦教學經驗 https://rd.coach/teaching-experience/
   * 自動將簡體中文轉換為繁體中文，並過濾標題開頭的數字標記
   */
  static async formatText(title, url) {
    try {
      // 輸入驗證
      if (!title || typeof title !== 'string') {
        throw new Error('標題必須是非空字串');
      }
      
      if (!url || typeof url !== 'string') {
        throw new Error('網址必須是非空字串');
      }

      // 清理標題（移除多餘空白）
      let cleanTitle = title.trim().replace(/\s+/g, ' ');
      
      // 過濾標題開頭的數字標記，例如 (3)、[5]、{2} 等
      const filteredTitle = this.filterNumberPrefix(cleanTitle);
      
      // 簡體中文轉繁體中文（使用 OpenCC）
      const convertedTitle = await ChineseConverter.smartConvert(filteredTitle);
      
      // 清理網址（移除多餘空白）
      const cleanUrl = url.trim();
      
      // 檢查標題長度，避免過長
      const maxTitleLength = 150;
      const truncatedTitle = convertedTitle.length > maxTitleLength 
        ? convertedTitle.substring(0, maxTitleLength) + '...'
        : convertedTitle;

      // 組合格式：標題 網址
      const formattedText = `${truncatedTitle} ${cleanUrl}`;
      
      Logger.debug('文字格式化完成', {
        originalTitle: title,
        filteredTitle: filteredTitle,
        convertedTitle: convertedTitle,
        finalTitle: truncatedTitle,
        url: cleanUrl,
        formattedText: formattedText.substring(0, 100) + (formattedText.length > 100 ? '...' : ''),
        wasFiltered: title !== filteredTitle,
        wasConverted: filteredTitle !== convertedTitle,
        conversionMethod: ChineseConverter.getStatus().method
      });
      
      return formattedText;
      
    } catch (error) {
      Logger.error('文字格式化失敗', error);
      throw new Error(`文字格式化錯誤: ${error.message}`);
    }
  }

  /**
   * 取得並格式化當前分頁的文字資訊
   */
  static async getFormattedText() {
    try {
      Logger.info('開始取得並格式化分頁文字資訊');
      
      // 取得當前活躍分頁
      const activeTab = await this.getCurrentActiveTab();
      
      // 驗證分頁資訊
      if (!this.validateTabInfo(activeTab)) {
        throw new Error('分頁資訊驗證失敗');
      }
      
      // 格式化文字（異步）
      const formattedText = await this.formatText(activeTab.title, activeTab.url);
      
      const textInfo = {
        formattedText: formattedText,
        originalTitle: activeTab.title,
        url: activeTab.url,
        tabId: activeTab.id
      };
      
      Logger.info('分頁文字資訊處理完成', {
        tabId: textInfo.tabId,
        originalTitle: textInfo.originalTitle.substring(0, 50) + (textInfo.originalTitle.length > 50 ? '...' : ''),
        formattedLength: textInfo.formattedText.length,
        url: textInfo.url.substring(0, 50) + (textInfo.url.length > 50 ? '...' : '')
      });
      
      return textInfo;
      
    } catch (error) {
      Logger.error('取得格式化文字資訊失敗', error);
      throw error;
    }
  }
}

/**
 * 剪貼簿操作類別
 */
class ClipboardHandler {
  /**
   * 複製文字到剪貼簿
   */
  static async copyToClipboard(text, tabId) {
    try {
      Logger.info('開始複製文字到剪貼簿', { textLength: text.length, tabId });
      
      // 使用 chrome.scripting API 在當前分頁中執行複製操作
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (textToCopy) => {
          return new Promise((resolve) => {
            // 使用現代的 Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(textToCopy)
                .then(() => {
                  resolve({ success: true, method: 'clipboard-api' });
                })
                .catch((error) => {
                  // 如果 Clipboard API 失敗，使用傳統方法
                  try {
                    const textarea = document.createElement('textarea');
                    textarea.value = textToCopy;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    const success = document.execCommand('copy');
                    document.body.removeChild(textarea);
                    resolve({ success, method: 'execCommand', error: error.message });
                  } catch (fallbackError) {
                    resolve({ success: false, method: 'failed', error: fallbackError.message });
                  }
                });
            } else {
              // 使用傳統的 execCommand 方法
              try {
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                resolve({ success, method: 'execCommand' });
              } catch (error) {
                resolve({ success: false, method: 'failed', error: error.message });
              }
            }
          });
        },
        args: [text]
      });

      if (results && results[0] && results[0].result) {
        const result = results[0].result;
        
        if (result.success) {
          Logger.info('文字成功複製到剪貼簿', { 
            method: result.method,
            textLength: text.length 
          });
          return true;
        } else {
          Logger.error('複製到剪貼簿失敗', { 
            method: result.method,
            error: result.error 
          });
          return false;
        }
      } else {
        Logger.error('執行複製腳本失敗', { results });
        return false;
      }

    } catch (error) {
      Logger.error('複製到剪貼簿操作失敗', error);
      return false;
    }
  }
}

/**
 * 主要事件處理邏輯類別
 */
class MainEventHandler {
  /**
   * 處理文字複製的完整流程
   */
  static async handleTextCopy(tab) {
    const startTime = Date.now();
    
    try {
      Logger.info('開始主要文字複製流程', { 
        tabId: tab?.id, 
        url: tab?.url, 
        title: tab?.title 
      });

      // 步驟 1: 取得並格式化當前分頁資訊
      Logger.debug('執行步驟 1: 取得並格式化分頁資訊');
      const textInfo = await TabInfoHandler.getFormattedText();
      
      // 步驟 2: 複製到剪貼簿
      Logger.debug('執行步驟 2: 複製到剪貼簿');
      const copySuccess = await ClipboardHandler.copyToClipboard(
        textInfo.formattedText, 
        textInfo.tabId
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (copySuccess) {
        Logger.info('文字複製流程完成', {
          formattedText: textInfo.formattedText,
          duration
        });
        
        return {
          success: true,
          action: 'copied',
          text: textInfo.formattedText,
          duration,
          tabInfo: {
            id: tab?.id,
            title: textInfo.originalTitle,
            url: textInfo.url
          }
        };
      } else {
        Logger.warn('文字複製失敗', { duration });
        
        return {
          success: false,
          action: 'copy_failed',
          error: '無法複製到剪貼簿',
          duration,
          tabInfo: {
            id: tab?.id,
            title: textInfo.originalTitle,
            url: textInfo.url
          }
        };
      }
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      Logger.error('主要文字複製流程失敗', error);
      
      return {
        success: false,
        action: 'failed',
        error: error.message,
        duration,
        tabInfo: {
          id: tab?.id,
          title: tab?.title,
          url: tab?.url
        }
      };
    }
  }

  /**
   * 驗證分頁物件的有效性
   */
  static validateTabObject(tab) {
    if (!tab) {
      Logger.warn('分頁物件為空');
      return false;
    }

    if (typeof tab.id !== 'number' || tab.id <= 0) {
      Logger.warn('分頁 ID 無效', { id: tab.id });
      return false;
    }

    if (!tab.url || typeof tab.url !== 'string' || tab.url.trim() === '') {
      Logger.warn('分頁網址無效', { url: tab.url });
      return false;
    }

    // 檢查是否為特殊頁面
    if (tab.url.startsWith('chrome://') || 
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('moz-extension://') ||
        tab.url.startsWith('edge://')) {
      Logger.warn('無法處理瀏覽器內部頁面', { url: tab.url });
      return false;
    }

    return true;
  }
}

/**
 * 擴充功能按鈕點擊事件監聽器
 */
chrome.action.onClicked.addListener(async (tab) => {
  try {
    Logger.info('擴充功能按鈕被點擊', { 
      tabId: tab?.id, 
      url: tab?.url?.substring(0, 100) + (tab?.url?.length > 100 ? '...' : ''),
      title: tab?.title?.substring(0, 50) + (tab?.title?.length > 50 ? '...' : '')
    });
    
    // 驗證分頁物件
    if (!MainEventHandler.validateTabObject(tab)) {
      Logger.warn('分頁物件驗證失敗，無法處理文字複製');
      return;
    }
    
    // 執行文字複製流程
    const result = await MainEventHandler.handleTextCopy(tab);
    
    // 處理結果
    if (result.success) {
      Logger.info('文字複製操作完成', {
        text: result.text?.substring(0, 100) + (result.text?.length > 100 ? '...' : ''),
        duration: result.duration
      });
    } else {
      Logger.warn('文字複製操作失敗', {
        action: result.action,
        error: result.error,
        duration: result.duration
      });
    }
    
  } catch (error) {
    Logger.error('擴充功能按鈕點擊處理失敗', {
      message: error?.message || '未知錯誤',
      stack: error?.stack,
      tabId: tab?.id,
      tabUrl: tab?.url
    });
  }
});

// Service Worker 啟動日誌
Logger.info('Quick Text Copy Service Worker 已啟動');

// 初始化中文轉換器
ChineseConverter.initialize();