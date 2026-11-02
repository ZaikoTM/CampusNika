# -*- coding: utf-8 -*-
"""Fisiopatologia (cuarta tanda): abdomen agudo (Gimenez 84), pancreatitis cronica (Gimenez 60), gastritis (Galindo 206), cervicobraquialgia (Orrego),
psicologia (Giacomantone, Correa Padilla, Calabrese) y urologia oncologica (Manual SCHU). Todo redactado desde lo leido."""
CONTENIDO = {}

def fisio(pid, items): CONTENIDO[pid] = {'fisiopatologia': items}

fisio('cx-peritonitis-aguda', [
 'En el abdomen agudo inflamatorio el dolor puede iniciarse de forma insidiosa y a veces lejos de la víscera inflamada (dolor referido), y luego localizarse y generalizarse. En la úlcera gastroduodenal perforada aparece como un dolor brusco, "como una puñalada", en el epigastrio o la región periumbilical, que migra a todo el abdomen y da contractura (abdomen "en tabla"), defensa muscular y signos de irritación peritoneal difusa (Giménez, cap. 84).',
 'Instalada la perforación visceral aparecen alteraciones del tránsito intestinal y un deterioro progresivo del estado general (Giménez, cap. 84).'])
fisio('cx-obstruccion-intestinal', [
 'En el abdomen agudo oclusivo el dolor es de comienzo brusco y por crisis (retortijón): el intestino intenta vencer el obstáculo con movimientos peristálticos violentos y continuos (signo de reptación). Suele iniciarse en el sitio del obstáculo, recorre el abdomen y vuelve a su punto de partida (Giménez, cap. 84).',
 'El cuadro característico es dolor por crisis, náuseas o vómitos, detención de heces y gases y distensión abdominal (Giménez, cap. 84).'])
fisio('cx-pancreatitis-cronica', [
 'Las características anatomopatológicas comunes son fibrosis periductal, estenosis y dilatación de los conductos pancreáticos y esclerosis parcheada del parénquima (Giménez, cap. 60).',
 'Dos mecanismos generales llevan a la pancreatitis crónica: un evento pancreático centinela en un paciente susceptible, que perpetúa un daño progresivo de bajo grado con fibrosis y pérdida de funciones, o varios episodios repetidos de pancreatitis aguda que dejan daño crónico y reemplazo del parénquima por fibrosis. En las etapas iniciales predomina el edema con focos de necrosis intraglandular (Giménez, cap. 60).'])
fisio('cx-gastritis', [
 'Gastritis difusa de predominio antral (tipo B): compromete el antro por la infección por H. pylori y en general no se asocia con riesgo de cáncer. Gastritis atrófica multifocal: atrofia y metaplasia intestinal en parches del cuerpo y el antro, con H. pylori en el 85 %; la metaplasia intestinal es factor de riesgo de cáncer gástrico (Galindo, cap. 206).',
 'Gastritis atrófica corporal difusa (tipo A, autoinmune): destrucción autoinmune de las glándulas fúndicas, con aclorhidria o hipoclorhidria, hipergastrinemia y malabsorción de vitamina B12 por falta de factor intrínseco; puede haber metaplasia intestinal y la infección por H. pylori se considera factor de riesgo (Galindo, cap. 206).'])
fisio('cx-cervicobraquialgia-radiculopatia', [
 'La causa más frecuente es la degenerativa: artrosis facetaria, uncoartrosis, disminución de la altura discal y hernia del núcleo pulposo generan un conflicto de espacio a nivel foraminal que comprime las raíces, sobre todo C5-C6 y C6-C7. La mayor incidencia de hernia degenerativa es entre los 50 y 60 años (Orrego y Morán, cap. 7).',
 'La hernia comienza con la rotura del anillo fibroso, que deja salir el contenido del disco; comprime la médula o la raíz y causa dolor agudo con fenómenos inflamatorios locales. Es blanda en jóvenes y dura y calcificada en mayores. Las hernias agudas no degenerativas tienen su pico entre los 20 y 40 años y su evolución natural es autolimitada en el 75 a 90 % (Orrego y Morán, cap. 7).'])
