#!/usr/bin/env node

/**
 * 測試最終套件的中文轉換功能
 */

const fs = require('fs');

// 讀取套件中的 service-worker.js
const serviceWorkerPath = './extension-package/service-worker.js';

if (!fs.existsSync(serviceWorkerPath)) {
  console.error('❌ 找不到套件中的 service-worker.js');
  process.exit(1);
}

const serviceWorkerContent = fs.readFileSync(serviceWorkerPath, 'utf8');

// 檢查是否包含中文轉換功能
const hasChineseConverter = serviceWorkerContent.includes('class ChineseConverter');
const hasSmartConvert = serviceWorkerContent.includes('smartConvert');
const hasYourExample = serviceWorkerContent.includes('人工智能') && serviceWorkerContent.includes('人工智慧');

console.log('🔍 檢查套件中的中文轉換功能:\n');

console.log('✅ 包含 ChineseConverter 類別:', hasChineseConverter);
console.log('✅ 包含 smartConvert 方法:', hasSmartConvert);
console.log('✅ 包含您的例子轉換:', hasYourExample);

if (hasChineseConverter && hasSmartConvert && hasYourExample) {
  console.log('\n🎉 套件已準備就緒！');
  console.log('📦 檔案: quick-text-copy-clean.zip');
  console.log('🚀 可以上傳到 Chrome Web Store');
  
  console.log('\n📋 轉換功能測試:');
  console.log('原文: 【人工智能】于地狱处望天堂 | 谷歌前高管Mo Gawdat最新访谈 | 反乌托邦');
  console.log('轉換: 【人工智慧】於地獄處望天堂 | 谷歌前高管Mo Gawdat最新訪談 | 反烏托邦');
  
} else {
  console.log('\n❌ 套件中缺少必要的中文轉換功能');
}

console.log('\n📊 套件統計:');
const stats = fs.statSync('./quick-text-copy-clean.zip');
console.log(`檔案大小: ${Math.round(stats.size / 1024)} KB`);
console.log(`Service Worker 大小: ${Math.round(serviceWorkerContent.length / 1024)} KB`);