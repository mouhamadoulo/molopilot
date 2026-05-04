# Molopilot — IHM Foundation : Landing publique + Design System

**Date :** 2026-05-02
**Statut :** Validé brainstorming, en attente revue spec
**Plan d'implémentation correspondant :** Plan IHM-1 — `docs/superpowers/plans/` (à rédiger via `writing-plans` après validation spec)
**Spec amont :** `docs/superpowers/specs/2026-04-28-molopilot-saas-design.md`

---

## 1. Contexte & objectifs

Phase 0 (fondations monorepo, Prisma, RLS, CI) est terminée. Avant d'attaquer Phase 1 (Auth + multi-tenant), on construit la fondation IHM publique : design system + page d'accueil. Cette base sert ensuite Auth (Phase 1), Back-office (Phase 1+), Caisse (Phase 4), etc.

**Objectifs :**

- Identité visuelle Molopilot reconnaissable, distincte des SaaS génériques.
- Landing `/` opérationnelle, convertit visiteur → "Créer mon compte".
- Composants primitives réutilisables pour toutes les phases suivantes.
- Performance et accessibilité dignes d'un produit pro, optimisées réseau Sénégal (3G/4G intermittent).

### Critères de succès

- Lighthouse Mobile : Perf ≥ 90, A11y ≥ 95, SEO ≥ 90, Best Practices ≥ 95.
- Bundle JS landing initial < 100 KB gzipped.
- 0 violation a11y critical/serious (axe-core).
- Tous composants `components/ui/*` réutilisables sans modif pour Phase 1+.
- Test smoke Playwright vert : page charge, h1 présent, console clean.

---

## 2. Périmètre

### In scope (Plan IHM-1)

- Design system : tokens CSS (couleurs, typo, espacement, radius, shadows), 5 composants primitives (`Button`, `Container`, `Section`, `Heading`, `Logo`).
- Tailwind v4 setup + config tokens.
- Page `/` complète : `MarketingNav` + `Hero` + `PainPoints` + `Features` + `DemoMockup` + `PricingTease` + `Faq` + `MarketingFooter`.
- Layout root `app/layout.tsx` : html, fonts self-hostées, métadonnées base.
- Layout marketing `app/(marketing)/layout.tsx` : nav + footer.
- Pages d'erreur : `app/not-found.tsx`, `app/error.tsx`.
- SEO : `generateMetadata` page `/`, `robots.txt`, `sitemap.ts` minimal.
- Polices self-hostées : Inter (UI), Plus Jakarta Sans (titres).
- Responsive mobile-first, breakpoints Tailwind par défaut.
- A11y WCAG 2.1 AA.
- 1 smoke test Playwright + axe-core.
- Lighthouse CI sur PR.

### Out of scope (plans suivants)

- Pages `/tarifs`, `/contact`, `/mentions-legales` → Plans 2b, 2c, 2d.
- Pages `/auth/signup`, `/auth/login` → Phase 1.
- Layout back-office `(app)/` → Phase 1+.
- Formulaire signup réel → Phase 1.
- Animations Framer Motion → V2.
- Dark mode → V2.
- Photos professionnelles → remplacement V2 (placeholders/illustrations en V1).
- Analytics (Plausible/PostHog) → Phase 9.
- Tests unitaires composants présentation (ROI faible).

---

## 3. Décisions de cadrage (brainstorm 2026-05-02)

| Décision            | Choix                                                                | Raison                                                                                                      |
| ------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Premier slice IHM   | Landing publique                                                     | User-facing immédiat, valide identité visuelle avant d'investir Auth/Back-office                            |
| Direction visuelle  | **Vibrant afro** (orange/jaune/vert)                                 | Identité différenciée, ancrage marché sénégalais. Risque "moins pro" assumé contre bénéfice reconnaissance. |
| Cible visiteur      | Gérant resto/café/boutique, mobile-first                             | Cohérent spec V1 §1                                                                                         |
| CTA principal       | « Créer mon compte »                                                 | Self-service, friction faible. Paiement abo manuel hors-app (cf spec §13)                                   |
| Structure landing   | Hybride : hero massif convertit + sections scroll éduquent           | Combine quick conversion + edukation marché                                                                 |
| Stack styling       | Tailwind v4 + composants maison                                      | shadcn/ui écarté : look générique conflictuel avec direction vibrant afro                                   |
| Routes V1           | `/`, `/tarifs`, `/contact`, `/mentions-legales`                      | SEO + obligation légale Sénégal                                                                             |
| Composants partagés | `components/ui/` dans `apps/web` (pas de package `@molopilot/ui` V1) | YAGNI — extraction quand vrai besoin partagé apparaît (Phase 8)                                             |
| Tests landing V1    | Smoke Playwright + axe-core, pas de tests unit composants            | Présentation pure, ROI tests unit faible                                                                    |

