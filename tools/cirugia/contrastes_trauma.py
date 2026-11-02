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
