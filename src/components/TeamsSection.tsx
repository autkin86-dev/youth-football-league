import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { SQUADS, TEAMS } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';

const TeamsSection = () => {
  const { squad: allSquad, teams: apiTeams } = useLeague();
  const teams = useMemo(
    () =>
      apiTeams.length
        ? apiTeams.map((t) => ({
            name: t.name,
            district: t.district,
            coach: t.coach,
            founded: t.founded,
            home: t.home,
            color: t.color,
          }))
        : TEAMS,
    [apiTeams],
  );

  const [active, setActive] = useState(teams[0]?.name ?? '');
  useEffect(() => {
    if (teams.length && !teams.some((t) => t.name === active)) setActive(teams[0].name);
  }, [teams, active]);

  const team = teams.find((t) => t.name === active) ?? teams[0];
  const live = allSquad.filter((p) => p.team === active);
  const squad = live.length ? live : (SQUADS[active] ?? []);

  if (!team) return null;

  return (
    <section id="komandy" className="scroll-mt-24 py-14">
      <div className="mb-6">
        <p className="eyebrow">Раздел 04</p>
        <h2 className="mt-2 font-head text-[1.7rem] font-bold tracking-[-0.03em] sm:text-[2.1rem]">
          Команды и составы
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {teams.map((t) => (
            <button
              key={t.name}
              onClick={() => setActive(t.name)}
              className={cn(
                'flex shrink-0 items-center gap-3 rounded-[var(--radius)] px-4 py-3 text-left transition-colors lg:w-full',
                active === t.name ? 'bg-card ring-1 ring-accent/40' : 'bg-card/50 hover:bg-card',
              )}
            >
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[0.75rem] font-bold',
                  active === t.name ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground',
                )}
              >
                {t.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[0.92rem] font-semibold">{t.name}</span>
                <span className="block truncate text-[0.76rem] text-muted-foreground">
                  р-н {t.district}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="animate-fade-in rounded-[var(--radius)] bg-card p-5" key={active}>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="font-head text-[1.35rem] font-bold tracking-[-0.02em]">{team.name}</h3>
              <p className="mt-1 text-[0.85rem] text-muted-foreground">
                Тренер: {team.coach} · основана в {team.founded}
              </p>
            </div>
            <div className="flex flex-col gap-1 text-[0.8rem] text-muted-foreground sm:text-right">
              <span className="flex items-center gap-1.5 sm:justify-end">
                <Icon name="MapPin" size={13} /> {team.home}
              </span>
              <span className="flex items-center gap-1.5 sm:justify-end">
                <Icon name="Shirt" size={13} /> {team.color}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="mt-2 w-full min-w-[520px]">
              <thead>
                <tr className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="py-3 text-left font-semibold">№</th>
                  <th className="py-3 text-left font-semibold">Игрок</th>
                  <th className="py-3 text-left font-semibold">Амплуа</th>
                  <th className="py-3 text-right font-semibold">И</th>
                  <th className="py-3 text-right font-semibold">Голы</th>
                  <th className="py-3 text-right font-semibold">Пас</th>
                </tr>
              </thead>
              <tbody>
                {squad.map((p) => (
                  <tr key={p.name} className="border-t border-border text-[0.9rem]">
                    <td className="tabnum py-2.5 text-muted-foreground">{p.number}</td>
                    <td className="py-2.5 font-medium">{p.name}</td>
                    <td className="py-2.5 text-muted-foreground">{p.position}</td>
                    <td className="tabnum py-2.5 text-right text-muted-foreground">{p.games}</td>
                    <td className="tabnum py-2.5 text-right font-head font-bold">{p.goals}</td>
                    <td className="tabnum py-2.5 text-right text-muted-foreground">{p.assists}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamsSection;