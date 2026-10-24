# -*- coding: utf-8 -*-
"""Fichas de fármacos de métodos anticonceptivos (2026-10-24), unidad fx4. Cada dato proviene de la guía «Métodos anticonceptivos: guía práctica para
profesionales de la salud» (Ministerio de Salud de la Nación, DNSSR, 2023) o, donde se indica, del consenso FASGO 2021 de anticoncepción libre de estrógenos.
Lo que esas fuentes no traen no se incluye."""
from datos import P

R_MSAL = {'t': 'Métodos anticonceptivos: guía práctica para profesionales de la salud (edición 2023)', 'c': 'Ministerio de Salud de la Nación, DNSSR · ISBN 978-950-38-0332-5'}
R_FASGO = {'t': 'Consenso FASGO 2021: anticoncepción libre de estrógenos', 'c': 'FASGO, 2021'}

def fte(*extras, nota=''):
    return dict(tipo='guia', guia='Métodos anticonceptivos: guía práctica para profesionales de la salud (edición 2023)', sociedad='Ministerio de Salud de la Nación · DNSSR', anio=2023,
                nota=nota, argentinas=[R_MSAL] + list(extras))

NO_HIST = 'Ver la ficha del método para las categorías de elegibilidad completas.'

FARMACOS_MAC = [
    dict(id='fx-aco-combinado', titulo='Anticonceptivos orales combinados (etinilestradiol + gestágeno)', alias=['aco', 'pastilla anticonceptiva', 'pildora anticonceptiva', 'etinilestradiol', 'levonorgestrel', 'drospirenona', 'desogestrel', 'gestodeno', 'dienogest', 'ciproterona', 'anticonceptivo oral combinado'], up=['fx4'],
         clase='Estrógeno + progestágeno (anticonceptivo hormonal combinado oral)', fuente=fte(),
         indicaciones=['Anticoncepción reversible de corta duración, de toma diaria y alta eficacia.', 'Beneficios adicionales: protegen contra el cáncer de endometrio, de ovario y de colon y contra la EPI sintomática; reducen el síndrome premenstrual, la dismenorrea, los problemas del sangrado, el hirsutismo y los síntomas del síndrome de ovario poliquístico y de la endometriosis.'],
         mecanismo=['Inhibición fuerte de la FSH por el estrógeno exógeno e inhibición del pico de LH por el gestágeno: se detienen el desarrollo folicular, la ovulación y la formación del cuerpo lúteo. El estrógeno estabiliza el endometrio y regulariza el sangrado de la semana sin toma.'],
         dosis=[dict(titulo='Esquema', pasos=[P('Toma', '1 comprimido por día a la misma hora. Blíster de 21: 7 días sin tomar y reiniciar el 8.º día. Blíster de 28: sin pausa, los inactivos corresponden al sangrado.'), P('Inicio', 'El primer día de la menstruación (sin respaldo). En otro momento, con razonable certeza de no embarazo y preservativo durante 7 días.'), P('Olvido de 1 comprimido', 'Tomarlo cuando se recuerda y seguir; sin respaldo.'), P('Olvido de 2 o más', 'Tomar el último olvidado ya, seguir y actuar según la semana (preservativo 7 días; AHE en la primera semana si hubo relaciones; en la tercera, saltar la semana libre).')]),
                dict(titulo='Composición y presentaciones', pasos=[P('Estrógeno', 'Etinilestradiol 35, 30, 20 o 15 µg; valerato de estradiol 2 mg; 17β-estradiol 1,5 mg.'), P('Gestágeno', 'Ciproterona, levonorgestrel o norgestrel, desogestrel, norgestimato, gestodeno, drospirenona, dienogest o nomegestrol.'), P('Blísteres', '21 comprimidos activos, o 28 (21 activos + 7 inactivos, o 24 activos + 4 inactivos). Monofásicos (los más usados), trifásicos y multifásicos.')])],
         contraindicaciones=['Categoría 4: lactancia exclusiva con menos de 6 semanas posparto; mayor de 35 años que fuma más de 15 cigarrillos por día; hipertensión ≥ 160/100; TVP o embolia pulmonar actual o previa; cirugía mayor con inmovilización prolongada; mutaciones trombogénicas; cardiopatía isquémica o ACV; migraña con aura; cáncer de mama actual; LES con anticuerpos antifosfolípidos; cirrosis descompensada y tumores hepáticos.', NO_HIST],
         efectos=['Spotting o sangrado irregular los primeros 3 ciclos; cefalea, mareos, náuseas, mastalgia, cambios de peso y de humor; el acné puede mejorar o empeorar; pequeño aumento de la presión arterial.', 'Muy raros: trombosis venosa profunda o embolia pulmonar. Extremadamente raros: ACV e infarto agudo de miocardio.'],
         tiempos=['El efecto anticonceptivo requiere 7 días de toma correcta (inmediato si se inicia el primer día de la menstruación).', 'La fertilidad se recupera de inmediato al suspender.'],
         precauciones=['Embarazo: no se conoce daño por la exposición a anticonceptivos hormonales en un embarazo no detectado.', 'Lactancia: los estrógenos pueden influir en la cantidad y calidad de la leche; se inician desde los 6 meses (categoría 3 entre las 6 semanas y los 6 meses).', 'Interacciones: rifampicina, rifabutina y anticonvulsivantes inductores (fenitoína, carbamazepina, barbitúricos, primidona, topiramato, oxcarbazepina) bajan la eficacia (categoría 3); la lamotrigina puede reducirse y provocar convulsiones. Los antibióticos de amplio espectro, antifúngicos y antiparasitarios no la afectan (categoría 1).']),

    dict(id='fx-aci-mensual', titulo='Anticonceptivo combinado inyectable mensual (Mesigyna®, Cyclofem®)', alias=['aci', 'inyectable mensual', 'mesigyna', 'ginediol', 'cyclofem', 'valerato de estradiol', 'enantato de noretisterona', 'cipionato de estradiol'], up=['fx4'],
         clase='Estrógeno de acción breve + progestágeno de depósito', fuente=fte(nota='Complementa el folleto de adherencia del Ministerio sobre la inyección mensual.'),
         indicaciones=['Anticoncepción hormonal combinada mensual para quien no logra sostener una pastilla diaria.'],
         mecanismo=['Inhibe la ovulación.'],
         dosis=[dict(titulo='Preparados', pasos=[P('Mesigyna® / Ginediol®', 'Valerato de estradiol 5 mg + enantato de noretisterona 50 mg.'), P('Cyclofem®', 'Cipionato de estradiol 5 mg + acetato de medroxiprogesterona 25 mg.'), P('No recomendados', 'Perlutal® / Atrimon® (acetofénido de dihidroxiprogesterona 150 mg + enantato de estradiol 10 mg): más dosis de estrógeno y más trastornos del sangrado.')]),
                dict(titulo='Esquema', pasos=[P('Vía', 'Intramuscular profunda, en cadera, glúteo o parte superior del brazo; no masajear.'), P('Frecuencia', 'Cada 30 días, en la misma fecha del calendario.'), P('Margen', 'Hasta 7 días antes o después de la fecha (se recomienda dentro de los 3 días).'), P('Inicio', 'Primer día de la menstruación (sin respaldo) u otro día con razonable certeza de no embarazo y preservativo 7 días.')])],
         contraindicaciones=['Las de los anticonceptivos combinados, con diferencias: la cirrosis descompensada, el adenoma hepatocelular y la fumadora ≥ 35 años con más de 15 cigarrillos son categoría 3 (4 en los ACO); la patología vesicular sintomática, la colestasis por ACO y las interacciones con rifampicina y anticonvulsivantes son categoría 2 (3 en los ACO).'],
         efectos=['Primeros 3 meses: sangrado irregular o prolongado; al año, amenorrea o sangrado infrecuente. Aumento de peso, cefalea, mareos y mastalgia.'],
         tiempos=['El sangrado aparece entre los 15 y 20 días de la aplicación.', 'Eficacia: menos de 1 embarazo cada 100 con uso correcto (5 por 10.000) y 3 cada 100 con uso habitual. Fertilidad inmediata al suspender.'],
         precauciones=['Conservar las ampollas a temperatura ambiente, no en la heladera.', 'Con más de 7 días de demora: preservativo o abstención 7 días después de la nueva inyección y AHE si hubo relaciones.']),

    dict(id='fx-parche-anillo', titulo='Parche transdérmico y anillo vaginal combinados', alias=['parche anticonceptivo', 'norelgestromina', 'evra', 'anillo vaginal', 'nuvaring', 'etonogestrel', 'etinilestradiol'], up=['fx4'],
         clase='Estrógeno + progestágeno de liberación continua', fuente=fte(),
         indicaciones=['Anticoncepción hormonal combinada con liberación constante, sin absorción gastrointestinal ni primer paso hepático.'],
         mecanismo=['Inhibición de la ovulación (mismo mecanismo que los ACO).'],
         dosis=[dict(titulo='Parche', pasos=[P('Liberación diaria', '20 µg de etinilestradiol + 150 µg de norelgestromina.'), P('Esquema', '1 parche por semana durante 3 semanas y 1 semana sin parche (sangrado).')]),
                dict(titulo='Anillo', pasos=[P('Carga', '2,7 mg de etinilestradiol y 11,7 mg de etonogestrel; libera por día 15 µg de etinilestradiol y 120 µg de etonogestrel.'), P('Esquema', '3 semanas colocado, retiro en la cuarta semana (sangrado), 7 días libres y uno nuevo.')])],
         contraindicaciones=['Las mismas que los anticonceptivos combinados. ' + NO_HIST],
         efectos=['Parche: menor eficacia en usuarias de 90 kg o más. Anillo: dolor, irritación, aumento de la secreción vaginal, lesiones epiteliales, incomodidad en el coito, expulsión.'],
         tiempos=['Parche: 2 días adicionales de protección ante un olvido de recambio.', 'No están incluidos en la canasta de entrega gratuita.']),

    dict(id='fx-minipildora', titulo='Minipíldora de progestágeno solo (levonorgestrel 0,03 mg / linestrenol 0,5 mg)', alias=['minipildora', 'aops', 'levonorgestrel 30', 'linestrenol', 'pildora de solo progestageno'], up=['fx4'],
         clase='Progestágeno oral (anticonceptivo no anovulatorio)', fuente=fte(),
         indicaciones=['Anticoncepción oral para quien amamanta o tiene contraindicación de estrógenos; en lactancia se asocia al MELA.'],
         mecanismo=['Altera el moco cervical (dificulta el ascenso de los espermatozoides); produce anovulación solo en hasta 40 % de los ciclos.'],
         dosis=[dict(titulo='Esquema', pasos=[P('Presentación', 'Levonorgestrel 0,03 mg en blísteres de 28 o 35 comprimidos activos; linestrenol 0,5 mg en blísteres de 28.'), P('Toma', '1 comprimido por día a la misma hora, sin descanso entre envases.'), P('Margen de seguridad', '3 horas (el moco pierde su impenetrabilidad unas 27 horas después de la toma).'), P('Inicio del efecto', '2 días (48 horas) de toma correcta.')]),
                dict(titulo='Olvido', pasos=[P('Menos de 3 horas', 'Tomarla y seguir; sin respaldo.'), P('3 horas o más', 'Tomarla ya, seguir y usar preservativo 48 horas; considerar AHE si hubo relaciones.')])],
         contraindicaciones=['Categoría 4: cáncer de mama actual.', 'Categoría 3: TVP o embolia pulmonar en curso; cardiopatía isquémica, ACV o migraña con aura que aparecen durante el uso; cáncer de mama pasado con menos de 5 años; cirrosis grave; adenoma y tumores malignos del hígado; LES con anticuerpos antifosfolípidos.'],
         efectos=['Irregularidades del sangrado e incluso amenorrea; cefalea, mareos, cambios de humor o de libido, mastalgia, dolor abdominal, náuseas, acné.'],
         tiempos=['Eficacia: menos de 1 embarazo cada 100 con uso correcto (3 por 1.000) y cerca de 9 con uso habitual.'],
         precauciones=['Lactancia: no afecta el volumen ni la composición de la leche.', 'Embarazo: tomada por error no afecta al feto ni el curso del embarazo.', 'Vómitos dentro de las 2 horas: tomar otra pastilla.']),

    dict(id='fx-desogestrel', titulo='Desogestrel 75 µg', alias=['desogestrel', 'cerazette', 'pildora de desogestrel', 'aops anovulatoria'], up=['fx4'],
         clase='Progestágeno oral (anticonceptivo anovulatorio)', fuente=fte(R_FASGO, nota='La falta de efecto sobre la masa ósea, la lactosa como excipiente y la eficacia de 0,3 provienen del consenso FASGO 2021.'),
         indicaciones=['Anticoncepción oral cuando los estrógenos están contraindicados o no se desean (fumadoras, migraña, antecedente de tromboembolismo, hipertensión) y en el posparto con o sin lactancia.'],
         mecanismo=['Inhibe el pico de LH y logra anovulación en 97 % de los ciclos; además espesa el moco cervical.'],
         dosis=[dict(titulo='Esquema', pasos=[P('Presentación', '0,075 mg en envases de 28 comprimidos activos.'), P('Toma', '1 comprimido por día a la misma hora, sin pausa entre envases.'), P('Margen de seguridad', '12 horas.'), P('Inicio del efecto', '7 días de toma correcta (respaldo 7 días si no se inicia el primer día de la menstruación).')]),
                dict(titulo='Olvido', pasos=[P('Menos de 12 horas', 'Tomarla y seguir; sin respaldo.'), P('12 horas o más', 'Tomarla ya, seguir, preservativo 7 días y considerar AHE si hubo relaciones.')])],
         contraindicaciones=['Categoría 4: cáncer de mama actual.', 'Categoría 3: TVP o embolia pulmonar en curso; cardiopatía isquémica, ACV o migraña con aura que aparecen durante el uso; cáncer de mama pasado con menos de 5 años; cirrosis grave; adenoma y tumores malignos del hígado; LES con anticuerpos antifosfolípidos.'],
         efectos=['Irregularidades del sangrado, amenorrea, cefalea, mareos, cambios de humor y de libido, mastalgia, acné.'],
         tiempos=['Eficacia con uso correcto: 0,3 cada 100 (FASGO); menos de 1 (3 por 1.000) y cerca de 9 con uso habitual (MSAL).'],
         precauciones=['La píldora contiene lactosa: investigar intolerancia antes de prescribirla.', 'No disminuye la densidad mineral ósea en ninguna etapa (FASGO).', 'Lactancia: puede iniciarse de inmediato, con o sin amamantamiento.']),

    dict(id='fx-drospirenona', titulo='Drospirenona 4 mg (píldora de solo progestágeno)', alias=['drospirenona sola', 'slinda', '24/4', 'antimineralocorticoide'], up=['fx4'],
         clase='Progestágeno oral antimineralocorticoide', fuente=dict(tipo='guia', guia='Consenso de Anticoncepción libre de estrógenos', sociedad='FASGO', anio=2021, argentinas=[R_FASGO], nota='No figura en la guía MSAL 2023.'),
         indicaciones=['Anticoncepción oral sin estrógeno con sangrado por deprivación predecible; sin contraindicación en hipertensas, fumadoras, con riesgo cardiovascular u obesas.'],
         mecanismo=['Supresión de la ovulación. Actividad antimineralocorticoide comparable a 25 mg de espironolactona. Protege de la hiperproliferación endometrial.'],
         dosis=[dict(titulo='Esquema', pasos=[P('Presentación', '4 mg: 24 comprimidos activos seguidos de 4 inertes.'), P('Margen de seguridad', '24 horas para el olvido.')])],
         contraindicaciones=['El consenso FASGO no detalla contraindicaciones propias: aplican los criterios generales de los métodos de solo progestágeno (categoría 4 en cáncer de mama actual).'],
         efectos=['Sangrado por deprivación predecible; menos sangrado irregular imprevisto.'],
         tiempos=['Eficacia: 0,6 cada 100 con uso correcto.']),

    dict(id='fx-implante', titulo='Implante subdérmico (etonogestrel y levonorgestrel)', alias=['implante', 'implanon', 'nexplanon', 'jadelle', 'levoplant', 'sino-implant', 'etonogestrel'], up=['fx4'],
         clase='Progestágeno de liberación prolongada (LARC)', fuente=fte(R_FASGO),
         indicaciones=['Anticoncepción reversible de larga duración, de uso en lactancia, posevento obstétrico inmediato y cuando los estrógenos están contraindicados.'],
         mecanismo=['Inhibe la ovulación y espesa el moco cervical.'],
         dosis=[dict(titulo='Preparados', pasos=[P('Implanon® / Nexplanon®', '1 varilla de 4 cm × 2 mm con 68 mg de etonogestrel. 3 años (ANMAT).'), P('Jadelle®', '2 varillas con 75 mg de levonorgestrel cada una (150 mg). 5 años.'), P('Levoplant® / Sino-implant II', '2 varillas con 75 mg de levonorgestrel cada una. 3 años.')]),
                dict(titulo='Colocación', pasos=[P('Dónde', 'Subdérmico, cara interna de la parte superior del brazo no dominante, evitando el surco entre bíceps y tríceps.'), P('Cuándo', 'Primeros 5 días del ciclo sin respaldo; otro día con razonable certeza de no embarazo y preservativo 7 días.'), P('Quién', 'Profesional entrenado, con anestesia local.')])],
         contraindicaciones=['Categoría 4: cáncer de mama actual.', 'Categoría 3: TVP o embolia pulmonar en curso; cardiopatía isquémica o ACV mientras lo usaba; migraña con aura de aparición durante el uso; cáncer de mama pasado con menos de 5 años; cirrosis grave; tumores hepáticos; LES con anticuerpos antifosfolípidos; sangrado vaginal sin diagnóstico.'],
         efectos=['Cambios del patrón de sangrado (irregular, ausencia o aumento), aumento de peso y cefalea: principales motivos de retiro. Raro: infección en el sitio o varilla que se asoma.'],
         tiempos=['Eficacia: 0,05 %. Fertilidad inmediata al retirarlo.', 'Con levonorgestrel y más de 80 kg, considerar retirar el Jadelle a los 4 años.'],
         precauciones=['Los inductores enzimáticos (rifampicina, anticonvulsivantes) reducen su eficacia (FASGO).', 'Lactancia: puede iniciarse de inmediato (categoría 2 si amamanta en las primeras 6 semanas).']),

    dict(id='fx-siu-levonorgestrel', titulo='Sistema intrauterino de levonorgestrel (SIU-LNG)', alias=['siu', 'mirena', 'kyleena', 'blusiri', 'diu hormonal', 'diu con levonorgestrel'], up=['fx4'],
         clase='Progestágeno intrauterino (LARC)', fuente=fte(),
         indicaciones=['Anticoncepción de larga duración, especialmente en menstruaciones muy abundantes; alternativa a los tratamientos quirúrgicos del sangrado abundante; prevención de la hiperplasia endometrial.'],
         mecanismo=['Altera el moco cervical y evita la proliferación del endometrio (atrofia, resistente a la estimulación estrogénica). Casi sin absorción sistémica; puede inhibir la ovulación solo en los primeros ciclos.'],
         dosis=[dict(titulo='Modelos', pasos=[P('Mirena®', '52 mg de levonorgestrel. 5 años (canasta de la DNSSR).'), P('Kyleena®', '19,5 mg. 5 años.'), P('Blusiri®', '13,5 mg. 3 años.')]),
                dict(titulo='Colocación', pasos=[P('Cuándo', 'En cualquier momento con razonable certeza de no embarazo, de preferencia durante la menstruación; posparto hasta 48 horas o desde la cuarta semana.'), P('Efectivo', 'A los 7 días de colocado (preservativo la primera semana).'), P('Reemplazo', 'Extraer y colocar el nuevo en el mismo procedimiento.')])],
         contraindicaciones=['Categoría 4: embarazo, sepsis puerperal, posaborto séptico, hemorragia vaginal sin diagnóstico, cáncer cervical o endometrial al iniciar, anomalías de la cavidad, EPI o cervicitis purulenta al iniciar, tuberculosis pélvica al iniciar y cáncer de mama actual.', NO_HIST],
         efectos=['Sangrado prolongado los primeros 3 a 6 meses, luego más leve; amenorrea en 50 % a los 2 años; goteo persistente inicial; acné, cefalea, tensión mamaria; quistes foliculares transitorios.'],
         tiempos=['Eficacia: 0,2 cada 100 por año. Fertilidad inmediata al retirarlo (80 % de concepción en el primer año).', 'La ANMAT no extendió su duración más allá de los 5 años (estudios hasta 8 años).']),
]

