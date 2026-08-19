/**
 * Quick Text Copy - Service Worker (v1.2.4)
 * 整合專業 OpenCC-JS 引擎，支援本地精準簡繁轉換
 */

const EXTENSION_NAME = 'Quick Text Copy';
const FIRST_COPY_KEY = 'hasCompletedFirstCopy';

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
 * 在目前頁面顯示複製成功提示。
 */
async function showCopyFeedback(tabId, isFirstCopy) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (isFirstCopy) => {
      const toastId = 'quick-text-copy-toast';
      document.getElementById(toastId)?.remove();

      const toast = document.createElement('div');
      toast.id = toastId;
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '2147483647',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        maxWidth: '360px',
        padding: '14px 16px',
        borderRadius: '10px',
        color: '#ffffff',
        background: '#137333',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.28)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '14px',
        lineHeight: '1.5'
      });

      const message = document.createElement('span');
      message.textContent = isFirstCopy
        ? '✓ 已成功複製標題與網址！以後點一下工具列圖示即可。'
        : '✓ 已複製標題與網址';
      toast.appendChild(message);

      if (isFirstCopy) {
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.textContent = '×';
        closeButton.setAttribute('aria-label', '關閉提示');
        Object.assign(closeButton.style, {
          border: '0',
          padding: '0',
          color: '#ffffff',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '20px',
          lineHeight: '1'
        });
        closeButton.addEventListener('click', () => toast.remove());
        toast.appendChild(closeButton);
      }

      document.documentElement.appendChild(toast);
      setTimeout(() => toast.remove(), isFirstCopy ? 5000 : 1600);
    },
    args: [isFirstCopy]
  });
}

/**
 * 使用工具列徽章提供不受系統通知設定影響的成功回饋。
 */
async function showSuccessBadge(tabId) {
  await Promise.all([
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#137333' }),
    chrome.action.setBadgeText({ tabId, text: '✓' })
  ]);

  setTimeout(() => {
    chrome.action.setBadgeText({ tabId, text: '' });
  }, 1800);
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
      func: async (originalTitle, originalUrl) => {
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
            converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
          } else {
            // 防呆處理
            throw new Error('找不到 OpenCC.Converter 方法');
          }
          
          // 轉換標題 (過濾數字前綴，如 (3) )
          const cleanTitle = String(originalTitle || '').trim().replace(/^\(\d+\)\s*/, '');
          const convertedTitle = converter(cleanTitle);
          const formattedText = `${convertedTitle} ${originalUrl}`;

          const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
          let clipboardError = null;
          if (clipboard && typeof clipboard.writeText === 'function') {
            try {
              await clipboard.writeText(formattedText);
              return {
                success: true,
                text: formattedText,
                error: null,
                method: 'clipboard'
              };
            } catch (error) {
              // Clipboard API 受頁面安全內容或權限限制時，繼續使用 fallback。
              clipboardError = error;
            }
          }

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
            success,
            text: formattedText,
            error: success
              ? null
              : [
                  clipboardError
                    ? `Clipboard API 失敗：${clipboardError.message || clipboardError}`
                    : null,
                  'execCommand 失敗'
                ]
                  .filter(Boolean)
                  .join('；'),
            method: 'execCommand'
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

      try {
        const storedState = await chrome.storage.local.get(FIRST_COPY_KEY);
        const isFirstCopy = storedState[FIRST_COPY_KEY] !== true;
        await Promise.all([
          showCopyFeedback(tab.id, isFirstCopy),
          showSuccessBadge(tab.id)
        ]);
        if (isFirstCopy) {
          await chrome.storage.local.set({ [FIRST_COPY_KEY]: true });
        }
      } catch (feedbackError) {
        Logger.warn('複製成功提示顯示失敗', feedbackError);
      }
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

Logger.info('Quick Text Copy v1.2.4 (專業版) 已啟動');
