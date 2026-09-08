import json
import os
import hashlib
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
}


def esc(v):
    return str(v).replace("'", "''")


def token_for(password: str) -> str:
    return hashlib.sha256(('sao-league:' + password).encode()).hexdigest()


def is_admin(event) -> bool:
    headers = event.get('headers') or {}
    got = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    real = os.environ.get('ADMIN_PASSWORD', '')
    return bool(real) and got == token_for(real)


def coach_token(login: str, password: str) -> str:
    return hashlib.sha256(f'sao-coach:{login}:{password}'.encode()).hexdigest()


def get_token(event) -> str:
    headers = event.get('headers') or {}
    return headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''


def coach_by_token(cur, event):
    """Возвращает аккаунт тренера по токену или None."""
    got = get_token(event)
    if not got:
        return None
    cur.execute(f"SELECT * FROM coach_accounts WHERE password_hash='{esc(got)}' AND active = TRUE")
    row = cur.fetchone()
    return dict(row) if row else None


def conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def load_all(cur):
    cur.execute('SELECT * FROM matches WHERE active = TRUE ORDER BY round DESC, id ASC')
    matches = [dict(r) for r in cur.fetchall()]
    cur.execute('SELECT * FROM match_goals WHERE active = TRUE ORDER BY minute ASC')
    goals = [dict(r) for r in cur.fetchall()]
    cur.execute('SELECT * FROM match_cards WHERE active = TRUE ORDER BY minute ASC')
    cards = [dict(r) for r in cur.fetchall()]

    by_id = {}
    for m in matches:
        m['goals'] = []
        m['cards'] = []
        by_id[m['id']] = m
    for g in goals:
        if g['match_id'] in by_id:
            by_id[g['match_id']]['goals'].append(g)
    for c in cards:
        if c['match_id'] in by_id:
            by_id[c['match_id']]['cards'].append(c)

    standings = {}
    for m in matches:
        if not m['played'] or m['home_goals'] is None or m['away_goals'] is None:
            continue
        grp = standings.setdefault(m['age_group'], {})
        for name in (m['home_team'], m['away_team']):
            grp.setdefault(name, {
                'team': name, 'played': 0, 'win': 0, 'draw': 0, 'loss': 0,
                'scored': 0, 'missed': 0, 'points': 0, 'form': []
            })
        h, a = grp[m['home_team']], grp[m['away_team']]
        hg, ag = m['home_goals'], m['away_goals']
        h['played'] += 1
        a['played'] += 1
        h['scored'] += hg
        h['missed'] += ag
        a['scored'] += ag
        a['missed'] += hg
        if hg > ag:
            h['win'] += 1
            h['points'] += 3
            a['loss'] += 1
            h['form'].append('W')
            a['form'].append('L')
        elif hg < ag:
            a['win'] += 1
            a['points'] += 3
            h['loss'] += 1
            h['form'].append('L')
            a['form'].append('W')
        else:
            h['draw'] += 1
            a['draw'] += 1
            h['points'] += 1
            a['points'] += 1
            h['form'].append('D')
            a['form'].append('D')

    table = {}
    for grp, teams in standings.items():
        rows = sorted(
            teams.values(),
            key=lambda r: (-r['points'], -(r['scored'] - r['missed']), -r['scored'], r['team'])
        )
        for i, r in enumerate(rows):
            r['pos'] = i + 1
            r['form'] = r['form'][-6:]
        table[grp] = rows

    players = {}
    for m in matches:
        for g in m['goals']:
            team = m['home_team'] if g['side'] == 'home' else m['away_team']
            key = (g['player'], team)
            p = players.setdefault(key, {
                'name': g['player'], 'team': team, 'group': m['age_group'],
                'goals': 0, 'assists': 0, 'yellow': 0, 'red': 0
            })
            p['goals'] += 1
            if g.get('assist'):
                akey = (g['assist'], team)
                ap = players.setdefault(akey, {
                    'name': g['assist'], 'team': team, 'group': m['age_group'],
                    'goals': 0, 'assists': 0, 'yellow': 0, 'red': 0
                })
                ap['assists'] += 1
        for c in m['cards']:
            team = m['home_team'] if c['side'] == 'home' else m['away_team']
            key = (c['player'], team)
            p = players.setdefault(key, {
                'name': c['player'], 'team': team, 'group': m['age_group'],
                'goals': 0, 'assists': 0, 'yellow': 0, 'red': 0
            })
            if c['color'] == 'red':
                p['red'] += 1
            else:
                p['yellow'] += 1

    cur.execute('SELECT * FROM season_player_stats WHERE active = TRUE')
    for sp in cur.fetchall():
        key = (sp['name'], sp['team'])
        p = players.setdefault(key, {
            'name': sp['name'], 'team': sp['team'], 'group': sp['age_group'],
            'goals': 0, 'assists': 0, 'yellow': 0, 'red': 0
        })
        p['goals'] += sp['goals']
        p['assists'] += sp['assists']
        p['yellow'] += sp['yellow']
        p['red'] += sp['red']

    cur.execute('SELECT * FROM squad_players WHERE active = TRUE ORDER BY team, number')
    squad = [dict(r) for r in cur.fetchall()]

    def short_of(full: str) -> str:
        parts = full.split()
        return f"{parts[0]} {parts[1][0]}." if len(parts) > 1 else full

    games_by_team = {}
    for m in matches:
        if m['played']:
            for t in (m['home_team'], m['away_team']):
                games_by_team[t] = games_by_team.get(t, 0) + 1

    for sp in squad:
        stat = players.get((sp['name'], sp['team'])) or players.get((short_of(sp['name']), sp['team']))
        sp['goals'] = stat['goals'] if stat else 0
        sp['assists'] = stat['assists'] if stat else 0
        sp['yellow'] = stat['yellow'] if stat else 0
        sp['red'] = stat['red'] if stat else 0
        sp['games'] = games_by_team.get(sp['team'], 0)

    cur.execute('SELECT * FROM teams WHERE active = TRUE ORDER BY age_group, name')
    teams = [dict(r) for r in cur.fetchall()]

    overall_groups = ['2011-2012', '2013-2014', '2015-2016', '2017-2018']
    overall_acc = {}
    for grp in overall_groups:
        for r in table.get(grp, []):
            o = overall_acc.setdefault(r['team'], {
                'team': r['team'], 'points': 0, 'played': 0,
                'win': 0, 'draw': 0, 'loss': 0, 'scored': 0, 'missed': 0,
                'by_group': {},
            })
            o['points'] += r['points']
            o['played'] += r['played']
            o['win'] += r['win']
            o['draw'] += r['draw']
            o['loss'] += r['loss']
            o['scored'] += r['scored']
            o['missed'] += r['missed']
            o['by_group'][grp] = r['points']
    overall = sorted(
        overall_acc.values(),
        key=lambda r: (-r['points'], -(r['scored'] - r['missed']), r['team'])
    )
    for i, r in enumerate(overall):
        r['pos'] = i + 1

    return {
        'matches': matches,
        'standings': table,
        'overall': overall,
        'teams': teams,
        'squad': squad,
        'players': sorted(players.values(), key=lambda p: (-p['goals'], -p['assists'], p['name'])),
    }


