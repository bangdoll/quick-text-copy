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

    // 1. 注入 OpenCC 函式庫 (本地檔案)
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['lib/opencc.js']
    });

    // 2. 注入並執行轉換邏輯
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (originalTitle, originalUrl) => {
        return new Promise((resolve) => {
          try {
            // 初始化 OpenCC (s2t: 簡體到繁體標準)
            const converter = new OpenCC('s2t.json');
            
            // 轉換標題 (過濾掉常見的數字前綴，如 (3) )
            const cleanTitle = originalTitle.trim().replace(/^\(\d+\)\s*/, '');
            
            // 執行轉換
            converter.convertPromise(cleanTitle).then(convertedTitle => {
              const finalTitle = convertedTitle || cleanTitle;
              const formattedText = `${finalTitle} ${originalUrl}`;

              // 複製到剪貼簿
              const textarea = document.createElement('textarea');
              textarea.value = formattedText;
              textarea.style.position = 'fixed';
              textarea.style.opacity = '0';
              document.body.appendChild(textarea);
              textarea.select();
              const success = document.execCommand('copy');
              document.body.removeChild(textarea);

              resolve({
                success,
                text: formattedText,
                method: 'opencc-js-local'
              });
            });
          } catch (err) {
            resolve({ success: false, error: err.message });
          }
        });
      },
      args: [tab.title, tab.url]
    });

    if (results && results[0] && results[0].result && results[0].result.success) {
      const text = results[0].result.text;
      Logger.info('複製成功', text);
      await showNotification('✓ 複製成功 (專業版)', `已轉換並複製：${text.substring(0, 40)}...`);
    } else {
      throw new Error(results?.[0]?.result?.error || '腳本執行失敗');
    }

  } catch (error) {
    Logger.error('流程失敗', error);
    await showNotification('✗ 複製失敗', `原因：${error.message}\n請嘗試重新整理頁面。`, 'error');
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
