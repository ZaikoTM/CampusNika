#!/usr/bin/env python3
"""Genera guías nuevas (guia-*.html) a partir de los datos de flashcards + texto editorial.
Uso: python tools/gen_guias_nuevas.py  (desde la raíz del repo)"""
import json, os, re, sys, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_temas as G
import mejorar_guias as M
from PIL import Image

ROOT = G.ROOT; SITE = G.SITE; e = html.escape; FECHA = G.FECHA

pats, unidades = G.cargar()
T = {p['id']: p for p in pats}

def link(tid):
    p = T[tid]
    return f'<a href="/temas/{tid}.html">{e(p["titulo"])}</a>'

def primera(p):
    return G.primera_oracion(p.get('definicion', ''))

def tabla(ids, cab=('Tema', 'De qué se trata', 'Banderas rojas')):
    filas = ''
    for tid in ids:
        p = T[tid]
        br = p.get('banderas') or []
        filas += f'<tr><td><a href="/temas/{tid}.html">{e(p["titulo"])}</a></td><td>{e(G.corto(primera(p), 230))}</td><td>{e(G.corto(br[0], 190)) if br else "—"}</td></tr>'
    return f'<div class="gn-tabla"><table><thead><tr>{"".join(f"<th>{c}</th>" for c in cab)}</tr></thead><tbody>{filas}</tbody></table></div>'

def lista_temas(ids):
    return '<ul class="gn-lista">' + ''.join(f'<li>{link(t)}<span>{e(G.corto(primera(T[t]), 150))}</span></li>' for t in ids) + '</ul>'

def por_unidad(prefijo_ups):
    out = ''
    for u in unidades:
        if not re.match(prefijo_ups, u): continue
        ids = [p['id'] for p in pats if p.get('up') and p['up'][0] == u]
        if not ids: continue
        out += f'<h3 class="gn-h3">{e(unidades[u])}</h3>' + lista_temas(ids)
    return out

def card(n, titulo, cuerpo, ident=None):
    ident = f' id="{ident}"' if ident else ''
    return f'<div class="legal-card g-sec g-rv"{ident}><h2><span class="num">{n}</span>{titulo}</h2>{cuerpo}</div>'

GUIAS = []

