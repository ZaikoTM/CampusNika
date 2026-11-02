# -*- coding: utf-8 -*-
"""UP11: fichas nuevas del programa que faltaban, sobre el Manual de Urologia SCHU 3.ª ed. (cancer de prostata: riesgo y tratamiento; cancer de via urinaria alta)."""
from base import I, A, F, D
from rev4 import SCHU
from rev6 import nueva as _n
import rev6
CONTENIDO = {}
NUEVAS = []

def nueva(*a, **k):
    _n(*a, **k); NUEVAS.append(rev6.NUEVAS.pop())

nueva('cx-cancer-prostata-riesgo-tratamiento', 'Cáncer de próstata: grupos de riesgo y tratamiento del localizado',
 ['cancer de prostata', 'vigilancia activa', 'prostatectomia radical', 'radioterapia', 'braquiterapia', 'damico', 'protect', 'isup'],
 'Adenocarcinoma de la próstata. El tratamiento del cáncer localizado y localmente avanzado sigue siendo controvertido: se elige según el grupo de riesgo, la expectativa de vida, los efectos adversos esperables y la preferencia del paciente.',
 ['Los grupos de riesgo (EAU, NCCN, AUA) combinan el grado ISUP de la biopsia, el APE y el estadio clínico, siguiendo el sistema de D\'Amico. El riesgo intermedio se divide en favorable y desfavorable.',
  'Muy bajo riesgo: cT1c, ISUP 1, APE menor de 10 con menos de 3 cores positivos y densidad de APE menor de 0,15. Alto riesgo: ISUP 4 a 5, APE mayor de 20 o cT3 a cT4 (Manual SCHU, cap. 26).',
  'Los nomogramas (tablas de Partin, Kattan) predicen la extensión, el compromiso ganglionar y los resultados tras el tratamiento, y orientan sobre la linfadenectomía pelviana.'],
 ['Estadificación clínica con tacto rectal, APE, resonancia multiparamétrica y biopsia; PET-TC en casos seleccionados.'],
 [{'titulo': 'Opciones para el cáncer localizado', 'pasos': [
    {'etiqueta': 'Vigilancia activa', 'texto': 'Monitoreo estructurado del cáncer indolente de bajo riesgo en pacientes jóvenes, con tratamiento curativo si hay progresión. A diferencia de la observación expectante, busca diferir el tratamiento sin perder el control oncológico.'},
    {'etiqueta': 'Prostatectomía radical', 'texto': 'Extirpación de la próstata y las vesículas seminales, con linfadenectomía pelviana en algunos casos; es curativa en el localizado o localmente avanzado.'},
    {'etiqueta': 'Radioterapia', 'texto': 'Externa o braquiterapia (de baja o alta tasa); en riesgo intermedio, braquiterapia más radioterapia externa y 4 a 6 meses de hormonoterapia.'},
    {'etiqueta': 'Evidencia (ProtecT, 15 años)', 'texto': 'Mortalidad específica baja y sin diferencias entre vigilancia (3,1 %), cirugía (2,2 %) y radioterapia (2,9 %); las metástasis fueron más frecuentes en vigilancia (9,4 % contra 4,7 % y 5,0 %). La elección se basa en riesgos, efectos secundarios y calidad de vida.'}]}],
 ['Seguimiento con APE y control periódico; en vigilancia activa, repetir estudios para detectar progresión.'],
 ['Un APE elevado exige biopsia antes de tratar; no se trata sin estadificar el riesgo.', 'En vigilancia activa, la progresión biológica es la indicación de tratamiento curativo.'],
 dict(titulo='Cáncer de próstata localizado (Manual SCHU 2025)', nodos=[
   I('Cáncer de próstata confirmado por biopsia: ISUP, APE, estadio clínico y resonancia'),
   A('Clasificar el riesgo (EAU, NCCN o AUA) y estimar con nomogramas la extensión y el compromiso ganglionar'),
   D('¿Muy bajo o bajo riesgo, paciente con expectativa de vida larga y tumor indolente?',
     [F('Vigilancia activa con controles estructurados; tratamiento curativo si hay progresión')],
     [D('¿Riesgo intermedio o alto, o localmente avanzado?',
        [D('¿Paciente apto y que elige cirugía?',
           [F('Prostatectomía radical ± linfadenectomía pelviana según el riesgo ganglionar')],
           [F('Radioterapia externa o braquiterapia, con hormonoterapia 4 a 6 meses en riesgo intermedio combinado')])],
        [F('Decisión compartida según efectos secundarios y calidad de vida (ProtecT: resultados equivalentes)')])])]),
 SCHU('26', 'Cáncer de próstata'))

