# Phase 0 — Fondations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mettre en place le squelette monorepo (pnpm workspaces) avec `apps/web` (Next.js 15), `apps/api` (NestJS), `packages/db` (Prisma) et `packages/shared` (zod), Postgres via Docker, schéma Prisma initial complet selon le spec, RLS Postgres activée et testée, configs lint/format/type partagées, CI GitHub Actions verte. À l'issue : un dev clone, lance `pnpm install` puis `pnpm dev`, et obtient front + API + DB qui démarrent et un test d'intégration RLS qui passe.

**Architecture:** Monorepo pnpm. Front Next.js 15 App Router (TS strict, RSC) dans `apps/web`. API NestJS modulaire dans `apps/api`. Schéma Prisma centralisé dans `packages/db`, importé par l'API. DTOs zod partagés dans `packages/shared`. Postgres local via `docker-compose.yml`. CI GitHub Actions exécute lint + typecheck + tests sur chaque PR.

**Tech Stack:** Node 20 LTS, pnpm 9, TypeScript 5 strict, Next.js 15, NestJS 10, Prisma 5, Postgres 16, Docker, ESLint 9 (flat config), Prettier 3, Husky 9, lint-staged 15, Jest 29, Testcontainers, GitHub Actions.

**Conventions du projet :**
- Tous les commits suivent Conventional Commits.
- Après chaque tâche complétée, mettre à jour `TASKS.md` à la racine **dans le même commit** que le code de la tâche.
- Si une convention nouvelle apparaît, l'ajouter à `CLAUDE.md` dans le même commit.

---

## File Structure prévue à la fin de la Phase 0

```
molopilot/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .husky/
│   └── pre-commit
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   ├── health/
│   │   │   │   ├── health.controller.ts
│   │   │   │   ├── health.module.ts
│   │   │   │   └── health.controller.spec.ts
│   │   │   └── prisma/
│   │   │       ├── prisma.service.ts
│   │   │       └── prisma.module.ts
│   │   ├── test/
│   │   │   └── rls.e2e-spec.ts
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   └── web/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── api/health/route.ts
│       ├── public/
│       ├── next.config.mjs
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── db/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   │   └── 0_init/
│   │   │   │       └── migration.sql
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── docker-compose.yml
├── .editorconfig
├── .gitignore
├── .npmrc
├── .nvmrc
├── .prettierrc.json
├── .prettierignore
├── eslint.config.mjs
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── README.md
├── CLAUDE.md          (déjà existant)
└── TASKS.md           (déjà existant)
```

**Responsabilités par fichier clé :**
- `package.json` racine : scripts agrégés (`dev`, `build`, `lint`, `typecheck`, `test`).
- `pnpm-workspace.yaml` : déclare les workspaces.
- `tsconfig.base.json` : base TS strict, étendu par chaque package.
- `eslint.config.mjs` : flat config ESLint partagée.
- `apps/api/src/prisma/prisma.service.ts` : client Prisma injecté dans NestJS, gestion lifecycle.
- `packages/db/prisma/schema.prisma` : modèles Tenant, Establishment, User, Category, Product, StockLevel, StockMovement, Sale, SaleItem (selon spec § 5).
- `apps/api/test/rls.e2e-spec.ts` : test critique d'isolation tenant via Testcontainers.

---

## Task 1: Initialiser le monorepo pnpm

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `.npmrc`
- Create: `.nvmrc`
- Create: `.editorconfig`

- [ ] **Step 1: Créer `.nvmrc`**

```
20
```

- [ ] **Step 2: Créer `.npmrc`**

```
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=false
```

- [ ] **Step 3: Créer `.editorconfig`**

```
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 4: Créer `.gitignore`**

```
# Dependencies
node_modules/
.pnpm-store/

# Build
dist/
.next/
out/
build/
*.tsbuildinfo

# Env
.env
.env.local
.env.*.local
!.env.example

# Logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# IDE
.vscode/
!.vscode/settings.json.example
.idea/

# OS
.DS_Store
Thumbs.db

# Test
coverage/
.nyc_output/

# Prisma
packages/db/prisma/.env

# Docker
.docker-data/
```

- [ ] **Step 5: Créer `pnpm-workspace.yaml`**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 6: Créer `package.json` racine**

```json
{
  "name": "molopilot",
  "version": "0.0.0",
  "private": true,
  "packageManager": "pnpm@9.12.0",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "dev": "pnpm -r --parallel --filter \"./apps/*\" dev",
    "build": "pnpm -r build",
    "lint": "eslint . --max-warnings 0",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test",
    "db:generate": "pnpm --filter @molopilot/db generate",
    "db:migrate": "pnpm --filter @molopilot/db migrate",
    "db:seed": "pnpm --filter @molopilot/db seed",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "prepare": "husky"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "eslint": "^9.13.0",
    "@eslint/js": "^9.13.0",
    "typescript-eslint": "^8.10.0",
    "eslint-plugin-import": "^2.31.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.3.3",
    "husky": "^9.1.6",
    "lint-staged": "^15.2.10",
    "typescript": "^5.6.3"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,mjs,cjs}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml,prisma}": [
      "prettier --write"
    ]
  }
}
```

- [ ] **Step 7: Installer dépendances racine**

Run:
```bash
pnpm install
```
Expected : crée `pnpm-lock.yaml`, télécharge ESLint, Prettier, Husky, etc. Pas de packages workspace à résoudre encore.

- [ ] **Step 8: Mettre à jour TASKS.md**

Dans `TASKS.md`, section Phase 0, marquer "Initialiser monorepo pnpm" en ✅ avec la date du jour (`2026-04-28`).

- [ ] **Step 9: Commit**

```bash
git add .gitignore .nvmrc .npmrc .editorconfig package.json pnpm-workspace.yaml pnpm-lock.yaml TASKS.md
git commit -m "chore: initialize pnpm monorepo with shared dev tooling"
```

---

## Task 2: TypeScript base config

**Files:**
- Create: `tsconfig.base.json`

- [ ] **Step 1: Créer `tsconfig.base.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "incremental": true
  },
  "exclude": ["**/node_modules", "**/dist", "**/.next"]
}
```

- [ ] **Step 2: Mettre à jour TASKS.md**

Ajouter ligne "TypeScript base config" ✅ dans Phase 0.

- [ ] **Step 3: Commit**

```bash
git add tsconfig.base.json TASKS.md
git commit -m "chore: add shared strict TypeScript base config"
```

---

## Task 3: ESLint + Prettier flat config partagés

**Files:**
- Create: `eslint.config.mjs`
- Create: `.prettierrc.json`
- Create: `.prettierignore`

- [ ] **Step 1: Créer `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-prisma"]
}
```

- [ ] **Step 2: Installer plugin Prettier Prisma**

Run :
```bash
pnpm add -Dw prettier-plugin-prisma
```

- [ ] **Step 3: Créer `.prettierignore`**

```
node_modules
dist
.next
out
build
coverage
pnpm-lock.yaml
*.tsbuildinfo
packages/db/prisma/migrations
```

- [ ] **Step 4: Créer `eslint.config.mjs`**

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
      'packages/db/prisma/migrations/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { import: importPlugin },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  prettier,
];
```

