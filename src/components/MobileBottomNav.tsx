import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { SECTION_LINKS } from '@/components/SiteHeader';

const MAIN_TABS = [
  { id: null, label: 'Главная', icon: 'Home' },
  { id: 'raspisanie', label: 'Матчи', icon: 'CalendarDays' },
  { id: 'tablo', label: 'Таблица', icon: 'Trophy' },
  { id: 'komandy', label: 'Команды', icon: 'Users' },
] as const;

const MORE_LINKS = SECTION_LINKS.filter(
  (l) => !MAIN_TABS.some((t) => t.id === l.id),
);

interface Props {
  activeSection: string | null;
  onSelectSection: (id: string | null) => void;
}

const MobileBottomNav = ({ activeSection, onSelectSection }: Props) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = MORE_LINKS.some((l) => l.id === activeSection);

  const go = (id: string | null) => {
    setMoreOpen(false);
    onSelectSection(id);
  };

  return (
    <>
      {moreOpen && (
        <button
          aria-label="Закрыть меню"
          onClick={() => setMoreOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {moreOpen && (
        <nav
          className="animate-fade-in fixed inset-x-0 bottom-[64px] z-50 mx-3 overflow-hidden rounded-[var(--radius)] bg-card shadow-xl lg:hidden"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          {MORE_LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={cn(
                'flex w-full items-center justify-between px-4 py-3.5 text-left text-[0.92rem] font-medium transition-colors',
                activeSection === l.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60',
              )}
            >
              {l.label}
              <Icon name="ChevronRight" size={16} />
            </button>
          ))}
        </nav>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/92 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5">
          {MAIN_TABS.map((t) => {
            const active = activeSection === t.id && !moreOpen;
            return (
              <button
                key={t.label}
                onClick={() => go(t.id)}
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
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 text-[0.66rem] font-medium transition-colors',
              moreOpen || isMoreActive ? 'text-accent' : 'text-muted-foreground',
            )}
          >
            <Icon name="MoreHorizontal" size={20} strokeWidth={moreOpen || isMoreActive ? 2.4 : 2} />
            Ещё
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;