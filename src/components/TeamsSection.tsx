import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { teamSlug } from '@/pages/Team';
import { cn } from '@/lib/utils';
import { AGE_GROUPS, type AgeGroup } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';

const TeamsSection = () => {
  const { squad: allSquad, teams: apiTeams } = useLeague();

  const groupsWithTeams = useMemo(
    () => AGE_GROUPS.filter((g) => apiTeams.some((t) => t.age_group === g.id)),
    [apiTeams],
  );

  const [group, setGroup] = useState<AgeGroup | ''>('');
  useEffect(() => {
    if (groupsWithTeams.length && !groupsWithTeams.some((g) => g.id === group)) {
      setGroup(groupsWithTeams[0].id);
    }
  }, [groupsWithTeams, group]);

  const teams = useMemo(
    () => apiTeams.filter((t) => t.age_group === group),
    [apiTeams, group],
  );

  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    if (teams.length && !teams.some((t) => t.id === active)) setActive(teams[0].id);
  }, [teams, active]);

  const team = teams.find((t) => t.id === active) ?? teams[0];
  const squad = team
    ? allSquad.filter((p) => p.team === team.name && p.age_group === team.age_group)
    : [];

  if (!groupsWithTeams.length) return null;

  return (
    <section id="komandy" className="scroll-mt-24 py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Раздел 04</p>
          <h2 className="mt-2 font-head text-[1.7rem] font-bold tracking-[-0.03em] sm:text-[2.1rem]">
            Команды и составы
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {groupsWithTeams.map((g) => (
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
      </div>

      {!team ? (
        <p className="text-[0.9rem] text-muted-foreground">В этой группе пока нет команд</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  'flex shrink-0 items-center gap-3 rounded-[var(--radius)] px-4 py-3 text-left transition-colors lg:w-full',
                  active === t.id ? 'bg-card ring-1 ring-accent/40' : 'bg-card/50 hover:bg-card',
                )}
              >
                <span
                  className={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[0.75rem] font-bold',
                    active === t.id ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {t.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.92rem] font-semibold">{t.name}</span>
                  <span className="block truncate text-[0.76rem] text-muted-foreground">
                    р-н {t.district || '—'}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="animate-fade-in rounded-[var(--radius)] bg-card p-5" key={team.id}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="font-head text-[1.35rem] font-bold tracking-[-0.02em]">{team.name}</h3>
                <p className="mt-1 text-[0.85rem] text-muted-foreground">
                  {team.coach ? `Тренер: ${team.coach}` : 'Тренер пока не назначен'}
                  {team.founded ? ` · основана в ${team.founded}` : ''}
                </p>
              </div>
              <div className="flex flex-col gap-1 text-[0.8rem] text-muted-foreground sm:items-end">
                {team.home && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="MapPin" size={13} /> {team.home}
                  </span>
                )}
                {team.color && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="Shirt" size={13} /> {team.color}
                  </span>
                )}
                <Link
                  to={`/team/${teamSlug(team.name, team.age_group)}`}
                  className="mt-1 flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[0.78rem] font-semibold text-foreground transition-colors hover:bg-secondary/70"
                >
                  Страница команды
                  <Icon name="ArrowRight" size={13} />
                </Link>
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
                    <tr key={p.id} className="border-t border-border text-[0.9rem]">
                      <td className="tabnum py-2.5 text-muted-foreground">{p.number}</td>
                      <td className="py-2.5 font-medium">{p.name}</td>
                      <td className="py-2.5 text-muted-foreground">{p.position}</td>
                      <td className="tabnum py-2.5 text-right text-muted-foreground">{p.games}</td>
                      <td className="tabnum py-2.5 text-right font-head font-bold">{p.goals}</td>
                      <td className="tabnum py-2.5 text-right text-muted-foreground">{p.assists}</td>
                    </tr>
                  ))}
                  {!squad.length && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[0.85rem] text-muted-foreground">
                        Состав пока не заполнен
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TeamsSection;
