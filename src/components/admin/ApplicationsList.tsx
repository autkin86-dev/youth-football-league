import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { AGE_GROUPS } from '@/data/league';
import { fetchApplications, setApplicationStatus, type Application } from '@/lib/league-api';

const STATUS = {
  new: { label: 'Новая', cls: 'bg-secondary text-muted-foreground' },
  approved: { label: 'Принята', cls: 'bg-win/15 text-win' },
  rejected: { label: 'Отклонена', cls: 'bg-accent/15 text-accent' },
} as const;

const groupLabel = (id: string) => AGE_GROUPS.find((g) => g.id === id)?.short ?? id;

const formatDate = (iso: string) => {
  const d = new Date(iso.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
};

interface Props {
  token: string;
}

const ApplicationsList = ({ token }: Props) => {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Application['status']>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications(token)
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [token]);

  const shown = useMemo(
    () => (filter === 'all' ? items : items.filter((a) => a.status === filter)),
    [items, filter],
  );

  const newCount = items.filter((a) => a.status === 'new').length;

  const change = async (id: number, status: Application['status']) => {
    try {
      setItems(await setApplicationStatus(token, id, status));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось обновить');
    }
  };

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-head text-[1.5rem] font-bold tracking-[-0.03em]">Заявки команд</h2>
          {newCount > 0 && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[0.72rem] font-bold text-accent-foreground">
              {newCount} новых
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all' as const, label: 'Все' },
            { id: 'new' as const, label: 'Новые' },
            { id: 'approved' as const, label: 'Принятые' },
            { id: 'rejected' as const, label: 'Отклонённые' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'rounded-full px-4 py-2 text-[0.85rem] font-semibold transition-colors',
                filter === f.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-3 text-[0.85rem] text-accent">{error}</p>}

      <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] bg-card">
        {shown.map((a) => (
          <li key={a.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-head text-[1.02rem] font-bold">{a.team_name}</span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.7rem] font-semibold text-muted-foreground">
                  {groupLabel(a.age_group)}
                </span>
                <span className={cn('rounded-full px-2.5 py-1 text-[0.7rem] font-semibold', STATUS[a.status].cls)}>
                  {STATUS[a.status].label}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.85rem] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Icon name="User" size={13} />
                  {a.coach}
                </span>
                <a href={`tel:${a.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
                  <Icon name="Phone" size={13} />
                  {a.phone}
                </a>
                <span className="flex items-center gap-1.5">
                  <Icon name="Clock" size={13} />
                  {formatDate(a.created_at)}
                </span>
              </div>
            </div>
            <div className="flex gap-2 sm:justify-end">
              <button
                onClick={() => change(a.id, a.status === 'approved' ? 'new' : 'approved')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.82rem] font-semibold transition-colors',
                  a.status === 'approved'
                    ? 'bg-win/15 text-win'
                    : 'bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon name="Check" size={14} />
                Принять
              </button>
              <button
                onClick={() => change(a.id, a.status === 'rejected' ? 'new' : 'rejected')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.82rem] font-semibold transition-colors',
                  a.status === 'rejected'
                    ? 'bg-accent/15 text-accent'
                    : 'bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon name="X" size={14} />
                Отклонить
              </button>
            </div>
          </li>
        ))}
        {!shown.length && (
          <li className="px-5 py-8 text-center text-[0.9rem] text-muted-foreground">
            {loading ? 'Загружаю заявки…' : 'Заявок пока нет'}
          </li>
        )}
      </ul>
    </section>
  );
};

export default ApplicationsList;
