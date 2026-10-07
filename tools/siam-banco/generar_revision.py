#!/usr/bin/env python
"""Genera REVISION_CLINICA_SIAM_CHOICES.md: que se cambio en el banco choice de SIAM y que preguntas conviene validar
(las que tienen opciones reescritas, porque la justificacion se redacto contra el texto original)."""
import glob, json, os, re, collections
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
fuente = {}
for u in json.load(open(os.path.join(RAIZ, 'tools/siam-banco/fuente_choices.json'), encoding='utf-8'))['unidades']:
    for p in u['preguntas']:
        fuente[p['id']] = p
parches = {}
for f in sorted(glob.glob(os.path.join(RAIZ, 'tools/siam-banco/parches/UP*.json'))):
    parches.update(json.load(open(f, encoding='utf-8')))

reescritas, colas, enunciado = collections.defaultdict(list), collections.defaultdict(list), collections.defaultdict(list)
for pid, ops in parches.items():
    up = pid.split('-')[1]
    if any(k in ('a', 'b', 'c', 'd') for k in ops):
        reescritas[up].append(pid)
    if any(k.endswith('+') for k in ops):
        colas[up].append(pid)
    if 'p' in ops:
        enunciado[up].append(pid)

lineas = ['# Revisión clínica · S.I.A.M. choices', '',
          'Auditoría del banco `data/UP1..UP9_siam.json` (892 preguntas). Archivos fuente y herramientas: `tools/siam-banco/`.', '',
          '## Qué se corrigió en las 892 preguntas', '',
          '- **Ortografía**: ~110 correcciones puntuales (tildes faltantes y errores de tipeo: *aministración, broncoespamo, calremia, dextrucción, dupación, moviemiento, périda, ronpatía → roncopatía*, etc.), anglicismos sueltos (*Because, mediated, extracellular, interstitial, Trimethoprim*) y "hipertiroidismo felino".',
          '- **Notación**: `K^+`, `V_1`, `Ca^{2+}`, `\\sqrt{RR}` → `K⁺`, `V₁`, `Ca²⁺`, `√RR`; entidades HTML (`&gt;`) → símbolos.',
          '- **Gramática**: conjunción *y → e* ante `i-`/`hi-`; palabras repetidas.',
          '- **Longitud de opciones**: antes la correcta era la más larga en el **79 %** de las preguntas (el azar daría 25 %). Ahora lo es en el **34 %**, y nunca supera 1,3 veces a la opción más larga que no es la correcta.',
          '- **Letras correctas parejas**: A 225 · B 224 · C 223 · D 220.',
          '- **Sin menciones a UNER** (0).', '',
          '## ❓ Qué conviene validar (NotebookLM)', '',
          'Para equilibrar longitudes se **reescribieron o ampliaron opciones**. La justificación detallada (Nikamed+) está redactada contra el texto original de cada opción, así que conviene verificar:',
          '1. que la opción correcta siga siendo la única correcta tras acortarla;',
          '2. que los distractores ampliados sigan siendo claramente incorrectos y coherentes con lo que dice la justificación.', '',
          '| UP | Opciones reescritas | Distractor ampliado con "cola" | Enunciado corregido |', '|---|---|---|---|']
for n in range(1, 10):
    up = f'UP{n}'
    lineas.append(f'| {up} | {len(reescritas[up])} | {len(colas[up])} | {len(enunciado[up])} |')
lineas += ['', '### IDs con opciones reescritas', '']
for n in range(1, 10):
    up = f'UP{n}'
    if reescritas[up]:
        lineas.append(f'**{up}**: ' + ', '.join(i.replace('SIAM-', '') for i in sorted(reescritas[up])))
        lineas.append('')
lineas += ['### Cómo reconstruir el banco', '',
           '```bash', 'PYTHONIOENCODING=utf8 python tools/siam-banco/construir_banco.py   # choices (data/UPn_siam.json)',
           'PYTHONIOENCODING=utf8 python tools/siam-banco/construir_escrito.py  # escrito (data/escrito_siam.json)',
           'PYTHONIOENCODING=utf8 python tools/siam-banco/construir_sala.py <docx> # sala de estudio (data/siam_data.json)',
           'PYTHONIOENCODING=utf8 python tools/siam-banco/medir.py              # métricas de longitud y letras', '```', '']
open(os.path.join(RAIZ, 'REVISION_CLINICA_SIAM_CHOICES.md'), 'w', encoding='utf-8', newline='\n').write('\n'.join(lineas))
print('ok', {k: len(v) for k, v in reescritas.items()})
