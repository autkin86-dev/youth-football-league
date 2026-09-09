import { teamColor, teamInitials } from '@/lib/team-colors';
import { cn } from '@/lib/utils';

interface Props {
  name: string;
  size?: number;
  className?: string;
}

const TeamBadge = ({ name, size = 24, className }: Props) => (
  <span
    className={cn(
      'grid shrink-0 place-items-center rounded-full font-bold text-white',
      teamColor(name),
      className,
    )}
    style={{ width: size, height: size, fontSize: size * 0.38 }}
  >
    {teamInitials(name)}
  </span>
);

export default TeamBadge;
