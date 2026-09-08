import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { AGE_GROUPS, SEASON, type Match } from '@/data/league';
import { ageGroupFromSlug } from '@/lib/age-group-slug';
import { useSeo } from '@/hooks/use-seo';
import StandingsSection from '@/components/StandingsSection';
import ResultsSection from '@/components/ResultsSection';
import ScheduleSection from '@/components/ScheduleSection';
import PlayersSection from '@/components/PlayersSection';
import TeamsSection from '@/components/TeamsSection';
import MatchProtocolDialog from '@/components/MatchProtocolDialog';

const AgeGroupPage = () => {
  const { ageSlug = '' } = useParams();
  const [protocol, setProtocol] = useState<Match | null>(null);

  const group = ageGroupFromSlug(ageSlug);
  const meta = AGE_GROUPS.find((g) => g.id === group);

  useSeo({
    title: meta ? meta.label : 'Группа не найдена',
    description: meta
      ? `Первенство САО по футболу — возрастная группа ${meta.label}. Турнирная таблица, результаты, расписание, бомбардиры и составы команд.`
      : undefined,
    path: `/${ageSlug}`,
    noindex: !meta,
  });

  if (!group || !meta) {
    return (
      <div className="screen-vignette grid min-h-screen place-items-center px-5 text-center">
        <div>
          <h1 className="font-head text-[1.6rem] font-bold">Группа не найдена</h1>
          <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <Icon name="ArrowLeft" size={15} />
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-vignette min-h-screen">
      <div className="mx-auto w-full max-w-[1180px] px-5 pb-20 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-accent text-accent-foreground">
              <Icon name="Trophy" size={17} />
            </span>
            <span className="font-head text-[1.06rem] font-bold tracking-[-0.015em]">Первенство САО</span>
            <span className="hidden rounded-full bg-secondary px-2 py-[3px] text-[0.68rem] font-semibold text-muted-foreground sm:inline">
              {SEASON}
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-[0.85rem] font-semibold text-muted-foreground hover:text-foreground"
          >
            <Icon name="ArrowLeft" size={14} />
            Все возрасты
          </Link>
        </header>

        <section className="glow-pitch mt-6 rounded-[var(--radius)] p-6 sm:p-8">
          <p className="eyebrow">{SEASON}</p>
          <h1 className="mt-3 font-head text-[2rem] font-bold tracking-[-0.035em] sm:text-[2.6rem]">
            ПЕРВЕНСТВО САО — {meta.label} г.р.
          </h1>
        </section>

        <StandingsSection fixedGroup={group} />
        <ResultsSection fixedGroup={group} onOpenProtocol={setProtocol} />
        <ScheduleSection fixedGroup={group} />
        <PlayersSection fixedGroup={group} />
        <TeamsSection fixedGroup={group} />
      </div>

      <MatchProtocolDialog match={protocol} onOpenChange={(o) => !o && setProtocol(null)} />
    </div>
  );
};

export default AgeGroupPage;
