import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { AGE_GROUPS, SEASON, TEAMS, goalDiff } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
};

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[«»"']/g, '')
    .split('')
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const teamSlug = (name: string, ageGroup?: string) =>
  ageGroup ? `${slugify(name)}-${slugify(ageGroup)}` : slugify(name);

const FORM_STYLE = {
  W: 'bg-win/15 text-win',
  D: 'bg-secondary text-muted-foreground',
  L: 'bg-accent/15 text-accent',
} as const;

const Team = () => {
  const { slug = '' } = useParams();
  const { teams: apiTeams, squad, matches, standings, loading } = useLeague();

  const teams = apiTeams.length
    ? apiTeams.map((t) => ({ ...t, group: t.age_group }))
    : TEAMS.map((t, i) => ({ ...t, id: i, age_group: t.group }));

  const team = teams.find((t) => teamSlug(t.name, t.age_group) === slug);

  const players = useMemo(
    () =>
      team
        ? squad
            .filter((p) => p.team === team.name && p.age_group === team.age_group)
            .sort((a, b) => a.number - b.number)
        : [],
    [squad, team],
  );

  const teamMatches = useMemo(
    () =>
      team
        ? matches
            .filter(
              (m) =>
                (m.home === team.name || m.away === team.name) && m.group === team.age_group,
            )
            .sort((a, b) => a.round - b.round)
        : [],
    [matches, team],
  );

  const row = team
    ? (standings[team.age_group] ?? []).find((r) => r.team === team.name)
    : undefined;

  if (!team) {
    return (
      <div className="screen-vignette grid min-h-screen place-items-center px-5 text-center">
        <div>
          <h1 className="font-head text-[1.6rem] font-bold">
            {loading ? 'Загружаю команду…' : 'Команда не найдена'}
          </h1>
          <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <Icon name="ArrowLeft" size={15} />
            На главную
          </Link>
        </div>
      </div>
    );
  }

  const played = teamMatches.filter((m) => m.protocol);
  const upcoming = teamMatches.filter((m) => !m.protocol);
  const teamGoals = players.reduce((s, p) => s + p.goals, 0);

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
            Все команды
          </Link>
        </header>

        <section className="glow-pitch mt-6 rounded-[var(--radius)] p-6 sm:p-8">
          <p className="eyebrow">
            {AGE_GROUPS.find((g) => g.id === team.age_group)?.label ?? team.age_group} · {SEASON}
          </p>
          <h1 className="mt-3 font-head text-[2rem] font-bold tracking-[-0.035em] sm:text-[2.6rem]">
            {team.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.88rem] text-muted-foreground">
            {team.coach && (
              <span className="flex items-center gap-1.5">
                <Icon name="User" size={14} /> Тренер: {team.coach}
              </span>
            )}
            {team.district && (
              <span className="flex items-center gap-1.5">
                <Icon name="Map" size={14} /> р-н {team.district}
              </span>
            )}
            {team.home && (
              <span className="flex items-center gap-1.5">
                <Icon name="MapPin" size={14} /> {team.home}
              </span>
            )}
            {team.color && (
              <span className="flex items-center gap-1.5">
                <Icon name="Shirt" size={14} /> {team.color}
              </span>
            )}
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5">
          {[
            { label: 'Место в таблице', value: row ? `${row.pos}` : '—' },
            { label: 'Очки', value: row?.points ?? 0 },
            { label: 'И · В · Н · П', value: row ? `${row.played}·${row.win}·${row.draw}·${row.loss}` : '—' },
            { label: 'Мячи', value: row ? `${row.scored}–${row.missed}` : '—' },
            { label: 'Разница', value: row ? goalDiff(row) : '—' },
          ].map((s) => (
            <div key={s.label} className="rounded-[var(--radius)] bg-card p-4 sm:p-5">
              <p className="tabnum font-head text-[1.35rem] font-bold sm:text-[1.6rem]">{s.value}</p>
              <p className="mt-1 text-[0.76rem] text-muted-foreground sm:text-[0.8rem]">{s.label}</p>
            </div>
          ))}
        </section>

        {row?.form?.length ? (
          <div className="mt-3 flex items-center gap-2 rounded-[var(--radius)] bg-card px-5 py-4">
            <span className="eyebrow">Форма</span>
            <div className="flex gap-1.5">
              {row.form.map((f, i) => (
                <span
                  key={i}
                  className={cn(
                    'grid h-6 w-6 place-items-center rounded-md text-[0.7rem] font-bold',
                    FORM_STYLE[f],
                  )}
                >
                  {f === 'W' ? 'В' : f === 'D' ? 'Н' : 'П'}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <section className="mt-10">
          <h2 className="mb-4 font-head text-[1.5rem] font-bold tracking-[-0.03em]">
            Состав · {players.length} игроков
          </h2>
          <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-[var(--radius)] bg-card sm:hidden">
            {players.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <span className="tabnum grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-[0.8rem] font-bold">
                  {p.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.94rem] font-medium">{p.name}</span>
                  <span className="block text-[0.76rem] text-muted-foreground">
                    {p.position} · {p.games} игр · {p.yellow} жк / {p.red} кк
                  </span>
                </span>
                <span className="shrink-0 text-right text-[0.78rem] text-muted-foreground">
                  <b className="font-head text-[1.05rem] font-bold text-foreground">{p.goals}</b> гол
                  <br />
                  {p.assists} пас
                </span>
              </li>
            ))}
            {!players.length && (
              <li className="px-4 py-8 text-center text-[0.9rem] text-muted-foreground">
                Состав пока не заполнен
              </li>
            )}
          </ul>

          <div className="hidden overflow-x-auto rounded-[var(--radius)] bg-card sm:block">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-5 py-3.5 text-left font-semibold">№</th>
                  <th className="px-2 py-3.5 text-left font-semibold">Игрок</th>
                  <th className="px-2 py-3.5 text-left font-semibold">Амплуа</th>
                  <th className="px-2 py-3.5 text-right font-semibold">И</th>
                  <th className="px-2 py-3.5 text-right font-semibold">Голы</th>
                  <th className="px-2 py-3.5 text-right font-semibold">Пас</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Ж / К</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id} className="border-t border-border text-[0.9rem]">
                    <td className="tabnum px-5 py-3 text-muted-foreground">{p.number}</td>
                    <td className="px-2 py-3 font-medium">{p.name}</td>
                    <td className="px-2 py-3 text-muted-foreground">{p.position}</td>
                    <td className="tabnum px-2 py-3 text-right text-muted-foreground">{p.games}</td>
                    <td className="tabnum px-2 py-3 text-right font-head font-bold">{p.goals}</td>
                    <td className="tabnum px-2 py-3 text-right text-muted-foreground">{p.assists}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="rounded-[3px] bg-yellow-400/20 px-1.5 text-[0.75rem] font-semibold text-yellow-400">
                          {p.yellow}
                        </span>
                        <span className="rounded-[3px] bg-accent/20 px-1.5 text-[0.75rem] font-semibold text-accent">
                          {p.red}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
                {!players.length && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-[0.9rem] text-muted-foreground">
                      Состав пока не заполнен
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[0.82rem] text-muted-foreground">
            Всего забито игроками команды: {teamGoals}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-head text-[1.5rem] font-bold tracking-[-0.03em]">
            Результаты · {played.length}
          </h2>
          <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] bg-card">
            {played.map((m) => {
              const isHome = m.home === team.name;
              const own = isHome ? m.homeGoals ?? 0 : m.awayGoals ?? 0;
              const opp = isHome ? m.awayGoals ?? 0 : m.homeGoals ?? 0;
              const res = own > opp ? 'W' : own < opp ? 'L' : 'D';
              return (
                <li key={m.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[130px_1fr_auto] sm:items-center">
                  <span className="text-[0.82rem] text-muted-foreground">
                    {m.round} тур · {m.date}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={cn('flex-1 text-right', isHome ? 'font-semibold' : 'text-muted-foreground')}>
                      {m.home}
                    </span>
                    <span className="tabnum rounded-md bg-secondary px-2.5 py-1 font-head text-[0.95rem] font-bold">
                      {m.homeGoals} : {m.awayGoals}
                    </span>
                    <span className={cn('flex-1', !isHome ? 'font-semibold' : 'text-muted-foreground')}>
                      {m.away}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'justify-self-start rounded-full px-3 py-1 text-[0.75rem] font-bold sm:justify-self-end',
                      FORM_STYLE[res],
                    )}
                  >
                    {res === 'W' ? 'Победа' : res === 'D' ? 'Ничья' : 'Поражение'}
                  </span>
                </li>
              );
            })}
            {!played.length && (
              <li className="px-5 py-8 text-center text-[0.9rem] text-muted-foreground">
                Сыгранных матчей пока нет
              </li>
            )}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-head text-[1.5rem] font-bold tracking-[-0.03em]">
            Ближайшие матчи · {upcoming.length}
          </h2>
          <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] bg-card">
            {upcoming.map((m) => (
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
            {!upcoming.length && (
              <li className="px-5 py-8 text-center text-[0.9rem] text-muted-foreground">
                Матчи ещё не назначены
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

export default Team;