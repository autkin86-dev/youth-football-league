import type { ApiMatch, SquadPlayer } from '@/lib/league-api';

const esc = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const emptyRows = (count: number, cols: number) =>
  Array.from({ length: count })
    .map(
      () =>
        `<tr>${Array.from({ length: cols })
          .map(() => '<td style="height:22px">&nbsp;</td>')
          .join('')}</tr>`,
    )
    .join('');

const squadTable = (title: string, players: SquadPlayer[]) => {
  const filled = players
    .map(
      (p) =>
        `<tr><td style="text-align:center">${p.number || ''}</td><td>${esc(p.name)}</td><td>${esc(
          p.position,
        )}</td><td></td><td></td><td></td></tr>`,
    )
    .join('');
  const extra = emptyRows(Math.max(4, 16 - players.length), 6);

  return `
  <p class="h2">${esc(title)}</p>
  <table class="grid">
    <tr class="head">
      <th style="width:8%">№</th>
      <th style="width:38%">Фамилия, имя</th>
      <th style="width:22%">Амплуа</th>
      <th style="width:12%">Голы</th>
      <th style="width:10%">ЖК</th>
      <th style="width:10%">КК</th>
    </tr>
    ${filled}${extra}
  </table>`;
};

export const buildProtocolDoc = (match: ApiMatch, squad: SquadPlayer[]) => {
  const home = squad.filter((p) => p.team === match.home_team).sort((a, b) => a.number - b.number);
  const away = squad.filter((p) => p.team === match.away_team).sort((a, b) => a.number - b.number);

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>Протокол матча</title>
<style>
  @page { size: A4; margin: 1.6cm 1.4cm; }
  body { font-family: "Times New Roman", serif; font-size: 11pt; color: #000; }
  .title { font-size: 15pt; font-weight: bold; text-align: center; margin: 0 0 2pt; }
  .sub { text-align: center; font-size: 10pt; margin: 0 0 14pt; }
  .h2 { font-size: 12pt; font-weight: bold; margin: 14pt 0 5pt; }
  table { border-collapse: collapse; width: 100%; }
  table.info td { padding: 4pt 6pt; font-size: 11pt; border-bottom: 1px solid #000; }
  table.info td.label { width: 26%; border-bottom: none; font-weight: bold; }
  table.grid th, table.grid td { border: 1px solid #000; padding: 3pt 5pt; font-size: 10.5pt; }
  table.grid th { background: #eee; font-size: 9.5pt; text-transform: uppercase; }
  .score { text-align: center; font-size: 13pt; font-weight: bold; margin: 10pt 0; }
  .sign td { padding-top: 22pt; font-size: 10pt; }
  .line { border-bottom: 1px solid #000; display: inline-block; width: 62%; }
</style>
</head>
<body>
  <p class="title">ПРОТОКОЛ МАТЧА</p>
  <p class="sub">Первенство детско-юношеских команд по футболу САО г. Москвы · сезон 25/26</p>

  <table class="info">
    <tr><td class="label">Тур</td><td>${match.round}</td></tr>
    <tr><td class="label">Возрастная группа</td><td>${esc(match.age_group)} г.р.</td></tr>
    <tr><td class="label">Дата и время</td><td>${esc(match.match_date)}${
      match.match_time ? `, ${esc(match.match_time)}` : ''
    }</td></tr>
    <tr><td class="label">Стадион</td><td>${esc(match.venue)}</td></tr>
    <tr><td class="label">Команда хозяев</td><td>${esc(match.home_team)}</td></tr>
    <tr><td class="label">Команда гостей</td><td>${esc(match.away_team)}</td></tr>
    <tr><td class="label">Судья</td><td>${esc(match.referee)}</td></tr>
  </table>

  <p class="score">ИТОГОВЫЙ СЧЁТ: ${esc(match.home_team)} ____ : ____ ${esc(match.away_team)}</p>

  ${squadTable(`Состав команды «${match.home_team}»`, home)}
  ${squadTable(`Состав команды «${match.away_team}»`, away)}

  <p class="h2">Голы</p>
  <table class="grid">
    <tr class="head">
      <th style="width:12%">Минута</th>
      <th style="width:34%">Автор гола</th>
      <th style="width:34%">Голевая передача</th>
      <th style="width:20%">Команда</th>
    </tr>
    ${emptyRows(12, 4)}
  </table>

  <p class="h2">Предупреждения и удаления</p>
  <table class="grid">
    <tr class="head">
      <th style="width:12%">Минута</th>
      <th style="width:38%">Игрок</th>
      <th style="width:25%">Команда</th>
      <th style="width:25%">ЖК / КК</th>
    </tr>
    ${emptyRows(6, 4)}
  </table>

  <p class="h2">Замечания судьи</p>
  <table class="grid">${emptyRows(3, 1)}</table>

  <table class="sign">
    <tr>
      <td>Судья матча: <span class="line">&nbsp;</span></td>
    </tr>
    <tr>
      <td>Тренер «${esc(match.home_team)}»: <span class="line">&nbsp;</span></td>
    </tr>
    <tr>
      <td>Тренер «${esc(match.away_team)}»: <span class="line">&nbsp;</span></td>
    </tr>
  </table>
</body>
</html>`;

  return html;
};

export const downloadProtocolDoc = (match: ApiMatch, squad: SquadPlayer[]) => {
  const html = buildProtocolDoc(match, squad);
  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safe = (s: string) => s.replace(/[^\wа-яА-ЯёЁ-]+/gi, '_');
  a.href = url;
  a.download = `Протокол_${match.round}тур_${safe(match.home_team)}_${safe(match.away_team)}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
