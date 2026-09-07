import Icon from '@/components/ui/icon';
import { AGE_GROUPS, SEASON } from '@/data/league';

const AboutSection = () => (
  <section className="py-14">
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <p className="eyebrow">О турнире</p>
        <h2 className="mt-2 font-head text-[1.7rem] font-bold tracking-[-0.03em] sm:text-[2.1rem]">
          Первенство САО по футболу
        </h2>
        <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
          Ежегодный турнир детско-юношеских команд по футболу Северного административного округа
          Москвы. В {SEASON} принимают участие 12 команд округа, которые соревнуются в пяти
          возрастных группах — от самых юных футболистов до старших юношей.
        </p>
        <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
          Организатор первенства — Управление по развитию массового спорта в САО,
          ГБУ «Мосгорспорт». На сайте публикуются актуальная турнирная таблица, расписание
          и результаты матчей, составы команд и статистика игроков.
        </p>
      </div>

      <div>
        <p className="eyebrow">Возрастные группы</p>
        <ul className="mt-4 flex flex-col gap-2">
          {AGE_GROUPS.map((g) => (
            <li
              key={g.id}
              className="flex items-center gap-3 rounded-[var(--radius)] bg-card px-4 py-3 text-[0.9rem]"
            >
              <Icon name="Users" size={16} className="shrink-0 text-accent" />
              <span>{g.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

export default AboutSection;