# Parches a fichas ya existentes con los datos de la guía argentina
PARCHES_MAC = {
    'fx-levonorgestrel-ec': dict(
        mecanismo=['Bloquea o retrasa la ovulación (inhibe el pico preovulatorio de LH) y espesa el moco cervical. No impide la implantación, no afecta el endometrio y no interrumpe ni daña un embarazo ya establecido (guía MSAL 2023).'],
        dosis=[dict(titulo='Según la guía argentina (MSAL 2023)', pasos=[
            P('Dosis', '1,5 mg en una dosis única (preferida) o 0,75 mg dos comprimidos, juntos o separados por 12 horas.'),
            P('Plazo', 'Lo antes posible, hasta las 120 horas (5 días): 95 % de eficacia en las primeras 12 horas y 58 % entre las 49 y 72 horas.'),
            P('Doble dosis (3 mg)', 'IMC ≥ 30 o peso mayor de 80 kg (el consenso FASGO 2021 usa IMC ≥ 26 o ≥ 70 kg) y con inductores del CYP450: efavirenz, ritonavir, algunos antituberculosos y antiepilépticos, hierba de San Juan.'),
            P('Vómitos', 'Si vomita dentro de las 2 horas, repetir la dosis.')])],
        contraindicaciones=['Guía MSAL 2023: sin contraindicaciones médicas (categorías 1 o 2 de la OMS); solo no se indica con embarazo confirmado, pero puede darse ante la duda.'],
        efectos=['La menstruación llega en fecha en el 50 %, antes en el 35 % y con atraso en el 13 %; si el atraso supera una semana, hacer un test. Náuseas, vómitos, dolor abdominal, fatiga, cefalea, mastalgia y mareos.'],
        tiempos=['Venta libre sin receta en Argentina (Resolución 1062/2023) y de entrega gratuita en el sistema público.'],
        argentinas=[R_MSAL, R_FASGO],
        nota='Complementado el 24/10/2026 con la guía MSAL 2023.'),
    'fx-medroxiprogesterona': dict(
        mecanismo=['Inhibe la ovulación; el consenso FASGO 2021 agrega cambios en el moco cervical y atrofia endometrial.'],
        dosis=[dict(titulo='Según la guía argentina (MSAL 2023)', pasos=[
            P('Esquema', '150 mg por vía intramuscular profunda cada 13 semanas (90 días); la formulación subcutánea de 104 mg tiene duración similar.'),
            P('Margen', 'Se puede aplicar hasta 2 semanas antes o 4 semanas después de la fecha.'),
            P('Atraso mayor de 4 semanas', 'Barrera durante los siguientes 7 días o abstención de la penetración pene-vagina hasta recibirla; no esperar la menstruación para reiniciar.')])],
        contraindicaciones=['Guía MSAL 2023: categoría 4 en cáncer de mama actual. Categoría 3: primeras 6 semanas posparto con lactancia, TVP o embolia pulmonar, hipertensión ≥ 160/100, cardiopatía isquémica o ACV, múltiples factores de riesgo cardiovascular, cirrosis grave, tumores hepáticos, LES con anticuerpos antifosfolípidos, sangrado vaginal sin diagnóstico.'],
        efectos=['Sangrado irregular al inicio y amenorrea al año; aumento gradual de peso; fertilidad que suele volver a los 10 meses de la última inyección. Pérdida leve de densidad mineral ósea que se recupera al suspender: en menores de 18 años, con factores de riesgo de osteoporosis y en mayores de 50, considerar otras opciones; reevaluar cada 2 años.'],
        argentinas=[R_MSAL, R_FASGO],
        nota='Complementado el 24/10/2026 con la guía MSAL 2023.'),
}
