import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SiteHeader, { SECTION_LINKS } from '@/components/SiteHeader';
import MobileBottomNav from '@/components/MobileBottomNav';
import HeroBoard from '@/components/HeroBoard';
import MatchStatusCard from '@/components/MatchStatusCard';
import StatsBar from '@/components/StatsBar';
import StandingsPreview from '@/components/StandingsPreview';
import AgeGroupCards from '@/components/AgeGroupCards';
import AboutSection from '@/components/AboutSection';
import OverallStandingsSection from '@/components/OverallStandingsSection';
import StandingsSection from '@/components/StandingsSection';
import ScheduleSection from '@/components/ScheduleSection';
import ResultsSection from '@/components/ResultsSection';
import TeamsSection from '@/components/TeamsSection';
import PlayersSection from '@/components/PlayersSection';
import SiteFooter from '@/components/SiteFooter';
import MatchProtocolDialog from '@/components/MatchProtocolDialog';
import DeclareTeamDialog from '@/components/DeclareTeamDialog';
import Icon from '@/components/ui/icon';
import type { Match } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';

const Index = () => {
  const [protocol, setProtocol] = useState<Match | null>(null);
  const [declare, setDeclare] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get('s');
  const { nextMatch } = useLeague();

  const goSection = (id: string | null) => {
    if (id) setSearchParams({ s: id });
    else setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const sectionMeta = SECTION_LINKS.find((l) => l.id === section);

  const renderSection = () => {
    switch (section) {
      case 'obshiy-zachet':
        return <OverallStandingsSection />;
      case 'tablo':
        return <StandingsSection />;
      case 'raspisanie':
        return <ScheduleSection />;
      case 'rezultaty':
        return <ResultsSection onOpenProtocol={setProtocol} />;
      case 'komandy':
        return <TeamsSection />;
      case 'igroki':
        return <PlayersSection />;
      default:
        return null;
    }
  };

  return (
    <div className="screen-vignette min-h-screen">
      <div className="mx-auto w-full max-w-[1440px] px-5 pb-20 md:px-8 lg:pb-0">
        <SiteHeader onDeclare={() => setDeclare(true)} activeSection={section} onSelectSection={goSection} />
        <main>
          {section && sectionMeta ? (
            <div className="animate-fade-in min-h-[70vh] py-6">
              <button
                onClick={() => goSection(null)}
                className="mb-6 flex items-center gap-1.5 text-[0.85rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon name="ArrowLeft" size={15} />
                На главную
              </button>
              {renderSection()}
            </div>
          ) : (
            <>
              <h1 className="sr-only">Первенство САО по футболу</h1>

              <div className="flex flex-col gap-4 py-4 lg:hidden">
                {nextMatch ? (
                  <MatchStatusCard
                    match={nextMatch}
                    onOpenProtocol={setProtocol}
                    onViewAll={() => goSection('rezultaty')}
                  />
                ) : (
                  <article className="glow-pitch animate-rise flex min-h-[220px] flex-col items-center justify-center rounded-[var(--radius)] px-6 py-10 text-center">
                    <p className="eyebrow">Первенство САО по футболу</p>
                    <p className="mt-3 font-head text-[1.4rem] font-bold leading-[1.15]">
                      Турнир детско-юношеских команд Северного округа Москвы
                    </p>
                    <p className="mt-2 text-[0.9rem] text-muted-foreground">
                      Расписание ближайших матчей уточняется
                    </p>
                  </article>
                )}
                <StatsBar />
                <StandingsPreview />
              </div>

              <HeroBoard onOpenProtocol={setProtocol} />
              <div className="hidden lg:block">
                <StatsBar />
              </div>
              <AgeGroupCards />
              <div className="hidden lg:block">
                <AboutSection />
                <OverallStandingsSection />
              </div>
            </>
          )}
        </main>
        <SiteFooter />
      </div>

      <MobileBottomNav activeSection={section} onSelectSection={goSection} />
      <MatchProtocolDialog match={protocol} onOpenChange={(o) => !o && setProtocol(null)} />
      <DeclareTeamDialog open={declare} onOpenChange={setDeclare} />
    </div>
  );
};

export default Index;