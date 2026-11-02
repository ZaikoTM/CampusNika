# -*- coding: utf-8 -*-
"""UP11: fichas nuevas sobre el Manual de Urologia SCHU 3.ª ed. (biopsia de prostata, cancer de pene, trauma vesical y uretral)."""
from base import I, A, F, D
from rev4 import SCHU
from rev6 import nueva as _n
import rev6
CONTENIDO = {}
NUEVAS = rev6.NUEVAS[4:] if False else []

def nueva(*a, **k):
    n = len(rev6.NUEVAS); _n(*a, **k); NUEVAS.append(rev6.NUEVAS.pop())

nueva('cx-biopsia-prostata', 'Biopsia de próstata: indicaciones y técnica',
 ['biopsia de prostata', 'biopsia prostatica', 'psa', 'pirads', 'resonancia multiparametrica', 'transperineal', 'transrectal'],
 'Toma de muestras de la próstata, guiada por ecografía y, cada vez más, dirigida por resonancia magnética, para confirmar un cáncer de próstata clínicamente significativo. Una primera biopsia detecta cáncer en cerca del 30 %.',
 ['La indicación depende del riesgo de cáncer significativo (PSA, tacto rectal, imagen, edad, comorbilidades y consecuencias terapéuticas), discutido con el paciente.',
  'Se recomienda biopsiar con tacto rectal patológico (sea cual sea el PSA), PSA de 4 ng/mL o más según riesgo y beneficio, PSA de 2,5 ng/mL o menos con velocidad de 0,35 ng/mL por año o más, o PSA de 4 ng/mL o más con relación libre/total de 10 % o menos.',
  'No existe un umbral de PSA que descarte el cáncer en ninguna edad. La AUA propone iniciar el cribado a los 45 a 50 años (40 a 45 con factores de riesgo) y repetirlo cada 2 a 4 años entre los 50 y los 69.'],
 ['Resonancia magnética antes de la biopsia: con PIRADS mayor de 3 la sensibilidad para cáncer significativo (ISUP 2 o más) es 96 % y la especificidad 43 %; con PIRADS mayor de 4, 88 % y 64 %. La densidad del PSA junto con la resonancia ayuda a evitar biopsias redundantes.',
  'Las lesiones hipoecoicas de la ecografía deben biopsiarse, pero no son específicas del cáncer (también prostatitis, infarto prostático o linfoma).'],
 [{'titulo': 'Preparación y técnica', 'pasos': [
    {'etiqueta': 'Antes', 'texto': 'Historia y comorbilidades; suspender anticoagulantes y antiagregantes entre 5 y 7 días antes, según el riesgo trombótico; enema rectal el día anterior o esa mañana; consentimiento informado.'},
    {'etiqueta': 'Profilaxis', 'texto': 'Antibiótico profiláctico para reducir infección urinaria, prostatitis o sepsis. Las fluoroquinolonas fueron las de elección, pero por la resistencia se propone individualizar con cultivo rectal.'},
    {'etiqueta': 'Vía y muestreo', 'texto': 'Transrectal guiada por ecografía (esquema sistemático de 12 núcleos, ampliación del de 6 de Hodge) o transperineal; dirigida por resonancia sobre las lesiones sospechosas.'}]}],
 ['Una biopsia negativa no es motivo para dejar el seguimiento: se mantiene el intervalo de control y, sin biopsia previa, se sugiere resonancia.'],
 ['Suspender anticoagulantes y antiagregantes antes del procedimiento.', 'Riesgo de infección posbiopsia (prostatitis, sepsis): enema, profilaxis y cultivo rectal si hay riesgo de resistencia.'],
 dict(titulo='Indicación de biopsia de próstata (Manual SCHU 2025)', nodos=[
   I('Hombre con PSA elevado, tacto rectal alterado o sospecha de cáncer de próstata'),
   D('¿Tacto rectal patológico?',
     [A('Indicar biopsia sin importar el PSA; resonancia previa si es posible')],
     [D('¿PSA de 4 ng/mL o más, o velocidad de PSA mayor, o relación libre/total de 10 % o menos?',
        [A('Resonancia multiparamétrica (PIRADS) y densidad del PSA para valorar el riesgo')],
        [F('Control periódico del PSA según edad y riesgo; ningún valor de PSA descarta el cáncer')])]),
   D('¿PIRADS positivo (3 o más, según el umbral elegido) o riesgo alto por nomograma?',
     [A('Preparar: suspender antiagregantes y anticoagulantes, enema y profilaxis antibiótica'), F('Biopsia dirigida por resonancia más sistemática, transrectal o transperineal')],
     [F('Vigilar y repetir el PSA: puede evitarse una biopsia innecesaria')])]),
 SCHU('4', 'Biopsia de próstata'))

