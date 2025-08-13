/**
 * Chrome 文字複製擴充功能 Service Worker (OpenCC 版本)
 * 與 content script 通訊來使用 OpenCC 進行簡體轉繁體轉換
 * 
 * 輸出格式：標題 網址
 * 例如：蔡正信教練的電腦教學經驗 https://rd.coach/teaching-experience/
 */

// 常數定義
const EXTENSION_NAME = 'Quick Text Copy (OpenCC)';
const OPERATION_TIMEOUT = 10000; // 10秒操作逾時（OpenCC 需要更多時間）

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
}

/**
 * OpenCC 通訊處理類別
 */
class OpenCCHandler {
  /**
   * 透過 content script 使用 OpenCC 處理文字複製
   */
  static async copyWithOpenCC(tabId, title, url) {
    try {
      Logger.info('開始透過 content script 使用 OpenCC', { 
        tabId, 
        titleLength: title.length,
        url: url.substring(0, 50) + (url.length > 50 ? '...' : '')
      });

      // 先注入 OpenCC 核心
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['opencc-core.js']
      });

      // 然後注入 content script
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content-script-opencc.js']
      });

      // 等待一下讓 content script 初始化
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 發送訊息給 content script
      const response = await chrome.tabs.sendMessage(tabId, {
        action: 'copyWithOpenCC',
        title: title,
        url: url
      });

      if (response && response.success) {
        Logger.info('OpenCC 處理成功', {
          method: response.method,
          textLength: response.text ? response.text.length : 0
        });
        return {
          success: true,
          text: response.text,
          method: response.method
        };
      } else {
        Logger.error('OpenCC 處理失敗', response);
        return {
          success: false,
          error: response ? response.error : '未知錯誤'
        };
      }

    } catch (error) {
      Logger.error('OpenCC 通訊失敗', error);
      return {
        success: false,
        error: error.message
      };
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
      Logger.info('開始主要文字複製流程 (OpenCC)', { 
        tabId: tab?.id, 
        url: tab?.url, 
        title: tab?.title 
      });

      // 驗證分頁資訊
      if (!TabInfoHandler.validateTabInfo(tab)) {
        throw new Error('分頁資訊驗證失敗');
      }

      // 使用 OpenCC 處理文字複製
      const result = await OpenCCHandler.copyWithOpenCC(
        tab.id, 
        tab.title, 
        tab.url
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (result.success) {
        Logger.info('文字複製流程完成', {
          text: result.text ? result.text.substring(0, 100) + (result.text.length > 100 ? '...' : '') : '',
          method: result.method,
          duration
        });
        
        return {
          success: true,
          action: 'copied',
          text: result.text,
          method: result.method,
          duration,
          tabInfo: {
            id: tab.id,
            title: tab.title,
            url: tab.url
          }
        };
      } else {
        Logger.warn('文字複製失敗', { 
          error: result.error,
          duration 
        });
        
        return {
          success: false,
          action: 'copy_failed',
          error: result.error,
          duration,
          tabInfo: {
            id: tab.id,
            title: tab.title,
            url: tab.url
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
        method: result.method,
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