# -*- coding: utf-8 -*-
"""UP3: temas del programa que faltaban (gastritis, ulcera peptica y H. pylori, sindromes posgastrectomia, bezoares y cuerpos extraños, polipos gastricos).
Fuentes por prioridad: Galindo (Enciclopedia de Cirugia Digestiva) y, para bezoares y cuerpos extraños, Michans 5.ª ed. (2002)."""
from base import I, A, F, D
from rev2 import GAL
from rev6 import nueva as _n
import rev6
CONTENIDO = {}
NUEVAS = []
U3 = 'UP3 · Disfagia, hemorragia digestiva alta y patología esofagogástrica'

def nueva(*a, **k):
    _n(*a, **k); d = rev6.NUEVAS.pop(); d['up'] = ['cx3']; d['unidad'] = U3; NUEVAS.append(d)

nueva('cx-ulcera-peptica-hp', 'Úlcera péptica gastroduodenal e infección por Helicobacter pylori',
 ['ulcera peptica', 'ulcera gastrica', 'ulcera duodenal', 'helicobacter pylori', 'erradicacion', 'ibp', 'aines', 'misoprostol'],
 'Lesión crónica de la pared esofagogastroduodenal que penetra más allá de la muscular de la mucosa, por desequilibrio entre los factores agresivos (ácido, pepsina, Helicobacter pylori, AINE, tabaco, alcohol, estrés) y los defensivos (moco, bicarbonato, prostaglandinas, microcirculación). Las dos formas principales son la úlcera duodenal y la gástrica.',
 ['El ácido clorhídrico, la infección por H. pylori y el consumo de AINE son los tres factores que más hay que destacar.',
  'Con la úlcera confirmada por radiología con bario o videoendoscopia alta, es un requisito investigar la infección por H. pylori y, si se confirma, erradicarla independientemente de que haya consumo de AINE.'],
 ['Videoendoscopia digestiva alta (o estudio con bario); investigar H. pylori.'],
 [{'titulo': 'Tratamiento médico', 'pasos': [
    {'etiqueta': 'Triple terapia', 'texto': 'Un IBP más dos antibióticos (amoxicilina, claritromicina, metronidazol o tinidazol, levofloxacina o azitromicina) durante una semana, elegidos según la resistencia; erradicación cercana al 90 % (93 % con pantoprazol 40 mg, amoxicilina 1 g y claritromicina 500 mg dos veces al día).'},
    {'etiqueta': 'Cuádruple', 'texto': 'IBP más bismuto, metronidazol y tetraciclina durante una semana; supera el 90 % incluso con cepas resistentes al metronidazol. La triple con bismuto sola no está aprobada en Argentina por su baja tasa de erradicación.'},
    {'etiqueta': 'Después de erradicar', 'texto': 'Continuar el mismo IBP hasta completar 4 semanas en la úlcera duodenal y 8 en la gástrica. La recaída pasa de 80 % anual sin erradicar a 2 % anual con erradicación.'},
    {'etiqueta': 'Sin H. pylori', 'texto': 'IBP por 4 semanas (duodenal) u 8 (gástrica), con curación de 80 a 100 % y 70 a 85 %. El tratamiento prolongado se reserva a la úlcera complicada, a quienes no pueden suspender los AINE y a las enfermedades hipersecretoras.'},
    {'etiqueta': 'Otros', 'texto': 'Misoprostol para prevenir la úlcera gástrica por AINE en pacientes de alto riesgo (contraindicado en el embarazo; poco usado por la diarrea); el bismuto protege el nicho y tiene acción anti-H. pylori.'}]}],
 ['Suspender los AINE y erradicar el H. pylori; control endoscópico de la úlcera gástrica según la evolución.'],
 ['La erradicación del H. pylori reduce de forma importante el resangrado: en el seguimiento de 42 pacientes con HDA por úlcera H. pylori positiva, ninguno resangró en 2 años.', 'El misoprostol está contraindicado en el embarazo.'],
 dict(titulo='Úlcera péptica (Galindo)', nodos=[
   I('Dolor epigástrico con úlcera gástrica o duodenal confirmada por endoscopia o bario'),
   A('Suspender los AINE y buscar el Helicobacter pylori'),
   D('¿Hay infección por H. pylori?',
     [A('Esquema de erradicación de una semana: triple (IBP más dos antibióticos) o cuádruple con bismuto'),
      F('Seguir el IBP hasta completar 4 semanas (duodenal) u 8 (gástrica); la recaída baja de 80 % a 2 % anual')],
     [D('¿Es una úlcera complicada, no pueden suspender los AINE o hay hipersecreción?',
        [F('IBP prolongado')],
        [F('IBP por 4 semanas (duodenal) u 8 semanas (gástrica)')])])]),
 GAL('206', 'Úlcera gastroduodenal: etiopatogenia, clínica, diagnóstico y tratamiento médico', 'Capítulo 206 de la Enciclopedia de Cirugía Digestiva (Galindo)'))

