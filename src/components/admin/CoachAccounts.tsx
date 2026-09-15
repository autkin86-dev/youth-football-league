import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { AGE_GROUPS } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';
import {
  fetchCoaches,
  removeCoach,
  saveCoach,
  bulkCreateCoaches,
  resetCoachPassword,
  type CoachAccount,
  type CreatedCoach,
} from '@/lib/league-api';
import { downloadCoachCredsDoc } from '@/lib/coach-doc';

interface Props {
  token: string;
}

const CoachAccounts = ({ token }: Props) => {
  const { teams: apiTeams } = useLeague();

  const teamNames = useMemo(
    () => Array.from(new Set(apiTeams.map((t) => t.name))).sort((a, b) => a.localeCompare(b)),
    [apiTeams],
  );

  const groupsByTeam = useMemo(() => {
    const map = new Map<string, string[]>();
    apiTeams.forEach((t) => {
      const list = map.get(t.name) ?? [];
      if (!list.includes(t.age_group)) list.push(t.age_group);
      map.set(t.name, list);
    });
    return map;
  }, [apiTeams]);

  const [items, setItems] = useState<CoachAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CoachAccount | null>(null);
  const [login, setLogin] = useState('');
  const [team, setTeam] = useState('');
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [coachName, setCoachName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [pending, setPending] = useState<CreatedCoach[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [resettingId, setResettingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCoaches(token)
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [token]);

  const teamsWithoutAccess = useMemo(() => {
    const has = new Set(items.map((c) => c.team));
    return teamNames.filter((t) => !has.has(t));
  }, [teamNames, items]);

  const createAll = async () => {
    setError('');
    setBulkBusy(true);
    try {
      const { coaches, created } = await bulkCreateCoaches(token);
      setItems(coaches);
      setPending((prev) => [...prev, ...created]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать доступы');
    } finally {
      setBulkBusy(false);
    }
  };

  const resetPassword = async (c: CoachAccount) => {
    setError('');
    setResettingId(c.id);
    try {
      const { login: l, password: p } = await resetCoachPassword(token, c.id);
      setPending((prev) => [
        ...prev.filter((x) => x.id !== c.id),
        { id: c.id, team: c.team, age_groups: c.age_groups, login: l, password: p },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сбросить пароль');
    } finally {
      setResettingId(null);
    }
  };

  useEffect(() => {
    if (teamNames.length && !team) setTeam(teamNames[0]);
  }, [teamNames, team]);

  useEffect(() => {
    if (editing) return;
    setAgeGroups(groupsByTeam.get(team) ?? []);
  }, [team, groupsByTeam, editing]);

  const toggleGroup = (id: string) => {
    setAgeGroups((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  };

  const reset = () => {
    setOpen(false);
    setEditing(null);
    setLogin('');
    setCoachName('');
    setPassword('');
    setTeam(teamNames[0] ?? '');
    setError('');
  };

  const startEdit = (c: CoachAccount) => {
    setEditing(c);
    setLogin(c.login);
    setTeam(c.team);
    setAgeGroups(c.age_groups);
    setCoachName(c.coach_name);
    setPassword('');
    setOpen(true);
    setError('');
  };

  const submit = async () => {
    setError('');
    if (login.trim().length < 3) return setError('Логин минимум 3 символа');
    if (!team) return setError('Выберите команду');
    if (!ageGroups.length) return setError('Выберите хотя бы одну возрастную группу');
    if (!editing && password.length < 4) return setError('Пароль минимум 4 символа');
    setBusy(true);
    try {
      setItems(
        await saveCoach(token, {
          id: editing?.id,
          login: login.trim().toLowerCase(),
          team,
          age_groups: ageGroups,
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
            Один тренер — один клуб, доступ сразу ко всем его возрастным группам. Вход на /coach.
          </p>
        </div>
        {!open && (
          <div className="flex flex-wrap gap-2">
            {teamsWithoutAccess.length > 0 && (
              <button
                onClick={createAll}
                disabled={bulkBusy}
                className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.85rem] font-semibold text-primary-foreground transition-transform hover:scale-[1.03] disabled:opacity-50"
              >
                <Icon name="KeyRound" size={14} />
                {bulkBusy ? 'Создаю…' : `Создать доступы (${teamsWithoutAccess.length})`}
              </button>
            )}
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
          </div>
        )}
      </div>

      {pending.length > 0 && (
        <div className="mb-4 rounded-[var(--radius)] bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Новые пароли — сохраните сейчас</p>
              <p className="mt-1 text-[0.83rem] text-muted-foreground">
                Пароли показываются один раз. Скачайте документ или скопируйте, прежде чем закрыть список.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadCoachCredsDoc(pending)}
                className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[0.82rem] font-semibold text-accent-foreground transition-transform hover:scale-[1.03]"
              >
                <Icon name="FileDown" size={14} />
                Скачать документ
              </button>
              <button
                onClick={() => setPending([])}
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                aria-label="Скрыть"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>

          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-[var(--radius)] bg-secondary/40">
            {pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-[0.85rem]">
                <span className="min-w-[140px] font-semibold">{p.team}</span>
                <span className="text-muted-foreground">
                  {p.age_groups.map(groupLabel).join(', ')}
                </span>
                <span className="tabnum ml-auto">
                  логин: <b>{p.login}</b>
                </span>
                <span className="tabnum">
                  пароль: <b>{p.password}</b>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

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

          <label className="eyebrow mb-2 mt-4 block">Команда</label>
          <div className="flex flex-wrap gap-1.5">
            {teamNames.map((t) => (
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

          <label className="eyebrow mb-2 mt-4 block">Возрастные группы клуба</label>
          <div className="flex flex-wrap gap-1.5">
            {(groupsByTeam.get(team) ?? []).map((id) => (
              <button
                key={id}
                onClick={() => toggleGroup(id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[0.78rem] font-medium transition-colors',
                  ageGroups.includes(id)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                {groupLabel(id)}
              </button>
            ))}
            {!(groupsByTeam.get(team) ?? []).length && (
              <p className="text-[0.8rem] text-muted-foreground">У этой команды пока нет возрастных групп</p>
            )}
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
                {c.age_groups.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-secondary px-2.5 py-1 text-[0.7rem] font-semibold text-muted-foreground"
                  >
                    {groupLabel(g)}
                  </span>
                ))}
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
                onClick={() => resetPassword(c)}
                disabled={resettingId === c.id}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-[0.82rem] font-semibold transition-colors hover:bg-secondary/70 disabled:opacity-50"
              >
                <Icon name="KeyRound" size={14} />
                {resettingId === c.id ? 'Сбрасываю…' : 'Новый пароль'}
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
