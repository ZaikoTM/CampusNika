# -*- coding: utf-8 -*-
"""Algoritmos de manejo (2026-10-21) para las fichas de Ginecología y Obstetricia que todavía no los tenían.
Reordenan en forma de decisión lo que ya dice la fuente de cada ficha (consenso FASGO, guías o apunte); no suman datos nuevos."""
from contenido import I, A, F, D

# ---------------- gin-pubertad-precoz ----------------
_pp_central = [A('Pubertad precoz central: análogos de GnRH (triptorelina o leuprolide, 1 ampolla IM cada 28 días)'),
               A('Controles cada 3 meses (caracteres sexuales y velocidad de crecimiento) y edad ósea anual; mantener sin suspender antes de los 10 años cronológicos (en general se cierra a los 11 años de edad ósea)'),
               F('Si es neurogénica, RM de cerebro y tratamiento de la causa')]
_pp_perif = [A('Pubertad precoz periférica: tratar según la causa'),
             A('Quistes foliculares: involución espontánea. Tumores feminizantes de ovario (estradiol muy alto con gonadotrofinas bajas): cirugía'),
             F('McCune-Albright: tamoxifeno 10–20 mg/día o testolactona; evitar el exceso de estrógenos que adelante la edad ósea')]
_pp_inc = D('¿Es un botón mamario o un vello pubiano aislado, con velocidad de crecimiento normal?',
            [F('Telarca o adrenarca precoz aislada: conducta expectante; estudiar si persiste más de 18 meses o progresa')],
            [A('Seguir el estudio hasta definir el origen')])
_pa = dict(
    algoritmo=dict(titulo='Niña con caracteres sexuales secundarios antes de los 8 años', nodos=[
        I('Historia clínica, Tanner, curva de crecimiento y examen neuroftalmológico; edad ósea (mano y muñeca izquierda), LH, FSH, estradiol, TSH y ecografía pelviana'),
        _pp_inc,
        D('¿Las gonadotrofinas (LH y FSH) tienen respuesta puberal a la prueba de GnRH?', _pp_central, _pp_perif),
    ]))

# ---------------- gin-retraso-puberal ----------------
_rp_hipo = D('¿LH y FSH bajas (hipogonadismo hipogonadotrófico)?',
             [A('Buscar anosmia (síndrome de Kallmann), tumores, hiperprolactinemia, hipotiroidismo y enfermedades crónicas; RM de región selar'),
              A('Inducción de la pubertad con estrógenos a bajas dosis desde los 13 años de edad cronológica (11–12 años de edad ósea)')],
             [D('¿Hay estigmas de Turner o gonadotrofinas elevadas (hipogonadismo hipergonadotrófico)?',
                [A('Cariotipo y evaluación genética; apoyo psicológico, cirugía si hubiera gónada masculina y sustitución hormonal')],
                [F('Retraso constitucional del crecimiento: contención y controles frecuentes; completa el desarrollo y la fertilidad')])])
_rpa = dict(
    algoritmo=dict(titulo='Sin desarrollo puberal a los 13 años', nodos=[
        I('Sin telarca a los 13 años (2 desvíos estándar): historia clínica, Tanner, talla y velocidad de crecimiento; edad ósea, LH, FSH, estradiol, TSH y prolactina; ecografía pelviana'),
        _rp_hipo,
    ]))

# ---------------- gin-ive-ile ----------------
_ive = dict(
    algoritmo=dict(titulo='Solicitud de interrupción del embarazo (Ley 27.610)', nodos=[
        I('Persona gestante solicita la interrupción: consejería, información y acompañamiento; confirmar la edad gestacional'),
        D('¿El embarazo tiene 14 semanas o menos (hasta la semana 14 inclusive)?',
          [A('IVE: es un derecho; se garantiza la práctica en un máximo de 10 días corridos desde la solicitud, de forma gratuita y con cobertura integral')],
          [D('¿Es consecuencia de una violación o hay peligro para la vida o la salud integral de la persona gestante?',
             [A('ILE: se garantiza la práctica en un máximo de 10 días corridos; con la causal verificada')],
             [F('No se cumple ninguna causal: acompañamiento, información y derivación según el caso')])]),
        D('¿El profesional objeta conciencia?', [A('Debe derivar de inmediato a otro profesional que garantice la práctica')], [A('Realizar la práctica según el protocolo del Ministerio de Salud de la Nación')]),
        A('Anticoncepción posaborto, control posterior y pautas de alarma'),
    ]))

# ---------------- obs-colestasis ----------------
_co_respuesta = D('¿Responde al tratamiento (descienden los ácidos biliares o las enzimas)?',
                  [A('Continuar con control ambulatorio o internado según la edad gestacional y el riesgo; interrupción a las 37 semanas (el 90 % de las muertes fetales ocurre después)')],
                  [A('Subir el ácido ursodesoxicólico al máximo (1200 mg/día) y reclasificar como alto riesgo'),
                   F('Evaluar la maduración pulmonar y la interrupción, según la edad gestacional')])
