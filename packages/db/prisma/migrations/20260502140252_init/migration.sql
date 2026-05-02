-- CreateEnum
CREATE TYPE "plan" AS ENUM ('FREE', 'STANDARD', 'PRO');

-- CreateEnum
CREATE TYPE "establishment_type" AS ENUM ('RESTO', 'CAFE', 'BOUTIQUE');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('OWNER', 'MANAGER', 'CASHIER');

-- CreateEnum
CREATE TYPE "product_unit" AS ENUM ('PIECE', 'KG', 'L');

-- CreateEnum
CREATE TYPE "stock_movement_reason" AS ENUM ('SALE', 'PURCHASE', 'ADJUST', 'TRANSFER', 'LOSS');

-- CreateEnum
CREATE TYPE "stock_movement_ref_type" AS ENUM ('SALE', 'MANUAL');

-- CreateEnum
CREATE TYPE "sale_status" AS ENUM ('DRAFT', 'PAID', 'VOIDED');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('CASH', 'WAVE', 'OM', 'MIXED');

-- CreateTable
CREATE TABLE "tenant" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "plan" NOT NULL DEFAULT 'FREE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "establishment" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "establishment_type" NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Dakar',
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "establishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "email" TEXT,
    "password_hash" TEXT,
    "pin_hash" TEXT,
    "role" "user_role" NOT NULL,
    "establishment_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" UUID,
    "price_cents" INTEGER NOT NULL,
    "cost_cents" INTEGER NOT NULL DEFAULT 0,
    "tax_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "track_stock" BOOLEAN NOT NULL DEFAULT true,
    "unit" "product_unit" NOT NULL DEFAULT 'PIECE',
    "barcode" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_level" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "establishment_id" UUID NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "low_threshold" DECIMAL(14,3) NOT NULL DEFAULT 0,

    CONSTRAINT "stock_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movement" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "establishment_id" UUID NOT NULL,
    "delta" DECIMAL(14,3) NOT NULL,
    "reason" "stock_movement_reason" NOT NULL,
    "ref_type" "stock_movement_ref_type" NOT NULL,
    "ref_id" UUID,
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "establishment_id" UUID NOT NULL,
    "cashier_id" UUID,
    "client_uuid" UUID NOT NULL,
    "status" "sale_status" NOT NULL DEFAULT 'DRAFT',
    "total_cents" INTEGER NOT NULL DEFAULT 0,
    "paid_cents" INTEGER NOT NULL DEFAULT 0,
    "payment_method" "payment_method" NOT NULL DEFAULT 'CASH',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3),
    "voided_at" TIMESTAMP(3),

    CONSTRAINT "sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_item" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sale_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "qty" DECIMAL(14,3) NOT NULL,
    "unit_price_cents" INTEGER NOT NULL,
    "line_total_cents" INTEGER NOT NULL,
    "tax_cents" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sale_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant"("slug");

-- CreateIndex
CREATE INDEX "establishment_tenant_id_idx" ON "establishment"("tenant_id");

-- CreateIndex
CREATE INDEX "user_tenant_id_idx" ON "user"("tenant_id");

-- CreateIndex
CREATE INDEX "user_establishment_id_idx" ON "user"("establishment_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tenant_id_email_key" ON "user"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "category_tenant_id_idx" ON "category"("tenant_id");

-- CreateIndex
CREATE INDEX "product_tenant_id_idx" ON "product"("tenant_id");

-- CreateIndex
CREATE INDEX "product_category_id_idx" ON "product"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_tenant_id_sku_key" ON "product"("tenant_id", "sku");

-- CreateIndex
CREATE INDEX "stock_level_tenant_id_idx" ON "stock_level"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_level_product_id_establishment_id_key" ON "stock_level"("product_id", "establishment_id");

-- CreateIndex
CREATE INDEX "stock_movement_tenant_id_idx" ON "stock_movement"("tenant_id");

-- CreateIndex
CREATE INDEX "stock_movement_product_id_establishment_id_idx" ON "stock_movement"("product_id", "establishment_id");

-- CreateIndex
CREATE INDEX "stock_movement_ref_type_ref_id_idx" ON "stock_movement"("ref_type", "ref_id");

-- CreateIndex
CREATE INDEX "sale_tenant_id_idx" ON "sale"("tenant_id");

-- CreateIndex
CREATE INDEX "sale_establishment_id_created_at_idx" ON "sale"("establishment_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "sale_tenant_id_client_uuid_key" ON "sale"("tenant_id", "client_uuid");

-- CreateIndex
CREATE INDEX "sale_item_tenant_id_idx" ON "sale_item"("tenant_id");

-- CreateIndex
CREATE INDEX "sale_item_sale_id_idx" ON "sale_item"("sale_id");

-- CreateIndex
CREATE INDEX "sale_item_product_id_idx" ON "sale_item"("product_id");

-- AddForeignKey
ALTER TABLE "establishment" ADD CONSTRAINT "establishment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_level" ADD CONSTRAINT "stock_level_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_level" ADD CONSTRAINT "stock_level_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_level" ADD CONSTRAINT "stock_level_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_cashier_id_fkey" FOREIGN KEY ("cashier_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