nueva('cx-gastritis', 'Gastritis: clasificación y gastritis crónicas',
 ['gastritis', 'gastritis cronica', 'gastritis atrofica', 'gastritis autoinmune', 'metaplasia intestinal', 'helicobacter pylori'],
 'Proceso inflamatorio microscópico de la mucosa gástrica, que puede dar dolor epigástrico, náuseas, vómitos y sangrado, aunque por lo general es asintomático y sin alteraciones endoscópicas demostrables. Se clasifica por etiología: crónicas inespecíficas, infecciosas, granulomatosas y formas especiales (linfocítica, eosinofílica, colágena).',
 ['Gastritis difusa de predominio antral (tipo B): por H. pylori, compromete el antro y en general no se asocia con riesgo de cáncer.',
  'Gastritis atrófica multifocal: atrofia y metaplasia intestinal en parches en cuerpo y antro; se asocia a H. pylori en el 85 % y la metaplasia intestinal es factor de riesgo de cáncer gástrico.',
  'Gastritis atrófica corporal difusa (autoinmune, tipo A): atrofia del fondo y el cuerpo por destrucción autoinmune de las glándulas fúndicas; anemia perniciosa, anticuerpos contra células parietales y factor intrínseco, aclorhidria o hipoclorhidria e hipergastrinemia.'],
 ['Endoscopia con biopsia: el diagnóstico es histológico; investigar H. pylori.'],
 [{'titulo': 'Conducta', 'pasos': [
    {'etiqueta': 'Gastritis autoinmune', 'texto': 'Vitamina B12 intramuscular periódica y de por vida (diaria la primera semana, semanal por 2 meses y luego mensual); es urgente si se sospechan trastornos neurológicos, que pueden ser irreversibles.'},
    {'etiqueta': 'Gastritis infecciosas', 'texto': 'Flemonosa (rara, con sepsis): drenaje del estómago, antibióticos endovenosos en dosis altas y soporte hidroelectrolítico. Viral (herpes simple, citomegalovirus, en inmunocomprometidos): antivirales. Por cándida: fluconazol, aunque en general no se trata.'},
    {'etiqueta': 'Gastritis atrófica y metaplasia', 'texto': 'Las tres gastritis crónicas inespecíficas son factores de riesgo de úlcera péptica o de alteraciones neoplásicas; la infección por H. pylori es el agente de la tipo B y un factor de riesgo de la autoinmune.'}]}],
 ['Seguimiento de la atrofia y de la metaplasia intestinal por su riesgo de cáncer gástrico; B12 de por vida en la autoinmune.'],
 ['Las tres gastritis crónicas inespecíficas pueden ser factores de riesgo de úlcera péptica o de neoplasia.'],
 dict(titulo='Gastritis crónica (Galindo)', nodos=[
   I('Gastritis diagnosticada por endoscopia y biopsia'),
   D('¿Hay H. pylori?',
     [A('Tratar la infección (ver erradicación en la ficha de úlcera péptica)'),
      D('¿Hay atrofia multifocal o metaplasia intestinal?',
        [F('Seguimiento por el riesgo de cáncer gástrico')],
        [F('Control clínico')])],
     [D('¿Atrofia corporal con anemia perniciosa y anticuerpos antiparietales?',
        [F('Gastritis autoinmune (tipo A): vitamina B12 intramuscular de por vida (urgente si hay síntomas neurológicos)')],
        [F('Estudiar otras causas (granulomatosa, linfocítica, eosinofílica, colágena)')])])]),
 GAL('206', 'Gastritis (parte B del capítulo de úlcera gastroduodenal)', 'Capítulo 206 de la Enciclopedia de Cirugía Digestiva (Galindo)'))

