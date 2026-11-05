# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: learner.spec.ts >> public learner screens have no serious automated accessibility violations
- Location: frontend/tests/e2e/learner.spec.ts:90:5

# Error details

```
Error: /speaking: [{"id":"color-contrast","impact":"serious","help":"Elements must meet minimum color contrast ratio thresholds","count":4}]

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 163

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#f8f9fc",
+               "contrastRatio": 4.2,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6d7890",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 4.2 (foreground color: #6d7890, background color: #f8f9fc, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<body>",
+                 "target": Array [
+                   "body",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 4.2 (foreground color: #6d7890, background color: #f8f9fc, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p>Préparez-vous à l'épreuve d'expression orale du TCF Canada avec des situations réelles.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".oral-page-heading > div:nth-child(2) > p",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 4.27,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#707b8d",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 4.27 (foreground color: #707b8d, background color: #ffffff, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"oral-task-tabs\" role=\"group\" aria-label=\"Tâches d'expression orale\">",
+                 "target": Array [
+                   ".oral-task-tabs",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 4.27 (foreground color: #707b8d, background color: #ffffff, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<small>Présentation</small>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".oral-task-tab[type=\"button\"]:nth-child(1) > span > small",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 4.27,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#707b8d",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 4.27 (foreground color: #707b8d, background color: #ffffff, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"oral-task-tabs\" role=\"group\" aria-label=\"Tâches d'expression orale\">",
+                 "target": Array [
+                   ".oral-task-tabs",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 4.27 (foreground color: #707b8d, background color: #ffffff, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<small>Argumentation</small>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".oral-task-tab[type=\"button\"]:nth-child(3) > span > small",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#f8f9fc",
+               "contrastRatio": 4.2,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6d7890",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 4.2 (foreground color: #6d7890, background color: #f8f9fc, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<body>",
+                 "target": Array [
+                   "body",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 4.2 (foreground color: #6d7890, background color: #f8f9fc, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p>Des situations variées pour pratiquer l'interaction orale et gagner en aisance.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".oral-scenarios-title > div > p",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - generic [ref=f4e2]:
    - complementary [ref=f4e3]:
      - generic [ref=f4e4] [cursor=pointer]:
        - generic [ref=f4e5]:
          - text: p
          - generic [ref=f4e6]: .
        - generic [ref=f4e7]:
          - generic [ref=f4e8]: Chez Harneet
          - generic [ref=f4e9]: EXAMEN DE FRANÇAIS
      - generic [ref=f4e10]: VOTRE ESPACE
      - navigation [ref=f4e11]:
        - button "Vue d'ensemble" [ref=f4e12] [cursor=pointer]
        - button "Expression orale 3" [ref=f4e17] [cursor=pointer]:
          - generic [ref=f4e20]: Expression orale
          - generic [ref=f4e21]: "3"
        - button "Expression écrite" [ref=f4e22] [cursor=pointer]
        - button "Vocabulaire" [ref=f4e27] [cursor=pointer]
        - button "Grammaire" [ref=f4e31] [cursor=pointer]
      - generic [ref=f4e35]: VOS OUTILS
      - button "Salle d'entraînement" [ref=f4e36] [cursor=pointer]
      - button "Examen blanc" [ref=f4e42] [cursor=pointer]
      - button "Ma progression" [ref=f4e55] [cursor=pointer]
      - generic [ref=f4e60]:
        - text: Progressez concrètement
        - paragraph [ref=f4e64]: Accédez aux séries d'exercices et aux simulations d'examen.
        - button "Découvrir les offres" [ref=f4e65] [cursor=pointer]
      - button "Paramètres" [ref=f4e70] [cursor=pointer]
      - generic [ref=f4e75] [cursor=pointer]:
        - generic [ref=f4e76]: L
        - generic [ref=f4e77]:
          - generic [ref=f4e78]: Learner
          - generic [ref=f4e79]: Apprenant gratuit
    - main [ref=f4e84]:
      - generic [ref=f4e85]:
        - generic [ref=f4e86]:
          - generic [ref=f4e87]: Espace de travail
          - generic [ref=f4e90]: Expression orale
        - generic [ref=f4e91]:
          - generic [ref=f4e92]:
            - generic [aria-hidden] [ref=f4e93]: 文
            - combobox "Interface language" [ref=f4e94] [cursor=pointer]:
              - option "Français" [selected]
              - option "English"
          - button "Centre d'aide" [ref=f4e95] [cursor=pointer]
          - button "Nouveautés" [ref=f4e100] [cursor=pointer]
          - button "Ouvrir Learner's profile" [ref=f4e103] [cursor=pointer]: L
      - generic [ref=f4e104]:
        - status [ref=f4e105]: Chargement du contenu du cours…
        - generic [ref=f4e111]:
          - heading "Expression orale" [level=1] [ref=f4e112]
          - paragraph [ref=f4e113]: Préparez-vous à l'épreuve d'expression orale du TCF Canada avec des situations réelles.
        - group "Tâches d'expression orale" [ref=f4e114]:
          - button "Tâche 1 Présentation" [ref=f4e115] [cursor=pointer]:
            - generic [ref=f4e119]:
              - generic [ref=f4e120]: Tâche 1
              - generic [ref=f4e121]: Présentation
          - button "Tâche 2 Interaction orale" [pressed] [ref=f4e122] [cursor=pointer]:
            - generic [ref=f4e125]:
              - generic [ref=f4e126]: Tâche 2
              - generic [ref=f4e127]: Interaction orale
          - button "Tâche 3 Argumentation" [ref=f4e128] [cursor=pointer]:
            - generic [ref=f4e133]:
              - generic [ref=f4e134]: Tâche 3
              - generic [ref=f4e135]: Argumentation
        - generic [ref=f4e136]:
          - generic [aria-hidden] [ref=f4e137]:
            - generic [ref=f4e138]: •••
            - generic [ref=f4e144]: ///
          - generic [ref=f4e145]:
            - heading "Tâche 2 — Interaction orale" [level=3] [ref=f4e146]
            - paragraph [ref=f4e147]: Échangez avec l'examinateur sur une situation de la vie quotidienne (demander, proposer, accepter, refuser, s'informer, etc.).
            - generic [ref=f4e148]:
              - text: "Durée estimée :"
              - generic [ref=f4e152]: 3 à 4 min
          - complementary [ref=f4e153]:
            - button "S'entraîner à cette tâche" [ref=f4e154] [cursor=pointer]
        - generic [ref=f4e157]:
          - generic [ref=f4e158]:
            - generic [ref=f4e159]:
              - generic [ref=f4e160]:
                - heading "Sujets d'entraînement (Tâche 2)" [level=2] [ref=f4e161]
                - paragraph [ref=f4e162]: Des situations variées pour pratiquer l'interaction orale et gagner en aisance.
              - generic [ref=f4e163]: 0 sujets disponibles
            - generic [ref=f4e164]:
              - searchbox "Rechercher un sujet" [ref=f4e169]
              - group "Filter topics by category" [ref=f4e170]:
                - button "Tous (0)" [pressed] [ref=f4e171] [cursor=pointer]
          - status [ref=f4e172]: Chargement des mises en situation de la tâche 2…
        - generic [ref=f4e173]:
          - generic [ref=f4e174]:
            - generic [ref=f4e175]: Chez Harneet
            - generic [ref=f4e176]: Conçu pour votre prochain objectif en français.
          - generic [ref=f4e177]: Préparation indépendante au français · Organisme non affilié à l'examen officiel
  - alert [ref=f4e178]
```

# Test source

```ts
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
> 105 |     expect(serious, `${route}: ${JSON.stringify(summary)}`).toEqual([]);
      |                                                             ^ Error: /speaking: [{"id":"color-contrast","impact":"serious","help":"Elements must meet minimum color contrast ratio thresholds","count":4}]
  106 |   }
  107 | });
  108 | 
```