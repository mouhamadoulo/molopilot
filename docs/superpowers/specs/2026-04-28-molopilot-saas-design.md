# Molopilot — SaaS de gestion d'établissements (resto, café, boutique)

**Date :** 2026-04-28
**Statut :** Design validé, en attente de plan d'implémentation
**Scope :** MVP V1

---

## 1. Vision & contexte

Molopilot est un SaaS de gestion opérationnelle pour petits établissements (restaurants, cafés, boutiques) à destination du **marché sénégalais et de l'Afrique francophone**. Il vise les patrons indépendants ou de petites chaînes (1 à 5 points de vente) qui n'ont aujourd'hui souvent ni caisse informatisée, ni suivi stock fiable.

**Différenciateurs locaux :**

- Multi-vertical générique (un seul outil pour resto, café, boutique avec configuration par type)
- Tolérance aux coupures réseau (offline-first sur la caisse)
- Tarification prévisible en FCFA (pas de % sur CA)
- Modes de paiement Wave et Orange Money pris en compte dès le départ

## 2. Périmètre MVP

**Inclus dans la V1 :**

- Catalogue produits / menu (CRUD, catégories, archivage)
- Caisse (PWA, fonctionne offline, encaissement multi-modes)
- Stock (mouvements, niveaux par établissement, alertes seuil bas)
- Authentification (patron email/password, caissier PIN)
- Multi-tenant (un compte SaaS = un patron / une chaîne)
- Multi-établissement par tenant
- Rapports basiques (CA jour/semaine/mois, top produits, modes paiement)
- Facturation forfait mensuel par établissement (paiement manuel hors-app en V1, voir § 10)
- Interface FR uniquement (architecture i18n-ready)

**Exclu de la V1 (V2+) :**

- API Wave / Orange Money (intégration paiement réelle)
- Module KDS (Kitchen Display System) restaurant
- Réservations / table management
- Fidélité clients
- Commande en ligne / QR menu
- App mobile native
- Wolof, anglais
- Transferts de stock entre établissements
- Comptabilité avancée

## 3. Décisions techniques de référence

| Axe               | Décision                                                                 |
| ----------------- | ------------------------------------------------------------------------ |
| Marché            | Sénégal / Afrique francophone                                            |
| Vertical MVP      | Multi (resto/café/boutique), config par `Establishment.type`             |
| Plateforme        | Web responsive + offline (Service Worker + IndexedDB)                    |
| Multi-tenant      | Schéma partagé Postgres, `tenant_id` sur chaque table métier, RLS active |
| Auth              | Patron email/password (argon2id), caissier PIN 6 chiffres + JWT device   |
| Paiements clients | Saisie manuelle MVP (Cash / Wave / OM / Mixte), API V2                   |
| Stack front       | Next.js 15 App Router (React Server Components), TypeScript strict       |
| Stack back        | NestJS (TypeScript), modules par bounded context                         |
| ORM               | Prisma                                                                   |
| Base              | Postgres managé (Neon ou Supabase Postgres, région EU)                   |
| Langue            | FR uniquement V1, archi i18n-ready (clés extraites)                      |
| Pricing           | Forfait mensuel par établissement (ex. 15 000 FCFA)                      |
| Devise interne    | XOF (FCFA), montants en cents (entiers)                                  |

## 4. Architecture globale

```
┌──────────────────────────────────────────────────────────┐
│  Client (navigateur — patron PC, caissier tablette)       │
│  Next.js 15 App Router (React Server Components)          │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Service Worker (cache shell + assets)              │   │
│  │ IndexedDB via Dexie (file ventes + cache catalogue)│   │
│  │ Background Sync (push ventes différées au retour)  │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────┬─────────────────────────────────────────┘
                 │ HTTPS (JSON, JWT bearer)
                 ▼
┌──────────────────────────────────────────────────────────┐
│  API NestJS                                              │
│  Modules : Auth · Tenant · Catalog · Sales · Inventory · │
│            Reports · Sync                                │
│  Auth : JWT (patron) + JWT court (caissier après PIN)    │
│  Middleware : `TenantInterceptor` injecte tenant_id dans │
│               un AsyncLocalStorage → PrismaService       │
│               extends applique filtre auto              │
└────────────────┬─────────────────────────────────────────┘
                 │ Prisma
                 ▼
┌──────────────────────────────────────────────────────────┐
│  Postgres (Neon / Supabase Postgres, région EU)          │
│  - Schéma partagé, `tenant_id` sur chaque table métier   │
│  - RLS policies actives (defense-in-depth)               │
│  - Index composite (tenant_id, ...) sur tables chaudes   │
└──────────────────────────────────────────────────────────┘
```