nueva('cx-sindromes-posgastrectomia', 'Complicaciones de las gastrectomías: dumping, gastritis por reflujo alcalino y asa aferente',
 ['dumping', 'vaciamiento gastrico rapido', 'estomago operado', 'asa aferente', 'gastritis alcalina', 'estasis de y de roux', 'billroth'],
 'Complicaciones de la cirugía gástrica: intraoperatorias y posoperatorias (inmediatas y alejadas o secuelas). Las alejadas más importantes son el síndrome del vaciado gástrico rápido (dumping), la gastritis por reflujo alcalino, el síndrome del asa aferente y la estasis de la Y de Roux.',
 ['Dumping: síntomas digestivos y vasomotores tras las comidas, temprano (debilidad, mareo, sudor frío, palpitaciones; a veces diarrea explosiva) o tardío a las 2 a 4 horas por hipoglucemia. Es más frecuente con el Billroth II y menos con la Y de Roux; el diagnóstico es casi exclusivamente clínico.',
  'Gastritis por reflujo alcalino: ardor y dolor epigástrico persistente, vómitos biliosos que no alivian y pérdida de peso; confirmación endoscópica (mucosa edematosa, congestiva y sangrante, con lagos biliares). En el asa aferente el vómito sí alivia.',
  'Asa aferente: exclusivo de la anastomosis gastroyeyunal; dolor y malestar progresivos que alivian con vómitos biliosos explosivos, sin restos alimentarios, con pérdida de peso; se ve el asa dilatada en el estudio contrastado o en la endoscopia.',
  'Estasis de la Y de Roux: saciedad temprana, dolor epigástrico y a veces vómitos, sin vagotomía ni obstrucción mecánica; descartar una hernia interna o un defecto del pie del asa.'],
 ['Clínica; estudio contrastado, endoscopia o cámara gamma según el síndrome.'],
 [{'titulo': 'Tratamiento', 'pasos': [
    {'etiqueta': 'Dumping', 'texto': 'Dietético: restringir líquidos e hidratos de carbono, fraccionar la dieta, comer lentamente y acostarse después de comer; luego anticolinérgicos y análogos de la somatostatina. Si no responde, convertir a Y de Roux.'},
    {'etiqueta': 'Gastritis por reflujo alcalino y asa aferente', 'texto': 'Desmontar la anastomosis y rehacerla en Y de Roux con un pie de al menos 40 cm (la mejor opción según los autores).'},
    {'etiqueta': 'Estasis de la Y de Roux', 'texto': 'Descartada la causa mecánica, fraccionar la dieta y dar procinéticos.'}]}],
 ['Control nutricional del paciente gastrectomizado y de las secuelas alejadas.'],
 ['Los síntomas de gastritis alcalina y de asa aferente se confunden: en la primera el dolor es constante y el vómito no alivia.'],
 dict(titulo='Estómago operado: síndromes posgastrectomía (Galindo)', nodos=[
   I('Paciente gastrectomizado con síntomas tras las comidas o vómitos biliosos'),
   D('¿Síntomas vasomotores y digestivos inmediatos o a las 2 a 4 horas de comer?',
     [F('Dumping: dieta fraccionada, sin líquidos ni hidratos de carbono concentrados; anticolinérgicos o somatostatina; Y de Roux si falla')],
     [D('¿Dolor que alivia con vómito biliar explosivo y asa dilatada?',
        [F('Asa aferente: reconstruir en Y de Roux (pie de al menos 40 cm)')],
        [D('¿Ardor y dolor constantes con vómito que no alivia y gastritis en la endoscopia?',
           [F('Gastritis por reflujo alcalino: Y de Roux')],
           [F('Saciedad temprana sin obstrucción mecánica: estasis de la Y de Roux; dieta y procinéticos')])])])]),
 GAL('217', 'Complicaciones de las gastrectomías', 'Capítulo 217 de la Enciclopedia de Cirugía Digestiva (Galindo)'))

