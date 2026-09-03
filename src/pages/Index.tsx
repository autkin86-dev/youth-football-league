import { useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import HeroBoard from '@/components/HeroBoard';
import StandingsSection from '@/components/StandingsSection';
import ScheduleSection from '@/components/ScheduleSection';
import ResultsSection from '@/components/ResultsSection';
import TeamsSection from '@/components/TeamsSection';
import PlayersSection from '@/components/PlayersSection';
import SiteFooter from '@/components/SiteFooter';
import MatchProtocolDialog from '@/components/MatchProtocolDialog';
import DeclareTeamDialog from '@/components/DeclareTeamDialog';
import type { Match } from '@/data/league';

const Index = () => {
  const [protocol, setProtocol] = useState<Match | null>(null);
  const [declare, setDeclare] = useState(false);

  return (
    <div className="screen-vignette min-h-screen">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-8">
        <SiteHeader onDeclare={() => setDeclare(true)} />
        <main>
          <HeroBoard onOpenProtocol={setProtocol} />
          <StandingsSection />
          <ScheduleSection />
          <ResultsSection onOpenProtocol={setProtocol} />
          <TeamsSection />
          <PlayersSection />
        </main>
        <SiteFooter />
      </div>

      <MatchProtocolDialog match={protocol} onOpenChange={(o) => !o && setProtocol(null)} />
      <DeclareTeamDialog open={declare} onOpenChange={setDeclare} />
    </div>
  );
};

export default Index;
