import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { Match } from '@/data/league';

interface Props {
  match: Match | null;
  onOpenChange: (open: boolean) => void;
}

const MatchProtocolDialog = ({ match, onOpenChange }: Props) => {
  if (!match) return null;
  const homeWin = (match.homeGoals ?? 0) > (match.awayGoals ?? 0);
  const awayWin = (match.awayGoals ?? 0) > (match.homeGoals ?? 0);

  return (
    <Dialog open={!!match} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card">
        <DialogHeader>
          <DialogTitle className="eyebrow text-left">
            Протокол матча · {match.round} тур
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl bg-secondary/60 p-4">
          <span className={cn('font-head text-right text-[1rem] font-semibold', !homeWin && 'text-muted-foreground')}>
            {match.home}
          </span>
          <span className="font-head tabnum text-[1.6rem] font-bold">
            {match.homeGoals}
            <span className="px-1.5 text-muted-foreground">:</span>
            {match.awayGoals}
          </span>
          <span className={cn('font-head text-[1rem] font-semibold', !awayWin && 'text-muted-foreground')}>
            {match.away}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[0.8rem] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Icon name="Calendar" size={14} /> {match.date}, {match.time}
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="MapPin" size={14} /> {match.venue}
          </span>
          {match.referee && (
            <span className="flex items-center gap-1.5">
              <Icon name="Whistle" fallback="UserRound" size={14} /> Судья: {match.referee}
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          <p className="eyebrow">Голы</p>
          {match.goals?.length ? (
            <ul className="space-y-1.5">
              {match.goals.map((g, i) => (
                <li key={i} className="flex items-center gap-3 text-[0.9rem]">
                  <span className="tabnum w-9 shrink-0 text-muted-foreground">{g.minute}'</span>
                  <Icon name="CircleDot" size={14} className="shrink-0 text-accent" />
                  <span className="flex-1">
                    {g.player}
                    {g.penalty && <span className="ml-1.5 text-muted-foreground">(пен.)</span>}
                  </span>
                  <span className="text-[0.78rem] text-muted-foreground">
                    {g.team === 'home' ? match.home : match.away}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.88rem] text-muted-foreground">Голов не было</p>
          )}
        </div>

        <div className="space-y-2.5">
          <p className="eyebrow">Карточки</p>
          {match.cards?.length ? (
            <ul className="space-y-1.5">
              {match.cards.map((c, i) => (
                <li key={i} className="flex items-center gap-3 text-[0.9rem]">
                  <span className="tabnum w-9 shrink-0 text-muted-foreground">{c.minute}'</span>
                  <span
                    className={cn(
                      'h-3.5 w-2.5 shrink-0 rounded-[2px]',
                      c.color === 'yellow' ? 'bg-yellow-400' : 'bg-accent',
                    )}
                  />
                  <span className="flex-1">{c.player}</span>
                  <span className="text-[0.78rem] text-muted-foreground">
                    {c.team === 'home' ? match.home : match.away}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.88rem] text-muted-foreground">Карточек не было</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchProtocolDialog;