# ---------- 1. Cómo estudiar Cirugía
cx_ids = [p['id'] for p in pats if p['area'] == 'cirugia']
GUIAS.append(dict(
    slug='guia-como-estudiar-cirugia', area='cirugia',
    title='Cómo estudiar Cirugía en Medicina: mapa de las 11 unidades y método | NikaMed',
    h1='Cómo estudiar Cirugía en Medicina',
    desc='Mapa de las 11 unidades problema de Cirugía, orden para estudiar cada tema y fichas clínicas gratis con tratamiento y banderas rojas. Guía de NikaMed.',
    eyebrow='Guía de estudio · Cirugía', ico='🔪',
    chips=['11 unidades', 'Método por tema', 'Fichas gratis'],
    resumen='Cirugía suma mucho contenido y mucha urgencia. Esta guía te da un <strong>mapa de las 11 unidades problema</strong>, un orden fijo para estudiar cada tema y los atajos para repasar con las flashcards de NikaMed.',
    secciones=[
        ('Un orden fijo para cada tema', '<p>Estudiar cada patología siempre en el mismo orden evita olvidos y te prepara para el examen oral y escrito. Es el mismo orden que usan las flashcards de NikaMed:</p>'
         '<ol class="gn-pasos"><li><strong>Definición y diagnóstico:</strong> qué es y cómo se llega a él.</li><li><strong>Estudios:</strong> qué pedir y para qué.</li>'
         '<li><strong>Banderas rojas:</strong> qué signo cambia la conducta o vuelve urgente el caso.</li><li><strong>Tratamiento:</strong> conducta inicial y definitiva.</li><li><strong>Seguimiento:</strong> controles y complicaciones.</li></ol>'
         '<p>Primero las banderas rojas y recién después el tratamiento: en Cirugía, saber cuándo operar o derivar importa tanto como saber cómo.</p>'),
        ('Mapa de las 11 unidades problema', '<p>Estos son los temas de las fichas de NikaMed organizados por unidad. Cada uno abre una página con el resumen completo:</p>' + por_unidad(r'^cx')),
        ('Qué priorizar si tenés poco tiempo', '<p>Empezá por las situaciones donde una demora cambia el pronóstico: ' + ', '.join(link(t) for t in ['cx-abdomen-agudo-enfoque', 'cx-apendicitis-aguda', 'cx-trauma-evaluacion-primaria', 'cx-isquemia-arterial-aguda', 'cx-torsion-testicular']) +
         '. Seguí con los temas frecuentes de la práctica, como ' + ', '.join(link(t) for t in ['cx-colecistitis-aguda', 'cx-hernia-inguinal', 'cx-diverticulitis', 'cx-fractura-cadera']) + '.</p>'),
        ('Cómo usar NikaMed para repasar', '<p>Con tu cuenta gratis podés <strong>practicar las flashcards</strong> escribiendo tu respuesta y verificándola, <strong>rendir un simulador</strong> por unidad y repasar los procedimientos de la UP1 (asepsia, suturas, inmovilizaciones). Conocé más en la <a href="/guia-flashcards-medicina.html">guía del Simulador FlashCard</a>.</p>'),
    ],
    faq=[('¿Cuántas unidades tiene Cirugía?', 'La materia se organiza en 11 unidades problema, desde el trauma de miembro superior y los procedimientos básicos hasta la enfermedad vascular y la urología.'),
         ('¿Por dónde empiezo a estudiar?', 'Por la UP1, que reúne asepsia, suturas, heridas y evaluación preoperatoria, y por las urgencias: abdomen agudo y trauma.'),
         ('¿Las fichas de Cirugía son gratis?', 'Sí. Las 90 fichas de Cirugía del Simulador FlashCard son gratuitas con tu cuenta de NikaMed.'),
         ('¿En qué se basan las fichas?', 'En guías y consensos argentinos recientes y en la bibliografía validada de la cátedra; cada ficha cita su fuente.')],
    relacionadas=['guia-abdomen-agudo-cirugia', 'guia-trauma-evaluacion-inicial', 'guia-flashcards-medicina'],
    temas_img=['cx-apendicitis-aguda', 'cx-trauma-evaluacion-primaria'],
))

