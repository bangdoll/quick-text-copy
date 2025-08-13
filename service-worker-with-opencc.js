/**
 * Chrome 文字複製擴充功能 Service Worker (使用 OpenCC)
 * 提供快速複製頁面資訊到剪貼簿的功能，支援 OpenCC 簡體轉繁體
 * 
 * 輸出格式：標題 網址
 * 例如：蔡正信教練的電腦教學經驗 https://rd.coach/teaching-experience/
 */

// 常數定義
const EXTENSION_NAME = 'Quick Text Copy';
const OPERATION_TIMEOUT = 5000; // 5秒操作逾時（OpenCC 需要更多時間）

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
 * OpenCC 簡體轉繁體轉換器
 * 使用 OpenCC 進行高品質的中文轉換
 */
class OpenCCConverter {
  static isInitialized = false;
  static opencc = null;

  /**
   * 初始化 OpenCC
   */
  static async initialize() {
    if (this.isInitialized && this.opencc) {
      return true;
    }

    try {
      Logger.info('開始初始化 OpenCC 轉換器');
      
      // 動態載入 OpenCC
      await this.loadOpenCC();
      
      if (typeof OpenCC !== 'undefined') {
        // 創建 OpenCC 實例，使用簡體轉繁體配置
        this.opencc = new OpenCC('s2t.json');
        this.isInitialized = true;
        
        Logger.info('OpenCC 轉換器初始化成功', {
          version: OpenCC.version || 'unknown',
          config: 's2t.json'
        });
        
        return true;
      } else {
        throw new Error('OpenCC 載入失敗');
      }
      
    } catch (error) {
      Logger.error('OpenCC 初始化失敗', error);
      this.isInitialized = false;
      this.opencc = null;
      return false;
    }
  }

  /**
   * 載入 OpenCC 函式庫
   */
  static async loadOpenCC() {
    return new Promise((resolve, reject) => {
      try {
        // 檢查是否已經載入
        if (typeof OpenCC !== 'undefined') {
          resolve();
          return;
        }

        // 創建 script 標籤載入 OpenCC
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.js';
        script.onload = () => {
          Logger.debug('OpenCC 腳本載入成功');
          resolve();
        };
        script.onerror = (error) => {
          Logger.error('OpenCC 腳本載入失敗', error);
          reject(new Error('無法載入 OpenCC 腳本'));
        };
        
        // 在 service worker 中，我們需要使用 importScripts
        if (typeof importScripts !== 'undefined') {
          importScripts('https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.js');
          resolve();
        } else {
          document.head.appendChild(script);
        }
        
      } catch (error) {
        Logger.error('載入 OpenCC 時發生錯誤', error);
        reject(error);
      }
    });
  }

  /**
   * 轉換簡體中文為繁體中文
   */
  static async convert(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    try {
      // 確保 OpenCC 已初始化
      const initialized = await this.initialize();
      if (!initialized || !this.opencc) {
        Logger.warn('OpenCC 未初始化，使用原文');
        return text;
      }

      // 執行轉換
      const convertedText = await this.opencc.convertPromise(text);
      
      if (convertedText && convertedText !== text) {
        Logger.info('OpenCC 轉換完成', {
          originalLength: text.length,
          convertedLength: convertedText.length,
          preview: text.substring(0, 50) + (text.length > 50 ? '...' : '')
        });
        
        return convertedText;
      } else {
        Logger.debug('文字無需轉換或轉換結果相同');
        return text;
      }
      
    } catch (error) {
      Logger.error('OpenCC 轉換失敗，使用原文', error);
      return text;
    }
  }

  /**
   * 檢測是否包含簡體中文
   */
  static containsSimplified(text) {
    if (!text || typeof text !== 'string') {
      return false;
    }

    // 簡單的簡體字檢測
    const simplifiedChars = /[这个们来说对为会应时间过还没让开关发学习写读听买卖长热轻难简复杂旧丑干湿坏已经现实际软硬网程数信系视图设开内计电]/;
    return simplifiedChars.test(text);
  }

  /**
   * 獲取轉換器狀態
   */
  static getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasOpenCC: this.opencc !== null,
      method: 'opencc-js'
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
   * 格式化文字內容（使用 OpenCC）
   */
  static async formatText(title, url) {
    try {
      if (!title || typeof title !== 'string') {
        throw new Error('標題必須是非空字串');
      }
      
      if (!url || typeof url !== 'string') {
        throw new Error('網址必須是非空字串');
      }

      // 清理標題
      let cleanTitle = title.trim().replace(/\s+/g, ' ');
      
      // 過濾標題開頭的數字標記
      const filteredTitle = this.filterNumberPrefix(cleanTitle);
      
      // 使用 OpenCC 轉換簡體中文
      const convertedTitle = await OpenCCConverter.convert(filteredTitle);
      
      // 清理網址
      const cleanUrl = url.trim();
      
      // 檢查標題長度
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
        conversionMethod: OpenCCConverter.getStatus().method
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
      
      const activeTab = await this.getCurrentActiveTab();
      
      if (!this.validateTabInfo(activeTab)) {
        throw new Error('分頁資訊驗證失敗');
      }
      
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
      
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (textToCopy) => {
          return new Promise((resolve) => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(textToCopy)
                .then(() => {
                  resolve({ success: true, method: 'clipboard-api' });
                })
                .catch((error) => {
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
    
    if (!MainEventHandler.validateTabObject(tab)) {
      Logger.warn('分頁物件驗證失敗，無法處理文字複製');
      return;
    }
    
    const result = await MainEventHandler.handleTextCopy(tab);
    
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
Logger.info('Quick Text Copy Service Worker (OpenCC) 已啟動');

// 預先初始化 OpenCC
OpenCCConverter.initialize().then(success => {
  if (success) {
    Logger.info('OpenCC 預先初始化成功');
  } else {
    Logger.warn('OpenCC 預先初始化失敗，將在需要時重試');
  }
}).catch(error => {
  Logger.error('OpenCC 預先初始化錯誤', error);
});