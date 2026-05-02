-- Multi-tenant Row Level Security policies (defense-in-depth, spec § 6).
--
-- Each tenant-scoped table is filtered by the GUC `app.current_tenant_id`,
-- which the application sets per request via `SET LOCAL`. If the GUC is
-- unset (e.g. raw psql session), the table appears empty.
--
-- FORCE ROW LEVEL SECURITY also enforces policies for the table owner so
-- the app cannot accidentally bypass RLS by running as the owning role.

-- Helper: resolve current tenant from session GUC, returning NULL when unset.
CREATE OR REPLACE FUNCTION app_current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
$$;

-- Apply RLS to every tenant-scoped table.
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'establishment',
    'user',
    'category',
    'product',
    'stock_level',
    'stock_movement',
    'sale',
    'sale_item'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I '
      'USING (tenant_id = app_current_tenant_id()) '
      'WITH CHECK (tenant_id = app_current_tenant_id())',
      t
    );
  END LOOP;
END
$$;
