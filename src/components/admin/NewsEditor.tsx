import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useLeague } from '@/context/LeagueContext';
import { removeNews, saveNews, type NewsItem } from '@/lib/league-api';
import { slugifyNews, formatNewsDate } from '@/lib/news-slug';

interface Props {
  token: string;
}

const empty = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image_url: '',
};

const NewsEditor = ({ token }: Props) => {
  const { news, applyData } = useLeague();
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const copyLink = (n: NewsItem) => {
    navigator.clipboard?.writeText(`${window.location.origin}/news/${n.slug}`);
    setCopied(n.id);
    setTimeout(() => setCopied(null), 1800);
  };

  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const reset = () => {
    setEditing(null);
    setForm(empty);
    setOpen(false);
    setError('');
    setSlugTouched(false);
  };

  const startEdit = (n: NewsItem) => {
    setEditing(n);
    setForm({
      title: n.title,
      slug: n.slug,
      excerpt: n.excerpt,
      content: n.content,
      image_url: n.image_url,
    });
    setSlugTouched(true);
    setOpen(true);
    setError('');
  };

  const submit = async () => {
    setError('');
    if (form.title.trim().length < 3) return setError('Укажите заголовок новости');
    const slug = form.slug.trim() || slugifyNews(form.title);
    if (slug.length < 3) return setError('Не удалось сформировать адрес новости');
    setBusy(true);
    try {
      applyData(
        await saveNews(token, {
          id: editing?.id,
          title: form.title.trim(),
          slug,
          excerpt: form.excerpt.trim(),
          content: form.content.trim(),
          image_url: form.image_url.trim(),
        }),
      );
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить');
    } finally {
      setBusy(false);
    }
  };

  const drop = async (id: number) => {
    setBusy(true);
    try {
      applyData(await removeNews(token, id));
      if (editing?.id === id) reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-head text-[1.5rem] font-bold tracking-[-0.03em]">Новости</h2>
        {!open && (
          <button
            onClick={() => {
              setForm(empty);
              setEditing(null);
              setOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[0.85rem] font-semibold text-accent-foreground transition-transform hover:scale-[1.03]"
          >
            <Icon name="Plus" size={14} />
            Новая новость
          </button>
        )}
      </div>

      {open && (
        <div className="mb-4 rounded-[var(--radius)] bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="eyebrow">{editing ? 'Редактирование новости' : 'Новая новость'}</p>
            <button
              onClick={reset}
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              aria-label="Закрыть"
            >
              <Icon name="X" size={16} />
            </button>
          </div>

          <div className="mt-4 grid gap-4">
            <div>
              <label className="eyebrow mb-2 block">Заголовок</label>
              <Input
                value={form.title}
                onChange={(e) => {
                  set('title', e.target.value);
                  if (!slugTouched) set('slug', slugifyNews(e.target.value));
                }}
                placeholder="Результаты 5-го тура Первенства САО"
                className="bg-secondary/60"
              />
            </div>

            <div>
              <label className="eyebrow mb-2 block">Адрес страницы (slug)</label>
              <Input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', slugifyNews(e.target.value));
                }}
                placeholder="rezultaty-5-tura"
                className="bg-secondary/60"
              />
            </div>

            <div>
              <label className="eyebrow mb-2 block">Короткое описание</label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                placeholder="Коротко о новости для карточки на главной"
                className="min-h-[60px] bg-secondary/60"
              />
            </div>

            <div>
              <label className="eyebrow mb-2 block">Текст новости</label>
              <Textarea
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                placeholder="Полный текст новости. Пустая строка — новый абзац."
                className="min-h-[160px] bg-secondary/60"
              />
            </div>

            <div>
              <label className="eyebrow mb-2 block">Ссылка на изображение</label>
              <Input
                value={form.image_url}
                onChange={(e) => set('image_url', e.target.value)}
                placeholder="https://..."
                className="bg-secondary/60"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-[0.82rem] text-accent">{error}</p>}

          <div className="mt-5 flex gap-2">
            <Button onClick={submit} disabled={busy} className="rounded-full">
              {editing ? 'Сохранить изменения' : 'Опубликовать новость'}
            </Button>
            <Button variant="secondary" onClick={reset} className="rounded-full">
              Отмена
            </Button>
          </div>
        </div>
      )}

      <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] bg-card">
        {news.map((n) => (
          <li key={n.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-head text-[1.02rem] font-bold">{n.title}</span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.7rem] font-semibold text-muted-foreground">
                  {formatNewsDate(n.published_at)}
                </span>
              </div>
              {n.excerpt && (
                <p className="mt-1.5 line-clamp-1 text-[0.83rem] text-muted-foreground">{n.excerpt}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 sm:justify-end">
              <button
                onClick={() => copyLink(n)}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-[0.82rem] font-semibold transition-colors hover:bg-secondary/70"
              >
                <Icon name={copied === n.id ? 'Check' : 'Link'} size={14} />
                {copied === n.id ? 'Скопировано' : 'Ссылка'}
              </button>
              <button
                onClick={() => startEdit(n)}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-[0.82rem] font-semibold transition-colors hover:bg-secondary/70"
              >
                <Icon name="Pencil" size={14} />
                Изменить
              </button>
              <button
                onClick={() => drop(n.id)}
                disabled={busy}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-accent"
                aria-label="Удалить"
              >
                <Icon name="Trash2" size={15} />
              </button>
            </div>
          </li>
        ))}
        {!news.length && (
          <li className="px-5 py-8 text-center text-[0.9rem] text-muted-foreground">
            Новостей пока нет
          </li>
        )}
      </ul>
    </section>
  );
};

export default NewsEditor;