fisio('cx-estres-preoperatorio-adaptacion', [
 'En toda experiencia quirúrgica coexisten pares de tendencias contrarias: aceptar la realidad de la enfermedad o negarla, depender de los cuidados o mantener la autonomía, ser internado y operado o esperar que la vida siga con normalidad. Esto produce frustración, y el paciente recurre a mecanismos de defensa para adecuarse (Giacomantone y Mejía).',
 'Las defensas buscan evitar el displacer y reducir la ansiedad alejando de la conciencia los elementos más conflictivos; si lo hacen de forma muy rígida, el paciente no puede elaborar el conflicto ni adaptarse de modo realista. El umbral de tolerancia y la estructura de la personalidad determinan cuánto contenido amenazante se mantiene en el psiquismo (Giacomantone y Mejía).'])
fisio('cx-estres-quirurgico-respuesta-metabolica', [
 'Selye observó que el ejercicio extenuante en ratas elevaba las hormonas suprarrenales (ACTH, adrenalina y noradrenalina), atrofiaba el sistema linfático y producía úlceras gástricas, y llamó "estrés biológico" a ese conjunto. Con el síndrome general de adaptación describió una respuesta similar ante distintos estímulos, con papel central del eje adrenocortical y de los glucocorticoides (Correa Padilla, 2013).',
 'El trauma quirúrgico produce una respuesta metabólica, endocrina, hemodinámica e inmunológica con cambios autonómicos, metabólicos y hormonales que siguen a la injuria, y puede durar días o semanas (Correa Padilla, 2013).'])
fisio('cx-estres-laboral-burnout', [
 'El estrés laboral sigue el ciclo del estrés, con tres componentes: los factores estresantes que activan el ciclo, los filtros psicológicos que los procesan y las respuestas al afrontarlos y sus efectos. Sea físico, intelectual o psicológico el estresor, el cuerpo responde con una reacción física del sistema nervioso autónomo a través del eje hipotálamo-hipofisario-suprarrenal (Calabrese, 2006).',
 'Es un proceso dinámico y acumulativo: la activación frecuente del ciclo desgasta de forma paulatina y permanente los sistemas biológicos. Cuando se mantiene en el tiempo se habla de estrés crónico; el burnout aparece cuando fallan las estrategias de afrontamiento ante el estrés laboral crónico (Calabrese, 2006; Gatto).'])
fisio('cx-tumores-renales', [
 'Son factores de riesgo importantes el tabaco, la obesidad y la hipertensión arterial; la exposición ocupacional a carcinógenos aún no tiene evidencia de alta calidad. El alcohol moderado y la actividad física parecen proteger (Manual SCHU, cap. 23).',
 'Alrededor del 40 % de los pacientes con carcinoma renal tiene sobrepeso u obesidad, con relación causal mayor en mujeres. En el obeso aumentan las hormonas esteroidales y el factor de crecimiento similar a la insulina tipo 1 (IGF-1), lo que podría generar cambios como el aumento de adipocitoquinas (Manual SCHU, cap. 23).'])
fisio('cx-tumores-testiculares-genitales', [
 'La neoplasia germinal in situ (GCNIS) es la lesión precursora de la mayoría de los tumores de células germinales postpuberales y se encuentra junto al tumor invasor en el 80 a 90 %; con GCNIS, el riesgo de tumor en el mismo testículo es de 50 % a 5 años (Manual SCHU, cap. 28).',
 'Todos los tipos histológicos y la GCNIS comparten un marcador genético, el isocromosoma del brazo corto del cromosoma 12 (12p); se describieron más de 70 loci sin un gen único de mayor susceptibilidad. El antecedente de criptorquidia aumenta el riesgo (Manual SCHU, cap. 28).'])