# ---------- 2. Cómo estudiar Ginecología y Obstetricia
GUIAS.append(dict(
    slug='guia-como-estudiar-ginecologia-obstetricia', area='ginecologia',
    title='Cómo estudiar Ginecología y Obstetricia: unidades, temas y método | NikaMed',
    h1='Cómo estudiar Ginecología y Obstetricia',
    desc='Mapa de las unidades de Ginecología y Obstetricia, orden para estudiar cada tema y fichas clínicas gratis basadas en guías FASGO y SOGIBA. Guía de NikaMed.',
    eyebrow='Guía de estudio · Ginecología y Obstetricia', ico='🌸',
    chips=['4 UP · 8 secciones', 'Guías FASGO y SOGIBA', 'Fichas gratis'],
    resumen='Ginecología y Obstetricia combina guías nacionales que cambian con el tiempo. Esta guía te muestra el <strong>mapa de unidades</strong> con los temas de NikaMed y un método para estudiar cada uno sin perderte.',
    secciones=[
        ('Un método para cada tema', '<p>Estudiá cada tema en el mismo orden: <strong>definición y diagnóstico</strong>, <strong>estudios</strong>, <strong>banderas rojas</strong>, <strong>tratamiento</strong> y <strong>seguimiento</strong>. En Obstetricia, sumá siempre la pregunta «¿qué cambia según la edad gestacional?».</p>'),
        ('Mapa de unidades y temas', '<p>Todos los temas de las fichas de NikaMed por unidad:</p>' + por_unidad(r'^up')),
        ('Urgencias que tenés que saber primero', '<p>Priorizá las emergencias de la gestación y del puerperio: ' + ', '.join(link(t) for t in ['obs-hipertension', 'obs-hpp', 'gin-ectopico', 'obs-dppni', 'obs-placenta-previa', 'obs-ppp']) +
         '. Todas comparten una idea: reconocer la bandera roja a tiempo. Mirá la <a href="/guia-urgencias-obstetricas.html">guía de urgencias obstétricas</a>.</p>'),
        ('Cómo usar NikaMed para repasar', '<p>Creá tu cuenta gratis para <strong>practicar las flashcards</strong>, rendir el simulador por unidad y repasar con los atlas 3D de exámenes mamario, obstétrico y ginecológico. Más en la <a href="/guia-flashcards-medicina.html">guía del Simulador FlashCard</a>.</p>'),
    ],
    faq=[('¿Qué unidades tiene Ginecología y Obstetricia en NikaMed?', 'Generalidades, niñeces e infancias, adolescente, adulta joven, urgencias, embarazo, parto y puerperio, y adulta mayor.'),
         ('¿En qué guías se basan las fichas?', 'Principalmente en consensos y guías de FASGO, SOGIBA y otras sociedades argentinas, citadas en cada ficha.'),
         ('¿Las fichas son gratis?', 'Sí, las 51 fichas de Ginecología y Obstetricia son gratuitas con tu cuenta.'),
         ('¿Por dónde empiezo?', 'Por los trastornos hipertensivos del embarazo, la hemorragia posparto y el embarazo ectópico: son las urgencias que más se evalúan.')],
    relacionadas=['guia-urgencias-obstetricas', 'guia-flashcards-medicina', 'guia-como-estudiar-medicina'],
    temas_img=['obs-hipertension', 'obs-hpp'],
))

# ---------- 3. Abdomen agudo
ab = ['cx-apendicitis-aguda', 'cx-colecistitis-aguda', 'cx-pancreatitis-aguda', 'cx-obstruccion-intestinal', 'cx-peritonitis-aguda', 'cx-diverticulitis', 'cx-isquemia-colonica', 'cx-hernia-complicada']
ab = [t for t in ab if t in T]
dx0 = T['cx-abdomen-agudo-enfoque']
GUIAS.append(dict(
    slug='guia-abdomen-agudo-cirugia', area='cirugia',
    title='Abdomen agudo: enfoque, causas y banderas rojas | NikaMed',
    h1='Abdomen agudo: enfoque y causas quirúrgicas',
    desc='Cómo abordar un abdomen agudo: definición, causas quirúrgicas frecuentes, banderas rojas y conducta, con fichas clínicas gratis de NikaMed.',
    eyebrow='Guía de estudio · Cirugía', ico='🚑',
    chips=['UP2', 'Causas frecuentes', 'Banderas rojas'],
    resumen='El abdomen agudo es una urgencia médico-quirúrgica: <strong>reconocerlo, ordenarlo y decidir a tiempo</strong> importa más que memorizar una lista. Acá encontrás el enfoque y las causas más frecuentes, con las banderas rojas de cada una.',
    secciones=[
        ('Cómo se define', '<p>' + e(dx0.get('definicion', '')) + '</p>'),
        ('Cómo se enfoca', '<ul class="gn-bul">' + ''.join(f'<li>{e(x)}</li>' for x in (dx0.get('diagnostico') or [])) + '</ul>' +
         ('<h3 class="gn-h3">Estudios</h3><ul class="gn-bul">' + ''.join(f'<li>{e(x)}</li>' for x in (dx0.get('estudios') or [])) + '</ul>' if dx0.get('estudios') else '') +
         f'<p>Ficha completa: {link("cx-abdomen-agudo-enfoque")}.</p>'),
        ('Causas frecuentes de un vistazo', '<p>Resumen de cada causa con su primera bandera roja. Tocá el nombre para ver la ficha completa:</p>' + tabla(ab)),
        ('Banderas rojas del abdomen agudo', '<ul class="gn-bul">' + ''.join(f'<li>{e(x)}</li>' for x in (dx0.get('banderas') or [])) + '</ul>' if dx0.get('banderas') else '<p>Ver las banderas rojas de cada causa en la tabla anterior.</p>'),
    ],
    faq=[('¿Qué es un abdomen agudo?', 'Un cuadro de dolor abdominal de inicio reciente que requiere una evaluación médico-quirúrgica urgente para decidir si necesita cirugía.'),
         ('¿Cuáles son las causas quirúrgicas más frecuentes?', 'La apendicitis aguda, la colecistitis, la obstrucción intestinal, la perforación con peritonitis y la diverticulitis complicada, entre otras.'),
         ('¿Qué estudios se piden?', 'Depende del cuadro: laboratorio, ecografía y tomografía son los habituales. Cada ficha detalla cuál elegir.'),
         ('¿Dónde practico estos temas?', 'En el Simulador FlashCard de NikaMed, gratis con tu cuenta.')],
    relacionadas=['guia-como-estudiar-cirugia', 'guia-casos-clinicos-razonamiento', 'guia-trauma-evaluacion-inicial'],
    temas_img=['cx-abdomen-agudo-enfoque', 'cx-apendicitis-aguda'],
))

