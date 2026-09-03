import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import AdminLogin from '@/components/admin/AdminLogin';
import MatchEditor from '@/components/admin/MatchEditor';
import { useLeague } from '@/context/LeagueContext';
import type { ApiMatch } from '@/lib/league-api';

const Admin = () => {
  const [token, setToken] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'played' | 'upcoming'>('all');
  const { raw, standings, players, applyData, loading } = useLeague();

  useEffect(() => {
    setToken(localStorage.getItem('sao_admin_token'));
  }, []);

  const matches = useMemo(() => {
    const list = [...raw].sort((a, b) => a.round - b.round || a.id - b.id);
    if (filter === 'played') return list.filter((m) => m.played);
    if (filter === 'upcoming') return list.filter((m) => !m.played);
    return list;
  }, [raw, filter]);

  const current = raw.find((m) => m.id === editing) ?? null;

  if (!token) return <AdminLogin onSuccess={setToken} />;

  const logout = () => {
    localStorage.removeItem('sao_admin_token');
    setToken(null);
  };

  const totalGoals = raw.reduce((s, m) => s + (m.goals?.length ?? 0), 0);
  const playedCount = raw.filter((m) => m.played).length;

  return (
    <div className="screen-vignette min-h-screen">
      <div className="mx-auto w-full max-w-[1180px] px-5 pb-20 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 py-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-accent text-accent-foreground">
              <Icon name="ClipboardList" size={17} />
            </span>
            <span className="font-head text-[1.06rem] font-bold tracking-[-0.015em]">
              Админ · Первенство САО
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-full bg-secondary px-4 py-2 text-[0.85rem] font-semibold text-muted-foreground hover:text-foreground"
            >
              На сайт
            </a>
            <button
              onClick={logout}
              className="rounded-full bg-primary px-4 py-2 text-[0.85rem] font-semibold text-primary-foreground"
            >
              Выйти
            </button>
          </div>
        </header>

        <section className="grid gap-3 py-6 sm:grid-cols-3">
          {[
            { label: 'Сыграно матчей', value: playedCount },
            { label: 'Забито мячей', value: totalGoals },
            { label: 'Игроков в статистике', value: players.length },
          ].map((s) => (
            <div key={s.label} className="rounded-[var(--radius)] bg-card p-5">
              <p className="tabnum font-head text-[1.9rem] font-bold">{s.value}</p>
              <p className="mt-1 text-[0.82rem] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </section>

        {current ? (
          <MatchEditor
            match={current as ApiMatch}
            token={token}
            onSaved={(data) => {
              applyData(data);
              setEditing(null);
            }}
            onClose={() => setEditing(null)}
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-head text-[1.5rem] font-bold tracking-[-0.03em]">Матчи</h2>
              <div className="flex gap-2">
                {[
                  { id: 'all' as const, label: 'Все' },
                  { id: 'upcoming' as const, label: 'Предстоящие' },
                  { id: 'played' as const, label: 'Сыгранные' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      'rounded-full px-4 py-2 text-[0.85rem] font-semibold transition-colors',
                      filter === f.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] bg-card">
              {matches.map((m) => (
                <li
                  key={m.id}
                  className="grid grid-cols-1 items-center gap-3 px-5 py-4 transition-colors hover:bg-secondary/40 sm:grid-cols-[140px_1fr_auto]"
                >
                  <span className="text-[0.82rem] text-muted-foreground">
                    {m.round} тур · {m.match_date}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex-1 text-right font-medium">{m.home_team}</span>
                    <span
                      className={cn(
                        'tabnum min-w-[62px] rounded-md px-2.5 py-1 text-center font-head text-[0.95rem] font-bold',
                        m.played ? 'bg-secondary' : 'bg-secondary/50 text-muted-foreground',
                      )}
                    >
                      {m.played ? `${m.home_goals} : ${m.away_goals}` : m.match_time}
                    </span>
                    <span className="flex-1 font-medium">{m.away_team}</span>
                  </div>
                  <button
                    onClick={() => setEditing(m.id)}
                    className="flex items-center gap-1.5 justify-self-start rounded-full bg-secondary px-4 py-2 text-[0.84rem] font-semibold transition-colors hover:bg-secondary/70 sm:justify-self-end"
                  >
                    <Icon name={m.played ? 'Pencil' : 'Plus'} size={14} />
                    {m.played ? 'Изменить' : 'Внести результат'}
                  </button>
                </li>
              ))}
              {!matches.length && (
                <li className="px-5 py-8 text-center text-[0.9rem] text-muted-foreground">
                  {loading ? 'Загружаю матчи…' : 'Матчей нет'}
                </li>
              )}
            </ul>

            <p className="mt-4 flex items-center gap-2 text-[0.82rem] text-muted-foreground">
              <Icon name="Info" size={14} />
              Турнирная таблица и статистика игроков пересчитываются автоматически после сохранения.
            </p>

            <h2 className="mt-10 font-head text-[1.5rem] font-bold tracking-[-0.03em]">
              Текущая таблица
            </h2>
            <div className="mt-4 overflow-x-auto rounded-[var(--radius)] bg-card">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="px-4 py-3.5 text-left font-semibold">#</th>
                    <th className="px-2 py-3.5 text-left font-semibold">Команда</th>
                    <th className="px-2 py-3.5 text-right font-semibold">И</th>
                    <th className="px-2 py-3.5 text-right font-semibold">В</th>
                    <th className="px-2 py-3.5 text-right font-semibold">Н</th>
                    <th className="px-2 py-3.5 text-right font-semibold">П</th>
                    <th className="px-4 py-3.5 text-right font-semibold">О</th>
                  </tr>
                </thead>
                <tbody>
                  {(standings['2013'] ?? []).map((r) => (
                    <tr key={r.team} className="border-t border-border text-[0.9rem]">
                      <td className="tabnum px-4 py-3 text-muted-foreground">{r.pos}</td>
                      <td className="px-2 py-3 font-medium">{r.team}</td>
                      <td className="tabnum px-2 py-3 text-right text-muted-foreground">{r.played}</td>
                      <td className="tabnum px-2 py-3 text-right text-muted-foreground">{r.win}</td>
                      <td className="tabnum px-2 py-3 text-right text-muted-foreground">{r.draw}</td>
                      <td className="tabnum px-2 py-3 text-right text-muted-foreground">{r.loss}</td>
                      <td className="tabnum px-4 py-3 text-right font-head font-bold">{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
