import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Match, Player, TeamRow } from '@/data/league';
import {
  fetchLeague,
  toMatch,
  toPlayers,
  toRows,
  type ApiMatch,
  type ApiOverallRow,
  type LeagueData,
  type SquadPlayer,
  type ApiTeam,
} from '@/lib/league-api';

interface LeagueState {
  loading: boolean;
  raw: ApiMatch[];
  matches: Match[];
  results: Match[];
  schedule: Match[];
  standings: Record<string, TeamRow[]>;
  overall: ApiOverallRow[];
  players: Player[];
  squad: SquadPlayer[];
  teams: ApiTeam[];
  nextMatch: Match | null;
  lastRound: number;
  applyData: (data: LeagueData) => void;
  reload: () => Promise<void>;
}

const LeagueContext = createContext<LeagueState | null>(null);

const fallback: LeagueData | null = null;

export const LeagueProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<LeagueData | null>(fallback);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchLeague());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo<LeagueState>(() => {
    if (!data) {
      return {
        loading,
        raw: [],
        matches: [],
        results: [],
        schedule: [],
        standings: {},
        overall: [],
        players: [],
        squad: [],
        teams: [],
        nextMatch: null,
        lastRound: 0,
        applyData: setData,
        reload,
      };
    }

    const sortKey = (raw: ApiMatch) => `${raw.match_date}T${raw.match_time || '00:00'}`;
    const byId = new Map(data.matches.map((raw) => [String(raw.id), raw]));
    const dateOf = (m: Match) => sortKey(byId.get(m.id)!);

    const matches = data.matches.map(toMatch);
    const results = matches
      .filter((m) => m.protocol && m.homeGoals !== undefined)
      .sort((a, b) => (dateOf(a) < dateOf(b) ? 1 : -1));
    const schedule = matches
      .filter((m) => !m.protocol)
      .sort((a, b) => (dateOf(a) < dateOf(b) ? -1 : 1));
    const standings: Record<string, TeamRow[]> = {};
    Object.entries(data.standings).forEach(([g, rows]) => {
      standings[g] = toRows(rows);
    });

    const todayKey = new Date().toISOString().slice(0, 10);
    const upcoming = schedule.filter((m) => {
      const raw = byId.get(m.id);
      return raw && raw.match_date >= todayKey;
    });

    return {
      loading,
      raw: data.matches,
      matches,
      results,
      schedule,
      standings,
      overall: data.overall ?? [],
      players: toPlayers(data.players, data.matches),
      squad: data.squad ?? [],
      teams: data.teams ?? [],
      nextMatch: upcoming[0] ?? schedule[0] ?? null,
      lastRound: results[0]?.round ?? 0,
      applyData: setData,
      reload,
    };
  }, [data, loading, reload]);

  return <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>;
};

export const useLeague = () => {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error('useLeague must be used within LeagueProvider');
  return ctx;
};