- [ ] **Step 5: Vérifier que `pnpm lint` ne plante pas**

Run :
```bash
pnpm lint
```
Expected : exit 0, aucun fichier TS encore donc rien à analyser. Si ça plante, ajuster avant de commit.

- [ ] **Step 6: Mettre à jour TASKS.md**

Ajouter ligne "ESLint + Prettier" ✅.

- [ ] **Step 7: Commit**

```bash
git add eslint.config.mjs .prettierrc.json .prettierignore package.json pnpm-lock.yaml TASKS.md
git commit -m "chore: add shared ESLint flat config and Prettier with Prisma plugin"
```

---

## Task 4: Husky + lint-staged pre-commit hook

**Files:**
- Create: `.husky/pre-commit`

- [ ] **Step 1: Initialiser husky**

Run :
```bash
pnpm exec husky init
```
Expected : crée `.husky/pre-commit` avec `npm test`.

- [ ] **Step 2: Remplacer le contenu de `.husky/pre-commit`**

```bash
pnpm exec lint-staged
```

- [ ] **Step 3: Tester avec un fichier bidon**

Run :
```bash
echo "const x: number = 1" > scratch.ts
git add scratch.ts
git commit -m "test: husky"
```
Expected : le hook exécute `lint-staged`, qui lint + format `scratch.ts` et autorise le commit.

- [ ] **Step 4: Annuler le commit de test**

Run :
```bash
git reset --soft HEAD~1
git restore --staged scratch.ts
rm scratch.ts
```

- [ ] **Step 5: Mettre à jour TASKS.md**

Marquer "Husky + lint-staged" ✅.

- [ ] **Step 6: Commit**

```bash
git add .husky TASKS.md
git commit -m "chore: configure husky pre-commit with lint-staged"
```

---

