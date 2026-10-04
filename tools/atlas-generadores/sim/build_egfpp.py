import json, os, datetime as dt, calendar
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
OUT = 'data/acreditaciones/sim/'
J = lambda p: json.load(open(p, encoding='utf8'))
W = lambda p, d: json.dump(d, open(p, 'w', encoding='utf8', newline=''), ensure_ascii=False, indent=1)
MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
def naegele(f):
    d = f.day + 7; m = f.month; y = f.year
    if m >= 4: m -= 3; y += 1
    else: m += 9
    dm = calendar.monthrange(y, m)[1]
    if d > dm: d -= dm; m += 1
    if m > 12: m = 1; y += 1
    return dt.date(y, m, d)
def tx(d): return f'{d.day} de {MES[d.month - 1]} de {d.year}'

def dd(i, t, c, pq, tg, cl, **kw):
    o = dict(id=i, texto=t, critico=bool(c), porque=pq, target=tg, claves=cl); o.update(kw); return o
F1, F2, F3 = 'Datos de la paciente', 'Cálculo', 'Interpretación y registro'
# (n, texto, fase, target, critico, estado, fx, explica, claves, frase, extras)
P = [
 (1, 'Interroga a la paciente sobre la fecha del primer día de su última menstruación (FUM)', F1, 'fum', 1, {'fum': 1}, 'preguntar_fum',
  'La FUM es el primer día del último sangrado menstrual normal. Es el dato base del cálculo: la gestación de feto único dura en promedio 280 días (40 semanas) contados desde ese día.',
  [['fum'], ['ultima menstruacion'], ['ultima regla'], ['primer dia de su ultima'], ['fecha de la ultima']], 'Le pregunto el primer día de su última menstruación (FUM).', {}),
 (2, 'Verifica que la FUM sea confiable: ciclos regulares de 28 días, sin anticonceptivos hormonales recientes ni sangrados dudosos', F1, 'fum', 1, {'ciclos': 1}, 'preguntar_fum',
  'Una FUM es confiable si la mujer la recuerda con certeza, tiene ciclos regulares de 28 días y no usó anticonceptivos hormonales ni lactó en los meses previos. Si no, el cálculo por FUM no es válido y se fecha por ecografía precoz.',
  [['confiable'], ['ciclos regulares'], ['regularidad'], ['seguridad de la fum'], ['duracion del ciclo'], ['ciclos de 28']], 'Verifico que la FUM sea confiable: pregunto por la regularidad de los ciclos y por el uso de anticonceptivos.', {}),
 (2.5, 'Corrige la FUM según la duración del ciclo (ciclo de 35 días: se suman 7 días)', F1, 'fum', 1, {'ciclos': 1, 'corr': 1}, 'calcular',
  'Con ciclos más largos que 28 días la ovulación se retrasa: se suman a la FUM los días que exceden de 28 (en un ciclo de 35 días, 7 días) antes de calcular la EG y la FPP.',
  [['corrijo la fum'], ['suma 7 dias a la fum'], ['sumo 7 dias a la fum'], ['ciclo de 35'], ['fum corregida'], ['ajusto la fum']], 'Corrijo la FUM: como el ciclo es de 35 días, le sumo 7 días a la FUM antes de calcular.', {'solo_si': 'ciclo_largo'}),
 (3, 'Establece la fecha de la consulta (fecha de referencia del cálculo)', F1, 'calendario', 0, {'hoy': 1}, 'calendario',
  'La edad gestacional se calcula hasta la fecha de referencia, que es la fecha de la consulta o de la ecografía.',
  [['fecha de la consulta'], ['fecha de hoy'], ['hoy es'], ['fecha actual'], ['fecha de referencia']], 'Establezco la fecha de hoy como fecha de referencia del cálculo.', {}),
 (4, 'Calcula los días transcurridos desde la FUM hasta la fecha de la consulta', F2, 'calendario', 1, {'dias': 1}, 'calcular',
  'Se cuentan los días completos entre la FUM y hoy: se suman los días que faltan para terminar el mes de la FUM, los meses completos y los días del mes actual.',
  [], 'Calculo los días transcurridos desde la FUM hasta hoy.', {}),
 (5, 'Expresa la edad gestacional en semanas y días (días transcurridos ÷ 7)', F2, 'calculadora', 1, {'eg': 1}, 'calcular',
  'Los días transcurridos se dividen por 7: el cociente son las semanas completas y el resto, los días. Ej.: 115 días = 16 semanas y 3 días.',
  [], 'Expreso la edad gestacional en semanas y días dividiendo los días por 7.', {}),
 (6, 'Calcula la fecha probable de parto (FPP) con la regla de Naegele: FUM + 7 días − 3 meses (+ 1 año)', F2, 'calendario', 1, {'fpp': 1}, 'naegele',
  'Regla de Naegele: a la fecha de la FUM se le suman 7 días y se le restan 3 meses (si el mes es abril o posterior, y se suma un año); si el mes es enero a marzo se suman 9 meses. Da la fecha en que se cumplen las 40 semanas.',
  [], 'Calculo la fecha probable de parto con la regla de Naegele: FUM más 7 días, menos 3 meses.', {}),
 (7, 'Confirma o corrige la edad gestacional con la ecografía del primer trimestre (longitud cráneo-caudal)', F2, 'eco', 1, {'eco': 1}, 'eco_fecha',
  'Si la FUM no es confiable o la ecografía del primer trimestre difiere de la FUM en más de 7 días antes de las 14 semanas, se toma la edad por ecografía (longitud cráneo-caudal). Las ecografías tardías no sirven para fechar.',
  [['ecografia'], ['longitud craneo caudal'], ['lcc'], ['crl'], ['ecografia precoz'], ['ecografia del primer trimestre']], 'Confirmo la edad gestacional con la ecografía del primer trimestre, midiendo la longitud cráneo-caudal.', {'solo_si': 'eco'}),
 (8, 'Clasifica el embarazo según la edad gestacional (pretérmino, de término o postérmino) y el trimestre', F3, 'carnet', 0, {'clas': 1}, 'clasificar',
  'Según la EG: pretérmino (< 37 semanas), de término (37 a 41 semanas y 6 días) y postérmino (≥ 42 semanas). Trimestres: 1.º hasta la semana 13+6, 2.º de la 14 a la 27+6 y 3.º desde la semana 28.',
  [], 'Clasifico el embarazo según su edad gestacional y el trimestre.', {}),
 (9, 'Registra la edad gestacional y la FPP en el carnet perinatal y en la historia clínica', F3, 'carnet', 1, {'reg': 1}, 'registro',
  'La EG, la FPP y el método usado para fecharla (FUM o ecografía) se anotan en el carnet perinatal y en la historia clínica y se informan a la paciente, aclarando que solo una minoría de los partos ocurre exactamente en la FPP.',
  [['registro'], ['carnet perinatal'], ['historia clinica'], ['anoto'], ['dejo constancia']], 'Registro la edad gestacional y la fecha probable de parto en el carnet perinatal y en la historia clínica.', {}),
]
pasos = []
for n, t, fa, tg, cr, es, fx, ex, cl, fr, extra in P:
    p = dict(n=n, texto=t, fase=fa, target=tg, critico=bool(cr), explica=ex, estado=es, claves=cl, frase=fr, fx=fx); p.update(extra); pasos.append(p)