_co = dict(
    algoritmo=dict(titulo='Prurito con ácidos biliares elevados en el segundo o tercer trimestre', nodos=[
        I('Prurito sin lesiones primarias: ácidos biliares, transaminasas, bilirrubina, coagulograma y serologías; ecografía hepatobiliar; descartar dermatosis del embarazo'),
        A('Ácido ursodesoxicólico 900 mg/día (12–15 mg/kg/día; máximo 1200 mg/día); antihistamínico si el prurito molesta; dieta hepatoprotectora'),
        A('Estado fetal: monitoreo o perfil biofísico una o dos veces por semana; crecimiento y líquido amniótico'),
        D('¿Ácidos biliares ≥ 40 µmol/l, enzimas > 2 veces lo normal o sin respuesta al tratamiento?',
          [A('Alto riesgo: parto pretérmino y meconio 4 veces más frecuentes; internar y evaluar corticoides entre las 24 y 34 semanas'), _co_respuesta],
          [D('¿Ácidos biliares de 20 a 39 µmol/l o enzimas hasta el doble?',
             [A('Riesgo moderado: < 28 semanas, ambulatorio con control semanal; 28 a 34 semanas, internar y, si responde, alta; > 34 semanas con buena respuesta, control ambulatorio hasta las 37')],
             [A('Riesgo bajo (10 a 19 µmol/l con enzimas normales): ambulatorio; internar a las 37–38 semanas')])]),
    ]))

# ---------------- obs-gemelar ----------------
_ge_cono = D('¿Es monocorial?',
             [A('Controles ecográficos cada 2 semanas desde las 16 semanas (STT, TAPS, RCIU selectivo); consultas cada 4 semanas hasta la 24, cada 2 hasta la 32 y luego semanal'),
              D('¿Hay síndrome de transfusión feto-fetal (polihidramnios con BVM > 8 cm y oligoamnios con BVM < 2 cm)?',
                [A('Estadio I: conducta expectante (cerca del 40 % se estabiliza)'), A('Estadios II a IV: ablación láser de las anastomosis por fetoscopía')],
                [A('Seguir el control ecográfico quincenal')]),
              D('¿Es monoamniótico?', [F('Finalizar por cesárea a las 32–33 semanas')], [F('Biamniótico sin complicaciones: finalizar a las 36–37 semanas')])],
             [A('Bicorial: consultas cada 4 semanas hasta la 32, cada 2 hasta la 36 y luego semanal'), F('Bicorial sin complicaciones: finalizar a las 37–38 semanas')])
_gem = dict(
    algoritmo=dict(titulo='Embarazo gemelar: corionicidad y finalización', nodos=[
        I('Ecografía precoz o de las 11–14 semanas: edad gestacional, corionicidad y amnionicidad; screening combinado para aneuploidías'),
        A('Aspirina 150 mg/día antes de la semana 16 y hasta la 34–35; longitud cervical entre las 20 y 22 semanas'),
        D('¿Cuello < 25 mm en una asintomática?', [A('Progesterona vaginal 400 mg/día (el cerclaje no se recomienda de rutina)')], [A('Seguimiento habitual')]),
        _ge_cono,
        D('¿Riesgo de parto en 7 días entre las 24 y 34 semanas?', [A('Un ciclo de corticoides')], [A('Sin corticoides')]),
        A('Vía de parto: el embarazo doble no es indicación de cesárea por sí mismo; cesárea si hay primer feto en podálica o transversa, monoamniótico, 3 o más fetos o complicaciones'),
    ]))

# ---------------- obs-placenta-previa ----------------
_pl = dict(
    algoritmo=dict(titulo='Hemorragia indolora de la segunda mitad del embarazo', nodos=[
        I('Sangrado rojo rutilante e indoloro, con tono uterino normal: NO hacer tacto vaginal; ecografía obstétrica; especuloscopía para descartar causas cervicovaginales'),
        D('¿Se confirma placenta previa?',
          [D('¿Hay hemorragia grave o inestabilidad hemodinámica?',
             [A('Internar con reposo absoluto, reposición y control de la hemorragia'),
              D('¿Tiene menos de 36 semanas?', [A('Evaluar la madurez pulmonar y madurar con corticoides; uteroinhibidores si hace falta')], [A('Interrumpir sin esperar')]),
              F('Cesárea (con hemorragia incontrolable se interrumpe aunque no esté madurado)')],
             [A('Esperar la madurez pulmonar si el cuadro lo permite'),
              D('¿Tiene 4 cm o más de dilatación y la placenta no es oclusiva?', [A('Intentar la rotura de membranas (método de Puzos); si falla, cesárea')], [F('Cesárea programada con madurez pulmonar')])])],
          [F('Sospechar otras causas: desprendimiento de placenta (dolor, tono elevado), rotura uterina o lesiones cervicovaginales')]),
    ]))

# ---------------- obs-dppni ----------------
_dp = dict(
    algoritmo=dict(titulo='Sangrado oscuro con dolor e hipertonía en la segunda mitad del embarazo', nodos=[
        I('Hemorragia oscura con coágulos, dolor agudo e hipertonía («útero leñoso»); pensar primero en preeclampsia. Vía venosa, sangre isogrupo, hemograma y fibrinógeno seriado; monitoreo fetal; ecografía (hematoma retroplacentario)'),
        A('Reponer sangre y estabilizar a la madre: la hemorragia continúa hasta que el útero se evacúa'),
        D('¿El feto está vivo?',
          [F('Extracción urgente del feto, habitualmente por cesárea')],
          [D('¿El estado general materno es bueno?',
             [A('Parto vaginal: rotura precoz de la bolsa y oxitocina EV; con cuello inmaduro, PGE2 en gel 2,5–5 mg o misoprostol'),
              D('¿Se agrava la paciente o fracasa la inducción?', [F('Cesárea')], [A('Continuar la inducción con monitoreo')])],
             [F('Cesárea')])]),
        A('Después del parto vigilar la atonía (masaje y oxitócicos; histerectomía si fracasan) y la hipofibrinogenemia'),
    ]))

CONTENIDO3 = {'gin-pubertad-precoz': _pa, 'gin-retraso-puberal': _rpa, 'gin-ive-ile': _ive, 'obs-colestasis': _co, 'obs-gemelar': _gem,
              'obs-placenta-previa': _pl, 'obs-dppni': _dp}
