import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { AGE_GROUPS, TEAMS, type AgeGroup } from '@/data/league';
import { useLeague } from '@/context/LeagueContext';
import { saveMatch, type LeagueData } from '@/lib/league-api';

interface Props {
  token: string;
  knownTeams: string[];
  suggestedRound: number;
  onSaved: (data: LeagueData) => void;
  onClose: () => void;
}

const NewMatchForm = ({ token, knownTeams, suggestedRound, onSaved, onClose }: Props) => {
  const { teams: apiTeams } = useLeague();
  const [round, setRound] = useState(String(suggestedRound));
  const [group, setGroup] = useState<AgeGroup>(AGE_GROUPS[0].id);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const teams = useMemo(() => {
    const fromData = knownTeams.filter(Boolean);
    const fromGroup = apiTeams.length
      ? apiTeams.filter((t) => t.age_group === group).map((t) => t.name)
      : TEAMS.filter((t) => t.group === group).map((t) => t.name);
    return Array.from(new Set([...fromGroup, ...fromData])).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [knownTeams, group, apiTeams]);

  const VENUES = useMemo(
    () =>
      Array.from(
        new Set([...(apiTeams.length ? apiTeams : TEAMS).map((t) => t.home).filter(Boolean)]),
      ),
    [apiTeams],
  );

  const submit = async () => {
    setError('');
    if (!round.trim()) return setError('Укажите номер тура');
    if (!date.trim()) return setError('Укажите дату матча');
    if (!time.trim()) return setError('Укажите время начала');
    if (!home.trim() || !away.trim()) return setError('Выберите обе команды');
    if (home.trim() === away.trim()) return setError('Команды должны быть разными');

    setSaving(true);
    try {
      const data = await saveMatch(token, {
        round: Number(round),
        age_group: group,
        match_date: date.trim(),
        match_time: time.trim(),
        venue: venue.trim(),
        home_team: home.trim(),
        away_team: away.trim(),
        home_goals: null,
        away_goals: null,
        referee: '',
        played: false,
        goals: [],
        cards: [],
      });
      onSaved(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать матч');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-[var(--radius)] bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Расписание</p>
          <h3 className="mt-1.5 font-head text-[1.3rem] font-bold tracking-[-0.02em]">
            Новый матч
          </h3>
        </div>
        <button
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          aria-label="Закрыть"
        >
          <Icon name="X" size={16} />
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="eyebrow mb-2 block">Тур</label>
          <Input
            inputMode="numeric"
            value={round}
            onChange={(e) => setRound(e.target.value.replace(/\D/g, ''))}
            placeholder="7"
            className="bg-secondary/60"
          />
        </div>

        <div>
          <label className="eyebrow mb-2 block">Возрастная группа</label>
          <div className="flex gap-2">
            {AGE_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGroup(g.id)}
                className={cn(
                  'flex-1 rounded-full px-3 py-2 text-[0.8rem] font-semibold transition-colors',
                  group === g.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                {g.short}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="eyebrow mb-2 block">Дата</label>
          <Input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="сб, 20 сентября"
            className="bg-secondary/60"
          />
        </div>

        <div>
          <label className="eyebrow mb-2 block">Время</label>
          <Input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="12:00"
            className="bg-secondary/60"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="eyebrow mb-2 block">Стадион</label>
        <Input
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="Стадион «Сокол», поле №2"
          className="bg-secondary/60"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {VENUES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVenue(v)}
              className={cn(
                'rounded-full px-3 py-1.5 text-[0.76rem] font-medium transition-colors',
                venue === v
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {([
          { label: 'Хозяева', value: home, set: setHome, exclude: away },
          { label: 'Гости', value: away, set: setAway, exclude: home },
        ] as const).map((f) => (
          <div key={f.label}>
            <label className="eyebrow mb-2 block">{f.label}</label>
            <Input
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              placeholder="Название команды"
              className="bg-secondary/60"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {teams
                .filter((t) => t !== f.exclude)
                .map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => f.set(t)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-[0.76rem] font-medium transition-colors',
                      f.value === t
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-[0.85rem] text-accent">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={submit} disabled={saving} className="rounded-full">
          {saving ? 'Создаю…' : 'Добавить в расписание'}
        </Button>
        <Button variant="secondary" onClick={onClose} className="rounded-full">
          Отмена
        </Button>
      </div>
    </div>
  );
};

export default NewMatchForm;