def caso(i, nombre, edad, motivo, ant, fum, hoy, ciclo=28, eco=False, eco_info=None, extra=None):
    fum_d = dt.date.fromisoformat(fum); hoy_d = dt.date.fromisoformat(hoy)
    fum_ef = fum_d
    if ciclo > 28: fum_ef = fum_d + dt.timedelta(days=ciclo - 28)
    if eco: fum_ef = dt.date.fromisoformat(eco_info['fum_eq'])
    dias = (hoy_d - fum_ef).days; s, d = divmod(dias, 7); fpp = naegele(fum_ef)
    clas = 'pretermino' if s < 37 else ('termino' if s < 42 else 'postermino'); tri = '1.º' if s < 14 else ('2.º' if s < 28 else '3.º')
    clas_txt = {'pretermino': 'pretérmino', 'termino': 'de término', 'postermino': 'postérmino'}[clas]
    c = dict(id=i, nombre=nombre, sexo='F', edad=edad, motivo=motivo, indicacion='Cálculo de la edad gestacional y de la fecha probable de parto.', antecedentes=ant, alergia=None, extra=extra or [],
             fum_iso=fum_ef.isoformat(), hoy_iso=hoy, eg=round(dias / 7, 2), eg_sem=s, eg_dias=d, dias_tot=dias, fpp_dia=fpp.day, fpp_mes=MES[fpp.month - 1], fpp_mes_n=fpp.month, clasif_k=clas, ciclo_largo=(ciclo > 28), eco=eco)
    c['h_fum'] = f'La paciente refiere: «Mi última menstruación empezó el {tx(fum_d)}».' if not eco else 'La paciente refiere: «No recuerdo bien la fecha de mi última menstruación».'
    c['h_ciclos'] = ('Ciclos regulares de 28 días, sin anticonceptivos hormonales previos: la FUM es confiable.' if ciclo == 28 and not eco else
                     f'Ciclos regulares de {ciclo} días: la ovulación se retrasa {ciclo - 28} días; hay que corregir la FUM.' if ciclo > 28 else 'Ciclos irregulares y dejó anticonceptivos hace 2 meses: la FUM NO es confiable; hay que fechar con ecografía.')
    c['h_hoy'] = f'La consulta es el {tx(hoy_d)}.'
    c['h_dias'] = f'Correcto: desde la FUM {"corregida " if ciclo > 28 else ""}hasta hoy pasaron {dias} días.'
    c['h_eg'] = f'Correcto: {dias} ÷ 7 = {s} semanas y {d} días ({s}+{d}).'
    c['h_fpp'] = f'Correcto: FUM {tx(fum_ef)} + 7 días − 3 meses → FPP {tx(fpp)}.'
    c['h_eco'] = (f'Ecografía del {tx(dt.date.fromisoformat(eco_info["fecha"]))}: longitud cráneo-caudal {eco_info["lcc"]} mm = {eco_info["eg_eco"]}; la edad gestacional se toma de la ecografía.' if eco else 'La FUM es confiable y no hay ecografía precoz que la contradiga: no se necesita corrección.')
    c['h_clas'] = f'El embarazo es {clas_txt}, del {tri} trimestre ({s}+{d} semanas).'
    c['h_carnet'] = f'Registrado en el carnet: EG {s}+{d} semanas · FPP {tx(fpp)} · método: {"ecografía" if eco else "FUM"}.'
    c['claves_dias'] = [[str(dias), 'dias']]
    return c, fpp
