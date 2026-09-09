import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { teamSlug } from '@/pages/Team';
import { cn } from '@/lib/utils';
import { AGE_GROUPS, goalDiff, type AgeGroup, type TeamRow } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';
import StickyTable from '@/components/StickyTable';
import TeamBadge from '@/components/TeamBadge';

const FORM_STYLE = {
  W: 'bg-win/20 text-win',
  D: 'bg-secondary text-muted-foreground',
  L: 'bg-accent/15 text-accent',
} as const;

interface Props {
  fixedGroup?: AgeGroup;
}

const StandingsSection = ({ fixedGroup }: Props) => {
  const [group, setGroup] = useState<AgeGroup>(AGE_GROUPS[0].id);
  const activeGroup = fixedGroup ?? group;
  const { standings } = useLeague();
  const rows = standings[activeGroup] ?? [];

  return (
    <section id="tablo" className="scroll-mt-24 py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Раздел 01</p>
          <h2 className="mt-2 font-head text-[1.7rem] font-bold tracking-[-0.03em] sm:text-[2.1rem]">
            Турнирная таблица
          </h2>
        </div>
        {!fixedGroup && (
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((g) => (
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
        )}
      </div>

      <div className="lg:hidden">
        <StickyTable
          rows={rows}
          rowKey={(r) => r.team}
          stickyHeader="Команда"
          emptyText="Матчей пока не сыграно"
          renderSticky={(r) => (
            <div className="flex min-w-[168px] items-center gap-2">
              <span
                className={cn(
                  'tabnum grid h-5 w-5 shrink-0 place-items-center rounded text-[0.72rem] text-muted-foreground',
                  r.pos <= 3 && 'bg-accent/15 font-bold text-accent',
                )}
              >
                {r.pos}
              </span>
              <TeamBadge name={r.team} size={22} />
              <Link
                to={`/team/${teamSlug(r.team, activeGroup)}`}
                className={cn('min-w-0 flex-1 truncate text-[0.86rem]', r.pos === 1 ? 'font-bold' : 'font-semibold')}
              >
                {r.team}
              </Link>
            </div>
          )}
          columns={[
            { key: 'played', header: 'И', render: (r) => <span className="text-muted-foreground">{r.played}</span> },
            { key: 'win', header: 'В', render: (r) => <span className="text-win">{r.win}</span> },
            { key: 'draw', header: 'Н', render: (r) => <span className="text-muted-foreground">{r.draw}</span> },
            { key: 'loss', header: 'П', render: (r) => <span className="text-accent">{r.loss}</span> },
            {
              key: 'goals',
              header: 'Мячи',
              render: (r) => (
                <span className="text-muted-foreground">
                  {r.scored}–{r.missed}
                </span>
              ),
            },
            {
              key: 'diff',
              header: 'Р',
              render: (r) => (
                <span className="text-muted-foreground">
                  {goalDiff(r) > 0 ? '+' : ''}
                  {goalDiff(r)}
                </span>
              ),
            },
            { key: 'points', header: 'О', render: (r) => <span className="font-head font-bold text-foreground">{r.points}</span> },
            {
              key: 'form',
              header: 'Форма',
              render: (r) => (
                <span className="flex justify-end gap-1">
                  {r.form.map((f, i) => (
                    <span
                      key={i}
                      className={cn(
                        'grid h-5 w-5 place-items-center rounded text-[0.62rem] font-bold',
                        FORM_STYLE[f],
                      )}
                    >
                      {f === 'W' ? 'В' : f === 'D' ? 'Н' : 'П'}
                    </span>
                  ))}
                </span>
              ),
            },
          ]}
        />
      </div>

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
                <td className={cn('px-2 py-3 font-medium', r.pos === 1 && 'font-bold')}>
                  <Link to={`/team/${teamSlug(r.team, activeGroup)}`} className="story-link hover:text-foreground">
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
                        className={cn(
                          'grid h-5 w-5 place-items-center rounded text-[0.62rem] font-bold',
                          FORM_STYLE[f],
                        )}
                      >
                        {f === 'W' ? 'В' : f === 'D' ? 'Н' : 'П'}
                      </span>
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 flex items-center gap-2 text-[0.8rem] text-muted-foreground">
        <Icon name="Info" size={14} />
        Первые три команды выходят в финальный этап первенства САО.
      </p>
    </section>
  );
};

export default StandingsSection;