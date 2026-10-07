#!/usr/bin/env python
"""Completa data/siam_data.json (Sala de estudio de SIAM) con los links de 'LINKS DE SIAM SALA DE ESTUDIO.docx':
por UP, `materiales` (PDF/Drive) y `videos` (YouTube y Drive). No toca objetivos, contenidos ni el resto del archivo.

Uso:  PYTHONIOENCODING=utf8 python tools/siam-banco/construir_sala.py <ruta al .docx>
"""
import html, json, os, re, sys, zipfile

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SIGLAS = {'acv', 'aine', 'hta', 'itu', 'nihss', 'mecnt', 'sac', 'dean', 'pricupp', 'hmc', 'mhgap', 'tto', 'up'}
ROMANOS = {'i', 'ii', 'iii', 'iv', 'v', 'vi'}
# palabra sin tilde / mal escrita -> forma correcta (minúsculas); los nombres propios se capitalizan después
ACENTOS = {
    'cronica': 'crónica', 'diureticos': 'diuréticos', 'antibioticos': 'antibióticos', 'macrolidos': 'macrólidos',
    'patologia': 'patología', 'nefropatia': 'nefropatía', 'farmacologia': 'farmacología', 'dermatologia': 'dermatología',
    'fisiologia': 'fisiología', 'fisiopatologia': 'fisiopatología', 'semiologia': 'semiología', 'psiquiatria': 'psiquiatría',
    'sindrome': 'síndrome', 'ulceras': 'úlceras', 'presion': 'presión', 'cancer': 'cáncer', 'esofago': 'esófago',
    'esogago': 'esófago', 'estomago': 'estómago', 'gastrico': 'gástrico', 'diagnostico': 'diagnóstico', 'clasificacion': 'clasificación',
    'degeneracion': 'degeneración', 'disminucion': 'disminución', 'disfuncion': 'disfunción', 'estadificacion': 'estadificación',
    'intervencion': 'intervención', 'bibliografia': 'bibliografía', 'atencion': 'atención', 'analisis': 'análisis',
    'angel': 'Ángel', 'jose': 'José', 'aortica': 'aórtica', 'cardiaca': 'cardíaca', 'cardiacas': 'cardíacas',
    'celulas': 'células', 'lactamicos': 'lactámicos', 'tromboembolica': 'tromboembólica', 'hemorragico': 'hemorrágico',
    'isquemico': 'isquémico', 'medico': 'médico', 'farmacos': 'fármacos', 'hipnoticos': 'hipnóticos', 'antiarritmicos': 'antiarrítmicos',
    'anthipertensiva': 'antihipertensiva', 'carcinome': 'carcinoma', 'restrictva': 'restrictiva', 'hipertrofica': 'hipertrófica',
    'miocardiopatia': 'miocardiopatía', 'litiasis': 'litiasis', 'sexual': 'sexual', 'vejeces': 'vejeces', 'microcristales': 'microcristales',
    'neurodegenerativos': 'neurodegenerativos', 'extrapiramidales': 'extrapiramidales', 'alem': 'Alem', 'sjogren': 'Sjögren',
    'miastenia': 'miastenia', 'tetanos': 'tétanos', 'insuficiencia': 'insuficiencia', 'parkinson': 'Parkinson', 'alzheimer': 'Alzheimer',
    'chagas': 'Chagas', 'lyell': 'Lyell', 'stevens': 'Stevens', 'johnson': 'Johnson', 'lewy': 'Lewy', 'grilli': 'Grilli',
    'errecart': 'Errecart', 'patito': 'Patito', 'minimental': 'Minimental', 'mayor': 'mayor', 'miclonia': 'mioclonía',
    'guia': 'guía', 'valvulopatias': 'valvulopatías', 'diabetica': 'diabética', 'distonia': 'distonía', 'corea': 'corea', 'pielonefritis': 'pielonefritis', 'pag': 'pág.', 'págs': 'págs.', 'pags': 'págs.',
}


