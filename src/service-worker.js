/**
 * Quick Text Copy - Service Worker (v1.2.0)
 * 整合專業 OpenCC-JS 引擎，支援本地精準簡繁轉換
 */

const EXTENSION_NAME = 'Quick Text Copy';

/**
 * 日誌系統
 */
const Logger = {
  info: (msg, data) => console.log(`[${new Date().toISOString()}] [INFO] ${msg}`, data || ''),
  error: (msg, err) => console.error(`[${new Date().toISOString()}] [ERROR] ${msg}`, err || ''),
  warn: (msg, data) => console.warn(`[${new Date().toISOString()}] [WARN] ${msg}`, data || '')
};

/**
 * 處理通知
 */
async function showNotification(title, message, type = 'success') {
  const icon = type === 'success' ? 'icons/icon128.png' : 'icons/icon128.png'; // 這裡可以使用不同圖標
  const notificationId = await chrome.notifications.create({
    type: 'basic',
    iconUrl: icon,
    title: title,
    message: message,
    priority: type === 'error' ? 2 : 1
  });
  
  setTimeout(() => chrome.notifications.clear(notificationId), 3000);
}

/**
 * 核心：執行轉換與複製
 */
async function performCopy(tab) {
  try {
    Logger.info('開始複製流程', { tabId: tab.id, url: tab.url });

    // 1. 注入 OpenCC 函式庫
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['lib/opencc.js']
    });

    // 2. 執行轉換與複製邏輯
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (originalTitle, originalUrl) => {
        try {
          // 檢查 OpenCC 是否正確加載
          if (typeof OpenCC === 'undefined') {
            throw new Error('OpenCC 函式庫未正確載入');
          }

          // 初始化轉換器 (簡轉繁)
          // 根據 lib/opencc.js 內容，使用內建的工廠方法
          // 注意：本專案 lib/opencc.js 已內建字典，無需額外 fetch
          let converter;
          if (typeof OpenCC.Converter === 'function') {
            converter = OpenCC.Converter({ from: 's', to: 't' });
          } else {
            // 防呆處理
            throw new Error('找不到 OpenCC.Converter 方法');
          }
          
          // 轉換標題 (過濾數字前綴，如 (3) )
          const cleanTitle = originalTitle.trim().replace(/^\(\d+\)\s*/, '');
          const convertedTitle = converter(cleanTitle);
          const formattedText = `${convertedTitle} ${originalUrl}`;

          // 使用最可靠的複製方式：建立臨時元素並執行 copy
          // navigator.clipboard 在未聚焦分頁或 HTTP 網頁上可能失敗
          const textarea = document.createElement('textarea');
          textarea.value = formattedText;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          const success = document.execCommand('copy');
          document.body.removeChild(textarea);

          return {
            success: success,
            text: formattedText,
            error: success ? null : 'execCommand 失敗'
          };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },
      args: [tab.title, tab.url]
    });

    if (results && results[0] && results[0].result && results[0].result.success) {
      const text = results[0].result.text;
      Logger.info('複製成功', text);
      await showNotification('✓ 複製成功 (專業版)', `已轉換：${text.substring(0, 40)}...`);
    } else {
      const errorMsg = results?.[0]?.result?.error || '腳本執行無回應';
      throw new Error(errorMsg);
    }

  } catch (error) {
    Logger.error('流程失敗', error);
    await showNotification('✗ 複製失敗', `原因：${error.message}`, 'error');
  }
}

/**
 * 監聽點擊事件
 */
chrome.action.onClicked.addListener((tab) => {
  // 排除特殊頁面
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
    showNotification('⚠ 無法使用', '此擴充功能無法在瀏覽器內部頁面上運作。', 'error');
    return;
  }
  
  performCopy(tab);
});

Logger.info('Quick Text Copy v1.2.0 (專業版) 已啟動');