nueva('cx-cancer-pene', 'Cáncer de pene',
 ['cancer de pene', 'carcinoma de pene', 'carcinoma epidermoide', 'penectomia', 'vph', 'linfadenectomia inguinal'],
 'Carcinoma epidermoide del pene, casi siempre del glande o del prepucio. Los tumores centrales (glande y meato) se asocian al VPH y los queratinizantes de bajo grado, de la piel prepucial, se ven más en la periferia.',
 ['Factores de riesgo: fimosis (el más importante; presente en 20 a 60 %), lesiones premalignas, tabaco, número de parejas sexuales y VPH (30 a 50 % de los invasores, sobre todo VPH 16). La circuncisión neonatal es protectora.',
  'La afectación ganglionar inguinal es el factor pronóstico de sobrevida más importante; el cN0 tiene entre 13 y 25 % de micrometástasis.'],
 ['Examen físico cuidadoso del pene y las ingles; biopsia excisional cuando hay dudas o cuando el manejo ganglionar depende de la histología.',
  'Ecografía para el tumor primario y las adenopatías; TC o resonancia de abdomen y pelvis, y PET-TC con FDG si hay ganglios inguinales palpables. Con ganglios palpables es obligatoria la TC de pelvis. Si hay ganglios inguinales positivos se buscan metástasis a distancia, porque no hay diseminación linfática directa a la pelvis.'],
 [{'titulo': 'Tumor primario', 'pasos': [
    {'etiqueta': 'In situ o Ta', 'texto': 'Imiquimod al 5 % o 5-fluorouracilo (respuesta de 40 a 100 % y 48 a 78 %, con recurrencia de 10 a 20 %); si fallan, no se reintenta la terapia tópica. Alternativas: láser (Nd:YAG o CO2), terapia fotodinámica o resurfacing del glande.'},
    {'etiqueta': 'Invasor T1 a T4', 'texto': 'Cirugía conservadora cuando es posible; la resección de lesiones del glande o el prepucio se complementa con circuncisión. En tumores mayores: escisión local, penectomía parcial o total con reconstrucción.'},
    {'etiqueta': 'Ganglios', 'texto': 'La linfadenectomía inguinopélvica es un componente central del tratamiento del invasor; la disección primaria da mejores resultados que esperar a una masa. Según el riesgo se elige vigilancia, etapificación ganglionar invasiva o linfadenectomía radical.'}]}],
 ['Seguimiento oncológico con examen del pene y de las ingles.'],
 ['Fimosis del adulto con lesión que no cura: biopsiar antes de operar.', 'Ganglios palpables: no tratar con antibiótico y esperar, salvo infección clínica; se estudian histológicamente.'],
 dict(titulo='Cáncer de pene (Manual SCHU 2025)', nodos=[
   I('Lesión del glande o el prepucio de un hombre, a menudo con fimosis, que no cura'),
   A('Biopsia excisional y examen de las ingles'),
   D('¿Carcinoma in situ o Ta?',
     [F('Tratamiento tópico (imiquimod o 5-fluorouracilo), láser o resurfacing del glande según extensión')],
     [A('Carcinoma invasor: etapificar con ecografía, TC o resonancia y PET-TC si hay ganglios palpables'),
      D('¿Ganglios inguinales palpables?',
        [A('Estudio histológico de los ganglios y TC de pelvis'), F('Linfadenectomía inguinopélvica y buscar metástasis a distancia; cirugía del primario')],
        [F('Cirugía conservadora o penectomía parcial según el tumor; manejo ganglionar según riesgo (vigilancia, etapificación invasiva o linfadenectomía)')])])]),
 SCHU('29', 'Cáncer de pene'))

