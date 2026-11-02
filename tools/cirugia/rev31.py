# -*- coding: utf-8 -*-
"""Fisiopatologia (decimoquinta tanda): cicatrizacion (Schwartz 10.ª ed., cap. 9), trauma abdominal (Gimenez cap. 79) y trauma renal (Manual SCHU cap. 33)."""
CONTENIDO = {}

def fisio(pid, items): CONTENIDO[pid] = {'fisiopatologia': items}

fisio('cx-cicatrizacion', [
 'La cicatrización es una cascada celular y bioquímica que restituye la integridad y la función del tejido. Sigue un patrón predecible en fases superpuestas: hemostasia e inflamación, proliferación, y maduración y remodelación; todos los tejidos cicatrizan por mecanismos similares (inflamación, migración celular, proliferación, depósito de matriz y remodelación) (Schwartz, cap. 9).',
 'La hemostasia precede e inicia la inflamación: el corte de vasos expone el colágeno subendotelial a las plaquetas, que se agregan, se desgranulan y activan la coagulación, y liberan factores quimiotácticos (Schwartz, cap. 9).',
 'En la síntesis de matriz el colágeno es la proteína clave; interesan los tipos I (principal de la piel) y III (más prominente durante la reparación). La prolil hidroxilasa requiere oxígeno, hierro y vitamina C. La matriz se deposita en orden: fibronectina y colágeno III, luego glucosaminoglucanos y proteoglucanos, y por último colágeno I (Schwartz, cap. 9).',
 'En la maduración y remodelación el colágeno se reorganiza y las metaloproteinasas lo catabolizan; el contenido neto es el equilibrio entre colagenólisis y síntesis. La cantidad de colágeno alcanza una meseta a las pocas semanas, pero la fuerza de tensión sigue aumentando durante varios meses (Schwartz, cap. 9).'])
fisio('cx-trauma-abdominal', [
 'El traumatismo cerrado no viola el peritoneo: predominan las lesiones hemorrágicas y, en segundo lugar, las peritoníticas; el mecanismo es por compresión o desaceleración y representa siempre un desafío diagnóstico. El traumatismo abierto o penetrante viola la integridad peritoneal: predominan las lesiones perforativas (peritonitis) y, secundariamente, las hemorrágicas (Giménez, cap. 79).',
 'En todo traumatismo grave el punto cardinal inicial es el estado hemodinámico. El traumatismo penetrante aumenta en las grandes ciudades de la Argentina por el alcohol, las drogas y las crisis económicas y sociales (Giménez, cap. 79).'])
fisio('cx-trauma-urogenital', [
 'Los traumatismos renales son cerrados (hasta el 90 %) o penetrantes. Los cerrados se deben a accidentes de tránsito, caídas, deportes de alto riesgo, accidentes laborales y peleas; los penetrantes, a armas blancas o de fuego (Manual SCHU, cap. 33).',
 'Las lesiones contusas ocurren por dos mecanismos: la transmisión de la fuerza de un golpe lumbar o abdominal, con máxima fuerza en la periferia del riñón y una fuerza contraria de las cavidades llenas de orina proporcional a su presión (por eso lesiona más la periferia y a quienes tienen uropatía obstructiva), y los movimientos anteroposteriores o cefalocaudales del riñón por desaceleración brusca, que dañan los vasos renales (Manual SCHU, cap. 33).'])
