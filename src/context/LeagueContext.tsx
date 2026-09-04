import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AgeGroup, Match, Player, TeamRow } from '@/data/league';
import { STANDINGS, RESULTS, SCHEDULE, ALL_PLAYERS } from '@/data/league';
import {
  fetchLeague,
  toMatch,
  toPlayers,
  toRows,
  type ApiMatch,
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
        matches: [...RESULTS, ...SCHEDULE],
        results: RESULTS,
        schedule: SCHEDULE,
        standings: STANDINGS as Record<string, TeamRow[]>,
        players: ALL_PLAYERS,
        squad: [],
        teams: [],
        nextMatch: SCHEDULE[0] ?? null,
        lastRound: RESULTS[0]?.round ?? 0,
        applyData: setData,
        reload,
      };
    }

    const matches = data.matches.map(toMatch);
    const results = matches
      .filter((m) => m.protocol && m.homeGoals !== undefined)
      .sort((a, b) => b.round - a.round);
    const schedule = matches.filter((m) => !m.protocol).sort((a, b) => a.round - b.round);
    const standings: Record<string, TeamRow[]> = {};
    Object.entries(data.standings).forEach(([g, rows]) => {
      standings[g] = toRows(rows);
    });
    (['2011', '2012', '2013'] as AgeGroup[]).forEach((g) => {
      if (!standings[g]) standings[g] = STANDINGS[g];
    });

    return {
      loading,
      raw: data.matches,
      matches,
      results,
      schedule,
      standings,
      players: toPlayers(data.players, data.matches),
      squad: data.squad ?? [],
      teams: data.teams ?? [],
      nextMatch: schedule[0] ?? null,
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