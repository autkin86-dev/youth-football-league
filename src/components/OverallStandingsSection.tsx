import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { teamSlug } from '@/pages/Team';
import { cn } from '@/lib/utils';
import { AGE_GROUPS } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';

const OVERALL_GROUPS = ['2011-2012', '2013-2014', '2015-2016', '2017-2018'];

const OverallStandingsSection = () => {
  const { overall, teams } = useLeague();

  if (!overall.length) return null;

  const groupOf = (team: string) =>
    teams.find((t) => t.name === team && OVERALL_GROUPS.includes(t.age_group))?.age_group;

  return (
    <section className="py-14">
      <div className="mb-6">
        <p className="eyebrow">Общий зачёт</p>
        <h2 className="mt-2 font-head text-[1.7rem] font-bold tracking-[-0.03em] sm:text-[2.1rem]">
          Общекомандная таблица
        </h2>
        <p className="mt-2 text-[0.9rem] text-muted-foreground">
          Сумма очков команды во всех возрастных группах: {AGE_GROUPS
            .filter((g) => OVERALL_GROUPS.includes(g.id))
            .map((g) => g.short)
            .join(', ')}
        </p>
      </div>

      <ul className="flex flex-col gap-2 lg:hidden">
        {overall.map((r) => {
          const grp = groupOf(r.team);
          return (
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
                {grp ? (
                  <Link
                    to={`/team/${teamSlug(r.team, grp)}`}
                    className={cn('min-w-0 flex-1 truncate text-[1rem]', r.pos === 1 ? 'font-bold' : 'font-semibold')}
                  >
                    {r.team}
                  </Link>
                ) : (
                  <span className="min-w-0 flex-1 truncate text-[1rem] font-semibold">{r.team}</span>
                )}
                <span className="tabnum shrink-0 font-head text-[1.35rem] font-bold leading-none">
                  {r.points}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-3 text-center">
                {OVERALL_GROUPS.map((g) => (
                  <div key={g}>
                    <p className="tabnum font-head text-[1.05rem] font-bold">{r.by_group[g] ?? '—'}</p>
                    <p className="mt-0.5 text-[0.66rem] leading-tight text-muted-foreground">
                      {AGE_GROUPS.find((ag) => ag.id === g)?.short ?? g}
                    </p>
                  </div>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-x-auto rounded-[var(--radius)] bg-card lg:block">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3.5 text-left font-semibold">#</th>
              <th className="px-2 py-3.5 text-left font-semibold">Команда</th>
              {OVERALL_GROUPS.map((g) => (
                <th key={g} className="px-2 py-3.5 text-right font-semibold">
                  {AGE_GROUPS.find((ag) => ag.id === g)?.short ?? g}
                </th>
              ))}
              <th className="px-4 py-3.5 text-right font-semibold">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {overall.map((r) => {
              const grp = groupOf(r.team);
              const nameEl = grp ? (
                <Link to={`/team/${teamSlug(r.team, grp)}`} className="story-link hover:text-foreground">
                  {r.team}
                </Link>
              ) : (
                r.team
              );
              return (
                <tr
                  key={r.team}
                  className="border-t border-border text-[0.92rem] transition-colors hover:bg-secondary/40"
                >
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
                  <td className={cn('px-2 py-3 font-medium', r.pos === 1 && 'font-bold')}>{nameEl}</td>
                  {OVERALL_GROUPS.map((g) => (
                    <td key={g} className="tabnum px-2 py-3 text-right text-muted-foreground">
                      {r.by_group[g] ?? '—'}
                    </td>
                  ))}
                  <td className="tabnum px-4 py-3 text-right font-head font-bold">{r.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 flex items-center gap-2 text-[0.8rem] text-muted-foreground">
        <Icon name="Info" size={14} />
        В общий зачёт входят очки за 4 возрастные группы, группа 2012–2013 (11×11) считается отдельно.
      </p>
    </section>
  );
};

export default OverallStandingsSection;