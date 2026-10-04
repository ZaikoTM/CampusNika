import json, os
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
d = json.load(open('data/acreditaciones/siam/sv.json', encoding='utf8'))
ins = json.load(open('data/acreditaciones/siam/instrumental_sv.json', encoding='utf8'))
L = []
w = L.append
w('# Revisión clínica — Colocación de sonda vesical (SIAM)\n')
w('Documento para validar con la cátedra o con tu criterio. **Marcá cada afirmación** con ✅ (es real), ❌ (es incorrecta) o ⚠ (depende / hay que matizar) y pasame las correcciones.\n')
w('Todo lo que sigue lo escribí yo a partir de conocimiento clínico general y de las listas de cotejo; los **30 pasos** salen textualmente de la lista de cotejo de la cátedra.\n')
n = 0
def item(txt, extra=''):
    global n
    n += 1
    w(f'{n}. [ ] {txt}{extra}')

w('\n## A. Mesa de instrumental (material correcto)\n')
for i in ins['items']:
    if i['correcto']:
        sx = {'F': ' *(mujer)*', 'M': ' *(varón)*'}.get(i.get('sexo'), '')
        w(f"**{i['nombre']}**{sx}{' — CRÍTICO' if i.get('critico') else ''}  ")
        w(f"- Detalle: {i['detalle']}  ")
        item(f"Descripción: {i['descripcion']}")
        item(f"Mensaje si falta: {i['falta']}")
        w('')
w('\n## B. Mesa de instrumental (distractores: por qué están mal)\n')
for i in ins['items']:
    if not i['correcto']:
        w(f"**{i['nombre']}**{' — GRAVE' if i.get('critico') else ''}  ")
        w(f"- Detalle: {i['detalle']}  ")
        item(f"Descripción: {i['descripcion']}")
        item(f"Por qué es incorrecto: {i['feedback']}")
        w('')
w('\n## C. Pasos de la lista de cotejo y explicación de cada uno\n')
w('El texto del paso es de la cátedra. Valido la **explicación** que agregué.\n')
for p in d['pasos']:
    w(f"**Paso {p['n']}**{' — CRÍTICO' if p['critico'] else ''}{' (solo varón)' if p.get('solo')=='M' else ''}: {p['texto']}  ")
    item(f"Explicación: {p['explica']}")
    w('')
w('\n## D. Machete clínico (perlas)\n')
for x in d['machete']['perlas']:
    item(f"**{x['t']}:** {x['x']}")
w('\n### Notas por paso (modo guiado)\n')
for k, v in d['machete']['por_paso'].items():
    item(f"Paso {k}: {v}")
w('\n### Referencias\n')
for r in d['machete']['referencias']:
    item(r)
w('\n## E. Acciones incorrectas del examen (por qué penalizan)\n')
for x in d['distractores']:
    item(f"“{x['texto']}”{' — GRAVE (desaprueba)' if x['critico'] else ''}: {x['porque']}")
w('\n## F. Preguntas de fundamentos\n')
for q in d['fundamentos']:
    w(f"**{q['q']}**  ")
    for k, o in enumerate(q['o']):
        w(f"- {'**(correcta)** ' if k == q['c'] else ''}{o}  ")
    item(f"Explicación: {q['e']}")
    w('')
w('\n## G. Casos clínicos del examen\n')
for c in d['casos']:
    item(f"{'Mujer' if c['sexo']=='F' else 'Varón'} de {c['edad']} años: {c['motivo']}")
w('\n## H. Reglas de desaprobación\n')
item(d['criterios_texto'])
item(f"Umbral de aprobación: {d['umbral']} % (además de no fallar ningún crítico).")
open('REVISION_CLINICA_SIAM_SONDA_VESICAL.md', 'w', encoding='utf8').write('\n'.join(L) + '\n')
print('items a validar:', n)
