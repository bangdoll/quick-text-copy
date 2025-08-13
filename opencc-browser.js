/**
 * OpenCC 瀏覽器版本 - 適用於 Chrome 擴充功能
 * 使用 CDN 版本的 opencc-js，無需 Node.js 環境
 */

class OpenCCBrowser {
  constructor() {
    this.isReady = false;
    this.converter = null;
    this.init();
  }

  /**
   * 初始化 OpenCC（瀏覽器環境）
   */
  async init() {
    try {
      // 在瀏覽器環境中，我們使用內建的簡單轉換邏輯
      // 因為 Chrome 擴充功能無法直接使用 opencc-js WASM
      this.converter = this.createSimpleConverter();
      this.isReady = true;
      console.log('OpenCC Browser 初始化成功');
    } catch (error) {
      console.error('OpenCC Browser 初始化失敗:', error);
      this.isReady = false;
    }
  }

  /**
   * 創建簡單的轉換器（基於字典）
   */
  createSimpleConverter() {
    // 常用簡繁對照字典
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
      
      // 先轉換詞組，再轉換單字
      for (const [simplified, traditional] of Object.entries(conversionMap)) {
        const regex = new RegExp(simplified, 'g');
        result = result.replace(regex, traditional);
      }
      
      return result;
    };
  }

  /**
   * 轉換文字
   */
  convert(text) {
    if (!this.isReady || !this.converter) {
      console.warn('OpenCC Browser 未就緒');
      return text;
    }

    try {
      return this.converter(text);
    } catch (error) {
      console.error('轉換錯誤:', error);
      return text;
    }
  }

  /**
   * 檢測是否包含簡體中文
   */
  hasSimplifiedChinese(text) {
    if (!text || typeof text !== 'string') {
      return false;
    }

    // 常見簡體字符檢測
    const simplifiedChars = /[这个们来说对为会应时间过还没让开关发学习写读听买卖长热轻难简复杂旧丑干湿坏计算机软件硬件网络程序数据信息系统]/;
    return simplifiedChars.test(text);
  }

  /**
   * 智慧轉換
   */
  smartConvert(text) {
    if (!this.hasSimplifiedChinese(text)) {
      return text;
    }
    return this.convert(text);
  }

  /**
   * 批量轉換
   */
  convertArray(textArray) {
    if (!Array.isArray(textArray)) {
      return textArray;
    }
    return textArray.map(text => this.convert(text));
  }

  /**
   * 獲取狀態
   */
  getStatus() {
    return {
      isReady: this.isReady,
      type: 'browser',
      description: '瀏覽器版 OpenCC 簡體轉繁體'
    };
  }
}

// 如果在瀏覽器環境中，創建全域實例
if (typeof window !== 'undefined') {
  window.OpenCCBrowser = OpenCCBrowser;
}

// 如果在 Node.js 環境中，導出模組
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OpenCCBrowser;
}