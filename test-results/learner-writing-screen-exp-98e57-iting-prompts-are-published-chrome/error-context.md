# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: learner.spec.ts >> writing screen explains that no writing prompts are published
- Location: frontend/tests/e2e/learner.spec.ts:50:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Writing studio' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Writing studio' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Writing studio' })

```

```yaml
- complementary:
  - text: p . Chez Harneet EXAMEN DE FRANÇAIS VOTRE ESPACE
  - navigation:
    - button "Vue d'ensemble":
      - img
      - text: Vue d'ensemble
    - button "Expression orale 3":
      - img
      - text: Expression orale 3
    - button "Expression écrite":
      - img
      - text: Expression écrite
    - button "Vocabulaire":
      - img
      - text: Vocabulaire
    - button "Grammaire":
      - img
      - text: Grammaire
  - text: VOS OUTILS
  - button "Salle d'entraînement":
    - img
    - text: Salle d'entraînement
  - button "Examen blanc":
    - img
    - text: Examen blanc
    - img
  - button "Ma progression":
    - img
    - text: Ma progression
  - img
  - text: Progressez concrètement
  - paragraph: Accédez aux séries d'exercices et aux simulations d'examen.
  - button "Découvrir les offres":
    - text: Découvrir les offres
    - img
  - button "Paramètres":
    - img
    - text: Paramètres
  - text: L Learner Apprenant gratuit
  - img
- main:
  - text: Espace de travail
  - img
  - text: Expression écrite
  - combobox "Interface language":
    - option "Français" [selected]
    - option "English"
  - img
  - button "Centre d'aide":
    - img
    - text: Centre d'aide
  - button "Nouveautés":
    - img
  - button "Ouvrir Learner's profile": L
  - text: EXAMEN DE FRANÇAIS · EXPRESSION ÉCRITE
  - heading "Atelier d'écriture" [level=1]
  - paragraph: Transformez vos idées en textes français clairs et structurés.
  - text: ÉCRIVEZ AVEC INTENTION
  - heading "Des idées claires. Des mots justes." [level=2]
  - paragraph: Entraînez-vous aux messages courts et à l'expression d'opinion, un sujet à la fois.
  - button "Commencer à écrire" [disabled]:
    - text: Commencer à écrire
    - img
  - text: Bonjour !
  - heading "Activités d'expression écrite" [level=3]
  - paragraph: Choisissez un format pour commencer.
  - status:
    - img
    - text: No writing sujets are published yet.
    - paragraph: The writing studio will be available when course sujets are added.
  - img
  - text: Vos textes restent les vôtres.
  - paragraph: Cette formule inclut un éditeur d'entraînement et un compteur de mots. Une correction automatique pourra être ajoutée ultérieurement.
  - text: Chez Harneet Conçu pour votre prochain objectif en français. Préparation indépendante au français · Organisme non affilié à l'examen officiel
