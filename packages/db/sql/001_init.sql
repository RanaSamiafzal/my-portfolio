CREATE TABLE IF NOT EXISTS messages (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  company     TEXT,
  interest    TEXT,
  message     TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'form',
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guestbook (
  id          BIGSERIAL PRIMARY KEY,
  author      TEXT NOT NULL,
  email       TEXT NOT NULL,
  avatar      TEXT,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_created_idx ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS guestbook_created_idx ON guestbook (created_at DESC);
