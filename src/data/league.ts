export type AgeGroup = '2011' | '2012' | '2013';

export const AGE_GROUPS: { id: AgeGroup; label: string; short: string }[] = [
  { id: '2011', label: 'Юноши 2011 г.р.', short: 'U15 · 2011' },
  { id: '2012', label: 'Юноши 2012 г.р.', short: 'U14 · 2012' },
  { id: '2013', label: 'Юноши 2013 г.р.', short: 'U13 · 2013' },
];

export interface TeamRow {
  pos: number;
  team: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  scored: number;
  missed: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface Goal {
  minute: number;
  player: string;
  team: 'home' | 'away';
  penalty?: boolean;
}

export interface CardEvent {
  minute: number;
  player: string;
  team: 'home' | 'away';
  color: 'yellow' | 'red';
}

export interface Match {
  id: string;
  round: number;
  group: AgeGroup;
  date: string;
  time: string;
  venue: string;
  home: string;
  away: string;
  homeGoals?: number;
  awayGoals?: number;
  goals?: Goal[];
  cards?: CardEvent[];
  referee?: string;
  protocol?: boolean;
}

export interface Player {
  name: string;
  team: string;
  group: AgeGroup;
  position: 'Вратарь' | 'Защитник' | 'Полузащитник' | 'Нападающий';
  number: number;
  games: number;
  goals: number;
  assists: number;
  yellow: number;
  red: number;
}

export interface Team {
  name: string;
  district: string;
  coach: string;
  founded: number;
  home: string;
  color: string;
  group: AgeGroup;
}

const diff = (r: TeamRow) => r.scored - r.missed;
export const goalDiff = diff;

const table2013: TeamRow[] = [
  { pos: 1, team: 'Динамо-2013', played: 6, win: 5, draw: 1, loss: 0, scored: 21, missed: 9, points: 16, form: ['W', 'W', 'D', 'W', 'W', 'W'] },
  { pos: 2, team: 'Тимирязевец', played: 6, win: 4, draw: 2, loss: 0, scored: 18, missed: 9, points: 14, form: ['W', 'D', 'W', 'W', 'D', 'W'] },
  { pos: 3, team: 'Сокол-2012', played: 6, win: 4, draw: 1, loss: 1, scored: 19, missed: 12, points: 13, form: ['L', 'W', 'W', 'D', 'W', 'W'] },
  { pos: 4, team: 'Крылья САО', played: 6, win: 3, draw: 1, loss: 2, scored: 14, missed: 12, points: 10, form: ['W', 'W', 'L', 'D', 'W', 'L'] },
  { pos: 5, team: 'Ходынка', played: 6, win: 2, draw: 2, loss: 2, scored: 11, missed: 11, points: 8, form: ['D', 'L', 'W', 'W', 'L', 'D'] },
  { pos: 6, team: 'Восход', played: 6, win: 2, draw: 1, loss: 3, scored: 10, missed: 13, points: 7, form: ['L', 'W', 'L', 'W', 'L', 'D'] },
  { pos: 7, team: 'Аэропорт', played: 6, win: 1, draw: 1, loss: 4, scored: 7, missed: 15, points: 4, form: ['L', 'L', 'D', 'L', 'W', 'L'] },
  { pos: 8, team: 'Бескудниково', played: 6, win: 0, draw: 1, loss: 5, scored: 5, missed: 24, points: 1, form: ['L', 'L', 'L', 'D', 'L', 'L'] },
];

const table2012: TeamRow[] = [
  { pos: 1, team: 'Сокол-2012', played: 6, win: 6, draw: 0, loss: 0, scored: 24, missed: 6, points: 18, form: ['W', 'W', 'W', 'W', 'W', 'W'] },
  { pos: 2, team: 'Коптево', played: 6, win: 4, draw: 1, loss: 1, scored: 17, missed: 10, points: 13, form: ['W', 'W', 'L', 'W', 'D', 'W'] },
  { pos: 3, team: 'Динамо-2012', played: 6, win: 4, draw: 0, loss: 2, scored: 16, missed: 11, points: 12, form: ['W', 'L', 'W', 'W', 'L', 'W'] },
  { pos: 4, team: 'Головинские пруды', played: 6, win: 3, draw: 1, loss: 2, scored: 13, missed: 12, points: 10, form: ['D', 'W', 'W', 'L', 'W', 'L'] },
  { pos: 5, team: 'Тимирязевец', played: 6, win: 2, draw: 2, loss: 2, scored: 12, missed: 13, points: 8, form: ['W', 'D', 'L', 'D', 'L', 'W'] },
  { pos: 6, team: 'Аэропорт', played: 6, win: 1, draw: 2, loss: 3, scored: 9, missed: 15, points: 5, form: ['L', 'D', 'L', 'W', 'D', 'L'] },
  { pos: 7, team: 'Левобережный', played: 6, win: 1, draw: 1, loss: 4, scored: 8, missed: 17, points: 4, form: ['L', 'L', 'D', 'L', 'L', 'W'] },
  { pos: 8, team: 'Западное Дегунино', played: 6, win: 0, draw: 1, loss: 5, scored: 6, missed: 21, points: 1, form: ['L', 'D', 'L', 'L', 'L', 'L'] },
];

const table2011: TeamRow[] = [
  { pos: 1, team: 'Тимирязевец', played: 6, win: 5, draw: 0, loss: 1, scored: 20, missed: 8, points: 15, form: ['W', 'W', 'W', 'L', 'W', 'W'] },
  { pos: 2, team: 'Динамо-2011', played: 6, win: 4, draw: 2, loss: 0, scored: 18, missed: 7, points: 14, form: ['D', 'W', 'W', 'W', 'D', 'W'] },
  { pos: 3, team: 'Ховрино', played: 6, win: 4, draw: 1, loss: 1, scored: 15, missed: 10, points: 13, form: ['W', 'W', 'D', 'W', 'L', 'W'] },
  { pos: 4, team: 'Сокол-2011', played: 6, win: 2, draw: 2, loss: 2, scored: 12, missed: 12, points: 8, form: ['W', 'D', 'L', 'D', 'W', 'L'] },
  { pos: 5, team: 'Молжаниновка', played: 6, win: 2, draw: 1, loss: 3, scored: 11, missed: 14, points: 7, form: ['L', 'W', 'D', 'L', 'W', 'L'] },
  { pos: 6, team: 'Войковец', played: 6, win: 2, draw: 0, loss: 4, scored: 10, missed: 16, points: 6, form: ['W', 'L', 'L', 'W', 'L', 'L'] },
  { pos: 7, team: 'Восточное Дегунино', played: 6, win: 1, draw: 2, loss: 3, scored: 9, missed: 14, points: 5, form: ['D', 'L', 'W', 'L', 'D', 'L'] },
  { pos: 8, team: 'Беговой', played: 6, win: 0, draw: 2, loss: 4, scored: 6, missed: 20, points: 2, form: ['L', 'D', 'L', 'L', 'D', 'L'] },
];

export const STANDINGS: Record<AgeGroup, TeamRow[]> = {
  '2011': table2011,
  '2012': table2012,
  '2013': table2013,
};

export const RESULTS: Match[] = [
  {
    id: 'r6-1',
    round: 6,
    group: '2013',
    date: '31 августа',
    time: '11:00',
    venue: 'Стадион «Сокол», поле №2',
    home: 'Динамо-2013',
    away: 'Крылья САО',
    homeGoals: 3,
    awayGoals: 1,
    referee: 'А. Кузнецов',
    protocol: true,
    goals: [
      { minute: 9, player: 'Головин М.', team: 'home' },
      { minute: 27, player: 'Ерохин Д.', team: 'home' },
      { minute: 41, player: 'Шилов К.', team: 'away' },
      { minute: 58, player: 'Головин М.', team: 'home', penalty: true },
    ],
    cards: [
      { minute: 34, player: 'Носов А.', team: 'away', color: 'yellow' },
      { minute: 61, player: 'Ерохин Д.', team: 'home', color: 'yellow' },
    ],
  },
  {
    id: 'r6-2',
    round: 6,
    group: '2013',
    date: '31 августа',
    time: '12:30',
    venue: 'ФОК «Тимирязевский»',
    home: 'Тимирязевец',
    away: 'Аэропорт',
    homeGoals: 2,
    awayGoals: 0,
    referee: 'И. Мельник',
    protocol: true,
    goals: [
      { minute: 18, player: 'Савин П.', team: 'home' },
      { minute: 52, player: 'Кузьмин Р.', team: 'home' },
    ],
    cards: [{ minute: 44, player: 'Гуров С.', team: 'away', color: 'yellow' }],
  },
  {
    id: 'r6-3',
    round: 6,
    group: '2013',
    date: '31 августа',
    time: '14:00',
    venue: 'Поле «Ходынка»',
    home: 'Ходынка',
    away: 'Восход',
    homeGoals: 1,
    awayGoals: 1,
    referee: 'В. Панов',
    protocol: true,
    goals: [
      { minute: 22, player: 'Лебедев А.', team: 'home' },
      { minute: 66, player: 'Титов Е.', team: 'away' },
    ],
    cards: [
      { minute: 70, player: 'Лебедев А.', team: 'home', color: 'yellow' },
      { minute: 74, player: 'Барсов Н.', team: 'away', color: 'red' },
    ],
  },
  {
    id: 'r6-4',
    round: 6,
    group: '2013',
    date: '31 августа',
    time: '15:30',
    venue: 'Стадион «Сокол», поле №1',
    home: 'Сокол-2012',
    away: 'Бескудниково',
    homeGoals: 4,
    awayGoals: 2,
    referee: 'А. Кузнецов',
    protocol: true,
    goals: [
      { minute: 5, player: 'Орлов Т.', team: 'home' },
      { minute: 21, player: 'Орлов Т.', team: 'home' },
      { minute: 33, player: 'Гущин В.', team: 'away' },
      { minute: 48, player: 'Панин Л.', team: 'home' },
      { minute: 55, player: 'Кремнев И.', team: 'away' },
      { minute: 71, player: 'Орлов Т.', team: 'home' },
    ],
    cards: [{ minute: 63, player: 'Гущин В.', team: 'away', color: 'yellow' }],
  },
  {
    id: 'r5-1',
    round: 5,
    group: '2013',
    date: '24 августа',
    time: '11:00',
    venue: 'ФОК «Тимирязевский»',
    home: 'Крылья САО',
    away: 'Тимирязевец',
    homeGoals: 1,
    awayGoals: 2,
    referee: 'И. Мельник',
    protocol: true,
    goals: [
      { minute: 14, player: 'Шилов К.', team: 'home' },
      { minute: 39, player: 'Савин П.', team: 'away' },
      { minute: 68, player: 'Дорохов М.', team: 'away' },
    ],
    cards: [],
  },
  {
    id: 'r5-2',
    round: 5,
    group: '2013',
    date: '24 августа',
    time: '12:30',
    venue: 'Стадион «Сокол», поле №2',
    home: 'Динамо-2013',
    away: 'Восход',
    homeGoals: 4,
    awayGoals: 0,
    referee: 'В. Панов',
    protocol: true,
    goals: [
      { minute: 7, player: 'Головин М.', team: 'home' },
      { minute: 25, player: 'Рябов С.', team: 'home' },
      { minute: 44, player: 'Ерохин Д.', team: 'home' },
      { minute: 59, player: 'Головин М.', team: 'home' },
    ],
    cards: [],
  },
  {
    id: 'r5-3',
    round: 5,
    group: '2013',
    date: '24 августа',
    time: '14:00',
    venue: 'Поле «Ходынка»',
    home: 'Аэропорт',
    away: 'Ходынка',
    homeGoals: 2,
    awayGoals: 1,
    referee: 'А. Кузнецов',
    protocol: true,
    goals: [
      { minute: 11, player: 'Гуров С.', team: 'home' },
      { minute: 36, player: 'Лебедев А.', team: 'away' },
      { minute: 72, player: 'Никитин О.', team: 'home' },
    ],
    cards: [{ minute: 55, player: 'Никитин О.', team: 'home', color: 'yellow' }],
  },
  {
    id: 'r5-4',
    round: 5,
    group: '2013',
    date: '24 августа',
    time: '15:30',
    venue: 'Стадион «Сокол», поле №1',
    home: 'Бескудниково',
    away: 'Сокол-2012',
    homeGoals: 0,
    awayGoals: 3,
    referee: 'И. Мельник',
    protocol: true,
    goals: [
      { minute: 19, player: 'Панин Л.', team: 'away' },
      { minute: 42, player: 'Орлов Т.', team: 'away' },
      { minute: 64, player: 'Жуков А.', team: 'away' },
    ],
    cards: [],
  },
];

export const NEXT_MATCH: Match = {
  id: 'r7-1',
  round: 7,
  group: '2013',
  date: 'Суббота, 6 сентября',
  time: '12:00',
  venue: 'стадион «Сокол», поле №2',
  home: 'Динамо-2013',
  away: 'Тимирязевец',
};

export const SCHEDULE: Match[] = [
  { id: 's7-1', round: 7, group: '2013', date: 'сб, 6 сентября', time: '12:00', home: 'Динамо-2013', away: 'Тимирязевец', venue: 'Стадион «Сокол», поле №2' },
  { id: 's7-2', round: 7, group: '2013', date: 'сб, 6 сентября', time: '13:30', home: 'Восход', away: 'Сокол-2012', venue: 'Поле «Ходынка»' },
  { id: 's7-3', round: 7, group: '2013', date: 'вс, 7 сентября', time: '11:00', home: 'Аэропорт', away: 'Динамо-2013', venue: 'ФОК «Тимирязевский»' },
  { id: 's7-4', round: 7, group: '2013', date: 'вс, 7 сентября', time: '12:30', home: 'Бескудниково', away: 'Крылья САО', venue: 'Стадион «Сокол», поле №1' },
  { id: 's8-1', round: 8, group: '2013', date: 'сб, 13 сентября', time: '11:00', home: 'Тимирязевец', away: 'Сокол-2012', venue: 'ФОК «Тимирязевский»' },
  { id: 's8-2', round: 8, group: '2013', date: 'сб, 13 сентября', time: '12:30', home: 'Крылья САО', away: 'Ходынка', venue: 'Поле «Ходынка»' },
  { id: 's8-3', round: 8, group: '2013', date: 'вс, 14 сентября', time: '11:00', home: 'Динамо-2013', away: 'Бескудниково', venue: 'Стадион «Сокол», поле №2' },
  { id: 's8-4', round: 8, group: '2013', date: 'вс, 14 сентября', time: '12:30', home: 'Восход', away: 'Аэропорт', venue: 'Стадион «Сокол», поле №1' },
  { id: 's9-1', round: 9, group: '2013', date: 'сб, 20 сентября', time: '11:00', home: 'Сокол-2012', away: 'Динамо-2013', venue: 'Стадион «Сокол», поле №1' },
  { id: 's9-2', round: 9, group: '2013', date: 'сб, 20 сентября', time: '12:30', home: 'Ходынка', away: 'Тимирязевец', venue: 'Поле «Ходынка»' },
  { id: 's9-3', round: 9, group: '2013', date: 'вс, 21 сентября', time: '11:00', home: 'Аэропорт', away: 'Крылья САО', venue: 'ФОК «Тимирязевский»' },
  { id: 's9-4', round: 9, group: '2013', date: 'вс, 21 сентября', time: '12:30', home: 'Бескудниково', away: 'Восход', venue: 'Стадион «Сокол», поле №2' },
];

export const TEAMS: Team[] = [
  { name: 'Динамо-2013', district: 'Аэропорт', coach: 'Сергей Тарасов', founded: 2019, home: 'Стадион «Сокол», поле №2', color: 'Бело-синие', group: '2013' },
  { name: 'Тимирязевец', district: 'Тимирязевский', coach: 'Олег Мишин', founded: 2018, home: 'ФОК «Тимирязевский»', color: 'Зелёно-белые', group: '2013' },
  { name: 'Сокол-2012', district: 'Сокол', coach: 'Андрей Гаврилов', founded: 2017, home: 'Стадион «Сокол», поле №1', color: 'Красно-чёрные', group: '2013' },
  { name: 'Крылья САО', district: 'Хорошёвский', coach: 'Дмитрий Белов', founded: 2020, home: 'Поле «Крылья»', color: 'Сине-жёлтые', group: '2013' },
  { name: 'Ходынка', district: 'Хорошёвский', coach: 'Артём Ситников', founded: 2016, home: 'Поле «Ходынка»', color: 'Оранжево-белые', group: '2013' },
  { name: 'Восход', district: 'Дмитровский', coach: 'Павел Ершов', founded: 2019, home: 'Стадион «Восход»', color: 'Бордово-белые', group: '2013' },
  { name: 'Аэропорт', district: 'Аэропорт', coach: 'Илья Кораблёв', founded: 2021, home: 'ФОК «Аэропорт»', color: 'Голубо-белые', group: '2013' },
  { name: 'Бескудниково', district: 'Бескудниковский', coach: 'Никита Верещагин', founded: 2022, home: 'Поле «Бескудниково»', color: 'Жёлто-чёрные', group: '2013' },
];

export const SQUADS: Record<string, Player[]> = {
  'Динамо-2013': [
    { name: 'Головин Матвей', team: 'Динамо-2013', group: '2013', position: 'Нападающий', number: 9, games: 6, goals: 8, assists: 3, yellow: 1, red: 0 },
    { name: 'Ерохин Даниил', team: 'Динамо-2013', group: '2013', position: 'Полузащитник', number: 8, games: 6, goals: 4, assists: 5, yellow: 2, red: 0 },
    { name: 'Рябов Степан', team: 'Динамо-2013', group: '2013', position: 'Полузащитник', number: 10, games: 6, goals: 3, assists: 4, yellow: 0, red: 0 },
    { name: 'Афанасьев Лев', team: 'Динамо-2013', group: '2013', position: 'Защитник', number: 4, games: 6, goals: 1, assists: 1, yellow: 2, red: 0 },
    { name: 'Зотов Артём', team: 'Динамо-2013', group: '2013', position: 'Защитник', number: 3, games: 5, goals: 0, assists: 0, yellow: 1, red: 0 },
    { name: 'Мельников Игорь', team: 'Динамо-2013', group: '2013', position: 'Вратарь', number: 1, games: 6, goals: 0, assists: 0, yellow: 0, red: 0 },
  ],
  'Тимирязевец': [
    { name: 'Савин Пётр', team: 'Тимирязевец', group: '2013', position: 'Нападающий', number: 11, games: 6, goals: 7, assists: 2, yellow: 1, red: 0 },
    { name: 'Кузьмин Роман', team: 'Тимирязевец', group: '2013', position: 'Полузащитник', number: 6, games: 6, goals: 4, assists: 4, yellow: 0, red: 0 },
    { name: 'Дорохов Максим', team: 'Тимирязевец', group: '2013', position: 'Нападающий', number: 7, games: 5, goals: 3, assists: 2, yellow: 1, red: 0 },
    { name: 'Прохоров Ян', team: 'Тимирязевец', group: '2013', position: 'Защитник', number: 5, games: 6, goals: 1, assists: 0, yellow: 2, red: 0 },
    { name: 'Сомов Кирилл', team: 'Тимирязевец', group: '2013', position: 'Вратарь', number: 12, games: 6, goals: 0, assists: 1, yellow: 0, red: 0 },
  ],
  'Сокол-2012': [
    { name: 'Орлов Тимофей', team: 'Сокол-2012', group: '2013', position: 'Нападающий', number: 9, games: 6, goals: 9, assists: 1, yellow: 1, red: 0 },
    { name: 'Панин Лев', team: 'Сокол-2012', group: '2013', position: 'Полузащитник', number: 10, games: 6, goals: 5, assists: 3, yellow: 0, red: 0 },
    { name: 'Жуков Александр', team: 'Сокол-2012', group: '2013', position: 'Полузащитник', number: 8, games: 6, goals: 2, assists: 4, yellow: 1, red: 0 },
    { name: 'Тихонов Марк', team: 'Сокол-2012', group: '2013', position: 'Защитник', number: 2, games: 6, goals: 0, assists: 2, yellow: 3, red: 0 },
    { name: 'Быков Егор', team: 'Сокол-2012', group: '2013', position: 'Вратарь', number: 1, games: 6, goals: 0, assists: 0, yellow: 0, red: 0 },
  ],
  'Крылья САО': [
    { name: 'Шилов Кирилл', team: 'Крылья САО', group: '2013', position: 'Нападающий', number: 7, games: 6, goals: 6, assists: 2, yellow: 1, red: 0 },
    { name: 'Носов Артур', team: 'Крылья САО', group: '2013', position: 'Защитник', number: 4, games: 6, goals: 1, assists: 1, yellow: 3, red: 0 },
    { name: 'Гордеев Илья', team: 'Крылья САО', group: '2013', position: 'Полузащитник', number: 6, games: 5, goals: 3, assists: 3, yellow: 0, red: 0 },
    { name: 'Волков Даниил', team: 'Крылья САО', group: '2013', position: 'Вратарь', number: 1, games: 6, goals: 0, assists: 0, yellow: 1, red: 0 },
  ],
  'Ходынка': [
    { name: 'Лебедев Андрей', team: 'Ходынка', group: '2013', position: 'Нападающий', number: 10, games: 6, goals: 5, assists: 2, yellow: 2, red: 0 },
    { name: 'Кудрин Матвей', team: 'Ходынка', group: '2013', position: 'Полузащитник', number: 8, games: 6, goals: 2, assists: 3, yellow: 1, red: 0 },
    { name: 'Соловьёв Тимур', team: 'Ходынка', group: '2013', position: 'Защитник', number: 3, games: 6, goals: 1, assists: 0, yellow: 1, red: 0 },
    { name: 'Ким Виктор', team: 'Ходынка', group: '2013', position: 'Вратарь', number: 16, games: 5, goals: 0, assists: 0, yellow: 0, red: 0 },
  ],
  'Восход': [
    { name: 'Титов Егор', team: 'Восход', group: '2013', position: 'Нападающий', number: 9, games: 6, goals: 4, assists: 1, yellow: 1, red: 0 },
    { name: 'Барсов Никита', team: 'Восход', group: '2013', position: 'Защитник', number: 5, games: 6, goals: 0, assists: 1, yellow: 2, red: 1 },
    { name: 'Логинов Семён', team: 'Восход', group: '2013', position: 'Полузащитник', number: 7, games: 5, goals: 3, assists: 2, yellow: 0, red: 0 },
    { name: 'Дьяков Роман', team: 'Восход', group: '2013', position: 'Вратарь', number: 1, games: 6, goals: 0, assists: 0, yellow: 0, red: 0 },
  ],
  'Аэропорт': [
    { name: 'Гуров Савелий', team: 'Аэропорт', group: '2013', position: 'Нападающий', number: 11, games: 6, goals: 3, assists: 1, yellow: 2, red: 0 },
    { name: 'Никитин Олег', team: 'Аэропорт', group: '2013', position: 'Полузащитник', number: 8, games: 6, goals: 2, assists: 2, yellow: 2, red: 0 },
    { name: 'Фомин Глеб', team: 'Аэропорт', group: '2013', position: 'Защитник', number: 2, games: 6, goals: 1, assists: 0, yellow: 1, red: 0 },
    { name: 'Ларин Юрий', team: 'Аэропорт', group: '2013', position: 'Вратарь', number: 1, games: 6, goals: 0, assists: 0, yellow: 0, red: 0 },
  ],
  'Бескудниково': [
    { name: 'Гущин Влад', team: 'Бескудниково', group: '2013', position: 'Нападающий', number: 10, games: 6, goals: 3, assists: 0, yellow: 2, red: 0 },
    { name: 'Кремнев Иван', team: 'Бескудниково', group: '2013', position: 'Полузащитник', number: 6, games: 6, goals: 2, assists: 1, yellow: 1, red: 0 },
    { name: 'Юдин Марк', team: 'Бескудниково', group: '2013', position: 'Защитник', number: 4, games: 5, goals: 0, assists: 0, yellow: 2, red: 0 },
    { name: 'Пестов Артём', team: 'Бескудниково', group: '2013', position: 'Вратарь', number: 1, games: 6, goals: 0, assists: 0, yellow: 0, red: 0 },
  ],
};

export const ALL_PLAYERS: Player[] = Object.values(SQUADS).flat();

export const SEASON = 'сезон 25/26';
export const CURRENT_ROUND = 7;