casos = []; fpps = {}
specs = [
 ('c1', 'Camila R.', 24, 'Primer control prenatal.', 'Primigesta. Sin antecedentes. Sin alergias conocidas.', '2026-02-14', '2026-06-09', 28, False, None, ['Ciclos regulares']),
 ('c2', 'Lucía M.', 31, 'Control prenatal.', 'G2P1. Sin patologías. Sin alergias conocidas.', '2026-01-03', '2026-08-15', 28, False, None, ['Cruza dos meses de 31 días']),
 ('c3', 'Gabriela P.', 38, 'Consulta por amenorrea.', 'G3P2. Sin patologías. Sin alergias conocidas.', '2025-12-09', '2026-05-04', 28, False, None, ['FPP en el año siguiente']),
 ('c4', 'Natalia S.', 29, 'Control prenatal.', 'G1P0. Sin alergias conocidas.', '2026-03-28', '2026-10-01', 28, False, None, ['Mes de FUM: marzo']),
 ('c5', 'Romina T.', 27, 'Control prenatal a término.', 'G2P1. Sin alergias conocidas.', '2025-10-12', '2026-07-16', 28, False, None, ['Embarazo de término']),
 ('c6', 'Valeria D.', 36, 'Control: no recuerda bien la FUM.', 'G2P1. Ciclos irregulares. Dejó los anticonceptivos hace 2 meses. Sin alergias conocidas.', '2026-01-20', '2026-06-22', 28, True, dict(fecha='2026-03-26', lcc=32, eg_eco='9 semanas y 0 días', fum_eq='2026-01-20'), ['FUM dudosa · ecografía precoz']),
 ('c7', 'Paula G.', 34, 'Control prenatal; ciclos largos.', 'G1P0. Ciclos de 35 días. Sin alergias conocidas.', '2026-02-08', '2026-08-30', 35, False, None, ['Ciclos de 35 días']),
 ('c8', 'Mónica V.', 40, 'Control a las 42 semanas.', 'G4P3. Sin alergias conocidas.', '2025-09-10', '2026-07-02', 28, False, None, ['Embarazo postérmino']),
]
for i, n, e, m, a, f, h, ci, eco, info, ex in specs:
    c, fpp = caso(i, n, e, m, a, f, h, ci, eco, info, ex); casos.append(c)