# ---------- 4. Trauma
tr = [t for t in ['cx-trauma-evaluacion-primaria', 'cx-shock-hemorragico', 'cx-trauma-torax', 'cx-trauma-abdominal', 'cx-restriccion-espinal', 'cx-quemaduras', 'cx-procuracion-muerte-encefalica'] if t in T]
ev = T['cx-trauma-evaluacion-primaria']
GUIAS.append(dict(
    slug='guia-trauma-evaluacion-inicial', area='cirugia',
    title='Trauma: evaluación inicial ABCDE, shock y quemaduras | NikaMed',
    h1='Trauma: evaluación inicial del paciente politraumatizado',
    desc='Evaluación primaria ABCDE, manejo inicial del shock, trauma de tórax y abdomen, quemaduras y restricción espinal. Fichas clínicas gratis de NikaMed.',
    eyebrow='Guía de estudio · Cirugía', ico='🚨',
    chips=['UP9', 'ABCDE', 'Shock y quemaduras'],
    resumen='En trauma el orden salva vidas: <strong>primero lo que mata más rápido</strong>. Esta guía resume la evaluación inicial y reúne los temas de la UP9 con sus banderas rojas.',
    secciones=[
        ('Evaluación primaria', '<p>' + e(ev.get('definicion', '')) + '</p><ul class="gn-bul">' + ''.join(f'<li>{e(x)}</li>' for x in (ev.get('diagnostico') or [])) + '</ul>' + f'<p>Ficha completa: {link("cx-trauma-evaluacion-primaria")}.</p>'),
        ('Temas de la unidad de un vistazo', tabla(tr)),
        ('Banderas rojas de la evaluación inicial', '<ul class="gn-bul">' + ''.join(f'<li>{e(x)}</li>' for x in (ev.get('banderas') or [])) + '</ul>' if ev.get('banderas') else '<p>Revisá las banderas rojas de cada tema en la tabla.</p>'),
        ('Cómo repasarlo', '<p>Practicá la secuencia en voz alta y con las fichas del Simulador FlashCard; en el campus de NikaMed podés rendir simuladores de la unidad. Creá tu cuenta gratis para empezar.</p>'),
    ],
    faq=[('¿Qué significa ABCDE?', 'Es la secuencia de la evaluación primaria del trauma: vía aérea con control cervical, respiración, circulación con control de hemorragias, déficit neurológico y exposición con control del ambiente.'),
         ('¿Cómo se reconoce un shock hemorrágico?', 'Por taquicardia, hipotensión, mala perfusión y alteración del estado mental; la ficha de shock hemorrágico lo detalla.'),
         ('¿Qué incluye la unidad de trauma?', 'Evaluación inicial, shock, trauma de tórax y abdomen, restricción espinal, quemaduras y procuración de órganos.'),
         ('¿Las fichas son gratis?', 'Sí, con tu cuenta de NikaMed.')],
    relacionadas=['guia-como-estudiar-cirugia', 'guia-abdomen-agudo-cirugia', 'guia-ecoe-medicina'],
    temas_img=['cx-trauma-evaluacion-primaria', 'cx-shock-hemorragico'],
))

