-- ============================================================
--  APTIVA AI — Multi-tenant completo
--  Execute APÓS o migration.sql
--  Estratégia: Row-Level Multi-tenancy com RLS + tenant context
-- ============================================================

-- ============================================================
--  1. TABELA DE TENANTS (Empresas como tenants)
-- ============================================================

-- Cada empresa é um tenant. Adicionamos tenant_id explícito nas
-- tabelas que precisam de isolamento inter-empresa.

-- Tabela central de tenants (estende company_profiles)
CREATE TABLE IF NOT EXISTS tenants (
  id              TEXT        PRIMARY KEY,           -- mesmo id da company_profile
  "companyName"   TEXT        NOT NULL,
  plan            TEXT        NOT NULL DEFAULT 'free',
  "isActive"      BOOLEAN     NOT NULL DEFAULT TRUE,
  "maxJobs"       INT         NOT NULL DEFAULT 3,
  "maxUsers"      INT         NOT NULL DEFAULT 5,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_tenant_active ON tenants("isActive");
CREATE INDEX IF NOT EXISTS idx_tenant_plan   ON tenants(plan);

-- ─── Sincroniza tenant ao criar company_profile ───────────────
CREATE OR REPLACE FUNCTION sync_tenant_from_company()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tenants (id, "companyName", plan)
  VALUES (NEW.id, NEW."companyName", NEW.plan)
  ON CONFLICT (id) DO UPDATE
    SET "companyName" = EXCLUDED."companyName",
        plan          = EXCLUDED.plan,
        "updatedAt"   = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_sync_tenant
  AFTER INSERT OR UPDATE ON company_profiles
  FOR EACH ROW EXECUTE FUNCTION sync_tenant_from_company();

-- ─── Sincroniza plano em company_profile ↔ tenants ───────────
CREATE OR REPLACE FUNCTION sync_company_from_tenant()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE company_profiles
  SET plan = NEW.plan, "updatedAt" = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_sync_company
  AFTER UPDATE OF plan ON tenants
  FOR EACH ROW EXECUTE FUNCTION sync_company_from_tenant();

-- ============================================================
--  2. COLUNA tenant_id NAS TABELAS TRANSACIONAIS
-- ============================================================
-- Permite queries eficientes sem joins e reforça o isolamento.

-- applications: já tem jobId → job tem companyId (tenant_id)
-- Adicionamos tenant_id direto para performance de RLS
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- Preenche tenantId nas applications existentes
UPDATE applications a
SET "tenantId" = j."companyId"
FROM jobs j
WHERE a."jobId" = j.id
  AND a."tenantId" IS NULL;

-- Mantém tenantId sincronizado via trigger
CREATE OR REPLACE FUNCTION set_application_tenant()
RETURNS TRIGGER AS $$
BEGIN
  SELECT "companyId" INTO NEW."tenantId"
  FROM jobs WHERE id = NEW."jobId";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_application_tenant
  BEFORE INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION set_application_tenant();

CREATE INDEX IF NOT EXISTS idx_app_tenant ON applications("tenantId");

-- ============================================================
--  3. CONFIGURAÇÃO DO CONTEXTO DE SESSÃO (tenant_context)
-- ============================================================
-- Permite definir o tenant ativo para a sessão SQL.
-- Usado internamente para policies e queries analíticas.

-- Função para setar tenant na sessão
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id TEXT) RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.tenant_id', p_tenant_id, TRUE); -- TRUE = apenas na transação
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para ler o tenant da sessão
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('app.tenant_id', TRUE), '');
$$ LANGUAGE SQL STABLE;

-- Sobrescreve auth_user_role para incluir contexto
CREATE OR REPLACE FUNCTION auth_user_tenant_id() RETURNS TEXT AS $$
  SELECT cp.id
  FROM company_profiles cp
  JOIN users u ON u.id = cp."userId"
  WHERE u."supabaseId" = auth.uid()::TEXT
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================
--  4. RLS POLICIES MULTI-TENANT REFORÇADAS
-- ============================================================
-- Remove policies antigas e recria com isolamento por tenant_id

-- ─── jobs: isolamento por tenant ─────────────────────────────
DROP POLICY IF EXISTS "jobs_select_published" ON jobs;
DROP POLICY IF EXISTS "jobs_write_own"        ON jobs;

-- Candidatos veem apenas vagas publicadas
CREATE POLICY "jobs_candidate_select" ON jobs
  FOR SELECT
  USING (
    status = 'PUBLISHED'
    OR auth_user_role() = 'ADMIN'
    OR "companyId" = auth_user_tenant_id()
  );

-- Empresa vê e gerencia apenas as SUAS vagas (tenant isolado)
CREATE POLICY "jobs_company_all" ON jobs
  FOR ALL
  USING (
    "companyId" = auth_user_tenant_id()
    OR auth_user_role() = 'ADMIN'
  )
  WITH CHECK (
    "companyId" = auth_user_tenant_id()
    OR auth_user_role() = 'ADMIN'
  );

