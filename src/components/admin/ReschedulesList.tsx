import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useLeague } from '@/context/LeagueContext';
import { fetchAllReschedules, setRescheduleStatus, type RescheduleRequest } from '@/lib/league-api';

const STATUS = {
  new: { label: 'Новая', cls: 'bg-secondary text-muted-foreground' },
  approved: { label: 'Подтверждена', cls: 'bg-win/15 text-win' },
  rejected: { label: 'Отклонена', cls: 'bg-accent/15 text-accent' },
} as const;

const formatDate = (iso: string) => {
  const d = new Date(iso.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
};

interface Props {
  token: string;
}

const ReschedulesList = ({ token }: Props) => {
  const { applyData } = useLeague();
  const [items, setItems] = useState<RescheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | RescheduleRequest['status']>('all');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    fetchAllReschedules(token)
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [token]);

  const shown = useMemo(
    () => (filter === 'all' ? items : items.filter((r) => r.status === filter)),
    [items, filter],
  );

  const newCount = items.filter((r) => r.status === 'new').length;

  const change = async (id: number, status: RescheduleRequest['status']) => {
    setBusy(id);
    try {
      const res = await setRescheduleStatus(token, id, status);
      setItems(res.reschedules);
      applyData(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось обновить');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-head text-[1.5rem] font-bold tracking-[-0.03em]">Заявки на перенос</h2>
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
            { id: 'approved' as const, label: 'Подтверждённые' },
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
        {shown.map((r) => (
          <li key={r.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-head text-[1.02rem] font-bold">{r.team}</span>
                <span className={cn('rounded-full px-2.5 py-1 text-[0.7rem] font-semibold', STATUS[r.status].cls)}>
                  {STATUS[r.status].label}
                </span>
              </div>
              <p className="mt-1.5 text-[0.88rem]">
                {r.old_date}
                {r.old_time ? `, ${r.old_time}` : ''}
                <Icon name="ArrowRight" size={13} className="mx-2 inline text-muted-foreground" />
                <b className="font-semibold">
                  {r.new_date}
                  {r.new_time ? `, ${r.new_time}` : ''}
                </b>
              </p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.85rem] text-muted-foreground">
                {r.coach_name && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="User" size={13} />
                    {r.coach_name}
                  </span>
                )}
                {r.reason && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="MessageSquare" size={13} />
                    {r.reason}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Icon name="Clock" size={13} />
                  {formatDate(r.created_at)}
                </span>
              </div>
            </div>
            <div className="flex gap-2 sm:justify-end">
              <button
                onClick={() => change(r.id, r.status === 'approved' ? 'new' : 'approved')}
                disabled={busy === r.id}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.82rem] font-semibold transition-colors',
                  r.status === 'approved'
                    ? 'bg-win/15 text-win'
                    : 'bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon name="Check" size={14} />
                Подтвердить
              </button>
              <button
                onClick={() => change(r.id, r.status === 'rejected' ? 'new' : 'rejected')}
                disabled={busy === r.id}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.82rem] font-semibold transition-colors',
                  r.status === 'rejected'
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
            {loading ? 'Загружаю заявки…' : 'Заявок на перенос пока нет'}
          </li>
        )}
      </ul>
    </section>
  );
};

export default ReschedulesList;
