# -*- coding: utf-8 -*-
"""Fisiopatologia (novena tanda) desde Harrison 21.ª ed. (2023): isquemia colonica (cap. 329), obstruccion intestinal (330), cancer de vejiga (86) y de prostata (87)."""
from rev18 import CONTENIDO as _r18
from rev20 import CONTENIDO as _r20
CONTENIDO = {}

def fisio(pid, items): CONTENIDO[pid] = {'fisiopatologia': items}

fisio('cx-isquemia-colonica', [
 'El intestino recibe sangre del tronco celíaco y de las arterias mesentéricas superior e inferior, con extensa colateralización. En el colon las colaterales confluyen en el ángulo esplénico y en las porciones descendente y sigmoide: son los puntos de Griffith y Sudeck, zonas limítrofes con riesgo inherente de menor flujo y las localizaciones más comunes de isquemia colónica. La circulación esplácnica recibe hasta el 30 % del gasto cardiaco y se protege con colaterales, autorregulación y mayor extracción de oxígeno (Harrison, cap. 329).',
 'La isquemia oclusiva resulta de un émbolo (de origen cardiaco en más del 75 %) o de una trombosis progresiva en una arteria grande; la trombosis venosa mesentérica (menos del 10 %) suele precipitarse por hipercoagulabilidad. La isquemia no oclusiva es una constricción excesiva de los vasos mesentéricos (vasoespasmo) ante sobrecargas fisiológicas graves, como el shock; sin tratamiento las úlceras tempranas de la mucosa progresan a lesión de todas las capas (Harrison, cap. 329).',
 'La colitis isquémica es la enfermedad digestiva más frecuente que complica la cirugía cardiovascular: 5 a 9 % tras la reparación programada de la aorta, y el triple si es de urgencia (Harrison, cap. 329).'])
fisio('cx-obstruccion-intestinal', list(_r20['cx-obstruccion-intestinal']['fisiopatologia']) + [
 'La obstrucción intestinal aguda es mecánica o por una anomalía de la motilidad sin obstrucción (funcional). Se describe como parcial, grave o completa, lo que se correlaciona con el riesgo de complicaciones y la urgencia, y como "simple" o "estrangulada" si hay insuficiencia vascular e isquemia intestinal (Harrison, cap. 330).',
 'La obstrucción mecánica puede deberse a enfermedad extrínseca (adherencias, sobre todo tras cirugía abdominal previa, hernias internas o externas y neoplasias), anomalías de la pared intestinal (congénitas, inflamatorias, neoplásicas, traumáticas, intususcepción, lesión por radiación) o causas intraluminales (Harrison, cap. 330).'])
fisio('cx-cancer-vejiga-urotelial', [
 'El carcinoma urotelial de vejiga y de las vías urinarias se relaciona de forma más estrecha con el antecedente de tabaquismo. En los países en desarrollo son contribuyentes carcinógenos importantes el agua contaminada con parásitos de esquistosomiasis o con arsénico (Harrison, cap. 86).'])
fisio('cx-cancer-prostata-diagnostico', [
 'La testosterona, el principal andrógeno circulante, se convierte en la glándula en dihidrotestosterona por la 5α-reductasa; las células epiteliales y del estroma expresan receptores de andrógenos y dependen de ellos para crecer (Harrison, cap. 87).',
 'La porción periuretral crece en la pubertad y después de los 55 años por la proliferación de células no malignas de la zona de transición. La mayor parte de los cánceres se origina en la zona periférica, por lo que pueden palparse en el tacto rectal (Harrison, cap. 87).'])
