import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { AGE_GROUPS, type AgeGroup } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';
import { fetchCoaches, removeCoach, saveCoach, type CoachAccount } from '@/lib/league-api';

interface Props {
  token: string;
}

const CoachAccounts = ({ token }: Props) => {
  const { teams: apiTeams } = useLeague();

  const groupsWithTeams = useMemo(
    () => AGE_GROUPS.filter((g) => apiTeams.some((t) => t.age_group === g.id)),
    [apiTeams],
  );

  const [items, setItems] = useState<CoachAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CoachAccount | null>(null);
  const [login, setLogin] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('');
  const [team, setTeam] = useState('');
  const [coachName, setCoachName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    fetchCoaches(token)
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (groupsWithTeams.length && !ageGroup) setAgeGroup(groupsWithTeams[0].id);
  }, [groupsWithTeams, ageGroup]);

  const teamsInGroup = useMemo(
    () => apiTeams.filter((t) => t.age_group === ageGroup).map((t) => t.name),
    [apiTeams, ageGroup],
  );

  useEffect(() => {
    if (teamsInGroup.length && !teamsInGroup.includes(team)) setTeam(teamsInGroup[0]);
  }, [teamsInGroup, team]);

  const reset = () => {
    setOpen(false);
    setEditing(null);
    setLogin('');
    setCoachName('');
    setPassword('');
    setAgeGroup(groupsWithTeams[0]?.id ?? '');
    setError('');
  };

  const startEdit = (c: CoachAccount) => {
    setEditing(c);
    setLogin(c.login);
    setAgeGroup(c.age_group as AgeGroup);
    setTeam(c.team);
    setCoachName(c.coach_name);
    setPassword('');
    setOpen(true);
    setError('');
  };

  const submit = async () => {
    setError('');
    if (login.trim().length < 3) return setError('Логин минимум 3 символа');
    if (!ageGroup) return setError('Выберите возрастную группу');
    if (!editing && password.length < 4) return setError('Пароль минимум 4 символа');
    setBusy(true);
    try {
      setItems(
        await saveCoach(token, {
          id: editing?.id,
          login: login.trim().toLowerCase(),
          team,
          age_group: ageGroup,
          coach_name: coachName.trim(),
          password: password || undefined,
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
      setItems(await removeCoach(token, id));
      if (editing?.id === id) reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить');
    } finally {
      setBusy(false);
    }
  };

  const copyLink = (c: CoachAccount) => {
    navigator.clipboard?.writeText(`${window.location.origin}/coach`);
    setCopied(c.id);
    setTimeout(() => setCopied(null), 1800);
  };

  const groupLabel = (id: string) => AGE_GROUPS.find((g) => g.id === id)?.short ?? id;

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-head text-[1.5rem] font-bold tracking-[-0.03em]">Доступы тренеров</h2>
          <p className="mt-1 text-[0.83rem] text-muted-foreground">
            Тренер входит на /coach и правит только состав своей команды.
          </p>
        </div>
        {!open && (
          <button
            onClick={() => {
              reset();
              setOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[0.85rem] font-semibold text-accent-foreground transition-transform hover:scale-[1.03]"
          >
            <Icon name="Plus" size={14} />
            Новый доступ
          </button>
        )}
      </div>

      {open && (
        <div className="mb-4 rounded-[var(--radius)] bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="eyebrow">{editing ? 'Изменить доступ' : 'Новый доступ тренера'}</p>
            <button
              onClick={reset}
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              aria-label="Закрыть"
            >
              <Icon name="X" size={16} />
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="eyebrow mb-2 block">Логин</label>
              <Input
                value={login}
                onChange={(e) => setLogin(e.target.value.replace(/\s/g, '').toLowerCase())}
                placeholder="dinamo"
                className="bg-secondary/60"
              />
            </div>
            <div>
              <label className="eyebrow mb-2 block">ФИО тренера</label>
              <Input
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="Сергей Тарасов"
                className="bg-secondary/60"
              />
            </div>
            <div>
              <label className="eyebrow mb-2 block">
                {editing ? 'Новый пароль (можно не менять)' : 'Пароль'}
              </label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="bg-secondary/60"
              />
            </div>
          </div>

          <label className="eyebrow mb-2 mt-4 block">Возрастная группа</label>
          <div className="flex flex-wrap gap-1.5">
            {groupsWithTeams.map((g) => (
              <button
                key={g.id}
                onClick={() => setAgeGroup(g.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[0.78rem] font-medium transition-colors',
                  ageGroup === g.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                {g.short}
              </button>
            ))}
          </div>

          <label className="eyebrow mb-2 mt-4 block">Команда</label>
          <div className="flex flex-wrap gap-1.5">
            {teamsInGroup.map((t) => (
              <button
                key={t}
                onClick={() => setTeam(t)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[0.78rem] font-medium transition-colors',
                  team === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {error && <p className="mt-3 text-[0.82rem] text-accent">{error}</p>}

          <div className="mt-5 flex gap-2">
            <Button onClick={submit} disabled={busy} className="rounded-full">
              {editing ? 'Сохранить' : 'Создать доступ'}
            </Button>
            <Button variant="secondary" onClick={reset} className="rounded-full">
              Отмена
            </Button>
          </div>
        </div>
      )}

      <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] bg-card">
        {items.map((c) => (
          <li key={c.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-head text-[1.02rem] font-bold">{c.team}</span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.7rem] font-semibold text-muted-foreground">
                  {groupLabel(c.age_group)}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.7rem] font-semibold text-muted-foreground">
                  логин: {c.login}
                </span>
              </div>
              {c.coach_name && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[0.83rem] text-muted-foreground">
                  <Icon name="User" size={13} />
                  {c.coach_name}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 sm:justify-end">
              <button
                onClick={() => copyLink(c)}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-[0.82rem] font-semibold transition-colors hover:bg-secondary/70"
              >
                <Icon name={copied === c.id ? 'Check' : 'Link'} size={14} />
                {copied === c.id ? 'Скопировано' : 'Ссылка на вход'}
              </button>
              <button
                onClick={() => startEdit(c)}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-[0.82rem] font-semibold transition-colors hover:bg-secondary/70"
              >
                <Icon name="Pencil" size={14} />
                Изменить
              </button>
              <button
                onClick={() => drop(c.id)}
                disabled={busy}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-accent"
                aria-label="Удалить"
              >
                <Icon name="Trash2" size={15} />
              </button>
            </div>
          </li>
        ))}
        {!items.length && (
          <li className="px-5 py-8 text-center text-[0.9rem] text-muted-foreground">
            {loading ? 'Загружаю…' : 'Доступов пока нет'}
          </li>
        )}
      </ul>
    </section>
  );
};

export default CoachAccounts;
