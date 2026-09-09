import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { AGE_GROUPS } from '@/data/league';
import type { Match } from '@/data/league';

interface Props {
  match: Match;
  live?: boolean;
  onOpenProtocol: (m: Match) => void;
  onViewAll: () => void;
}

const initials = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const MatchStatusCard = ({ match, live, onOpenProtocol, onViewAll }: Props) => {
  const groupShort = AGE_GROUPS.find((g) => g.id === match.group)?.short ?? match.group;
  const hasScore = match.homeGoals !== undefined && match.awayGoals !== undefined;

  return (
    <article className="glow-pitch animate-rise relative overflow-hidden rounded-[var(--radius)] p-5 sm:p-6">
      <div className="relative z-10 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-secondary px-3 py-1 text-[0.76rem] font-semibold text-foreground">
          {match.round}-й тур
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-[0.76rem] font-semibold text-muted-foreground">
          {groupShort}
        </span>
        <span
          className={cn(
            'ml-auto flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.76rem] font-semibold',
            live ? 'bg-accent text-accent-foreground' : hasScore ? 'bg-win/20 text-win' : 'bg-secondary text-muted-foreground',
          )}
        >
          {live && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
          {live ? 'Идёт' : hasScore ? 'Завершён' : 'Скоро'}
        </span>
      </div>

      <div className="relative z-10 mt-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-[0.85rem] font-bold text-foreground sm:h-14 sm:w-14 sm:text-[1rem]">
            {initials(match.home)}
          </span>
          <span className="w-full truncate text-[0.86rem] font-semibold sm:text-[0.98rem]">{match.home}</span>
        </div>

        <div className="shrink-0 px-2 text-center">
          {hasScore ? (
            <p className="font-head tabnum text-[2rem] font-bold leading-none tracking-[-0.02em] sm:text-[2.6rem]">
              {match.homeGoals}:{match.awayGoals}
            </p>
          ) : (
            <p className="font-head text-[1.1rem] font-bold text-muted-foreground sm:text-[1.3rem]">{match.time}</p>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-[0.85rem] font-bold text-foreground sm:h-14 sm:w-14 sm:text-[1rem]">
            {initials(match.away)}
          </span>
          <span className="w-full truncate text-[0.86rem] font-semibold sm:text-[0.98rem]">{match.away}</span>
        </div>
      </div>

      <p className="relative z-10 mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[0.8rem] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Icon name="Calendar" size={13} />
          {match.date}
        </span>
        {match.venue && (
          <span className="flex items-center gap-1.5">
            <Icon name="MapPin" size={13} />
            {match.venue}
          </span>
        )}
      </p>

      <div className="relative z-10 mt-5 flex items-center gap-2.5">
        <button
          onClick={() => onOpenProtocol(match)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-secondary py-2.5 text-[0.84rem] font-semibold text-foreground transition-colors hover:bg-secondary/70"
        >
          <Icon name="ClipboardList" size={15} />
          Протокол
        </button>
        <button
          onClick={onViewAll}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border py-2.5 text-[0.84rem] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          Все матчи
          <Icon name="ArrowRight" size={15} />
        </button>
      </div>

      <span
        className="ball-glow animate-float pointer-events-none absolute bottom-[-140px] left-1/2 z-0 h-[220px] w-[220px] -translate-x-1/2 rounded-full opacity-70 blur-[0.4px]"
        aria-hidden="true"
      />
    </article>
  );
};

export default MatchStatusCard;