CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    district TEXT NOT NULL DEFAULT '',
    coach TEXT NOT NULL DEFAULT '',
    founded INTEGER NOT NULL DEFAULT 0,
    home TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '',
    age_group TEXT NOT NULL DEFAULT '2013',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_group ON teams(age_group, name);

INSERT INTO teams (name, district, coach, founded, home, color, age_group) VALUES
('Динамо-2013','Аэропорт','Сергей Тарасов',2019,'Стадион «Сокол», поле №2','Бело-синие','2013'),
('Тимирязевец','Тимирязевский','Олег Мишин',2018,'ФОК «Тимирязевский»','Зелёно-белые','2013'),
('Сокол-2012','Сокол','Андрей Гаврилов',2017,'Стадион «Сокол», поле №1','Красно-чёрные','2013'),
('Крылья САО','Хорошёвский','Дмитрий Белов',2020,'Поле «Крылья»','Сине-жёлтые','2013'),
('Ходынка','Хорошёвский','Артём Ситников',2016,'Поле «Ходынка»','Оранжево-белые','2013'),
('Восход','Дмитровский','Павел Ершов',2019,'Стадион «Восход»','Бордово-белые','2013'),
('Аэропорт','Аэропорт','Илья Кораблёв',2021,'ФОК «Аэропорт»','Голубо-белые','2013'),
('Бескудниково','Бескудниковский','Никита Верещагин',2022,'Поле «Бескудниково»','Жёлто-чёрные','2013');