# ajuste de la ecografía de c6: LCC 32 mm = 9s0d → FUM equivalente = fecha eco − 63 días
c6 = next(c for c in casos if c['id'] == 'c6')
eq = dt.date.fromisoformat('2026-03-26') - dt.timedelta(days=63)
casos.remove(c6); c6n, _ = caso('c6', 'Valeria D.', 36, 'Control: no recuerda bien la FUM.', 'G2P1. Ciclos irregulares. Dejó los anticonceptivos hace 2 meses. Sin alergias conocidas.', '2026-01-20', '2026-06-22', 28, True, dict(fecha='2026-03-26', lcc=32, eg_eco='9 semanas y 0 días', fum_eq=eq.isoformat()), ['FUM dudosa · ecografía precoz'])
casos.insert(5, c6n)
# claves por caso para los pasos con resultado numérico
for c in casos:
    s, d, dias = c['eg_sem'], c['eg_dias'], c['dias_tot']; fd, fm, fmn = c['fpp_dia'], c['fpp_mes'], c['fpp_mes_n']
    c4 = [[str(dias), 'dias']]
    c5 = [[f'{s} semanas', f'{d} dia']] if d else [[f'{s} semanas']]
    c5 += [[f'{s} {d}']] if d else []
    c6 = [[f'{fd} de {fm}'], [f'{fd} {fmn}']]
    cl_clas = {'pretermino': [['pretermino']], 'termino': [['de termino'], ['a termino']], 'postermino': [['postermino']]}[c['clasif_k']]
    c['claves_caso'] = {'4': c4, '5': c5, '6': c6, '8': cl_clas}
for p in pasos:
    if p['n'] in (4, 5, 6, 8): p['_cc'] = True
# la información por caso se aplica con claves_caso (motor: o.claves_caso[caso.id]); se reordena a nivel de paso
for p in pasos:
    if p.get('_cc'):
        p['claves_caso'] = {c['id']: c['claves_caso'][str(p['n'])] for c in casos}; del p['_cc']
for c in casos: del c['claves_caso']

# cada frase modelo lleva los valores del caso → se arman por caso en 'frases_caso'
for p in pasos:
    n = p['n']
    if n == 4: p['frases_caso'] = {c['id']: f'Calculo los días transcurridos desde la FUM hasta hoy: {c["dias_tot"]} días.' for c in casos}
    if n == 5: p['frases_caso'] = {c['id']: f'Expreso la edad gestacional en semanas y días: {c["eg_sem"]} semanas y {c["eg_dias"]} días.' for c in casos}
    if n == 6: p['frases_caso'] = {c['id']: f'Calculo la FPP con la regla de Naegele: FUM más 7 días, menos 3 meses; la fecha probable de parto es el {c["fpp_dia"]} de {c["fpp_mes"]}.' for c in casos}
    if n == 8: p['frases_caso'] = {c['id']: f'Clasifico el embarazo como {({"pretermino": "pretérmino", "termino": "de término", "postermino": "postérmino"})[c["clasif_k"]]} y lo ubico en el trimestre que corresponde.' for c in casos}

