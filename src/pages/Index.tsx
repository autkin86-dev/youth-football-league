import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SiteHeader, { SECTION_LINKS } from '@/components/SiteHeader';
import HeroBoard from '@/components/HeroBoard';
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

const Index = () => {
  const [protocol, setProtocol] = useState<Match | null>(null);
  const [declare, setDeclare] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get('s');

  const goSection = (id: string | null) => {
    if (id) setSearchParams({ s: id });
    else setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const sectionMeta = SECTION_LINKS.find((l) => l.id === section);

  const renderSection = () => {
    switch (section) {
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
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-8">
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
              <HeroBoard onOpenProtocol={setProtocol} />
              <OverallStandingsSection />
            </>
          )}
        </main>
        <SiteFooter />
      </div>

      <MatchProtocolDialog match={protocol} onOpenChange={(o) => !o && setProtocol(null)} />
      <DeclareTeamDialog open={declare} onOpenChange={setDeclare} />
    </div>
  );
};

export default Index;