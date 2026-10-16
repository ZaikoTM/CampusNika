#!/usr/bin/env python3
"""Suma a cada guía: imágenes reales, FAQ visible + FAQPage, temas clínicos relacionados y llamado a ingresar/crear cuenta.
Es idempotente (usa marcadores). Uso: python tools/mejorar_guias.py  (desde la raíz del repo)"""
import json, os, re, html
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
e = html.escape
SITE = 'https://nikamed.com.ar'

# capturas reales -> webp
CAP = {'home': 'Inicio de NikaMed', 'temas': 'Biblioteca de temas clínicos de NikaMed', 'tema': 'Ficha de un tema clínico en NikaMed (apendicitis aguda)', 'guias': 'Guías de estudio de NikaMed', 'flashcards': 'Guía del Simulador FlashCard de NikaMed'}
def capturas():
    out = {}
    for k in CAP:
        src = os.path.join(ROOT, 'assets/capturas', k + '.png')
        dst = os.path.join(ROOT, 'assets/capturas', f'nikamed-{k}.webp')
        if os.path.exists(src):
            im = Image.open(src).convert('RGB')
            im.thumbnail((1100, 1100), Image.LANCZOS)
            im.save(dst, 'WEBP', quality=82, method=6)
            out[k] = (f'/assets/capturas/nikamed-{k}.webp', im.size)
    return out