- alert
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | 
  4   | async function setEnglish(page: import("@playwright/test").Page) {
  5   |   await page.goto("/");
  6   |   await page.evaluate(() => localStorage.setItem("chez-harneet-language", "en"));
  7   |   await page.reload({ waitUntil: "domcontentloaded" });
  8   |   await page.waitForFunction(() => document.documentElement.lang === "en");
  9   | }
  10  | 
  11  | test("learner can navigate from the landing page into a topic and its vocabulary", async ({ page }) => {
  12  |   const consoleErrors: string[] = [];
  13  |   page.on("pageerror", (error) => consoleErrors.push(error.message));
  14  |   await setEnglish(page);
  15  |   await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  16  | 
  17  |   await page.getByRole("button", { name: "Open learning space" }).first().click();
  18  |   await expect(page).toHaveURL(/\/dashboard$/);
  19  |   await expect(page.getByText("Your learning path")).toBeVisible();
  20  | 
  21  |   await page.locator(".nav-link").filter({ hasText: "Speaking" }).click();
  22  |   await expect(page).toHaveURL(/\/speaking$/);
  23  |   const firstScenario = page.locator(".scenario-row").first();
  24  |   await expect(firstScenario).toBeVisible();
  25  |   const topicTitle = (await firstScenario.locator("b").innerText()).trim();
  26  |   await firstScenario.click();
  27  | 
  28  |   await expect(page).toHaveURL(/\/practice$/);
  29  |   await expect(page.getByRole("heading", { level: 1, name: topicTitle })).toBeVisible();
  30  |   await expect(page.getByRole("heading", { name: "Vocabulary for this topic" })).toBeVisible();
  31  |   await expect(page.locator(".topic-vocab-item").first()).toBeVisible();
  32  |   expect(consoleErrors).toEqual([]);
  33  | });
  34  | 
  35  | test("vocabulary search and bookmarks work, and vocabulary is grouped by topic", async ({ page }) => {
  36  |   await setEnglish(page);
  37  |   await page.goto("/vocabulary");
  38  |   const search = page.getByPlaceholder("Search a phrase, meaning, or example…");
  39  |   await search.fill("neighbourhood");
  40  |   const locationGroup = page.locator(".vocab-topic-group").filter({ has: page.getByRole("heading", { name: "Location de maison" }) });
  41  |   await expect(locationGroup.getByRole("heading", { name: "un quartier" })).toBeVisible();
  42  |   await expect(page.locator(".vocab-card").first()).toBeVisible();
  43  | 
  44  |   await search.clear();
  45  |   const bookmark = page.getByRole("button", { name: "Save phrase" }).first();
  46  |   await bookmark.click();
  47  |   await expect(bookmark).toHaveClass(/is-saved/);
  48  | });
  49  | 
  50  | test("writing screen explains that no writing prompts are published", async ({ page }) => {
  51  |   await setEnglish(page);
  52  |   await page.goto("/writing");
> 53  |   await expect(page.getByRole("heading", { name: "Writing studio" })).toBeVisible();
      |                                                                       ^ Error: expect(locator).toBeVisible() failed
  54  |   await expect(page.getByText(/No writing prompts are published yet/)).toBeVisible();
  55  |   await expect(page.getByRole("button", { name: "Start writing" })).toBeDisabled();
  56  | });
  57  | 
  58  | test("login and upgrade dialogs can be opened and dismissed", async ({ page }) => {
  59  |   await setEnglish(page);
  60  |   await page.getByRole("button", { name: "Sign in" }).first().click();
  61  |   await expect(page.getByRole("heading", { name: "Your learning, all in one place." })).toBeVisible();
  62  |   await page.getByRole("button", { name: "Close dialog" }).click();
  63  |   await expect(page.locator(".modal-backdrop")).toHaveCount(0);
  64  | 
  65  |   await page.goto("/pricing");
  66  |   await page.getByRole("button", { name: "Join the waitlist" }).click();
  67  |   await expect(page.locator(".modal-card")).toBeVisible();
  68  |   await page.locator(".modal-backdrop").click({ position: { x: 4, y: 4 } });
  69  |   await expect(page.locator(".modal-backdrop")).toHaveCount(0);
  70  | });
  71  | 
  72  | test("core pages render without horizontal overflow at supported viewport widths", async ({ page }) => {
  73  |   await setEnglish(page);
  74  |   await page.goto("/dashboard");
  75  |   for (const width of [320, 375, 768, 1024, 1440]) {
  76  |     await page.setViewportSize({ width, height: 900 });
  77  |     await expect(page.getByRole("heading", { name: "Your learning path" })).toBeVisible();
  78  |     const dimensions = await page.evaluate(() => ({
  79  |       viewport: document.documentElement.clientWidth,
  80  |       page: document.documentElement.scrollWidth,
  81  |     }));
  82  |     const offenders = dimensions.page > dimensions.viewport + 1 ? await page.locator("body *").evaluateAll((elements) => elements.map((element) => {
  83  |       const rect = element.getBoundingClientRect();
  84  |       return { tag: element.tagName, className: typeof element.className === "string" ? element.className : "", right: Math.round(rect.right), width: Math.round(rect.width) };
  85  |     }).filter((element) => element.right > window.innerWidth + 1).slice(0, 8)) : [];
  86  |     expect(dimensions.page, `horizontal overflow at ${width}px: ${JSON.stringify(offenders)}`).toBeLessThanOrEqual(dimensions.viewport + 1);
  87  |   }
  88  | });
  89  | 
  90  | test("public learner screens have no serious automated accessibility violations", async ({ page }) => {
  91  |   await setEnglish(page);
  92  |   for (const route of ["/", "/dashboard", "/speaking", "/writing", "/vocabulary", "/grammar", "/practice", "/pricing", "/admin"]) {
  93  |     await page.goto(route);
  94  |     const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  95  |     const serious = results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""));
  96  |     const summary = serious.map(({ id, impact, help, nodes }) => ({ id, impact, help, count: nodes.length }));
  97  |     if (serious.length) {
  98  |       const colorSamples = [...new Map(serious.flatMap((violation) => violation.nodes.map((node) => {
  99  |         const fg = node.any?.[0]?.data?.fgColor;
  100 |         const bg = node.any?.[0]?.data?.bgColor;
  101 |         return [`${fg} on ${bg}`, { fg, bg, sample: node.target.join(" ") }] as const;
  102 |       }))).values()];
  103 |       console.log(route, JSON.stringify(colorSamples));
  104 |     }
  105 |     expect(serious, `${route}: ${JSON.stringify(summary)}`).toEqual([]);
  106 |   }
  107 | });
  108 | 
```