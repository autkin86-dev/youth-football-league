ALTER TABLE match_goals ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE match_cards ADD COLUMN active boolean NOT NULL DEFAULT true;
UPDATE match_goals SET active = false WHERE id BETWEEN 28 AND 69;