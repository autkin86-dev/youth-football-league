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


def conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def load_all(cur):
    cur.execute('SELECT * FROM matches ORDER BY round DESC, id ASC')
    matches = [dict(r) for r in cur.fetchall()]
    cur.execute('SELECT * FROM match_goals ORDER BY minute ASC')
    goals = [dict(r) for r in cur.fetchall()]
    cur.execute('SELECT * FROM match_cards ORDER BY minute ASC')
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

    return {
        'matches': matches,
        'standings': table,
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
            cur.execute('SELECT * FROM team_applications ORDER BY created_at DESC')
            rows = [dict(r) for r in cur.fetchall()]
            cur.close()
            c.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'applications': rows}, ensure_ascii=False, default=str)}
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
            f"('{esc(team)}', '{esc(coach)}', '{esc(phone)}', '{esc(body.get('age_group', '2013'))}', "
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

    if not is_admin(event):
        return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нужен вход в админку'}, ensure_ascii=False)}

    c = conn()
    cur = c.cursor(cursor_factory=RealDictCursor)

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
                f"('{esc(body.get('team', ''))}', '{esc(body.get('age_group', '2013'))}', '{esc(name)}', "
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
                f"VALUES ({int(body.get('round', 1))}, '{esc(body.get('age_group', '2013'))}', '{esc(body.get('match_date', ''))}', "
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