## Task 5: Initialiser `packages/shared` (zod DTOs)

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/index.spec.ts`

- [ ] **Step 1: Créer `packages/shared/package.json`**

```json
{
  "name": "@molopilot/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "node --test --experimental-strip-types --import tsx src/**/*.spec.ts"
  },
  "dependencies": {
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "tsx": "^4.19.1",
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 2: Créer `packages/shared/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "composite": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Écrire le test failing**

Fichier `packages/shared/src/index.spec.ts` :

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TenantIdSchema } from './index';

test('TenantIdSchema accepts valid uuid', () => {
  const result = TenantIdSchema.safeParse('123e4567-e89b-12d3-a456-426614174000');
  assert.equal(result.success, true);
});

test('TenantIdSchema rejects empty string', () => {
  const result = TenantIdSchema.safeParse('');
  assert.equal(result.success, false);
});
```

- [ ] **Step 4: Lancer le test pour confirmer l'échec**

Run :
```bash
pnpm --filter @molopilot/shared test
```
Expected : FAIL — `TenantIdSchema` non exporté.

- [ ] **Step 5: Implémenter `packages/shared/src/index.ts`**

```ts
import { z } from 'zod';

export const TenantIdSchema = z.string().uuid();
export type TenantId = z.infer<typeof TenantIdSchema>;
```

- [ ] **Step 6: Installer + relancer le test**

Run :
```bash
pnpm install
pnpm --filter @molopilot/shared test
```
Expected : PASS.

- [ ] **Step 7: Vérifier le typecheck**

Run :
```bash
pnpm --filter @molopilot/shared typecheck
```
Expected : exit 0.

- [ ] **Step 8: Mettre à jour TASKS.md**

Marquer "Package `packages/shared` (zod DTOs)" ✅.

- [ ] **Step 9: Commit**

```bash
git add packages/shared pnpm-lock.yaml TASKS.md
git commit -m "feat(shared): bootstrap zod DTO package with TenantIdSchema"
```

---

## Task 6: Initialiser `packages/db` (Prisma)

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/prisma/schema.prisma` (skeleton, modèles ajoutés Task 9)

- [ ] **Step 1: Créer `packages/db/package.json`**

```json
{
  "name": "@molopilot/db",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "generate": "prisma generate",
    "migrate": "prisma migrate dev",
    "migrate:deploy": "prisma migrate deploy",
    "seed": "tsx prisma/seed.ts",
    "studio": "prisma studio",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@prisma/client": "^5.20.0"
  },
  "devDependencies": {
    "prisma": "^5.20.0",
    "tsx": "^4.19.1",
    "typescript": "^5.6.3"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 2: Créer `packages/db/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": ".",
    "composite": true,
    "declaration": true
  },
  "include": ["src/**/*", "prisma/seed.ts"]
}
```

- [ ] **Step 3: Créer le squelette `packages/db/prisma/schema.prisma`**

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

- [ ] **Step 4: Créer `packages/db/src/index.ts`**

```ts
export { PrismaClient } from '@prisma/client';
export type {
  Prisma,
} from '@prisma/client';
```

- [ ] **Step 5: Installer les dépendances**

Run :
```bash
pnpm install
```

- [ ] **Step 6: Mettre à jour TASKS.md**

Marquer "Package `packages/db` (Prisma)" ✅.

- [ ] **Step 7: Commit**

```bash
git add packages/db pnpm-lock.yaml TASKS.md
git commit -m "feat(db): bootstrap @molopilot/db package with empty Prisma schema"
```

---

## Task 7: Docker Compose Postgres pour le dev

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`

- [ ] **Step 1: Créer `.env.example`**

```env
DATABASE_URL=postgresql://molopilot:molopilot@localhost:5432/molopilot?schema=public
SHADOW_DATABASE_URL=postgresql://molopilot:molopilot@localhost:5432/molopilot_shadow?schema=public

API_PORT=3001
WEB_PORT=3000

NEXT_PUBLIC_API_URL=http://localhost:3001
JWT_SECRET=dev-only-change-in-prod-please
```

- [ ] **Step 2: Créer `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: molopilot-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: molopilot
      POSTGRES_PASSWORD: molopilot
      POSTGRES_DB: molopilot
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/postgres-init.sh:/docker-entrypoint-initdb.d/init.sh:ro
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U molopilot -d molopilot']
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  postgres_data:
```

- [ ] **Step 3: Créer `scripts/postgres-init.sh`**

```bash
#!/bin/sh
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE molopilot_shadow OWNER $POSTGRES_USER;
EOSQL
```

Run :
```bash
chmod +x scripts/postgres-init.sh
```

- [ ] **Step 4: Démarrer Postgres**

Run :
```bash
pnpm docker:up
docker compose ps
```
Expected : container `molopilot-postgres` healthy après ~10s.

- [ ] **Step 5: Vérifier la connexion**

Run :
```bash
docker exec -it molopilot-postgres psql -U molopilot -d molopilot -c '\l'
```
Expected : liste les bases dont `molopilot` et `molopilot_shadow`.

- [ ] **Step 6: Copier .env.example vers .env (local uniquement, pas commité)**

Run :
```bash
cp .env.example .env
```

- [ ] **Step 7: Mettre à jour TASKS.md**

Marquer "Docker Compose dev (Postgres)" ✅.

- [ ] **Step 8: Commit**

```bash
git add docker-compose.yml .env.example scripts/postgres-init.sh TASKS.md
git commit -m "chore(infra): add Postgres docker-compose with shadow DB for migrations"
```

---

## Task 8: Schéma Prisma initial complet (selon spec § 5)

**Files:**
- Modify: `packages/db/prisma/schema.prisma`

- [ ] **Step 1: Remplacer le contenu de `packages/db/prisma/schema.prisma`**

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

enum EstablishmentType {
  RESTO
  CAFE
  BOUTIQUE
}

enum UserRole {
  OWNER
  MANAGER
  CASHIER
}

enum ProductUnit {
  PIECE
  KG
  L
}

enum StockReason {
  SALE
  PURCHASE
  ADJUST
  TRANSFER
  LOSS
}

enum StockMovementRefType {
  SALE
  MANUAL
}

enum SaleStatus {
  DRAFT
  PAID
  VOIDED
}

enum PaymentMethod {
  CASH
  WAVE
  OM
  MIXED
}

// ─────────────────────────────────────────────────────────────────────────────
// Tenant & users
// ─────────────────────────────────────────────────────────────────────────────

model Tenant {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  slug      String   @unique
  plan      String   @default("trial")
  createdAt DateTime @default(now()) @map("created_at")

  establishments Establishment[]
  users          User[]
  categories     Category[]
  products       Product[]
  stockLevels    StockLevel[]
  stockMovements StockMovement[]
  sales          Sale[]
  saleItems      SaleItem[]

  @@map("tenant")
}

model Establishment {
  id        String            @id @default(uuid()) @db.Uuid
  tenantId  String            @map("tenant_id") @db.Uuid
  name      String
  type      EstablishmentType
  timezone  String            @default("Africa/Dakar")
  currency  String            @default("XOF")
  createdAt DateTime          @default(now()) @map("created_at")

  tenant         Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  users          User[]
  stockLevels    StockLevel[]
  stockMovements StockMovement[]
  sales          Sale[]

  @@index([tenantId])
  @@map("establishment")
}

model User {
  id              String    @id @default(uuid()) @db.Uuid
  tenantId        String    @map("tenant_id") @db.Uuid
  email           String?
  passwordHash    String?   @map("password_hash")
  pinHash         String?   @map("pin_hash")
  role            UserRole
  establishmentId String?   @map("establishment_id") @db.Uuid
  createdAt       DateTime  @default(now()) @map("created_at")

  tenant        Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  establishment Establishment? @relation(fields: [establishmentId], references: [id], onDelete: SetNull)
  cashierSales  Sale[]         @relation("SaleCashier")
  stockMovements StockMovement[]

  @@unique([tenantId, email])
  @@index([tenantId])
  @@map("app_user")
}

// ─────────────────────────────────────────────────────────────────────────────
// Catalogue
// ─────────────────────────────────────────────────────────────────────────────

model Category {
  id        String   @id @default(uuid()) @db.Uuid
  tenantId  String   @map("tenant_id") @db.Uuid
  name      String
  sortOrder Int      @default(0) @map("sort_order")
  archived  Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  tenant   Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  products Product[]

  @@index([tenantId])
  @@map("category")
}

model Product {
  id          String      @id @default(uuid()) @db.Uuid
  tenantId    String      @map("tenant_id") @db.Uuid
  sku         String
  name        String
  categoryId  String?     @map("category_id") @db.Uuid
  priceCents  Int         @map("price_cents")
  costCents   Int         @default(0) @map("cost_cents")
  taxRate     Decimal     @default(0) @map("tax_rate") @db.Decimal(5, 4)
  trackStock  Boolean     @default(true) @map("track_stock")
  archived    Boolean     @default(false)
  unit        ProductUnit @default(PIECE)
  barcode     String?
  createdAt   DateTime    @default(now()) @map("created_at")

  tenant         Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  category       Category?       @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  stockLevels    StockLevel[]
  stockMovements StockMovement[]
  saleItems      SaleItem[]

  @@unique([tenantId, sku])
  @@index([tenantId])
  @@index([tenantId, barcode])
  @@map("product")
}

// ─────────────────────────────────────────────────────────────────────────────
// Stock
// ─────────────────────────────────────────────────────────────────────────────

model StockLevel {
  id              String   @id @default(uuid()) @db.Uuid
  tenantId        String   @map("tenant_id") @db.Uuid
  productId       String   @map("product_id") @db.Uuid
  establishmentId String   @map("establishment_id") @db.Uuid
  quantity        Decimal  @default(0) @db.Decimal(12, 3)
  lowThreshold    Decimal  @default(0) @map("low_threshold") @db.Decimal(12, 3)
  updatedAt       DateTime @updatedAt @map("updated_at")

  tenant        Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  product       Product       @relation(fields: [productId], references: [id], onDelete: Cascade)
  establishment Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)

  @@unique([productId, establishmentId])
  @@index([tenantId])
  @@map("stock_level")
}

model StockMovement {
  id              String               @id @default(uuid()) @db.Uuid
  tenantId        String               @map("tenant_id") @db.Uuid
  productId       String               @map("product_id") @db.Uuid
  establishmentId String               @map("establishment_id") @db.Uuid
  delta           Decimal              @db.Decimal(12, 3)
  reason          StockReason
  refType         StockMovementRefType @map("ref_type")
  refId           String?              @map("ref_id") @db.Uuid
  userId          String?              @map("user_id") @db.Uuid
  createdAt       DateTime             @default(now()) @map("created_at")

  tenant        Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  product       Product       @relation(fields: [productId], references: [id], onDelete: Cascade)
  establishment Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  user          User?         @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([tenantId])
  @@index([tenantId, productId])
  @@index([tenantId, createdAt])
  @@map("stock_movement")
}

// ─────────────────────────────────────────────────────────────────────────────
// Ventes
// ─────────────────────────────────────────────────────────────────────────────

model Sale {
  id              String        @id @default(uuid()) @db.Uuid
  tenantId        String        @map("tenant_id") @db.Uuid
  establishmentId String        @map("establishment_id") @db.Uuid
  cashierId       String?       @map("cashier_id") @db.Uuid
  clientUuid      String        @map("client_uuid") @db.Uuid
  status          SaleStatus    @default(PAID)
  totalCents      Int           @map("total_cents")
  paidCents       Int           @map("paid_cents")
  paymentMethod   PaymentMethod @map("payment_method")
  notes           String?
  createdAt       DateTime      @default(now()) @map("created_at")
  syncedAt        DateTime?     @map("synced_at")
  voidedAt        DateTime?     @map("voided_at")

  tenant        Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  establishment Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  cashier       User?         @relation("SaleCashier", fields: [cashierId], references: [id], onDelete: SetNull)
  items         SaleItem[]

  @@unique([tenantId, clientUuid])
  @@index([tenantId, createdAt])
  @@index([tenantId, establishmentId, createdAt])
  @@map("sale")
}

model SaleItem {
  id             String  @id @default(uuid()) @db.Uuid
  tenantId       String  @map("tenant_id") @db.Uuid
  saleId         String  @map("sale_id") @db.Uuid
  productId      String  @map("product_id") @db.Uuid
  qty            Decimal @db.Decimal(12, 3)
  unitPriceCents Int     @map("unit_price_cents")
  lineTotalCents Int     @map("line_total_cents")
  taxCents       Int     @default(0) @map("tax_cents")

  tenant  Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  sale    Sale    @relation(fields: [saleId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([saleId])
  @@map("sale_item")
}
```

- [ ] **Step 2: Vérifier la syntaxe**

Run :
```bash
pnpm --filter @molopilot/db exec prisma validate
```
Expected : `The schema at packages/db/prisma/schema.prisma is valid 🚀`.

- [ ] **Step 3: Formatter le fichier**

Run :
```bash
pnpm --filter @molopilot/db exec prisma format
```

- [ ] **Step 4: Mettre à jour TASKS.md**

Marquer "Schéma Prisma initial complet" ✅.

- [ ] **Step 5: Commit**

```bash
git add packages/db/prisma/schema.prisma TASKS.md
git commit -m "feat(db): add full V1 Prisma schema (tenant, catalog, stock, sales)"
```

---

## Task 9: Première migration Prisma

**Files:**
- Create: `packages/db/prisma/migrations/0_init/migration.sql` (généré)

- [ ] **Step 1: Créer la migration initiale**

S'assurer que Postgres tourne (`pnpm docker:up`), `.env` à la racine présent, puis :

Run :
```bash
pnpm --filter @molopilot/db exec prisma migrate dev --name init
```
Expected : génère `packages/db/prisma/migrations/<timestamp>_init/migration.sql`, applique sur la DB locale, génère le client Prisma. Les enums et tables sont créés.

- [ ] **Step 2: Vérifier en SQL**

Run :
```bash
docker exec -it molopilot-postgres psql -U molopilot -d molopilot -c "\dt"
```
Expected : liste les tables `tenant`, `establishment`, `app_user`, `category`, `product`, `stock_level`, `stock_movement`, `sale`, `sale_item`.

- [ ] **Step 3: Mettre à jour TASKS.md**

Marquer "Migration initiale" ✅.

- [ ] **Step 4: Commit**

```bash
git add packages/db/prisma/migrations TASKS.md
git commit -m "feat(db): create initial migration applying V1 schema"
```

---

## Task 10: Activer Row Level Security (RLS)

**Files:**
- Create: `packages/db/prisma/migrations/<next>_rls/migration.sql` (manuelle)

- [ ] **Step 1: Créer la migration RLS manuellement**

Run :
```bash
pnpm --filter @molopilot/db exec prisma migrate dev --create-only --name rls
```
Expected : crée un nouveau dossier de migration vide.

- [ ] **Step 2: Remplacer le contenu de la migration RLS**

Localiser le fichier `packages/db/prisma/migrations/<latest_timestamp>_rls/migration.sql` et y mettre :

```sql
-- Enable RLS on all tenant-scoped tables and create isolation policies
-- driven by current_setting('app.current_tenant').

-- Helper expression: tenant uuid from session GUC, NULL when unset.
-- Using true as second arg = missing setting returns NULL instead of error.

ALTER TABLE "establishment"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app_user"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "category"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_level"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_movement"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sale"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sale_item"       ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners (defense-in-depth)
ALTER TABLE "establishment"   FORCE ROW LEVEL SECURITY;
ALTER TABLE "app_user"        FORCE ROW LEVEL SECURITY;
ALTER TABLE "category"        FORCE ROW LEVEL SECURITY;
ALTER TABLE "product"         FORCE ROW LEVEL SECURITY;
ALTER TABLE "stock_level"     FORCE ROW LEVEL SECURITY;
ALTER TABLE "stock_movement"  FORCE ROW LEVEL SECURITY;
ALTER TABLE "sale"            FORCE ROW LEVEL SECURITY;
ALTER TABLE "sale_item"       FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "establishment"
  USING (tenant_id::text = current_setting('app.current_tenant', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation ON "app_user"
  USING (tenant_id::text = current_setting('app.current_tenant', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation ON "category"
  USING (tenant_id::text = current_setting('app.current_tenant', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation ON "product"
  USING (tenant_id::text = current_setting('app.current_tenant', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation ON "stock_level"
  USING (tenant_id::text = current_setting('app.current_tenant', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation ON "stock_movement"
  USING (tenant_id::text = current_setting('app.current_tenant', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation ON "sale"
  USING (tenant_id::text = current_setting('app.current_tenant', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation ON "sale_item"
  USING (tenant_id::text = current_setting('app.current_tenant', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));
```

Note : la table `tenant` elle-même n'est PAS sous RLS — elle est gérée par la couche admin / signup.

- [ ] **Step 3: Appliquer la migration**

Run :
```bash
pnpm --filter @molopilot/db exec prisma migrate dev
```
Expected : applique le SQL ci-dessus, sortie `Migration applied successfully`.

- [ ] **Step 4: Vérifier les policies en SQL**

Run :
```bash
docker exec -it molopilot-postgres psql -U molopilot -d molopilot -c "\d+ product" | head -40
```
Expected : voir `Policies: tenant_isolation` listée sous la définition de la table.

- [ ] **Step 5: Mettre à jour TASKS.md**

Marquer "Migration initiale + RLS policies" ✅.

- [ ] **Step 6: Commit**

```bash
git add packages/db/prisma/migrations TASKS.md
git commit -m "feat(db): enable Postgres RLS with tenant_isolation policies"
```

---

## Task 11: Seed minimal pour le dev

**Files:**
- Create: `packages/db/prisma/seed.ts`

- [ ] **Step 1: Créer `packages/db/prisma/seed.ts`**

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const slug = 'demo-resto';

  await prisma.tenant.upsert({
    where: { slug },
    update: {},
    create: {
      name: 'Demo Resto Dakar',
      slug,
      plan: 'trial',
      establishments: {
        create: {
          name: 'Plateau',
          type: 'RESTO',
          timezone: 'Africa/Dakar',
          currency: 'XOF',
        },
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed OK: tenant demo-resto + establishment Plateau');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 2: Lancer le seed**

Le seed se fait via une connexion sans `app.current_tenant` qui doit pouvoir écrire `tenant` (pas de RLS dessus). Pour `establishment` créé via la relation, RLS bloquerait (`current_setting` est NULL). On contourne en créant un rôle bypass pour le seed.

Mais en pratique, Prisma migrate utilise déjà le superuser (`molopilot` propriétaire), et `FORCE ROW LEVEL SECURITY` s'applique aussi au propriétaire. Solution : avant le seed, désactiver RLS pour la session avec `SET LOCAL row_security = off` (réservé aux superusers et BYPASSRLS roles).

Modifier `seed.ts` pour exécuter cette commande au début :

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed runs with full DB credentials, bypass RLS for the seed transaction.
  await prisma.$executeRawUnsafe('SET row_security = off');

  const slug = 'demo-resto';

  await prisma.tenant.upsert({
    where: { slug },
    update: {},
    create: {
      name: 'Demo Resto Dakar',
      slug,
      plan: 'trial',
      establishments: {
        create: {
          name: 'Plateau',
          type: 'RESTO',
          timezone: 'Africa/Dakar',
          currency: 'XOF',
        },
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed OK: tenant demo-resto + establishment Plateau');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run :
```bash
pnpm db:seed
```
Expected : `Seed OK: tenant demo-resto + establishment Plateau`.

- [ ] **Step 3: Vérifier en SQL**

Run :
```bash
docker exec -it molopilot-postgres psql -U molopilot -d molopilot -c "SET row_security = off; SELECT slug FROM tenant; SELECT name, type FROM establishment;"
```
Expected : `demo-resto` listé, et `Plateau | RESTO`.

- [ ] **Step 4: Mettre à jour TASKS.md**

Ajouter une ligne "Seed dev minimal" ✅ dans Phase 0.

- [ ] **Step 5: Commit**

```bash
git add packages/db/prisma/seed.ts TASKS.md
git commit -m "feat(db): add minimal dev seed (demo tenant + establishment)"
```

---

## Task 12: Initialiser `apps/api` (NestJS)

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/tsconfig.build.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`

- [ ] **Step 1: Créer `apps/api/package.json`**

```json
{
  "name": "@molopilot/api",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main.js",
    "typecheck": "tsc --noEmit -p tsconfig.build.json",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.config.cjs"
  },
  "dependencies": {
    "@molopilot/db": "workspace:*",
    "@molopilot/shared": "workspace:*",
    "@nestjs/common": "^10.4.6",
    "@nestjs/core": "^10.4.6",
    "@nestjs/platform-express": "^10.4.6",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.7",
    "@nestjs/schematics": "^10.2.3",
    "@nestjs/testing": "^10.4.6",
    "@types/jest": "^29.5.13",
    "@types/supertest": "^6.0.2",
    "jest": "^29.7.0",
    "supertest": "^7.0.0",
    "testcontainers": "^10.13.2",
    "ts-jest": "^29.2.5",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 2: Créer `apps/api/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "dist",
    "baseUrl": "./",
    "incremental": true,
    "noEmit": false,
    "declaration": true
  },
  "include": ["src/**/*", "test/**/*"]
}
```

- [ ] **Step 3: Créer `apps/api/tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*.spec.ts"]
}
```

- [ ] **Step 4: Créer `apps/api/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

- [ ] **Step 5: Créer `apps/api/src/app.module.ts`**

```ts
import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, HealthModule],
})
export class AppModule {}
```

- [ ] **Step 6: Créer `apps/api/src/main.ts`**

```ts
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
}

void bootstrap();
```

- [ ] **Step 7: Installer**

Run :
```bash
pnpm install
```

- [ ] **Step 8: Mettre à jour TASKS.md**

Marquer "Skeleton `apps/api` (NestJS)" ✅.

- [ ] **Step 9: Commit (sans build encore — modules manquants ajoutés Task 13/14)**

```bash
git add apps/api/package.json apps/api/tsconfig.json apps/api/tsconfig.build.json apps/api/nest-cli.json apps/api/src/main.ts apps/api/src/app.module.ts pnpm-lock.yaml TASKS.md
git commit -m "feat(api): scaffold NestJS application skeleton"
```

---

## Task 13: PrismaService NestJS

**Files:**
- Create: `apps/api/src/prisma/prisma.service.ts`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Create: `apps/api/src/prisma/prisma.service.spec.ts`

- [ ] **Step 1: Écrire le test failing**

Fichier `apps/api/src/prisma/prisma.service.spec.ts` :

```ts
import { Test } from '@nestjs/testing';

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('extends PrismaClient', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    const service = moduleRef.get(PrismaService);
    expect(typeof service.$connect).toBe('function');
    expect(typeof service.$disconnect).toBe('function');
  });
});
```

- [ ] **Step 2: Créer `apps/api/src/prisma/prisma.service.ts`**

```ts
import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@molopilot/db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

- [ ] **Step 3: Créer `apps/api/src/prisma/prisma.module.ts`**

```ts
import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 4: Créer `apps/api/jest.config.cjs`**

```js
/** @type {import('jest').Config} */
module.exports = {
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',
};
```

- [ ] **Step 5: Lancer le test**

Run :
```bash
pnpm --filter @molopilot/api test
```
Expected : PASS — `PrismaService extends PrismaClient`.

- [ ] **Step 6: Mettre à jour TASKS.md**

Ajouter "PrismaService NestJS" ✅.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/prisma apps/api/jest.config.cjs TASKS.md
git commit -m "feat(api): add PrismaService with module-scoped lifecycle"
```

---

## Task 14: Endpoint `/health` API + test

**Files:**
- Create: `apps/api/src/health/health.controller.ts`
- Create: `apps/api/src/health/health.module.ts`
- Create: `apps/api/src/health/health.controller.spec.ts`

- [ ] **Step 1: Écrire le test failing**

Fichier `apps/api/src/health/health.controller.spec.ts` :

```ts
import { Test } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaQuery: jest.Mock;

  beforeEach(async () => {
    prismaQuery = jest.fn().mockResolvedValue([{ ok: 1 }]);
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: { $queryRaw: prismaQuery },
        },
      ],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('returns ok when DB responds', async () => {
    await expect(controller.check()).resolves.toEqual({ status: 'ok', db: 'ok' });
  });

  it('returns degraded when DB fails', async () => {
    prismaQuery.mockRejectedValueOnce(new Error('boom'));
    await expect(controller.check()).resolves.toEqual({ status: 'degraded', db: 'down' });
  });
});
```

- [ ] **Step 2: Lancer le test pour confirmer l'échec**

Run :
```bash
pnpm --filter @molopilot/api test
```
Expected : FAIL — `HealthController` n'existe pas.

- [ ] **Step 3: Implémenter `apps/api/src/health/health.controller.ts`**

```ts
import { Controller, Get } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<{ status: 'ok' | 'degraded'; db: 'ok' | 'down' }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'ok' };
    } catch {
      return { status: 'degraded', db: 'down' };
    }
  }
}
```

- [ ] **Step 4: Implémenter `apps/api/src/health/health.module.ts`**

```ts
import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

- [ ] **Step 5: Relancer les tests**

Run :
```bash
pnpm --filter @molopilot/api test
```
Expected : 2 specs PASS dans `health.controller.spec.ts`.

- [ ] **Step 6: Vérifier que l'API démarre**

Run dans un terminal :
```bash
pnpm --filter @molopilot/api dev
```
Puis dans un autre :
```bash
curl http://localhost:3001/health
```
Expected : `{"status":"ok","db":"ok"}`.

Stopper le serveur (Ctrl+C).

- [ ] **Step 7: Mettre à jour TASKS.md**

Ajouter "Endpoint /health API" ✅.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/health apps/api/src/app.module.ts TASKS.md
git commit -m "feat(api): add /health endpoint with DB ping"
```

---

## Task 15: Test d'intégration RLS critique (Testcontainers)

**Files:**
- Create: `apps/api/test/rls.e2e-spec.ts`
- Create: `apps/api/test/jest-e2e.config.cjs`

- [ ] **Step 1: Créer `apps/api/test/jest-e2e.config.cjs`**

```js
/** @type {import('jest').Config} */
module.exports = {
  rootDir: '..',
  testRegex: 'test/.*\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',
  testTimeout: 120000,
};
```

- [ ] **Step 2: Écrire le test E2E `apps/api/test/rls.e2e-spec.ts`**

```ts
import { execSync } from 'node:child_process';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '@molopilot/db';

const DB_PACKAGE = path.resolve(__dirname, '../../../packages/db');

describe('RLS tenant isolation', () => {
  let container: StartedPostgreSqlContainer;
  let dbUrl: string;
  let prisma: PrismaClient;

  const tenantA = randomUUID();
  const tenantB = randomUUID();

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
    dbUrl = container.getConnectionUri();

    execSync('pnpm exec prisma migrate deploy', {
      cwd: DB_PACKAGE,
      env: { ...process.env, DATABASE_URL: dbUrl },
      stdio: 'inherit',
    });

    prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

    // Create two tenants WITHOUT RLS context (tenant table is not RLS-protected).
    await prisma.tenant.create({ data: { id: tenantA, name: 'Tenant A', slug: 'a' } });
    await prisma.tenant.create({ data: { id: tenantB, name: 'Tenant B', slug: 'b' } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await container.stop();
  });

  async function withTenant<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${tenantId}'`);
      // Re-bind context using a sub-PrismaClient is not needed: SET LOCAL holds for the tx.
      // We fetch via tx so the GUC applies.
      return fn.call({ tx });
    }) as Promise<T>;
  }

  it('tenant A cannot see tenant B establishments', async () => {
    // Insert one establishment per tenant in their own context.
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${tenantA}'`);
      await tx.establishment.create({
        data: { tenantId: tenantA, name: 'A1', type: 'RESTO' },
      });
    });
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${tenantB}'`);
      await tx.establishment.create({
        data: { tenantId: tenantB, name: 'B1', type: 'CAFE' },
      });
    });

    const aSeesFromA = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${tenantA}'`);
      return tx.establishment.findMany();
    });
    expect(aSeesFromA.map((e) => e.name)).toEqual(['A1']);

    const bSeesFromB = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${tenantB}'`);
      return tx.establishment.findMany();
    });
    expect(bSeesFromB.map((e) => e.name)).toEqual(['B1']);
  });

  it('cross-tenant write is blocked by RLS WITH CHECK', async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${tenantA}'`);
        await tx.establishment.create({
          data: { tenantId: tenantB, name: 'malicious', type: 'BOUTIQUE' },
        });
      }),
    ).rejects.toThrow();
  });

  it('without GUC set, no rows are returned', async () => {
    const rows = await prisma.establishment.findMany();
    expect(rows).toEqual([]);
  });
});
```

> Note importante : `withTenant` n'est pas utilisé ci-dessus parce que `SET LOCAL` n'est valide que dans une transaction et le client Prisma ouvre une transaction par appel `$transaction`. Tous les tests utilisent ce pattern directement.

- [ ] **Step 3: Installer Testcontainers postgres**

Run :
```bash
pnpm --filter @molopilot/api add -D @testcontainers/postgresql
```

- [ ] **Step 4: Lancer le test E2E**

Pré-requis : Docker daemon disponible (Testcontainers en a besoin).

Run :
```bash
pnpm --filter @molopilot/api test:e2e
```
Expected : 3 specs PASS dans `rls.e2e-spec.ts`. Le démarrage du container peut prendre 30-60s la première fois.

- [ ] **Step 5: Mettre à jour TASKS.md**

Ajouter "Test RLS critique (Testcontainers)" ✅ dans Phase 0.

- [ ] **Step 6: Commit**

```bash
git add apps/api/test apps/api/package.json pnpm-lock.yaml TASKS.md
git commit -m "test(api): add RLS isolation e2e suite using Testcontainers"
```

---

## Task 16: Initialiser `apps/web` (Next.js 15)

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.mjs`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`
- Create: `apps/web/app/api/health/route.ts`

- [ ] **Step 1: Créer `apps/web/package.json`**

```json
{
  "name": "@molopilot/web",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start --port 3000",
    "typecheck": "tsc --noEmit",
    "test": "echo \"(no web unit tests in phase 0)\" && exit 0"
  },
  "dependencies": {
    "@molopilot/shared": "workspace:*",
    "next": "^15.0.2",
    "react": "^19.0.0-rc-69d4b800-20241021",
    "react-dom": "^19.0.0-rc-69d4b800-20241021"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 2: Créer `apps/web/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "ES2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "noEmit": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Créer `apps/web/next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@molopilot/shared'],
};