distractores = [
 dd('d1', 'Informa una edad gestacional incorrecta (semanas o días mal calculados)', 1, 'Es criterio de desaprobación: un error en la edad gestacional lleva a decisiones equivocadas sobre prematurez y posmadurez.', 'calculadora', [], num=dict(re=r'(\d+) semanas?(?: y (\d+) dias?)?', campos=['eg_sem', 'eg_dias'], requiere=['edad gestacional', ' eg ', 'cursa', 'gestacion de', 'semanas y'])),
 dd('d2', 'Informa una fecha probable de parto incorrecta', 1, 'Es criterio de desaprobación: aplicar mal la regla de Naegele da una fecha equivocada.', 'calendario', [], num=dict(re=r'(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)', campos=['fpp_dia', 'fpp_mes'], requiere=['fpp', 'fecha probable', 'parto', 'naegele'])),
 dd('d3', 'Clasifica mal el embarazo (pretérmino, de término o postérmino)', 1, 'Es criterio de desaprobación: pretérmino es menor de 37 semanas; de término de 37 a 41+6; postérmino desde la semana 42.', 'carnet', [], num=dict(re=r'(pretermino|postermino|termino)', campos=['clasif_k'], requiere=['clasific', 'embarazo es', 'embarazo de'])),
 dd('d4', 'Usa una ecografía del tercer trimestre para fechar la gestación', 1, 'Es criterio de desaprobación: las ecografías tardías tienen un error muy grande; solo la del primer trimestre sirve para fechar.', 'eco', [['ecografia del tercer trimestre'], ['ecografia tardia'], ['ecografia de las 34'], ['ecografia del ultimo trimestre'], ['fecho con la ecografia de las']]),
 dd('d5', 'Toma una FUM dudosa como confiable sin verificarla', 1, 'Es criterio de desaprobación: si la FUM no es segura o los ciclos son irregulares, la edad se establece por ecografía precoz.', 'fum', [['sin verificar la fum'], ['tomo la fum igual'], ['aunque no recuerda'], ['aunque no este segura'], ['sin confirmar la fum']]),
 dd('d6', 'Informa la FPP como una fecha exacta e inmodificable', 0, 'Solo una minoría de los partos ocurre en la FPP: se la informa como una fecha aproximada; el término abarca de la semana 37 a la 41+6.', 'carnet', [['fecha exacta'], ['exactamente ese dia'], ['seguro nace ese dia'], ['nacera ese dia']]),
 dd('d7', 'Cuenta los días a partir de la fecha de concepción o de la última relación sexual', 1, 'Es criterio de desaprobación: la edad gestacional se cuenta desde el primer día de la última menstruación, no desde la concepción.', 'fum', [['desde la concepcion'], ['desde la ovulacion'], ['desde la ultima relacion'], ['desde el coito']]),
 dd('d8', 'No registra la EG y la FPP en el carnet perinatal', 1, 'Es criterio de desaprobación: son datos clave de todos los controles posteriores.', 'carnet', [['no registro'], ['sin registrar'], ['no anoto'], ['sin anotar']]),
]
QS = [
 ('¿Desde qué momento se cuenta la edad gestacional?', ['Desde el primer día de la última menstruación', 'Desde la fecha de concepción', 'Desde la ovulación', 'Desde el primer control prenatal'], 0, 'La edad gestacional se cuenta desde la FUM (aunque la concepción ocurra unos 14 días después).'),
 ('¿Cuántos días dura en promedio un embarazo de feto único contados desde la FUM?', ['280 días (40 semanas)', '266 días (38 semanas)', '300 días', '250 días'], 0, '40 semanas = 280 días desde la FUM, o 266 días desde la concepción.'),
 ('¿Cómo se aplica la regla de Naegele con una FUM en mayo?', ['Se suman 7 días y se restan 3 meses, sumando un año', 'Se suman 9 meses', 'Se restan 7 días y se suman 3 meses', 'Se suman 3 meses y 7 días'], 0, 'Para FUM de abril a diciembre: +7 días, −3 meses y +1 año; de enero a marzo: +7 días y +9 meses.'),
 ('Una paciente cursa 115 días desde su FUM. ¿Cuál es su edad gestacional?', ['16 semanas y 3 días', '15 semanas y 2 días', '17 semanas', '16 semanas exactas'], 0, '115 ÷ 7 = 16, resto 3.'),
 ('¿Qué se hace con una FUM dudosa?', ['Se fecha con la ecografía del primer trimestre (LCC)', 'Se usa igual', 'Se usa la altura uterina', 'Se descarta el embarazo'], 0, 'La ecografía precoz (LCC) es el mejor método de datación cuando la FUM no es confiable.'),
 ('En una mujer con ciclos regulares de 35 días, ¿qué corrección se aplica a la FUM?', ['Se le suman 7 días', 'Se le restan 7 días', 'No se corrige', 'Se le suman 14 días'], 0, 'La ovulación se retrasa tantos días como excede el ciclo de 28.'),
 ('¿Desde qué edad gestacional un embarazo es de término?', ['37 semanas', '34 semanas', '40 semanas', '42 semanas'], 0, 'De término: 37 a 41+6 semanas; pretérmino: menos de 37; postérmino: 42 o más.'),
 ('¿Qué trimestre cursa una gestante de 29 semanas?', ['El tercer trimestre (desde la semana 28)', 'El segundo trimestre', 'El primer trimestre', 'Ya terminó el embarazo'], 0, '1.º hasta la 13+6; 2.º de la 14 a la 27+6; 3.º desde la 28.'),
 ('¿Qué ecografía tiene mayor precisión para datar el embarazo?', ['La del primer trimestre (hasta la semana 13+6)', 'La del tercer trimestre', 'La del segundo trimestre', 'Todas son iguales'], 0, 'Su error es de ± 5 a 7 días; el error crece a medida que avanza la gestación.'),
 ('¿Por qué es importante calcular bien la EG?', ['Para evitar partos prematuros iatrogénicos y reducir la morbimortalidad neonatal', 'Solo por trámite', 'Para elegir el sexo del bebé', 'No es importante'], 0, 'Un error de cálculo puede llevar a inducir un parto antes de término o a no detectar un postérmino.'),
]
fund = [dict(q=q, o=o, c=c, e=e) for q, o, c, e in QS]
machete = {'perlas': [
 {'t': 'FUM confiable', 'x': 'Primer día de la última menstruación normal, ciclos regulares de 28 días y sin anticonceptivos hormonales recientes. Si no: ecografía del primer trimestre.'},
 {'t': 'EG', 'x': 'Días transcurridos desde la FUM hasta hoy ÷ 7 = semanas completas + días (resto).'},
 {'t': 'Naegele', 'x': 'FUM + 7 días − 3 meses (+ 1 año) si el mes es abril a diciembre; FUM + 7 días + 9 meses si es enero a marzo.'},
 {'t': 'Ciclos de otra duración', 'x': 'Ciclo de 35 días: sumar 7 días a la FUM. Ciclo de 21 días: restar 7.'},
 {'t': 'Clasificación', 'x': 'Pretérmino < 37; de término 37 a 41+6; postérmino ≥ 42. 1.º trimestre hasta 13+6; 2.º hasta 27+6; 3.º desde 28.'}], 'por_paso': {'2.5': 'Ciclo de 35 días: suma 7 días a la FUM.', '5': 'Días ÷ 7: cociente = semanas, resto = días.', '6': 'FUM + 7 días − 3 meses (+1 año).'}}
