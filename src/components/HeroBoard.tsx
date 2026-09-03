import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { NEXT_MATCH, RESULTS, STANDINGS, goalDiff, type Match } from '@/data/league';

interface Props {
  onOpenProtocol: (m: Match) => void;
}

const HeroBoard = ({ onOpenProtocol }: Props) => {
  const round6 = RESULTS.filter((m) => m.round === 6);
  const table = STANDINGS['2013'];

  return (
    <section className="grid gap-[18px] py-[18px] lg:grid-cols-[1fr_1fr_352px] lg:grid-rows-[minmax(320px,1fr)_214px]">
      {/* Ближайший матч */}
      <article className="glow-pitch animate-rise relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-[var(--radius)] px-6 py-12 text-center lg:col-span-2">
        <p className="eyebrow relative z-10">Ближайший матч · {NEXT_MATCH.round} тур</p>
        <h1 className="relative z-10 mt-4 font-head text-[2rem] font-bold leading-[1.06] tracking-[-0.035em] sm:text-[2.6rem] lg:text-[2.9rem]">
          {NEXT_MATCH.home} <span className="font-medium text-muted-foreground">—</span> {NEXT_MATCH.away}
        </h1>
        <p className="relative z-10 mt-3.5 text-[0.98rem] text-muted-foreground">
          <b className="font-semibold text-foreground">
            {NEXT_MATCH.date}, {NEXT_MATCH.time}
          </b>{' '}
          · {NEXT_MATCH.venue}
        </p>
        <span
          className="ball-glow animate-float pointer-events-none absolute bottom-[-140px] left-1/2 z-0 h-[250px] w-[250px] -translate-x-1/2 rounded-full opacity-90 blur-[0.4px]"
          aria-hidden="true"
        />
      </article>

      {/* Турнирная таблица (сайдбар) */}
      <aside className="order-last flex flex-col rounded-[var(--radius)] bg-card px-5 pb-4 pt-[18px] lg:order-none lg:col-start-3 lg:row-span-2 lg:row-start-1">
        <div className="grid grid-cols-[20px_1fr_26px_30px_34px] items-center gap-1.5 pb-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <span>#</span>
          <span>Команда</span>
          <span className="text-right">И</span>
          <span className="text-right">Р</span>
          <span className="text-right">О</span>
        </div>
        {table.map((r) => (
          <div
            key={r.team}
            className="grid flex-1 grid-cols-[20px_1fr_26px_30px_34px] items-center gap-1.5 border-t border-border py-2 text-[0.94rem] transition-colors hover:bg-secondary/40"
          >
            <span className={cn('tabnum text-muted-foreground', r.pos === 1 && 'font-bold text-accent')}>
              {r.pos}
            </span>
            <span className={cn('truncate font-medium', r.pos === 1 && 'font-bold')}>{r.team}</span>
            <span className="tabnum text-right text-muted-foreground">{r.played}</span>
            <span className="tabnum text-right text-muted-foreground">
              {goalDiff(r) > 0 ? '+' : ''}
              {goalDiff(r)}
            </span>
            <span className="tabnum text-right font-head font-bold">{r.points}</span>
          </div>
        ))}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-3.5 text-[0.82rem] text-muted-foreground">
          <span>Бомбардир тура</span>
          <span>
            <b className="font-semibold text-foreground">Орлов</b> · 3 мяча
          </span>
        </div>
      </aside>

      {/* Результаты тура */}
      <section className="flex flex-col lg:col-span-2">
        <div className="flex items-baseline justify-between px-0.5 pb-3">
          <span className="eyebrow">Результаты 6 тура</span>
          <span className="text-[0.82rem] text-muted-foreground">31 августа</span>
        </div>
        <div className="grid flex-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {round6.map((m) => {
            const homeWin = (m.homeGoals ?? 0) > (m.awayGoals ?? 0);
            const awayWin = (m.awayGoals ?? 0) > (m.homeGoals ?? 0);
            const scorers = (m.goals ?? []).map((g) => g.player.split(' ')[0]);
            return (
              <button
                key={m.id}
                onClick={() => onOpenProtocol(m)}
                className="flex flex-col justify-between rounded-[var(--radius)] bg-card p-4 pb-3.5 text-left transition-all hover:bg-secondary/70 hover:ring-1 hover:ring-border"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-[0.92rem]', homeWin ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground')}>
                      {m.home}
                    </span>
                    <span className={cn('font-head text-[1.34rem] font-bold tracking-[-0.02em]', homeWin ? 'text-foreground' : 'text-muted-foreground')}>
                      {m.homeGoals}
                    </span>
                  </div>
                  <div className="my-2.5 h-px bg-border" />
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-[0.92rem]', awayWin ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground')}>
                      {m.away}
                    </span>
                    <span className={cn('font-head text-[1.34rem] font-bold tracking-[-0.02em]', awayWin ? 'text-foreground' : 'text-muted-foreground')}>
                      {m.awayGoals}
                    </span>
                  </div>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[0.74rem] tracking-[0.04em] text-muted-foreground">
                  <Icon name="FileText" size={12} />
                  <span className="truncate">{scorers.join(', ') || 'без голов'}</span>
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </section>
  );
};

export default HeroBoard;