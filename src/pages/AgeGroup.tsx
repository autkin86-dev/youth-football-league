import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { AGE_GROUPS, SEASON, goalDiff, type AgeGroup } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';
import { useSeo } from '@/hooks/use-seo';
import { teamSlug } from '@/pages/Team';

const FORM_STYLE = {
  W: 'bg-win/20 text-win',
  D: 'bg-secondary text-muted-foreground',
  L: 'bg-accent/15 text-accent',
} as const;

const AgeGroupPage = () => {
  const { ageGroup: slug = '' } = useParams();
  const meta = AGE_GROUPS.find((g) => g.id === slug);
  const { standings, results, schedule, players, teams, squad, loading } = useLeague();

  const groupId = meta?.id as AgeGroup | undefined;

  const rows = groupId ? standings[groupId] ?? [] : [];
  const groupResults = useMemo(
    () => (groupId ? results.filter((m) => m.group === groupId).slice(0, 6) : []),
    [results, groupId],
  );
  const groupSchedule = useMemo(
    () => (groupId ? schedule.filter((m) => m.group === groupId).slice(0, 6) : []),
    [schedule, groupId],
  );
  const groupPlayers = useMemo(
    () =>
      groupId
        ? players
            .filter((p) => p.group === groupId)
            .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
            .slice(0, 10)
        : [],
    [players, groupId],
  );
  const groupTeams = useMemo(
    () => (groupId ? teams.filter((t) => t.age_group === groupId) : []),
    [teams, groupId],
  );
  const squadCount = (teamName: string) =>
    squad.filter((p) => p.team === teamName && p.age_group === groupId).length;

  useSeo({
    title: meta ? `${meta.label} — ${SEASON}` : 'Возрастная группа не найдена',
    description: meta
      ? `Первенство САО по футболу — ${meta.label}. Турнирная таблица, результаты, ближайшие игры, бомбардиры и команды группы ${meta.short} г.р.`
      : undefined,
    path: `/${slug}`,
    noindex: !meta,
  });

  if (!meta) {
    return (
      <div className="screen-vignette grid min-h-screen place-items-center px-5 text-center">
        <div>
          <h1 className="font-head text-[1.6rem] font-bold">
            {loading ? 'Загружаю группу…' : 'Возрастная группа не найдена'}
          </h1>
          <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <Icon name="ArrowLeft" size={15} />
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-vignette min-h-screen">
      <div className="mx-auto w-full max-w-[1180px] px-5 pb-20 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-accent text-accent-foreground">
              <Icon name="Trophy" size={17} />
            </span>
            <span className="font-head text-[1.06rem] font-bold tracking-[-0.015em]">Первенство САО</span>
            <span className="hidden rounded-full bg-secondary px-2 py-[3px] text-[0.68rem] font-semibold text-muted-foreground sm:inline">
              {SEASON}
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-[0.85rem] font-semibold text-muted-foreground hover:text-foreground"
          >
            <Icon name="ArrowLeft" size={14} />
            Все группы
          </Link>
        </header>

        <nav className="mt-5 flex items-center gap-1.5 text-[0.8rem] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Первенство САО
          </Link>
          <Icon name="ChevronRight" size={13} />
          <span className="text-foreground">{meta.short} г.р.</span>
        </nav>

        <section className="glow-pitch mt-4 rounded-[var(--radius)] p-6 sm:p-8">
          <p className="eyebrow">{SEASON}</p>
          <h1 className="mt-3 font-head text-[2rem] font-bold tracking-[-0.035em] sm:text-[2.6rem]">
            {meta.label}
          </h1>
          <p className="mt-3 max-w-xl text-[0.92rem] text-muted-foreground">
            Турнирная таблица, результаты, ближайшие игры, бомбардиры и команды группы {meta.short} г.р. —
            первенство детско-юношеских команд по футболу Северного округа Москвы.
          </p>
        </section>

        {/* Турнирная таблица */}
        <section className="mt-10">
          <h2 className="mb-4 font-head text-[1.5rem] font-bold tracking-[-0.03em]">Турнирная таблица</h2>

          <ul className="flex flex-col gap-2 lg:hidden">
            {rows.map((r) => (
              <li key={r.team} className="rounded-[var(--radius)] bg-card p-4">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'tabnum grid h-7 w-7 shrink-0 place-items-center rounded-md text-[0.85rem] text-muted-foreground',
                      r.pos <= 3 && 'bg-accent/15 font-bold text-accent',
                    )}
                  >
                    {r.pos}
                  </span>
                  <Link
                    to={`/team/${teamSlug(r.team, groupId)}`}
                    className={cn('min-w-0 flex-1 truncate text-[1rem]', r.pos === 1 ? 'font-bold' : 'font-semibold')}
                  >
                    {r.team}
                  </Link>
                  <span className="tabnum shrink-0 font-head text-[1.35rem] font-bold leading-none">
                    {r.points}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.82rem] text-muted-foreground">
                  <span>
                    <b className="font-semibold text-foreground">{r.played}</b> игр
                  </span>
                  <span>
                    <b className="font-semibold text-win">{r.win}</b> в ·{' '}
                    <b className="font-semibold text-foreground">{r.draw}</b> н ·{' '}
                    <b className="font-semibold text-accent">{r.loss}</b> п
                  </span>
                  <span className="tabnum">
                    {r.scored}–{r.missed}
                  </span>
                  <span className="tabnum">
                    {goalDiff(r) > 0 ? '+' : ''}
                    {goalDiff(r)}
                  </span>
                </div>
              </li>
            ))}
            {!rows.length && (
              <li className="rounded-[var(--radius)] bg-card px-4 py-8 text-center text-[0.9rem] text-muted-foreground">
                Матчей пока не сыграно
              </li>
            )}
          </ul>

          <div className="hidden overflow-x-auto rounded-[var(--radius)] bg-card lg:block">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-3.5 text-left font-semibold">#</th>
                  <th className="px-2 py-3.5 text-left font-semibold">Команда</th>
                  <th className="px-2 py-3.5 text-right font-semibold">И</th>
                  <th className="px-2 py-3.5 text-right font-semibold">В</th>
                  <th className="px-2 py-3.5 text-right font-semibold">Н</th>
                  <th className="px-2 py-3.5 text-right font-semibold">П</th>
                  <th className="px-2 py-3.5 text-right font-semibold">Мячи</th>
                  <th className="px-2 py-3.5 text-right font-semibold">Р</th>
                  <th className="px-2 py-3.5 text-right font-semibold">О</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Форма</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.team} className="border-t border-border text-[0.92rem] transition-colors hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'tabnum inline-grid h-6 w-6 place-items-center rounded-md text-muted-foreground',
                          r.pos <= 3 && 'bg-accent/15 font-bold text-accent',
                        )}
                      >
                        {r.pos}
                      </span>
                    </td>
                    <td className={cn('px-2 py-3 font-medium', r.pos === 1 && 'font-bold')}>
                      <Link to={`/team/${teamSlug(r.team, groupId)}`} className="story-link hover:text-foreground">
                        {r.team}
                      </Link>
                    </td>
                    <td className="tabnum px-2 py-3 text-right text-muted-foreground">{r.played}</td>
                    <td className="tabnum px-2 py-3 text-right text-muted-foreground">{r.win}</td>
                    <td className="tabnum px-2 py-3 text-right text-muted-foreground">{r.draw}</td>
                    <td className="tabnum px-2 py-3 text-right text-muted-foreground">{r.loss}</td>
                    <td className="tabnum px-2 py-3 text-right text-muted-foreground">
                      {r.scored}–{r.missed}
                    </td>
                    <td className="tabnum px-2 py-3 text-right text-muted-foreground">
                      {goalDiff(r) > 0 ? '+' : ''}
                      {goalDiff(r)}
                    </td>
                    <td className="tabnum px-2 py-3 text-right font-head font-bold">{r.points}</td>
                    <td className="px-4 py-3">
                      <span className="flex justify-end gap-1">
                        {r.form.map((f, i) => (
                          <span
                            key={i}
                            className={cn('grid h-5 w-5 place-items-center rounded text-[0.62rem] font-bold', FORM_STYLE[f])}
                          >
                            {f === 'W' ? 'В' : f === 'D' ? 'Н' : 'П'}
                          </span>
                        ))}
                      </span>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-[0.9rem] text-muted-foreground">
                      Матчей пока не сыграно
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Последние результаты */}
        <section className="mt-10">
          <h2 className="mb-4 font-head text-[1.5rem] font-bold tracking-[-0.03em]">Последние результаты</h2>
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {groupResults.map((m) => {
              const homeWin = (m.homeGoals ?? 0) > (m.awayGoals ?? 0);
              const awayWin = (m.awayGoals ?? 0) > (m.homeGoals ?? 0);
              return (
                <div key={m.id} className="flex flex-col rounded-[var(--radius)] bg-card p-4">
                  <p className="eyebrow mb-3">
                    {m.round} тур · {m.date}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-[0.92rem]', homeWin ? 'font-semibold' : 'text-muted-foreground')}>
                      {m.home}
                    </span>
                    <span className={cn('font-head text-[1.3rem] font-bold tabnum', !homeWin && 'text-muted-foreground')}>
                      {m.homeGoals}
                    </span>
                  </div>
                  <div className="my-2.5 h-px bg-border" />
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-[0.92rem]', awayWin ? 'font-semibold' : 'text-muted-foreground')}>
                      {m.away}
                    </span>
                    <span className={cn('font-head text-[1.3rem] font-bold tabnum', !awayWin && 'text-muted-foreground')}>
                      {m.awayGoals}
                    </span>
                  </div>
                </div>
              );
            })}
            {!groupResults.length && (
              <p className="col-span-full py-8 text-center text-[0.9rem] text-muted-foreground">
                Результатов пока нет
              </p>
            )}
          </div>
        </section>

        {/* Следующие игры */}
        <section className="mt-10">
          <h2 className="mb-4 font-head text-[1.5rem] font-bold tracking-[-0.03em]">Следующие игры</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] bg-card">
            {groupSchedule.map((m) => (
              <li key={m.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[150px_1fr_auto] sm:items-center">
                <span className="flex items-center gap-2 text-[0.85rem] text-muted-foreground">
                  <Icon name="Calendar" size={14} />
                  {m.date}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex-1 text-right font-medium">{m.home}</span>
                  <span className="tabnum rounded-md bg-secondary px-2.5 py-1 font-head text-[0.8rem] font-bold">
                    {m.time}
                  </span>
                  <span className="flex-1 font-medium">{m.away}</span>
                </div>
                <span className="flex items-center gap-1.5 text-[0.8rem] text-muted-foreground sm:justify-end">
                  <Icon name="MapPin" size={14} />
                  {m.venue}
                </span>
              </li>
            ))}
            {!groupSchedule.length && (
              <li className="px-5 py-8 text-center text-[0.9rem] text-muted-foreground">
                Матчи ещё не назначены
              </li>
            )}
          </ul>
        </section>

        {/* Бомбардиры */}
        <section className="mt-10">
          <h2 className="mb-4 font-head text-[1.5rem] font-bold tracking-[-0.03em]">Бомбардиры</h2>
          <div className="overflow-x-auto rounded-[var(--radius)] bg-card">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-3.5 text-left font-semibold">#</th>
                  <th className="px-2 py-3.5 text-left font-semibold">Игрок</th>
                  <th className="px-2 py-3.5 text-left font-semibold">Команда</th>
                  <th className="px-2 py-3.5 text-right font-semibold">Голы</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Пас</th>
                </tr>
              </thead>
              <tbody>
                {groupPlayers.map((p, i) => (
                  <tr key={`${p.name}|${p.team}`} className="border-t border-border text-[0.9rem]">
                    <td className="tabnum px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-2 py-3 font-medium">{p.name}</td>
                    <td className="px-2 py-3 text-muted-foreground">{p.team}</td>
                    <td className="tabnum px-2 py-3 text-right font-head font-bold">{p.goals}</td>
                    <td className="tabnum px-4 py-3 text-right text-muted-foreground">{p.assists}</td>
                  </tr>
                ))}
                {!groupPlayers.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[0.9rem] text-muted-foreground">
                      Статистики пока нет
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Команды */}
        <section className="mt-10">
          <h2 className="mb-4 font-head text-[1.5rem] font-bold tracking-[-0.03em]">Команды</h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {groupTeams.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/team/${teamSlug(t.name, t.age_group)}`}
                  className="flex items-center gap-3 rounded-[var(--radius)] bg-card px-4 py-3 transition-colors hover:bg-secondary/70"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-[0.78rem] font-bold text-muted-foreground">
                    {t.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.92rem] font-semibold">{t.name}</span>
                    <span className="block truncate text-[0.76rem] text-muted-foreground">
                      {squadCount(t.name)} игроков в составе
                    </span>
                  </span>
                  <Icon name="ChevronRight" size={16} className="shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
            {!groupTeams.length && (
              <li className="rounded-[var(--radius)] bg-card px-4 py-8 text-center text-[0.9rem] text-muted-foreground sm:col-span-2 lg:col-span-3">
                Команды пока не заявлены
              </li>
            )}
          </ul>
        </section>

        <p className="mt-10 border-t border-border pt-6 text-[0.78rem] text-muted-foreground">
          © 2025—2026 Первенство САО по футболу · ГБУ «Мосгорспорт»
        </p>
      </div>
    </div>
  );
};

export default AgeGroupPage;
