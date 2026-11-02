# -*- coding: utf-8 -*-
"""Temas del programa que faltaban en UP8 (cervicobraquialgia), UP10 (accesos venosos) y UP11 (accesos para hemodialisis).
Fuentes: Orrego y Moran (2014), Michans 5.ª ed. (2002) y, para el contraste, Smith y Tanagho 18.ª ed. (2016)."""
from base import I, A, F, D
from rev10 import MICH
from rev6 import nueva as _n
import rev6
CONTENIDO = {}
NUEVAS = []
U8 = 'UP8 · Traumatología, ortopedia y discapacidad'
U10 = 'UP10 · Enfermedades vasculares periféricas'
U11 = 'UP11 · Obstrucción urinaria baja y urología'

def nueva(up, unidad, *a, **k):
    _n(*a, **k); d = rev6.NUEVAS.pop(); d['up'] = up; d['unidad'] = unidad; NUEVAS.append(d)

ORR = {'guia': 'Ortopedia y Traumatología Básica (Orrego y Morán), cap. 7: Cervicobraquialgia', 'sociedad': 'M. Orrego y N. Morán, Universidad de los Andes (Chile)', 'anio': '2014',
       'archivo': 'Ortopedia y Traumatología Básica, cap. 7', 'tipo': 'libro',
       'nota': 'Bibliografía complementaria de la cátedra. El tema no está en Giménez 2.ª ed. (2025) ni en el Manual CTO de Traumatología; no se hallaron guías argentinas o chilenas en las carpetas provistas.'}

nueva(['cx8'], U8, 'cx-cervicobraquialgia-radiculopatia', 'Cervicobraquialgia y radiculopatía cervical',
 ['cervicobraquialgia', 'radiculopatia cervical', 'hernia de disco cervical', 'dolor cervical', 'spurling', 'mielopatia cervical'],
 'Dolor cervical irradiado a la extremidad superior, habitualmente unilateral, por patología de las raíces que forman el plexo braquial. La causa más frecuente es la degenerativa (artrosis facetaria, uncoartrosis, disminución de la altura discal y hernia del núcleo pulposo) a nivel de C5-C6 y C6-C7. Más de la mitad de la población tiene dolor cervical en su vida.',
 ['Dolor cervical que aumenta con el movimiento, punzante, lancinante o con calambres; el déficit sensitivo (parestesias en un dermatoma) es más frecuente que el motor.',
  'Test de Spurling (compresión axial con flexión y lateralización de la cabeza hacia el lado afectado), test de Roger-Bikelas y alivio con la mano sobre la cabeza ("saludo militar") indican atrapamiento radicular. El signo de L\'Hermitte y los signos de Babinski, clonus y reflejos aumentados indican compromiso medular.',
  'Raíces: C5 (deltoides, cara lateral del hombro, reflejo bicipital), C6 (bíceps, pulgar, estilo-radial), C7 (tríceps, dedos 2 y 3, tricipital), C8 (dedos 4 y 5) y T1 (interóseos, borde cubital del antebrazo).',
  'Diagnóstico diferencial: síndrome del túnel del carpo, atrapamiento cubital, manguito rotador, opérculo torácico y fibromialgia; causas médicas como esclerosis múltiple, polineuropatía diabética o déficit de vitamina B.',
  'Señales de alarma: dolor nocturno o en reposo, antecedente neoplásico, infección crónica o inmunosupresión, trauma, edad menor de 15 o mayor de 55 años, corticoides o drogas endovenosas, deterioro neurológico progresivo, fiebre y pérdida de peso.'],
 ['No hace falta imagen si no hay señales de alarma: la correlación clínico-imagenológica es mala porque hay hallazgos radiológicos en personas asintomáticas. Se empieza con radiografía de columna cervical (anteroposterior, lateral, transoral y oblicuas hasta C7-T1); la resonancia magnética se usa ante dolor con déficit neurológico; la TC mejora el hueso; el cintigrama busca fracturas o metástasis; la electromiografía descarta causas médicas o extravertebrales.'],
 [{'titulo': 'Tratamiento', 'pasos': [
    {'etiqueta': 'Conservador', 'texto': 'Es suficiente en la gran mayoría (75 a 90 % mejora): reposo laboral 2 a 3 días con collar blando; analgésicos, luego AINE, relajantes si hay componente miofascial, opiáceos como tercera línea, pregabalina u otros antineuríticos si los síntomas radiculares persisten, y corticoides si predomina la inflamación; fisiokinesioterapia desde el inicio.'},
    {'etiqueta': 'Infiltración', 'texto': 'Bloqueo peridural cervical con anestésico y corticoide, hecho por un anestesista experto por sus complicaciones graves, en quienes no mejoran.'},
    {'etiqueta': 'Cirugía', 'texto': 'Cervicobraquialgia persistente, con o sin déficit, tras más de 1 mes de fracaso del tratamiento médico y de preferencia antes de los 3 meses; nunca operar antes de 1 mes. Hoy se prefiere el abordaje anterior, con 98 % de buenos resultados.'}]}],
 ['Seguimiento de la evolución neurológica; derivar de forma precoz si hay mielopatía o déficit progresivo.'],
 ['No operar antes de 1 mes; los resultados empeoran si se opera después de los 3 meses.', 'Signos de mielopatía (L\'Hermitte, Babinski, clonus): requieren evaluación quirúrgica.'],
 dict(titulo='Cervicobraquialgia (Orrego y Morán)', nodos=[
   I('Dolor cervical irradiado al brazo, con o sin parestesias o déficit'),
   D('¿Señales de alarma (fiebre, antecedente neoplásico, trauma, déficit progresivo) o signos de mielopatía?',
     [A('Estudio por imágenes (radiografía y resonancia) y descartar causas tumorales, infecciosas o traumáticas'), F('Evaluación por columna para tratamiento específico')],
     [A('Tratamiento conservador escalonado: reposo corto con collar, analgésicos y AINE, antineuríticos y fisiokinesioterapia'),
      D('¿Persiste tras más de 1 mes de tratamiento médico?',
        [F('Bloqueo peridural cervical o cirugía de descompresión por abordaje anterior (de preferencia antes de los 3 meses)')],
        [F('Continuar el tratamiento conservador: mejora el 75 a 90 %')])])]),
 ORR)

