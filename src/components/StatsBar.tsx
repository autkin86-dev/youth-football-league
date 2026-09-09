import { useLeague } from '@/context/LeagueContext';

const StatsBar = () => {
  const { teams, squad, results } = useLeague();

  const totalGoals = results.reduce((s, m) => s + (m.homeGoals ?? 0) + (m.awayGoals ?? 0), 0);

  const stats = [
    { label: 'Команды', value: teams.length },
    { label: 'Игроки', value: squad.length },
    { label: 'Матчи', value: results.length },
    { label: 'Голы', value: totalGoals },
  ];

  return (
    <section className="grid grid-cols-4 gap-2.5 py-2 sm:gap-3 lg:gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center justify-center gap-0.5 rounded-[var(--radius)] bg-card py-4 text-center lg:py-6"
        >
          <span className="tabnum font-head text-[1.5rem] font-bold sm:text-[1.7rem] lg:text-[2.1rem]">{s.value}</span>
          <span className="text-[0.7rem] text-muted-foreground sm:text-[0.78rem] lg:text-[0.86rem]">{s.label}</span>
        </div>
      ))}
    </section>
  );
};

export default StatsBar;