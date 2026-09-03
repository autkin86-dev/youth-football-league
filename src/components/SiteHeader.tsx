import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { SEASON } from '@/data/league';
import { cn } from '@/lib/utils';

const LINKS = [
  { id: 'tablo', label: 'Таблица' },
  { id: 'raspisanie', label: 'Расписание' },
  { id: 'rezultaty', label: 'Результаты' },
  { id: 'komandy', label: 'Составы' },
  { id: 'igroki', label: 'Игроки' },
];

interface SiteHeaderProps {
  onDeclare: () => void;
}

const SiteHeader = ({ onDeclare }: SiteHeaderProps) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('tablo');

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 160;
      let current = LINKS[0].id;
      LINKS.forEach((l) => {
        const el = document.getElementById(l.id);
        if (el && el.offsetTop <= y) current = l.id;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="sticky top-0 z-50 -mx-5 border-b border-border/60 bg-background/85 px-5 backdrop-blur-xl md:-mx-8 md:px-8">
      <div className="flex h-[72px] items-center justify-between gap-4">
        <a
          href="#tablo"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex shrink-0 items-center gap-2.5"
        >
          <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-accent text-accent-foreground">
            <Icon name="Trophy" size={17} strokeWidth={2} />
          </span>
          <span className="font-head text-[1.06rem] font-bold tracking-[-0.015em]">Первенство САО</span>
          <span className="hidden rounded-full bg-secondary px-2 py-[3px] text-[0.68rem] font-semibold tracking-[0.02em] text-muted-foreground sm:inline">
            {SEASON}
          </span>
        </a>

        <nav className="hidden gap-[26px] text-[0.92rem] font-medium text-muted-foreground lg:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={cn(
                'transition-colors hover:text-foreground',
                active === l.id && 'text-foreground',
              )}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onDeclare}
            className="flex items-center gap-2.5 rounded-full bg-primary py-2 pl-4 pr-3 text-[0.92rem] font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
          >
            <span className="hidden sm:inline">Заявить команду</span>
            <span className="sm:hidden">Заявка</span>
            <span className="h-4 w-4 rounded-full bg-accent" aria-hidden="true" />
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
            className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground lg:hidden"
          >
            <Icon name={open ? 'X' : 'Menu'} size={18} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="animate-fade-in flex flex-col gap-1 border-t border-border py-3 lg:hidden">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="flex items-center justify-between rounded-lg px-2 py-2.5 text-left text-[0.95rem] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
              <Icon name="ChevronRight" size={16} />
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
