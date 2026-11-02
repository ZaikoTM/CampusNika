# -*- coding: utf-8 -*-
"""Fichas de fármacos de Cirugía redactadas desde Goodman & Gilman, Las bases farmacológicas de la terapéutica, 14.ª ed. (McGraw Hill, 2023).
Solo se incluye lo leído en el libro (mecanismo, dosis de las tablas del capítulo, efectos adversos). Agrega las fichas a data/flashcards_farmacos.json
(unidad fx6) y farmacos_cx.py las enlaza con las fichas de Cirugía que las mencionan. Idempotente. Uso: python -I tools/cirugia/farmacos_goodman.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UNIDAD = 'Fármacos en Cirugía y Urología'
FUENTE = lambda cap, tit: {'tipo': 'libro', 'guia': 'Goodman & Gilman, Las bases farmacológicas de la terapéutica, 14.ª ed., cap. %s: %s' % (cap, tit),
                           'sociedad': 'L. L. Brunton y colaboradores, McGraw Hill', 'anio': '2023',
                           'nota': 'Texto de farmacología de referencia de la carpeta de Medicina. Las dosis son las que figuran en las tablas del libro; ajustar según el prospecto y el criterio clínico.'}
P = lambda e, t: {'etiqueta': e, 'texto': t}

def ficha(id, titulo, alias, definicion, cap, tit, indicaciones, mecanismo, dosis, contra, efectos, tiempos, prec):
    return {'id': id, 'titulo': titulo, 'alias': alias, 'up': ['fx6'], 'fuente': FUENTE(cap, tit), 'indicaciones': indicaciones, 'mecanismo': mecanismo,
            'dosis': dosis, 'contraindicaciones': contra, 'efectos': efectos, 'tiempos': tiempos, 'precauciones': prec,
            'area': 'farmacos', 'tipo': 'farmaco', 'estado': 'guia', 'definicion': definicion, 'unidad': UNIDAD}

FICHAS = [
 ficha('fx-ibp-omeprazol', 'Inhibidores de la bomba de protones (omeprazol)', ['omeprazol', 'esomeprazol', 'pantoprazol', 'lansoprazol', 'ibp', 'inhibidor de la bomba de protones', 'gastroproteccion'],
  'Inhibidor de la bomba de protones · supresión del ácido gástrico', 53, 'Farmacología del tubo digestivo',
  ['Enfermedad por reflujo gastroesofágico y enfermedad ulcerosa péptica; en Cirugía, úlcera péptica complicada, hemorragia digestiva alta y gastroprotección.'],
  ['Hay seis IBP: omeprazol, esomeprazol, lansoprazol, dexlansoprazol, rabeprazol y pantoprazol, con eficacia equivalente a dosis comparables. Son profármacos que se activan en el medio ácido de los canalículos de la célula parietal a una sulfenamida que se une de forma covalente a los grupos sulfhidrilo de la H+,K+-ATPasa y la inactiva de modo irreversible. La secreción ácida se suprime 24 a 48 h aunque la vida media plasmática sea de 0,5 a 3 h, y se suprime tanto la secreción basal como la estimulada.'],
  [{'titulo': 'Administración (Goodman)', 'pasos': [
     P('Pauta', 'Una dosis diaria antes de la primera comida del día (idealmente 30 minutos antes); si hace falta una segunda dosis, antes de la cena.'),
     P('Inicio del efecto', 'Se necesitan 2 a 5 días de una dosis diaria para inhibir cerca del 70 % de las bombas; dosificar cada 12 h acorta el tiempo pero no mejora el resultado.'),
     P('Vía parenteral', 'Esomeprazol sódico, omeprazol sódico o pantoprazol, cuando no se dispone de la vía oral.')]}],
  ['No figuran contraindicaciones absolutas en el capítulo; se recomienda limitar el uso a las dosis efectivas más bajas y solo con indicación clínica.'],
  ['Hipergastrinemia con hiperplasia de células ECL, poliposis de glándulas fúndicas y gastritis atrófica; hipersecreción de ácido de rebote al suspender, con dispepsia.',
   'Con uso crónico: menor absorción de vitamina B12, hipomagnesemia, mayor riesgo de fractura ósea y de infecciones (neumonía nosocomial, Clostridioides difficile, peritonitis bacteriana espontánea en ascitis); asociaciones con proliferación bacteriana del intestino delgado, enfermedad renal crónica y demencia aún no confirmadas.'],
  ['t1/2 plasmática de 0,5 a 3 h; metabolismo hepático por CYP2C19 y CYP3A4.'],
  ['Pueden reducir la activación de clopidogrel (CYP2C19), controvertido; es menos probable con pantoprazol. Elevan el metotrexato. Disminuyen la absorción de ketoconazol, ésteres de ampicilina y sales de hierro. Reducir la dosis crónica en quienes tienen genotipo CYP2C19 de función disminuida.']),
 ficha('fx-ketorolaco', 'Ketorolaco', ['ketorolac', 'aine', 'analgesico posoperatorio', 'antiinflamatorio no esteroideo'],
  'AINE · analgésico potente y antiinflamatorio débil', 42, 'Farmacoterapia de la inflamación, fiebre, dolor y gota',
  ['Dolor agudo, como el posoperatorio, por vía parenteral.'],
  ['Los AINE disminuyen la formación de prostaglandinas al inhibir la ciclooxigenasa. El ketorolaco es un analgésico potente y un antiinflamatorio débil.'],
  [{'titulo': 'Dosis parenteral (Goodman)', 'pasos': [P('Esquema', '60 mg por vía intramuscular y luego 30 mg cada 6 horas, o 30 mg por vía intravenosa cada 6 horas; ver el producto autorizado por la FDA.')]}],
  ['Ver los efectos adversos compartidos de los AINE (gastrointestinales, renales, cardiovasculares, plaquetarios y de hipersensibilidad), que definen las situaciones de riesgo.'],
  ['Efectos compartidos de los AINE: dolor abdominal, hemorragia, úlcera y perforación gastrointestinal; inhibición plaquetaria y mayor riesgo de sangrado; insuficiencia renal, nefritis intersticial, retención de sal y agua, hipertensión e hiperpotasemia; edema, insuficiencia cardiaca, infarto de miocardio y accidente cerebrovascular; reacciones anafilactoides y broncoespasmo.'],
  ['Pico plasmático a los 30 a 60 min; unión a proteínas del 99 %; metabolito glucurónido (90 %); t1/2 de 4 a 6 h.'],
  ['En quienes tienen enfermedad renal, cardiaca o cirrosis el AINE puede deteriorar la función renal y reducir el efecto de los antihipertensivos y diuréticos.']),
 ficha('fx-ibuprofeno', 'Ibuprofeno', ['aine', 'antiinflamatorio no esteroideo', 'derivado del acido propionico'],
  'AINE · derivado del ácido propiónico', 42, 'Farmacoterapia de la inflamación, fiebre, dolor y gota',
  ['Dolor, fiebre e inflamación.'],
  ['Inhibe la ciclooxigenasa y disminuye la formación de prostaglandinas. Es un racemato: el 60 % del enantiómero R se convierte en S-ibuprofeno.'],
  [{'titulo': 'Dosis (Goodman)', 'pasos': [P('Adultos', '200 a 800 mg, 3 a 6 veces al día junto con los alimentos (máximo 3,2 g/día).'), P('Niños', '4 a 10 mg/kg por dosis, 3 a 4 veces al día (máximo pediátrico 2,4 g/día).')]}],
  ['Ver los efectos adversos compartidos de los AINE.'],
  ['Efectos digestivos, renales, cardiovasculares y plaquetarios compartidos por los AINE; el 10 a 15 % suspende el tratamiento; puede aumentar el riesgo de meningitis aséptica.'],
  ['Pico plasmático a las 2 h (comprimidos); unión a proteínas del 99 %; metabolismo por CYP2C9; t1/2 de 2 a 4 h en adultos; se excreta en la leche materna.'],
  ['Tomar con alimentos.']),
 ficha('fx-paracetamol', 'Paracetamol', ['acetaminofeno', 'analgesico', 'antipiretico', 'analgesia multimodal'],
  'Analgésico y antipirético · derivado del paraaminofenol', 42, 'Farmacoterapia de la inflamación, fiebre, dolor y gota',
  ['Dolor y fiebre; componente de la analgesia multimodal.'],
  ['Inhibidor débil e inespecífico de la ciclooxigenasa a las dosis habituales, cuya potencia puede modularse por la peroxidasa. Tiene efectos antiinflamatorios, gastrointestinales y plaquetarios menores que el ácido acetilsalicílico.'],
  [{'titulo': 'Dosis (Goodman)', 'pasos': [P('Adultos', '650 mg o menos cada 4 horas, con un máximo de 4000 mg en 24 horas; en el capítulo de opioides se sugiere no pasar de 3 g/día en adultos cuando se combina con ellos.')]}],
  ['El capítulo no detalla contraindicaciones específicas; el riesgo principal es la sobredosis.'],
  ['La sobredosis produce un metabolito tóxico (NAPQI) que causa necrosis hepática.'],
  ['Pico plasmático a los 30 a 60 min; unión a proteínas del 20 a 50 %; metabolitos glucurónidos (60 %) y sulfatos (35 %); t1/2 de 2 h.'],
  ['Revisar el total diario cuando se asocia con opioides u otros preparados que lo contengan.']),
 ficha('fx-morfina', 'Morfina y opioides', ['opioide', 'analgesico opioide', 'fentanilo', 'dolor agudo', 'analgesia posoperatoria'],
  'Agonista de los receptores opioides · analgésico', 23, 'Analgésicos opioides',
  ['Dolor agudo intenso, como el posoperatorio y el del paciente quirúrgico o traumatizado.'],
  ['Actúan sobre receptores opioides acoplados a proteína G (clase A). En el tubo digestivo la morfina inhibe la relajación del esfínter esofágico inferior, aumenta la contracción tónica del antro y del duodeno proximal y reduce el tono del reservorio gástrico, lo que prolonga el vaciamiento.'],
  [{'titulo': 'Dosis de inicio orientativas (Goodman)', 'pasos': [
     P('Adultos de más de 50 kg', 'Morfina 30 mg por vía oral o 10 mg por vía parenteral, cada 3 a 4 horas.'),
     P('Niños y adultos de menos de 50 kg', 'Morfina 0,3 mg/kg por vía oral o 0,1 mg/kg por vía parenteral, cada 3 a 4 horas.'),
     P('Aclaración', 'Los datos son orientativos: la respuesta clínica, la función hepática y renal, la edad y los medicamentos concurrentes guían la dosis.')]}],
  ['El fentanilo transdérmico está contraindicado en el dolor agudo y en quienes reciben menos de 60 mg de equivalentes de morfina oral por día.'],
  ['Estreñimiento (puede revertirse con antagonistas de acción periférica como la metilnaltrexona); depresión respiratoria; con fentanilo y análogos en dosis altas, rigidez del tórax ("tórax en madera") que puede tratarse con relajantes neuromusculares mientras se ventila al paciente.'],
  ['El fentanilo tiene inicio más rápido y menor duración que la morfina; la depresión respiratoria puede prolongarse con dosis grandes o con infusiones prolongadas.'],
  ['Si no puede usarse la vía oral, la morfina, la hidromorfona y la oximorfona pueden darse por vía rectal, con dosis equianalgésicas que pueden diferir de las orales y parenterales.']),
 ficha('fx-heparina', 'Heparina y heparinas de bajo peso molecular', ['heparina no fraccionada', 'enoxaparina', 'hbpm', 'lmwh', 'anticoagulante', 'tromboprofilaxis', 'protamina', 'trombocitopenia inducida por heparina'],
  'Anticoagulante parenteral · activador de la antitrombina', 36, 'Coagulación sanguínea y fármacos anticoagulantes, fibrinolíticos y antiagregantes plaquetarios',
  ['Profilaxis y tratamiento de la trombosis venosa y la tromboembolia; en Cirugía, tromboprofilaxis perioperatoria.'],
  ['La heparina y sus derivados son anticoagulantes parenterales que activan la antitrombina, un inhibidor natural de las proteasas de la coagulación.'],
  [{'titulo': 'Reversión (Goodman)', 'pasos': [
     P('Protamina', 'Se une a la heparina y neutraliza su efecto; la dosis aproximada es 1 mg de protamina por cada 100 unidades de heparina que persistan, hasta un máximo de 50 mg, por vía intravenosa lenta en 10 minutos.'),
     P('Heparinas de bajo peso molecular', 'La protamina solo revierte de manera parcial su actividad y no tiene efecto sobre el fondaparinux.')]}],
  ['La warfarina no debe usarse en la trombocitopenia inducida por heparina hasta que se normalice el recuento de plaquetas, porque puede desencadenar gangrena venosa o necrosis cutánea.'],
  ['Trombocitopenia inducida por heparina: cerca del 0,5 % de los pacientes tratados la presentan a los 5 a 10 días de iniciar; se debe a anticuerpos IgG contra complejos de heparina y factor plaquetario 4; es más frecuente en pacientes quirúrgicos que en médicos y puede causar trombosis graves; hay que suspender la heparina de inmediato. También se observa con las HBPM y, rara vez, con fondaparinux.',
   'Alteración de las pruebas hepáticas, osteoporosis con dosis terapéuticas prolongadas (más de 20.000 unidades/día durante 3 a 6 meses; menor riesgo con HBPM) e hiperpotasemia por inhibición de la aldosterona.',
   'La protamina puede causar hipotensión, edema pulmonar no cardiogénico y vasoconstricción pulmonar si se administra rápido.'],
  ['Controlar el recuento de plaquetas durante el tratamiento.'],
  ['Las HBPM tienen menor riesgo de osteoporosis y de trombocitopenia que la heparina no fraccionada.']),
]

def main():
    p = os.path.join(ROOT, 'data/flashcards_farmacos.json')
    raw = open(p, 'rb').read(); j = json.loads(raw.decode('utf8')); por = {x['id']: i for i, x in enumerate(j['patologias'])}
    n = 0
    for f in FICHAS:
        if f['id'] in por: j['patologias'][por[f['id']]] = f
        else: j['patologias'].append(f); n += 1
    j['meta']['unidades']['fx6'] = UNIDAD
    l2 = raw.decode('utf8').splitlines()[1]; ind = len(l2) - len(l2.lstrip(' '))
    out = json.dumps(j, ensure_ascii=False, indent=ind)
    if b'\r\n' in raw: out = out.replace('\n', '\r\n')
    open(p, 'wb').write(out.encode('utf8')); print('fichas de fármacos desde Goodman:', len(FICHAS), '| nuevas:', n)

if __name__ == '__main__':
    main()
