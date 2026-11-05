# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: learner.spec.ts >> login and upgrade dialogs can be opened and dismissed
- Location: frontend/tests/e2e/learner.spec.ts:58:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Sign in' }).first()

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - main [ref=f1e3]:
    - generic [ref=f1e4]:
      - button "p . Chez Harneet PRÉPARATION AU TCF CANADA" [ref=f1e5] [cursor=pointer]:
        - generic [ref=f1e6]:
          - text: p
          - generic [ref=f1e7]: .
        - generic [ref=f1e8]:
          - generic [ref=f1e9]: Chez Harneet
          - generic [ref=f1e10]: PRÉPARATION AU TCF CANADA
      - navigation "Navigation principale" [ref=f1e11]:
        - link "Notre approche" [ref=f1e12] [cursor=pointer]:
          - /url: "#approach"
        - link "S'entraîner" [ref=f1e13] [cursor=pointer]:
          - /url: "#practice-path"
        - link "Offres" [ref=f1e14] [cursor=pointer]:
          - /url: "#plans"
      - generic [ref=f1e15]:
        - generic [ref=f1e16]:
          - generic [aria-hidden] [ref=f1e17]: 文
          - combobox "Interface language" [ref=f1e18] [cursor=pointer]:
            - option "Français" [selected]
            - option "English"
        - button "Se connecter" [ref=f1e19] [cursor=pointer]
        - button "Accéder à mon espace" [ref=f1e20] [cursor=pointer]
    - generic [ref=f1e23]:
      - generic [ref=f1e24]:
        - generic [ref=f1e25]:
          - generic [ref=f1e26]: Une préparation plus claire
          - heading [level=1] [ref=f1e28]:
            - text: Gagnez en confiance en français,
            - emphasis [ref=f1e29]: un pas après l'autre.
          - paragraph [ref=f1e30]: "Une préparation structurée au TCF Canada : expression orale et écrite, vocabulaire et grammaire. Avancez à votre rythme, avec une prochaine étape clairement définie."
          - generic [ref=f1e31]:
            - button "Découvrir mon espace" [ref=f1e32] [cursor=pointer]
            - button "Voir les activités orales" [ref=f1e35] [cursor=pointer]
          - generic [ref=f1e38]:
            - generic [ref=f1e39]: Pratique guidée
            - generic [ref=f1e43]: À votre rythme
            - generic [ref=f1e47]: Votre progression vous appartient
        - generic "A preview of the Chez Harneet learning space" [ref=f1e51]:
          - generic [ref=f1e58]:
            - generic [ref=f1e59]: Expression orale
            - generic [ref=f1e60]: Questionner, écouter, relancer
          - generic [ref=f1e61]:
            - generic [ref=f1e62]:
              - generic [ref=f1e63]: p.
              - generic [ref=f1e64]:
                - generic [ref=f1e65]: Votre parcours d'apprentissage
                - generic [ref=f1e66]: Chaque progrès compte
            - generic [ref=f1e82]:
              - generic [ref=f1e83]: À SUIVRE · EXPRESSION ORALE
              - generic [ref=f1e84]: Poser les bonnes questions
              - generic [ref=f1e85]: Jeu de rôle guidé · 10 minutes
            - generic [ref=f1e89]: Prêt quand vous l'êtes
          - generic [ref=f1e97]:
            - generic [ref=f1e98]: Apprenez à votre façon
            - generic [ref=f1e99]: Pas besoin d'un français parfait
      - generic [ref=f1e100]:
        - generic [ref=f1e101]:
          - generic [ref=f1e102]: L'APPROCHE CHEZ HARNEET
          - heading "Une méthode claire pour avancer sereinement." [level=2] [ref=f1e103]
        - paragraph [ref=f1e104]: Préparez les compétences dont vous avez besoin grâce à des leçons ciblées et des exercices pratiques réunis dans un même espace.
      - generic [ref=f1e105]:
        - article [ref=f1e106]:
          - text: 01 · PARLEZ AVEC CONFIANCE
          - heading "Entraînez-vous à converser" [level=3] [ref=f1e110]
          - paragraph [ref=f1e111]: Utilisez des mises en situation, des exemples d'introduction, des questions suggérées et des conclusions pour parler plus naturellement.
          - button "Découvrir l'oral" [ref=f1e112] [cursor=pointer]
        - article [ref=f1e115]:
          - text: 02 · ÉCRIVEZ CLAIREMENT
          - heading "Structurez clairement vos idées" [level=3] [ref=f1e120]
          - paragraph [ref=f1e121]: Prenez l'habitude d'écrire avec des sujets guidés et un espace simple pour organiser vos réponses.
          - button "Découvrir l'écrit" [ref=f1e122] [cursor=pointer]
        - article [ref=f1e125]:
          - text: 03 · ENRICHISSEZ VOTRE FRANÇAIS
          - heading "Renforcez vos bases" [level=3] [ref=f1e129]
          - paragraph [ref=f1e130]: Révisez le vocabulaire et la grammaire en contexte grâce à des ressources conçues pour accompagner votre pratique.
          - button "Découvrir les outils" [ref=f1e131] [cursor=pointer]
      - generic [ref=f1e134]:
        - generic [ref=f1e135]:
          - generic [ref=f1e136]: VOTRE PRÉPARATION EN UN COUP D'ŒIL
          - heading "Sachez quoi travailler ensuite." [level=2] [ref=f1e137]
          - paragraph [ref=f1e138]: De petites séances régulières à une plus grande confiance le jour de l'examen.
        - generic [ref=f1e139]:
          - article [ref=f1e140]:
            - generic [ref=f1e141]: "1"
            - generic [ref=f1e142]:
              - text: Choisissez une compétence
              - paragraph [ref=f1e143]: Commencez par l'oral, l'écrit, le vocabulaire ou la grammaire.
          - article [ref=f1e144]:
            - generic [ref=f1e145]: "2"
            - generic [ref=f1e146]:
              - text: Entraînez-vous avec méthode
              - paragraph [ref=f1e147]: Suivez des sujets structurés pour profiter de chaque séance.
          - article [ref=f1e148]:
            - generic [ref=f1e149]: "3"
            - generic [ref=f1e150]:
              - text: Gardez votre élan
              - paragraph [ref=f1e151]: Retrouvez votre espace et reprenez là où vous en étiez.
        - button "Commencer à découvrir" [ref=f1e152] [cursor=pointer]
      - generic [ref=f1e155]:
        - generic [ref=f1e156]:
          - generic [ref=f1e157]: UNE OFFRE ADAPTÉE À VOTRE PARCOURS
          - heading "Commencez là où vous en êtes." [level=2] [ref=f1e158]
          - paragraph [ref=f1e159]: Découvrez gratuitement Chez Harneet. De nouvelles façons de vous entraîner arrivent bientôt.
        - generic [ref=f1e160]:
          - article [ref=f1e161]:
            - text: POUR BIEN COMMENCER
            - heading "Espace d'apprentissage gratuit" [level=3] [ref=f1e162]
            - paragraph [ref=f1e163]: Créez votre routine avec des activités guidées et des outils essentiels pour apprendre le français.
            - list [ref=f1e164]:
              - listitem [ref=f1e165]: Découvrir l'oral et l'écrit
              - listitem [ref=f1e169]: Réviser le vocabulaire et la grammaire
              - listitem [ref=f1e173]: Suivre vos progrès
            - button "Accéder à mon espace" [ref=f1e177] [cursor=pointer]
          - article [ref=f1e180]:
            - text: EN PRÉPARATION
            - heading "Plus de façons de se préparer" [level=3] [ref=f1e181]
            - paragraph [ref=f1e182]: De nouvelles activités et des simulations d'examen sont en préparation.
            - list [ref=f1e183]:
              - listitem [ref=f1e184]: Toutes les mises en situation
              - listitem [ref=f1e188]: Simulations d'examen
              - listitem [ref=f1e192]: Un suivi détaillé des progrès
            - button "Découvrir les nouveautés" [ref=f1e196] [cursor=pointer]
        - paragraph [ref=f1e199]: Aucun paiement n'est demandé dans cet aperçu. Les tarifs seront affichés lorsque les offres seront disponibles.
      - generic [ref=f1e203]:
        - generic [ref=f1e204]:
          - generic [ref=f1e205]: VOTRE PROCHAIN OBJECTIF EN FRANÇAIS
          - heading "Avancez à votre rythme, pas à pas." [level=2] [ref=f1e206]
          - paragraph [ref=f1e207]: Ouvrez votre espace et choisissez une activité pour aujourd'hui.
        - button "Entrer chez Chez Harneet" [ref=f1e208] [cursor=pointer]
      - generic [ref=f1e211]:
        - button "p . Chez Harneet PRÉPARATION AU TCF CANADA" [ref=f1e212] [cursor=pointer]:
          - generic [ref=f1e213]:
            - text: p
            - generic [ref=f1e214]: .
          - generic [ref=f1e215]:
            - generic [ref=f1e216]: Chez Harneet
            - generic [ref=f1e217]: PRÉPARATION AU TCF CANADA
        - generic [ref=f1e218]: Préparation indépendante au français · Organisme non affilié à l'examen officiel
        - button "Se connecter" [ref=f1e219] [cursor=pointer]
  - alert [ref=f1e222]
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
  53  |   await expect(page.getByRole("heading", { name: "Writing studio" })).toBeVisible();
  54  |   await expect(page.getByText(/No writing prompts are published yet/)).toBeVisible();
  55  |   await expect(page.getByRole("button", { name: "Start writing" })).toBeDisabled();
  56  | });
  57  | 
  58  | test("login and upgrade dialogs can be opened and dismissed", async ({ page }) => {
  59  |   await setEnglish(page);
> 60  |   await page.getByRole("button", { name: "Sign in" }).first().click();
      |                                                               ^ Error: locator.click: Test timeout of 30000ms exceeded.
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