import json, os
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
R = lambda p: json.load(open(p, encoding='utf8'))
def et(n): return str(n) if float(n).is_integer() else (str(int(n)) + ' bis')
INTRO = {
 'lav': dict(nombre='Lavado de manos quirúrgico y colocación de guantes', archivo='LAVADO_QUIRURGICO', fuente='«Lista de cotejo: Lavado de manos quirúrgico y colocación de guantes – UP 1» (22 ítems)',
   como=['**Casos (3):** cirugía programada (colecistectomía), **alergia al látex** (hernioplastia: cambian los guantes que corresponden) y urgencia (apendicectomía).',
         '**3D:** lavabo quirúrgico con canilla de palanca y chorro de agua, **manos y antebrazos reales**, espuma que se extiende de distal a proximal y se enjuaga, aro guía de hasta dónde se lava, **cronómetro** de 3 a 5 minutos, manos en alto, canilla cerrada con el codo, secado con compresa estéril y **colocación de los guantes** sobre un paquete con solapas que se abre.',
         '**Mesa:** ambo, gorro, barbijo, botas, jabón antiséptico con dosificador, cepillo estéril, limpiauñas, compresas estériles y guantes estériles (o sin látex si hay alergia); distractores: alcohol en gel, jabón en barra, toalla de tela, estropajo, reloj y anillos, guantes de examen.'],
   dudas=['La lista **no define pasos críticos ni criterios de desaprobación**. Propuse como críticos: vestimenta (1), retirar accesorios (2), cepillado (7), lavado de antebrazos de distal a proximal (8), enjuague (9), manos en alto (12), secado con compresas estériles (14) y los dos primeros tiempos del enguantado (19, 20). ¿Cuáles son los reales?',
          'Los tres lavados de la lista llegan a: **2,5 cm por encima del codo**, **3 cm por debajo del codo** y **3 cm por encima de la muñeca**. ¿Es así (orden y zonas) o es una errata de la planilla? ¿Cuántos minutos corresponde a cada uno?',
          'La planilla dice que la duración total es de **3 a 5 minutos**. ¿Se evalúa con cronómetro y se penaliza lavarse menos de 3 minutos (lo modelé como acción incorrecta grave)?',
          'Paso 13: «Cierra la canilla con el codo **cuando sea manual**». ¿Cómo se evalúa si la canilla es de pedal o automática (caso c3)?',
          'Pasos 15 a 22: ¿se evalúa la técnica **abierta** (la de la lista) o también la cerrada? ¿Qué se espera exactamente en «Introduce los dedos en el segundo guante sin contaminar el guante colocado»?',
          'Alergia al látex: ¿la cátedra espera que el alumno pregunte o verifique el tipo de guante? Lo modelé sólo en la mesa de instrumental.',
          '¿El alcohol en gel puede reemplazar el cepillado en alguna situación que la cátedra acepte? Hoy es acción incorrecta grave.'],
   critic=True),
}
def generar(id):
    I = INTRO[id]; d = R(f'data/acreditaciones/cir/{id}.json'); ins = R(f'data/acreditaciones/cir/instrumental_{id}.json')
    L = []; w = L.append
    w(f"# Revisión clínica · {I['nombre']} (Cirugía)\n")
    w(f"Estado: **BORRADOR para validar con NotebookLM** contra {I['fuente']} y la bibliografía de la cátedra. Todo lo marcado con ❓ es una decisión mía que necesita confirmación clínica.\n")
    w('## Cómo funciona el simulador\n')
    for t in I['como']: w('- ' + t)
    w(f"\nFuente de la lista: {d['fuente']}. Pasos: **{len(d['pasos'])}** (incluye los pasos que aparecen solo en algunos casos). Casos: **{len(d['casos'])}**. Preguntas de fundamentos: **{len(d['fundamentos'])}**.\n")
    w('## Criterios de desaprobación (PROPUESTOS ❓)\n')
    w(d.get('criterios_texto', '') + '\n')
    for c in d.get('criterios', []): w(f"- {c['ico']} **{c['titulo']}** — pasos {', '.join(str(x) for x in c['pasos'])}")
    crit = [et(p['n']) for p in d['pasos'] if p['critico']]
    w(f"\nPasos que el simulador marca como críticos ❓: {', '.join(crit) if crit else 'ninguno'}\n")
    w('## Dudas puntuales para NotebookLM\n')
    for i, t in enumerate(I['dudas'], 1): w(f'{i}. {t}')
    w('\n## Casos clínicos\n')
    for c in d['casos']:
        extra = f" — {', '.join(c['extra'])}" if c.get('extra') else ''
        w(f"**{c['id']} · {c['nombre']} ({c['edad']} años){extra}**  ")
        w(f"Motivo: {c['motivo']}  ")
        w(f"Antecedentes: {c['antecedentes']}\n")
    w('## Mesa de instrumental\n')
    for g in ins['grupos']:
        w(f"**{g['titulo']}**")
        for i in ins['items']:
            if i['grupo'] == g['id']:
                m = '✅ correcto' + (' · CRÍTICO' if i.get('critico') else '') + (' · opcional' if i.get('opcional') else '') if i['correcto'] else '❌ distractor'
                w(f"- {i['nombre']} — {m}. {i['descripcion'] if i['correcto'] else i.get('feedback', '')}")
        w('')
    w('## Acciones incorrectas que reconoce el chat\n')
    for x in d['distractores']: w(f"- {'🚨 GRAVE · ' if x['critico'] else ''}{x['texto']} — {x['porque']}")
    w('\n## Pasos, fundamento y frase del alumno modelo\n')
    ej = d['casos'][0]['id']
    for p in d['pasos']:
        fr = (p.get('frases_caso') or {}).get(ej) or p['frase']
        w(f"**{et(p['n'])}. {p['texto']}**{' ⚠ crítico' if p['critico'] else ''}{' *(solo en algunos casos)*' if (p.get('solo_si') or p.get('sin_si') or p.get('solo_contra')) else ''}  ")
        w(f"Fundamento: {p['explica']}  ")
        w(f"Frase modelo: “{fr}”\n")
    w('## Preguntas de fundamentos\n')
    for i, q in enumerate(d['fundamentos'], 1): w(f"{i}. {q['q']}  \n   Respuesta correcta: **{q['o'][q['c']]}**. {q['e']}")
    open(f"REVISION_CLINICA_CIR_{I['archivo']}.md", 'w', encoding='utf8').write('\n'.join(L) + '\n')
    print('MD', id, len(L), 'lineas')
for k in INTRO: generar(k)
