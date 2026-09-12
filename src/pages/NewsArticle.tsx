import { Link, useParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { SEASON } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';
import { useSeo } from '@/hooks/use-seo';
import { formatNewsDate } from '@/lib/news-slug';

const NewsArticle = () => {
  const { slug = '' } = useParams();
  const { news, loading } = useLeague();
  const article = news.find((n) => n.slug === slug);

  useSeo({
    title: article ? article.title : 'Новость не найдена',
    description: article ? (article.excerpt || article.title) : undefined,
    path: `/news/${slug}`,
    noindex: !article,
  });

  if (!article) {
    return (
      <div className="screen-vignette grid min-h-screen place-items-center px-5 text-center">
        <div>
          <h1 className="font-head text-[1.6rem] font-bold">
            {loading ? 'Загружаю новость…' : 'Новость не найдена'}
          </h1>
          <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <Icon name="ArrowLeft" size={15} />
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-vignette min-h-screen">
      <div className="mx-auto w-full max-w-[840px] px-5 pb-20 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-accent text-accent-foreground">
              <Icon name="Trophy" size={17} />
            </span>
            <span className="font-head text-[1.06rem] font-bold tracking-[-0.015em]">Первенство САО</span>
            <span className="hidden rounded-full bg-secondary px-2 py-[3px] text-[0.68rem] font-semibold text-muted-foreground sm:inline">
              {SEASON}
            </span>
          </Link>
          <Link
            to="/?s=novosti"
            className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-[0.85rem] font-semibold text-muted-foreground hover:text-foreground"
          >
            <Icon name="ArrowLeft" size={14} />
            Все новости
          </Link>
        </header>

        <nav className="mt-5 flex flex-wrap items-center gap-1.5 text-[0.8rem] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Первенство САО
          </Link>
          <Icon name="ChevronRight" size={13} />
          <Link to="/?s=novosti" className="hover:text-foreground">
            Новости
          </Link>
          <Icon name="ChevronRight" size={13} />
          <span className="truncate text-foreground">{article.title}</span>
        </nav>

        <article className="mt-6">
          <p className="eyebrow">{formatNewsDate(article.published_at)}</p>
          <h1 className="mt-3 font-head text-[1.8rem] font-bold leading-[1.15] tracking-[-0.03em] sm:text-[2.3rem]">
            {article.title}
          </h1>

          {article.image_url && (
            <div className="mt-6 aspect-[16/9] w-full overflow-hidden rounded-[var(--radius)] bg-secondary">
              <img src={article.image_url} alt={article.title} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="mt-6 flex flex-col gap-4 text-[0.98rem] leading-relaxed text-foreground/90">
            {(article.content || article.excerpt)
              .split(/\n{2,}/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
          </div>
        </article>
      </div>
    </div>
  );
};

export default NewsArticle;
