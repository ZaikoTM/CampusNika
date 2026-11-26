# -*- coding: utf-8 -*-
"""UP 3 · Pólipos y tumores benignos del estómago: la capa de origen."""
from .up01e import N, G, L, oral


def tumores_benignos(u):
    u.h2('Pólipos y tumores benignos del estómago: la capa de la pared de la que nacen', intro='El programa pide pólipos gástricos (hiperplásicos, adenomatosos, fúndicos) y tumores benignos (leiomiomas, lipomas, schwannomas, GIST pequeños). Se ordenan por la capa de la pared donde empiezan.')
    u.h3('Las capas de la pared gástrica (y cómo se ven en la ecoendoscopia)')
    u.tabla(['Capa', 'Qué es', 'Imagen en ecoendoscopia', 'Tumores que nacen ahí'], [
        ['**1.ª Mucosa (epitelio)**', 'Epitelio y glándulas', 'Hiperecoica', '**Pólipos**: hiperplásicos, adenomatosos, de glándulas fúndicas'],
        ['**2.ª Muscular de la mucosa**', 'Capa muscular delgada', 'Hipoecoica fina', 'Leiomioma pequeño'],
        ['**3.ª Submucosa**', 'Tejido conectivo, vasos y plexo de Meissner', 'Hiperecoica', '**Lipoma**, quistes, páncreas ectópico, tumores neuroendocrinos'],
        ['**4.ª Muscular propia**', 'Capas oblicua, circular y longitudinal; plexo de Auerbach', 'Hipoecoica', '**GIST**, **leiomioma**, **schwannoma**'],
        ['**5.ª Serosa**', 'Peritoneo visceral', 'Hiperecoica', 'Invasión de tumores (T4)'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 41 (tumores gástricos infrecuentes); Galindo, Enciclopedia de Cirugía Digestiva, cap. 220 (tumores benignos del estómago); anatomía de referencia.')
    u.h3('Pólipos gástricos')
    u.tabla(['Tipo', 'Origen', 'Riesgo y conducta'], [
        ['**Hiperplásico** (el más frecuente)', 'Respuesta regenerativa a la inflamación: **gastritis crónica por H. pylori**, gastritis atrófica', 'Bajo riesgo; se tratan la causa (erradicación del H. pylori) y los pólipos grandes (más de 1 cm) con polipectomía'],
        ['**Adenomatoso**', 'Displasia del epitelio; sobre **gastritis atrófica y metaplasia intestinal**', '**Premaligno**: polipectomía endoscópica y control; se busca otra lesión (cáncer sincrónico)'],
        ['**De glándulas fúndicas**', 'Cuerpo y fondo; se asocian al **uso prolongado de inhibidores de la bomba de protones** y a la poliposis adenomatosa familiar', 'Benignos; se biopsian por la asociación con poliposis'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 41; Galindo, Enciclopedia de Cirugía Digestiva, cap. 220.')
    u.h3('Tumores submucosos y mesenquimáticos')
    u.tabla(['Tumor', 'Origen', 'Característica'], [
        ['**GIST**', '**Células intersticiales de Cajal** (marcapasos del intestino) de la **muscular propia**; mutación de **KIT**', 'El más frecuente de los tumores mesenquimáticos; riesgo según **tamaño** y **mitosis**; los pequeños sin criterios de malignidad se controlan, los grandes o sintomáticos se **resecan** (sin linfadenectomía) y se evalúa el imatinib'],
        ['**Leiomioma**', 'Músculo liso de la muscular propia o de la muscular de la mucosa', 'Benigno; positivo para actina, negativo para KIT'],
        ['**Lipoma**', '**Submucosa** (grasa)', 'Tumor amarillo, blando; en la endoscopia “signo de la almohada”; asintomático'],
        ['**Schwannoma**', 'Vaina de los nervios del plexo de Auerbach', 'Raro, benigno; S-100 positivo'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 41 (tumores gástricos infrecuentes); Galindo, Enciclopedia de Cirugía Digestiva, cap. 220.')
    u.box('clave', 'Cómo se piensa un tumor “debajo de la mucosa”', ['Se ve como un **abultamiento cubierto de mucosa normal**: la biopsia común es negativa. El estudio de elección es la **ecoendoscopia**: dice **de qué capa nace**, su tamaño y sus bordes, y guía la punción para la histología.',
                                                                    'Si nace de la **muscular propia** y tiene más de 2 cm, sospechá **GIST**.'])
    N(u, 'S-421', 'Mucosa y musculatura del intestino delgado (repaso de capas).', ['Compará las capas de la pared: mucosa, submucosa y muscular propia, que se repiten en el estómago.'], 175)
    oral(u, 'La pared gástrica tiene mucosa, muscular de la mucosa, **submucosa**, **muscular propia** y serosa, y la ecoendoscopia las distingue. Los **pólipos** nacen de la mucosa: el **hiperplásico** es el más frecuente y se asocia a gastritis por H. pylori; el **adenomatoso** es premaligno y se reseca; los de **glándulas fúndicas** se asocian a los inhibidores de la bomba. Los tumores **submucosos** (cubiertos por mucosa normal) se estudian con ecoendoscopia: el **lipoma** nace de la submucosa; el **GIST**, el leiomioma y el schwannoma, de la **muscular propia**. El **GIST** viene de las **células de Cajal** (KIT) y su riesgo depende del tamaño y de las mitosis; los pequeños se controlan y los grandes se resecan sin linfadenectomía.')