nueva(['cx10'], U10, 'cx-accesos-venosos-centrales', 'Accesos venosos centrales y periféricos',
 ['via central', 'cateter venoso central', 'subclavia', 'yugular interna', 'seldinger', 'acceso arterial', 'flebotomia'],
 'Vías por las que se ingresa al sistema arterial o venoso con fines diagnósticos o terapéuticos: arteriales, venosos y para hemodiálisis. Los venosos pueden ser periféricos o centrales, y transitorios (hasta 7 días) o permanentes.',
 ['Arteriales: registro continuo de la presión arterial, medicamentos (quimioterapia), angiografía y procedimientos endovasculares; las arterias más usadas son la radial, la humeral y la femoral.',
  'Periféricos: venas de los miembros superiores (las de los inferiores si hay contraindicación) con agujas o catéteres cortos, para uso temporario.',
  'Centrales: vena subclavia y yugular interna, cuando se necesita un acceso más prolongado y con menos complicaciones locales.'],
 ['Radiografía de tórax tras colocar un catéter central para descartar complicaciones: neumotórax, hemotórax, quilotórax, embolia y lesión del plexo braquial.'],
 [{'titulo': 'Técnica y recaudos', 'pasos': [
    {'etiqueta': 'Subclavia', 'texto': 'Punción infraclavicular a 3 cm por fuera del ángulo entre la clavícula y la última costilla, con la cabeza girada al lado opuesto e hiperextendida; la aguja entra a 45° del plano clavicular y 30° bajo el plano transversal y, bajo la clavícula, se horizontaliza y avanza aspirando.'},
    {'etiqueta': 'Yugular interna', 'texto': 'Punción del ángulo entre el borde posterior del esternocleidomastoideo y la yugular externa; la aguja va por la cara profunda del músculo hacia el apéndice xifoides. El catéter se pasa directo o sobre una guía metálica (técnica de Seldinger).'},
    {'etiqueta': 'Permanencia', 'texto': 'Transitorios si no superan 7 días; si deben durar más, catéteres permanentes de silastic por su menor infección y trombosis.'},
    {'etiqueta': 'Contraindicaciones relativas', 'texto': 'Excitación psicomotriz, alteraciones de la coagulación, asistencia respiratoria mecánica, cirugía o irradiación previa de la zona, infección local y fístula arteriovenosa del mismo lado.'}]}],
 ['Control del sitio de inserción y de signos de infección; la infección del sistema suele tratarse con su extracción.'],
 ['Radiografía de tórax obligatoria tras la colocación de un catéter central.', 'Cuidado con la coagulopatía y con la fístula arteriovenosa ipsilateral.'],
 dict(titulo='Acceso venoso central (Michans)', nodos=[
   I('Paciente que necesita un acceso venoso prolongado o central (presión venosa central, medicación, nutrición)'),
   D('¿Hay contraindicación relativa (coagulopatía, infección local, fístula del mismo lado, ventilación mecánica)?',
     [F('Elegir otro sitio o un acceso periférico; valorar el riesgo y el beneficio')],
     [A('Punción de subclavia o yugular interna y paso del catéter por la técnica de Seldinger'),
      F('Radiografía de tórax para descartar neumotórax, hemotórax y otras complicaciones antes de usar la vía')])]),
 MICH('49', 'Arterias: accesos vasculares'))

