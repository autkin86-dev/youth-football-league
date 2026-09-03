import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { ALL_PLAYERS } from '@/data/league';

type SortKey = 'goals' | 'assists' | 'yellow';

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'goals', label: 'Бомбардиры' },
  { id: 'assists', label: 'Ассистенты' },
  { id: 'yellow', label: 'Карточки' },
];

const PlayersSection = () => {
  const [sort, setSort] = useState<SortKey>('goals');
  const [query, setQuery] = useState('');

  const players = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...ALL_PLAYERS]
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q))
      .sort((a, b) => b[sort] - a[sort] || b.goals - a.goals)
      .slice(0, 12);
  }, [sort, query]);

  const top = players[0];

  return (
    <section id="igroki" className="scroll-mt-24 py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Раздел 05</p>
          <h2 className="mt-2 font-head text-[1.7rem] font-bold tracking-[-0.03em] sm:text-[2.1rem]">
            Статистика игроков
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={cn(
                'rounded-full px-4 py-2 text-[0.85rem] font-semibold transition-colors',
                sort === s.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              {s.label}
            </button>
          ))}
          <div className="relative">
            <Icon
              name="Search"
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Игрок или команда"
              className="h-10 w-[180px] rounded-full border-border bg-card pl-9 text-[0.85rem]"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {top && (
          <article className="glow-pitch flex flex-col justify-between overflow-hidden rounded-[var(--radius)] p-5">
            <p className="eyebrow">Лидер рейтинга</p>
            <div className="mt-8">
              <p className="font-head text-[1.9rem] font-bold leading-[1.05] tracking-[-0.03em]">
                {top.name}
              </p>
              <p className="mt-1.5 text-[0.88rem] text-muted-foreground">
                {top.team} · {top.position} · №{top.number}
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
              {[
                { v: top.goals, l: 'голы' },
                { v: top.assists, l: 'пасы' },
                { v: top.games, l: 'матчи' },
              ].map((s) => (
                <div key={s.l}>
                  <p className="tabnum font-head text-[1.5rem] font-bold">{s.v}</p>
                  <p className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </article>
        )}

        <div className="overflow-x-auto rounded-[var(--radius)] bg-card">
          <table className="w-full min-w-[620px]">
            <thead>
              <tr className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-4 py-3.5 text-left font-semibold">#</th>
                <th className="px-2 py-3.5 text-left font-semibold">Игрок</th>
                <th className="px-2 py-3.5 text-left font-semibold">Команда</th>
                <th className="px-2 py-3.5 text-right font-semibold">И</th>
                <th className="px-2 py-3.5 text-right font-semibold">Голы</th>
                <th className="px-2 py-3.5 text-right font-semibold">Пас</th>
                <th className="px-4 py-3.5 text-right font-semibold">ЖК / КК</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr
                  key={p.name}
                  className="border-t border-border text-[0.9rem] transition-colors hover:bg-secondary/40"
                >
                  <td className="tabnum px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-2 py-3 font-medium">{p.name}</td>
                  <td className="px-2 py-3 text-muted-foreground">{p.team}</td>
                  <td className="tabnum px-2 py-3 text-right text-muted-foreground">{p.games}</td>
                  <td className="tabnum px-2 py-3 text-right font-head font-bold">{p.goals}</td>
                  <td className="tabnum px-2 py-3 text-right text-muted-foreground">{p.assists}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center justify-end gap-1.5">
                      <span className="tabnum flex items-center gap-1 text-muted-foreground">
                        <span className="h-3 w-2 rounded-[2px] bg-yellow-400" />
                        {p.yellow}
                      </span>
                      <span className="tabnum flex items-center gap-1 text-muted-foreground">
                        <span className="h-3 w-2 rounded-[2px] bg-accent" />
                        {p.red}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
              {!players.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[0.9rem] text-muted-foreground">
                    Ничего не нашлось — попробуйте другое имя.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default PlayersSection;