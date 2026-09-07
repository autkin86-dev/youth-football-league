import { useEffect } from 'react';

const SITE_URL = 'https://первенствосао.рф';
const DEFAULT_TITLE = 'Первенство САО по футболу — Москва';
const DEFAULT_DESCRIPTION =
  'Первенство САО по футболу — турнир детско-юношеских команд Северного административного округа Москвы. Турнирная таблица, расписание матчей, результаты туров, составы команд и статистика игроков в возрастных группах 2011–2018 г.р.';

interface SeoOptions {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
}

const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!el) return;
  el.setAttribute(attr, value);
};

export const useSeo = ({ title, description, path = '/', noindex = false }: SeoOptions) => {
  useEffect(() => {
    const finalTitle = title ? `${title} · Первенство САО по футболу` : DEFAULT_TITLE;
    const finalDescription = description || DEFAULT_DESCRIPTION;
    const canonicalUrl = `${SITE_URL}${path}`;

    document.title = finalTitle;
    setMeta('meta[name="description"]', 'content', finalDescription);
    setMeta('link[rel="canonical"]', 'href', canonicalUrl);
    setMeta('meta[property="og:title"]', 'content', finalTitle);
    setMeta('meta[property="og:description"]', 'content', finalDescription);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[name="twitter:title"]', 'content', finalTitle);
    setMeta('meta[name="twitter:description"]', 'content', finalDescription);
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow');

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('meta[name="description"]', 'content', DEFAULT_DESCRIPTION);
      setMeta('link[rel="canonical"]', 'href', `${SITE_URL}/`);
      setMeta('meta[name="robots"]', 'content', 'index, follow');
    };
  }, [title, description, path, noindex]);
};
