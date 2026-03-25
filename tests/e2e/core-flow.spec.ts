import { expect, test, type Page } from "@playwright/test";

const storageKey = "talk2japan.cards.v1";

async function clearStorage(page: Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
}

async function getCards(page: Page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), storageKey);
}

async function seedReviewCard(page: Page, matcher: { id?: string; notes?: string }) {
  await page.evaluate(
    ({ key, matcher }) => {
      const cards = JSON.parse(localStorage.getItem(key) || "[]");
      const next = cards.map((card: Record<string, unknown>) => {
        const matches =
          (matcher.id && card.id === matcher.id) ||
          (matcher.notes && card.notes === matcher.notes);

        if (!matches) {
          return card;
        }

        return {
          ...card,
          inReview: true,
          masteryLevel: 0,
          reviewCount: 0,
          difficulty: 2,
          nextReviewAt: new Date(Date.now() - 60_000).toISOString()
        };
      });

      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event("talk2japan:cards-updated"));
    },
    { key: storageKey, matcher }
  );
}

test.describe("Talk2Japan core MVP flow", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test("browse a scene and favorite a sentence", async ({ page }) => {
    await page.goto("/scenes/restaurant");

    const favoriteButton = page.locator('[data-card-id="restaurant-1"] [data-action="favorite"]');
    await expect(favoriteButton).toHaveAttribute("aria-pressed", "false");

    await favoriteButton.click();

    await expect(favoriteButton).toHaveAttribute("aria-pressed", "true");
    await expect(favoriteButton).toContainText("已收藏");

    await page.reload();
    await expect(favoriteButton).toHaveAttribute("aria-pressed", "true");

    const cards = await getCards(page);
    const card = cards.find((item: { id: string }) => item.id === "restaurant-1");
    expect(card?.isFavorite).toBe(true);
  });

  test("add a sentence to review from a scene", async ({ page }) => {
    await page.goto("/scenes/restaurant");

    const reviewButton = page.locator('[data-card-id="restaurant-1"] [data-action="review"]');
    await expect(reviewButton).toHaveAttribute("aria-pressed", "true");

    await reviewButton.click();
    await expect(reviewButton).toHaveAttribute("aria-pressed", "false");
    await expect(reviewButton).toContainText("加入复习");

    await reviewButton.click();
    await expect(reviewButton).toHaveAttribute("aria-pressed", "true");
    await expect(reviewButton).toContainText("复习中");

    const cards = await getCards(page);
    const card = cards.find((item: { id: string }) => item.id === "restaurant-1");
    expect(card?.inReview).toBe(true);

    await seedReviewCard(page, { id: "restaurant-1" });
    await page.goto("/review");
    await expect(page.locator("button[class*='perspective']").getByRole("heading", { name: "不好意思，现在可以点餐吗？" })).toBeVisible();
  });

  test("create a custom sentence and verify localStorage persistence", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "添加新句子" }).click();
    await page.getByLabel("中文句子").fill("请问洗手间在哪里");
    await page.getByLabel("备注").fill("playwright-custom-card");
    await page.getByRole("button", { name: "生成并保存" }).click();

    await expect(page.getByText("已加入我的卡片，今天就能开始复习。")).toBeVisible();

    const cards = await getCards(page);
    const customCard = cards.find((item: { notes?: string }) => item.notes === "playwright-custom-card");
    expect(customCard).toMatchObject({
      chinese: "请问洗手间在哪里",
      japanese: "トイレはどこですか。",
      sourceType: "user",
      inReview: true
    });
  });

  test("complete a review card and verify SRS fields update", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "添加新句子" }).click();
    await page.getByLabel("中文句子").fill("请问洗手间在哪里");
    await page.getByLabel("备注").fill("playwright-review-card");
    await page.getByRole("button", { name: "生成并保存" }).click();

    await seedReviewCard(page, { notes: "playwright-review-card" });
    await page.goto("/review");

    await page.locator("button[class*='perspective']").click();
    await expect(page.getByText("トイレはどこですか。")).toBeVisible();
    await page.getByRole("button", { name: "会了" }).click();

    const cards = await getCards(page);
    const reviewed = cards.find((item: { notes?: string }) => item.notes === "playwright-review-card");
    expect(reviewed?.masteryLevel).toBe(2);
    expect(reviewed?.reviewCount).toBe(1);
    expect(new Date(reviewed?.nextReviewAt ?? 0).getTime()).toBeGreaterThan(Date.now());
  });

  test.describe("TTS button states", () => {
    test("shows enabled state when Japanese voices are available", async ({ page }) => {
      await page.addInitScript(() => {
        const synth = {
          speaking: false,
          _voices: [{ lang: "ja-JP", name: "QA Japanese Voice" }],
          getVoices() {
            return this._voices;
          },
          speak() {
            this.speaking = true;
          },
          cancel() {
            this.speaking = false;
          },
          addEventListener() {},
          removeEventListener() {}
        };

        Object.defineProperty(window, "speechSynthesis", {
          configurable: true,
          value: synth
        });
      });

      await page.goto("/scenes/restaurant");
      const ttsButton = page.locator('[data-card-id="restaurant-1"] button[aria-label="播放发音"]');
      await expect(ttsButton).toBeEnabled();
      await expect(page.getByText("无可用语音")).toHaveCount(0);
    });

    test("shows degraded state when Japanese voices are unavailable", async ({ page }) => {
      await page.addInitScript(() => {
        const synth = {
          speaking: false,
          getVoices() {
            return [];
          },
          speak() {},
          cancel() {},
          addEventListener() {},
          removeEventListener() {}
        };

        Object.defineProperty(window, "speechSynthesis", {
          configurable: true,
          value: synth
        });
      });

      await page.goto("/scenes/restaurant");
      const ttsButton = page.locator('[data-card-id="restaurant-1"] button[aria-label="播放发音"]');
      await expect(ttsButton).toBeDisabled();
      await expect(page.locator('[data-card-id="restaurant-1"]').getByText("无可用语音")).toBeVisible();
    });
  });

  test.describe("mobile information architecture", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("bottom navigation links to key sections", async ({ page }) => {
      await page.goto("/");
      const bottomNav = page.locator("nav").last();
      await expect(bottomNav.getByRole("link", { name: "词本" })).toBeVisible();
      await bottomNav.getByRole("link", { name: "词本" }).click();
      await expect(page).toHaveURL(/\/cards$/);

      await bottomNav.getByRole("link", { name: "复习" }).click();
      await expect(page).toHaveURL(/\/review$/);
    });
  });
});