---

## 4. Architecture

### Structure fichiers `apps/web/`

```
apps/web/
  app/
    (marketing)/
      layout.tsx              # MarketingNav + MarketingFooter
      page.tsx                # /
    api/
      health/route.ts         # existant Phase 0
    layout.tsx                # root : html, lang=fr, fonts, metadata
    not-found.tsx             # 404 stylé
    error.tsx                 # error boundary stylé
    globals.css               # tailwind + tokens.css import
  components/
    ui/                       # primitives — réutilisables Phase 1+
      Button.tsx
      Container.tsx
      Section.tsx
      Heading.tsx
      Logo.tsx
    marketing/                # exclusifs landing
      MarketingNav.tsx
      MarketingFooter.tsx
      Hero.tsx
      PainPoints.tsx
      Features.tsx
      DemoMockup.tsx
      PricingTease.tsx
      Faq.tsx
  lib/
    cn.ts                     # clsx + tailwind-merge
  styles/
    tokens.css                # CSS custom properties palette/spacing
  public/
    fonts/                    # Inter + Plus Jakarta Sans .woff2
    images/                   # SVG/WebP placeholders
  e2e/
    landing.spec.ts           # smoke test
  postcss.config.mjs          # plugin @tailwindcss/postcss
  playwright.config.ts
  # NB Tailwind v4 : pas de tailwind.config.ts — config dans globals.css via @theme
```

### Choix architecturaux

- **Route group `(marketing)`** : isole le layout marketing du futur `(app)/` back-office (Phase 1+). N'apparaît pas dans l'URL.
- **`components/ui/` vs `components/marketing/`** : `ui` = primitives réutilisables, `marketing` = exclusif landing. Frontière claire pour réutilisation Phase 1+.
- **Tokens en CSS variables** dans `tokens.css`. **Tailwind v4 = config CSS-first** : pas de `tailwind.config.ts`, le mapping tokens → utilities se fait via la directive `@theme` dans `globals.css` (ex : `@theme { --color-primary-500: var(--color-primary-500); }`). Permet thème runtime futur (dark mode V2) sans rebuild.
- **Polices self-hostées** dans `public/fonts/` chargées via `next/font/local` — pas de Google Fonts CDN (latence Sénégal + RGPD-friendly).
- **Pas de package `@molopilot/ui` en V1** — extraction reportée à Phase 8 (multi-établ UI) si vrai besoin partagé entre apps apparaît.

### Dépendances ajoutées (`apps/web/package.json`)

- `tailwindcss@^4`
- `@tailwindcss/postcss` (plugin PostCSS, remplace `postcss-import` + `autoprefixer` du pipeline v3)
- `postcss`
- `clsx`
- `tailwind-merge`
- (devDep) `@playwright/test`
- (devDep) `@axe-core/playwright`

CI ajoute `@lhci/cli` pour Lighthouse PR.

---

## 5. Design system

### Palette — Vibrant afro

```
Primary (Orange Mali)
  50  #FFF4ED · 100 #FFE4D2 · 200 #FFC9A5 · 300 #FFA76E · 400 #FF8849
  500 #FF6B35 · 600 #E5511D · 700 #C44114 · 800 #9A3411 · 900 #7C2A0E

Accent (Jaune Sénégal)
  50  #FEF9E7 · 100 #FDF1C2 · 200 #FBE48A · 300 #F9D34D
  500 #F7B801 · 700 #B58400 · 900 #7A5800

Success (Vert Téranga)
  50  #E6F7F0 · 100 #B8E8D5 · 300 #4CC79B
  500 #00A878 · 700 #006B4D · 900 #003D2C

Neutrals (Charbon)
  50  #FAFAF9 · 100 #F4F4F2 · 200 #E5E5E2 · 300 #D1D1CD
  400 #A1A19D · 500 #78787A · 600 #57575A · 700 #3F3F42 · 900 #1A1A1A

Semantic
  danger  500 #DC2626   warning 500 #F59E0B   info 500 #0EA5E9
```

