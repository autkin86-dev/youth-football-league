import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { AGE_GROUPS, goalDiff, type AgeGroup } from '@/data/league';
import { ageGroupSlug } from '@/lib/age-group-slug';
import { useLeague } from '@/context/LeagueContext';
import { teamSlug } from '@/pages/Team';

const StandingsPreview = () => {
  const { standings } = useLeague();
  const groupsWithRows = AGE_GROUPS.filter((g) => (standings[g.id] ?? []).length > 0);
  const [group, setGroup] = useState<AgeGroup>(groupsWithRows[0]?.id ?? AGE_GROUPS[0].id);
  const rows = (standings[group] ?? []).slice(0, 5);

  if (!groupsWithRows.length) return null;

  return (
    <section className="py-8">
      <p className="eyebrow">Турнирные таблицы</p>
      <h2 className="mt-2 font-head text-[1.4rem] font-bold tracking-[-0.02em] sm:text-[1.6rem]">
        Положение команд по возрастным группам
      </h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {groupsWithRows.map((g) => (
          <button
            key={g.id}
            onClick={() => setGroup(g.id)}
            className={cn(
              'rounded-full px-4 py-2 text-[0.85rem] font-semibold transition-colors',
              group === g.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground',
            )}
          >
            {g.short}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-[var(--radius)] bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5 sm:px-5">
          <span className="flex items-center gap-2 text-[0.94rem] font-bold">
            <Icon name="Trophy" size={15} className="text-accent" />
            Турнирная таблица
          </span>
          <Link
            to={`/${ageGroupSlug(group)}`}
            className="flex items-center gap-1 text-[0.8rem] font-semibold text-muted-foreground hover:text-foreground"
          >
            Вся таблица
            <Icon name="ArrowRight" size={13} />
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              <th className="px-4 py-2.5 text-left sm:px-5">#</th>
              <th className="px-2 py-2.5 text-left">Команда</th>
              <th className="px-2 py-2.5 text-right">И</th>
              <th className="px-2 py-2.5 text-right">Р</th>
              <th className="px-4 py-2.5 text-right sm:px-5">О</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.team} className="border-t border-border text-[0.88rem]">
                <td className="px-4 py-2.5 sm:px-5">
                  <span
                    className={cn(
                      'tabnum inline-grid h-6 w-6 place-items-center rounded-md text-muted-foreground',
                      r.pos <= 3 && 'bg-accent/15 font-bold text-accent',
                    )}
                  >
                    {r.pos}
                  </span>
                </td>
                <td className="px-2 py-2.5 font-medium">
                  <Link to={`/team/${teamSlug(r.team, group)}`} className="story-link hover:text-foreground">
                    {r.team}
                  </Link>
                </td>
                <td className="tabnum px-2 py-2.5 text-right text-muted-foreground">{r.played}</td>
                <td className="tabnum px-2 py-2.5 text-right text-muted-foreground">
                  {goalDiff(r) > 0 ? '+' : ''}
                  {goalDiff(r)}
                </td>
                <td className="tabnum px-4 py-2.5 text-right font-head font-bold sm:px-5">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default StandingsPreview;
