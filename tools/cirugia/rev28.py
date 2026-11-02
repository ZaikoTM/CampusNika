# -*- coding: utf-8 -*-
"""Fisiopatologia (duodecima tanda) desde Harrison 21.ª ed. (2023): sifilis (cap. 182) e infecciones de piel y partes blandas (cap. 129)."""
CONTENIDO = {}

def fisio(pid, items): CONTENIDO[pid] = {'fisiopatologia': items}

fisio('cx-its-ulceras-genitales', [
 'Sífilis: Treponema pallidum penetra rápido por las mucosas íntegras o por erosiones microscópicas de la piel y en pocas horas llega a los linfáticos y a la sangre, con infección generalizada y focos metastásicos antes de que aparezca la lesión primaria. La sangre del paciente con sífilis temprana o en incubación es contagiosa (Harrison, cap. 182).',
 'El treponema se reproduce en la fase activa temprana cada 30 horas aproximadamente y el período de incubación es inversamente proporcional al inóculo (mediana de 21 días, rara vez más de 6 semanas). La concentración llega a 10^7 treponemas por gramo de tejido antes de la lesión clínica, que aparece en el sitio de inoculación y dura de 4 a 6 semanas (Harrison, cap. 182).'])
fisio('cx-infecciones-piel-forunculo-antrax', [
 'La celulitis por Staphylococcus aureus (sensible o resistente a meticilina) suele relacionarse con una infección focal como forúnculos, ántrax, heridas quirúrgicas o abscesos, y es purulenta; la celulitis por Streptococcus pyogenes, en cambio, se disemina con rapidez como un proceso difuso, con linfangitis y fiebre, y no es purulenta (Harrison, cap. 129).',
 'Las infecciones estafilocócicas cutáneas recurrentes son más frecuentes en quienes tienen eosinofilia e IgE sérica alta (síndrome de Job) y en los portadores nasales de estafilococos; la celulitis estreptocócica recurrente de las piernas se asocia a estasis venosa crónica, safenectomía y linfedema crónico (Harrison, cap. 129).'])
fisio('cx-infecciones-severas-partes-blandas', [
 'La fascitis necrosante la causan S. pyogenes, Clostridium o flora mixta de aerobios y anaerobios, y la gangrena gaseosa, Clostridium. Ante fiebre inexplicable y dolor e hipersensibilidad del tejido blando, aun sin inflamación cutánea aguda, hay que mantener un alto grado de sospecha y explorar las estructuras profundas en busca de fascitis necrosante o mionecrosis (Harrison, cap. 129).'])
