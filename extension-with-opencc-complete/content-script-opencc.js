/**
 * Content Script for OpenCC Chinese Conversion
 * 使用內建 OpenCC 核心處理簡體轉繁體轉換
 */

// 全域變數
let openccInstance = null;
let isOpenCCReady = false;

/**
 * 初始化內建 OpenCC 核心
 */
async function initializeOpenCC() {
  try {
    if (isOpenCCReady && openccInstance) {
      return true;
    }

    console.log('[OpenCC] 開始初始化內建核心');
    
    // 檢查是否已經載入 OpenCC 核心
    if (typeof OpenCCCore !== 'undefined') {
      openccInstance = new OpenCCCore();
      isOpenCCReady = true;
      console.log('[OpenCC] 內建核心初始化成功');
      return true;
    } else {
      throw new Error('OpenCC 核心未載入');
    }
    
  } catch (error) {
    console.error('[OpenCC] 初始化失敗', error);
    isOpenCCReady = false;
    openccInstance = null;
    return false;
  }
}

/**
 * 使用 OpenCC 轉換文字
 */
async function convertWithOpenCC(text) {
  try {
    if (!text || typeof text !== 'string') {
      return text;
    }

    // 確保 OpenCC 已初始化
    const initialized = await initializeOpenCC();
    if (!initialized || !openccInstance) {
      console.warn('[OpenCC] 未初始化，返回原文');
      return text;
    }

    // 執行轉換
    const convertedText = openccInstance.convert(text);
    
    if (convertedText && convertedText !== text) {
      console.log('[OpenCC] 轉換完成', {
        original: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        converted: convertedText.substring(0, 50) + (convertedText.length > 50 ? '...' : '')
      });
      
      return convertedText;
    } else {
      return text;
    }
    
  } catch (error) {
    console.error('[OpenCC] 轉換失敗，返回原文', error);
    return text;
  }
}

/**
 * 複製文字到剪貼簿（支援 OpenCC 轉換）
 */
async function copyTextWithOpenCC(title, url) {
  try {
    console.log('[OpenCC] 開始處理文字複製');
    
    // 清理標題
    let cleanTitle = title.trim().replace(/\s+/g, ' ');
    
    // 過濾標題開頭的數字標記
    const numberPrefixPatterns = [
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

    for (const pattern of numberPrefixPatterns) {
      if (pattern.test(cleanTitle)) {
        cleanTitle = cleanTitle.replace(pattern, '').trim();
        break;
      }
    }

    // 使用 OpenCC 轉換簡體中文
    const convertedTitle = await convertWithOpenCC(cleanTitle);
    
    // 清理網址
    const cleanUrl = url.trim();
    
    // 檢查標題長度
    const maxTitleLength = 150;
    const truncatedTitle = convertedTitle.length > maxTitleLength 
      ? convertedTitle.substring(0, maxTitleLength) + '...'
      : convertedTitle;

    // 組合格式：標題 網址
    const formattedText = `${truncatedTitle} ${cleanUrl}`;
    
    // 複製到剪貼簿
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(formattedText);
      console.log('[OpenCC] 使用 Clipboard API 複製成功');
      return { success: true, method: 'clipboard-api', text: formattedText };
    } else {
      // 使用傳統方法
      const textarea = document.createElement('textarea');
      textarea.value = formattedText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      console.log('[OpenCC] 使用 execCommand 複製', success ? '成功' : '失敗');
      return { success, method: 'execCommand', text: formattedText };
    }
    
  } catch (error) {
    console.error('[OpenCC] 複製過程發生錯誤', error);
    return { success: false, error: error.message };
  }
}

// 監聽來自 service worker 的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyWithOpenCC') {
    copyTextWithOpenCC(request.title, request.url)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        console.error('[OpenCC] 處理訊息時發生錯誤', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // 返回 true 表示會異步回應
    return true;
  }
});

// 預先初始化 OpenCC
initializeOpenCC().then(success => {
  if (success) {
    console.log('[OpenCC] Content Script 預先初始化成功');
  } else {
    console.warn('[OpenCC] Content Script 預先初始化失敗');
  }
}).catch(error => {
  console.error('[OpenCC] Content Script 初始化錯誤', error);
});

console.log('[OpenCC] Content Script 已載入');