GUIAS = {
 'guia-ecoe-medicina': dict(
   temas=['cx-asepsia-higiene-manos', 'cx-suturas-materiales-nudos', 'cx-herida-aguda', 'cx-inmovilizaciones-yeso', 'cx-trauma-evaluacion-primaria', 'cx-evaluacion-preoperatoria'],
   caps=['tema', 'temas'],
   faq=[('¿Qué es un ECOE?', 'El ECOE (Examen Clínico Objetivo Estructurado, OSCE en inglés) evalúa habilidades clínicas en un circuito de estaciones cronometradas, cada una con una consigna y una lista de cotejo que usa el evaluador.'),
        ('¿En qué se diferencia de un examen choice?', 'En un choice alcanza con reconocer la respuesta; en el ECOE hay que saber hacer y decir frente a un evaluador, siguiendo pasos en orden y cuidando la bioseguridad.'),
        ('¿Cómo me preparo para el ECOE?', 'Estudiá cada procedimiento con su lista de cotejo, practicalo en voz alta y en orden, y repetí hasta que no dependas de apuntes. NikaMed tiene guías, fichas y atlas 3D para practicar.'),
        ('¿Puedo practicar procedimientos en NikaMed?', 'Sí. Al crear tu cuenta gratis accedés a las flashcards y al campus con simuladores y atlas 3D de procedimientos.')]),
 'guia-procedimientos-ecoe-lista-de-cotejo': dict(
   temas=['cx-asepsia-higiene-manos', 'cx-suturas-materiales-nudos', 'cx-profilaxis-antibiotica', 'cx-isq-paquete', 'cx-herida-aguda', 'cx-ostomias'],
   caps=['tema', 'temas'],
   faq=[('¿Qué es una lista de cotejo?', 'Es el listado de pasos observables que el evaluador marca durante una estación práctica. Estudiarla te muestra exactamente qué se evalúa y en qué orden.'),
        ('¿Por qué importa el orden de los pasos?', 'Porque en un procedimiento el orden y la bioseguridad pesan tanto como la técnica: omitir un paso crítico puede invalidar la estación.'),
        ('¿Cuáles son los 5 momentos de la higiene de manos?', 'Los define la OMS: antes de tocar al paciente, antes de un procedimiento limpio o aséptico, después del riesgo de exposición a fluidos, después de tocar al paciente y después de tocar su entorno.'),
        ('¿Cómo practico una lista de cotejo?', 'Leela, repetí el procedimiento en voz alta y en orden, y verificá cada ítem. En NikaMed podés repasar fichas relacionadas con procedimientos de Cirugía.')]),
 'guia-casos-clinicos-razonamiento': dict(
   temas=['cx-abdomen-agudo-enfoque', 'cx-trauma-evaluacion-primaria', 'cx-shock-hemorragico', 'cx-apendicitis-aguda', 'obs-hipertension', 'gin-ectopico'],
   caps=['temas', 'tema'],
   faq=[('¿Cómo se resuelve un caso clínico paso a paso?', 'Con un orden fijo: identificar los datos clave, plantear hipótesis, decidir estudios, definir conducta y justificarla. Seguir siempre la misma secuencia evita saltar a conclusiones.'),
        ('¿Qué sesgos hacen errar en un caso?', 'Los más comunes son anclarse en la primera hipótesis, buscar solo lo que la confirma y cerrar el caso demasiado pronto. La guía los describe con ejemplos.'),
        ('¿Qué es SPIKES?', 'Es un protocolo de seis pasos para comunicar malas noticias: preparar el entorno, evaluar qué sabe el paciente, pedir permiso, informar, responder a las emociones y acordar un plan.'),
        ('¿Dónde practico casos clínicos?', 'En el campus de NikaMed hay simuladores de casos con asistencia inteligente. Creá tu cuenta gratis para empezar.')]),
 'guia-como-estudiar-medicina': dict(
   temas=['cx-apendicitis-aguda', 'cx-colecistitis-aguda', 'cx-hernia-inguinal', 'obs-dg', 'gin-sop', 'obs-hipertension'],
   caps=['home', 'temas'],
   faq=[('¿Por qué releer no alcanza para aprender?', 'Porque da sensación de familiaridad sin entrenar la recuperación. La evidencia sobre aprendizaje favorece el repaso activo: intentar recordar sin mirar.'),
        ('¿Qué es la repetición espaciada?', 'Repasar un tema justo antes de olvidarlo, con intervalos cada vez más largos. Combinada con preguntas y flashcards, mejora la retención a largo plazo.'),
        ('¿Sirve la técnica Pomodoro para estudiar Medicina?', 'Sí, ayuda a sostener la atención con bloques cortos y pausas. NikaMed incluye un Pomodoro integrado para estudiar solo o acompañado.'),
        ('¿Cómo organizo mi semana de estudio?', 'Repartí unidades por prioridad, alterná lectura y práctica activa, y cerrá cada día con un repaso corto. La guía incluye un ejemplo de semana.')]),
 'guia-plan-de-estudio-finales-medicina': dict(
   temas=['cx-apendicitis-aguda', 'cx-pancreatitis-aguda', 'obs-dg', 'gin-sop', 'cx-fractura-cadera', 'obs-hipertension'],
   caps=['home', 'guias'],
   faq=[('¿Cómo armo un plan de estudio para un final?', 'Partí de la fecha del examen, listá las unidades, ordenalas por prioridad y por tus puntos débiles, y repartí las semanas con repasos al cierre de cada día.'),
        ('¿Cuántas horas por día debería estudiar?', 'Depende de tu punto de partida y del tiempo que tengas; lo importante es que el plan sea realista y sostenible, con repaso activo y descansos.'),
        ('¿Cómo priorizo las unidades?', 'Poné primero las de mayor peso en el examen y las que peor dominás, y dejá para el final un repaso integrador.'),
        ('¿Puedo usar NikaMed para planificar?', 'Sí. Con tu cuenta tenés el planificador, el Pomodoro y simuladores para medir cómo vas antes de la fecha.')]),
 'guia-preguntas-choice-medicina': dict(
   temas=['obs-hipertension', 'obs-dg', 'cx-pancreatitis-aguda', 'cx-diverticulitis', 'gin-ectopico', 'cx-fractura-cadera'],
   caps=['tema', 'home'],
   faq=[('¿Cómo resuelvo una pregunta choice?', 'Leé el enunciado y pensá la respuesta antes de mirar las opciones; después descartá las incorrectas con criterio y justificá la que elegís.'),
        ('¿Cómo descarto opciones?', 'Buscá las que contradicen el caso, las absolutas («siempre», «nunca») y las que corresponden a otra situación clínica. Quedate con la más completa para el contexto.'),
        ('¿Qué hago con mis errores?', 'Anotá por qué fallaste (conocimiento, lectura o sesgo) y volvé a ese tema con una ficha o una pregunta nueva.'),
        ('¿Dónde practico preguntas choice?', 'En los simuladores del campus de NikaMed, con preguntas por unidad y devolución. Creá tu cuenta gratis.')]),
 'guia-pfo-practica-final-obligatoria': dict(
   temas=['cx-trauma-evaluacion-primaria', 'obs-hipertension', 'cx-abdomen-agudo-enfoque', 'cx-quemaduras', 'cx-eami-claudicacion', 'gin-tamizaje-ccu'],
   caps=['home', 'temas'],
   faq=[('¿Qué es la PFO?', 'La Práctica Final Obligatoria es el tramo final de la carrera de Medicina en Argentina: un período de práctica supervisada en servicios de salud que completa la formación de grado.'),
        ('¿La PFO es igual en todas las facultades?', 'No. Hay un marco nacional, pero cada universidad tiene su reglamento, con diferencias en rotaciones, duración y regularidad.'),
        ('¿Cómo me preparo antes de empezar?', 'Revisá el reglamento de tu facultad, repasá los temas de las rotaciones y practicá casos y procedimientos. NikaMed tiene herramientas para eso.'),
        ('¿NikaMed tiene algo para la PFO?', 'Sí, una sala de estudio y simuladores pensados para el tramo final. Creá tu cuenta para acceder.')]),
}

