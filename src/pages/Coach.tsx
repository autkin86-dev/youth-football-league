import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { SEASON } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';
import { coachLogin, removePlayer, savePlayer, type CoachSession, type SquadPlayer } from '@/lib/league-api';
import { teamSlug } from '@/pages/Team';

const POSITIONS = ['Вратарь', 'Защитник', 'Полузащитник', 'Нападающий'];
const STORAGE = 'sao_coach_session';

const CoachLogin = ({ onSuccess }: { onSuccess: (s: CoachSession) => void }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await coachLogin(login.trim(), password);
      localStorage.setItem(STORAGE, JSON.stringify(session));
      onSuccess(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-vignette grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="glow-pitch w-full max-w-[380px] rounded-[var(--radius)] p-7" noValidate>
        <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-accent text-accent-foreground">
          <Icon name="Users" size={20} />
        </span>
        <h1 className="mt-5 font-head text-[1.6rem] font-bold tracking-[-0.03em]">Кабинет тренера</h1>
        <p className="mt-2 text-[0.9rem] text-muted-foreground">
          Заявка и состав вашей команды, {SEASON}.
        </p>

        <label className="eyebrow mb-2 mt-6 block">Логин</label>
        <Input
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="dinamo"
          className="bg-secondary/60"
          autoFocus
        />

        <label className="eyebrow mb-2 mt-4 block">Пароль</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="bg-secondary/60"
        />

        {error && <p className="mt-2 text-[0.8rem] text-accent">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-5 w-full rounded-full">
          {loading ? 'Проверяю…' : 'Войти'}
        </Button>

        <Link
          to="/"
          className="mt-4 flex items-center justify-center gap-1.5 text-[0.84rem] text-muted-foreground hover:text-foreground"
        >
          <Icon name="ArrowLeft" size={14} />
          На сайт первенства
        </Link>
      </form>
    </div>
  );
};

const Coach = () => {
  const [session, setSession] = useState<CoachSession | null>(null);
  const { squad, applyData, reload } = useLeague();

  const [editing, setEditing] = useState<SquadPlayer | null>(null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [position, setPosition] = useState(POSITIONS[2]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE);
    if (raw) {
      try {
        setSession(JSON.parse(raw));
      } catch {
        localStorage.removeItem(STORAGE);
      }
    }
  }, []);

  if (!session) return <CoachLogin onSuccess={setSession} />;

  const players = squad.filter((p) => p.team === session.team).sort((a, b) => a.number - b.number);

  const reset = () => {
    setEditing(null);
    setName('');
    setNumber('');
    setPosition(POSITIONS[2]);
    setError('');
  };

  const startEdit = (p: SquadPlayer) => {
    setEditing(p);
    setName(p.name);
    setNumber(String(p.number));
    setPosition(p.position);
    setError('');
  };

  const submit = async () => {
    setError('');
    if (name.trim().length < 2) return setError('Укажите фамилию и имя игрока');
    setBusy(true);
    try {
      applyData(
        await savePlayer(session.token, {
          id: editing?.id,
          team: session.team,
          name: name.trim(),
          number: Number(number) || 0,
          position,
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
      applyData(await removePlayer(session.token, id));
      if (editing?.id === id) reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить');
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE);
    setSession(null);
    reload();
  };

  return (
    <div className="screen-vignette min-h-screen">
      <div className="mx-auto w-full max-w-[1180px] px-5 pb-20 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 py-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-accent text-accent-foreground">
              <Icon name="Users" size={17} />
            </span>
            <span className="font-head text-[1.06rem] font-bold tracking-[-0.015em]">
              {session.team}
            </span>
            <span className="hidden rounded-full bg-secondary px-2 py-[3px] text-[0.68rem] font-semibold text-muted-foreground sm:inline">
              кабинет тренера
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/team/${teamSlug(session.team)}`}
              className="rounded-full bg-secondary px-4 py-2 text-[0.85rem] font-semibold text-muted-foreground hover:text-foreground"
            >
              Страница команды
            </Link>
            <button
              onClick={logout}
              className="rounded-full bg-primary px-4 py-2 text-[0.85rem] font-semibold text-primary-foreground"
            >
              Выйти
            </button>
          </div>
        </header>

        <section className="mt-6">
          <h1 className="font-head text-[1.7rem] font-bold tracking-[-0.03em]">Состав команды</h1>
          <p className="mt-2 text-[0.88rem] text-muted-foreground">
            Добавляйте и правьте игроков своей команды. Результаты матчей вносит судейский комитет.
          </p>
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
          <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] bg-card">
            {players.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                <span className="tabnum grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-[0.8rem] font-bold">
                  {p.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.92rem] font-medium">{p.name}</span>
                  <span className="block text-[0.76rem] text-muted-foreground">
                    {p.position} · {p.goals} гол · {p.assists} пас
                  </span>
                </span>
                <button
                  onClick={() => startEdit(p)}
                  className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                  aria-label="Изменить"
                >
                  <Icon name="Pencil" size={15} />
                </button>
                <button
                  onClick={() => drop(p.id)}
                  disabled={busy}
                  className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-accent"
                  aria-label="Удалить"
                >
                  <Icon name="Trash2" size={15} />
                </button>
              </li>
            ))}
            {!players.length && (
              <li className="px-5 py-8 text-center text-[0.9rem] text-muted-foreground">
                В составе пока нет игроков
              </li>
            )}
          </ul>

          <div className="h-fit rounded-[var(--radius)] bg-card p-5">
            <p className="eyebrow">{editing ? 'Изменить игрока' : 'Новый игрок'}</p>

            <label className="eyebrow mb-2 mt-4 block">Фамилия и имя</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Головин Матвей"
              className="bg-secondary/60"
            />

            <label className="eyebrow mb-2 mt-4 block">Игровой номер</label>
            <Input
              inputMode="numeric"
              value={number}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 2))}
              placeholder="9"
              className="bg-secondary/60"
            />

            <label className="eyebrow mb-2 mt-4 block">Амплуа</label>
            <div className="flex flex-wrap gap-1.5">
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPosition(p)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[0.78rem] font-medium transition-colors',
                    position === p
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            {error && <p className="mt-3 text-[0.82rem] text-accent">{error}</p>}

            <div className="mt-5 flex gap-2">
              <Button onClick={submit} disabled={busy} className="flex-1 rounded-full">
                {editing ? 'Сохранить' : 'Добавить'}
              </Button>
              {editing && (
                <Button variant="secondary" onClick={reset} className="rounded-full">
                  Отмена
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coach;
