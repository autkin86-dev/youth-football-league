import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { AGE_GROUPS } from '@/data/league';
import { cn } from '@/lib/utils';
import { sendApplication } from '@/lib/league-api';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Errors {
  team?: string;
  coach?: string;
  phone?: string;
}

const DeclareTeamDialog = ({ open, onOpenChange }: Props) => {
  const [team, setTeam] = useState('');
  const [coach, setCoach] = useState('');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState(AGE_GROUPS[2].id);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const next: Errors = {};
    if (team.trim().length < 2) next.team = 'Укажите название команды';
    if (coach.trim().length < 3) next.coach = 'Укажите ФИО тренера';
    if (phone.replace(/\D/g, '').length < 10) next.phone = 'Телефон в формате +7 999 000-00-00';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    try {
      await sendApplication({
        team_name: team.trim(),
        coach: coach.trim(),
        phone: phone.trim(),
        age_group: group,
      });
      setSent(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Не удалось отправить заявку');
    } finally {
      setSending(false);
    }
  };

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v)
      setTimeout(() => {
        setSent(false);
        setTeam('');
        setCoach('');
        setPhone('');
        setErrors({});
        setServerError('');
      }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md border-border bg-card">
        {sent ? (
          <div className="animate-scale-in py-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-win/15 text-win">
              <Icon name="Check" size={26} />
            </span>
            <h3 className="mt-4 font-head text-[1.35rem] font-bold tracking-[-0.02em]">
              Заявка принята
            </h3>
            <p className="mt-2 text-[0.9rem] text-muted-foreground">
              Судейский комитет первенства свяжется с тренером в течение двух рабочих дней.
            </p>
            <Button className="mt-6 rounded-full" onClick={() => close(false)}>
              Понятно
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-left font-head text-[1.3rem] tracking-[-0.02em]">
                Заявить команду
              </DialogTitle>
              <DialogDescription className="text-left">
                Первенство детско-юношеских команд САО, сезон 25/26.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="space-y-4" noValidate>
              <div>
                <label className="eyebrow mb-2 block">Возрастная группа</label>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGroup(g.id)}
                      className={cn(
                        'rounded-full px-3.5 py-2 text-[0.82rem] font-semibold transition-colors',
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
                <label className="eyebrow mb-2 block">Название команды</label>
                <Input
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  placeholder="ФК «Сокол»"
                  className="bg-secondary/60"
                />
                {errors.team && <p className="mt-1.5 text-[0.78rem] text-accent">{errors.team}</p>}
              </div>

              <div>
                <label className="eyebrow mb-2 block">Тренер</label>
                <Input
                  value={coach}
                  onChange={(e) => setCoach(e.target.value)}
                  placeholder="Иванов Иван Иванович"
                  className="bg-secondary/60"
                />
                {errors.coach && <p className="mt-1.5 text-[0.78rem] text-accent">{errors.coach}</p>}
              </div>

              <div>
                <label className="eyebrow mb-2 block">Телефон</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 999 000-00-00"
                  className="bg-secondary/60"
                />
                {errors.phone && <p className="mt-1.5 text-[0.78rem] text-accent">{errors.phone}</p>}
              </div>

              {serverError && <p className="text-[0.8rem] text-accent">{serverError}</p>}

              <Button type="submit" disabled={sending} className="w-full rounded-full">
                {sending ? 'Отправляю…' : 'Отправить заявку'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeclareTeamDialog;