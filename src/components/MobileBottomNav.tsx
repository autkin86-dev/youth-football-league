import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const TABS = [
  { id: null, label: 'Главная', icon: 'Home' },
  { id: 'tablo', label: 'Таблица', icon: 'Table2' },
  { id: 'raspisanie', label: 'Игры', icon: 'CalendarDays' },
  { id: 'komandy', label: 'Составы', icon: 'Users' },
  { id: 'igroki', label: 'Игроки', icon: 'UserRound' },
] as const;

interface Props {
  activeSection: string | null;
  onSelectSection: (id: string | null) => void;
}

const MobileBottomNav = ({ activeSection, onSelectSection }: Props) => {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/92 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5">
        {TABS.map((t) => {
          const active = activeSection === t.id;
          return (
            <button
              key={t.label}
              onClick={() => onSelectSection(t.id)}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 text-[0.66rem] font-medium transition-colors',
                active ? 'text-accent' : 'text-muted-foreground',
              )}
            >
              <Icon name={t.icon} size={20} strokeWidth={active ? 2.4 : 2} />
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
