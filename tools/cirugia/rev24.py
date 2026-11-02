# -*- coding: utf-8 -*-
"""Fisiopatologia (octava tanda) desde Harrison, Principios de Medicina Interna, 21.ª ed. (McGraw Hill, 2023): shock (cap. 303), trombosis venosa (279),
enfermedad arterial periferica (281), cancer colorrectal (81), cancer de pancreas (83) y fisiologia de la deglucion (44)."""
from rev21 import CONTENIDO as _r21
CONTENIDO = {}

def fisio(pid, items): CONTENIDO[pid] = {'fisiopatologia': items}

fisio('cx-shock-hemorragico', [
 'El estado de choque es el fallo del suministro de oxígeno con hipoxia celular. Hay cuatro tipos (distributivo, cardiógeno, hipovolémico y obstructivo), cada uno con un perfil hemodinámico propio (Harrison, cap. 303).',
 'El choque hipovolémico reduce el gasto cardiaco por menor precarga y se caracteriza por resistencia vascular sistémica elevada y presiones venosa central y capilar pulmonar de enclavamiento bajas, por la pérdida de volumen intravascular. Se relaciona más a menudo con la hemorragia, externa (traumatismo) o interna (tubo digestivo alto o bajo, embarazo ectópico roto), y también ocurre sin hemorragia: vómitos o diarrea graves, diuresis osmótica (cetoacidosis diabética, diabetes insípida) y pérdida cutánea por quemaduras (Harrison, cap. 303).'])
fisio('cx-trombosis-venosa-profunda', [
 'La tríada de Virchow (estasis venosa, hipercoagulabilidad y lesión endotelial) atrae plaquetas activadas que liberan micropartículas proinflamatorias; estas se unen a los neutrófilos y los estimulan a liberar su material nuclear en redes extracelulares (NET) que contienen histonas, las cuales promueven la agregación plaquetaria y la generación de trombina dependiente de plaquetas (Harrison, cap. 279).',
 'Los trombos venosos se forman y crecen en un ambiente de estasis, baja presión de oxígeno y mayor expresión de genes proinflamatorios. Hay interacción con la aterotrombosis: la placa carotídea duplica el riesgo de tromboembolia venosa y quien la sufre tiene más del doble de probabilidad de infarto o accidente cerebrovascular, porque comparten inflamación, hipercoagulabilidad y lesión endotelial (Harrison, cap. 279).'])
fisio('cx-eami-claudicacion', [
 'La aterosclerosis es la principal causa de enfermedad arterial periférica en mayores de 40 años; otras causas son la trombosis, la embolia, la vasculitis, la displasia fibromuscular, la compresión y los traumatismos. El riesgo aumenta con el tabaquismo, la diabetes, la hipercolesterolemia, la hipertensión y la insuficiencia renal (Harrison, cap. 281).',
 'Las lesiones segmentarias de estenosis u oclusión afectan vasos de calibre grande y mediano: placas con depósito de calcio, adelgazamiento de la capa media, destrucción de fibras musculares y elásticas, fragmentación de la lámina elástica interna y trombos de plaquetas y fibrina. Los sitios más afectados son la aorta abdominal y las ilíacas (30 % de los sintomáticos) y las arterias femorales y poplíteas (80 a 90 %) (Harrison, cap. 281).'])
fisio('cx-cancer-recto', [
 'Hay una secuencia de cambios desde la mucosa normal hasta el carcinoma invasor: mutaciones puntuales del protooncogén K-ras, hipometilación del ADN con activación de genes, y pérdida de alelos en genes supresores: APC (5q21), DCC (18q) y p53 (17p). El patrón proliferativo alterado que lleva de pólipo a carcinoma supone la activación de un oncogén y la pérdida de genes que suprimen la tumorogénesis (Harrison, cap. 81).',
 'No se sabe si las alteraciones ocurren siempre en un orden definido; se cree que las neoplasias se desarrollan solo en los pólipos con muchas o todas estas mutaciones. La probabilidad de que un pólipo adenomatoso degenere depende de su aspecto macroscópico y de sus características histológicas (Harrison, cap. 81).'])
fisio('cx-cancer-pancreas', [
 'Cuatro genes están mutados o inactivados con frecuencia: KRAS (casi siempre en el codón 12) en el 100 % de los adenocarcinomas, p16/CDKN2A en más del 90 %, y TP53 y DPC4/SMAD4 en casi la mitad; BRCA2 está mutado en el 7 a 10 %. Si no hay mutación de KRAS, debe pensarse en otro origen (intestino delgado, vesícula biliar o colangiocarcinoma) (Harrison, cap. 83).',
 'Muchos adenocarcinomas surgen de lesiones precursoras no invasivas, las neoplasias intraepiteliales pancreáticas (PanIN 1 a 3), con más alteraciones genéticas a mayor grado (Harrison, cap. 83).'])
fisio('cx-disfagia', [
 'La deglución empieza con una fase oral voluntaria (se mastica y mezcla el alimento con saliva) y sigue con una fase de transferencia: la lengua empuja el bolo a la hipofaringe y se activa una respuesta faríngea mediada por el sistema nervioso central; la laringe se eleva y avanza, se abre el esfínter esofágico superior y se impide la entrada a la vía aérea (Harrison, cap. 44).',
 'La disfagia de transferencia, característica de la orofaríngea, produce a menudo regurgitación nasal y broncoaspiración durante la deglución. El esfínter esofágico superior (cricofaríngeo, constrictor inferior y esófago cervical proximal) permanece cerrado en reposo por sus propiedades elásticas y la contracción neurógena del cricofaríngeo, y se abre al cesar la excitación vagal (Harrison, cap. 44).'])

_g = list(_r21['cx-cancer-colorrectal']['fisiopatologia'])
fisio('cx-cancer-colorrectal', _g + [CONTENIDO['cx-cancer-recto']['fisiopatologia'][0]])
