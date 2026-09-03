import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { SCHEDULE } from '@/data/league';

const ScheduleSection = () => {
  const rounds = useMemo(() => Array.from(new Set(SCHEDULE.map((m) => m.round))), []);
  const [round, setRound] = useState(rounds[0]);
  const matches = SCHEDULE.filter((m) => m.round === round);

  return (
    <section id="raspisanie" className="scroll-mt-24 py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Раздел 02</p>
          <h2 className="mt-2 font-head text-[1.7rem] font-bold tracking-[-0.03em] sm:text-[2.1rem]">
            Расписание матчей
          </h2>
        </div>
        <div className="flex gap-2">
          {rounds.map((r) => (
            <button
              key={r}
              onClick={() => setRound(r)}
              className={cn(
                'rounded-full px-4 py-2 text-[0.85rem] font-semibold transition-colors',
                round === r
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              {r} тур
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] bg-card">
        {matches.map((m) => (
          <li
            key={m.id}
            className="grid grid-cols-1 items-center gap-2 px-5 py-4 transition-colors hover:bg-secondary/40 sm:grid-cols-[150px_1fr_auto]"
          >
            <div className="flex items-center gap-2 text-[0.85rem] text-muted-foreground">
              <Icon name="Calendar" size={14} />
              <span>{m.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex-1 text-right font-medium">{m.home}</span>
              <span className="rounded-md bg-secondary px-2.5 py-1 font-head text-[0.8rem] font-bold tabnum">
                {m.time}
              </span>
              <span className="flex-1 font-medium">{m.away}</span>
            </div>
            <div className="flex items-center gap-2 text-[0.8rem] text-muted-foreground sm:justify-end">
              <Icon name="MapPin" size={14} />
              <span className="truncate">{m.venue}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ScheduleSection;
