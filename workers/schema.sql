-- Tempo D1 schema (push backend)
-- 3 tables : users, devices, due_dates
-- Identity model : anonymous UUID v4 generated client-side at first launch.

CREATE TABLE IF NOT EXISTS users (
  user_id      TEXT PRIMARY KEY,
  email        TEXT,
  secret_hash  TEXT,                          -- SHA-256 hex of the user's Bearer token
  timezone     TEXT NOT NULL DEFAULT 'Europe/Paris',
  notify_hour  INTEGER NOT NULL DEFAULT 9,
  created_at   INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
  device_id    TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  fcm_token    TEXT NOT NULL UNIQUE,
  platform     TEXT NOT NULL CHECK (platform IN ('ios','android')),
  app_version  TEXT,
  created_at   INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_devices_user ON devices(user_id);

CREATE TABLE IF NOT EXISTS due_dates (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subscription_name  TEXT NOT NULL,
  amount_cents       INTEGER,
  currency           TEXT,
  next_due_date      TEXT NOT NULL,
  notify_days_before INTEGER NOT NULL DEFAULT 3,
  last_notified_for  TEXT,
  updated_at         INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_due_dates_next ON due_dates(next_due_date);
CREATE INDEX IF NOT EXISTS idx_due_dates_user ON due_dates(user_id);
