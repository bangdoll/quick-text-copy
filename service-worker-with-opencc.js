/**
 * Chrome 文字複製擴充功能 Service Worker (含 OpenCC 功能)
 * 提供快速複製頁面資訊到剪貼簿的功能，支援簡體轉繁體
 * 
 * 輸出格式：標題 網址
 * 例如：蔡正信教練的電腦教學經驗 https://rd.coach/teaching-experience/
 */

// 常數定義
const EXTENSION_NAME = 'Quick Text Copy';
const OPERATION_TIMEOUT = 2000; // 2秒操作逾時

/**
 * 簡體轉繁體轉換器（瀏覽器版）
 */
class OpenCCBrowser {
  constructor() {
    this.isReady = false;
    this.converter = null;
    this.init();
  }

  init() {
    try {
      this.converter = this.createSimpleConverter();
      this.isReady = true;
      console.log('OpenCC Browser 初始化成功');
    } catch (error) {
      console.error('OpenCC Browser 初始化失敗:', error);
      this.isReady = false;
    }
  }

  createSimpleConverter() {
    const conversionMap = {
      // 基本字符
      '这': '這', '个': '個', '们': '們', '来': '來', '说': '說', '对': '對', '为': '為',
      '会': '會', '应': '應', '时': '時', '间': '間', '过': '過', '还': '還', '没': '沒',
      '让': '讓', '开': '開', '关': '關', '发': '發', '学': '學', '习': '習', '写': '寫',
      '读': '讀', '听': '聽', '买': '買', '卖': '賣', '长': '長', '热': '熱', '轻': '輕',
      '难': '難', '简': '簡', '复': '複', '杂': '雜', '旧': '舊', '丑': '醜', '干': '乾',
      '湿': '濕', '坏': '壞',
      
      // 科技詞彙
      '软件': '軟體', '硬件': '硬體', '网络': '網路', '网站': '網站', '网页': '網頁',
      '程序': '程式', '数据': '資料', '信息': '資訊', '系统': '系統', '文件': '檔案',
      '视频': '影片', '图片': '圖片', '应用': '應用', '设计': '設計', '开发': '開發',
      '内容': '內容', '功能': '功能', '计算机': '計算機', '电脑': '電腦',
      
      // 常用詞彙
      '用户': '使用者', '鼠标': '滑鼠', '键盘': '鍵盤', '显示器': '顯示器',
      '打印机': '印表機', '扫描仪': '掃描器', '服务器': '伺服器', '客户端': '客戶端',
      '浏览器': '瀏覽器', '搜索': '搜尋', '下载': '下載', '上传': '上傳',
      '登录': '登入', '注册': '註冊', '设置': '設定', '配置': '配置',
      
      // 單字轉換
      '机': '機', '计': '計', '设': '設', '议': '議', '论': '論', '话': '話',
      '内': '內', '国': '國', '产': '產', '业': '業', '务': '務', '员': '員',
      '门': '門', '户': '戶', '车': '車', '电': '電', '码': '碼', '号': '號'
    };

    return (text) => {
      if (!text || typeof text !== 'string') {
        return text;
      }

      let result = text;
      for (const [simplified, traditional] of Object.entries(conversionMap)) {
        const regex = new RegExp(simplified, 'g');
        result = result.replace(regex, traditional);
      }
      return result;
    };
  }

  convert(text) {
    if (!this.isReady || !this.converter) {
      return text;
    }
    try {
      return this.converter(text);
    } catch (error) {
      console.error('轉換錯誤:', error);
      return text;
    }
  }

  hasSimplifiedChinese(text) {
    if (!text || typeof text !== 'string') {
      return false;
    }
    const simplifiedChars = /[这个们来说对为会应时间过还没让开关发学习写读听买卖长热轻难简复杂旧丑干湿坏计算机软件硬件网络程序数据信息系统]/;
    return simplifiedChars.test(text);
  }

  smartConvert(text) {
    if (!this.hasSimplifiedChinese(text)) {
      return text;
    }
    return this.convert(text);
  }
}

// 初始化 OpenCC 轉換器
const openccConverter = new OpenCCBrowser();

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
}

/**
 * 文字處理工具
 */
class TextProcessor {
  /**
   * 清理和格式化文字
   */
  static cleanText(text) {
    if (!text) return '';
    
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[\r\n\t]/g, ' ');
  }

  /**
   * 轉換簡體中文為繁體中文
   */
  static convertToTraditional(text) {
    if (!text) return text;
    return openccConverter.smartConvert(text);
  }

  /**
   * 格式化輸出文字
   */
  static formatOutput(title, url, options = {}) {
    const cleanTitle = this.cleanText(title);
    const cleanUrl = this.cleanText(url);
    
    // 如果啟用簡體轉繁體
    if (options.convertToTraditional) {
      const convertedTitle = this.convertToTraditional(cleanTitle);
      return `${convertedTitle} ${cleanUrl}`;
    }
    
    return `${cleanTitle} ${cleanUrl}`;
  }
}

