import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { AGE_GROUPS, type AgeGroup } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';

const ScheduleSection = () => {
  const { schedule } = useLeague();

  const groupsWithMatches = useMemo(
    () => AGE_GROUPS.filter((g) => schedule.some((m) => m.group === g.id)),
    [schedule],
  );
  const [group, setGroup] = useState<AgeGroup | ''>('');
  useEffect(() => {
    if (groupsWithMatches.length && !groupsWithMatches.some((g) => g.id === group)) {
      setGroup(groupsWithMatches[0].id);
    }
  }, [groupsWithMatches, group]);

  const groupSchedule = useMemo(
    () => schedule.filter((m) => m.group === group),
    [schedule, group],
  );
  const rounds = useMemo(
    () => Array.from(new Set(groupSchedule.map((m) => m.round))).sort((a, b) => a - b),
    [groupSchedule],
  );
  const [round, setRound] = useState<number | null>(null);
  useEffect(() => {
    if (rounds.length && !rounds.includes(round ?? -1)) setRound(rounds[0]);
  }, [rounds, round]);
  const matches = groupSchedule.filter((m) => m.round === (round ?? rounds[0]));

  return (
    <section id="raspisanie" className="scroll-mt-24 py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Раздел 02</p>
          <h2 className="mt-2 font-head text-[1.7rem] font-bold tracking-[-0.03em] sm:text-[2.1rem]">
            Расписание матчей
          </h2>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {groupsWithMatches.map((g) => (
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
        {!matches.length && (
          <li className="px-5 py-8 text-center text-[0.9rem] text-muted-foreground">
            Матчей пока нет
          </li>
        )}
      </ul>
    </section>
  );
};

export default ScheduleSection;
