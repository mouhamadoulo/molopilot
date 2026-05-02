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

## Phase 0 — Fondations 🟦

**Objectif :** monorepo opérationnel, skeletons Next.js + NestJS, Postgres en local via Docker, schéma Prisma initial, CI verte.

**Plan :** `docs/superpowers/plans/2026-04-28-phase-0-fondations.md` _(à rédiger)_

| Tâche                                     | Statut | Date       | Notes                                                     |
| ----------------------------------------- | ------ | ---------- | --------------------------------------------------------- |
| Rédiger Plan 1 (Phase 0)                  | ✅     | 2026-05-01 | `docs/superpowers/plans/2026-04-28-phase-0-fondations.md` |
| Initialiser monorepo pnpm                 | ✅     | 2026-05-01 | `package.json`, `pnpm-workspace.yaml`, dotfiles           |
| TypeScript base config                    | ✅     | 2026-05-01 | `tsconfig.base.json` strict                               |
| Skeleton `apps/web` (Next.js 15)          | ✅     | 2026-05-01 | App Router, route `/api/health`, build OK                 |
| Skeleton `apps/api` (NestJS)              | ✅     | 2026-05-01 | Skeleton sans build — modules health/prisma en Task 13/14 |
| Package `packages/db` (Prisma)            | ✅     | 2026-05-01 | Skeleton — schéma complet en Task 8                       |
| Package `packages/shared` (zod DTOs)      | ✅     | 2026-05-01 | `TenantIdSchema` initial + tests node:test                |
| Docker Compose dev (Postgres)             | ⏸️     | 2026-05-01 | Fichiers OK — validation conteneur reportée (daemon down) |
| Schéma Prisma initial complet             | ✅     | 2026-05-02 | 9 modèles multi-tenant (§ 5 spec) + enums                 |
| Migration initiale + RLS policies         | ⬜     |            |                                                           |
| Config ESLint / Prettier / TS strict      | ✅     | 2026-05-01 | Flat config + plugin Prisma                               |
| Husky + lint-staged                       | ✅     | 2026-05-01 | `.husky/pre-commit` → `lint-staged`                       |
| GitHub Actions CI (lint, typecheck, test) | ⬜     |            |                                                           |
| README.md (run local)                     | ⬜     |            |                                                           |

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

| Date       | Décision                         | Raison                                                      |
| ---------- | -------------------------------- | ----------------------------------------------------------- |
| 2026-04-28 | Stack Next.js + NestJS séparés   | Découplage front/back, futur mobile possible                |
| 2026-04-28 | Pas de Stripe en V1              | Marché Sénégal — paiement abonnement manuel hors-app suffit |
| 2026-04-28 | Multi-tenant shared schema + RLS | Simplicité ops + isolation DB en defense-in-depth           |