export default nextConfig;
```

- [ ] **Step 4: Créer `apps/web/app/layout.tsx`**

```tsx
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Molopilot',
  description: 'Gestion d’établissements pour resto, café, boutique',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Créer `apps/web/app/page.tsx`**

```tsx
export default function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Molopilot</h1>
      <p>SaaS de gestion d’établissements — Phase 0 OK.</p>
      <p>
        API health : <code>http://localhost:3001/health</code>
      </p>
    </main>
  );
}
```

- [ ] **Step 6: Créer `apps/web/app/api/health/route.ts`**

```ts
export async function GET(): Promise<Response> {
  return Response.json({ status: 'ok', service: 'web' });
}
```

- [ ] **Step 7: Installer**

Run :
```bash
pnpm install
```

- [ ] **Step 8: Lancer le serveur de dev et vérifier**

Run :
```bash
pnpm --filter @molopilot/web dev
```
Dans un autre terminal :
```bash
curl http://localhost:3000/api/health
```
Expected : `{"status":"ok","service":"web"}`.

Visiter `http://localhost:3000` dans un navigateur — doit afficher la page d'accueil.

Stopper (Ctrl+C).

- [ ] **Step 9: Vérifier le typecheck**

Run :
```bash
pnpm --filter @molopilot/web typecheck
```
Expected : exit 0.

