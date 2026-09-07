export type AgeGroup = '2011-2012' | '2012-2013' | '2013-2014' | '2015-2016' | '2017-2018';

export const AGE_GROUPS: { id: AgeGroup; label: string; short: string }[] = [
  { id: '2011-2012', label: 'Юниоры 2011–2012 г.р. · 8х8', short: '2011–2012' },
  { id: '2012-2013', label: '2012–2013 г.р. · 11х11', short: '2012–2013' },
  { id: '2013-2014', label: 'Юниоры 2013–2014 г.р. · 8х8', short: '2013–2014' },
  { id: '2015-2016', label: 'Средние 2015–2016 г.р. · 5х5', short: '2015–2016' },
  { id: '2017-2018', label: 'Младшие 2017–2018 г.р. · 5х5', short: '2017–2018' },
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

export const STANDINGS: Record<AgeGroup, TeamRow[]> = {
  '2011-2012': [],
  '2012-2013': [],
  '2013-2014': [],
  '2015-2016': [],
  '2017-2018': [],
};

export const RESULTS: Match[] = [];
export const SCHEDULE: Match[] = [];
export const TEAMS: Team[] = [];
export const SQUADS: Record<string, Player[]> = {};
export const ALL_PLAYERS: Player[] = [];

export const SEASON = 'сезон 25/26';