# ---------- 5. Urgencias obstétricas
ob = [t for t in ['obs-hipertension', 'obs-hpp', 'gin-ectopico', 'obs-dppni', 'obs-placenta-previa', 'obs-ppp', 'obs-rpm'] if t in T]
GUIAS.append(dict(
    slug='guia-urgencias-obstetricas', area='ginecologia',
    title='Urgencias obstétricas: preeclampsia, hemorragia posparto y más | NikaMed',
    h1='Urgencias obstétricas: qué reconocer y cuándo actuar',
    desc='Trastornos hipertensivos, hemorragia posparto, embarazo ectópico, desprendimiento de placenta y parto pretérmino: banderas rojas y conducta. Fichas gratis de NikaMed.',
    eyebrow='Guía de estudio · Obstetricia', ico='🚑',
    chips=['Banderas rojas', 'Guías FASGO y SOGIBA', 'Fichas gratis'],
    resumen='Las urgencias obstétricas se juegan en minutos. Acá tenés las más evaluadas, <strong>cada una con su primera bandera roja</strong>, para repasar antes del examen y de la guardia.',
    secciones=[
        ('Urgencias de un vistazo', '<p>Tocá el nombre para ver la ficha completa con diagnóstico, estudios, banderas rojas, tratamiento y seguimiento:</p>' + tabla(ob)),
        ('Cómo estudiarlas', '<p>Para cada urgencia, respondé en voz alta cuatro preguntas: <strong>qué la define</strong>, <strong>qué estudio la confirma</strong>, <strong>qué signo la vuelve crítica</strong> y <strong>qué se hace primero</strong>. Después verificá tu respuesta con la ficha.</p>'),
        ('Trastornos hipertensivos y hemorragias: lo que más se evalúa', '<p>' + e(G.corto(primera(T['obs-hipertension']), 300)) + ' ' + link('obs-hipertension') + '. ' + e(G.corto(primera(T['obs-hpp']), 300)) + ' ' + link('obs-hpp') + '.</p>'),
        ('Practicá en NikaMed', '<p>Creá tu cuenta gratis y practicá estas fichas escribiendo tu respuesta. Más en la <a href="/guia-como-estudiar-ginecologia-obstetricia.html">guía para estudiar Ginecología y Obstetricia</a>.</p>'),
    ],
    faq=[('¿Cuáles son las urgencias obstétricas más frecuentes?', 'Los trastornos hipertensivos del embarazo, la hemorragia posparto, el embarazo ectópico, el desprendimiento de placenta, la placenta previa y el parto pretérmino.'),
         ('¿Qué signos de alarma hay que reconocer primero?', 'Cada ficha lista sus banderas rojas; por ejemplo, la hipertensión grave en la gestante o el sangrado vaginal abundante.'),
         ('¿En qué guías se basan las fichas?', 'En guías y consensos de FASGO, SOGIBA y otras sociedades científicas citadas en cada ficha.'),
         ('¿Son gratis?', 'Sí, con tu cuenta de NikaMed.')],
    relacionadas=['guia-como-estudiar-ginecologia-obstetricia', 'guia-casos-clinicos-razonamiento', 'guia-flashcards-medicina'],
    temas_img=['obs-hipertension', 'obs-hpp'],
))