nueva('cx-cancer-via-urinaria-alta', 'Cáncer de la vía urinaria alta (pelvis renal y uréter)',
 ['carcinoma urotelial alto', 'cancer de pelvis renal', 'cancer de ureter', 'nefroureterectomia', 'sindrome de lynch', 'arsenico'],
 'Tumor urotelial de la pelvis renal o del uréter, poco frecuente y con recidiva en la vejiga. Los factores de riesgo son similares a los del cáncer de vejiga; el tabaquismo está presente en cerca del 65 % y la exposición al arsénico es relevante en Chile.',
 ['Hematuria en el 60 a 80 %; dolor en el flanco, anorexia y pérdida de peso suelen indicar enfermedad más avanzada. Entre el 15 y el 33 % se descubre de forma incidental.',
  'Sospechar síndrome de Lynch si el diagnóstico es antes de los 60 años o hay antecedentes personales o familiares del espectro (colon, endometrio, estómago, ovario): consejería genética.'],
 ['Laboratorio (función renal y hemograma), UroTC como estudio de imagen estándar (precisión de hasta el 88 % para el estadio T; menos sensible en tumores planos o menores de 3 mm) y ureteroscopía con biopsia y citología. La TC de tórax es obligatoria para buscar metástasis.',
  'La ureteroscopía se correlaciona con la nefroureterectomía en solo 43 a 60 % para el estadio y 87 a 93 % para el grado.'],
 [{'titulo': 'Tratamiento del localizado', 'pasos': [
    {'etiqueta': 'Bajo riesgo', 'texto': 'Tratamiento endoscópico conservador de nefronas, por ureteroscopía flexible con láser de holmio (ablación), con ureteroscopía de revisión a las 6 a 8 semanas y catéter doble J por al menos una semana; resultados oncológicos equivalentes a la nefroureterectomía en tumores de bajo riesgo. Se abandona la vía percutánea por riesgo de siembra tumoral.'},
    {'etiqueta': 'Ureterectomía distal', 'texto': 'Con reimplante, en tumores del uréter distal de bajo riesgo o de alto riesgo cuando hay que preservar el riñón.'},
    {'etiqueta': 'Alto riesgo', 'texto': 'Nefroureterectomía radical abierta con resección del manguito vesical (estándar), sin abrir la vía urinaria; el abordaje laparoscópico tiene control oncológico equivalente.'}]}],
 ['Seguimiento estricto con cistoscopía y UroTC; ureteroscopía con citología en los tumores de alto grado.'],
 ['La ureteroscopía aumenta el riesgo de recidiva en la vejiga.', 'Hematuria con UroTC normal: completar con ureteroscopía.'],
 dict(titulo='Tumor urotelial de la vía urinaria alta (Manual SCHU 2025)', nodos=[
   I('Hematuria o lesión en la pelvis renal o el uréter en la UroTC'),
   A('Ureteroscopía con biopsia y citología; TC de tórax; considerar Lynch si es menor de 60 años'),
   D('¿Tumor de bajo riesgo según la estratificación del manual?',
     [D('¿Es del uréter distal?',
        [F('Ureterectomía distal con reimplante, o ablación endoscópica con láser')],
        [F('Ablación por ureteroscopía flexible con láser, revisión a las 6 a 8 semanas y seguimiento estricto')])],
     [D('¿Es de alto riesgo?',
        [F('Nefroureterectomía radical con resección del manguito vesical')],
        [F('Si es del uréter distal y hay que preservar el riñón, ureterectomía distal con reimplante')])])]),
 SCHU('24', 'Cáncer de vía urinaria alta'))
