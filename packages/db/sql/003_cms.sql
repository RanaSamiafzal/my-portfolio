-- CMS tables: portfolio content editable from /admin

CREATE TABLE IF NOT EXISTS site_settings (
  id          INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  payload     JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  slug         TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  tagline      TEXT NOT NULL DEFAULT '',
  summary      TEXT NOT NULL DEFAULT '',
  period       TEXT NOT NULL DEFAULT '',
  context      TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'Live',
  featured     BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order   INT NOT NULL DEFAULT 0,
  categories   JSONB NOT NULL DEFAULT '[]'::jsonb,
  tech         JSONB NOT NULL DEFAULT '[]'::jsonb,
  stack        JSONB NOT NULL DEFAULT '[]'::jsonb,
  links        JSONB NOT NULL DEFAULT '[]'::jsonb,
  case_study   JSONB,
  image        TEXT,
  image_url    TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_docs (
  key         TEXT PRIMARY KEY,
  payload     JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_featured_idx ON projects (featured, sort_order);
CREATE INDEX IF NOT EXISTS projects_sort_idx ON projects (sort_order);
