# Molopilot

SaaS de gestion d'établissements (restaurants, cafés, boutiques) — marché Sénégal et Afrique francophone.

> **Statut :** Phase 0 — Fondations. Voir [TASKS.md](TASKS.md) pour l'avancement et [CLAUDE.md](CLAUDE.md) pour la stack et les conventions.

## Pré-requis

- Node.js ≥ 20
- pnpm ≥ 9 (`npm i -g pnpm@9.12.0`)
- PostgreSQL ≥ 16 — local natif (port 5433 en dev) ou Docker

## Setup

```bash
pnpm install
cp .env.example .env   # éditer si ton port/user/pwd Postgres diffère
pnpm db:generate       # générer le client Prisma
pnpm db:migrate        # appliquer les migrations (init + RLS)
```

### Postgres local

Deux options :

- **Natif (recommandé en dev)** — installer PostgreSQL, créer les bases :
  ```sql
  CREATE DATABASE molopilot;
  CREATE DATABASE molopilot_shadow;
  ```
- **Docker** — `pnpm docker:up` (compose fourni dans le repo).

Adapter `DATABASE_URL` et `SHADOW_DATABASE_URL` dans `.env` selon le port (5432 par défaut, 5433 si Postgres natif Windows partage l'hôte).

## Scripts

| Commande            | Effet                                       |
| ------------------- | ------------------------------------------- |
| `pnpm dev`          | Lance `apps/web` + `apps/api` en parallèle  |
| `pnpm build`        | Build récursif de tous les workspaces       |
| `pnpm lint`         | ESLint sur tout le repo (warnings = erreur) |
| `pnpm format`       | Prettier write                              |
| `pnpm format:check` | Prettier vérification (CI)                  |
| `pnpm typecheck`    | `tsc --noEmit` sur tous les workspaces      |
| `pnpm test`         | Tests unitaires (récursif)                  |
| `pnpm db:generate`  | Génère le client Prisma                     |
| `pnpm db:migrate`   | Applique les migrations dev                 |
| `pnpm db:seed`      | Seed dev (à venir)                          |
| `pnpm docker:up`    | Démarre Postgres via docker-compose         |

## Structure

```
apps/
  web/        Next.js 15 (App Router, RSC) — front client + back-office
  api/        NestJS — API métier
packages/
  db/         Prisma schema + client + migrations
  shared/     Types DTO partagés (zod)
docs/
  superpowers/specs/  Spec V1
  superpowers/plans/  Plans d'implémentation par phase
```

## Multi-tenant

Toute table métier porte `tenant_id`. Isolation à deux couches : Prisma extends (applicatif) + Postgres RLS (defense-in-depth). Les policies RLS sont appliquées par la migration `20260502140253_add_rls_policies` et utilisent `current_setting('app.current_tenant_id')`.

## CI

GitHub Actions exécute lint, format check, typecheck, migrations Prisma et tests à chaque push/PR sur `main`. Voir [.github/workflows/ci.yml](.github/workflows/ci.yml).
