# Molopilot — Suivi des tâches

> Fichier vivant. Mis à jour **dans le même commit** que le code concerné. Source de vérité de l'avancement.

## Légende statuts

- ⬜ **À faire**
- 🟦 **En cours**
- ✅ **Terminé**
- ⏸️ **Bloqué / en attente** (préciser raison)
- ❌ **Abandonné** (préciser raison)

---

## Phase amont — Cadrage

| Tâche                    | Statut | Date       | Notes                                                        |
| ------------------------ | ------ | ---------- | ------------------------------------------------------------ |
| Brainstorming SaaS V1    | ✅     | 2026-04-28 | Voir spec                                                    |
| Spec V1 rédigé et validé | ✅     | 2026-04-28 | `docs/superpowers/specs/2026-04-28-molopilot-saas-design.md` |
| CLAUDE.md initial        | ✅     | 2026-04-28 | Stack, conventions, phases                                   |
| TASKS.md initial         | ✅     | 2026-04-28 | Ce fichier                                                   |

---

## Phase 0 — Fondations ✅

**Objectif :** monorepo opérationnel, skeletons Next.js + NestJS, Postgres en local via Docker, schéma Prisma initial, CI verte.

**Plan :** `docs/superpowers/plans/2026-04-28-phase-0-fondations.md` _(à rédiger)_

| Tâche                                     | Statut | Date       | Notes                                                                                                     |
| ----------------------------------------- | ------ | ---------- | --------------------------------------------------------------------------------------------------------- |
| Rédiger Plan 1 (Phase 0)                  | ✅     | 2026-05-01 | `docs/superpowers/plans/2026-04-28-phase-0-fondations.md`                                                 |
| Initialiser monorepo pnpm                 | ✅     | 2026-05-01 | `package.json`, `pnpm-workspace.yaml`, dotfiles                                                           |
| TypeScript base config                    | ✅     | 2026-05-01 | `tsconfig.base.json` strict                                                                               |
| Skeleton `apps/web` (Next.js 15)          | ✅     | 2026-05-01 | App Router, route `/api/health`, build OK                                                                 |
| Skeleton `apps/api` (NestJS)              | ✅     | 2026-05-01 | Skeleton sans build — modules health/prisma en Task 13/14                                                 |
| Package `packages/db` (Prisma)            | ✅     | 2026-05-01 | Skeleton — schéma complet en Task 8                                                                       |
| Package `packages/shared` (zod DTOs)      | ✅     | 2026-05-01 | `TenantIdSchema` initial + tests node:test                                                                |
| Docker Compose dev (Postgres)             | ❌     | 2026-05-02 | Remplacé par PG18 natif (port 5433) — Docker réservé prod                                                 |
| Schéma Prisma initial complet             | ✅     | 2026-05-02 | 9 modèles multi-tenant (§ 5 spec) + enums                                                                 |
| Migration initiale + RLS policies         | ✅     | 2026-05-02 | `20260502140252_init` + `20260502140253_add_rls_policies` — RLS FORCE sur 8 tables métier                 |
| Config ESLint / Prettier / TS strict      | ✅     | 2026-05-01 | Flat config + plugin Prisma                                                                               |
| Husky + lint-staged                       | ✅     | 2026-05-01 | `.husky/pre-commit` → `lint-staged`                                                                       |
| GitHub Actions CI (lint, typecheck, test) | ✅     | 2026-05-02 | `.github/workflows/ci.yml` — Postgres 16 service, migrate deploy, typecheck filtre `!api` jusqu'à Phase 1 |
| README.md (run local)                     | ✅     | 2026-05-02 | Setup, scripts, structure, multi-tenant, CI                                                               |

---

## Track Frontend (IHM) — parallèle aux phases backend

> Track parallèle à la roadmap backend. Préfixe `IHM-` pour éviter conflit avec numérotation Plan 1..10. Plan IHM-1 fournit le design system utilisé par toutes les phases suivantes (auth, back-office, caisse).

### Plan IHM-1 — Design system + Landing `/` ✅

**Objectif :** identité visuelle Molopilot, page d'accueil convertit visiteur → "Créer mon compte", primitives UI réutilisables Phase 1+.

**Spec :** `docs/superpowers/specs/2026-05-02-ihm-foundation-design.md`
**Plan :** `docs/superpowers/plans/2026-05-03-ihm-1-foundation-landing.md`

