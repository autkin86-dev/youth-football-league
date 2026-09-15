import { AGE_GROUPS } from '@/data/league';

interface CoachCred {
  team: string;
  age_group: string;
  login: string;
  password: string;
}

const esc = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const groupLabel = (id: string) => AGE_GROUPS.find((g) => g.id === id)?.short ?? id;

const DOC_STYLE = `
  @page { size: A4; margin: 1.6cm 1.4cm; }
  body { font-family: "Times New Roman", serif; font-size: 11pt; color: #000; }
  .title { font-size: 15pt; font-weight: bold; text-align: center; margin: 0 0 2pt; }
  .sub { text-align: center; font-size: 10pt; margin: 0 0 14pt; }
  table { border-collapse: collapse; width: 100%; margin-top: 8pt; }
  table.grid th, table.grid td { border: 1px solid #000; padding: 5pt 7pt; font-size: 11pt; }
  table.grid th { background: #eee; font-size: 10pt; text-transform: uppercase; }
  .note { font-size: 9.5pt; color: #444; margin-top: 10pt; }
`;

const wrapDoc = (title: string, body: string) => `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<style>${DOC_STYLE}</style>
</head>
<body>
${body}
</body>
</html>`;

export const buildCoachCredsDoc = (creds: CoachCred[]) => {
  const sorted = [...creds].sort((a, b) => a.age_group.localeCompare(b.age_group) || a.team.localeCompare(b.team));
  const rows = sorted
    .map(
      (c) =>
        `<tr><td>${esc(c.team)}</td><td>${esc(groupLabel(c.age_group))}</td><td>${esc(c.login)}</td><td>${esc(c.password)}</td></tr>`,
    )
    .join('');

  return wrapDoc(
    'Доступы тренеров',
    `
    <p class="title">ДОСТУПЫ ТРЕНЕРОВ В ЛИЧНЫЙ КАБИНЕТ</p>
    <p class="sub">Первенство САО по футболу · страница входа: /coach</p>
    <table class="grid">
      <tr>
        <th style="width:34%">Команда</th>
        <th style="width:18%">Возраст</th>
        <th style="width:24%">Логин</th>
        <th style="width:24%">Пароль</th>
      </tr>
      ${rows}
    </table>
    <p class="note">Рекомендуется передать тренеру индивидуально и попросить сменить пароль после первого входа.</p>
  `,
  );
};

const saveDoc = (html: string, filename: string) => {
  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const downloadCoachCredsDoc = (creds: CoachCred[]) =>
  saveDoc(buildCoachCredsDoc(creds), `Доступы_тренеров_${creds.length}.doc`);
