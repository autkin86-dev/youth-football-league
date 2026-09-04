import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { TEAMS } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';
import { removePlayer, savePlayer, type SquadPlayer } from '@/lib/league-api';

const POSITIONS = ['Вратарь', 'Защитник', 'Полузащитник', 'Нападающий'];

interface Props {
  token: string;
}

const SquadEditor = ({ token }: Props) => {
  const { squad, applyData } = useLeague();
  const teams = useMemo(() => {
    const fromSquad = Array.from(new Set(squad.map((p) => p.team)));
    return Array.from(new Set([...TEAMS.map((t) => t.name), ...fromSquad]));
  }, [squad]);

  const [team, setTeam] = useState(teams[0] ?? '');
  const [editing, setEditing] = useState<SquadPlayer | null>(null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [position, setPosition] = useState(POSITIONS[2]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const list = squad.filter((p) => p.team === team).sort((a, b) => a.number - b.number);

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
      const data = await savePlayer(token, {
        id: editing?.id,
        team,
        age_group: '2013',
        name: name.trim(),
        number: Number(number) || 0,
        position,
      });
      applyData(data);
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
      applyData(await removePlayer(token, id));
      if (editing?.id === id) reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-10">
      <h2 className="mb-4 font-head text-[1.5rem] font-bold tracking-[-0.03em]">Составы команд</h2>

      <div className="mb-4 flex flex-wrap gap-2">
        {teams.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTeam(t);
              reset();
            }}
            className={cn(
              'rounded-full px-4 py-2 text-[0.84rem] font-semibold transition-colors',
              team === t
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] bg-card">
          {list.map((p) => (
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
          {!list.length && (
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
    </section>
  );
};

export default SquadEditor;
