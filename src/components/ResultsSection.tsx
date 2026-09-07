import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { AGE_GROUPS, type AgeGroup, type Match } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';

interface Props {
  onOpenProtocol: (m: Match) => void;
}

const ResultsSection = ({ onOpenProtocol }: Props) => {
  const { results } = useLeague();

  const groupsWithResults = useMemo(
    () => AGE_GROUPS.filter((g) => results.some((m) => m.group === g.id)),
    [results],
  );
  const [group, setGroup] = useState<AgeGroup | ''>('');
  useEffect(() => {
    if (groupsWithResults.length && !groupsWithResults.some((g) => g.id === group)) {
      setGroup(groupsWithResults[0].id);
    }
  }, [groupsWithResults, group]);

  const groupResults = useMemo(
    () => results.filter((m) => m.group === group),
    [results, group],
  );
  const rounds = useMemo(
    () => Array.from(new Set(groupResults.map((m) => m.round))).sort((a, b) => b - a),
    [groupResults],
  );
  const [round, setRound] = useState<number | null>(null);
  useEffect(() => {
    if (rounds.length && !rounds.includes(round ?? -1)) setRound(rounds[0]);
  }, [rounds, round]);
  const matches = groupResults.filter((m) => m.round === (round ?? rounds[0]));

  return (
    <section id="rezultaty" className="scroll-mt-24 py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Раздел 03</p>
          <h2 className="mt-2 font-head text-[1.7rem] font-bold tracking-[-0.03em] sm:text-[2.1rem]">
            Результаты и протоколы
          </h2>
          <p className="mt-2 text-[0.9rem] text-muted-foreground">
            Нажмите на матч, чтобы открыть протокол: голы, минуты и карточки.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {groupsWithResults.map((g) => (
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

      <div className="mb-4 flex flex-wrap gap-2">
        {rounds.map((r) => (
          <button
            key={r}
            onClick={() => setRound(r)}
            className={cn(
              'rounded-full px-4 py-2 text-[0.85rem] font-semibold transition-colors',
              (round ?? rounds[0]) === r
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground',
            )}
          >
            {r} тур
          </button>
        ))}
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {matches.map((m) => {
          const homeWin = (m.homeGoals ?? 0) > (m.awayGoals ?? 0);
          const awayWin = (m.awayGoals ?? 0) > (m.homeGoals ?? 0);
          return (
            <button
              key={m.id}
              onClick={() => onOpenProtocol(m)}
              className="group flex flex-col rounded-[var(--radius)] bg-card p-4 text-left transition-all hover:bg-secondary/70 hover:ring-1 hover:ring-border"
            >
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
              <span className="mt-4 flex items-center gap-1.5 text-[0.76rem] text-muted-foreground transition-colors group-hover:text-foreground">
                <Icon name="ClipboardList" size={13} />
                Протокол матча
              </span>
            </button>
          );
        })}
        {!matches.length && (
          <p className="col-span-full py-8 text-center text-[0.9rem] text-muted-foreground">
            Результатов пока нет
          </p>
        )}
      </div>
    </section>
  );
};

export default ResultsSection;