nueva(['cx11', 'cx10'], U11, 'cx-accesos-vasculares-hemodialisis', 'Accesos vasculares para hemodiálisis',
 ['fistula arteriovenosa', 'acceso para hemodialisis', 'cateter de doble via', 'perm cath', 'fistula radiocefalica', 'protesis ptfe', 'brescia cimino'],
 'Vías para conectar al paciente con insuficiencia renal a la hemodiálisis: catéteres de doble vía y fístulas arteriovenosas, por anastomosis directa o con interposición de una prótesis.',
 ['Catéteres de doble vía: reemplazan a las cánulas de Scribner en la diálisis de urgencia; el catéter tunelizado permanente (Perm Cath) se usa cuando no hay sitios para una fístula.',
  'La fístula de elección es la radiocefálica en la muñeca (Brescia-Cimino), en el antebrazo no dominante: la vena se dilata e hipertrofia y a las 3 semanas puede puncionarse sin hemorragias, hematomas ni seudoaneurismas. Si hubo catéteres en la subclavia, explorar la vena con eco-Doppler: una estenosis significativa contraindica el miembro.',
  'La fístula con prótesis de PTFE se indica si las venas periféricas son inadecuadas o fracasaron fístulas previas (húmero-basílica en U o húmero-axilar); esperar 2 semanas para dializar por la prótesis.'],
 ['Eco-Doppler venoso previo ante antecedente de catéteres subclavios.'],
 [{'titulo': 'Complicaciones y manejo', 'pasos': [
    {'etiqueta': 'Trombosis (la más frecuente)', 'texto': 'La temprana suele ser una falla técnica y se trata con trombectomía y corrección del defecto; la tardía obliga a hacer una nueva fístula. En las prótesis, la obstrucción tardía es por estenosis de la anastomosis venosa por hiperplasia intimal.'},
    {'etiqueta': 'Infección', 'texto': 'Más frecuente en la insuficiencia renal; el germen habitual es Staphylococcus aureus. Profilaxis con cefalosporinas o vancomicina al confeccionar la fístula y asepsia en cada punción; el absceso se drena y, si falla, o si empieza en las anastomosis, se extrae la prótesis.'},
    {'etiqueta': 'Hipertensión venosa e isquemia distal', 'texto': 'Edema del miembro por una colateral (se liga) o por una estenosis (nueva anastomosis o angioplastia); la isquemia por robo del flujo arterial se corrige o se liga el acceso.'},
    {'etiqueta': 'Seudoaneurisma', 'texto': 'Sutura simple del orificio o interposición protésica.'}]}],
 ['Vigilar la permeabilidad y el soplo de la fístula, y los signos de infección o isquemia de la mano.'],
 ['No usar el miembro con fístula para accesos venosos centrales del mismo lado.', 'La trombosis es la complicación más frecuente: consultar de inmediato.'],
 dict(titulo='Acceso para hemodiálisis (Michans, con contraste de Smith y Tanagho)', nodos=[
   I('Paciente con insuficiencia renal crónica que requerirá hemodiálisis'),
   D('¿Necesita diálisis de urgencia?',
     [F('Catéter de doble vía; el Perm Cath si no hay sitios para una fístula')],
     [D('¿Venas periféricas adecuadas en el antebrazo no dominante?',
        [F('Fístula arteriovenosa radiocefálica (Brescia-Cimino); madura en 3 semanas')],
        [F('Fístula con prótesis de PTFE (húmero-basílica o húmero-axilar), esperar 2 semanas antes de usarla; Perm Cath si no hay otro sitio')])])]),
 MICH('49', 'Arterias: accesos para hemodiálisis'))