**Usage :**

- Primary 500 = boutons primaires, CTA, accents focus.
- Primary 600/700 = hover/active boutons.
- Accent 500 = badges, étoiles, highlights spécifiques.
- Success 500 = états validés, badge "online", check icons.
- Neutral 900 = corps texte sur fond clair.
- Neutral 50 = fond sections claires alternées.
- Hero : gradient `linear-gradient(135deg, primary-500 0%, accent-500 100%)`.

**Contraste critique :** Primary 500 `#FF6B35` sur blanc = 3.5:1 → conforme AA pour text ≥ 18px ou bold ≥ 14px uniquement.

**Règles d'usage couleur (interdictions explicites) :**

- ❌ `text-primary-500` sur fond clair en `text-sm` regular ou `text-xs` (fail AA).
- ✅ `text-primary-500` autorisé uniquement en `text-lg+` ou `font-bold text-sm+`.
- ✅ `bg-primary-500 text-white` autorisé toutes tailles (texte blanc sur orange = 3.5:1, OK uniquement si ≥18px ou bold ≥14px → boutons size `sm` doivent être `font-semibold` minimum).
- ❌ Boutons `<Button variant="primary" size="sm">` sans `font-semibold` interdits par défaut dans l'API.
- ✅ Texte courant : `text-neutral-900` sur fond blanc (16:1).
- ✅ CTA / hover : darken vers `primary-600` `#E5511D` (4.5:1 → AA texte normal toutes tailles).

Lint custom recommandé Plan IHM-1 : règle ESLint maison ou commentaire convention dans `Button.tsx` pour empêcher misuse.

### Typographie

- **Plus Jakarta Sans** (700 / 800) — titres `h1` à `h3`. Géométrique, moderne, lisible.
- **Inter** (400 / 500 / 600) — corps + UI. Standard solide.

Échelle modulaire (ratio ~1.25) — défaut Tailwind :

| Token       | Taille | Usage                    |
| ----------- | ------ | ------------------------ |
| `text-xs`   | 12px   | Labels, mentions légales |
| `text-sm`   | 14px   | Captions, helper text    |
| `text-base` | 16px   | Body                     |
| `text-lg`   | 18px   | Body emphasis, lead      |
| `text-xl`   | 20px   | h4                       |
| `text-2xl`  | 24px   | h3 mobile                |
| `text-3xl`  | 30px   | h2 mobile                |
| `text-4xl`  | 36px   | h1 mobile                |
| `text-5xl`  | 48px   | h2 desktop               |
| `text-6xl`  | 60px   | h1 desktop               |
| `text-7xl`  | 72px   | h1 hero massif (xl+)     |

### Espacement, radius, shadows

- **Spacing :** échelle Tailwind par défaut (multiples 4px : 0, 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 48, 64, 96).
- **Radius :** `sm` 4px · `md` 6px · `lg` 8px · `xl` 12px · `2xl` 20px · `full` 9999px.
- **Shadows :** `sm` (cards subtiles), `md` (boutons hover), `lg` (modals/dropdowns), `glow-primary` (orange glow CTA hero — custom).

### Composants primitives V1

