import process from "node:process";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3001";
const DEBUG_URL = process.env.DEBUG_URL ?? "http://127.0.0.1:9222";

async function getWebSocketUrl() {
  const version = await fetch(`${DEBUG_URL}/json/version`).then((res) => res.json());
  return version.webSocketDebuggerUrl;
}

class CDPClient {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();

    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.id) {
        const pending = this.pending.get(data.id);
        if (!pending) return;
        this.pending.delete(data.id);
        if (data.error) {
          pending.reject(new Error(data.error.message));
        } else {
          pending.resolve(data.result);
        }
        return;
      }

      const listeners = this.events.get(data.method) ?? [];
      for (const listener of listeners) {
        listener(data.params);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  on(method, listener) {
    const listeners = this.events.get(method) ?? [];
    listeners.push(listener);
    this.events.set(method, listeners);
  }
}

async function connectPageClient() {
  const browserWs = await getWebSocketUrl();
  const browserClient = new CDPClient(new WebSocket(browserWs));
  await onceOpen(browserClient.ws);
  const { targetId } = await browserClient.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await browserClient.send("Target.attachToTarget", {
    targetId,
    flatten: true
  });

  const sessionClient = {
    id: 0,
    pending: new Map(),
    ws: browserClient.ws,
    send(method, params = {}) {
      const id = ++this.id;
      this.ws.send(JSON.stringify({ id, method, params, sessionId }));
      return new Promise((resolve, reject) => {
        this.pending.set(id, { resolve, reject });
      });
    }
  };

  browserClient.ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.sessionId !== sessionId || !data.id) return;
    const pending = sessionClient.pending.get(data.id);
    if (!pending) return;
    sessionClient.pending.delete(data.id);
    if (data.error) pending.reject(new Error(data.error.message));
    else pending.resolve(data.result);
  });

  return sessionClient;
}

function onceOpen(ws) {
  if (ws.readyState === WebSocket.OPEN) {
    return Promise.resolve();
  }
  return new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
}

async function initPage(client) {
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("DOM.enable");
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function navigate(client, url) {
  await client.send("Page.navigate", { url });
  await wait(1200);
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  return result.result?.value;
}

async function click(client, selector) {
  return clickAtSelector(client, selector);
}

async function domClick(client, selector) {
  const expression = `
    (() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return false;
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return true;
    })()
  `;
  return evaluate(client, expression);
}

async function clickByText(client, tagName, text) {
  const expression = `
    (() => {
      const elements = [...document.querySelectorAll(${JSON.stringify(tagName)})];
      const element = elements.find((item) => item.textContent?.trim().includes(${JSON.stringify(text)}));
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      element.scrollIntoView({ block: 'center' });
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    })()
  `;
  const point = await evaluate(client, expression);
  if (!point) return false;
  return clickPoint(client, point.x, point.y);
}

async function clickAtSelector(client, selector) {
  const expression = `
    (() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return null;
      element.scrollIntoView({ block: 'center' });
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    })()
  `;
  const point = await evaluate(client, expression);
  if (!point) return false;
  return clickPoint(client, point.x, point.y);
}

async function clickPoint(client, x, y) {
  await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "left", clickCount: 0 });
  await client.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await client.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  return true;
}

async function typeValue(client, selector, value) {
  const expression = `
    (() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return false;
      element.focus();
      const prototype = element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
      descriptor?.set?.call(element, ${JSON.stringify(value)});
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()
  `;
  return evaluate(client, expression);
}

async function textContent(client, needle) {
  const expression = `
    (() => document.body.innerText.includes(${JSON.stringify(needle)}))()
  `;
  return evaluate(client, expression);
}

async function getCardsFromStorage(client) {
  return evaluate(client, "JSON.parse(localStorage.getItem('talk2japan.cards.v1') || '[]')");
}

