# -*- coding: utf-8 -*-
"""Genera las tarjetas de anatomía (relaciones, clínica y oral) a partir del contenido del atlas, y asigna región del cuerpo a cada lámina.
Salida: data/atlas_tarjetas.json  y  data/atlas_regiones.json"""
import ast, glob, os, re, json, sys, collections
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(HERE, '..', '..'))


def limpiar(t):
    t = str(t).replace('__', '').strip()
    t = re.sub(r'\s+', ' ', t)
    return t


def html(t):
    t = limpiar(t).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)


def plano(t): return re.sub(r'\*\*', '', limpiar(t))


def lit(n):
    try: return ast.literal_eval(n)
    except Exception: return None


tarjetas = []
vistos = set()


def agregar(up, mod, tipo, q, a, lam, ctx=''):
    q = html(q); a = html(a).replace(chr(10), '<br>')
    if len(plano(q)) < 4 or len(plano(a)) < 6 or len(plano(q)) > 170 or len(plano(a)) > 520: return
    clave = (up, re.sub(r'<[^>]+>', '', q).lower(), re.sub(r'<[^>]+>', '', a).lower()[:60])
    if clave in vistos: return
    vistos.add(clave)
    tarjetas.append(dict(i=len(tarjetas) + 1, u=up, m=mod, t=tipo, c=limpiar(ctx), q=q, a=a, l=lam))


for f in sorted(glob.glob(os.path.join(HERE, 'contenido', 'up*.py'))):
    m = re.match(r'up(\d\d)', os.path.basename(f))
    if not m: continue
    up = int(m.group(1))
    tree = ast.parse(open(f, encoding='utf-8').read())
    for fn in [n for n in tree.body if isinstance(n, ast.FunctionDef)]:
        # (línea, código de lámina de Netter) y título del módulo
        placas = []; mod = None; llamadas = []; h3s = []
        for n in ast.walk(fn):
            if isinstance(n, ast.Call):
                if isinstance(n.func, ast.Name) and n.func.id == 'N' and len(n.args) >= 2:
                    c = lit(n.args[1])
                    if isinstance(c, str): placas.append((n.lineno, c))
                if isinstance(n.func, ast.Attribute) and isinstance(n.func.value, ast.Name) and n.func.value.id == 'u':
                    llamadas.append(n)
        for n in sorted(llamadas, key=lambda x: x.lineno):
            if n.func.attr == 'h2' and mod is None and n.args: mod = limpiar(lit(n.args[0]) or '')
            if n.func.attr == 'h3' and n.args:
                tt = lit(n.args[0])
                if isinstance(tt, str): h3s.append((n.lineno, limpiar(tt)))
        mod = mod or fn.name

        def h3de(linea):
            ant = [t for l, t in h3s if l < linea]
            return ant[-1] if ant else (mod or '')

        def cerca(linea):
            if not placas: return None
            return min(placas, key=lambda p: abs(p[0] - linea))[1]
        for n in llamadas:
            if n.func.attr == 'tabla' and len(n.args) >= 2:
                cab = lit(n.args[0]); filas = lit(n.args[1])
                if not cab or not filas or len(cab) < 2: continue
                cab = [plano(c) for c in cab]
                if any(re.search(r'^(Pregunta|Fuente|Opci)', c) for c in cab[:1]): continue
                for r in filas:
                    r = [c for c in r]
                    if len(r) < 2: continue
                    q0 = plano(r[0])
                    if not q0 or len(q0) > 110: continue
                    partes = []
                    for k in range(1, len(r)):
                        v = str(r[k]).strip()
                        if not v: continue
                        etq = cab[k] if k < len(cab) and cab[k] else ''
                        partes.append((('**%s:** ' % etq) if etq and len(cab) > 2 else '') + v)
                    if not partes: continue
                    dato = cab[1] if len(cab) > 1 and cab[1] else 'Qué hay que saber'
                    pregunta = '%s: %s' % (limpiar(r[0]).replace('**', ''), dato.lower() if len(dato) < 40 else 'qué hay que saber') if False else limpiar(r[0])
                    # la pregunta es la primera celda; la cabecera da el contexto
                    ctx3 = h3de(n.lineno)
                    if len(q0) < 15 and ctx3: pregunta = ctx3 + ' — ' + limpiar(r[0])
                    agregar(up, mod, 'rel', pregunta, chr(10).join(partes), cerca(n.lineno), ctx3)
            elif n.func.attr == 'si_ves' and n.args:
                filas = lit(n.args[0])
                for r in filas or []:
                    if len(r) == 2: agregar(up, mod, 'cli', r[0], r[1], cerca(n.lineno), h3de(n.lineno))
        # preguntas de oral: qa = [(pregunta, respuesta), ...]
        for n in ast.walk(fn):
            if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'qa' for t in n.targets):
                v = lit(n.value)
                for q, a in (v or []):
                    agregar(up, 'Preguntas de oral', 'ora', q, a, None)

# las preguntas de oral sin lámina: se les asigna una lámina por coincidencia de palabras con el título de la lámina
cat = json.load(open(os.path.join(HERE, 'trabajo', 'catalogo_laminas.json'), encoding='utf-8'))
STOP = set('de la el los las del y en con por para un una que se al como es su sus o a lo ni sin entre'.split())


def pal(t): return {w for w in re.findall(r'[a-záéíóúñ]{4,}', t.lower()) if w not in STOP}


for t in tarjetas:
    if t['l'] is None:
        pq = pal(re.sub(r'<[^>]+>', '', t['q']))
        mejor, pm = None, 1
        for c in cat.values():
            if t['u'] not in c['ups']: continue
            s = len(pq & pal(c['titulo']))
            if s > pm: mejor, pm = c['code'], s
        t['l'] = mejor

json.dump(dict(version=1, tarjetas=tarjetas), open(os.path.join(RAIZ, 'data', 'atlas_tarjetas.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
c = collections.Counter((t['u'], t['t']) for t in tarjetas)
print(len(tarjetas), 'tarjetas;', collections.Counter(t['t'] for t in tarjetas), 'con lámina:', sum(1 for t in tarjetas if t['l']))
print(sorted(collections.Counter(t['u'] for t in tarjetas).items()))
print(round(os.path.getsize(os.path.join(RAIZ, 'data', 'atlas_tarjetas.json')) / 1e3), 'KB')