- [ ] **Step 10: Mettre à jour TASKS.md**

Marquer "Skeleton `apps/web` (Next.js 15)" ✅.

- [ ] **Step 11: Commit**

```bash
git add apps/web pnpm-lock.yaml TASKS.md
git commit -m "feat(web): scaffold Next.js 15 App Router skeleton with health route"
```

---

## Task 17: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Créer `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Lint, typecheck, unit tests
    runs-on: ubuntu-latest
    timeout-minutes: 15

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: molopilot
          POSTGRES_PASSWORD: molopilot
          POSTGRES_DB: molopilot
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U molopilot"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 10

    env:
      DATABASE_URL: postgresql://molopilot:molopilot@localhost:5432/molopilot?schema=public
      SHADOW_DATABASE_URL: postgresql://molopilot:molopilot@localhost:5432/molopilot_shadow?schema=public

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Create shadow DB
        run: |
          PGPASSWORD=molopilot psql -h localhost -U molopilot -d molopilot \
            -c "CREATE DATABASE molopilot_shadow OWNER molopilot;"

      - name: Generate Prisma client
        run: pnpm db:generate

      - name: Apply migrations
        run: pnpm --filter @molopilot/db exec prisma migrate deploy

      - name: Lint
        run: pnpm lint

      - name: Format check
        run: pnpm format:check

      - name: Typecheck
        run: pnpm typecheck

      - name: Unit tests
        run: pnpm test

  e2e-rls:
    name: RLS e2e (Testcontainers)
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma client
        run: pnpm db:generate

      - name: Run RLS e2e
        run: pnpm --filter @molopilot/api test:e2e
