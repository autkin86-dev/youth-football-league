import type { AgeGroup, Match, Player, TeamRow } from '@/data/league';
import { SQUADS } from '@/data/league';

export const LEAGUE_API = 'https://functions.poehali.dev/7904ac3b-373f-4b0e-8ead-a1a41dadbe12';

export interface ApiGoal {
  id: number;
  minute: number;
  player: string;
  assist: string;
  side: 'home' | 'away';
  penalty: boolean;
}

export interface ApiCard {
  id: number;
  minute: number;
  player: string;
  side: 'home' | 'away';
  color: 'yellow' | 'red';
}

export interface ApiMatch {
  id: number;
  round: number;
  age_group: string;
  match_date: string;
  match_time: string;
  venue: string;
  home_team: string;
  away_team: string;
  home_goals: number | null;
  away_goals: number | null;
  referee: string;
  played: boolean;
  goals: ApiGoal[];
  cards: ApiCard[];
}

export interface ApiPlayer {
  name: string;
  team: string;
  group: string;
  goals: number;
  assists: number;
  yellow: number;
  red: number;
}

export interface ApiRow {
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

export interface LeagueData {
  matches: ApiMatch[];
  standings: Record<string, ApiRow[]>;
  players: ApiPlayer[];
}

export const toMatch = (m: ApiMatch): Match => ({
  id: String(m.id),
  round: m.round,
  group: m.age_group as AgeGroup,
  date: m.match_date,
  time: m.match_time,
  venue: m.venue,
  home: m.home_team,
  away: m.away_team,
  homeGoals: m.home_goals ?? undefined,
  awayGoals: m.away_goals ?? undefined,
  referee: m.referee,
  protocol: m.played,
  goals: (m.goals || []).map((g) => ({
    minute: g.minute,
    player: g.player,
    team: g.side,
    penalty: g.penalty,
  })),
  cards: (m.cards || []).map((c) => ({
    minute: c.minute,
    player: c.player,
    team: c.side,
    color: c.color,
  })),
});

export const toRows = (rows: ApiRow[]): TeamRow[] => rows.map((r) => ({ ...r }));

const squadIndex = () => {
  const map = new Map<string, { position: Player['position']; number: number }>();
  Object.values(SQUADS)
    .flat()
    .forEach((p) => {
      const short = `${p.name.split(' ')[0]} ${p.name.split(' ')[1]?.[0] ?? ''}.`;
      map.set(`${p.name}|${p.team}`, { position: p.position, number: p.number });
      map.set(`${short}|${p.team}`, { position: p.position, number: p.number });
    });
  return map;
};

export const toPlayers = (players: ApiPlayer[], matches: ApiMatch[]): Player[] => {
  const idx = squadIndex();
  const gamesByTeam = new Map<string, number>();
  matches
    .filter((m) => m.played)
    .forEach((m) => {
      gamesByTeam.set(m.home_team, (gamesByTeam.get(m.home_team) ?? 0) + 1);
      gamesByTeam.set(m.away_team, (gamesByTeam.get(m.away_team) ?? 0) + 1);
    });

  return players.map((p) => {
    const meta = idx.get(`${p.name}|${p.team}`);
    return {
      name: p.name,
      team: p.team,
      group: p.group as AgeGroup,
      position: meta?.position ?? 'Полузащитник',
      number: meta?.number ?? 0,
      games: gamesByTeam.get(p.team) ?? 0,
      goals: p.goals,
      assists: p.assists,
      yellow: p.yellow,
      red: p.red,
    };
  });
};

export const fetchLeague = async (): Promise<LeagueData> => {
  const res = await fetch(LEAGUE_API);
  if (!res.ok) throw new Error('Не удалось загрузить данные');
  return res.json();
};

export const adminLogin = async (password: string): Promise<string> => {
  const res = await fetch(`${LEAGUE_API}?action=login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка входа');
  return data.token as string;
};

export interface SaveMatchPayload {
  id?: number;
  round?: number;
  age_group?: string;
  match_date?: string;
  match_time?: string;
  venue?: string;
  home_team?: string;
  away_team?: string;
  home_goals: number | null;
  away_goals: number | null;
  referee?: string;
  played?: boolean;
  goals: { minute: number; player: string; assist?: string; side: 'home' | 'away'; penalty?: boolean }[];
  cards: { minute: number; player: string; side: 'home' | 'away'; color: 'yellow' | 'red' }[];
}

export const saveMatch = async (token: string, payload: SaveMatchPayload): Promise<LeagueData> => {
  const res = await fetch(`${LEAGUE_API}?action=save_match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось сохранить');
  return data;
};