CSS_GN = """.gn-lista{list-style:none;padding:0!important;display:flex;flex-direction:column;gap:8px}
.gn-lista li{padding:10px 14px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(2,6,23,.4)}
.gn-lista a{font-weight:800;color:#38bdf8;text-decoration:none}.gn-lista span{display:block;font-size:.84rem;color:#94a3b8;margin-top:2px}
.gn-h3{font-size:.8rem;text-transform:uppercase;letter-spacing:1px;color:#c084fc;margin:20px 0 8px;font-weight:900}
.gn-pasos{padding-left:22px;display:flex;flex-direction:column;gap:8px;margin:10px 0}
.gn-bul{padding-left:20px;display:flex;flex-direction:column;gap:8px}
.gn-tabla{overflow-x:auto}.gn-tabla table{min-width:640px}
.gn-rel{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:10px}
.gn-rel a{display:block;padding:14px 16px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(15,23,42,.7);color:#fff!important;font-weight:800;text-decoration:none!important;transition:.2s}
.gn-rel a:hover{border-color:#c084fc;transform:translateY(-2px)}.gn-rel small{display:block;color:#94a3b8;font-weight:600;margin-top:4px}
"""

REL_NOMBRE = {
 'guia-como-estudiar-cirugia': 'Cómo estudiar Cirugía', 'guia-como-estudiar-ginecologia-obstetricia': 'Cómo estudiar Ginecología y Obstetricia',
 'guia-abdomen-agudo-cirugia': 'Abdomen agudo', 'guia-trauma-evaluacion-inicial': 'Trauma: evaluación inicial', 'guia-urgencias-obstetricas': 'Urgencias obstétricas',
 'guia-flashcards-medicina': 'Simulador FlashCard', 'guia-como-estudiar-medicina': 'Cómo estudiar Medicina', 'guia-casos-clinicos-razonamiento': 'Casos clínicos',
 'guia-ecoe-medicina': 'ECOE en Medicina',
}

def pagina(g, caps):
    url = f'{SITE}/{g["slug"]}.html'
    a = G.AREAS[g['area']]
    fake = {'id': g['slug'], 'titulo': g['h1']}
    G.og_imagen(fake, a, 'Guía de estudio')
    img = f'{SITE}/assets/og/temas/{g["slug"]}.jpg'
    cuerpo = ''.join(card(i + 1, t, c) for i, (t, c) in enumerate(g['secciones']))
    # imágenes
    figs = ''
    for k in ('tema', 'home'):
        pass
    cards = ''
    for tid in g['temas_img']:
        small = f'assets/temas/{tid}-480.webp'
        if tid in T and os.path.exists(os.path.join(ROOT, small)):
            w, h = Image.open(os.path.join(ROOT, small)).size
            cards += (f'<figure class="mg-fig mg-card"><a href="/temas/{tid}.html"><img src="/{small}" width="{w}" height="{h}" loading="lazy" alt="Flashcard de {e(T[tid]["titulo"])} de NikaMed"></a>'
                      f'<figcaption>Flashcard: {e(T[tid]["titulo"])}</figcaption></figure>')
    shot = ''
    if 'tema' in caps:
        u, (w, h) = caps['tema']
        shot = f'<figure class="mg-fig"><img src="{u}" width="{w}" height="{h}" loading="lazy" alt="Página de un tema clínico de NikaMed con diagnóstico, banderas rojas y tratamiento"><figcaption>Cada tema tiene su página con el resumen completo.</figcaption></figure>'
    imgs = f'<div class="mg-sec"><h2>En imágenes</h2><div class="mg-figs">{shot}{cards}</div></div>'
    faq = ''.join(f'<details class="mg-q"><summary>{e(q)}</summary><p>{e(a_)}</p></details>' for q, a_ in g['faq'])
    rel = ''.join(f'<a href="/{s}.html">{e(REL_NOMBRE.get(s, s))}<small>Guía de estudio</small></a>' for s in g['relacionadas'])
    cta = ('<div class="mg-cta"><h2>Llevá esta guía a la práctica</h2><p>Creá tu cuenta gratis en NikaMed y practicá con flashcards, simuladores y atlas 3D. Si ya tenés usuario, ingresá al campus.</p>'
           '<div class="row"><a class="btn-primary" href="/index.html#crear-cuenta">Crear cuenta gratis</a><a class="btn-ghost" href="/index.html#ingresar">Ingresar al campus</a></div></div>')
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "NikaMed", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Guías", "item": SITE + "/guias.html"},
            {"@type": "ListItem", "position": 3, "name": g['h1'], "item": url}]},
        {"@type": "Article", "headline": g['h1'], "description": g['desc'], "inLanguage": "es-AR", "image": img, "url": url, "mainEntityOfPage": url,
         "datePublished": FECHA, "dateModified": FECHA, "isAccessibleForFree": True,
         "author": {"@type": "Organization", "name": "NikaMed", "url": SITE + "/"},
         "publisher": {"@type": "Organization", "name": "NikaMed | Campus Nika", "url": SITE + "/", "logo": {"@type": "ImageObject", "url": SITE + "/assets/N%20NIKA.png"}}},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a_}} for q, a_ in g['faq']]},
    ]}
    nav, foot = G.nav_footer()
    chips = ''.join(f'<span class="g-chip">{e(c)}</span>' for c in g['chips'])
    page = G.head(g['title'], g['desc'], url, img, ld).replace('</head>', f'<style>{CSS_GN}</style>' + M.CSS + '\n</head>', 1) + nav + f"""
    <header class="legal-hero art-hero g-hero">
        <span class="g-orb a"></span><span class="g-orb b"></span>
        <div class="g-hero-ico">{g['ico']}</div>
        <span class="legal-eyebrow">{e(g['eyebrow'])}</span>
        <h1>{e(g['h1'])}</h1>
        <p class="legal-meta">Actualizado el 16 de octubre de 2026</p>
        <div class="g-chips">{chips}</div>
    </header>
    <main>
        <a class="back-link" href="/guias.html">← Todas las guías</a>
        <div class="glass-box summary g-rv"><p>{g['resumen']}</p></div>
        {cuerpo}
        {imgs}
        <div class="mg-sec" id="preguntas-frecuentes"><h2>Preguntas frecuentes</h2>{faq}</div>
        <div class="mg-sec"><h2>Guías relacionadas</h2><div class="gn-rel">{rel}</div></div>
        {cta}
        <p class="tm-aviso">Material educativo para estudiantes de medicina. Resume guías y consensos de sociedades científicas y la bibliografía validada de la cátedra; no reemplaza la guía vigente completa, el protocolo de la institución ni el juicio del médico tratante.</p>
    </main>
    {foot}
<script src="/js/guias.js?v=2" defer></script>
<script src="/js/navmovil.js?v=1" defer></script>
</body></html>
"""
    open(os.path.join(ROOT, g['slug'] + '.html'), 'w', encoding='utf8').write(page)
    return url, img