| Composant   | API                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button`    | `variant: 'primary' \| 'secondary' \| 'ghost'` · `size: 'sm' \| 'md' \| 'lg'` · `asChild` (pour wrapper Link Next.js) — interne : `size='sm'` force `font-semibold` pour conformité AA contraste |
| `Container` | `width: 'narrow' \| 'default' \| 'wide'` (640 / 1200 / 1440 max-width)                                                                                                                           |
| `Section`   | `pad: 'sm' \| 'md' \| 'lg'` (vertical) · `bg: 'default' \| 'accent' \| 'dark'`                                                                                                                   |
| `Heading`   | `as: 'h1' \| ... \| 'h6'` · `size: 'xs' \| ... \| '7xl'` (taille découplée du tag)                                                                                                               |
| `Logo`      | `size: 'sm' \| 'md' \| 'lg'` · `variant: 'mark' \| 'full'`                                                                                                                                       |

Tous typés strict, utilisent `cn()` helper, `forwardRef` pour ceux qui acceptent des props HTML natives.

---

## 6. Page `/` — sections détaillées

### 6.1 `<MarketingNav>`

Sticky top, fond blanc avec `backdrop-blur` au scroll, border-bottom subtle.

- **Gauche :** `<Logo variant="full" size="md" />`
- **Centre (md+) :** liens text-sm `Fonctionnalités` `Tarifs` `Contact` (ancres ou pages selon contexte)
- **Droite :** `<Button variant="ghost" size="sm">Se connecter</Button>` + `<Button variant="primary" size="sm">Créer mon compte</Button>`
- **Mobile :** burger → drawer plein écran avec overlay sombre, mêmes liens en grand

### 6.2 `<Hero>`

Fond gradient `linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-accent-500) 100%)`. ~85vh desktop, contenu centré vertical.

- Eyebrow badge : `🇸🇳 Pour resto · café · boutique`
- **H1** (text-4xl mobile → 6xl lg → 7xl xl, Plus Jakarta 800, text-white) : « Pilotez votre établissement, **même sans réseau.** »
- Sous-titre (text-lg → xl, text-white/90) : « Caisse, stock et rapports — pensé pour les commerces du Sénégal. Fonctionne offline, synchro dès que la 4G revient. »
- 2 CTAs : `<Button primary lg>Créer mon compte</Button>` + `<Button ghost lg asChild><a href="#fonctionnalites">Découvrir comment ça marche</a></Button>` (scroll anchor vers section Features)
- **Visuel droite (lg+ uniquement) :** mockup tablette caisse Molopilot — SVG/PNG illustration. En V1 : placeholder simple (capture interface ou illustration vectorielle stylisée).
- **Trust strip bas :** ligne text-sm text-white/80 : `Cash · Wave · Orange Money` · `100% offline-first` · `Hébergé en Europe`

### 6.3 `<PainPoints>`

`<Section bg="default" pad="lg">`

- **Titre h2 :** « Vous reconnaissez ces galères ? »
- 3 cards (grid 1/2/3 cols selon breakpoint) avec emoji icon, titre, 1 phrase :
  - 📵 « La 4G coupe en plein service » — vente perdue, client mécontent
  - 📓 « Le cahier de caisse a disparu » — impossible de savoir ce qui a été vendu
  - 📦 « Le stock est invisible » — on rupture sur le best-seller

### 6.4 `<Features>`

`<Section bg="default" pad="lg">` ancre `#fonctionnalites`

- **Titre h2 :** « Tout ce qu'il faut pour bien tourner. »
- Grid 1/2/4 cols selon breakpoint, 4 features avec icône, titre, 2 lignes :
  - **Caisse offline-first** — Encaissez même sans réseau. Synchro automatique au retour de la 4G.
  - **Stock temps réel** — Mouvements suivis, alertes seuil bas, inventaire fiable.
  - **Rapports clairs** — CA jour/semaine/mois, top produits, par caissier, exports CSV.
  - **Multi-établissement** — Un compte, plusieurs points de vente, vue consolidée.

### 6.5 `<DemoMockup>`

`<Section bg="dark" pad="lg">` — fond `neutral-900`, texte clair.

- **Titre h2 (text-white) :** « Voici à quoi ressemble une vente, online ou offline. »
- Grand visuel centré : mockup interface caisse avec badge "Mode offline 📵" qui devient "Synchronisé ✓" (image statique V1, animation V2).
- Caption : « Aucune vente perdue. Jamais. »

### 6.6 `<PricingTease>`

`<Section bg="accent" pad="lg">` — fond accent-50 chaud. Ancre `#tarifs-tease`.

- **Titre h2 :** « Un seul tarif, sans surprise. »
- Carte unique centrée, max-width ~480px :
  - Big number : **15 000 FCFA**
  - Sous : « / mois / établissement »
  - Liste check : `Tout inclus` · `Pas de % sur vos ventes` · `Annulable à tout moment`
  - CTA : `<Button variant="secondary" asChild><Link href="/tarifs">Voir le détail des tarifs</Link></Button>`

### 6.7 `<Faq>`

`<Section bg="default" pad="lg">` ancre `#faq`.

- **Titre h2 :** « Questions fréquentes »
- Accordéon natif (`<details><summary>` ou button `aria-expanded` + state) — `'use client'` requis.
- 6 Q :
  1. Ça marche vraiment offline ?
  2. Mes données vont où ?
  3. Puis-je essayer avant de payer ?
  4. Comment je paie l'abonnement ?
  5. Wave / Orange Money intégrés directement ?
  6. Combien de caissiers puis-je créer ?

### 6.8 `<MarketingFooter>`