nueva('cx-trauma-vesical-uretral', 'Trauma vesical y uretral',
 ['trauma vesical', 'ruptura vesical', 'trauma uretral', 'ruptura uretral', 'fractura de pelvis', 'uretrocistografia retrograda', 'estenosis uretral'],
 'Los traumatismos genitourinarios son infrecuentes y suelen acompañar a lesiones graves del paciente politraumatizado (10 a 20 %), por lo que pasan desapercibidos en la fase aguda. La uretra anterior es la distal al diafragma urogenital y la posterior la que está en él o por encima.',
 ['Sospechar con hematuria macroscópica o sangre en el meato, imposibilidad de orinar o fractura de pelvis. El 90 % de las lesiones de la uretra posterior se asocian a fractura pélvica y entre el 5 y el 10 % de las fracturas pélvicas tienen lesión uretral.',
  'Otras causas: golpe perineal (uretra anterior), fractura de pene, cuerpos extraños y lesiones iatrogénicas por sondaje o cirugía.'],
 ['Paciente estable que orina: examen de orina; con hematuria macroscópica o microhematuria, estudio contrastado (cistografía o TC).',
  'Si no puede orinar: ver el meato; sin sangre, cateterismo suave. Si hay dificultad o sangre en el meato, suspender el sondaje y hacer uretrografía retrógrada. Con confirmación de lesión: uretrocistografía combinada para planificar.'],
 [{'titulo': 'Vejiga', 'pasos': [
    {'etiqueta': 'Contusión y ruptura extraperitoneal', 'texto': 'Manejo conservador en el 80 %: sonda uretrovesical o cistostomía suprapúbica por 2 a 3 semanas, con cistografía o cistoTC antes de retirar la sonda. Se opera si hay lesión del cuello vesical o durante una laparotomía por otras lesiones.'},
    {'etiqueta': 'Ruptura intraperitoneal', 'texto': 'Reparación quirúrgica por laparotomía exploradora con incisión infraumbilical media, sin manipular el hematoma pelviano.'}]},
  {'titulo': 'Uretra', 'pasos': [
    {'etiqueta': 'Fase aguda', 'texto': 'Realineamiento uretral o cistostomía suprapúbica con uretroplastia diferida (asume estenosis casi segura, con menos incontinencia y disfunción eréctil). Exploración urgente si hay un gran hematoma pélvico con amplia separación de los cabos.'},
    {'etiqueta': 'Estenosis', 'texto': 'No se recomienda la uretrotomía interna endoscópica por la fibrosis; se hace uretroplastia, y con estenosis menor de 2,5 cm, excisión y anastomosis primaria.'}]}],
 ['Cistografía antes de retirar la sonda en la lesión vesical; vigilar estenosis, incontinencia y disfunción eréctil tras la lesión uretral.'],
 ['En toda fractura de pelvis descartar de forma dirigida una lesión uretral.', 'Sangre en el meato: no pasar sonda a ciegas; uretrografía retrógrada primero.'],
 dict(titulo='Trauma de la vía urinaria baja (Manual SCHU 2025)', nodos=[
   I('Politraumatizado con fractura de pelvis, hematuria o sangre en el meato'),
   D('¿Hemodinámicamente inestable?',
     [A('Estabilizar las lesiones graves primero; evaluación urológica con uretrocistografía'), F('Lesión uretral: cistostomía y uretroplastia diferida; lesión vesical: cirugía si es intraperitoneal o del cuello')],
     [D('¿Sangre en el meato o no puede orinar?',
        [A('No sondear a ciegas: uretrografía retrógrada'),
         D('¿Lesión uretral?',
           [F('Realineamiento agudo o cistostomía con uretroplastia diferida')],
           [F('Estudio contrastado de la vejiga (cistografía o TC) y manejo según el tipo de ruptura')])],
        [A('Examen de orina; si hay hematuria, estudio contrastado'),
         D('¿Ruptura intraperitoneal o lesión del cuello vesical?',
           [F('Reparación quirúrgica por laparotomía')],
           [F('Ruptura extraperitoneal o contusión: sonda o cistostomía 2 a 3 semanas y cistografía antes de retirar')])])])]),
 SCHU('34', 'Traumatismo de la vía urinaria inferior y genitales externos'))
