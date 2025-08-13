/**
 * OpenCC-JS 簡體轉繁體轉換器
 * 使用 WASM 實現高效準確的中文轉換
 * 預設配置：s2twp (簡體中文轉台灣繁體含慣用詞)
 */

const OpenCC = require('opencc-js');

class OpenCCConverter {
  constructor(config = { from: 'cn', to: 'twp' }) {
    try {
      // 初始化 OpenCC 轉換器，預設使用 cn2twp 配置 (簡體中文轉台灣繁體含慣用詞)
      this.converter = OpenCC.Converter(config);
      this.config = config;
      this.isReady = true;
    } catch (error) {
      console.error('OpenCC 初始化失敗:', error);
      this.isReady = false;
      this.converter = null;
      this.config = null;
    }
  }

  /**
   * 簡體轉繁體 (預設 s2twp)
   * @param {string} text - 要轉換的簡體中文文字
   * @returns {string} 轉換後的繁體中文文字
   */
  convert(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    if (!this.isReady || !this.converter) {
      console.warn('OpenCC 轉換器未就緒');
      return text;
    }

    try {
      return this.converter(text);
    } catch (error) {
      console.error('OpenCC 轉換錯誤:', error);
      return text; // 轉換失敗時返回原文
    }
  }

  /**
   * 批量轉換文字陣列
   * @param {string[]} textArray - 要轉換的文字陣列
   * @returns {string[]} 轉換後的文字陣列
   */
  convertArray(textArray) {
    if (!Array.isArray(textArray)) {
      return textArray;
    }

    return textArray.map(text => this.convert(text));
  }

  /**
   * 檢測文字是否包含簡體中文字符
   * @param {string} text - 要檢測的文字
   * @returns {boolean} 是否包含簡體中文
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
   * 智慧轉換：只轉換包含簡體字的文字
   * @param {string} text - 要轉換的文字
   * @returns {string} 轉換結果
   */
  smartConvert(text) {
    if (!this.hasSimplifiedChinese(text)) {
      return text; // 沒有簡體字，直接返回
    }
    return this.convert(text);
  }

  /**
   * 獲取轉換器狀態
   * @returns {object} 轉換器狀態資訊
   */
  getStatus() {
    return {
      isReady: this.isReady,
      config: this.config,
      description: '簡體中文轉台灣繁體中文 (使用 OpenCC WASM)'
    };
  }
}

module.exports = OpenCCConverter;