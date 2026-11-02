# -*- coding: utf-8 -*-
"""UP8 (traumatologia): contraste de cada ficha, basada en el Manual CTO 11.ª ed., con los otros libros de la sala
(Ortopedia y Traumatologia Basica de Orrego y Moran, Traumatologia de QxMedic/Guzman, Schwartz 10.ª ed. cap. 43 y 44, Michans 5.ª ed. cap. 19).
Cada punto fue leido en el texto de esos libros. Idempotente. Uso: python -I tools/cirugia/contrastes_trauma.py (despues de ampliar.py)"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIBROS = 'Orrego y Morán, Ortopedia y Traumatología Básica; QxMedic (Guzmán), Traumatología; Schwartz 10.ª ed.; Michans 5.ª ed.'
C = {
 'cx-fractura-escafoides': ('coincide', 'Orrego y Morán, Ortopedia y Traumatología Básica', [
    'Fractura no desplazada: yeso que incluye el pulgar. CTO indica 2 a 3 meses; Orrego y Morán, 8 a 12 semanas, con la duración definida por los signos radiológicos de consolidación y la ausencia de dolor.',
    'Orrego y Morán agrega la tomografía cuando hay dudas sobre la consolidación; CTO, repetir la radiografía a las 2 semanas si la sospecha clínica es fuerte y no se ve la fractura.']),
 'cx-fractura-clavicula': ('coincide', 'Orrego y Morán y QxMedic', [
    'CTO: tratamiento conservador con vendaje en ocho en la gran mayoría. Orrego y Morán: cabestrillo, inmovilizador de hombro o vendaje en ocho por al menos 4 semanas, y ningún método demostró ser mejor.',
    'QxMedic: cabestrillo o Velpeau si no hay desplazamiento, vendaje en ocho si está desplazada, y placa con tornillos en las complicadas (expuesta, entre otras).',
    'Coinciden en reservar la cirugía para fracturas expuestas y complicadas.']),
 'cx-luxacion-glenohumeral': ('coincide', 'Orrego y Morán, QxMedic y Schwartz 10.ª ed.', [
    'Orrego y Morán la define como urgencia: reducción ortopédica oportuna con analgesia y sedación, y radiografías posreducción para confirmar la congruencia. Schwartz y QxMedic indican reducción cerrada.',
    'QxMedic: no hay pruebas de que una técnica de reducción sea superior; conviene la más rápida y simple. Schwartz: la proyección axilar es la más importante para no pasar por alto la luxación.']),
 'cx-fractura-cadera': ('difiere', 'Schwartz 10.ª ed., cap. 43, y QxMedic', [
    'La ficha dice "cirugía precoz". Schwartz precisa que debe hacerse lo antes posible, de modo típico en 24 a 48 horas, optimizando antes el estado clínico de los pacientes con enfermedades coexistentes.',
    'En la fractura desplazada del anciano, QxMedic elige según la demanda funcional: hemiartroplastia con baja demanda y esperanza de vida menor de 3 años, y artroplastia total en el paciente activo con esperanza de vida mayor de 3 años.']),
 'cx-fracturas-expuestas': ('difiere', 'Orrego y Morán, Ortopedia y Traumatología Básica', [
    'Antibióticos: la ficha sigue a CTO (cefazolina 2 g y, en el grado IIIa, aminoglucósido; hasta 24 horas, y hasta 72 horas en los IIIB y IIIC). Orrego y Morán indica cefazolina 2 g al ingreso y 1 g cada 6 a 8 horas por 2 a 3 días en los tipos I y II, y agrega gentamicina (3 a 5 mg/kg/día) a todo el tipo III; duración no mayor de 3 días, repitiendo el esquema en cada nuevo procedimiento mayor.',
    'Orrego y Morán suma penicilina en dosis altas ante sospecha de anaerobios (terreno agrícola) o lesión de intestino en la pelvis. Michans destaca el desbridamiento amplio y la estabilización ósea como pasos fundamentales.']),
 'cx-sindrome-compartimental': ('difiere', 'CTO y Orrego y Morán', [
    'Primer paso: la ficha dice retirar el yeso o vendaje y posicionar el miembro a nivel del corazón. CTO indica retirar los vendajes y mantener la extremidad elevada para que no aumente el edema; Orrego y Morán no especifica la posición.',
    'Orrego y Morán: basta la sospecha clínica para proceder de inmediato a la fasciotomía. CTO: se retiran los vendajes y, si el cuadro no cede, se hace la apertura quirúrgica urgente; si hay una fractura asociada, se estabiliza al mismo tiempo o de forma diferida entre 12 y 24 horas.',
    'Schwartz: los pulsos normales no descartan el diagnóstico. Compartimentos: antebrazo 3, pierna 4, muslo 3 (Orrego y Morán).']),
 'cx-fractura-radio-distal': ('difiere', 'Orrego y Morán, Ortopedia y Traumatología Básica', [
    'La ficha (CTO) indica reducción cerrada, yeso con controles radiológicos semanales hasta la 4.ª o 5.ª semana y consolidación en unas 6 semanas. Orrego y Morán detalla la maniobra (tracción mantenida, hiperflexión y ulnarización), un yeso braquiopalmar por 3 semanas con control radiológico cada 7 a 10 días y luego antebraquiopalmar hasta completar 6 semanas, con el primer control a los 7 días.',
    'Indicación de cirugía: la ficha dice inestable o redesplazada. Orrego y Morán la define con los criterios de LaFontaine (índice sagital mayor de 20°, conminución posterior, escalón articular, fractura de la ulna distal y edad mayor de 60 años; tres o más indican alta probabilidad de inestabilidad) y suma la irreductibilidad y el escalón articular mayor de 2 mm tras la reducción. Opciones: agujas de Kirschner, placa y tornillos o fijador externo.',
    'Orrego y Morán advierte controlar en 24 horas el yeso cerrado por compresión y mover los dedos para evitar el síndrome de dolor regional complejo.']),
 'cx-fractura-pelvis-acetabulo': ('coincide', 'Orrego y Morán, Ortopedia y Traumatología Básica', [
    'Coinciden: conservador (analgesia, reposo y deambulación protegida con bastones) en fracturas estables de baja energía; en las inestables, fijador externo inicial para controlar el shock hemorrágico y osteosíntesis como tratamiento definitivo (placas y tornillos o tornillos percutáneos).',
    'Orrego y Morán agrega que las fracturas de alta energía tienen una mortalidad de 10 a 16 % (45 % si son expuestas), que la TC es el estudio de elección, que la radiografía anteroposterior detecta el 80 % y que se completa con proyecciones inlet, outlet y de Judet; la ecografía FAST busca hemorragia intraperitoneal y la uretrocistografía se reserva a la sospecha de lesión uretral.']),
 'cx-lesiones-rodilla': ('coincide', 'Orrego y Morán, Ortopedia y Traumatología Básica', [
    'Menisco: Orrego y Morán coincide en el manejo conservador de la lesión degenerativa (pacientes de más de 50 años, dolor de larga data, sin bloqueos ni derrame): limitar la actividad, analgésicos y AINE y, si no cede, corticoides intraarticulares con kinesioterapia; advierte evitar la cirugía porque puede empeorar el cuadro. La cirugía queda para pacientes activos con lesiones mecánicas.']),
 'cx-luxacion-cadera': ('difiere', 'Orrego y Morán, Ortopedia y Traumatología Básica', [
    'La ficha dice reducir "lo antes posible". Orrego y Morán precisa reducir de inmediato, antes de las 6 horas, para disminuir la necrosis avascular.',
    'Orrego y Morán: el 95 % son posteriores, con posición "púdica" (aducción, flexión y rotación interna con acortamiento); se asocian a otras lesiones en 40 a 70 % (rodilla, cotilo, pierna) y hay que descartar lesiones del esqueleto axial y comprobar el nervio ciático. Las luxaciones complejas (fractura de cotilo o de cabeza) requieren reducción abierta y osteosíntesis.']),
 'cx-lumbociatica-radiculopatia': ('coincide', 'Orrego y Morán, Ortopedia y Traumatología Básica', [
    'Orrego y Morán coincide en que el 96 % de los síntomas radiculares es por patología discal y que el compromiso de L4, L5 o S1 (niveles L4-L5 y L5-S1) explica el 95 % de la lumbociática.',
    'Cauda equina: ciática intensa, habitualmente bilateral, con anestesia en silla de montar y disfunción esfinteriana; el 60 a 80 % tiene menor tono del esfínter anal y es una emergencia quirúrgica.',
    'Signos de alarma que obligan a estudio y tratamiento urgente: edad menor de 20 o mayor de 50, antecedente de cáncer, pérdida de peso, dolor nocturno o en reposo que no cede con AINE, fiebre, inmunosupresión, trastornos esfinterianos y trauma significativo en los últimos 30 días. Tres o más signos de Waddell cambian el enfoque del manejo.']),
 'cx-tumores-oseos-metastasis': ('coincide', 'Orrego y Morán y QxMedic', [
    'Coinciden en que los tumores óseos más frecuentes son las metástasis (Orrego y Morán: primero pulmón, luego mama, próstata, riñón y tiroides; QxMedic: mama y próstata según el sexo, y afectan sobre todo las vértebras y los extremos proximales de los huesos largos), y en que el tumor primario maligno más frecuente es el osteosarcoma.',
    'Osteosarcoma (QxMedic): segunda década de la vida, metáfisis del fémur distal y de la tibia proximal, signo del sol naciente y triángulo de Codman; tratamiento con resección de márgenes amplios y quimioterapia neoadyuvante y coadyuvante, como indica la ficha.']),
}
def main():
    p = os.path.join(ROOT, 'data/flashcards_cirugia.json')
    raw = open(p, 'rb').read(); j = json.loads(raw.decode('utf8')); por = {x['id']: x for x in j['patologias']}
    for pid, (estado, fuente, puntos) in C.items():
        por[pid]['contraste'] = {'estado': estado, 'fuente': fuente, 'puntos': puntos}
    l2 = raw.decode('utf8').splitlines()[1]; ind = len(l2) - len(l2.lstrip(' '))
    out = json.dumps(j, ensure_ascii=False, indent=ind)
    if b'\r\n' in raw: out = out.replace('\n', '\r\n')
    open(p, 'wb').write(out.encode('utf8')); print('contrastes de traumatología:', len(C))
if __name__ == '__main__': main()
