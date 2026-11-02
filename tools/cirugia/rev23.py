# -*- coding: utf-8 -*-
"""Fisiopatologia (septima tanda): hipertension portal y hemorragia variceal (Galindo cap. 431) y glandulas salivales (Gimenez cap. 24)."""
CONTENIDO = {}

def fisio(pid, items): CONTENIDO[pid] = {'fisiopatologia': items}

fisio('cx-hda-variceal', [
 'La presión portal depende del flujo y de la resistencia (ΔP = F × R). El hígado normal es una red vascular amplia, distensible y de baja resistencia, sin papel activo en regular el flujo portal. En las hepatopatías crónicas la presión portal sube por dos cambios: aumento de la resistencia al flujo y aumento del influjo venoso portal (Galindo, cap. 431).',
 'La resistencia intrahepática tiene un componente estructural (distorsión de la arquitectura vascular por la fibrosis y los nódulos de regeneración, que es el factor más importante) y otro funcional (mayor tono vascular de la microcirculación por disfunción endotelial). La fibrosis es una acumulación excesiva de matriz extracelular, sobre todo colágeno I, III y IV, con vasos de neoformación que funcionan como shunts (Galindo, cap. 431).',
 'El influjo aumenta por la circulación hiperdinámica: vasodilatación esplácnica inicial (óxido nítrico, la molécula más importante) con expansión de la volemia, menor resistencia periférica y mayor gasto cardíaco (Galindo, cap. 431).',
 'Se desarrolla una circulación colateral portosistémica (retroperitoneo, pared abdominal, área esplenorrenal, recto y área gastroesofágica); las gastroesofágicas son las más relevantes y se ven como várices esofagogástricas. El sangrado variceal requiere un gradiente de presión de al menos 12 mmHg (Galindo, cap. 431).'])
fisio('cx-glandulas-salivales', [
 'La sialoadenitis es la inflamación del tejido glandular salival, de origen viral o bacteriano. Las virales, más comunes en la niñez, suelen ser bilaterales, con edema y dolor glandular; la parotiditis urliana puede comprometer también el páncreas y las gónadas (Giménez, cap. 24).',
 'Las bacterianas sin obstrucción ductal son poco frecuentes y aparecen en inmunosuprimidos, intubados por largo tiempo, con mala higiene bucal o con deshidratación importante; son unilaterales en el 80 %. Los cálculos de los conductos de Wharton o, menos a menudo, de Stenon causan estasis salival y dilatación ductal (Giménez, cap. 24).'])
