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

function loadServiceWorker(options = {}) {
  let clickHandler;
  const executeScript = options.executeScript || jest.fn(() => Promise.resolve([]));
  const storageGet = jest.fn(() =>
    Promise.resolve({
      hasCompletedFirstCopy: options.hasCompletedFirstCopy === true
    })
  );
  const storageSet = jest.fn(() => Promise.resolve());
  const chrome = {
    action: {
      onClicked: {
        addListener: jest.fn((handler) => {
          clickHandler = handler;
        })
      },
      setBadgeText: jest.fn(() => Promise.resolve()),
      setBadgeBackgroundColor: jest.fn(() => Promise.resolve())
    },
    scripting: { executeScript },
    storage: {
      local: {
        get: storageGet,
        set: storageSet
      }
    },
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

  return {
    chrome,
    context,
    clickHandler,
    executeScript,
    storageGet,
    storageSet
  };
}

async function flushAsyncWork() {
  for (let index = 0; index < 4; index += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
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

function createFeedbackDocument() {
  const elementsById = new Map();

  function createElement(tagName) {
    let elementId = '';
    let ownText = '';
    const element = {
      tagName: tagName.toUpperCase(),
      style: {},
      children: [],
      attributes: {},
      listeners: {},
      parentNode: null,
      appendChild(child) {
        this.children.push(child);
        child.parentNode = this;
        return child;
      },
      setAttribute(name, value) {
        this.attributes[name] = value;
      },
      addEventListener(name, listener) {
        this.listeners[name] = listener;
      },
      remove() {
        if (this.parentNode) {
          this.parentNode.children = this.parentNode.children.filter(
            (child) => child !== this
          );
        }
        if (elementId) {
          elementsById.delete(elementId);
        }
      },
      querySelector(selector) {
        const tag = selector.toUpperCase();
        const queue = [...this.children];
        while (queue.length > 0) {
          const child = queue.shift();
          if (child.tagName === tag) {
            return child;
          }
          queue.push(...child.children);
        }
        return null;
      },
      select: jest.fn()
    };

    Object.defineProperty(element, 'id', {
      get: () => elementId,
      set: (value) => {
        if (elementId) {
          elementsById.delete(elementId);
        }
        elementId = value;
        if (value) {
          elementsById.set(value, element);
        }
      }
    });
    Object.defineProperty(element, 'textContent', {
      get: () =>
        ownText + element.children.map((child) => child.textContent).join(''),
      set: (value) => {
        ownText = String(value);
        element.children = [];
      }
    });

    return element;
  }

  const documentElement = createElement('html');
  const body = createElement('body');
  documentElement.appendChild(body);

  return {
    body,
    documentElement,
    createElement: jest.fn(createElement),
    getElementById: jest.fn((id) => elementsById.get(id) || null)
  };
}

describe('service worker copy flow', () => {
  test('first successful toolbar click shows onboarding feedback and remembers it', async () => {
    const executeScript = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          result: {
            success: true,
            text: 'Example Domain https://example.com/',
            error: null,
            method: 'clipboard'
          }
        }
      ])
      .mockResolvedValueOnce([]);
    const worker = loadServiceWorker({ executeScript });

    worker.clickHandler({
      id: 7,
      url: 'https://example.com/',
      title: 'Example Domain'
    });
    await flushAsyncWork();

    expect(worker.storageGet).toHaveBeenCalledWith('hasCompletedFirstCopy');
    expect(worker.storageSet).toHaveBeenCalledWith({
      hasCompletedFirstCopy: true
    });
    expect(executeScript).toHaveBeenCalledTimes(3);
    expect(executeScript.mock.calls[2][0]).toEqual(
      expect.objectContaining({
        target: { tabId: 7 },
        args: [true]
      })
    );
    expect(worker.chrome.notifications.create).not.toHaveBeenCalled();

    const document = createFeedbackDocument();
    worker.context.document = document;
    worker.context.setTimeout.mockClear();
    executeScript.mock.calls[2][0].func(true);

    const toast = document.getElementById('quick-text-copy-toast');
    expect(toast.textContent).toContain(
      '✓ 已成功複製標題與網址！以後點一下工具列圖示即可。'
    );
    const closeButton = toast.querySelector('button');
    expect(closeButton.attributes['aria-label']).toBe('關閉提示');
    closeButton.listeners.click();
    expect(document.getElementById('quick-text-copy-toast')).toBeNull();
    expect(worker.context.setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      5000
    );
  });

  test('later toolbar clicks show brief feedback and a temporary success badge', async () => {
    const executeScript = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          result: {
            success: true,
            text: 'Example Domain https://example.com/',
            error: null,
            method: 'clipboard'
          }
        }
      ])
      .mockResolvedValueOnce([]);
    const worker = loadServiceWorker({
      executeScript,
      hasCompletedFirstCopy: true
    });

    worker.clickHandler({
      id: 8,
      url: 'https://example.com/',
      title: 'Example Domain'
    });
    await flushAsyncWork();

    expect(worker.storageSet).not.toHaveBeenCalled();
    expect(executeScript).toHaveBeenCalledTimes(3);
    expect(executeScript.mock.calls[2][0].args).toEqual([false]);
    expect(worker.chrome.action.setBadgeText).toHaveBeenCalledWith({
      tabId: 8,
      text: '✓'
    });
    const badgeClearTimer = worker.context.setTimeout.mock.calls.find(
      ([, delay]) => delay === 1800
    );
    expect(badgeClearTimer).toBeDefined();
    badgeClearTimer[0]();
    expect(worker.chrome.action.setBadgeText).toHaveBeenLastCalledWith({
      tabId: 8,
      text: ''
    });

    const document = createFeedbackDocument();
    worker.context.document = document;
    worker.context.setTimeout.mockClear();
    executeScript.mock.calls[2][0].func(false);

    const toast = document.getElementById('quick-text-copy-toast');
    expect(toast.textContent).toBe('✓ 已複製標題與網址');
    expect(toast.querySelector('button')).toBeNull();
    expect(worker.context.setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      1600
    );
  });

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
