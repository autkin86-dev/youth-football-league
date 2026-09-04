CREATE TABLE IF NOT EXISTS squad_players (
    id SERIAL PRIMARY KEY,
    team TEXT NOT NULL,
    age_group TEXT NOT NULL DEFAULT '2013',
    name TEXT NOT NULL,
    number INTEGER NOT NULL DEFAULT 0,
    position TEXT NOT NULL DEFAULT 'Полузащитник',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_squad_team ON squad_players(team, number);

INSERT INTO squad_players (team, age_group, name, number, position) VALUES
('Динамо-2013','2013','Головин Матвей',9,'Нападающий'),
('Динамо-2013','2013','Ерохин Даниил',8,'Полузащитник'),
('Динамо-2013','2013','Рябов Степан',10,'Полузащитник'),
('Динамо-2013','2013','Афанасьев Лев',4,'Защитник'),
('Динамо-2013','2013','Зотов Артём',5,'Защитник'),
('Динамо-2013','2013','Мельников Игорь',1,'Вратарь');