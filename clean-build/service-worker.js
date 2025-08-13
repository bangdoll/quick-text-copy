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
   * 格式化文字內容
   * 格式：標題 網址
   * 例如：蔡正信教練的電腦教學經驗 https://rd.coach/teaching-experience/
   */
  static formatText(title, url) {
    try {
      // 輸入驗證
      if (!title || typeof title !== 'string') {
        throw new Error('標題必須是非空字串');
      }
      
      if (!url || typeof url !== 'string') {
        throw new Error('網址必須是非空字串');
      }

      // 清理標題（移除多餘空白）
      const cleanTitle = title.trim().replace(/\s+/g, ' ');
      
      // 清理網址（移除多餘空白）
      const cleanUrl = url.trim();
      
      // 檢查標題長度，避免過長
      const maxTitleLength = 150;
      const truncatedTitle = cleanTitle.length > maxTitleLength 
        ? cleanTitle.substring(0, maxTitleLength) + '...'
        : cleanTitle;

      // 組合格式：標題 網址
      const formattedText = `${truncatedTitle} ${cleanUrl}`;
      
      Logger.debug('文字格式化完成', {
        originalTitle: title,
        cleanTitle: truncatedTitle,
        url: cleanUrl,
        formattedText: formattedText
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
      
      // 格式化文字
      const formattedText = this.formatText(activeTab.title, activeTab.url);
      
      const textInfo = {
        formattedText: formattedText,
        originalTitle: activeTab.title,
        url: activeTab.url,
        tabId: activeTab.id
      };
      
      Logger.info('分頁文字資訊處理完成', textInfo);
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