**Déploiements séparés :**

- Front Next.js → Vercel (ou Railway)
- API NestJS → Railway / Fly.io (région la plus proche du Sénégal — Paris)
- DB → Neon / Supabase (région EU)

**Communication :** front lit `NEXT_PUBLIC_API_URL`, JWT en `Authorization: Bearer`.

**Structure repo (monorepo pnpm workspaces) :**

```
molopilot/
  apps/
    web/        # Next.js
    api/        # NestJS
  packages/
    db/         # Prisma schema + client + migrations
    shared/     # types DTO partagés (zod schemas)
    ui/         # composants UI réutilisables (V2)
  docs/
    superpowers/specs/
```

## 5. Modèle de données (MVP)

Toutes les entités métier portent `tenant_id` (sauf `Tenant` et `User`).

```
Tenant
  id, name, slug, plan, created_at

Establishment
  id, tenant_id, name, type (RESTO|CAFE|BOUTIQUE), timezone, currency

User
  id, tenant_id, email (nullable), password_hash (nullable)
  pin_hash (nullable), role (OWNER|MANAGER|CASHIER)
  establishment_id (nullable — null = accès tous établissements du tenant)

Category
  id, tenant_id, name, sort_order, archived

Product
  id, tenant_id, sku (UNIQUE par tenant), name, category_id
  price_cents, cost_cents, tax_rate, track_stock (bool), archived
  unit (PIECE|KG|L), barcode (nullable)

StockLevel                    # projection — par produit × établissement
  id, tenant_id, product_id, establishment_id
  quantity (decimal), low_threshold
  UNIQUE(product_id, establishment_id)

StockMovement                 # source de vérité de toute variation stock
  id, tenant_id, product_id, establishment_id
  delta (decimal, signé), reason (SALE|PURCHASE|ADJUST|TRANSFER|LOSS)
  ref_type (SALE|MANUAL), ref_id, user_id, created_at

Sale                          # ticket de vente
  id, tenant_id, establishment_id, cashier_id
  client_uuid (idempotence — généré côté client offline)
  status (DRAFT|PAID|VOIDED), total_cents, paid_cents
  payment_method (CASH|WAVE|OM|MIXED), notes
  created_at, synced_at, voided_at
  UNIQUE(client_uuid, tenant_id)

SaleItem
  id, tenant_id, sale_id, product_id
  qty (decimal), unit_price_cents, line_total_cents, tax_cents
```

**Notes clés :**

- `client_uuid` sur `Sale` = clé idempotence pour gérer la sync offline ; un POST avec un `client_uuid` déjà connu retourne le `Sale` existant sans en créer un nouveau.
- `StockMovement` est la source de vérité ; `StockLevel` est une projection recalculable.
- Tous les montants sont en **cents entiers**. XOF n'a pas de décimale courante, mais on garde la structure pour future devise multi.
- `unit_price_cents` est snapshoté sur `SaleItem` à la création de la vente — un changement de prix produit ultérieur n'altère pas l'historique.
- `tax_rate` par produit (Sénégal : TVA standard 18%, certains produits 0%).

## 6. Multi-tenant + isolation

### Couche 1 — Application (Prisma + NestJS)

`TenantInterceptor` extrait `tenant_id` du JWT et le pose dans un `AsyncLocalStorage`. `PrismaService` étendu via `$extends` injecte automatiquement `where: { tenant_id }` sur tous les `findMany / findFirst / update / delete` et `data.tenant_id` sur les `create` des modèles tenant-scoped.