-- ─── applications: empresa vê apenas candidatos das suas vagas ─
DROP POLICY IF EXISTS "app_select"            ON applications;
DROP POLICY IF EXISTS "app_candidate_insert"  ON applications;
DROP POLICY IF EXISTS "app_company_update"    ON applications;

CREATE POLICY "app_candidate_select" ON applications
  FOR SELECT USING (
    -- candidato vê suas próprias candidaturas
    "candidateId" IN (
      SELECT id FROM candidate_profiles
      WHERE "userId" = auth_user_db_id()
    )
    OR auth_user_role() = 'ADMIN'
  );

CREATE POLICY "app_company_select" ON applications
  FOR SELECT USING (
    -- empresa vê apenas candidaturas das SUAS vagas (tenant isolado)
    "tenantId" = auth_user_tenant_id()
    OR auth_user_role() = 'ADMIN'
  );

CREATE POLICY "app_candidate_insert" ON applications
  FOR INSERT WITH CHECK (
    "candidateId" IN (
      SELECT id FROM candidate_profiles
      WHERE "userId" = auth_user_db_id()
    )
  );

CREATE POLICY "app_company_update_status" ON applications
  FOR UPDATE USING (
    "tenantId" = auth_user_tenant_id()
    OR auth_user_role() = 'ADMIN'
  );

-- ─── saved_candidates: isolado por tenant ────────────────────
DROP POLICY IF EXISTS "saved_select" ON saved_candidates;
DROP POLICY IF EXISTS "saved_write"  ON saved_candidates;

CREATE POLICY "saved_tenant_all" ON saved_candidates
  FOR ALL
  USING (
    "companyId" = auth_user_tenant_id()
    OR auth_user_role() = 'ADMIN'
  )
  WITH CHECK (
    "companyId" = auth_user_tenant_id()
    OR auth_user_role() = 'ADMIN'
  );

-- ─── tenants: empresa vê apenas seus próprios dados ───────────
CREATE POLICY "tenants_own" ON tenants
  FOR SELECT USING (
    id = auth_user_tenant_id()
    OR auth_user_role() = 'ADMIN'
  );

CREATE POLICY "tenants_admin_write" ON tenants
  FOR ALL USING (auth_user_role() = 'ADMIN');

-- ============================================================
--  5. LIMITES DE USO POR PLANO (tenant quota enforcement)
-- ============================================================

CREATE OR REPLACE FUNCTION enforce_job_quota()
RETURNS TRIGGER AS $$
DECLARE
  v_plan    TEXT;
  v_max     INT;
  v_current INT;
BEGIN
  SELECT t.plan, t."maxJobs"
  INTO v_plan, v_max
  FROM tenants t
  WHERE t.id = NEW."companyId";

  SELECT COUNT(*) INTO v_current
  FROM jobs
  WHERE "companyId" = NEW."companyId"
    AND status IN ('DRAFT', 'PUBLISHED', 'PAUSED');

  IF v_current >= v_max THEN
    RAISE EXCEPTION 'Limite de vagas atingido para o plano %. Upgrade necessário.', v_plan
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_job_quota
  BEFORE INSERT ON jobs
  FOR EACH ROW EXECUTE FUNCTION enforce_job_quota();

-- ============================================================
--  6. FUNÇÃO DE ANALYTICS POR TENANT
-- ============================================================

CREATE OR REPLACE FUNCTION tenant_metrics(p_tenant_id TEXT)
RETURNS TABLE(
  metric TEXT,
  value  BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'total_jobs'::TEXT,       COUNT(*)::BIGINT FROM jobs          WHERE "companyId" = p_tenant_id
  UNION ALL
  SELECT 'active_jobs',            COUNT(*)::BIGINT FROM jobs          WHERE "companyId" = p_tenant_id AND status = 'PUBLISHED'
  UNION ALL
  SELECT 'total_applications',     COUNT(*)::BIGINT FROM applications  WHERE "tenantId"  = p_tenant_id
  UNION ALL
  SELECT 'pending_applications',   COUNT(*)::BIGINT FROM applications  WHERE "tenantId"  = p_tenant_id AND status = 'PENDING'
  UNION ALL
  SELECT 'hired',                  COUNT(*)::BIGINT FROM applications  WHERE "tenantId"  = p_tenant_id AND status = 'HIRED'
  UNION ALL
  SELECT 'saved_candidates',       COUNT(*)::BIGINT FROM saved_candidates WHERE "companyId" = p_tenant_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
--  7. TABELA DE MEMBROS DO TENANT (equipe RH da empresa)
-- ============================================================
-- Permite que uma empresa tenha múltiplos usuários (equipe de RH)

CREATE TABLE IF NOT EXISTS tenant_members (
  id          TEXT        PRIMARY KEY,
  "tenantId"  TEXT        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  "userId"    TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL DEFAULT 'recruiter',  -- 'owner' | 'recruiter' | 'viewer'
  "invitedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "acceptedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("tenantId", "userId")
);

ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tm_tenant ON tenant_members("tenantId");
CREATE INDEX IF NOT EXISTS idx_tm_user   ON tenant_members("userId");

-- RLS: apenas membros do tenant ou admin
CREATE POLICY "tm_select" ON tenant_members
  FOR SELECT USING (
    "tenantId" = auth_user_tenant_id()
    OR "userId" = auth_user_db_id()
    OR auth_user_role() = 'ADMIN'
  );

CREATE POLICY "tm_owner_write" ON tenant_members
  FOR ALL USING (
    "tenantId" = auth_user_tenant_id()
    OR auth_user_role() = 'ADMIN'
  );

-- Função: verifica se usuário é membro do tenant
CREATE OR REPLACE FUNCTION is_tenant_member(p_tenant_id TEXT) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_members
    WHERE "tenantId" = p_tenant_id
      AND "userId" = auth_user_db_id()
      AND "acceptedAt" IS NOT NULL
  )
  OR auth_user_tenant_id() = p_tenant_id;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================