CRIT = dict(criterios_texto='La guía no define criterios de desaprobación automática; el simulador califica la obtención y verificación de la FUM, el cálculo de la edad gestacional en semanas y días, la FPP por la regla de Naegele, la datación por ecografía cuando la FUM no es confiable y el registro (propuesto, a validar).',
  criterios=[dict(ico='📅', titulo='FUM obtenida y verificada', pasos=[1, 2, '2 bis']), dict(ico='🧮', titulo='Edad gestacional en semanas y días', pasos=[4, 5]), dict(ico='👶', titulo='Fecha probable de parto (regla de Naegele)', pasos=[6]), dict(ico='🔊', titulo='Datación por ecografía si la FUM es dudosa', pasos=[7]), dict(ico='📒', titulo='Registro de la EG y la FPP', pasos=[9])],
  final_criticos='la FUM, el cálculo de la edad gestacional, la fecha probable de parto y su registro')
ALG = dict(titulo='Cómo calcular la EG y la FPP', boton_titulo='Ver el cálculo paso a paso', boton_sub='Regla de Naegele y edad gestacional', aviso='el cálculo paso a paso', flecha='▼ ¿Es confiable la FUM?', flecha_final='▼ Interpretación', pie='EG = (hoy − FUM) ÷ 7. FPP = FUM + 7 días − 3 meses (+1 año).',
 comun=[dict(t='FUM', x='Primer día de la última menstruación.', flag='fum'), dict(t='Fecha de la consulta', x='Fecha de referencia del cálculo.', flag='hoy')],
 columnas=[dict(titulo='FUM confiable', cls='nd', nodos=[dict(t='Días transcurridos', x='Desde la FUM hasta hoy.', flag='dias'), dict(t='Edad gestacional', x='Días ÷ 7 = semanas + días.', flag='eg'), dict(t='FPP', x='Regla de Naegele.', flag='fpp')]),
  dict(titulo='FUM dudosa o ciclos distintos', cls='fv', nodos=[dict(t='Ciclos de 35 días', x='Sumar 7 días a la FUM.', flag='corr'), dict(t='Ecografía del primer trimestre', x='LCC: se toma la edad ecográfica.', flag='eco')])],
 final=[dict(t='Clasificación', x='Pretérmino, de término o postérmino; trimestre.', flag='clas'), dict(t='Registro', x='Carnet perinatal e historia clínica.', flag='reg')])