nueva('cx-polipos-gastricos', 'Pólipos gástricos: hiperplásicos, adenomatosos y de las poliposis',
 ['polipos gastricos', 'polipo hiperplasico', 'polipo adenomatoso', 'peutz-jeghers', 'poliposis adenomatosa familiar', 'cowden'],
 'Lesiones polipoideas del estómago, de origen epitelial. Los hiperplásicos o regenerativos son los más frecuentes (75 a 90 %) y los adenomatosos representan el 10 %.',
 ['Hiperplásicos: únicos y pequeños (menos de 2 cm), sésiles o pediculados, no son verdaderos tumores y se considera que no se malignizan.',
  'Adenomatosos: riesgo de malignización cercano al 10 % (3 a 14 %), con frecuente coexistencia de carcinoma; los de poliposis adenomatosa familiar suelen tener esta histología. Los pólipos vellosos son infrecuentes y degeneran más.',
  'Glándulas fúndicas: son los más frecuentes junto con los hiperplásicos; el uso prolongado de IBP favorecería su producción.',
  'Síndromes: Peutz-Jeghers (pólipos hamartomatosos y pigmentación mucocutánea; riesgo de cáncer gástrico 29 %), Cowden (pólipos en 60 %) y Cronkhite-Canada.'],
 ['Endoscopia con biopsia y estudio anatomopatológico; descartar otras lesiones asociadas.'],
 [{'titulo': 'Conducta', 'pasos': [
    {'etiqueta': 'Hiperplásicos', 'texto': 'El diagnóstico es endoscópico y anatomopatológico; hay que descartar otras lesiones asociadas. No requieren tratamiento quirúrgico ni se considera necesario el control alejado.'},
    {'etiqueta': 'Adenomatosos', 'texto': 'Por su riesgo de malignización (alrededor de 10 %) y la coexistencia no infrecuente con carcinoma, se estudia la lesión completa con anatomía patológica y se descarta un cáncer asociado.'},
    {'etiqueta': 'Poliposis', 'texto': 'En el síndrome de Cowden se recomienda vigilancia y polipectomía de los pólipos gástricos; con el tratamiento del H. pylori casi desaparecieron los pólipos.'}]}],
 ['Según la histología y el síndrome asociado; los hiperplásicos no requieren control alejado.'],
 ['Un pólipo adenomatoso o velloso exige estudio histológico completo y buscar un carcinoma asociado.'],
 dict(titulo='Pólipo gástrico (Galindo)', nodos=[
   I('Pólipo gástrico en la endoscopia'),
   A('Endoscopia con biopsia y estudio anatomopatológico'),
   D('¿Es hiperplásico?',
     [F('No requiere cirugía ni control alejado')],
     [D('¿Adenomatoso o velloso?',
        [F('Estudio anatomopatológico completo y buscar un carcinoma asociado (riesgo de malignización cercano a 10 %)')],
        [F('Estudiar un síndrome de poliposis (Peutz-Jeghers, Cowden, poliposis adenomatosa familiar)')])])]),
 GAL('220', 'Tumores benignos del estómago: pólipos', 'Capítulo 220 de la Enciclopedia de Cirugía Digestiva (Galindo)'))

nueva('cx-bezoares-cuerpos-extranos-gastricos', 'Bezoares y cuerpos extraños del estómago',
 ['bezoar', 'tricobezoar', 'fitobezoar', 'cuerpo extraño gastrico', 'farmacobezoar'],
 'Los cuerpos extraños ingeridos pueden quedar en el estómago como objetos individuales o formando bezoares: cuerpos extraños de materia orgánica. Los tricobezoares son de pelos, los fitobezoares de fibras vegetales y los tricofitobezoares combinan ambos; las concreciones son formas raras de sustancias químicas solidificadas.',
 ['Tricobezoares: mujeres jóvenes con hábitos nerviosos y cabello largo accesible a la boca. Fitobezoares: varones adultos.',
  'Cuadro clínico: masa epigástrica móvil con dolor abdominal, náuseas y vómitos; complicaciones: obstrucción, ulceración o inanición.',
  'Cuerpos extraños: frecuentes en niños, presidiarios, pacientes psiquiátricos y alcohólicos; el 75 % pasa el tubo digestivo sin problemas, el 10 a 20 % requiere extracción endoscópica y el 1 a 14 % una operación.'],
 ['Radiografía simple de abdomen para ver si son radiopacos, su ubicación y su tamaño; radiología contrastada con imágenes lacunares grandes y desplazables en el bezoar; la endoscopia confirma el diagnóstico.'],
 [{'titulo': 'Tratamiento', 'pasos': [
    {'etiqueta': 'Bezoares', 'texto': 'La endoscopia puede desintegrar o disolver la masa; la cirugía sigue siendo una alternativa válida para removerlos.'},
    {'etiqueta': 'Cuerpos extraños', 'texto': 'Observación con control si pasa solo; extracción endoscópica; cirugía ante signos peritoneales.'}]}],
 ['Control del hábito (tricofagia) y de la dieta en los fitobezoares.'],
 ['Cuerpo extraño con signos peritoneales: indicación de cirugía.'],
 dict(titulo='Bezoar o cuerpo extraño gástrico (Michans)', nodos=[
   I('Dolor, masa epigástrica móvil, vómitos o antecedente de ingestión de un objeto'),
   A('Radiografía de abdomen, estudio contrastado y endoscopia'),
   D('¿Signos peritoneales, perforación u obstrucción que no se resuelve?',
     [F('Cirugía')],
     [F('Extracción o desintegración endoscópica; el cuerpo extraño pequeño puede pasar solo con control')])]),
 {'guia': 'Cirugía de Michans, 5.ª ed., cap. 41: Estómago y duodeno (bezoares y cuerpos extraños)', 'sociedad': 'P. Ferraina y A. Oría (dirs.), Editorial Ateneo (Argentina)', 'anio': '2002',
  'archivo': 'Capitulos_Michans, cap. 41', 'tipo': 'libro', 'nota': 'Michans 5.ª ed. (El Ateneo, 2002; el programa cita la reimpresión de 2021). El tema no está en Giménez 2.ª ed. (2025) ni en Galindo; no se hallaron guías argentinas o chilenas en las carpetas provistas.'})
