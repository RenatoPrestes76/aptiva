-- ============================================================
--  APTIVA AI — Script completo de banco de dados Supabase
--  Execute este script no SQL Editor do Supabase
--  Dashboard > SQL Editor > New Query > Colar e executar
-- ============================================================

-- ─── Extensões ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('CANDIDATE', 'COMPANY', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ApplicationStatus" AS ENUM (
    'PENDING', 'REVIEWING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TestType" AS ENUM (
    'BEHAVIORAL', 'EXECUTION', 'CREATIVITY', 'REASONING', 'ATTENTION'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InterviewStatus" AS ENUM (
    'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ProfileType" AS ENUM (
    'EXECUTOR', 'ANALYST', 'CREATOR', 'LEADER',
    'STRATEGIST', 'COMMUNICATOR', 'INVESTIGATOR', 'TECHNICAL_SPECIALIST'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Função auxiliar: updated_at automático ──────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
--  TABELAS
-- ============================================================

-- ─── users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT        PRIMARY KEY,
  "supabaseId"  TEXT        NOT NULL UNIQUE,
  email         TEXT        NOT NULL UNIQUE,
  name          TEXT        NOT NULL,
  role          "UserRole"  NOT NULL DEFAULT 'CANDIDATE',
  avatar        TEXT,
  "publicSlug"  TEXT        UNIQUE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── candidate_profiles ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id                   TEXT          PRIMARY KEY,
  "userId"             TEXT          NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  headline             TEXT,
  bio                  TEXT,
  location             TEXT,
  phone                TEXT,
  "linkedinUrl"        TEXT,
  "githubUrl"          TEXT,
  "portfolioUrl"       TEXT,
  "resumeUrl"          TEXT,
  "desiredSalaryMin"   DOUBLE PRECISION,
  "desiredSalaryMax"   DOUBLE PRECISION,
  "availableFrom"      TIMESTAMPTZ,
  "remotePreference"   BOOLEAN       NOT NULL DEFAULT FALSE,
  "primaryProfile"     "ProfileType",
  "secondaryProfile"   "ProfileType",
  "scoreLeadership"    DOUBLE PRECISION NOT NULL DEFAULT 0,
  "scoreOrganization"  DOUBLE PRECISION NOT NULL DEFAULT 0,
  "scoreCommunication" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "scoreCreativity"    DOUBLE PRECISION NOT NULL DEFAULT 0,
  "scoreExecution"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  "scoreCollaboration" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "scoreResilience"    DOUBLE PRECISION NOT NULL DEFAULT 0,
  "scoreAdaptability"  DOUBLE PRECISION NOT NULL DEFAULT 0,
  "overallScore"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt"          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_candidate_profiles_updated_at
  BEFORE UPDATE ON candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── experiences ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experiences (
  id            TEXT        PRIMARY KEY,
  "candidateId" TEXT        NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  company       TEXT        NOT NULL,
  role          TEXT        NOT NULL,
  description   TEXT,
  "startDate"   TIMESTAMPTZ NOT NULL,
  "endDate"     TIMESTAMPTZ,
  current       BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── educations ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS educations (
  id            TEXT        PRIMARY KEY,
  "candidateId" TEXT        NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  institution   TEXT        NOT NULL,
  degree        TEXT        NOT NULL,
  field         TEXT,
  "startYear"   INT         NOT NULL,
  "endYear"     INT,
  current       BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── skills ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE,
  category  TEXT
);

-- ─── candidate_skills ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_skills (
  id            TEXT    PRIMARY KEY,
  "candidateId" TEXT    NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  "skillId"     TEXT    NOT NULL REFERENCES skills(id),
  level         INT     NOT NULL DEFAULT 3,
  "yearsExp"    DOUBLE PRECISION,
  UNIQUE ("candidateId", "skillId")
);

-- ─── certifications ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certifications (
  id              TEXT        PRIMARY KEY,
  "candidateId"   TEXT        NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  issuer          TEXT        NOT NULL,
  "issueDate"     TIMESTAMPTZ,
  "expiryDate"    TIMESTAMPTZ,
  "credentialUrl" TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── portfolio_items ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_items (
  id            TEXT        PRIMARY KEY,
  "candidateId" TEXT        NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL,
  description   TEXT,
  url           TEXT,
  "imageUrl"    TEXT,
  "techStack"   TEXT[]      NOT NULL DEFAULT '{}',
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── company_profiles ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_profiles (
  id              TEXT        PRIMARY KEY,
  "userId"        TEXT        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  "companyName"   TEXT        NOT NULL,
  cnpj            TEXT        UNIQUE,
  industry        TEXT,
  size            TEXT,
  website         TEXT,
  "logoUrl"       TEXT,
  description     TEXT,
  location        TEXT,
  phone           TEXT,
  plan            TEXT        NOT NULL DEFAULT 'free',
  "planExpiresAt" TIMESTAMPTZ,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_company_profiles_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── jobs ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id                TEXT        PRIMARY KEY,
  "companyId"       TEXT        NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  title             TEXT        NOT NULL,
  description       TEXT        NOT NULL,
  requirements      TEXT,
  benefits          TEXT,
  location          TEXT,
  remote            BOOLEAN     NOT NULL DEFAULT FALSE,
  "salaryMin"       DOUBLE PRECISION,
  "salaryMax"       DOUBLE PRECISION,
  "contractType"    TEXT,
  "experienceLevel" TEXT,
  status            "JobStatus" NOT NULL DEFAULT 'DRAFT',
  "reqLeadership"   DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reqOrganization" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reqCommunication" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reqCreativity"   DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reqExecution"    DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reqCollaboration" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reqResilience"   DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reqAdaptability" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "desiredProfile"  "ProfileType",
  "closesAt"        TIMESTAMPTZ,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── job_skills ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_skills (
  id        TEXT    PRIMARY KEY,
  "jobId"   TEXT    NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  "skillId" TEXT    NOT NULL REFERENCES skills(id),
  required  BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE ("jobId", "skillId")
);

-- ─── applications ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id              TEXT                  PRIMARY KEY,
  "jobId"         TEXT                  NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  "candidateId"   TEXT                  NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  status          "ApplicationStatus"   NOT NULL DEFAULT 'PENDING',
  "matchScore"    DOUBLE PRECISION      NOT NULL DEFAULT 0,
  "coverLetter"   TEXT,
  notes           TEXT,
  "createdAt"     TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  UNIQUE ("jobId", "candidateId")
);

CREATE OR REPLACE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── saved_candidates ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_candidates (
  id            TEXT        PRIMARY KEY,
  "companyId"   TEXT        NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  "candidateId" TEXT        NOT NULL,
  notes         TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("companyId", "candidateId")
);

-- ─── test_results ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_results (
  id            TEXT        PRIMARY KEY,
  "candidateId" TEXT        NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  "testType"    "TestType"  NOT NULL,
  score         DOUBLE PRECISION NOT NULL,
  "rawData"     JSONB,
  "aiAnalysis"  TEXT,
  "completedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── interviews ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interviews (
  id                   TEXT               PRIMARY KEY,
  "candidateId"        TEXT               NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  status               "InterviewStatus"  NOT NULL DEFAULT 'PENDING',
  "jobId"              TEXT,
  "scoreClarity"       DOUBLE PRECISION,
  "scoreCommunication" DOUBLE PRECISION,
  "scoreObjectivity"   DOUBLE PRECISION,
  "scoreLeadership"    DOUBLE PRECISION,
  "scoreConfidence"    DOUBLE PRECISION,
  "scoreTechnical"     DOUBLE PRECISION,
  "overallScore"       DOUBLE PRECISION,
  "aiReport"           TEXT,
  "startedAt"          TIMESTAMPTZ,
  "completedAt"        TIMESTAMPTZ,
  "createdAt"          TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- ─── interview_messages ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_messages (
  id            TEXT        PRIMARY KEY,
  "interviewId" TEXT        NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  role          TEXT        NOT NULL,
  content       TEXT        NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── admin_profiles ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_profiles (
  id          TEXT        PRIMARY KEY,
  "userId"    TEXT        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  level       INT         NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── audit_logs ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          TEXT        PRIMARY KEY,
  "userId"    TEXT,
  action      TEXT        NOT NULL,
  entity      TEXT,
  "entityId"  TEXT,
  metadata    JSONB,
  ip          TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
--  ÍNDICES DE PERFORMANCE
-- ============================================================

-- users
CREATE INDEX IF NOT EXISTS idx_users_supabase_id    ON users("supabaseId");
CREATE INDEX IF NOT EXISTS idx_users_email           ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_public_slug     ON users("publicSlug");
CREATE INDEX IF NOT EXISTS idx_users_role            ON users(role);

-- candidate_profiles
CREATE INDEX IF NOT EXISTS idx_candidate_user_id     ON candidate_profiles("userId");
CREATE INDEX IF NOT EXISTS idx_candidate_score       ON candidate_profiles("overallScore" DESC);
CREATE INDEX IF NOT EXISTS idx_candidate_profile     ON candidate_profiles("primaryProfile");
CREATE INDEX IF NOT EXISTS idx_candidate_remote      ON candidate_profiles("remotePreference");

-- experiences
CREATE INDEX IF NOT EXISTS idx_exp_candidate         ON experiences("candidateId");

-- educations
CREATE INDEX IF NOT EXISTS idx_edu_candidate         ON educations("candidateId");

-- candidate_skills
CREATE INDEX IF NOT EXISTS idx_cskill_candidate      ON candidate_skills("candidateId");
CREATE INDEX IF NOT EXISTS idx_cskill_skill          ON candidate_skills("skillId");

-- company_profiles
CREATE INDEX IF NOT EXISTS idx_company_user          ON company_profiles("userId");
CREATE INDEX IF NOT EXISTS idx_company_plan          ON company_profiles(plan);

-- jobs
CREATE INDEX IF NOT EXISTS idx_job_company           ON jobs("companyId");
CREATE INDEX IF NOT EXISTS idx_job_status            ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_created           ON jobs("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_job_remote            ON jobs(remote);

-- applications
CREATE INDEX IF NOT EXISTS idx_app_job               ON applications("jobId");
CREATE INDEX IF NOT EXISTS idx_app_candidate         ON applications("candidateId");
CREATE INDEX IF NOT EXISTS idx_app_status            ON applications(status);
CREATE INDEX IF NOT EXISTS idx_app_match_score       ON applications("matchScore" DESC);

-- test_results
CREATE INDEX IF NOT EXISTS idx_test_candidate        ON test_results("candidateId");
CREATE INDEX IF NOT EXISTS idx_test_type             ON test_results("testType");
CREATE INDEX IF NOT EXISTS idx_test_completed        ON test_results("completedAt" DESC);

-- interviews
CREATE INDEX IF NOT EXISTS idx_interview_candidate   ON interviews("candidateId");
CREATE INDEX IF NOT EXISTS idx_interview_status      ON interviews(status);

-- interview_messages
CREATE INDEX IF NOT EXISTS idx_imsg_interview        ON interview_messages("interviewId");

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_user            ON audit_logs("userId");
CREATE INDEX IF NOT EXISTS idx_audit_action          ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created         ON audit_logs("createdAt" DESC);

-- ============================================================
--  ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas sensíveis
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences         ENABLE ROW LEVEL SECURITY;
ALTER TABLE educations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills    ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_candidates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results        ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;

-- ─── Função auxiliar: busca o user_id do Supabase Auth ───────
CREATE OR REPLACE FUNCTION auth_user_db_id() RETURNS TEXT AS $$
  SELECT id FROM users WHERE "supabaseId" = auth.uid()::TEXT LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_user_role() RETURNS TEXT AS $$
  SELECT role::TEXT FROM users WHERE "supabaseId" = auth.uid()::TEXT LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ─── users ───────────────────────────────────────────────────
-- Leitura: todo usuário vê seus próprios dados; admin vê todos
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (
    "supabaseId" = auth.uid()::TEXT
    OR auth_user_role() = 'ADMIN'
  );

-- Atualização: apenas o próprio usuário
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING ("supabaseId" = auth.uid()::TEXT);

-- Inserção: via service_role (registro feito pela API)
CREATE POLICY "users_insert_service" ON users
  FOR INSERT WITH CHECK (TRUE); -- controlado pela API

-- ─── candidate_profiles ──────────────────────────────────────
-- Candidato vê/edita seu próprio perfil; empresas e admins podem ler
CREATE POLICY "candidate_select" ON candidate_profiles
  FOR SELECT USING (
    "userId" = auth_user_db_id()
    OR auth_user_role() IN ('COMPANY', 'ADMIN')
  );

CREATE POLICY "candidate_insert_own" ON candidate_profiles
  FOR INSERT WITH CHECK ("userId" = auth_user_db_id());

CREATE POLICY "candidate_update_own" ON candidate_profiles
  FOR UPDATE USING ("userId" = auth_user_db_id());

CREATE POLICY "candidate_delete_own" ON candidate_profiles
  FOR DELETE USING ("userId" = auth_user_db_id());

-- ─── experiences / educations / certifications / portfolio ───
-- Padrão: candidato gerencia os próprios; empresa/admin podem ler
DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['experiences','educations','certifications','portfolio_items']
  LOOP
    EXECUTE format('
      CREATE POLICY "%s_select" ON %I
        FOR SELECT USING (
          "candidateId" IN (
            SELECT id FROM candidate_profiles WHERE "userId" = auth_user_db_id()
          )
          OR auth_user_role() IN (''COMPANY'', ''ADMIN'')
        );
      CREATE POLICY "%s_write" ON %I
        FOR ALL USING (
          "candidateId" IN (
            SELECT id FROM candidate_profiles WHERE "userId" = auth_user_db_id()
          )
        );
    ', t, t, t, t);
  END LOOP;
END $$;

-- ─── candidate_skills ────────────────────────────────────────
CREATE POLICY "cskills_select" ON candidate_skills
  FOR SELECT USING (
    "candidateId" IN (
      SELECT id FROM candidate_profiles WHERE "userId" = auth_user_db_id()
    )
    OR auth_user_role() IN ('COMPANY', 'ADMIN')
  );

CREATE POLICY "cskills_write" ON candidate_skills
  FOR ALL USING (
    "candidateId" IN (
      SELECT id FROM candidate_profiles WHERE "userId" = auth_user_db_id()
    )
  );

-- ─── company_profiles ────────────────────────────────────────
CREATE POLICY "company_select" ON company_profiles
  FOR SELECT USING (
    "userId" = auth_user_db_id()
    OR auth_user_role() IN ('CANDIDATE', 'ADMIN')
  );

CREATE POLICY "company_write_own" ON company_profiles
  FOR ALL USING ("userId" = auth_user_db_id() OR auth_user_role() = 'ADMIN');

-- ─── jobs ────────────────────────────────────────────────────
-- Vagas publicadas: todos podem ler; empresa gerencia as suas
CREATE POLICY "jobs_select_published" ON jobs
  FOR SELECT USING (
    status = 'PUBLISHED'
    OR "companyId" IN (
      SELECT id FROM company_profiles WHERE "userId" = auth_user_db_id()
    )
    OR auth_user_role() = 'ADMIN'
  );

CREATE POLICY "jobs_write_own" ON jobs
  FOR ALL USING (
    "companyId" IN (
      SELECT id FROM company_profiles WHERE "userId" = auth_user_db_id()
    )
    OR auth_user_role() = 'ADMIN'
  );

-- ─── applications ────────────────────────────────────────────
-- Candidato vê suas candidaturas; empresa vê candidaturas das suas vagas
CREATE POLICY "app_select" ON applications
  FOR SELECT USING (
    "candidateId" IN (
      SELECT id FROM candidate_profiles WHERE "userId" = auth_user_db_id()
    )
    OR "jobId" IN (
      SELECT j.id FROM jobs j
      JOIN company_profiles cp ON cp.id = j."companyId"
      WHERE cp."userId" = auth_user_db_id()
    )
    OR auth_user_role() = 'ADMIN'
  );

CREATE POLICY "app_candidate_insert" ON applications
  FOR INSERT WITH CHECK (
    "candidateId" IN (
      SELECT id FROM candidate_profiles WHERE "userId" = auth_user_db_id()
    )
  );

CREATE POLICY "app_company_update" ON applications
  FOR UPDATE USING (
    "jobId" IN (
      SELECT j.id FROM jobs j
      JOIN company_profiles cp ON cp.id = j."companyId"
      WHERE cp."userId" = auth_user_db_id()
    )
    OR auth_user_role() = 'ADMIN'
  );

-- ─── test_results ────────────────────────────────────────────
CREATE POLICY "test_select" ON test_results
  FOR SELECT USING (
    "candidateId" IN (
      SELECT id FROM candidate_profiles WHERE "userId" = auth_user_db_id()
    )
    OR auth_user_role() IN ('COMPANY', 'ADMIN')
  );

CREATE POLICY "test_insert_own" ON test_results
  FOR INSERT WITH CHECK (
    "candidateId" IN (
      SELECT id FROM candidate_profiles WHERE "userId" = auth_user_db_id()
    )
  );

-- ─── interviews ──────────────────────────────────────────────
CREATE POLICY "interview_select" ON interviews
  FOR SELECT USING (
    "candidateId" IN (
      SELECT id FROM candidate_profiles WHERE "userId" = auth_user_db_id()
    )
    OR auth_user_role() IN ('COMPANY', 'ADMIN')
  );

CREATE POLICY "interview_write_own" ON interviews
  FOR ALL USING (
    "candidateId" IN (
      SELECT id FROM candidate_profiles WHERE "userId" = auth_user_db_id()
    )
  );

-- ─── interview_messages ──────────────────────────────────────
CREATE POLICY "imsg_select" ON interview_messages
  FOR SELECT USING (
    "interviewId" IN (
      SELECT i.id FROM interviews i
      JOIN candidate_profiles cp ON cp.id = i."candidateId"
      WHERE cp."userId" = auth_user_db_id()
    )
    OR auth_user_role() = 'ADMIN'
  );

CREATE POLICY "imsg_insert" ON interview_messages
  FOR INSERT WITH CHECK (
    "interviewId" IN (
      SELECT i.id FROM interviews i
      JOIN candidate_profiles cp ON cp.id = i."candidateId"
      WHERE cp."userId" = auth_user_db_id()
    )
  );

-- ─── audit_logs ──────────────────────────────────────────────
-- Apenas admins leem audit logs; inserção via service_role
CREATE POLICY "audit_admin_select" ON audit_logs
  FOR SELECT USING (auth_user_role() = 'ADMIN');

CREATE POLICY "audit_insert_all" ON audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- ─── saved_candidates ────────────────────────────────────────
CREATE POLICY "saved_select" ON saved_candidates
  FOR SELECT USING (
    "companyId" IN (
      SELECT id FROM company_profiles WHERE "userId" = auth_user_db_id()
    )
  );

CREATE POLICY "saved_write" ON saved_candidates
  FOR ALL USING (
    "companyId" IN (
      SELECT id FROM company_profiles WHERE "userId" = auth_user_db_id()
    )
  );

-- ============================================================
--  DADOS INICIAIS — Skills populares
-- ============================================================
INSERT INTO skills (id, name, category) VALUES
  ('sk_react',      'React',           'Frontend'),
  ('sk_nextjs',     'Next.js',         'Frontend'),
  ('sk_typescript', 'TypeScript',      'Linguagem'),
  ('sk_javascript', 'JavaScript',      'Linguagem'),
  ('sk_python',     'Python',          'Linguagem'),
  ('sk_nodejs',     'Node.js',         'Backend'),
  ('sk_postgresql', 'PostgreSQL',      'Banco de Dados'),
  ('sk_mysql',      'MySQL',           'Banco de Dados'),
  ('sk_mongodb',    'MongoDB',         'Banco de Dados'),
  ('sk_docker',     'Docker',          'DevOps'),
  ('sk_kubernetes', 'Kubernetes',      'DevOps'),
  ('sk_aws',        'AWS',             'Cloud'),
  ('sk_gcp',        'GCP',             'Cloud'),
  ('sk_azure',      'Azure',           'Cloud'),
  ('sk_git',        'Git',             'Ferramenta'),
  ('sk_figma',      'Figma',           'Design'),
  ('sk_ux',         'UX Research',     'Design'),
  ('sk_agile',      'Agile/Scrum',     'Gestão'),
  ('sk_pm',         'Product Management', 'Gestão'),
  ('sk_data',       'Data Analysis',   'Dados'),
  ('sk_ml',         'Machine Learning','IA'),
  ('sk_openai',     'OpenAI API',      'IA'),
  ('sk_tailwind',   'TailwindCSS',     'Frontend'),
  ('sk_prisma',     'Prisma ORM',      'Backend'),
  ('sk_graphql',    'GraphQL',         'API'),
  ('sk_rest',       'REST API',        'API'),
  ('sk_java',       'Java',            'Linguagem'),
  ('sk_csharp',     'C#',              'Linguagem'),
  ('sk_go',         'Go',              'Linguagem'),
  ('sk_rust',       'Rust',            'Linguagem')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
--  STORAGE BUCKETS (execute no Supabase Storage ou via API)
-- ============================================================
-- Crie os seguintes buckets no Supabase Dashboard > Storage:
--   • avatars      (público)
--   • resumes      (privado)
--   • logos        (público)
--   • portfolios   (público)
--
-- Ou via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars',    'avatars',    TRUE),
  ('resumes',    'resumes',    FALSE),
  ('logos',      'logos',      TRUE),
  ('portfolios', 'portfolios', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: usuário só acessa seus próprios arquivos
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_user_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT IS NOT NULL
  );

CREATE POLICY "resumes_user_access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "logos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "logos_company_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos'
    AND auth.uid()::TEXT IS NOT NULL
  );

-- ============================================================
--  VERIFICAÇÃO FINAL
-- ============================================================
DO $$
DECLARE
  tbl TEXT;
  cnt INT;
BEGIN
  RAISE NOTICE '=== Aptiva AI — Tabelas criadas ===';
  FOREACH tbl IN ARRAY ARRAY[
    'users','candidate_profiles','experiences','educations','skills',
    'candidate_skills','certifications','portfolio_items','company_profiles',
    'jobs','job_skills','applications','saved_candidates','test_results',
    'interviews','interview_messages','admin_profiles','audit_logs'
  ]
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM %I', tbl) INTO cnt;
    RAISE NOTICE '✓ % (% registros)', tbl, cnt;
  END LOOP;
  RAISE NOTICE '=== Setup concluído com sucesso! ===';
END $$;