`<Section bg="dark" pad="md">` — fond `neutral-900`, texte clair.

- 4 colonnes (grid 1/2/4) :
  - **Produit :** Fonctionnalités, Tarifs, Démo
  - **Entreprise :** À propos (V2), Contact, Mentions légales
  - **Ressources :** Blog (V2), Aide (V2), Statut (V2)
  - **Contact :** WhatsApp `+221 ...` (placeholder V1), email `contact@molopilot.com`, adresse Dakar
- **Bas :** ligne séparatrice + © 2026 Molopilot · « Made in Sénégal 🇸🇳 »

---

## 7. Routing & SEO

### Routes V1

| Route               | Layout        | Plan       | Statut V1                                           |
| ------------------- | ------------- | ---------- | --------------------------------------------------- |
| `/`                 | `(marketing)` | **IHM-1**  | Livré ce plan                                       |
| `/tarifs`           | `(marketing)` | IHM-2      | Liens présents, page = 404 stylé jusqu'à Plan IHM-2 |
| `/contact`          | `(marketing)` | IHM-3      | Idem                                                |
| `/mentions-legales` | `(marketing)` | IHM-4      | Idem                                                |
| `/auth/signup`      | `(auth)`      | Phase 1    | CTA pointe ici, 404 stylé jusqu'à Phase 1           |
| `/auth/login`       | `(auth)`      | Phase 1    | Idem                                                |
| `/api/health`       | —             | Phase 0 ✅ | Existant                                            |

### SEO `/`

`apps/web/app/(marketing)/page.tsx` exporte `generateMetadata` :