--  8. PLANOS E LIMITES
-- ============================================================

CREATE TABLE IF NOT EXISTS plans (
  id           TEXT    PRIMARY KEY,
  name         TEXT    NOT NULL UNIQUE,
  "maxJobs"    INT     NOT NULL DEFAULT 3,
  "maxUsers"   INT     NOT NULL DEFAULT 2,
  "maxMonthly" INT     NOT NULL DEFAULT 50,   -- candidaturas/mês
  "aiInterview" BOOLEAN NOT NULL DEFAULT FALSE,
  "reports"    BOOLEAN NOT NULL DEFAULT FALSE,
  price        NUMERIC(10,2) NOT NULL DEFAULT 0
);

INSERT INTO plans (id, name, "maxJobs", "maxUsers", "maxMonthly", "aiInterview", "reports", price) VALUES
  ('plan_free',       'free',       3,   2,   50,   FALSE, FALSE, 0),
  ('plan_starter',    'starter',   10,   5,  200,   TRUE,  FALSE, 97),
  ('plan_pro',        'pro',       50,  20, 1000,   TRUE,  TRUE,  297),
  ('plan_enterprise', 'enterprise',9999,999,99999,  TRUE,  TRUE,  0)
ON CONFLICT (name) DO NOTHING;

-- Atualiza limites do tenant ao mudar plano
CREATE OR REPLACE FUNCTION apply_plan_limits()
RETURNS TRIGGER AS $$
DECLARE v_plan plans%ROWTYPE;
BEGIN
  SELECT * INTO v_plan FROM plans WHERE name = NEW.plan;
  IF FOUND THEN
    NEW."maxJobs"  = v_plan."maxJobs";
    NEW."maxUsers" = v_plan."maxUsers";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_apply_plan
  BEFORE UPDATE OF plan ON tenants
  FOR EACH ROW EXECUTE FUNCTION apply_plan_limits();

-- ============================================================
--  9. VIEW: tenant_dashboard (dados consolidados por tenant)
-- ============================================================

CREATE OR REPLACE VIEW tenant_dashboard AS
SELECT
  t.id                                          AS "tenantId",
  t."companyName",
  t.plan,
  t."isActive",
  t."maxJobs",
  t."maxUsers",
  COUNT(DISTINCT j.id)                          AS "totalJobs",
  COUNT(DISTINCT j.id) FILTER (WHERE j.status = 'PUBLISHED') AS "activeJobs",
  COUNT(DISTINCT a.id)                          AS "totalApplications",
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'HIRED') AS "hired",
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'PENDING') AS "pending",
  COUNT(DISTINCT sc.id)                         AS "savedCandidates",
  ROUND(AVG(a."matchScore")::NUMERIC, 1)        AS "avgMatchScore"
FROM tenants t
LEFT JOIN jobs              j  ON j."companyId" = t.id
LEFT JOIN applications      a  ON a."tenantId"  = t.id
LEFT JOIN saved_candidates  sc ON sc."companyId" = t.id
GROUP BY t.id, t."companyName", t.plan, t."isActive", t."maxJobs", t."maxUsers";

-- ============================================================
--  10. VERIFICAÇÃO
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '=== Multi-tenant Aptiva AI ===';
  RAISE NOTICE '✓ Tabela tenants';
  RAISE NOTICE '✓ Tabela tenant_members';
  RAISE NOTICE '✓ Tabela plans (4 planos)';
  RAISE NOTICE '✓ View tenant_dashboard';
  RAISE NOTICE '✓ RLS policies reforçadas';
  RAISE NOTICE '✓ Quota enforcement por plano';
  RAISE NOTICE '✓ tenant_context via set_config';
  RAISE NOTICE '✓ Triggers de sincronização';
  RAISE NOTICE '=== Multi-tenant configurado! ===';
END $$;