def main():
    caps = M.capturas()
    sp = os.path.join(ROOT, 'sitemap.xml')
    sm = open(sp, encoding='utf8').read()
    for g in GUIAS:
        url, img = pagina(g, caps)
        sm = re.sub(r'\s*<url>\s*<loc>' + re.escape(url) + r'</loc>.*?</url>', '', sm, flags=re.S)
        add = ('  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n'
               '    <image:image>\n      <image:loc>%s</image:loc>\n      <image:title>%s</image:title>\n      <image:caption>%s</image:caption>\n    </image:image>\n  </url>\n') % (url, FECHA, img, e(g['h1']), e(g['desc']))
        sm = sm.replace('</urlset>', add + '</urlset>')
        print('ok', g['slug'])
    open(sp, 'w', encoding='utf8').write(sm)
    # tarjetas en guias.html
    gp = os.path.join(ROOT, 'guias.html')
    s = open(gp, encoding='utf8', newline='').read()
    s = re.sub(r'<!--gn:start-->.*?<!--gn:end-->', '', s, flags=re.S)
    cards = '<!--gn:start-->' + ''.join(
        f'<a class="hub-card g-rv" href="{g["slug"]}.html"><div class="ic">{g["ico"]}</div><h2>{e(g["h1"])}</h2><p>{e(g["desc"])}</p></a>\n            ' for g in GUIAS) + '<!--gn:end-->'
    i = s.index('<a class="hub-card g-rv" href="temas-clinicos.html"')
    s = s[:i] + cards + s[i:]
    open(gp, 'w', encoding='utf8', newline='').write(s)

if __name__ == '__main__':
    main()
