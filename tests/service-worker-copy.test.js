/**
 * @jest-environment node
 */

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const serviceWorkerSource = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'service-worker.js'),
  'utf8'
);
const openccSource = fs.readFileSync(
  path.join(__dirname, '..', 'lib', 'opencc.js'),
  'utf8'
);

function loadOpenCC() {
  const module = { exports: {} };
  const context = vm.createContext({ module, exports: module.exports });
  vm.runInContext(openccSource, context, { filename: 'lib/opencc.js' });
  return module.exports;
}

function loadServiceWorker() {
  let clickHandler;
  const executeScript = jest.fn(() => Promise.resolve([]));
  const chrome = {
    action: {
      onClicked: {
        addListener: jest.fn((handler) => {
          clickHandler = handler;
        })
      }
    },
    scripting: { executeScript },
    notifications: {
      create: jest.fn(() => Promise.resolve('notification-id')),
      clear: jest.fn()
    }
  };
  const context = vm.createContext({
    chrome,
    console: { log: jest.fn(), error: jest.fn(), warn: jest.fn() },
    setTimeout: jest.fn(),
    OpenCC: loadOpenCC()
  });

  vm.runInContext(serviceWorkerSource, context, {
    filename: 'src/service-worker.js'
  });

  return { context, clickHandler, executeScript };
}

async function getInjectedCopyFunction() {
  const worker = loadServiceWorker();
  worker.clickHandler({ id: 1, url: 'https://example.com/article', title: '測試頁面' });
  await new Promise((resolve) => setImmediate(resolve));

  const call = worker.executeScript.mock.calls.find(
    ([details]) => typeof details.func === 'function'
  );
  expect(call).toBeDefined();

  return { ...worker, copyPageInfo: call[0].func };
}

function createDocument(execCommand) {
  const textarea = {
    style: {},
    select: jest.fn(),
    value: ''
  };

  return {
    createElement: jest.fn(() => textarea),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn()
    },
    execCommand
  };
}

describe('service worker copy flow', () => {
  test('converts a simplified Chinese title before copying', async () => {
    const worker = await getInjectedCopyFunction();
    worker.context.document = createDocument(jest.fn(() => true));
    worker.context.navigator = { clipboard: undefined };

    const result = await worker.copyPageInfo(
      '測試頁面',
      'https://example.com/article'
    );

    expect(result).toEqual({
      success: true,
      text: '測試頁面 https://example.com/article',
      error: null,
      method: 'execCommand'
    });
  });

  test('uses the Clipboard API when it is available', async () => {
    const worker = await getInjectedCopyFunction();
    const execCommand = jest.fn(() => true);
    const writeText = jest.fn(() => Promise.resolve());
    worker.context.document = createDocument(execCommand);
    worker.context.navigator = { clipboard: { writeText } };

    const result = await worker.copyPageInfo(
      '测试页面',
      'https://example.com/article'
    );

    expect(writeText).toHaveBeenCalledWith(
      '測試頁面 https://example.com/article'
    );
    expect(execCommand).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      text: '測試頁面 https://example.com/article',
      error: null,
      method: 'clipboard'
    });
  });

  test('reports both errors when Clipboard API and fallback fail', async () => {
    const worker = await getInjectedCopyFunction();
    const execCommand = jest.fn(() => false);
    const writeText = jest.fn(() =>
      Promise.reject(new Error('NotAllowedError'))
    );
    worker.context.document = createDocument(execCommand);
    worker.context.navigator = { clipboard: { writeText } };

    const result = await worker.copyPageInfo(
      '测试页面',
      'https://example.com/article'
    );

    expect(execCommand).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(result.method).toBe('execCommand');
    expect(result.error).toContain('Clipboard API 失敗：NotAllowedError');
    expect(result.error).toContain('execCommand 失敗');
  });
});
