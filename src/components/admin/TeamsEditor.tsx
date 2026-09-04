import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { AGE_GROUPS } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';
import { removeTeam, saveTeam, type ApiTeam } from '@/lib/league-api';
import { teamSlug } from '@/pages/Team';

interface Props {
  token: string;
}

const empty = {
  name: '',
  district: '',
  coach: '',
  founded: '',
  home: '',
  color: '',
  age_group: '2013',
};

const TeamsEditor = ({ token }: Props) => {
  const { teams, applyData } = useLeague();
  const [editing, setEditing] = useState<ApiTeam | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);

  const copyLink = (t: ApiTeam) => {
    navigator.clipboard?.writeText(`${window.location.origin}/team/${teamSlug(t.name)}`);
    setCopied(t.id);
    setTimeout(() => setCopied(null), 1800);
  };

  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const reset = () => {
    setEditing(null);
    setForm(empty);
    setOpen(false);
    setError('');
  };

  const startEdit = (t: ApiTeam) => {
    setEditing(t);
    setForm({
      name: t.name,
      district: t.district,
      coach: t.coach,
      founded: t.founded ? String(t.founded) : '',
      home: t.home,
      color: t.color,
      age_group: t.age_group,
    });
    setOpen(true);
    setError('');
  };

  const submit = async () => {
    setError('');
    if (form.name.trim().length < 2) return setError('Укажите название команды');
    setBusy(true);
    try {
      applyData(
        await saveTeam(token, {
          id: editing?.id,
          name: form.name.trim(),
          district: form.district.trim(),
          coach: form.coach.trim(),
          founded: Number(form.founded) || 0,
          home: form.home.trim(),
          color: form.color.trim(),
          age_group: form.age_group,
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
      applyData(await removeTeam(token, id));
      if (editing?.id === id) reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить');
    } finally {
      setBusy(false);
    }
  };

  const FIELDS: { key: keyof typeof empty; label: string; placeholder: string }[] = [
    { key: 'name', label: 'Название команды', placeholder: 'ФК «Сокол»' },
    { key: 'coach', label: 'Тренер', placeholder: 'Андрей Гаврилов' },
    { key: 'district', label: 'Район', placeholder: 'Сокол' },
    { key: 'founded', label: 'Год основания', placeholder: '2017' },
    { key: 'home', label: 'Домашний стадион', placeholder: 'Стадион «Сокол», поле №1' },
    { key: 'color', label: 'Цвета формы', placeholder: 'Красно-чёрные' },
  ];

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-head text-[1.5rem] font-bold tracking-[-0.03em]">Команды</h2>
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
            Новая команда
          </button>
        )}
      </div>

      {open && (
        <div className="mb-4 rounded-[var(--radius)] bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="eyebrow">{editing ? 'Редактирование команды' : 'Новая команда'}</p>
            <button
              onClick={reset}
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              aria-label="Закрыть"
            >
              <Icon name="X" size={16} />
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="eyebrow mb-2 block">{f.label}</label>
                <Input
                  value={form[f.key]}
                  onChange={(e) =>
                    set(f.key, f.key === 'founded' ? e.target.value.replace(/\D/g, '').slice(0, 4) : e.target.value)
                  }
                  placeholder={f.placeholder}
                  className="bg-secondary/60"
                />
              </div>
            ))}
          </div>

          <label className="eyebrow mb-2 mt-4 block">Возрастная группа</label>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() => set('age_group', g.id)}
                className={cn(
                  'rounded-full px-4 py-2 text-[0.8rem] font-semibold transition-colors',
                  form.age_group === g.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                {g.short}
              </button>
            ))}
          </div>

          {error && <p className="mt-3 text-[0.82rem] text-accent">{error}</p>}

          <div className="mt-5 flex gap-2">
            <Button onClick={submit} disabled={busy} className="rounded-full">
              {editing ? 'Сохранить изменения' : 'Добавить команду'}
            </Button>
            <Button variant="secondary" onClick={reset} className="rounded-full">
              Отмена
            </Button>
          </div>
        </div>
      )}

      <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] bg-card">
        {teams.map((t) => (
          <li key={t.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-head text-[1.02rem] font-bold">{t.name}</span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.7rem] font-semibold text-muted-foreground">
                  {AGE_GROUPS.find((g) => g.id === t.age_group)?.short ?? t.age_group}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[0.83rem] text-muted-foreground">
                {t.coach && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="User" size={13} />
                    {t.coach}
                  </span>
                )}
                {t.home && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="MapPin" size={13} />
                    {t.home}
                  </span>
                )}
                {t.color && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="Shirt" size={13} />
                    {t.color}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:justify-end">
              <button
                onClick={() => copyLink(t)}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-[0.82rem] font-semibold transition-colors hover:bg-secondary/70"
              >
                <Icon name={copied === t.id ? 'Check' : 'Link'} size={14} />
                {copied === t.id ? 'Скопировано' : 'Ссылка тренеру'}
              </button>
              <button
                onClick={() => startEdit(t)}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-[0.82rem] font-semibold transition-colors hover:bg-secondary/70"
              >
                <Icon name="Pencil" size={14} />
                Изменить
              </button>
              <button
                onClick={() => drop(t.id)}
                disabled={busy}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-accent"
                aria-label="Удалить"
              >
                <Icon name="Trash2" size={15} />
              </button>
            </div>
          </li>
        ))}
        {!teams.length && (
          <li className="px-5 py-8 text-center text-[0.9rem] text-muted-foreground">
            Команд пока нет
          </li>
        )}
      </ul>
    </section>
  );
};

export default TeamsEditor;