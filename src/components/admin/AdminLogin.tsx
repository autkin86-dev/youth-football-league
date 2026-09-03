import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { adminLogin } from '@/lib/league-api';

interface Props {
  onSuccess: (token: string) => void;
}

const AdminLogin = ({ onSuccess }: Props) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await adminLogin(password);
      localStorage.setItem('sao_admin_token', token);
      onSuccess(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-vignette grid min-h-screen place-items-center px-5">
      <form
        onSubmit={submit}
        className="glow-pitch w-full max-w-[380px] rounded-[var(--radius)] p-7"
        noValidate
      >
        <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-accent text-accent-foreground">
          <Icon name="Lock" size={20} />
        </span>
        <h1 className="mt-5 font-head text-[1.6rem] font-bold tracking-[-0.03em]">
          Админ-раздел
        </h1>
        <p className="mt-2 text-[0.9rem] text-muted-foreground">
          Внесение результатов и протоколов первенства САО.
        </p>

        <label className="eyebrow mb-2 mt-6 block">Пароль</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="bg-secondary/60"
          autoFocus
        />
        {error && <p className="mt-2 text-[0.8rem] text-accent">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-5 w-full rounded-full">
          {loading ? 'Проверяю…' : 'Войти'}
        </Button>

        <a
          href="/"
          className="mt-4 flex items-center justify-center gap-1.5 text-[0.84rem] text-muted-foreground hover:text-foreground"
        >
          <Icon name="ArrowLeft" size={14} />
          На сайт первенства
        </a>
      </form>
    </div>
  );
};

export default AdminLogin;