/**
 * 剪貼簿操作
 */
class ClipboardManager {
  /**
   * 複製文字到剪貼簿
   */
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      Logger.info('文字已複製到剪貼簿', { text: text.substring(0, 100) + '...' });
      return true;
    } catch (error) {
      Logger.error('複製到剪貼簿失敗', error);
      return false;
    }
  }
}

/**
 * 頁面資訊擷取器
 */
class PageInfoExtractor {
  /**
   * 從分頁中擷取頁面資訊
   */
  static async extractPageInfo(tab) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          return {
            title: document.title || '',
            url: window.location.href || '',
            timestamp: new Date().toISOString()
          };
        }
      });

      if (results && results[0] && results[0].result) {
        return results[0].result;
      }

      // 如果腳本執行失敗，使用分頁的基本資訊
      return {
        title: tab.title || '',
        url: tab.url || '',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      Logger.error('擷取頁面資訊失敗', error);
      
      // 回退到分頁基本資訊
      return {
        title: tab.title || '',
        url: tab.url || '',
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * 主要功能處理器
 */
class ExtensionHandler {
  /**
   * 處理文字複製請求
   */
  static async handleCopyRequest(options = {}) {
    try {
      Logger.info('開始處理文字複製請求');

      // 獲取當前活動分頁
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tabs || tabs.length === 0) {
        throw new Error('無法獲取當前分頁');
      }

      const currentTab = tabs[0];
      Logger.debug('當前分頁資訊', { 
        title: currentTab.title, 
        url: currentTab.url 
      });

      // 擷取頁面資訊
      const pageInfo = await PageInfoExtractor.extractPageInfo(currentTab);
      Logger.debug('擷取的頁面資訊', pageInfo);

      // 格式化輸出文字
      const formattedText = TextProcessor.formatOutput(
        pageInfo.title, 
        pageInfo.url,
        options
      );

      // 複製到剪貼簿
      const success = await ClipboardManager.copyToClipboard(formattedText);

      if (success) {
        Logger.info('文字複製成功', { 
          output: formattedText.substring(0, 100) + '...',
          convertedToTraditional: options.convertToTraditional || false
        });
        
        // 顯示成功通知
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: EXTENSION_NAME,
          message: options.convertToTraditional ? 
            '頁面資訊已複製（已轉換為繁體中文）' : 
            '頁面資訊已複製到剪貼簿'
        });

        return { success: true, text: formattedText };
      } else {
        throw new Error('複製到剪貼簿失敗');
      }

    } catch (error) {
      Logger.error('處理文字複製請求失敗', error);
      
      // 顯示錯誤通知
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: EXTENSION_NAME,
        message: '複製失敗：' + error.message
      });

      return { success: false, error: error.message };
    }
  }
}

/**
 * 事件監聽器
 */

// 擴充功能圖示點擊事件
chrome.action.onClicked.addListener(async (tab) => {
  Logger.info('擴充功能圖示被點擊');
  await ExtensionHandler.handleCopyRequest();
});

// 右鍵選單點擊事件（如果有的話）
chrome.contextMenus?.onClicked?.addListener(async (info, tab) => {
  if (info.menuItemId === 'copy-page-info') {
    Logger.info('右鍵選單被點擊');
    await ExtensionHandler.handleCopyRequest();
  } else if (info.menuItemId === 'copy-page-info-traditional') {
    Logger.info('右鍵選單被點擊（轉換為繁體）');
    await ExtensionHandler.handleCopyRequest({ convertToTraditional: true });
  }
});

// 擴充功能安裝事件
chrome.runtime.onInstalled.addListener((details) => {
  Logger.info('擴充功能已安裝', { reason: details.reason });
  
  // 創建右鍵選單（可選）
  try {
    chrome.contextMenus.create({
      id: 'copy-page-info',
      title: '複製頁面資訊',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'copy-page-info-traditional',
      title: '複製頁面資訊（轉繁體）',
      contexts: ['page']
    });
    
    Logger.info('右鍵選單已創建');
  } catch (error) {
    Logger.warn('創建右鍵選單失敗', error);
  }
});

// 擴充功能啟動事件
chrome.runtime.onStartup.addListener(() => {
  Logger.info('擴充功能已啟動');
});

// 訊息處理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  Logger.debug('收到訊息', request);
  
  if (request.action === 'copyPageInfo') {
    ExtensionHandler.handleCopyRequest(request.options || {})
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 保持訊息通道開啟
  }
  
  if (request.action === 'testOpenCC') {
    const testText = request.text || '这个软件很好用';
    const result = openccConverter.convert(testText);
    sendResponse({ 
      success: true, 
      original: testText, 
      converted: result,
      status: openccConverter.isReady
    });
    return true;
  }
});

Logger.info('Service Worker 已載入，OpenCC 功能已啟用');