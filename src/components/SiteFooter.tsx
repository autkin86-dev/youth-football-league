import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { SEASON } from '@/data/league';

const SiteFooter = () => (
  <footer className="mt-8 border-t border-border py-10">
    <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-accent text-accent-foreground">
            <Icon name="Trophy" size={17} />
          </span>
          <span className="font-head text-[1.06rem] font-bold tracking-[-0.015em]">
            Первенство САО
          </span>
        </div>
        <p className="mt-4 max-w-sm text-[0.86rem] leading-relaxed text-muted-foreground">
          Первенство детско-юношеских команд по футболу Северного административного округа Москвы.
          Организатор — Управление по развитию массового спорта в САО, ГБУ «Мосгорспорт».
        </p>
      </div>

      <div>
        <p className="eyebrow">Разделы</p>
        <ul className="mt-4 space-y-2 text-[0.88rem] text-muted-foreground">
          {[
            ['obshiy-zachet', 'Общий зачёт'],
            ['tablo', 'Турнирная таблица'],
            ['raspisanie', 'Расписание'],
            ['rezultaty', 'Результаты и протоколы'],
            ['komandy', 'Команды и составы'],
            ['igroki', 'Статистика игроков'],
          ].map(([id, label]) => (
            <li key={id}>
              <Link
                to={`/?s=${id}`}
                className="story-link transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="eyebrow">Контакты</p>
        <ul className="mt-4 space-y-2.5 text-[0.88rem] text-muted-foreground">
          <li className="flex items-center gap-2">
            <Icon name="Send" size={14} />
            <a
              href="https://t.me/ChampionSAO"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              t.me/ChampionSAO
            </a>
          </li>
          <li className="flex items-center gap-2">
            <Icon name="MapPin" size={14} /> Москва, САО
          </li>
          <li className="flex items-center gap-2">
            <Icon name="CalendarDays" size={14} /> {SEASON}
          </li>
        </ul>
      </div>
    </div>

    <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-[0.78rem] text-muted-foreground">
      <p>© 2025—2026 Первенство САО по футболу · ГБУ «Мосгорспорт»</p>
      <span className="flex items-center gap-4">
        <a href="/coach" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
          <Icon name="Users" size={12} />
          Кабинет тренера
        </a>
        <a href="/admin" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
          <Icon name="Lock" size={12} />
          Вход для судей
        </a>
      </span>
    </div>
  </footer>
);

export default SiteFooter;