```ts
prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query, model, operation }) {
        const tenantId = tenantContext.get();
        if (TENANT_SCOPED_MODELS.has(model)) {
          if (operation === 'create') {
            args.data.tenant_id = tenantId;
          } else {
            args.where = { ...args.where, tenant_id: tenantId };
          }
        }
        return query(args);
      },
    },
  },
});
```

### Couche 2 — Postgres RLS (defense-in-depth)

Chaque connexion fait `SET app.current_tenant = '<uuid>'` au début de la requête (via middleware Prisma raw). Chaque table tenant-scoped a une policy :

```sql
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON product
  USING (tenant_id::text = current_setting('app.current_tenant', true));
```

Si la couche applicative oublie un filtre par bug, RLS bloque. Test d'audit : on désactive l'extension Prisma et la suite de tests d'isolation passe quand même = preuve d'isolation au niveau DB.

### Provisioning

Signup patron → transaction qui crée `Tenant` + un `Establishment` par défaut + `User` OWNER. Pas de schéma à créer, juste des lignes.

## 7. Authentification

### Patron (OWNER / MANAGER)

1. `POST /auth/login` { email, password }
2. API vérifie `password_hash` (argon2id), retourne JWT (7j) + refresh token (30j, rotaté)
3. JWT payload : `{ sub: user_id, tenant_id, role, exp }`

Stockage front : JWT en mémoire, refresh en cookie `httpOnly` `Secure` `SameSite=Lax`.

### Caissier (CASHIER) — tablette partagée

1. Patron / manager s'authentifie sur la tablette une fois → JWT "device" lié à `establishment_id` (12h, renouvelable).
2. Caissier prend son shift : saisit son **PIN 6 chiffres** sur l'écran de verrou.
3. `POST /auth/cashier-pin` { device_jwt, pin } vérifie `pin_hash` (argon2id, salt par utilisateur) parmi les caissiers de l'établissement → retourne un JWT court (8h, sliding) qui identifie le caissier sur les ventes.

### Sécurité PIN

- Brute-force : 5 essais ratés → caissier verrouillé 15 min, alerte au patron (email + dashboard).
- PIN défini par le patron à la création du caissier ; le caissier peut le changer à sa première connexion.
- Verrou auto tablette après 3 min d'inactivité → re-saisie PIN.

### Stockage local tablette

`localStorage` chiffré (clé dérivée du device JWT). Acceptable car la tablette est un device dédié au point de vente, pas un device personnel.

## 8. Offline-first & sync

### Ce qui doit fonctionner offline (caisse uniquement)

- Lister catalogue produits + prix
- Créer une vente, ajouter / retirer items, encaisser
- Voir les ventes du jour faites sur ce device

### Ce qui exige le réseau

- Sync ventes vers le serveur
- MAJ catalogue / prix
- Rapports
- Toute opération back-office patron

### Stockage local (IndexedDB via Dexie)

```
db.products       # cache catalogue (TTL 1h ou push d'invalidation)
db.outbox         # ventes en attente de sync
db.sales_today    # ventes confirmées du device, lecture rapide
db.meta           # last_sync_at, device_id, current_cashier_id
```

### Création vente offline

1. Caissier valide le ticket.
2. Génération d'un `client_uuid` (UUIDv4) côté client.
3. Insertion dans `outbox` + `sales_today` (statut `PENDING_SYNC`).
4. Décrément optimiste du stock local (affichage caissier uniquement).

### Sync (Background Sync API + fallback polling toutes les 30s)

1. Si online : `POST /sync/sales` { sales: [...] }, batch max 50.
2. Le serveur traite chaque vente :
   - Recherche par `client_uuid`. Si trouvé → retourne le `Sale.id` existant (idempotent).
   - Sinon → crée `Sale` + `SaleItem` + `StockMovement` en transaction, recalcule `StockLevel` du produit.