EL = {'fum': ('FUM', 'Primer día de la última menstruación.'), 'calendario': ('Calendario', 'Para contar los días y aplicar la regla de Naegele.'), 'calculadora': ('Calculadora / cuadernillo', 'Para dividir los días por 7.'), 'eco': ('Ecografía del primer trimestre', 'Longitud cráneo-caudal para fechar el embarazo.'), 'carnet': ('Carnet perinatal', 'Se registran la EG y la FPP.')}
EX = dict(id='egfpp', area='sim', titulo='Cálculo de EG y FPP', icono='📅',
 resumen='Resolución de casos clínicos: obtención y verificación de la FUM, cálculo de la edad gestacional en semanas y días, fecha probable de parto con la regla de Naegele, datación por ecografía y clasificación del embarazo.',
 umbral=60, fuente='Guía de TP N.º 1: Cálculo de EG y FPP', elementos={k: dict(nombre=v[0], desc=v[1], pasos=[p['n'] for p in pasos if p['target'] == k]) for k, v in EL.items()},
 distractores=distractores, casos=casos, fundamentos=fund, voz=True, algoritmo=ALG,
 hallazgo_pasos={'1': 'h_fum', '2': 'h_ciclos', '3': 'h_hoy', '4': 'h_dias', '5': 'h_eg', '6': 'h_fpp', '7': 'h_eco', '8': 'h_clas', '9': 'h_carnet'}, hallazgo_rotulos={'1': '🗣', '2': '🩺', '3': '📅', '4': '🧮', '5': '🧮', '6': '👶', '7': '🔊', '8': '🏷️', '9': '📒'}, hallazgo_voz={'1': 'f'},
 machete=machete, examen=dict(tiempos=[5, 10, 15, 30], penalizacion_incorrecta=3, penalizacion_repetida=1),
 visor='data/acreditaciones/sim/egfpp_modelo.json', peso_modelo='2 a 3 MB', instrumental='data/acreditaciones/sim/instrumental_egfpp.json', mesa_pasos=[], pasos=pasos)
EX.update(CRIT)
W(OUT + 'egfpp.json', EX)
def it(id, grupo, nombre, detalle, correcto, critico, desc, ficha, **kw):
    o = dict(id=id, grupo=grupo, nombre=nombre, detalle=detalle, img=f'assets/instrumental/{id}.svg', correcto=correcto, critico=critico, descripcion=desc, ficha=ficha); o.update(kw); return o
items = [
 it('gestograma', 'calculo', 'Gestograma (disco)', 'Rueda de edad gestacional', True, True, 'Disco giratorio para ubicar la FUM y leer la EG y la FPP.', [['Uso', 'EG y FPP']], falta='Falta el gestograma para controlar el cálculo.'),
 it('calendario', 'calculo', 'Calendario', 'Del año en curso', True, True, 'Para contar los días y los meses desde la FUM.', [['Uso', 'Contar días']], falta='Falta el calendario para contar los días.'),
 it('boligrafo_cuad', 'calculo', 'Bolígrafo y cuadernillo', 'Para anotar', True, False, 'Para hacer el cálculo por escrito.', [['Uso', 'Cálculo']]),
 it('calculadora', 'calculo', 'Calculadora', 'Básica', True, False, 'Para dividir los días por 7.', [['Uso', 'Operaciones']], opcional=True),
 it('carnet_perinatal', 'registro', 'Carnet perinatal', 'Control prenatal', True, True, 'Donde se registra la EG, la FPP y el método de datación.', [['Documento', 'Carnet perinatal']], falta='Falta el carnet perinatal para registrar la EG y la FPP.'),
 it('especulo', 'otros', 'Espéculo vaginal', 'Descartable', False, False, 'Examen ginecológico.', [['Uso', 'Examen']], feedback='No se necesita para el cálculo de la EG.'),
 it('balanza_pie', 'otros', 'Balanza de pie', 'Peso materno', False, False, 'Peso.', [['Uso', 'Peso']], feedback='El peso no interviene en el cálculo de la EG y la FPP.'),
]
INS = dict(id='egfpp', titulo='Consultorio · Cálculo de EG y FPP', consigna='Reuní lo que hace falta para calcular y registrar la edad gestacional y la fecha probable de parto. Pasá el cursor (o tocá) cada insumo para inspeccionarlo; arrastralo a la bandeja o hacé clic para agregarlo.',
 caso_sub='cálculo de edad gestacional y fecha probable de parto', indicacion_def='Cálculo de EG y FPP.', mision=['qué elementos ayudan a calcular y registrar;', 'qué insumos no corresponden.'], demo_caso='Primero se lee el caso: los datos de la FUM y de la consulta son la base del cálculo.',
 grupos=[dict(id='calculo', titulo='Cálculo'), dict(id='registro', titulo='Registro'), dict(id='otros', titulo='Otros insumos')], items=items, bandeja_img='assets/instrumental/bandeja.svg')