def handler(event: dict, context) -> dict:
    """Данные первенства: матчи, таблица, статистика игроков; вход в админку и сохранение протоколов."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    if method == 'GET':
        c = conn()
        cur = c.cursor(cursor_factory=RealDictCursor)
        if action == 'applications':
            if not is_admin(event):
                cur.close()
                c.close()
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нужен вход в админку'}, ensure_ascii=False)}
            cur.execute('SELECT id, login, team, age_group, coach_name FROM coach_accounts WHERE active = TRUE ORDER BY team')
            coaches = [dict(r) for r in cur.fetchall()]
            cur.execute('SELECT * FROM team_applications ORDER BY created_at DESC')
            rows = [dict(r) for r in cur.fetchall()]
            cur.execute('SELECT * FROM reschedule_requests ORDER BY created_at DESC')
            reschedules = [dict(r) for r in cur.fetchall()]
            cur.close()
            c.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(
                {'applications': rows, 'coaches': coaches, 'reschedules': reschedules}, ensure_ascii=False, default=str
            )}
        if action == 'coach_reschedules':
            acc = coach_by_token(cur, event)
            if not acc:
                cur.close()
                c.close()
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нужен вход'}, ensure_ascii=False)}
            cur.execute(f"SELECT * FROM reschedule_requests WHERE team='{esc(acc['team'])}' ORDER BY created_at DESC")
            rows = [dict(r) for r in cur.fetchall()]
            cur.close()
            c.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'reschedules': rows}, ensure_ascii=False, default=str)}
        data = load_all(cur)
        cur.close()
        c.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data, ensure_ascii=False, default=str)}

    body = json.loads(event.get('body') or '{}')

    if action == 'apply':
        team = str(body.get('team_name', '')).strip()
        coach = str(body.get('coach', '')).strip()
        phone = str(body.get('phone', '')).strip()
        if len(team) < 2 or len(coach) < 3 or len(''.join(ch for ch in phone if ch.isdigit())) < 10:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Проверьте поля заявки'}, ensure_ascii=False)}
        c = conn()
        cur = c.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "INSERT INTO team_applications (team_name, coach, phone, age_group, comment) VALUES "
            f"('{esc(team)}', '{esc(coach)}', '{esc(phone)}', '{esc(body.get('age_group', '2011-2012'))}', "
            f"'{esc(str(body.get('comment', ''))[:500])}') RETURNING id"
        )
        new_id = cur.fetchone()['id']
        c.commit()
        cur.close()
        c.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'id': new_id})}

    if action == 'login':
        real = os.environ.get('ADMIN_PASSWORD', '')
        if real and body.get('password') == real:
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'token': token_for(real)})}
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный пароль'}, ensure_ascii=False)}

    if action == 'coach_login':
        login = str(body.get('login', '')).strip().lower()
        pwd = str(body.get('password', ''))
        c = conn()
        cur = c.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"SELECT * FROM coach_accounts WHERE login='{esc(login)}' "
            f"AND password_hash='{esc(coach_token(login, pwd))}' AND active = TRUE"
        )
        row = cur.fetchone()
        cur.close()
        c.close()
        if not row:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный логин или пароль'}, ensure_ascii=False)}
        acc = dict(row)
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
            'token': acc['password_hash'], 'team': acc['team'], 'age_group': acc['age_group'],
            'coach_name': acc['coach_name'],
        }, ensure_ascii=False)}

    # Тренер может менять только состав своей команды
    if action in ('save_player', 'remove_player') and not is_admin(event):
        c = conn()
        cur = c.cursor(cursor_factory=RealDictCursor)
        acc = coach_by_token(cur, event)
        if not acc:
            cur.close()
            c.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нужен вход'}, ensure_ascii=False)}

        if action == 'remove_player':
            cur.execute(f"SELECT team, age_group FROM squad_players WHERE id={int(body.get('id'))}")
            target = cur.fetchone()
            if not target or target['team'] != acc['team'] or target['age_group'] != acc['age_group']:
                cur.close()
                c.close()
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Можно менять только свою команду'}, ensure_ascii=False)}
            cur.execute(f"UPDATE squad_players SET active = FALSE WHERE id={int(body.get('id'))}")
        else:
            name = str(body.get('name', '')).strip()
            if len(name) < 2:
                cur.close()
                c.close()
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Укажите имя игрока'}, ensure_ascii=False)}
            pid = body.get('id')
            if pid:
                cur.execute(f"SELECT team, age_group FROM squad_players WHERE id={int(pid)}")
                target = cur.fetchone()
                if not target or target['team'] != acc['team'] or target['age_group'] != acc['age_group']:
                    cur.close()
                    c.close()
                    return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Можно менять только свою команду'}, ensure_ascii=False)}
                cur.execute(
                    f"UPDATE squad_players SET name='{esc(name)}', number={int(body.get('number') or 0)}, "
                    f"position='{esc(body.get('position', 'Полузащитник'))}' WHERE id={int(pid)}"
                )
            else:
                cur.execute(
                    "INSERT INTO squad_players (team, age_group, name, number, position) VALUES "
                    f"('{esc(acc['team'])}', '{esc(acc['age_group'])}', '{esc(name)}', "
                    f"{int(body.get('number') or 0)}, '{esc(body.get('position', 'Полузащитник'))}')"
                )
        c.commit()
        data = load_all(cur)
        cur.close()
        c.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, **data}, ensure_ascii=False, default=str)}

    if action == 'reschedule_request' and not is_admin(event):
        c = conn()
        cur = c.cursor(cursor_factory=RealDictCursor)
        acc = coach_by_token(cur, event)
        if not acc:
            cur.close()
            c.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нужен вход'}, ensure_ascii=False)}

        mid = body.get('match_id')
        new_date = str(body.get('new_date', '')).strip()
        if not mid or len(new_date) < 3:
            cur.close()
            c.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Укажите новую дату'}, ensure_ascii=False)}

        cur.execute(f'SELECT * FROM matches WHERE id={int(mid)}')
        match = cur.fetchone()
        if not match or match['home_team'] != acc['team'] and match['away_team'] != acc['team']:
            cur.close()
            c.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Это не матч вашей команды'}, ensure_ascii=False)}

        cur.execute(
            "INSERT INTO reschedule_requests (match_id, team, coach_name, old_date, old_time, new_date, new_time, reason) VALUES "
            f"({int(mid)}, '{esc(acc['team'])}', '{esc(acc.get('coach_name', ''))}', '{esc(match['match_date'])}', "
            f"'{esc(match['match_time'])}', '{esc(new_date)}', '{esc(body.get('new_time', ''))}', "
            f"'{esc(str(body.get('reason', ''))[:500])}') RETURNING id"
        )
        new_id = cur.fetchone()['id']
        c.commit()
        cur.execute(f"SELECT * FROM reschedule_requests WHERE team='{esc(acc['team'])}' ORDER BY created_at DESC")
        rows = [dict(r) for r in cur.fetchall()]
        cur.close()
        c.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'id': new_id, 'reschedules': rows}, ensure_ascii=False, default=str)}

    if not is_admin(event):
        return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нужен вход в админку'}, ensure_ascii=False)}

    c = conn()
    cur = c.cursor(cursor_factory=RealDictCursor)

    if action == 'reschedule_status':
        status = str(body.get('status', 'new'))
        if status not in ('new', 'approved', 'rejected'):
            status = 'new'
        rid = int(body.get('id'))
        cur.execute(f"UPDATE reschedule_requests SET status='{esc(status)}' WHERE id={rid}")

        if status == 'approved':
            cur.execute(f'SELECT * FROM reschedule_requests WHERE id={rid}')
            req = cur.fetchone()
            if req:
                cur.execute(
                    f"UPDATE matches SET match_date='{esc(req['new_date'])}', "
                    f"match_time='{esc(req['new_time'])}', updated_at=NOW() WHERE id={int(req['match_id'])}"
                )
        c.commit()
        cur.execute('SELECT * FROM reschedule_requests ORDER BY created_at DESC')
        rows = [dict(r) for r in cur.fetchall()]
        data = load_all(cur)
        cur.close()
        c.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'reschedules': rows, **data}, ensure_ascii=False, default=str)}

    if action == 'save_coach':
        login = str(body.get('login', '')).strip().lower()
        pwd = str(body.get('password', ''))
        team = str(body.get('team', '')).strip()
        age_group = str(body.get('age_group', '')).strip()
        if len(login) < 3 or len(team) < 2 or not age_group:
            cur.close()
            c.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Укажите логин, команду и возрастную группу'}, ensure_ascii=False)}
        cid = body.get('id')
        if cid:
            sets = (
                f"login='{esc(login)}', team='{esc(team)}', age_group='{esc(age_group)}', "
                f"coach_name='{esc(body.get('coach_name', ''))}'"
            )
            if pwd:
                sets += f", password_hash='{esc(coach_token(login, pwd))}'"
            cur.execute(f'UPDATE coach_accounts SET {sets} WHERE id={int(cid)}')
        else:
            if len(pwd) < 4:
                cur.close()
                c.close()
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Пароль минимум 4 символа'}, ensure_ascii=False)}
            cur.execute(
                "INSERT INTO coach_accounts (login, team, age_group, coach_name, password_hash) VALUES "
                f"('{esc(login)}', '{esc(team)}', '{esc(age_group)}', '{esc(body.get('coach_name', ''))}', '{esc(coach_token(login, pwd))}')"
            )
        c.commit()
        cur.execute('SELECT id, login, team, age_group, coach_name FROM coach_accounts WHERE active = TRUE ORDER BY team')
        rows = [dict(r) for r in cur.fetchall()]
        cur.close()
        c.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'coaches': rows}, ensure_ascii=False, default=str)}

    if action == 'remove_coach':
        cur.execute(f"UPDATE coach_accounts SET active = FALSE WHERE id={int(body.get('id'))}")
        c.commit()
        cur.execute('SELECT id, login, team, age_group, coach_name FROM coach_accounts WHERE active = TRUE ORDER BY team')
        rows = [dict(r) for r in cur.fetchall()]
        cur.close()
        c.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'coaches': rows}, ensure_ascii=False, default=str)}

    if action == 'application_status':
        status = str(body.get('status', 'new'))
        if status not in ('new', 'approved', 'rejected'):
            status = 'new'
        cur.execute(
            f"UPDATE team_applications SET status='{esc(status)}' WHERE id={int(body.get('id'))}"
        )
        c.commit()
        cur.execute('SELECT * FROM team_applications ORDER BY created_at DESC')
        rows = [dict(r) for r in cur.fetchall()]
        cur.close()
        c.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'applications': rows}, ensure_ascii=False, default=str)}

    if action == 'save_team':
        tid = body.get('id')
        tname = str(body.get('name', '')).strip()
        if len(tname) < 2:
            cur.close()
            c.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Укажите название команды'}, ensure_ascii=False)}
        fields = (
            f"name='{esc(tname)}', district='{esc(body.get('district', ''))}', coach='{esc(body.get('coach', ''))}', "
            f"founded={int(body.get('founded') or 0)}, home='{esc(body.get('home', ''))}', "
            f"color='{esc(body.get('color', ''))}', age_group='{esc(body.get('age_group', '2011-2012'))}'"
        )
        if tid:
            cur.execute(f'SELECT name FROM teams WHERE id={int(tid)}')
            row = cur.fetchone()
            old_name = row['name'] if row else ''
            cur.execute(f'UPDATE teams SET {fields} WHERE id={int(tid)}')
            if old_name and old_name != tname:
                cur.execute(f"UPDATE squad_players SET team='{esc(tname)}' WHERE team='{esc(old_name)}'")
                cur.execute(f"UPDATE matches SET home_team='{esc(tname)}' WHERE home_team='{esc(old_name)}'")
                cur.execute(f"UPDATE matches SET away_team='{esc(tname)}' WHERE away_team='{esc(old_name)}'")
        else:
            cur.execute(
                "INSERT INTO teams (name, district, coach, founded, home, color, age_group) VALUES "
                f"('{esc(tname)}', '{esc(body.get('district', ''))}', '{esc(body.get('coach', ''))}', "
                f"{int(body.get('founded') or 0)}, '{esc(body.get('home', ''))}', '{esc(body.get('color', ''))}', "
                f"'{esc(body.get('age_group', '2011-2012'))}')"
            )
        c.commit()
        data = load_all(cur)
        cur.close()
        c.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, **data}, ensure_ascii=False, default=str)}

    if action == 'remove_team':
        cur.execute(f"UPDATE teams SET active = FALSE WHERE id={int(body.get('id'))}")
        c.commit()
        data = load_all(cur)
        cur.close()
        c.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, **data}, ensure_ascii=False, default=str)}

    if action == 'save_player':
        pid = body.get('id')
        name = str(body.get('name', '')).strip()
        if len(name) < 2:
            cur.close()
            c.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Укажите имя игрока'}, ensure_ascii=False)}
        if pid:
            cur.execute(
                f"UPDATE squad_players SET name='{esc(name)}', number={int(body.get('number') or 0)}, "
                f"position='{esc(body.get('position', 'Полузащитник'))}', team='{esc(body.get('team', ''))}' "
                f"WHERE id={int(pid)}"
            )
        else:
            cur.execute(
                "INSERT INTO squad_players (team, age_group, name, number, position) VALUES "
                f"('{esc(body.get('team', ''))}', '{esc(body.get('age_group', '2011-2012'))}', '{esc(name)}', "
                f"{int(body.get('number') or 0)}, '{esc(body.get('position', 'Полузащитник'))}')"
            )
        c.commit()
        data = load_all(cur)
        cur.close()
        c.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, **data}, ensure_ascii=False, default=str)}

    if action == 'remove_player':
        cur.execute(f"UPDATE squad_players SET active = FALSE WHERE id={int(body.get('id'))}")
        c.commit()
        data = load_all(cur)
        cur.close()
        c.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, **data}, ensure_ascii=False, default=str)}

    if action == 'save_match':
        mid = body.get('id')
        hg = body.get('home_goals')
        ag = body.get('away_goals')
        played = bool(body.get('played', True))
        hg_sql = str(int(hg)) if hg is not None and str(hg) != '' else 'NULL'
        ag_sql = str(int(ag)) if ag is not None and str(ag) != '' else 'NULL'

        if mid:
            cur.execute(
                f"UPDATE matches SET home_goals={hg_sql}, away_goals={ag_sql}, played={'TRUE' if played else 'FALSE'}, "
                f"referee='{esc(body.get('referee', ''))}', venue='{esc(body.get('venue', ''))}', "
                f"match_date='{esc(body.get('match_date', ''))}', match_time='{esc(body.get('match_time', ''))}', "
                f"updated_at=NOW() WHERE id={int(mid)} RETURNING id"
            )
            mid = cur.fetchone()['id']
        else:
            cur.execute(
                "INSERT INTO matches (round, age_group, match_date, match_time, venue, home_team, away_team, home_goals, away_goals, referee, played) "
                f"VALUES ({int(body.get('round', 1))}, '{esc(body.get('age_group', '2011-2012'))}', '{esc(body.get('match_date', ''))}', "
                f"'{esc(body.get('match_time', ''))}', '{esc(body.get('venue', ''))}', '{esc(body.get('home_team', ''))}', "
                f"'{esc(body.get('away_team', ''))}', {hg_sql}, {ag_sql}, '{esc(body.get('referee', ''))}', {'TRUE' if played else 'FALSE'}) RETURNING id"
            )
            mid = cur.fetchone()['id']

        cur.execute(f'DELETE FROM match_goals WHERE match_id={int(mid)}')
        cur.execute(f'DELETE FROM match_cards WHERE match_id={int(mid)}')
        for g in body.get('goals', []):
            if not g.get('player'):
                continue
            cur.execute(
                "INSERT INTO match_goals (match_id, minute, player, assist, side, penalty) VALUES "
                f"({int(mid)}, {int(g.get('minute') or 0)}, '{esc(g['player'])}', '{esc(g.get('assist', ''))}', "
                f"'{esc(g.get('side', 'home'))}', {'TRUE' if g.get('penalty') else 'FALSE'})"
            )
        for cd in body.get('cards', []):
            if not cd.get('player'):
                continue
            cur.execute(
                "INSERT INTO match_cards (match_id, minute, player, side, color) VALUES "
                f"({int(mid)}, {int(cd.get('minute') or 0)}, '{esc(cd['player'])}', "
                f"'{esc(cd.get('side', 'home'))}', '{esc(cd.get('color', 'yellow'))}')"
            )
        c.commit()
        data = load_all(cur)
        cur.close()
        c.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'id': mid, **data}, ensure_ascii=False, default=str)}

    cur.close()
    c.close()
    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Unknown action'}, ensure_ascii=False)}