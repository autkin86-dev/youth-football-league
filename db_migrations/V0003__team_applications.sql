CREATE TABLE IF NOT EXISTS team_applications (
    id SERIAL PRIMARY KEY,
    team_name TEXT NOT NULL,
    coach TEXT NOT NULL,
    phone TEXT NOT NULL,
    age_group TEXT NOT NULL DEFAULT '2013',
    comment TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON team_applications(status, created_at DESC);