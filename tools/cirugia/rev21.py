# -*- coding: utf-8 -*-
"""Fisiopatologia / etiopatogenia (quinta tanda) desde los capitulos de Gimenez 2.ª ed. (2025): cancer de colon, aneurisma de aorta abdominal, cancer gastrico."""
CONTENIDO = {}

def fisio(pid, items): CONTENIDO[pid] = {'fisiopatologia': items}

fisio('cx-cancer-colorrectal', [
 'La etiología es compleja, con interrelación de factores ambientales y genéticos: quienes migran de zonas de baja a zonas de alta incidencia adquieren con el tiempo el mismo riesgo que los nativos. Los factores ambientales incluyen la dieta, el estilo de vida y la terapia de restitución hormonal; los genéticos, la predisposición hereditaria, la poliposis familiar y los síndromes no polipósicos (Giménez, cap. 72).',
 'Dieta: aumentan el riesgo las dietas ricas en lípidos saturados de origen animal y las carnes rojas, sobre todo si se preparan a alta temperatura (más aminas heterocíclicas); no hay evidencia contundente de que las proteínas lo aumenten (Giménez, cap. 72).'])
fisio('cx-aneurisma-aorta-abdominal', [
 'La incidencia aumenta en hombres mayores de 60 años y en mujeres mayores de 70; alrededor del 3 % de los varones de más de 65 años tiene un aneurisma (de 3 % a los 60 hasta 10,8 % a los 80 años), pero la mayoría son pequeños y con bajo riesgo de rotura. El riesgo de desarrollarlo y de que crezca es mayor en los fumadores actuales (Giménez, cap. 18).',
 'Suelen tener crecimiento lento y progresivo durante una larga fase asintomática. El dolor lumbar o hipogástrico constante y persistente hace sospechar rotura; el aneurisma sintomático es una emergencia similar a la disección aórtica, y solo un tercio de los pacientes con rotura llega vivo al hospital. La cirugía programada disminuye 20 veces la mortalidad respecto de la de emergencia (Giménez, cap. 18).'])
fisio('cx-cancer-gastrico', [
 'El alto riesgo (más de 20 casos por 100.000 habitantes; este de Asia y la costa oeste de Latinoamérica y Centroamérica, el 80 % de los casos nuevos) se asocia a la infección por H. pylori, el consumo de alcohol, los alimentos conservados en sal y el bajo consumo de frutas y verduras (Giménez, cap. 42).',
 'Es la quinta causa de incidencia de cáncer en el mundo y la tercera de muerte por cáncer, por su estadio avanzado al diagnóstico; es dos veces más frecuente en hombres. Argentina es un país de bajo riesgo (menos de 10 por 100.000) (Giménez, cap. 42).'])