W(OUT + 'instrumental_egfpp.json', INS)
M = J('data/acreditaciones/siam/sv_modelo.json')
glb = lambda id, carpeta, f, capa, color, op, hs, nom, peso, **kw: dict(id=id, tipo='glb', src=f'assets/anatomia/{carpeta}/{f}.glb', escala=100, rot=[0, 0, 0], pos=[0, 0, 0], capa=capa, color=color, opacidad=op, hs=hs, nombre=nom, peso=peso, **kw)
piezas = [glb('piel', 'sim', 'torso_f', 'piel', '#e8b89c', 0.46, None, 'Paciente', 1255052, piel_real=True), glb('pelvis', 'hra', 'pelvis_f', 'huesos', '#e8e1cf', 0.5, None, 'Pelvis ósea', 120000)]
VAR = dict(origen=[0, 19, 6], corte_x=0.0, rotacion=[0, 0, 0], piezas=piezas, procedurales={}, pines=dict(fondo=[0, 30, 12], ombligo=[0, 19, 9.6]),
  camara=dict(lat=[80, 8, 0], fro=[0, 8, 74], sup=[0.01, 84, 0], objetivo=[0, 0, 0], ini=[14, 4, 42]), etiquetas=dict(fondo=[110, -50], ombligo=[110, 30]))
G = dict(M['general']); G['camara'] = dict(M['general']['camara'], foco=40, min=16, max=160)
filas = [('FUM', 'fum', 'h_fum'), ('Ciclos', 'ciclos', 'h_ciclos'), ('Fecha de la consulta', 'hoy', 'h_hoy'), ('Días transcurridos', 'dias', 'h_dias'), ('Edad gestacional', 'eg', 'h_eg'), ('FPP', 'fpp', 'h_fpp'), ('Ecografía', 'eco', 'h_eco'), ('Clasificación', 'clas', 'h_clas'), ('Registro', 'reg', 'h_carnet')]
IM = dict(general=G, overlay_html='', tarjetas=dict(mesa=dict(titulo='🧮 Para calcular', id='mesa', items=[['calendario', '📅', 'Calendario', ''], ['calculadora', '🧮', 'Calculadora', ''], ['eco', '🔊', 'Ecografía', 'del 1.er trimestre']]), entorno=dict(titulo='📒 Registro', items=[['fum', '🩸', 'FUM', ''], ['carnet', '📒', 'Carnet', 'perinatal']])),
  chips=[['fum', 'FUM'], ['dias', 'Días'], ['eg', 'EG'], ['fpp', 'FPP'], ['reg', 'Registrado']], usables=['calendario', 'calculadora', 'eco', 'fum', 'carnet'], pines=[dict(id='fondo', label='Fondo uterino', capa='piel', externo=True), dict(id='ombligo', label='Ombligo', capa='piel', externo=True)],
  instrumentos=[dict(id='gravida', tipo='gravida'), dict(id='gesto', tipo='gesto'), dict(id='hc', tipo='hc', filas=[dict(t=a, f=b, c=c) for a, b, c in filas])], M=VAR, F=VAR)
W(OUT + 'egfpp_modelo.json', IM)
print('ok egfpp', len(pasos), len(casos))
for c in casos: print(c['id'], c['fum_iso'], c['hoy_iso'], c['dias_tot'], f"{c['eg_sem']}+{c['eg_dias']}", c['fpp_dia'], c['fpp_mes'], c['clasif_k'])
