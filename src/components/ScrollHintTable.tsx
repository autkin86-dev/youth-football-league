import { useEffect, useRef, useState, type ReactNode } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
}

const ScrollHintTable = ({ children, className }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      setShowHint(el.scrollWidth - el.clientWidth - el.scrollLeft > 8);
    };

    check();
    const raf = requestAnimationFrame(check);
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [children]);

  return (
    <div className={cn('relative overflow-hidden rounded-[var(--radius)] bg-card', className)}>
      <div ref={ref} className="overflow-x-auto">
        {children}
      </div>
      {showHint && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-end bg-gradient-to-l from-card via-card/80 to-transparent">
          <Icon name="ChevronRight" size={15} className="mr-0.5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default ScrollHintTable;
