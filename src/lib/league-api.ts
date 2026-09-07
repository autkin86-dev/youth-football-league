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

export interface SquadPlayer {
  id: number;
  team: string;
  age_group: string;
  name: string;
  number: number;
  position: string;
  games: number;
  goals: number;
  assists: number;
  yellow: number;
  red: number;
}

export interface ApiTeam {
  id: number;
  name: string;
  district: string;
  coach: string;
  founded: number;
  home: string;
  color: string;
  age_group: string;
}

export interface LeagueData {
  matches: ApiMatch[];
  standings: Record<string, ApiRow[]>;
  players: ApiPlayer[];
  squad: SquadPlayer[];
  teams: ApiTeam[];
}

export const saveTeam = async (
  token: string,
  payload: Omit<ApiTeam, 'id'> & { id?: number },
): Promise<LeagueData> => {
  const res = await fetch(`${LEAGUE_API}?action=save_team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось сохранить команду');
  return data;
};

export const removeTeam = async (token: string, id: number): Promise<LeagueData> => {
  const res = await fetch(`${LEAGUE_API}?action=remove_team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось удалить команду');
  return data;
};

export interface CoachAccount {
  id: number;
  login: string;
  team: string;
  age_group: string;
  coach_name: string;
}

export interface CoachSession {
  token: string;
  team: string;
  age_group: string;
  coach_name: string;
}

export const coachLogin = async (login: string, password: string): Promise<CoachSession> => {
  const res = await fetch(`${LEAGUE_API}?action=coach_login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка входа');
  return data as CoachSession;
};

export const fetchCoaches = async (token: string): Promise<CoachAccount[]> => {
  const res = await fetch(`${LEAGUE_API}?action=applications`, {
    headers: { 'X-Auth-Token': token },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось загрузить');
  return (data.coaches ?? []) as CoachAccount[];
};

export const saveCoach = async (
  token: string,
  payload: {
    id?: number;
    login: string;
    team: string;
    age_group: string;
    coach_name?: string;
    password?: string;
  },
): Promise<CoachAccount[]> => {
  const res = await fetch(`${LEAGUE_API}?action=save_coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось сохранить');
  return data.coaches as CoachAccount[];
};

export const removeCoach = async (token: string, id: number): Promise<CoachAccount[]> => {
  const res = await fetch(`${LEAGUE_API}?action=remove_coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось удалить');
  return data.coaches as CoachAccount[];
};

export const savePlayer = async (
  token: string,
  payload: { id?: number; team: string; age_group?: string; name: string; number: number; position: string },
): Promise<LeagueData> => {
  const res = await fetch(`${LEAGUE_API}?action=save_player`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось сохранить игрока');
  return data;
};

export interface RescheduleRequest {
  id: number;
  match_id: number;
  team: string;
  coach_name: string;
  old_date: string;
  old_time: string;
  new_date: string;
  new_time: string;
  reason: string;
  status: 'new' | 'approved' | 'rejected';
  created_at: string;
}

export const requestReschedule = async (
  token: string,
  payload: { match_id: number; new_date: string; new_time?: string; reason?: string },
): Promise<RescheduleRequest[]> => {
  const res = await fetch(`${LEAGUE_API}?action=reschedule_request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось отправить заявку');
  return data.reschedules as RescheduleRequest[];
};

export const fetchCoachReschedules = async (token: string): Promise<RescheduleRequest[]> => {
  const res = await fetch(`${LEAGUE_API}?action=coach_reschedules`, {
    headers: { 'X-Auth-Token': token },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось загрузить');
  return (data.reschedules ?? []) as RescheduleRequest[];
};

export const fetchAllReschedules = async (token: string): Promise<RescheduleRequest[]> => {
  const res = await fetch(`${LEAGUE_API}?action=applications`, {
    headers: { 'X-Auth-Token': token },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось загрузить');
  return (data.reschedules ?? []) as RescheduleRequest[];
};

export const setRescheduleStatus = async (
  token: string,
  id: number,
  status: RescheduleRequest['status'],
): Promise<{ reschedules: RescheduleRequest[]; data: LeagueData }> => {
  const res = await fetch(`${LEAGUE_API}?action=reschedule_status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
    body: JSON.stringify({ id, status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось обновить');
  const { reschedules, ...rest } = data;
  return { reschedules, data: rest as LeagueData };
};

export const removePlayer = async (token: string, id: number): Promise<LeagueData> => {
  const res = await fetch(`${LEAGUE_API}?action=remove_player`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось удалить игрока');
  return data;
};

const formatMatchDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
};

export const toMatch = (m: ApiMatch): Match => ({
  id: String(m.id),
  round: m.round,
  group: m.age_group as AgeGroup,
  date: formatMatchDate(m.match_date),
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
      const homeKey = `${m.home_team}|${m.age_group}`;
      const awayKey = `${m.away_team}|${m.age_group}`;
      gamesByTeam.set(homeKey, (gamesByTeam.get(homeKey) ?? 0) + 1);
      gamesByTeam.set(awayKey, (gamesByTeam.get(awayKey) ?? 0) + 1);
    });

  return players.map((p) => {
    const meta = idx.get(`${p.name}|${p.team}`);
    return {
      name: p.name,
      team: p.team,
      group: p.group as AgeGroup,
      position: meta?.position ?? 'Полузащитник',
      number: meta?.number ?? 0,
      games: gamesByTeam.get(`${p.team}|${p.group}`) ?? 0,
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

export interface Application {
  id: number;
  team_name: string;
  coach: string;
  phone: string;
  age_group: string;
  comment: string;
  status: 'new' | 'approved' | 'rejected';
  created_at: string;
}

export const sendApplication = async (payload: {
  team_name: string;
  coach: string;
  phone: string;
  age_group: string;
  comment?: string;
}) => {
  const res = await fetch(`${LEAGUE_API}?action=apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось отправить заявку');
  return data;
};

export const fetchApplications = async (token: string): Promise<Application[]> => {
  const res = await fetch(`${LEAGUE_API}?action=applications`, {
    headers: { 'X-Auth-Token': token },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось загрузить заявки');
  return data.applications as Application[];
};

export const setApplicationStatus = async (
  token: string,
  id: number,
  status: Application['status'],
): Promise<Application[]> => {
  const res = await fetch(`${LEAGUE_API}?action=application_status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
    body: JSON.stringify({ id, status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось обновить статус');
  return data.applications as Application[];
};

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