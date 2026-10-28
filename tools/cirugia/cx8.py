# -*- coding: utf-8 -*-
"""UP8 · Ortopedia y traumatología de miembros inferiores. El Giménez 2.ª ed. no trae traumatología: los algoritmos reordenan lo que ya dice cada ficha (Manual CTO de Medicina y Cirugía: Traumatología)."""
from base import I, A, F, D

CONTENIDO = {}

CONTENIDO['cx-fractura-cadera'] = dict(
    algoritmo=dict(titulo='Fractura de cadera (Manual CTO)', nodos=[
        I('Dolor inguinal, impotencia funcional, acortamiento y rotación externa del miembro: radiografía de pelvis y cadera de frente y perfil; resonancia o TC si la radiografía es normal pero la sospecha es clínica'),
        D('¿Es intracapsular?',
          [D('¿Es un paciente joven?',
             [F('Osteosíntesis urgente: el riesgo de necrosis avascular aumenta con el tiempo')],
             [F('Anciano con desplazamiento: prótesis (hemiartroplastia o total); sin desplazamiento: osteosíntesis')])],
          [F('Extracapsular (pertrocantérea o subtrocantérea): osteosíntesis con clavo endomedular o tornillo-placa')]),
        A('En todos: cirugía precoz, analgesia, profilaxis antibiótica (cefazolina 2 g) y antitrombótica, y movilización temprana; vigilar el sangrado, la embolia grasa, la pseudoartrosis y la necrosis'),
    ]),
)

CONTENIDO['cx-fracturas-expuestas'] = dict(
    algoritmo=dict(titulo='Fractura expuesta (Manual CTO)', nodos=[
        I('Fractura con herida comunicante: evaluar el estado neurovascular, la contaminación, el tiempo de evolución y las lesiones asociadas; clasificar según Gustilo-Anderson (I, II, IIIa, IIIb, IIIc)'),
        A('Antibióticos cuanto antes: cefalosporina de primera generación (cefazolina 2 g); en grado IIIa se agrega un aminoglucósido (gentamicina 5 mg/kg); cobertura antitetánica según vacunación'),
        A('Desbridamiento y lavado urgentes de todo el tejido necrótico'),
        D('¿Hay lesión vascular o pérdida de cobertura (grados IIIb y IIIc)?',
          [F('Estabilización rígida (fijador externo) y reparación vascular o cobertura con cirugía plástica según el caso')],
          [F('Estabilización con fijador externo o enclavado endomedular según el grado')]),
    ]),
)

CONTENIDO['cx-sindrome-compartimental'] = dict(
    algoritmo=dict(titulo='Síndrome compartimental agudo (Manual CTO)', nodos=[
        I('Dolor desproporcionado y creciente que aumenta con la extensión pasiva de los dedos, con compartimento tenso (una fractura abierta no excluye el síndrome): es una urgencia clínica'),
        A('Retirar o abrir todo yeso o vendaje compresivo, colocar el miembro a nivel del corazón y mantener la presión arterial'),
        D('¿Persiste la clínica?',
          [F('Fasciotomía urgente de los compartimentos afectados')],
          [F('Vigilancia estricta y reevaluación clínica seriada')]),
    ]),
)

CONTENIDO['cx-fracturas-diafisarias-pierna'] = dict(
    algoritmo=dict(titulo='Fracturas diafisarias de fémur y tibia (Manual CTO)', nodos=[
        I('Dolor, deformidad e impotencia: examen neurovascular y de compartimentos; radiografías de la diáfisis con las articulaciones suprayacente y subyacente; en el fémur, vigilar shock y embolia grasa'),
        D('¿Es una fractura de fémur?',
          [F('Adulto: enclavado endomedular; niños: tracción o tratamiento ortopédico')],
          [D('¿La fractura de tibia es abierta?',
             [F('Desbridamiento y antibióticos, y luego fijador externo o enclavado')],
             [F('Cerrada: enclavado endomedular, o tratamiento conservador en las estables')])]),
    ]),
)

CONTENIDO['cx-lesiones-rodilla'] = dict(
    algoritmo=dict(titulo='Lesiones de rodilla (Manual CTO)', nodos=[
        I('Trauma de rodilla: hemartrosis, bloqueo o inestabilidad; maniobras de Lachman y cajón (ligamentos) y McMurray, Steinmann y Apley (meniscos); radiografía y resonancia'),
        D('¿Es un esguince grado I o II?',
          [F('Conservador: reposo relativo, hielo, antiinflamatorios y rehabilitación')],
          [D('¿Hay rotura del ligamento cruzado anterior?',
             [F('Reconstrucción artroscópica en jóvenes activos o con inestabilidad; conservador y rehabilitación en los demás')],
             [F('Menisco: meniscectomía parcial o sutura meniscal según la zona y la edad; conservador en las lesiones degenerativas')])]),
    ]),
)

CONTENIDO['cx-lumbociatica-radiculopatia'] = dict(
    algoritmo=dict(titulo='Lumbociatalgia y radiculopatía (Manual CTO)', nodos=[
        I('Dolor radicular que sigue el dermatoma, parestesias, Lasègue positivo y déficit motor o reflejo: examen neurológico completo'),
        D('¿Hay síndrome de cola de caballo (anestesia en silla de montar, retención urinaria, déficit motor bilateral) o déficit neurológico progresivo?',
          [F('Urgencia: resonancia y descompresión quirúrgica (discectomía)')],
          [A('Analgésicos y antiinflamatorios, actividad según tolerancia y kinesiología: resuelve en semanas en la mayoría'),
           D('¿El dolor es refractario?',
             [F('Discectomía o descompresión')],
             [F('Continuar el tratamiento conservador y control')])]),
    ]),
)

CONTENIDO['cx-tumores-oseos-metastasis'] = dict(
    algoritmo=dict(titulo='Tumores óseos y metástasis (Manual CTO)', nodos=[
        I('Dolor óseo persistente, nocturno o en reposo, tumoración o fractura patológica: radiografía, resonancia, centellograma o PET; biopsia planificada con el equipo que operará'),
        D('¿Es un tumor primario maligno?',
          [F('Tratamiento multidisciplinario en centro de referencia: quimioterapia, resección con márgenes y reconstrucción')],
          [D('¿Es una metástasis o una fractura patológica?',
             [F('Tratamiento sistémico y radioterapia con estabilización quirúrgica profiláctica si hay riesgo de fractura; fractura patológica: fijación o prótesis, radioterapia, analgesia y bifosfonatos o denosumab')],
             [F('Lesión benigna: control o resección según el tipo y los síntomas')])]),
    ]),
)

NUEVAS = []