def parrafos(ruta):
    x = zipfile.ZipFile(ruta).read('word/document.xml').decode('utf8')
    out = []
    for p in re.findall(r'<w:p[ >].*?</w:p>', x, re.S):
        out.append(html.unescape(''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>', p, re.S))).strip())
    return [t for t in out if t]


def titulo(t):
    t = re.sub(r'\s+', ' ', t.strip(' :.-')).replace('..', '.')
    if t.isupper() or t.upper() == t.upper():   # los títulos vienen en MAYÚSCULAS
        palabras = re.findall(r'\S+', t.lower())
        res = []
        for i, w in enumerate(palabras):
            nucleo = re.sub(r'[^\wáéíóúüñ]', '', w)
            pre = w[:len(w) - len(w.lstrip('(¿'))]
            if nucleo in SIGLAS or nucleo in ROMANOS:
                res.append(w.upper() if nucleo in SIGLAS or nucleo in ROMANOS else w)
                continue
            m = re.match(r'^([(¿]*)([\wáéíóúüñ]+)(.*)$', w)
            if m:
                base = ACENTOS.get(m.group(2), m.group(2))
                if i == 0 and base[0].islower():
                    base = base[0].upper() + base[1:]
                res.append(m.group(1) + base + m.group(3))
            else:
                res.append(w)
        t = ' '.join(res)
    t = re.sub(r'\s+([,.;:])', r'', t)            # sin espacio antes de la puntuación
    t = re.sub(r'\.{2,}', '.', t)                      # 'págs..' -> 'págs.'
    t = re.sub(r'(?<=\. )([a-záéíóúñ])', lambda m: m.group(1).upper(), t)   # mayúscula tras punto
    return t[0].upper() + t[1:] if t else t


def limpiar_url(u):
    u = u.strip().rstrip('.,;)')
    u = re.sub(r'&pp=[^&\s]+', '', u)
    return u


def construir(ruta_docx):
    lineas = parrafos(ruta_docx)
    unidades, actual, modo, pendiente = {}, None, 'mat', []
    for ln in lineas:
        m = re.fullmatch(r'UP\s?(\d)', ln, re.I)
        if m:
            actual = int(m.group(1)); unidades[actual] = {'materiales': [], 'videos': []}; modo = 'mat'; pendiente = []; continue
        if actual is None:
            continue
        if re.fullmatch(r'(link )?videos( recomendados)?:?\s*', ln, re.I):
            modo = 'video'; pendiente = []; continue
        mu = re.search(r'https?://\S+', ln)
        if not mu:
            pendiente.append(ln); continue
        url = limpiar_url(mu.group(0))
        previo = ln[:mu.start()].strip(' :')
        txt = previo or ' – '.join(pendiente)
        pendiente = []
        if re.match(r'^contenidos?\b', txt, re.I) and modo == 'mat':
            nombre = f'Contenidos UP{actual}'
        elif re.match(r'^bibliograf', txt, re.I) and modo == 'mat':
            nombre = f'Bibliografía UP{actual}'
        elif txt.lower().startswith('manual del residente de psiquiatr'):
            nombre = 'Manual del residente de Psiquiatría (2009), Asociación Española de Psiquiatría: Trastornos del sueño (págs. 359 a 367) y Disfunciones sexuales (págs. 379 a 385)'
        else:
            nombre = titulo(txt)
        if modo == 'video':
            unidades[actual]['videos'].append({'title': nombre, 'url': url, 'type': 'video'})
        else:
            unidades[actual]['materiales'].append({'title': nombre, 'url': url, 'type': 'pdf'})
    return unidades


if __name__ == '__main__':
    ruta = sys.argv[1]
    datos = construir(ruta)
    sp = os.path.join(RAIZ, 'data/siam_data.json')
    siam = json.load(open(sp, encoding='utf-8'))
    for u in siam['units']:
        d = datos.get(u['number'])
        if d:
            u['materiales'] = d['materiales']; u['videos'] = d['videos']
        print(f'UP{u["number"]}: {len(u["materiales"])} materiales, {len(u["videos"])} videos')
    with open(sp, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(siam, f, ensure_ascii=False, indent=2)
        f.write('\n')
