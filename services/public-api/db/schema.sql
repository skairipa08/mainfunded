-- FundEd Public API – Postgres schema
-- Tables: api_keys, webhook_endpoints, webhook_deliveries

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── API KEYS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       TEXT        NOT NULL,
  name            TEXT        NOT NULL,
  key_prefix      TEXT        NOT NULL,                -- first 8 chars (e.g. "fk_live_")
  key_hash        TEXT        NOT NULL UNIQUE,         -- sha256(secret)
  environment     TEXT        NOT NULL CHECK (environment IN ('live','sandbox')),
  scopes          TEXT[]      NOT NULL DEFAULT ARRAY['campaigns:read','students:read','donations:read'],
  rate_limit_rpm  INTEGER     NOT NULL DEFAULT 100,
  status          TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at      TIMESTAMPTZ,
  last_used_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_api_keys_school   ON api_keys(school_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash     ON api_keys(key_hash);

-- ── WEBHOOK ENDPOINTS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     TEXT        NOT NULL,
  url           TEXT        NOT NULL,
  secret        TEXT        NOT NULL,                  -- HMAC shared secret
  events        TEXT[]      NOT NULL,                  -- e.g. ['donation.created','campaign.completed']
  environment   TEXT        NOT NULL CHECK (environment IN ('live','sandbox')),
  status        TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_school ON webhook_endpoints(school_id);

-- ── WEBHOOK DELIVERIES (outbox + retry log) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id     UUID        NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event_type      TEXT        NOT NULL,
  payload         JSONB       NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','delivered','failed','dead')),
  attempt_count   INTEGER     NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_error      TEXT,
  last_status     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_due
  ON webhook_deliveries(status, next_attempt_at)
  WHERE status = 'pending';
