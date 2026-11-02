# -*- coding: utf-8 -*-
"""Fisiopatologia / etiopatogenia (sexta tanda) leida en los capitulos de Gimenez 2.ª ed. (2025):
cancer de vesicula (56), trauma de colon y recto (79), enfermedad carotidea (19), cancer de la union esofagogastrica (40), GIST (41), HDB (83), hidatidosis (48)."""
CONTENIDO = {}

def fisio(pid, items): CONTENIDO[pid] = {'fisiopatologia': items}

fisio('cx-cancer-vesicula', [
 'Se desarrolla por transformación maligna de las células de la pared vesicular. Es tres veces más frecuente en mujeres, y hallazgos recientes sugieren una relación con los estrógenos y la progesterona; la edad media de presentación es de 60 a 70 años (Giménez, cap. 56).',
 'Factores de riesgo: litiasis vesicular (presente en el 60 a 100 %, con un riesgo relativo de 2 a 24 veces), obesidad, unión pancreatobiliar anómala, microcalcificaciones mucosas y pólipos vesiculares; también el sexo femenino, el embarazo y la edad avanzada. Es frecuente en la India, Chile, Bolivia, Perú y el este de Asia, y en Argentina es más frecuente en las provincias del norte (Salta, 6,7 por 100.000) (Giménez, cap. 56).'])
fisio('cx-trauma-colon-recto', [
 'Las lesiones por agentes romos (accidentes de tránsito y laborales) son contusas, extendidas, de bordes desflecados y con destrucción tisular; el desgarro de los mesos compromete la irrigación y provoca lesiones isquémicas que pueden manifestarse de forma mediata (Giménez, cap. 79).',
 'En las contusiones el daño ocurre por tres mecanismos: aplastamiento contra un plano rígido osteomuscular, desgarro o deslizamiento donde el colon y el meso están fijos (ángulos, colon ascendente y descendente) y aumento brusco de la presión endoluminal con formación de un asa cerrada (Giménez, cap. 79).',
 'Los agentes penetrantes causan el 96,8 % de las heridas colónicas en la vida civil; pueden ser extraluminales o intraluminales (cuerpos extraños ingeridos, que pasan sin problemas en más del 90 % de los casos, o introducidos por vía anal) (Giménez, cap. 79).'])
fisio('cx-enfermedad-carotidea', [
 'El 80 % del flujo cerebral depende de las arterias carótidas, que irrigan la oftálmica y las cerebrales anterior y media; el sistema vertebrobasilar irriga el circuito posterior, y ambos confluyen en el polígono de Willis (Giménez, cap. 19).',
 'La fisiopatología de la placa ateromatosa carotídea es la de otras arterias: la placa crece con neovascularización (angiogénesis) que puede producir hemorragia intraplaca, romper la capa fibrosa subendotelial y desprender restos, o formar una úlcera que es reservorio de acúmulos plaquetarios que también pueden desprenderse y embolizar (Giménez, cap. 19).'])
fisio('cx-cancer-union-esofagogastrica', [
 'El tabaquismo tiene un riesgo relativo de 1,5 a 3,5 (2,18 para el adenocarcinoma en fumadores). La enfermedad por reflujo gastroesofágico se asocia a los tumores de la región y el riesgo puede duplicarse si se suma el alcoholismo (Giménez, cap. 40).',
 'El reflujo crónico puede desencadenar metaplasia intestinal y esófago de Barrett. El perfil del paciente con Barrett y adenocarcinoma de la unión es varón (3 a 1), con síntomas de reflujo de más de 10 años, hernia hiatal de más de 4 cm y reflujo duodenogastroesofágico; la obesidad y la expresión de COX-2 se relacionan con la evolución de Barrett a adenocarcinoma (Giménez, cap. 40).'])
fisio('cx-tumores-gastricos-benignos-gist', [
 'Los GIST son las lesiones subepiteliales malignas más comunes del tubo digestivo y su localización principal es el estómago. Se originan en las células intersticiales de Cajal de la capa muscular (las marcapasos del movimiento intestinal) y se caracterizan por la sobreexpresión y las mutaciones del receptor de tirosina-cinasa C-KIT (Giménez, cap. 41).',
 'Entre el 10 y el 30 % tiene curso maligno; incluso los GIST pequeños con bajo índice mitótico pueden dar metástasis, por lo que se los considera potencialmente malignos, con riesgo según el tamaño y la localización. La recurrencia aparece al menos en la mitad de los casos operados (Giménez, cap. 41).'])
fisio('cx-hemorragia-digestiva-baja', [
 'Las causas difieren según la edad: en mayores de 60 años, diverticulosis, angiodisplasias, neoplasias y pólipos; entre 14 y 60 años, pólipos, colitis ulcerosa, pospolipectomía y angiodisplasias; en menores de 14, divertículo de Meckel, pólipos e invaginación (Giménez, cap. 83).',
 'En los pacientes internados el sangrado diverticular es la causa más frecuente (cerca del 20 %): hematoquecia masiva que cede sola en alrededor del 80 %, con nuevo episodio en el 20 %. Los divertículos del lado derecho sangran más porque son más grandes y de boca más ancha (Giménez, cap. 83).'])
fisio('cx-hidatidosis-hepatica', [
 'Zoonosis producida por las larvas de Echinococcus granulosus, que parasitan al hombre de manera accidental. Predomina en zonas de cría de ganado ovino, bovino y caprino; en Argentina la prevalencia es de 1,5 por 100.000 habitantes por año, mayor en Córdoba, La Pampa, la zona pampeana de Buenos Aires, la precordillera mendocina y la Patagonia (Giménez, cap. 48).',
 'El parásito adulto (3 a 5 mm) vive en el intestino del perro, que elimina huevos con la materia fecal; el útero grávido puede contener hasta 800 huevos. Los huéspedes intermediarios, entre ellos el hombre, los ingieren a través de alimentos, tierra o animales contaminados; los huevos eclosionan en el intestino delgado y liberan el embrión hexacanto, que atraviesa las vellosidades intestinales (Giménez, cap. 48).'])