| Tâche                                       | Statut | Date       | Notes                                        |
| ------------------------------------------- | ------ | ---------- | -------------------------------------------- |
| Tailwind v4 + tokens CSS-first              | ✅     | 2026-05-03 | `globals.css` `@theme`, palette Vibrant Afro |
| Polices self-hostées (Inter + Plus Jakarta) | ✅     | 2026-05-03 | `next/font/local`, preload Plus Jakarta 800  |
| Primitives UI (Button, Container, …)        | ✅     | 2026-05-03 | 5 composants `components/ui/`                |
| Landing `/` (Hero, PainPoints, Features, …) | ✅     | 2026-05-05 | Route group `(marketing)`, 6 sections        |
| Pages erreur (404 + error boundary)         | ✅     | 2026-05-05 | `app/not-found.tsx`, `app/error.tsx`         |
| SEO (metadata, robots, sitemap, og)         | ✅     | 2026-05-05 | OG image placeholder, lang fr, locale fr_SN  |
| Smoke E2E Playwright + axe-core             | ✅     | 2026-05-03 | `apps/web/e2e/landing.spec.ts`               |
| Lighthouse CI (Perf 90, A11y 95, SEO 90)    | ✅     | 2026-05-05 | `lighthouserc.json` + job CI                 |

### Plan IHM-2 — Page `/tarifs` ⬜

| Tâche              | Statut | Date | Notes                         |
| ------------------ | ------ | ---- | ----------------------------- |
| Rédiger Plan IHM-2 | ⬜     |      | Réutilise design system IHM-1 |

### Plan IHM-3 — Page `/contact` ⬜

| Tâche              | Statut | Date | Notes |
| ------------------ | ------ | ---- | ----- |
| Rédiger Plan IHM-3 | ⬜     |      |       |

### Plan IHM-4 — Page `/mentions-legales` ⬜

| Tâche              | Statut | Date | Notes              |
| ------------------ | ------ | ---- | ------------------ |
| Rédiger Plan IHM-4 | ⬜     |      | Conformité Sénégal |

---

## Phase 1 — Auth + multi-tenant + RLS ⬜

| Tâche          | Statut | Date | Notes                 |
| -------------- | ------ | ---- | --------------------- |
| Rédiger Plan 2 | ⬜     |      | À faire après Phase 0 |

---

## Phase 2 — Catalogue ⬜

| Tâche          | Statut | Date | Notes |
| -------------- | ------ | ---- | ----- |
| Rédiger Plan 3 | ⬜     |      |       |

---

## Phase 3 — Stock ⬜

| Tâche          | Statut | Date | Notes |
| -------------- | ------ | ---- | ----- |
| Rédiger Plan 4 | ⬜     |      |       |

---

## Phase 4 — Caisse online ⬜

| Tâche          | Statut | Date | Notes |
| -------------- | ------ | ---- | ----- |
| Rédiger Plan 5 | ⬜     |      |       |

---

## Phase 5 — Caisse offline + sync ⬜

| Tâche          | Statut | Date | Notes |
| -------------- | ------ | ---- | ----- |
| Rédiger Plan 6 | ⬜     |      |       |

---

## Phase 6 — Auth caissier PIN + JWT device ⬜

| Tâche          | Statut | Date | Notes |
| -------------- | ------ | ---- | ----- |
| Rédiger Plan 7 | ⬜     |      |       |

---

## Phase 7 — Rapports ⬜

| Tâche          | Statut | Date | Notes |
| -------------- | ------ | ---- | ----- |
| Rédiger Plan 8 | ⬜     |      |       |

---

## Phase 8 — Multi-établissement UI ⬜

| Tâche          | Statut | Date | Notes |
| -------------- | ------ | ---- | ----- |
| Rédiger Plan 9 | ⬜     |      |       |

---

## Phase 9 — Polish + observabilité ⬜

| Tâche           | Statut | Date | Notes |
| --------------- | ------ | ---- | ----- |
| Rédiger Plan 10 | ⬜     |      |       |

---

## Décisions / changements en cours de route

| Date       | Décision                           | Raison                                                      |
| ---------- | ---------------------------------- | ----------------------------------------------------------- |
| 2026-04-28 | Stack Next.js + NestJS séparés     | Découplage front/back, futur mobile possible                |
| 2026-04-28 | Pas de Stripe en V1                | Marché Sénégal — paiement abonnement manuel hors-app suffit |
| 2026-04-28 | Multi-tenant shared schema + RLS   | Simplicité ops + isolation DB en defense-in-depth           |
| 2026-05-02 | PG18 natif local au lieu de Docker | Docker daemon instable Windows — Docker reste cible prod    |
