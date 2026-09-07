UPDATE season_player_stats SET active = FALSE WHERE id NOT IN (
    SELECT MIN(id) FROM season_player_stats WHERE active = TRUE GROUP BY name, team, age_group
) AND active = TRUE;