async function run() {
  const client = await connectPageClient();
  await initPage(client);

  const report = {
    passed: [],
    failed: [],
    changedFiles: [
      "components/card-item.tsx",
      "components/speak-button.tsx",
      "lib/tts.ts"
    ]
  };

  await navigate(client, `${BASE_URL}/`);
  await evaluate(client, "localStorage.clear()");
  await navigate(client, `${BASE_URL}/`);

  const openModalOk = await clickByText(client, "button", "添加新句子");
  if (!openModalOk) {
    report.failed.push({
      title: "无法打开添加句子弹窗",
      steps: ["打开首页", "点击第一个按钮"],
      details: "首页首个按钮没有被点开。"
    });
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  await typeValue(client, "textarea", "请问洗手间在哪里");
  await typeValue(client, "input[placeholder*='下个月东京旅行会用到']", "QA note");
  await clickByText(client, "button", "生成并保存");
  await wait(1000);

  let cards = await getCardsFromStorage(client);
  const customCard = cards.find((card) => card.notes === "QA note");
  if (customCard && customCard.chinese === "请问洗手间在哪里" && customCard.scene) {
    report.passed.push("添加自定义句子后，卡片成功写入 localStorage。");
  } else {
    report.failed.push({
      title: "自定义句子未正确写入 localStorage",
      steps: ["首页点击“添加新句子”", "输入中文句子“请问洗手间在哪里”", "填写备注“QA note”", "点击“生成并保存”"],
      details: "localStorage 中没有找到对应用户卡片。"
    });
  }

  await navigate(client, `${BASE_URL}/scenes/restaurant`);
  await evaluate(
    client,
    `
      (() => {
        const cards = JSON.parse(localStorage.getItem('talk2japan.cards.v1') || '[]');
        const next = cards.map((card) => {
          if (card.id === 'restaurant-1') {
            return { ...card, isFavorite: false, inReview: false };
          }
          return card;
        });
        localStorage.setItem('talk2japan.cards.v1', JSON.stringify(next));
        window.dispatchEvent(new Event('talk2japan:cards-updated'));
      })()
    `
  );
  await navigate(client, `${BASE_URL}/scenes/restaurant`);
  await wait(1000);
  const favoriteOk = await domClick(client, '[data-card-id="restaurant-1"] [data-action="favorite"]');
  await wait(250);
  const reviewOk = await domClick(client, '[data-card-id="restaurant-1"] [data-action="review"]');
  await wait(500);
  const immediateUiState = await evaluate(
    client,
    `
      (() => {
        const card = document.querySelector('[data-card-id="restaurant-1"]');
        if (!card) return null;
        const favoriteButton = card.querySelector('[data-action="favorite"]');
        const reviewButton = card.querySelector('[data-action="review"]');
        return {
          favoritePressed: favoriteButton?.getAttribute('aria-pressed'),
          reviewPressed: reviewButton?.getAttribute('aria-pressed'),
          favoriteText: favoriteButton?.textContent?.trim(),
          reviewText: reviewButton?.textContent?.trim()
        };
      })()
    `
  );
  cards = await getCardsFromStorage(client);
  const restaurantCard = cards.find((card) => card.id === "restaurant-1");
  await navigate(client, `${BASE_URL}/scenes/restaurant`);
  await wait(600);
  const refreshedUiState = await evaluate(
    client,
    `
      (() => {
        const card = document.querySelector('[data-card-id="restaurant-1"]');
        if (!card) return null;
        const favoriteButton = card.querySelector('[data-action="favorite"]');
        const reviewButton = card.querySelector('[data-action="review"]');
        return {
          favoritePressed: favoriteButton?.getAttribute('aria-pressed'),
          reviewPressed: reviewButton?.getAttribute('aria-pressed'),
          favoriteText: favoriteButton?.textContent?.trim(),
          reviewText: reviewButton?.textContent?.trim()
        };
      })()
    `
  );
  if (
    favoriteOk &&
    reviewOk &&
    immediateUiState?.favoritePressed === "true" &&
    immediateUiState?.reviewPressed === "true" &&
    restaurantCard?.isFavorite === true &&
    restaurantCard?.inReview === true &&
    refreshedUiState?.favoritePressed === "true" &&
    refreshedUiState?.reviewPressed === "true"
  ) {
    report.passed.push("场景页收藏和加入复习会立即更新 UI，刷新后仍保持，并且正确写入 localStorage。");
  } else {
    report.failed.push({
      title: "收藏或复习状态没有立即生效",
      steps: ["进入餐厅场景页", "点击第一张卡片的“收藏”", "点击“加入复习”", "刷新页面确认状态是否保留"],
      details: `即时UI:${JSON.stringify(immediateUiState)} 刷新后UI:${JSON.stringify(refreshedUiState)} localStorage:${JSON.stringify(restaurantCard)}`
    });
  }

  await evaluate(
    client,
    `
      (() => {
        const cards = JSON.parse(localStorage.getItem('talk2japan.cards.v1') || '[]');
        const next = cards.map((card) => {
          if (card.id === 'restaurant-1' || card.notes === 'QA note') {
            return { ...card, inReview: true, nextReviewAt: new Date(Date.now() - 60000).toISOString(), masteryLevel: 0, reviewCount: 0, difficulty: 2 };
          }
          return card;
        });
        localStorage.setItem('talk2japan.cards.v1', JSON.stringify(next));
        window.dispatchEvent(new Event('talk2japan:cards-updated'));
      })()
    `
  );

  await navigate(client, `${BASE_URL}/review`);
  const beforeFlip = await textContent(client, "点击翻面");
  const flipClicked = await click(client, "button[class*='perspective']");
  await wait(400);
  const afterFlip = await textContent(client, "トイレはどこですか。");
  await clickByText(client, "button", "会了");
  await wait(500);

  cards = await getCardsFromStorage(client);
  const reviewedCustom = cards.find((card) => card.notes === "QA note");
  const reviewQueueContainsRestaurant = await textContent(client, "不好意思，现在可以点餐吗？");
  if (
    beforeFlip &&
    flipClicked &&
    afterFlip &&
    reviewedCustom?.masteryLevel === 2 &&
    reviewedCustom?.reviewCount === 1 &&
    reviewQueueContainsRestaurant
  ) {
    report.passed.push("复习翻卡流程可用，SRS 字段会更新，而且场景页加入复习的卡片能被复习页识别。");
  } else {
    report.failed.push({
      title: "复习翻卡或 SRS 更新异常",
      steps: ["进入每日复习", "点击卡片翻面", "点击“会了”"],
      details: `翻面前:${beforeFlip} 翻面后看到答案:${afterFlip} 队列包含场景卡:${reviewQueueContainsRestaurant} 卡片状态:${JSON.stringify(reviewedCustom)}`
    });
  }

  await navigate(client, `${BASE_URL}/scenes/restaurant`);
  const ttsInfo = await evaluate(
    client,
    `
      (() => ({
        hasSpeechSynthesis: 'speechSynthesis' in window,
        voiceCount: 'speechSynthesis' in window ? window.speechSynthesis.getVoices().length : 0
      }))()
    `
  );
  await click(client, "button[aria-label='播放发音']");
  await wait(800);
  const toastShown = await textContent(client, "当前浏览器不支持日语朗读。");
  const inlineFallbackShown = await textContent(client, "无可用语音");

  if (ttsInfo?.hasSpeechSynthesis && ttsInfo.voiceCount > 0) {
    report.passed.push(`当前浏览器存在 speechSynthesis 接口且已加载语音；当前 voices 数量为 ${ttsInfo.voiceCount}。`);
  } else if (toastShown || inlineFallbackShown) {
    report.passed.push("当前浏览器没有可用日语语音时，页面会稳定显示明确的降级提示。");
  } else {
    report.failed.push({
      title: "TTS 支持状态未能确认",
      steps: ["进入任一场景页", "点击播放按钮"],
      details: `检测结果:${JSON.stringify(ttsInfo)} toastShown:${toastShown} inlineFallbackShown:${inlineFallbackShown}`
    });
  }

  console.log(JSON.stringify(report, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
