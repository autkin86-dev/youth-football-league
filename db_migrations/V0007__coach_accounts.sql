CREATE TABLE IF NOT EXISTS coach_accounts (
    id SERIAL PRIMARY KEY,
    login TEXT NOT NULL UNIQUE,
    team TEXT NOT NULL,
    coach_name TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_login ON coach_accounts(login);