import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useLeague } from '@/context/LeagueContext';
import { formatNewsDate } from '@/lib/news-slug';

const NewsSection = () => {
  const { news } = useLeague();

  if (!news.length) return null;

  return (
    <section id="novosti" className="scroll-mt-24 py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Новости</p>
          <h2 className="mt-2 font-head text-[1.7rem] font-bold tracking-[-0.03em] sm:text-[2.1rem]">
            Новости турнира
          </h2>
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {news.slice(0, 6).map((n) => (
          <Link
            key={n.id}
            to={`/news/${n.slug}`}
            className="group flex flex-col overflow-hidden rounded-[var(--radius)] bg-card transition-all hover:bg-secondary/70 hover:ring-1 hover:ring-border"
          >
            {n.image_url && (
              <div className="aspect-[16/9] w-full overflow-hidden bg-secondary">
                <img
                  src={n.image_url}
                  alt={n.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col p-4">
              <p className="eyebrow mb-2">{formatNewsDate(n.published_at)}</p>
              <h3 className="font-head text-[1.02rem] font-bold leading-snug tracking-[-0.01em]">
                {n.title}
              </h3>
              {n.excerpt && (
                <p className="mt-2 line-clamp-2 text-[0.86rem] leading-relaxed text-muted-foreground">
                  {n.excerpt}
                </p>
              )}
              <span className="mt-3 flex items-center gap-1.5 text-[0.78rem] font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
                Читать
                <Icon name="ArrowRight" size={13} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default NewsSection;
