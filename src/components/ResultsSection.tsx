import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { type Match } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';

interface Props {
  onOpenProtocol: (m: Match) => void;
}

const ResultsSection = ({ onOpenProtocol }: Props) => {
  const { results } = useLeague();
  const rounds = useMemo(
    () => Array.from(new Set(results.map((m) => m.round))).sort((a, b) => b - a),
    [results],
  );
  const [round, setRound] = useState<number | null>(null);
  useEffect(() => {
    if (round === null && rounds.length) setRound(rounds[0]);
  }, [rounds, round]);
  const matches = results.filter((m) => m.round === (round ?? rounds[0]));

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
        <div className="flex gap-2">
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
      </div>
    </section>
  );
};

export default ResultsSection;