```

- [ ] **Step 2: Vérifier en local que `pnpm lint`, `pnpm typecheck`, `pnpm test` passent**

Run :
```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
```
Expected : tout vert. Si ça pète, corriger avant le commit (la CI fera la même chose à distance).

- [ ] **Step 3: Mettre à jour TASKS.md**

Marquer "GitHub Actions CI" ✅.

- [ ] **Step 4: Commit + push**

```bash
git add .github/workflows/ci.yml TASKS.md
git commit -m "ci: add GitHub Actions pipeline (lint, typecheck, unit, e2e RLS)"
```

Une fois le repo poussé sur GitHub, vérifier que le run apparaît vert dans l'onglet Actions.

---

## Task 18: README et finalisation Phase 0

**Files:**
- Create: `README.md`

- [ ] **Step 1: Créer `README.md`**

```markdown
# Molopilot

SaaS de gestion d'établissements (restaurants, cafés, boutiques) pour le marché sénégalais et l'Afrique francophone.

> 📄 Spec V1 : [`docs/superpowers/specs/2026-04-28-molopilot-saas-design.md`](docs/superpowers/specs/2026-04-28-molopilot-saas-design.md)
> 📋 Suivi des tâches : [`TASKS.md`](TASKS.md)
> 🧠 Contexte projet : [`CLAUDE.md`](CLAUDE.md)