3. Réponse : `{ client_uuid → server_id, status }` pour chaque vente.
4. Le client marque les ventes `SYNCED` et les retire de `outbox`.

### Conflits

- **Stock négatif possible** (caissier vend offline + magasinier ajuste online). MVP : on accepte, on log un `StockMovement` négatif, le patron voit une alerte "stock négatif" dans le dashboard et ajuste manuellement. V2 : règles de réservation.
- **Prix changé pendant l'offline** : aucun conflit — `unit_price_cents` est snapshoté sur `SaleItem` à la création, le CA reflète le prix réel encaissé.
- **Produit archivé pendant l'offline** : on accepte la vente (clé étrangère `product_id` toujours valide), warning dans les logs, pas d'erreur utilisateur.

## 9. Modules MVP — détail fonctionnel

### Catalogue (back-office patron)

- CRUD `Category`, `Product`.
- Import CSV produits (onboarding rapide).
- Archivage (jamais de delete dur — préserve l'historique de ventes).
- Champs spécifiques selon `Establishment.type` :
  - `RESTO` / `CAFE` : flag `requires_kitchen` (utile pour KDS V2), `available` (rupture du jour).
  - `BOUTIQUE` : `barcode` mis en avant, scan disponible.
- UI : table filtrable, recherche, édition inline du prix.

### Caisse (front caissier — PWA)

Layout tablette en mode paysage :

- **Gauche** : grille catégories + produits (gros boutons tactiles, photo si dispo).
- **Droite** : ticket en cours (qty, suppression d'item, sous-total, total, TVA).
- **Bas** : bouton **Encaisser** → modal mode paiement (Cash / Wave / OM / Mixte) → impression ticket (V2 : impression Bluetooth ; V1 : aperçu A4 imprimable depuis le navigateur).

Recherche produit par nom ou code-barres (scan via `BarcodeDetector` API navigateur).

Annulation : avant encaissement, libre. Après encaissement, nécessite l'authentification d'un manager (saisie PIN manager) → marque la vente `VOIDED`, crée des `StockMovement` inverses, reste auditable.

### Stock (back-office)

- Tableau du stock par établissement : qty actuelle, seuil bas, valorisation au coût (qty × cost_cents).
- Saisie réception fournisseur : sélection produits + qty + coût unitaire → crée `StockMovement` `PURCHASE`, met à jour `cost_cents` du produit (méthode : moyenne pondérée).
- Ajustements (perte, casse, inventaire physique) : raison obligatoire, traçable.
- Transferts entre établissements : V1.1 si simple à intégrer, sinon V2.
- Alertes seuil bas : badge sur le dashboard, liste des produits sous seuil.

### Rapports (lecture seule, V1 minimal)

- CA jour / semaine / mois (graphique ligne + total).
- Top 10 produits vendus (qty + CA).
- Répartition CA par mode de paiement.
- Export CSV des ventes sur période.

## 10. Tarification & facturation

- **Plan unique V1** : forfait mensuel par établissement (ex. 15 000 FCFA / mois).
- **Essai** : 30 jours gratuits sans CB, accès complet.
- **Facturation V1** : manuelle (le patron paie par Wave / virement, l'admin Molopilot active / désactive le compte). Pas d'intégration Stripe en V1 — pas pertinent pour le marché Sénégal.
- **V2** : intégration Wave Business / paiement automatisé.
- Si l'abonnement n'est pas à jour, le compte passe en lecture seule (les caissiers ne peuvent plus créer de ventes), mais les données restent accessibles 90j avant suppression.

## 11. Déploiement & ops

### Environnements

- `dev` : local (Docker Compose : Postgres + API + front).
- `staging` : Railway preview, DB Neon branch.
- `prod` : Railway (API), Vercel (front), Neon (DB région EU).

### CI/CD (GitHub Actions)

- Lint + typecheck + tests sur chaque PR.
- Migration Prisma auto sur staging, **manuelle** sur prod (review du SQL avant).
- Déploiement auto staging sur merge `main`, déploiement prod via tag `v*`.

### Observabilité

- Logs : Pino → stdout → Railway logs / Better Stack.
- Erreurs : Sentry (front + API), tag `tenant_id` sur chaque event pour aider le débogage par tenant.
- Métriques basiques : Railway dashboard (CPU, mémoire, latence).
- Healthcheck : `GET /health` (ping DB).

### Sauvegardes

- Neon : PITR (point-in-time recovery) inclus dans le plan.
- Export hebdomadaire `pg_dump` → S3 / Backblaze B2, rétention 90 jours.

### Secrets

- Railway / Vercel env vars, jamais committés en clair.
- Rotation du JWT secret tous les 6 mois (overlap de 7j pour ne pas invalider les sessions actives).

### Domaine & CDN

- `app.<domaine>` (front), `api.<domaine>` (API).
- Cloudflare devant pour cache statique + protection DDoS.

### Coût infra estimé MVP (10 tenants actifs)

- Vercel hobby : 0 €
- Railway : ~10 $ / mois
- Neon scale : ~20 $ / mois
- Sentry dev : 0 €
- **Total : ~30 $ / mois** d'infra. Largement couvert par 2 abonnements à 15 000 FCFA.

## 12. Tests & qualité

### Pyramide de tests

**Unit (Jest, côté API + front)**

- Pure logic : calcul total, TVA, sous-total ticket, coût moyen pondéré.
- Domain services NestJS (mock Prisma).
- Reducers / hooks front.

**Intégration (Jest + Testcontainers Postgres)**

- Modules NestJS bout-en-bout : crée tenant, crée produit, crée vente, vérifie stock.
- **RLS test critique** : créer 2 tenants, vérifier qu'une requête en contexte tenant A ne voit jamais les données de tenant B (avec ET sans la couche Prisma extends).
- Sync idempotence : `POST /sync/sales` avec le même `client_uuid` 2× → une seule vente, retour identique.

**E2E (Playwright)**

- Parcours patron : signup → crée produit → voit dashboard.
- Parcours caissier : login PIN → crée vente → encaisse → ticket.
- **Offline scenario** : `page.context().setOffline(true)` → création de vente → repasser online → vérifier sync correcte.

### Coverage cible

- Services métier API : 80 %+.
- Logique critique (calculs montants, sync) : 100 %.
- UI : E2E smoke suffit.

### Linting / format

- ESLint + Prettier (config partagée monorepo).
- TypeScript strict.
- Husky pre-commit : lint-staged + typecheck rapide.

## 13. Hors-scope V1 (pour mémoire — V2+)

- Intégration API Wave / Orange Money (paiement automatisé).
- KDS (Kitchen Display System) — pour usage restaurant.
- Réservations / table management.
- Programme fidélité clients.
- Commande en ligne / QR menu.
- App mobile native (Android, possiblement Capacitor wrapping de la PWA).
- Internationalisation Wolof + EN.
- Transferts de stock inter-établissements avec workflow.
- Comptabilité avancée (export FEC, journaux comptables).
- Module RH / pointage caissiers.
- Marketplace / multi-vendeur.

## 14. Découpage en phases d'implémentation (suggéré)

Le MVP reste large. Suggéré pour le plan d'implémentation :

1. **Phase 0** — Fondations : monorepo, Docker dev, schéma Prisma initial, CI.
2. **Phase 1** — Auth + multi-tenant + RLS : signup patron, login, isolation testée.
3. **Phase 2** — Catalogue (back-office) : CRUD produits / catégories.
4. **Phase 3** — Stock : `StockMovement`, `StockLevel`, ajustements, réceptions.
5. **Phase 4** — Caisse online (sans offline) : création vente, encaissement, décrément stock.
6. **Phase 5** — Caisse offline + sync : Service Worker, IndexedDB, idempotence.
7. **Phase 6** — Auth caissier PIN + JWT device.
8. **Phase 7** — Rapports.
9. **Phase 8** — Multi-établissement (UI sélection établissement, rapports filtrés).
10. **Phase 9** — Polish, observabilité, doc onboarding patron.

Chaque phase devrait être déployable et démontrable en isolation.
