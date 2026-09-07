CREATE TABLE IF NOT EXISTS reschedule_requests (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL,
    team TEXT NOT NULL,
    coach_name TEXT NOT NULL DEFAULT '',
    old_date TEXT NOT NULL DEFAULT '',
    old_time TEXT NOT NULL DEFAULT '',
    new_date TEXT NOT NULL,
    new_time TEXT NOT NULL DEFAULT '',
    reason TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reschedule_match ON reschedule_requests(match_id);
CREATE INDEX IF NOT EXISTS idx_reschedule_team ON reschedule_requests(team);