## Pré-requis

- Node 20 LTS (`.nvmrc` fourni)
- pnpm 9
- Docker (pour Postgres local et Testcontainers)

## Installation

```bash
pnpm install
cp .env.example .env
pnpm docker:up
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## Lancer en dev

```bash
pnpm dev
```

- Front : http://localhost:3000
- API : http://localhost:3001
- API health : http://localhost:3001/health

## Commandes utiles

| Commande | Effet |
|----------|-------|
| `pnpm dev` | Lance front + API en parallèle (mode watch) |
| `pnpm lint` | ESLint sur tout le repo |
| `pnpm format` | Prettier --write |
| `pnpm typecheck` | TS strict sur tous les packages |
| `pnpm test` | Tests unitaires de tous les packages |
| `pnpm --filter @molopilot/api test:e2e` | Tests E2E API (Testcontainers) |
| `pnpm db:migrate` | Applique migrations Prisma en dev |
| `pnpm db:seed` | Seed du tenant démo |
| `pnpm db:generate` | Régénère le client Prisma |
| `pnpm docker:up` / `down` | Démarre / arrête Postgres |

## Structure

```
apps/web        # Next.js 15 App Router
apps/api        # NestJS API
packages/db     # Prisma schema + client
packages/shared # zod DTOs partagés
```

## Tests

- Unit : Jest dans `apps/api/src/**/*.spec.ts`, tests Node natif dans `packages/shared/src/**/*.spec.ts`
- E2E : `apps/api/test/*.e2e-spec.ts` (Testcontainers, exigent Docker)
```

- [ ] **Step 2: Mettre à jour TASKS.md — clôture Phase 0**

Dans `TASKS.md`, passer la section Phase 0 à statut ✅, ajouter une ligne récapitulative en haut "Phase 0 terminée le 2026-04-28" et préparer la Phase 1 en 🟦 (titre seul, plan à rédiger).

- [ ] **Step 3: Mettre à jour CLAUDE.md**

Dans la section "Phases d'implémentation", remplacer `Fondations ... ← en cours` par `Fondations ... ← ✅ terminé` et marquer Phase 1 comme prochaine.

- [ ] **Step 4: Commit final Phase 0**

```bash
git add README.md TASKS.md CLAUDE.md
git commit -m "docs: add README and close Phase 0 in tracking files"
```

- [ ] **Step 5: Vérifier que tout passe une dernière fois**

Run :
```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test
```
Expected : tout vert.

Run :
```bash
pnpm --filter @molopilot/api test:e2e
```
Expected : 3 specs RLS PASS.

Run :
```bash
pnpm dev
```
Visiter `http://localhost:3000` et `http://localhost:3001/health`. Tout doit répondre.

- [ ] **Step 6: Tag Phase 0**

```bash
git tag phase-0-complete
git push --tags
```

---

## Self-Review (à exécuter par l'auteur du plan avant handoff)

Couverture spec :
- § 4 Architecture (monorepo, front/back séparés, Postgres) → Tasks 1, 5, 6, 7, 12, 16
- § 5 Modèle de données → Tasks 8, 9
- § 6 RLS → Tasks 10, 15
- § 11 Déploiement / CI → Task 17
- § 12 Tests pyramide (unit + intégration) → Tasks 5, 13, 14, 15

Pas de placeholder. Code explicite à chaque étape.
Types et imports cohérents : `PrismaClient` exporté depuis `@molopilot/db` (Task 6) et consommé Tasks 13/15 ; `TenantIdSchema` non encore utilisé ailleurs (réservé Phase 1).
Frontières entre fichiers respectées : modules NestJS dédiés, schéma DB centralisé, DTOs partagés isolés.
