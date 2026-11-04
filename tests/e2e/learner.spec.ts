import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function setEnglish(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("chez-harneet-language", "en"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.lang === "en");
}

test("learner can navigate from the landing page into a topic and its vocabulary", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await setEnglish(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "Open learning space" }).first().click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Your learning path")).toBeVisible();

  await page.locator(".nav-link").filter({ hasText: "Speaking" }).click();
  await expect(page).toHaveURL(/\/speaking$/);
  const firstScenario = page.locator(".scenario-row").first();
  await expect(firstScenario).toBeVisible();
  const topicTitle = (await firstScenario.locator("b").innerText()).trim();
  await firstScenario.click();

  await expect(page).toHaveURL(/\/practice$/);
  await expect(page.getByRole("heading", { level: 1, name: topicTitle })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Vocabulary for this topic" })).toBeVisible();
  await expect(page.locator(".topic-vocab-item").first()).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("vocabulary search and bookmarks work, and vocabulary is grouped by topic", async ({ page }) => {
  await setEnglish(page);
  await page.goto("/vocabulary");
  const search = page.getByPlaceholder("Search a phrase, meaning, or example…");
  await search.fill("neighbourhood");
  const locationGroup = page.locator(".vocab-topic-group").filter({ has: page.getByRole("heading", { name: "Location de maison" }) });
  await expect(locationGroup.getByRole("heading", { name: "un quartier" })).toBeVisible();
  await expect(page.locator(".vocab-card").first()).toBeVisible();

  await search.clear();
  const bookmark = page.getByRole("button", { name: "Save phrase" }).first();
  await bookmark.click();
  await expect(bookmark).toHaveClass(/is-saved/);
});

test("writing screen explains that no writing prompts are published", async ({ page }) => {
  await setEnglish(page);
  await page.goto("/writing");
  await expect(page.getByRole("heading", { name: "Writing studio" })).toBeVisible();
  await expect(page.getByText(/No writing prompts are published yet/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Start writing" })).toBeDisabled();
});

test("login and upgrade dialogs can be opened and dismissed", async ({ page }) => {
  await setEnglish(page);
  await page.getByRole("button", { name: "Sign in" }).first().click();
  await expect(page.getByRole("heading", { name: "Your learning, all in one place." })).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator(".modal-backdrop")).toHaveCount(0);

  await page.goto("/pricing");
  await page.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(page.locator(".modal-card")).toBeVisible();
  await page.locator(".modal-backdrop").click({ position: { x: 4, y: 4 } });
  await expect(page.locator(".modal-backdrop")).toHaveCount(0);
});

test("core pages render without horizontal overflow at supported viewport widths", async ({ page }) => {
  await setEnglish(page);
  await page.goto("/dashboard");
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole("heading", { name: "Your learning path" })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
    }));
    const offenders = dimensions.page > dimensions.viewport + 1 ? await page.locator("body *").evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { tag: element.tagName, className: typeof element.className === "string" ? element.className : "", right: Math.round(rect.right), width: Math.round(rect.width) };
    }).filter((element) => element.right > window.innerWidth + 1).slice(0, 8)) : [];
    expect(dimensions.page, `horizontal overflow at ${width}px: ${JSON.stringify(offenders)}`).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});

test("public learner screens have no serious automated accessibility violations", async ({ page }) => {
  await setEnglish(page);
  for (const route of ["/", "/dashboard", "/speaking", "/writing", "/vocabulary", "/grammar", "/practice", "/pricing", "/admin"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const serious = results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""));
    const summary = serious.map(({ id, impact, help, nodes }) => ({ id, impact, help, count: nodes.length }));
    if (serious.length) {
      const colorSamples = [...new Map(serious.flatMap((violation) => violation.nodes.map((node) => {
        const fg = node.any?.[0]?.data?.fgColor;
        const bg = node.any?.[0]?.data?.bgColor;
        return [`${fg} on ${bg}`, { fg, bg, sample: node.target.join(" ") }] as const;
      }))).values()];
      console.log(route, JSON.stringify(colorSamples));
    }
    expect(serious, `${route}: ${JSON.stringify(summary)}`).toEqual([]);
  }
});
