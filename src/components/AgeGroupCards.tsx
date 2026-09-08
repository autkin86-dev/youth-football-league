import { Link } from 'react-router-dom';
import { AGE_GROUPS } from '@/data/league';
import { ageGroupSlug } from '@/lib/age-group-slug';

const AgeGroupCards = () => {
  return (
    <section className="py-8">
      <p className="eyebrow">Возрастные группы</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {AGE_GROUPS.map((g) => (
          <Link
            key={g.id}
            to={`/${ageGroupSlug(g.id)}`}
            className="group flex flex-col items-start gap-1 rounded-[var(--radius)] bg-card p-4 transition-colors hover:bg-secondary/70 hover:ring-1 hover:ring-border"
          >
            <span className="font-head text-[1.5rem] font-bold tracking-[-0.02em] transition-colors group-hover:text-accent">
              {ageGroupSlug(g.id)}
            </span>
            <span className="text-[0.78rem] leading-snug text-muted-foreground">{g.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default AgeGroupCards;