- `<title>` : `Molopilot — Caisse, stock et rapports pour resto, café, boutique au Sénégal`
- `<meta description>` : `Logiciel de gestion offline-first pour les commerces sénégalais. Caisse, stock, rapports. 15 000 FCFA / mois.`
- `<meta property="og:*">` : title, description, image (placeholder OG image V1, design V2), type=website, locale=fr_SN
- `<link rel="canonical">` : `https://molopilot.com/`
- `<html lang="fr">`
- `app/robots.ts` : autorise tout, déclare sitemap
- `app/sitemap.ts` : `/` (les autres pages s'ajoutent dans Plans IHM-2/3/4)

### Pages erreur

- `app/not-found.tsx` — design system, h1 "Page introuvable", lien retour `/`
- `app/error.tsx` — design system, h1 "Une erreur est survenue", bouton "Réessayer"

---

## 8. Responsive & accessibilité

### Breakpoints (Tailwind defaults)

`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536. Mobile-first.

Cible primaire : Android 360–414px (gérant terrain).

### Règles responsive principales

- **Hero** : visuel droite affiché `lg+`, caché `< lg` (texte+CTA prennent toute largeur).
- **Features grid** : `1 col` mobile · `2 cols` md · `4 cols` lg.
- **Nav** : burger drawer `< md`, full nav `md+`.
- **Type scale** : `h1` `text-4xl` mobile → `text-6xl` lg → `text-7xl` xl.
- **Touch targets** ≥ 44×44px pour tous éléments interactifs mobile.

### Accessibilité (WCAG 2.1 AA)

- Sémantique HTML stricte : `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<button>`. Jamais `<div onClick>`.
- Hiérarchie headings : 1 seul `<h1>` par page, pas de saut de niveau.
- Contrastes vérifiés (cf §5 — neutral-900 sur blanc OK 16:1, primary-500 réservé bouton/heading large).
- Focus rings visibles : `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500`.
- Skip link `#main-content` en haut layout marketing.
- `prefers-reduced-motion: reduce` respecté (pas d'animation hero gradient).
- `alt` text obligatoire toutes images (vide `alt=""` si purement décoratif).
- FAQ accordéon : `<button aria-expanded={open} aria-controls={panelId}>` + panel `id={panelId} role="region"`.
- `<html lang="fr">`.

---

## 9. Performance

### Budgets cibles

- Lighthouse Mobile (Slow 3G simulé) : Perf ≥ 90, A11y ≥ 95, SEO ≥ 90, Best Practices ≥ 95.
- LCP < 2.5s, FID < 100ms, CLS < 0.1.
- JS bundle initial landing < 100 KB gzipped.

### Mesures

- Polices self-hostées (`next/font/local`), subset latin, `font-display: swap`. Preload Plus Jakarta Sans 800 (utilisée H1 hero).
- Images : WebP via `next/image`, lazy hors viewport, dimensions explicites pour zéro CLS.
- Server Components par défaut. `'use client'` uniquement pour : nav drawer mobile (state ouvert/fermé) + Faq accordéon.
- Pas de framework anim côté client V1 — CSS `transition` natif suffit.
- Tailwind v4 purge auto (zéro config).
- `<Link prefetch>` automatique pour liens nav vers `/tarifs` et `/contact`.

### Validation

- CI Lighthouse sur chaque PR vers main, fail sous budgets.
- Test manuel throttling Slow 3G DevTools avant merge.

---

## 10. Tests & validation

### Stratégie

Pas de tests unit composants présentation V1 (ROI faible). Validation par TypeScript + lint + smoke E2E + Lighthouse.

### Détail

| Niveau     | Outil                                | Quand                            |
| ---------- | ------------------------------------ | -------------------------------- |
| TypeScript | `tsc --noEmit` strict                | CI + dev (déjà en place Phase 0) |
| Lint       | ESLint flat config                   | CI + pre-commit (Phase 0)        |
| Format     | Prettier                             | Pre-commit (Phase 0)             |
| Lighthouse | `@lhci/cli` GitHub Action            | **Nouveau** — CI sur PR          |
| Smoke E2E  | `@playwright/test`                   | **Nouveau** — CI sur PR          |
| A11y auto  | `@axe-core/playwright` dans le smoke | **Nouveau** — CI sur PR          |
| Manuel     | Browser réel + DevTools throttling   | Avant merge — checklist          |

### Smoke test Plan IHM-1

Fichier `apps/web/e2e/landing.spec.ts`, 1 test :

1. `goto('/')` → status 200.
2. `await expect(page.locator('h1')).toContainText('Pilotez')`.
3. Aucune erreur `console.error` pendant le chargement.
4. `axe.run(page)` → 0 violations critical/serious.

### CI updates (`.github/workflows/ci.yml`)

- Nouveau job `e2e` : install Playwright browsers, build apps/web, démarre `next start`, run `playwright test`.
- Nouveau job `lighthouse` : démarre `next start`, run LHCI avec budgets.
- Jobs parallèles aux jobs existants `lint`/`typecheck`/`test`.

### Critères "done" Plan IHM-1

- Page `/` rendue, design conforme.
- Tous breakpoints OK (375, 768, 1024, 1440).
- Lighthouse mobile Perf ≥ 90.
- 0 violation a11y critical/serious.
- Smoke Playwright vert local + CI.
- TASKS.md + CLAUDE.md mis à jour dans le même commit.
- Commit + push origin/main.

---

## 11. Hors scope explicite

- Photos professionnelles (illustrations stock + remplacement V2).
- Animations Framer Motion (CSS suffit V1).
- Dark mode (V2).
- Analytics, A/B testing, error tracking client (Phase 9 polish).
- i18n multi-langue (FR uniquement V1, clés extraites V2).
- Pages `/tarifs`, `/contact`, `/mentions-legales` (Plans IHM-2/3/4).
- Auth réelle (Phase 1).
- Tests unitaires composants présentation (ROI faible).

---

## 12. Plans suivants

Le présent spec ouvre un nouveau "track" frontend parallèle aux phases backend de la roadmap globale. Pour éviter conflit avec la numérotation existante (TASKS.md : "Plan 2 = Phase 1 Auth"), on adopte un préfixe `IHM-` sur ce track.

| Plan      | Sujet                                  | Dépend de | Track    |
| --------- | -------------------------------------- | --------- | -------- |
| **IHM-1** | **Ce plan** — Foundation + landing `/` | Phase 0   | Frontend |
| IHM-2     | Page `/tarifs`                         | IHM-1     | Frontend |
| IHM-3     | Page `/contact`                        | IHM-1     | Frontend |
| IHM-4     | Page `/mentions-legales`               | IHM-1     | Frontend |
| Plan 2    | Phase 1 — Auth + multi-tenant + RLS    | IHM-1     | Backend  |

Plans IHM-2/3/4 rapides (réutilisent design system IHM-1). Phase 1 backend (Plan 2) peut démarrer en parallèle dès que IHM-1 livré — auth pages utiliseront design system fourni par IHM-1.

**Update TASKS.md :** ajouter section "Track Frontend (IHM)" entre Phase 0 et Phase 1, avec liste plans IHM-1 à IHM-4. Phases backend numérotation inchangée.
