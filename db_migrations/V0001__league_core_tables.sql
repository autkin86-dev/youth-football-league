CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    round INTEGER NOT NULL,
    age_group TEXT NOT NULL,
    match_date TEXT NOT NULL,
    match_time TEXT NOT NULL DEFAULT '',
    venue TEXT NOT NULL DEFAULT '',
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_goals INTEGER,
    away_goals INTEGER,
    referee TEXT NOT NULL DEFAULT '',
    played BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_goals (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id),
    minute INTEGER NOT NULL DEFAULT 0,
    player TEXT NOT NULL,
    assist TEXT NOT NULL DEFAULT '',
    side TEXT NOT NULL DEFAULT 'home',
    penalty BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS match_cards (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id),
    minute INTEGER NOT NULL DEFAULT 0,
    player TEXT NOT NULL,
    side TEXT NOT NULL DEFAULT 'home',
    color TEXT NOT NULL DEFAULT 'yellow'
);

CREATE INDEX IF NOT EXISTS idx_matches_group_round ON matches(age_group, round);
CREATE INDEX IF NOT EXISTS idx_goals_match ON match_goals(match_id);
CREATE INDEX IF NOT EXISTS idx_cards_match ON match_cards(match_id);