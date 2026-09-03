import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { saveMatch, type ApiMatch, type LeagueData } from '@/lib/league-api';

interface GoalRow {
  minute: string;
  player: string;
  assist: string;
  side: 'home' | 'away';
  penalty: boolean;
}

interface CardRow {
  minute: string;
  player: string;
  side: 'home' | 'away';
  color: 'yellow' | 'red';
}

interface Props {
  match: ApiMatch;
  token: string;
  onSaved: (data: LeagueData) => void;
  onClose: () => void;
}

const MatchEditor = ({ match, token, onSaved, onClose }: Props) => {
  const [homeGoals, setHomeGoals] = useState(match.home_goals?.toString() ?? '');
  const [awayGoals, setAwayGoals] = useState(match.away_goals?.toString() ?? '');
  const [referee, setReferee] = useState(match.referee ?? '');
  const [goals, setGoals] = useState<GoalRow[]>(
    (match.goals || []).map((g) => ({
      minute: String(g.minute),
      player: g.player,
      assist: g.assist ?? '',
      side: g.side,
      penalty: !!g.penalty,
    })),
  );
  const [cards, setCards] = useState<CardRow[]>(
    (match.cards || []).map((c) => ({
      minute: String(c.minute),
      player: c.player,
      side: c.side,
      color: c.color,
    })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const teamName = (side: 'home' | 'away') => (side === 'home' ? match.home_team : match.away_team);

  const save = async () => {
    setError('');
    if (homeGoals === '' || awayGoals === '') {
      setError('Укажите счёт матча');
      return;
    }
    setSaving(true);
    try {
      const data = await saveMatch(token, {
        id: match.id,
        home_goals: Number(homeGoals),
        away_goals: Number(awayGoals),
        referee,
        venue: match.venue,
        match_date: match.match_date,
        match_time: match.match_time,
        played: true,
        goals: goals
          .filter((g) => g.player.trim())
          .map((g) => ({
            minute: Number(g.minute) || 0,
            player: g.player.trim(),
            assist: g.assist.trim(),
            side: g.side,
            penalty: g.penalty,
          })),
        cards: cards
          .filter((c) => c.player.trim())
          .map((c) => ({
            minute: Number(c.minute) || 0,
            player: c.player.trim(),
            side: c.side,
            color: c.color,
          })),
      });
      onSaved(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-[var(--radius)] bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">
            {match.round} тур · {match.match_date} · {match.age_group} г.р.
          </p>
          <h3 className="mt-1.5 font-head text-[1.3rem] font-bold tracking-[-0.02em]">
            {match.home_team} — {match.away_team}
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

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div>
          <label className="eyebrow mb-2 block">{match.home_team}</label>
          <Input
            inputMode="numeric"
            value={homeGoals}
            onChange={(e) => setHomeGoals(e.target.value.replace(/\D/g, ''))}
            placeholder="0"
            className="bg-secondary/60 text-center font-head text-[1.3rem] font-bold"
          />
        </div>
        <span className="pb-2.5 text-center text-muted-foreground">:</span>
        <div>
          <label className="eyebrow mb-2 block">{match.away_team}</label>
          <Input
            inputMode="numeric"
            value={awayGoals}
            onChange={(e) => setAwayGoals(e.target.value.replace(/\D/g, ''))}
            placeholder="0"
            className="bg-secondary/60 text-center font-head text-[1.3rem] font-bold"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="eyebrow mb-2 block">Судья</label>
        <Input
          value={referee}
          onChange={(e) => setReferee(e.target.value)}
          placeholder="А. Кузнецов"
          className="bg-secondary/60"
        />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Голы</p>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full"
            onClick={() =>
              setGoals((g) => [...g, { minute: '', player: '', assist: '', side: 'home', penalty: false }])
            }
          >
            <Icon name="Plus" size={14} className="mr-1" />
            Гол
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {goals.map((g, i) => (
            <div key={i} className="grid grid-cols-[64px_1fr_auto] gap-2 sm:grid-cols-[64px_1fr_1fr_auto]">
              <Input
                inputMode="numeric"
                value={g.minute}
                onChange={(e) =>
                  setGoals((rows) =>
                    rows.map((r, j) => (j === i ? { ...r, minute: e.target.value.replace(/\D/g, '') } : r)),
                  )
                }
                placeholder="мин"
                className="bg-secondary/60 text-center"
              />
              <Input
                value={g.player}
                onChange={(e) =>
                  setGoals((rows) => rows.map((r, j) => (j === i ? { ...r, player: e.target.value } : r)))
                }
                placeholder="Автор гола"
                className="bg-secondary/60"
              />
              <Input
                value={g.assist}
                onChange={(e) =>
                  setGoals((rows) => rows.map((r, j) => (j === i ? { ...r, assist: e.target.value } : r)))
                }
                placeholder="Пас (необязательно)"
                className="hidden bg-secondary/60 sm:block"
              />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setGoals((rows) =>
                      rows.map((r, j) => (j === i ? { ...r, side: r.side === 'home' ? 'away' : 'home' } : r)),
                    )
                  }
                  className="max-w-[128px] truncate rounded-full bg-secondary px-3 py-2 text-[0.78rem] font-semibold hover:bg-secondary/70"
                  title="Переключить команду"
                >
                  {teamName(g.side)}
                </button>
                <button
                  onClick={() =>
                    setGoals((rows) => rows.map((r, j) => (j === i ? { ...r, penalty: !r.penalty } : r)))
                  }
                  className={cn(
                    'rounded-full px-2.5 py-2 text-[0.75rem] font-semibold',
                    g.penalty ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground',
                  )}
                  title="Пенальти"
                >
                  пен
                </button>
                <button
                  onClick={() => setGoals((rows) => rows.filter((_, j) => j !== i))}
                  className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-accent"
                  aria-label="Удалить"
                >
                  <Icon name="Trash2" size={15} />
                </button>
              </div>
            </div>
          ))}
          {!goals.length && (
            <p className="text-[0.85rem] text-muted-foreground">Голов пока не добавлено.</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Карточки</p>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full"
            onClick={() => setCards((c) => [...c, { minute: '', player: '', side: 'home', color: 'yellow' }])}
          >
            <Icon name="Plus" size={14} className="mr-1" />
            Карточка
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {cards.map((c, i) => (
            <div key={i} className="grid grid-cols-[64px_1fr_auto] gap-2">
              <Input
                inputMode="numeric"
                value={c.minute}
                onChange={(e) =>
                  setCards((rows) =>
                    rows.map((r, j) => (j === i ? { ...r, minute: e.target.value.replace(/\D/g, '') } : r)),
                  )
                }
                placeholder="мин"
                className="bg-secondary/60 text-center"
              />
              <Input
                value={c.player}
                onChange={(e) =>
                  setCards((rows) => rows.map((r, j) => (j === i ? { ...r, player: e.target.value } : r)))
                }
                placeholder="Игрок"
                className="bg-secondary/60"
              />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setCards((rows) =>
                      rows.map((r, j) => (j === i ? { ...r, side: r.side === 'home' ? 'away' : 'home' } : r)),
                    )
                  }
                  className="max-w-[128px] truncate rounded-full bg-secondary px-3 py-2 text-[0.78rem] font-semibold hover:bg-secondary/70"
                >
                  {teamName(c.side)}
                </button>
                <button
                  onClick={() =>
                    setCards((rows) =>
                      rows.map((r, j) => (j === i ? { ...r, color: r.color === 'yellow' ? 'red' : 'yellow' } : r)),
                    )
                  }
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-full',
                    c.color === 'yellow' ? 'bg-yellow-400/20' : 'bg-accent/20',
                  )}
                  title="Жёлтая / красная"
                >
                  <span
                    className={cn('h-4 w-2.5 rounded-[2px]', c.color === 'yellow' ? 'bg-yellow-400' : 'bg-accent')}
                  />
                </button>
                <button
                  onClick={() => setCards((rows) => rows.filter((_, j) => j !== i))}
                  className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-accent"
                  aria-label="Удалить"
                >
                  <Icon name="Trash2" size={15} />
                </button>
              </div>
            </div>
          ))}
          {!cards.length && (
            <p className="text-[0.85rem] text-muted-foreground">Карточек пока не добавлено.</p>
          )}
        </div>
      </div>

      {error && <p className="mt-4 text-[0.85rem] text-accent">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={save} disabled={saving} className="rounded-full">
          {saving ? 'Сохраняю…' : 'Сохранить протокол'}
        </Button>
        <Button variant="secondary" onClick={onClose} className="rounded-full">
          Отмена
        </Button>
      </div>
    </div>
  );
};

export default MatchEditor;