def cargar_temas():
    t = {}
    for f in ('data/nikafarma_patologias.json', 'data/flashcards_cirugia.json'):
        d = json.load(open(os.path.join(ROOT, f), encoding='utf8'))
        for p in d['patologias']:
            t[p['id']] = p
    return t

def bloque(slug, cfg, caps, temas):
    figs = ''
    for k in cfg.get('caps', []):
        if k in caps:
            u, (w, h) = caps[k]
            figs += (f'<figure class="mg-fig"><img src="{u}" width="{w}" height="{h}" loading="lazy" alt="{e(CAP[k])}: captura real de la plataforma">'
                     f'<figcaption>{e(CAP[k])}.</figcaption></figure>')
    cards = ''
    for tid in cfg['temas']:
        p = temas.get(tid)
        if not p: continue
        small = f'assets/temas/{tid}-480.webp'
        if os.path.exists(os.path.join(ROOT, small)) and len(cards.split('<figure')) <= 3:
            w, h = Image.open(os.path.join(ROOT, small)).size
            cards += (f'<figure class="mg-fig mg-card"><a href="/temas/{tid}.html"><img src="/{small}" width="{w}" height="{h}" loading="lazy" '
                      f'alt="Flashcard de {e(p["titulo"])} de NikaMed"></a><figcaption>Flashcard: {e(p["titulo"])}</figcaption></figure>')
    imgs = ''
    if figs or cards:
        imgs = f'<div class="mg-sec"><h2>En imágenes</h2><div class="mg-figs">{figs}{cards}</div></div>'
    links = ''.join(f'<a href="/temas/{tid}.html">{e(temas[tid]["titulo"])}<small>{e(temas[tid].get("fuente", {}).get("sociedad", ""))}</small></a>' for tid in cfg['temas'] if tid in temas)
    rel = f'<div class="mg-sec"><h2>Temas clínicos relacionados</h2><div class="mg-links">{links}</div><p class="mg-more"><a href="/temas-clinicos.html">Ver los 141 temas clínicos →</a></p></div>' if links else ''
    faq = ''.join(f'<details class="mg-q"><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in cfg['faq'])
    faqs = f'<div class="mg-sec" id="preguntas-frecuentes"><h2>Preguntas frecuentes</h2>{faq}</div>'
    cta = ('<div class="mg-cta"><h2>Llevá esto a la práctica en el campus</h2>'
           '<p>Creá tu cuenta gratis en NikaMed y accedé a flashcards, simuladores, atlas 3D y planificador de estudio. Si ya tenés usuario, ingresá.</p>'
           '<div class="row"><a class="btn-primary" href="/index.html#crear-cuenta">Crear cuenta gratis</a><a class="btn-ghost" href="/index.html#ingresar">Ingresar al campus</a></div></div>')
    return f'<!--mg:start-->{imgs}{faqs}{rel}{cta}<!--mg:end-->'

CSS = """<!--mg:css--><style>
.mg-sec{margin:26px 0}.mg-sec h2{font-size:1.15rem;font-weight:900;color:#fff;margin-bottom:12px;display:flex;align-items:center;gap:10px}
.mg-sec h2::before{content:'';width:4px;height:18px;background:linear-gradient(180deg,#0ea5e9,#a855f7);border-radius:4px}
.mg-figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}
.mg-fig{margin:0;border:1px solid rgba(56,189,248,.25);border-radius:16px;overflow:hidden;background:rgba(15,23,42,.7)}
.mg-fig img{display:block;width:100%;height:auto}.mg-card img{max-height:380px;object-fit:cover;object-position:top}
.mg-fig figcaption{padding:10px 14px;font-size:.8rem;color:#94a3b8;font-weight:600}
.mg-q{border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(15,23,42,.7);margin:8px 0;overflow:hidden}
.mg-q summary{cursor:pointer;padding:14px 16px;font-weight:800;color:#fff;list-style:none;display:flex;justify-content:space-between;gap:12px}
.mg-q summary::-webkit-details-marker{display:none}.mg-q summary::after{content:'+';color:#c084fc;font-size:1.3rem;line-height:1}
.mg-q[open] summary::after{content:'−'}.mg-q p{padding:0 16px 14px;color:#cbd5e1;font-size:.92rem;margin:0}
.mg-links{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.mg-links a{display:block;padding:12px 14px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(15,23,42,.7);color:#e2e8f0;font-weight:800;font-size:.86rem;text-decoration:none;transition:.2s}
.mg-links a:hover{border-color:#c084fc;transform:translateY(-2px)}.mg-links small{display:block;color:#94a3b8;font-weight:600;margin-top:2px}
.mg-more{margin-top:12px}.mg-more a{color:#38bdf8;font-weight:800;text-decoration:none}
.mg-cta{background:linear-gradient(135deg,rgba(14,165,233,.16),rgba(168,85,247,.18));border:1px solid rgba(168,85,247,.5);border-radius:18px;padding:26px 24px;margin:30px 0;text-align:center}
.mg-cta h2{font-size:1.2rem;font-weight:900;color:#fff;margin-bottom:8px}.mg-cta p{color:#cbd5e1;font-size:.92rem;margin-bottom:16px}
.mg-cta .row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
</style>"""

def procesar(slug, cfg, caps, temas):
    p = os.path.join(ROOT, slug + '.html')
    s = open(p, encoding='utf8', newline='').read()
    nl = '\r\n' if '\r\n' in s else '\n'
    s = s.replace('\r\n', '\n')
    s = re.sub(r'<!--mg:start-->.*?<!--mg:end-->', '', s, flags=re.S)
    s = re.sub(r'<!--mg:css-->.*?</style>', '', s, flags=re.S)
    s = re.sub(r'<script type="application/ld\+json" data-mg>.*?</script>\n?', '', s, flags=re.S)
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in cfg['faq']]}
    s = s.replace('</head>', CSS + '\n<script type="application/ld+json" data-mg>' + json.dumps(ld, ensure_ascii=False) + '</script>\n</head>', 1)
    blk = bloque(slug, cfg, caps, temas)
    # antes del bloque «Practicá lo que acabás de leer» (CTA existente) o, si no está, antes de </main>
    m = re.search(r'<div class="legal-card g-sec[^"]*"[^>]*>\s*<h2>Practicá lo que acabás de leer', s)
    if m: s = s[:m.start()] + blk + s[m.start():]
    else: s = s.replace('</main>', blk + '</main>', 1)
    open(p, 'w', encoding='utf8', newline='').write(s.replace('\n', nl))
    print('ok', slug)

def main():
    caps = capturas(); temas = cargar_temas()
    for slug, cfg in GUIAS.items(): procesar(slug, cfg, caps, temas)

if __name__ == '__main__':
    main()
