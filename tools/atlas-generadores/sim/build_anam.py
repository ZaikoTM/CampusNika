import json, os
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
OUT = 'data/acreditaciones/sim/'
J = lambda p: json.load(open(p, encoding='utf8'))
W = lambda p, d: json.dump(d, open(p, 'w', encoding='utf8', newline=''), ensure_ascii=False, indent=1)

def dd(i, t, c, pq, tg, cl, **kw):
    o = dict(id=i, texto=t, critico=bool(c), porque=pq, target=tg, claves=cl); o.update(kw); return o

# ======================================================================================  ANAMNESIS GINECOLÓGICA
FA, FB, FC, FD, FE, FF = 'Recepción', 'Motivo y enfermedad actual', 'Interrogatorio dirigido', 'Antecedentes gineco-obstétricos', 'Otros antecedentes', 'Cierre'
G = [
 (1, 'Se presenta, saluda a la paciente y acompañante', FA, 'paciente', 0, {'pres': 1}, 'hablar', 'Presentarse con nombre y rol y saludar también al acompañante abre la relación médico-paciente con respeto y confianza.',
  [['me presento'], ['soy la doctora'], ['soy el doctor'], ['buen dia'], ['buenas tardes'], ['mucho gusto']], 'Buenas tardes, soy la doctora, me presento con mi nombre y apellido. Saludo a la paciente y a su acompañante.'),
 (2, 'Invita a tomar asiento', FA, 'consultorio', 0, {'asiento': 1}, 'sentar', 'Invitar a sentarse, a la misma altura y sin barreras, favorece un ambiente de confianza para hablar de temas íntimos.',
  [['tome asiento'], ['tomar asiento'], ['siente'], ['sientese'], ['invito a sentarse'], ['pase y']], 'La invito a tomar asiento, por favor.'),
 (3, 'Interroga sobre datos filiatorios, personales y los registra', FA, 'hc', 0, {'fil': 1}, 'registro', 'Nombre completo, edad, fecha de nacimiento, DNI, domicilio, estado civil, ocupación, nivel de instrucción y cobertura de salud: identifican a la paciente y orientan el riesgo.',
  [['datos filiatorios'], ['nombre completo'], ['cuantos anos tiene'], ['edad'], ['ocupacion'], ['estado civil'], ['domicilio'], ['dni']], 'Le pregunto sus datos filiatorios y personales: nombre completo, edad, DNI, domicilio, estado civil y ocupación, y los registro.'),
 (4, 'Invita a la paciente a relatar el motivo que la lleva a la consulta y lo registra', FB, 'paciente', 0, {'motivo': 1}, 'preguntar', 'El motivo de consulta se registra con las palabras de la paciente: «¿Qué la trae hoy por acá?».',
  [['motivo de consulta'], ['que la trae'], ['por que consulta'], ['que le pasa'], ['motivo que la lleva']], 'Le pregunto qué la trae a la consulta y registro el motivo de consulta con sus palabras.'),
 (5, 'Invita a la paciente a relatar la enfermedad actual', FB, 'paciente', 0, {'ea': 1}, 'preguntar', 'Se la invita a contar con libertad cómo es su problema: «Cuénteme desde el principio qué le viene pasando».',
  [['enfermedad actual'], ['cuenteme'], ['relate'], ['relato'], ['como viene'], ['cuente']], 'La invito a relatar la enfermedad actual: que me cuente desde el principio qué le viene pasando.'),
 (6, 'Escucha atentamente el relato', FB, 'paciente', 0, {'escucha': 1}, 'escuchar', 'La escucha activa (contacto visual, asentir, sin interrumpir) permite obtener datos que no aparecen en un interrogatorio dirigido.',
  [['escucho'], ['escucha atenta'], ['atentamente'], ['sin interrumpir'], ['contacto visual']], 'Escucho atentamente el relato, mirándola a los ojos y sin interrumpirla.'),
 (7, 'Induce o interrumpe el relato con preguntas o aportes (NO debe hacerlo)', FB, 'paciente', 0, {'noint': 1}, 'escuchar', 'Interrumpir o inducir las respuestas sesga el relato: las preguntas dirigidas se hacen después, solo sobre lo que no apareció espontáneamente.',
  [['no interrumpo'], ['no induzco'], ['no la interrumpo'], ['sin inducir']], 'No interrumpo ni induzco el relato: dejo que la paciente termine antes de hacer preguntas.'),
 (8, 'Pregunta cuándo se inició el padecimiento', FC, 'paciente', 0, {'inicio': 1}, 'preguntar', 'Si no apareció en el relato: fecha de inicio y tiempo de evolución del síntoma.',
  [['cuando empezo'], ['cuando se inicio'], ['desde cuando'], ['hace cuanto'], ['cuando comenzo']], 'Le pregunto cuándo se inició el padecimiento, desde cuándo le pasa.'),
 (9, 'Pregunta cómo empezó el cuadro', FC, 'paciente', 0, {'como': 1}, 'preguntar', 'Modo de comienzo (brusco o gradual) y circunstancias asociadas.',
  [['como empezo'], ['como comenzo'], ['de que forma empezo'], ['de golpe'], ['gradual']], 'Le pregunto cómo empezó el cuadro, si fue de golpe o de manera gradual.'),
 (10, 'Pregunta sobre la evolución y el desarrollo de los síntomas y signos', FC, 'paciente', 0, {'evol': 1}, 'preguntar', 'Cómo evolucionó: si mejoró, empeoró o se mantuvo, y qué otros síntomas se agregaron.',
  [['evolucion'], ['como evoluciono'], ['empeoro'], ['mejoro'], ['sintomas asociados'], ['desarrollo de los sintomas']], 'Le pregunto sobre la evolución y el desarrollo de los síntomas y signos desde que empezó.'),
 (11, 'Pregunta si es la primera vez que presenta este padecimiento o si presentó un cuadro parecido antes', FC, 'paciente', 0, {'prim': 1}, 'preguntar', 'Antecedentes de la enfermedad actual: si es un episodio nuevo o recurrente.',
  [['primera vez'], ['cuadro parecido'], ['le paso antes'], ['episodio previo'], ['alguna vez']], 'Le pregunto si es la primera vez que le pasa o si tuvo un cuadro parecido antes.'),
 (12, 'Pregunta si hizo alguna consulta médica previa', FC, 'paciente', 0, {'cons': 1}, 'preguntar', 'Si consultó antes por esto y con quién.',
  [['consulta medica previa'], ['consulto antes'], ['vio a algun medico'], ['consulto con alguien'], ['consulta previa']], 'Le pregunto si hizo alguna consulta médica previa por este problema.'),
 (13, 'Pregunta si le hicieron estudios complementarios', FC, 'paciente', 0, {'estudios': 1}, 'preguntar', 'Análisis, ecografías, PAP, colposcopia u otros estudios, y sus resultados.',
  [['estudios complementarios'], ['le hicieron estudios'], ['ecografia'], ['analisis'], ['estudios previos']], 'Le pregunto si le hicieron estudios complementarios y cuáles fueron los resultados.'),
 (14, 'Pregunta si se le hizo algún diagnóstico', FC, 'paciente', 0, {'dx': 1}, 'preguntar', 'Si recibió un diagnóstico previo y de quién.',
  [['algun diagnostico'], ['le dijeron que tenia'], ['diagnostico previo'], ['le diagnosticaron'], ['diagnostico']], 'Le pregunto si se le hizo algún diagnóstico.'),
 (15, 'Pregunta si realizó tratamientos', FC, 'paciente', 0, {'trat': 1}, 'preguntar', 'Tratamientos recibidos, dosis, duración, respuesta y adherencia.',
  [['tratamiento'], ['realizo algun tratamiento'], ['medicacion para esto'], ['tomo algo'], ['hizo tratamiento']], 'Le pregunto si realizó algún tratamiento y cómo respondió.'),
 (16, 'Pregunta sobre la menarca', FD, 'hc', 0, {'menarca': 1}, 'preguntar', 'Edad de la primera menstruación (normal: 9 a 15 años) y características del ciclo (duración, regularidad, cantidad).',
  [['menarca'], ['primera menstruacion'], ['primera regla'], ['primer sangrado'], ['a que edad menstruo']], 'Le pregunto sobre la menarca: a qué edad tuvo su primera menstruación y cómo son sus ciclos.'),
 (17, 'Pregunta sobre el inicio de relaciones sexuales', FD, 'hc', 0, {'irs': 1}, 'preguntar', 'Edad de inicio de las relaciones sexuales (factor de riesgo de ITS y de lesiones cervicales si es precoz). Se pregunta con respeto y sin juzgar.',
  [['inicio de relaciones'], ['primera relacion sexual'], ['inicio de las relaciones'], ['comenzo a tener relaciones'], ['irs']], 'Le pregunto sobre el inicio de las relaciones sexuales, a qué edad comenzó.'),
 (18, 'Pregunta sobre el número de parejas sexuales', FD, 'hc', 0, {'parejas': 1}, 'preguntar', 'Número de parejas actuales y a lo largo de la vida, y tipo de pareja (varón, mujer o ambos): riesgo de ITS y de HPV.',
  [['parejas sexuales'], ['numero de parejas'], ['cuantas parejas'], ['pareja actual'], ['parejas']], 'Le pregunto sobre el número de parejas sexuales.'),
 (19, 'Pregunta sobre la paridad', FD, 'hc', 0, {'paridad': 1}, 'preguntar', 'Gestas, partos vaginales, cesáreas, abortos y hijos vivos (fórmula G P C A).',
  [['paridad'], ['embarazos previos'], ['cuantos hijos'], ['partos'], ['cesareas'], ['abortos'], ['gestas']], 'Le pregunto sobre la paridad: embarazos, partos, cesáreas y abortos.'),
 (20, 'Pregunta sobre infecciones de transmisión sexual (ITS)', FD, 'hc', 0, {'its': 1}, 'preguntar', 'Antecedente de ITS (HPV, clamidia, gonorrea, sífilis, herpes, VIH) y tratamientos recibidos.',
  [['its'], ['infecciones de transmision sexual'], ['enfermedades de transmision sexual'], ['infeccion sexual'], ['hpv'], ['clamidia'], ['hiv']], 'Le pregunto sobre antecedentes de infecciones de transmisión sexual (ITS).'),
 (21, 'Pregunta sobre genitorragia', FD, 'hc', 0, {'genito': 1}, 'preguntar', 'Sangrados genitales fuera de la menstruación o con las relaciones sexuales (sinusorragia), o postmenopáusicos.',
  [['genitorragia'], ['sangrado genital'], ['sangrado fuera'], ['sangra entre'], ['sinusorragia'], ['sangrado vaginal'], ['perdidas de sangre']], 'Le pregunto sobre genitorragia: si tiene sangrados fuera de la menstruación.'),
 (22, 'Pregunta sobre la fecha de la última menstruación (FUM)', FD, 'hc', 0, {'fum': 1}, 'preguntar', 'La FUM permite descartar un embarazo, ubicar el ciclo y calcular la edad gestacional si corresponde.',
  [['fum'], ['ultima menstruacion'], ['ultima regla'], ['fecha de la ultima'], ['cuando fue su ultima']], 'Le pregunto sobre la fecha de la última menstruación (FUM).'),
 (23, 'Pregunta (si amerita el caso) sobre el uso de anticoncepción', FD, 'hc', 0, {'anticon': 1}, 'preguntar', 'Método anticonceptivo actual, tiempo de uso y tolerancia; también el deseo reproductivo.',
  [['anticoncepcion'], ['metodo anticonceptivo'], ['se cuida'], ['pastillas'], ['preservativo'], ['diu'], ['anticonceptivo']], 'Le pregunto sobre el uso de anticoncepción: qué método usa y desde cuándo.'),
 (24, 'Pregunta sobre enfermedades previas', FE, 'hc', 0, {'enf': 1}, 'preguntar', 'Enfermedades crónicas (HTA, diabetes, tiroides, cardiopatías) y de la infancia, y alergias.',
  [['enfermedades previas'], ['enfermedades anteriores'], ['padece alguna enfermedad'], ['antecedentes personales'], ['alergias'], ['hipertension'], ['diabetes']], 'Le pregunto sobre enfermedades previas y alergias.'),
 (25, 'Pregunta sobre traumatismos y cirugías previas', FE, 'hc', 0, {'cirug': 1}, 'preguntar', 'Traumatismos, internaciones y cirugías (ginecológicas y de otro tipo) con fecha y motivo.',
  [['cirugias previas'], ['traumatismos'], ['operaciones'], ['la operaron'], ['internaciones'], ['cirugias']], 'Le pregunto sobre traumatismos y cirugías previas.'),
 (26, 'Interroga sobre hábitos', FE, 'hc', 0, {'habitos': 1}, 'preguntar', 'Tabaco, alcohol, drogas, alimentación, sueño y actividad física: factores de riesgo para cáncer cervical, osteoporosis y enfermedad cardiovascular.',
  [['habitos'], ['fuma'], ['tabaco'], ['alcohol'], ['drogas'], ['alimentacion']], 'Interrogo sobre hábitos: tabaco, alcohol, drogas, alimentación y sueño.'),
 (27, 'Interroga sobre el uso de medicamentos', FE, 'hc', 0, {'med': 1}, 'preguntar', 'Medicación habitual, automedicación y productos naturales (anticoagulantes, hormonas, anticonceptivos).',
  [['medicamentos'], ['medicacion habitual'], ['toma algun medicamento'], ['remedios'], ['automedicacion']], 'Interrogo sobre el uso de medicamentos.'),
 (28, 'Pregunta sobre aspectos sociales, laborales, culturales y ambientales', FE, 'hc', 0, {'social': 1}, 'preguntar', 'Con quién vive, trabajo, nivel educativo, creencias, red de apoyo, violencia y vivienda: determinantes sociales de la salud.',
  [['aspectos sociales'], ['laborales'], ['con quien vive'], ['en que trabaja'], ['culturales'], ['ambientales']], 'Pregunto sobre aspectos sociales, laborales, culturales y ambientales.'),
 (29, 'Pregunta sobre antecedentes familiares', FE, 'hc', 0, {'fam': 1}, 'preguntar', 'Cáncer de mama, ovario o colon, diabetes, hipertensión, enfermedades cardiovasculares y trombosis en familiares directos.',
  [['antecedentes familiares'], ['en su familia'], ['familiares'], ['su mama'], ['hermanas'], ['familia']], 'Pregunto sobre antecedentes familiares.'),
 (30, 'Construye un familigrama breve', FE, 'familigrama', 0, {'famili': 1}, 'familigrama', 'El familigrama es un gráfico de la familia (círculos para mujeres, cuadrados para varones) que muestra edades, enfermedades y causas de muerte de por lo menos tres generaciones.',
  [['familigrama'], ['genograma'], ['arbol familiar'], ['grafico de la familia']], 'Construyo un familigrama breve con los datos de la familia de la paciente.'),
 (31, 'Se despide del paciente', FF, 'paciente', 0, {'desp': 1}, 'hablar', 'Se agradece, se resumen los pasos a seguir y se despide cordialmente.',
  [['me despido'], ['hasta luego'], ['hasta pronto'], ['gracias por venir'], ['chau']], 'Me despido de la paciente y le agradezco.'),
]
def pasos_de(L):
    return [dict(n=n, texto=tx, fase=fa, target=tg, critico=bool(cr), explica=ex, estado=es, claves=cl, frase=fr, fx=fx) for n, tx, fa, tg, cr, es, fx, ex, cl, fr in L]
pasosG = pasos_de(G)
# ---- casos ginecológicos: cada uno trae sus respuestas
def cg(i, nombre, edad, motivo, ant, ea, meno, irs, parejas, parid, its, geni, fum, anti, enf, cir, hab, med, soc, fam, familia, extra, eg_titulo):
    return dict(id=i, nombre=nombre, sexo='F', edad=edad, motivo=motivo, indicacion='Anamnesis ginecológica.', antecedentes=ant, alergia=None, extra=extra,
      h_fil=f'{nombre}, {edad} años. {soc[0]}', h_motivo=f'«{motivo}»', h_ea=ea[0], h_inicio=ea[1], h_como=ea[2], h_evol=ea[3], h_prim=ea[4], h_cons=ea[5], h_estudios=ea[6], h_dx=ea[7], h_trat=ea[8],
      h_menarca=meno, h_irs=irs, h_parejas=parejas, h_paridad=parid, h_its=its, h_genito=geni, h_fum=fum, h_anticon=anti, h_enf=enf, h_cirug=cir, h_habitos=hab, h_med=med, h_social=soc[1], h_fam=fam, familia=familia, titulo=eg_titulo)
FAM = lambda padre, madre, hermanos, hijos: dict(padre=padre, madre=madre, hermanos=hermanos, hijos=hijos)
casosG = [
 cg('c1', 'Marina L.', 28, 'Tengo mucha picazón y flujo blanco hace una semana.', 'Sin antecedentes patológicos. Sin alergias conocidas.',
    ['Me pica mucho la zona genital y tengo un flujo blanco, espeso, sin mal olor.', 'Empezó hace 7 días.', 'De golpe, después de un tratamiento con antibióticos por una infección de garganta.', 'Empeora de noche; el flujo es cada vez más espeso y siento ardor al orinar.', 'No, tuve algo parecido dos veces el año pasado.', 'No consulté por esto todavía.', 'No me hicieron estudios.', 'Una vez me dijeron que era una «cándida».', 'Usé un óvulo que me dio la farmacia y me alivió unos días.'],
    'A los 12 años; ciclos regulares cada 28 días, de 4 días de duración, sin dolor.', 'A los 17 años.', 'Una pareja actual hace 3 años (varón).', 'Nuligesta (G0).', 'Nunca tuve ITS.', 'No tengo sangrados fuera de la menstruación.', 'Hace 20 días (le vino ayer, ciclo regular).', 'Uso preservativo y anticonceptivos orales hace 5 años.',
    'Ninguna. Sin alergias.', 'Ninguna cirugía; sin traumatismos.', 'No fumo, tomo alcohol ocasional, sin drogas. Alimentación variada.', 'Anticonceptivos orales; recibió antibióticos hace 10 días.',
    ['Docente, soltera, vive con su pareja.', 'Vive con su pareja en un departamento propio; trabaja 8 horas como docente; buena red de apoyo.'], 'Mi mamá tiene diabetes tipo 2 y mi abuela materna tuvo cáncer de mama.',
    FAM(dict(vivo=True, enf='HTA'), dict(vivo=True, enf='DBT 2'), [dict(sexo='F', enf='sana')], []), ['Vaginitis'], 'Candidiasis vulvovaginal'),
 cg('c2', 'Susana P.', 44, 'Me vienen unos sangrados muy abundantes y estoy cansada.', 'Anemia ferropénica previa. Sin alergias conocidas.',
    ['Los sangrados menstruales son muy abundantes y duran más días; tengo que cambiarme cada hora.', 'Hace 8 meses.', 'Fue gradual: cada mes sangro más.', 'Empeoró; ahora tengo mareos, cansancio y falta de aire al subir escaleras.', 'No, nunca había sangrado así.', 'Consulté en una guardia hace 2 meses.', 'Me hicieron un análisis: dijeron que tenía anemia.', 'No me dieron un diagnóstico.', 'Me dieron hierro por 1 mes.'],
    'A los 13 años; ciclos regulares cada 28 días, pero con sangrado de 9 días y coágulos.', 'A los 19 años.', 'Una pareja estable hace 15 años.', 'G3 P3 (tres partos vaginales).', 'Nunca tuve ITS.', 'Sangra solo en la menstruación, sin sangrado entre ciclos.', 'Hace 12 días.', 'Ligadura tubaria hace 5 años.',
    'Hipotiroidismo en tratamiento. Sin alergias.', 'Ligadura tubaria; sin traumatismos.', 'No fumo, no tomo alcohol, dieta pobre en carnes rojas.', 'Levotiroxina 75 mcg por día; hierro oral.',
    ['Empleada administrativa, casada, vive con su esposo y 3 hijos.', 'Vive con su esposo y tres hijos; trabaja 8 horas; refiere estrés por el trabajo.'], 'Mi mamá tuvo fibromas y le sacaron el útero; mi hermana tiene hipotiroidismo.',
    FAM(dict(vivo=False, enf='ACV'), dict(vivo=True, enf='miomas'), [dict(sexo='F', enf='hipotiroidismo')], [dict(sexo='F', enf='sana'), dict(sexo='M', enf='sano'), dict(sexo='F', enf='sana')]), ['Sangrado uterino anormal'], 'Miomatosis uterina con anemia'),
 cg('c3', 'Carolina V.', 31, 'Tengo dolores terribles con la menstruación y con las relaciones.', 'Dismenorrea desde la adolescencia. Sin alergias conocidas.',
    ['Siento un dolor muy fuerte en la parte baja del abdomen cuando menstruo, y dolor profundo en las relaciones sexuales.', 'Desde hace 4 años, cada vez peor.', 'Gradual; al principio solo en la menstruación.', 'Hoy el dolor también aparece fuera de la menstruación y me falta a veces el trabajo.', 'Tuve dolor menstrual desde la adolescencia, pero nunca tan intenso.', 'Consulté a mi médica clínica.', 'Me hicieron una ecografía que mostró un quiste en el ovario.', 'Me dijeron «puede ser endometriosis».', 'Tomo ibuprofeno y me calma poco.'],
    'A los 11 años; ciclos regulares cada 28 días, con dismenorrea intensa.', 'A los 18 años.', 'Una pareja actual hace 6 años.', 'Nuligesta; busca embarazo hace 2 años sin lograrlo.', 'Nunca tuve ITS.', 'No hay sangrado fuera de la menstruación.', 'Hace 18 días.', 'No usa anticoncepción; desea embarazo.',
    'Ninguna. Sin alergias.', 'Ninguna cirugía; sin traumatismos.', 'No fumo, sin alcohol. Hago ejercicio 3 veces por semana.', 'Ibuprofeno 600 mg en la menstruación.',
    ['Abogada, casada, vive con su esposo.', 'Vive con su esposo; trabaja 9 horas; refiere ansiedad por la dificultad para embarazarse.'], 'Mi mamá tuvo endometriosis; mi abuela murió de cáncer de ovario.',
    FAM(dict(vivo=True, enf='sano'), dict(vivo=True, enf='endometriosis'), [], []), ['Dolor pélvico'], 'Endometriosis'),
 cg('c4', 'Julieta R.', 24, 'Hace 6 meses que no me viene la menstruación y me salen vellos.', 'Obesidad. Sin alergias conocidas.',
    ['Mi menstruación venía cada 2 o 3 meses y hace 6 que no me viene. Además tengo acné y vello en el mentón.', 'Hace 6 meses la falta total; los ciclos irregulares desde la adolescencia.', 'Gradual, con aumento de peso.', 'Subí 10 kilos y tengo más vello y acné.', 'Mis ciclos siempre fueron irregulares.', 'Fui a una consulta hace un año.', 'Me hicieron un análisis hormonal que no retiré.', 'No me dieron un diagnóstico.', 'No hice tratamiento.'],
    'A los 13 años; ciclos irregulares cada 2 a 3 meses.', 'A los 20 años.', 'Una pareja actual hace 2 años.', 'Nuligesta (G0).', 'Nunca tuve ITS.', 'No tengo sangrados.', 'Hace 6 meses.', 'Usa preservativo.',
    'Ninguna. Sin alergias.', 'Ninguna cirugía.', 'No fumo, tomo alcohol los fines de semana; come muchos ultraprocesados y no hace ejercicio.', 'Ninguno.',
    ['Estudiante, soltera, vive con sus padres.', 'Vive con sus padres; estudia y trabaja medio tiempo; refiere angustia por su aspecto.'], 'Mi papá tiene diabetes tipo 2 y mi tía tiene ovario poliquístico.',
    FAM(dict(vivo=True, enf='DBT 2'), dict(vivo=True, enf='HTA'), [dict(sexo='M', enf='sano')], []), ['Amenorrea'], 'Síndrome de ovario poliquístico'),
 cg('c5', 'Beatriz M.', 57, 'Volví a sangrar por la vagina y yo ya no menstruaba.', 'Obesidad, HTA y diabetes tipo 2. Sin alergias conocidas.',
    ['Hace 2 meses empecé a perder sangre por la vagina, a veces con coágulos, y hace 6 años que no menstruo.', 'Hace 2 meses.', 'De golpe, sin dolor.', 'Se repite cada semana, en poca cantidad.', 'No, nunca había pasado desde la menopausia.', 'Todavía no consulté.', 'No me hicieron estudios; mi último PAP fue hace 5 años.', 'No tengo diagnóstico.', 'No hice tratamiento.'],
    'A los 12 años; ciclos regulares hasta la menopausia a los 51 años.', 'A los 20 años.', 'Una sola pareja, su esposo, hace 35 años.', 'G4 P4 (cuatro partos vaginales).', 'Nunca tuve ITS.', 'Sangrado postmenopáusico hace 2 meses.', 'Menopausia hace 6 años.', 'No usa anticoncepción (menopausia).',
    'Hipertensión arterial y diabetes tipo 2. Sin alergias.', 'Colecistectomía hace 10 años.', 'No fumo, sin alcohol; sedentaria.', 'Enalapril 10 mg, metformina 850 mg.',
    ['Ama de casa, casada, vive con su esposo.', 'Vive con su esposo; no trabaja; buena red de apoyo familiar.'], 'Mi hermana tuvo cáncer de mama y mi mamá, de útero.',
    FAM(dict(vivo=False, enf='IAM'), dict(vivo=False, enf='cáncer de útero'), [dict(sexo='F', enf='cáncer de mama')], [dict(sexo='F', enf='sana'), dict(sexo='M', enf='sano')]), ['Sangrado postmenopáusico'], 'Hiperplasia / cáncer de endometrio'),
 cg('c6', 'Agustina C.', 22, 'Vengo a hacerme el control ginecológico y el PAP.', 'Sana. Sin alergias conocidas.',
    ['No tengo ninguna molestia, vengo por un control de rutina.', 'No corresponde: no tiene síntomas.', 'No corresponde.', 'No corresponde.', 'Primera vez que consulto por control.', 'No consulté antes.', 'Nunca me hicieron un PAP.', 'Ninguno.', 'Ninguno.'],
    'A los 12 años; ciclos regulares cada 30 días, sin dolor.', 'A los 18 años.', 'Una pareja actual hace 1 año; antes tuvo 2 parejas.', 'Nuligesta (G0).', 'Nunca tuve ITS; recibió las 2 dosis de vacuna contra el HPV.', 'No hay sangrados fuera de la menstruación.', 'Hace 15 días.', 'Usa preservativo y quiere conocer otras opciones.',
    'Ninguna. Sin alergias.', 'Ninguna cirugía.', 'Fuma 5 cigarrillos por día; alcohol los fines de semana.', 'Ninguno.',
    ['Estudiante, soltera, vive con una amiga.', 'Vive con una amiga; estudia; buena red de apoyo.'], 'Mi abuela paterna tuvo cáncer de cuello de útero.',
    FAM(dict(vivo=True, enf='sano'), dict(vivo=True, enf='sana'), [dict(sexo='F', enf='sana')], []), ['Control'], 'Control ginecológico de rutina'),
 cg('c7', 'Romina F.', 26, 'Tengo dolor en la parte baja del abdomen y un flujo con mal olor.', 'Sin antecedentes patológicos. Sin alergias conocidas.',
    ['Siento dolor en el bajo vientre, flujo amarillento con mal olor y dolor en las relaciones.', 'Hace 5 días.', 'Gradual, con fiebre de 38 grados desde ayer.', 'Empeoró: el dolor es más fuerte y tengo escalofríos.', 'Nunca me había pasado.', 'No consulté antes.', 'No me hicieron estudios.', 'No tengo diagnóstico.', 'Tomé ibuprofeno sin alivio.'],
    'A los 12 años; ciclos regulares cada 28 días.', 'A los 16 años.', 'Tres parejas en el último año, sin preservativo con la última.', 'Nuligesta (G0).', 'Tuve una infección por clamidia hace 2 años, tratada.', 'Sangra levemente después de las relaciones.', 'Hace 10 días.', 'Usa anticonceptivos orales, a veces se olvida.',
    'Ninguna. Sin alergias.', 'Ninguna cirugía.', 'Fuma 10 cigarrillos por día; alcohol los fines de semana.', 'Anticonceptivos orales.',
    ['Moza, soltera, vive con una amiga.', 'Vive con una amiga; trabaja 9 horas por la noche; poca red de apoyo.'], 'Mi mamá tiene hipertensión; sin otros antecedentes.',
    FAM(dict(vivo=True, enf='sano'), dict(vivo=True, enf='HTA'), [], []), ['ITS / EPI'], 'Enfermedad pélvica inflamatoria'),
 cg('c8', 'Mónica G.', 51, 'Tengo muchos calores, no duermo y las relaciones me duelen.', 'Menopausia reciente. Sin alergias conocidas.',
    ['Tengo bochornos varias veces al día, sudores nocturnos, insomnio y sequedad vaginal que hace dolorosas las relaciones.', 'Hace 1 año.', 'Gradual, a medida que se espaciaban las menstruaciones.', 'Empeoró en los últimos meses; tengo mal humor.', 'No, es la primera vez.', 'Consulté a mi clínica hace 3 meses.', 'Me pidieron una densitometría que todavía no hice.', 'Me dijeron «puede ser la menopausia».', 'Tomo un producto natural sin mucho resultado.'],
    'A los 13 años; ciclos regulares hasta hace 2 años.', 'A los 19 años.', 'Una pareja estable hace 25 años.', 'G2 P2 (dos partos vaginales).', 'Nunca tuve ITS.', 'No tengo sangrados desde hace 8 meses.', 'Hace 8 meses (amenorrea).', 'No usa anticoncepción.',
    'Hipertensión leve. Sin alergias.', 'Apendicectomía a los 20 años.', 'No fumo; tomo un vaso de vino por día; sedentaria.', 'Losartán 50 mg; isoflavonas.',
    ['Contadora, casada, vive con su esposo.', 'Vive con su esposo; trabaja 8 horas; refiere estrés laboral.'], 'Mi mamá tuvo osteoporosis y fractura de cadera.',
    FAM(dict(vivo=False, enf='IAM'), dict(vivo=True, enf='osteoporosis'), [dict(sexo='F', enf='sana')], [dict(sexo='F', enf='sana'), dict(sexo='M', enf='sano')]), ['Climaterio'], 'Síndrome climatérico'),
]
dists_G = [
 dd('d1', 'Interrumpe el relato de la paciente con preguntas', 1, 'Interrumpir sesga el relato y hace perder datos espontáneos: se deja terminar a la paciente antes de las preguntas dirigidas.', 'paciente', [['interrumpo el relato'], ['la corto'], ['no la dejo terminar'], ['la interrumpo con']]),
 dd('d2', 'Hace preguntas inductoras que sugieren la respuesta (por ejemplo «¿no será una infección?»)', 1, 'Las preguntas inductoras condicionan la respuesta de la paciente: se formulan preguntas abiertas.', 'paciente', [['no sera una infeccion'], ['pregunta inductora'], ['seguro que es'], ['le sugiero la respuesta']]),
 dd('d3', 'Juzga o hace comentarios moralizantes sobre la vida sexual de la paciente', 1, 'La anamnesis sexual se hace con respeto, sin juicios de valor: la confianza es indispensable para obtener datos reales.', 'paciente', [['juzgo'], ['moralizo'], ['la reto'], ['comentario sobre su conducta'], ['mala conducta']]),
 dd('d4', 'No registra la información brindada por la paciente', 0, 'Los datos se registran durante o inmediatamente después de la entrevista; la memoria no alcanza.', 'hc', [['no registro'], ['sin registrar'], ['no anoto'], ['sin anotar']]),
 dd('d5', 'Usa un lenguaje técnico que la paciente no entiende', 0, 'Se usa un lenguaje claro y sencillo; los tecnicismos dificultan la comunicación.', 'paciente', [['lenguaje tecnico'], ['tecnicismos'], ['no entiende los terminos'], ['terminos medicos complicados']]),
 dd('d6', 'Omite preguntar por la fecha de la última menstruación', 1, 'Omitir la FUM puede hacer pasar por alto un embarazo antes de indicar estudios o tratamientos.', 'hc', [['no pregunto la fum'], ['sin preguntar la fum'], ['omito la fum'], ['no pregunto por la ultima menstruacion']]),
 dd('d7', 'Pregunta por la vida sexual delante de otras personas sin pedir privacidad', 0, 'Los temas íntimos se tratan con privacidad; si hay acompañante se ofrece conversar a solas un momento.', 'consultorio', [['delante de todos'], ['sin privacidad'], ['con su suegra presente']]),
]
QG = [
 ('¿Con qué se inicia la anamnesis ginecológica?', ['Con la presentación, el saludo y la invitación a tomar asiento', 'Con el examen físico', 'Con la indicación de estudios', 'Con el interrogatorio de la FUM únicamente'], 0, 'Se establece primero una relación de confianza: presentación, saludo a la paciente y su acompañante e invitación a sentarse.'),
 ('¿Cómo se registra el motivo de consulta?', ['Con las palabras de la propia paciente', 'Con un diagnóstico presuntivo', 'Con términos técnicos', 'No se registra'], 0, 'El motivo de consulta se escribe como lo dice la paciente, sin interpretarlo.'),
 ('Durante el relato de la enfermedad actual, el médico debe...', ['Escuchar atentamente sin interrumpir ni inducir', 'Interrumpir para aclarar cada dato', 'Sugerir posibles diagnósticos', 'Completar los datos con sus hipótesis'], 0, 'La escucha activa evita sesgos; las preguntas dirigidas se hacen después, solo sobre lo que falta.'),
 ('¿Qué datos de la enfermedad actual se preguntan si no aparecieron en el relato?', ['Cuándo se inició, cómo empezó y cómo evolucionó', 'Solo el tratamiento', 'Solo los estudios', 'Solo los antecedentes familiares'], 0, 'Inicio, modo de comienzo y evolución de los síntomas y signos.'),
 ('¿Cuál es la edad normal de la menarca?', ['Entre los 9 y los 15 años', 'Entre los 5 y los 8 años', 'Después de los 18 años', 'Entre los 20 y los 25 años'], 0, 'La menarca normal ocurre entre los 9 y los 15 años (promedio 12).'),
 ('¿Qué significa la fórmula G3 P2 A1?', ['3 embarazos, 2 partos y 1 aborto', '3 hijos y 2 abortos', '3 partos y 2 cesáreas', '3 abortos y 2 partos'], 0, 'G: gestas; P: partos; A: abortos (también C: cesáreas).'),
 ('Un sangrado vaginal luego de la menopausia se llama...', ['Sangrado postmenopáusico y siempre debe estudiarse', 'Menstruación tardía', 'Metrorragia fisiológica', 'Sinusorragia'], 0, 'Es una señal de alarma que obliga a descartar patología endometrial, incluido el cáncer.'),
 ('¿Por qué se pregunta la FUM en toda mujer en edad fértil?', ['Para descartar un embarazo y ubicar el ciclo', 'Para calcular el peso', 'Solo si hay amenorrea', 'No es necesaria'], 0, 'La FUM permite descartar un embarazo antes de indicar estudios o fármacos.'),
 ('¿Qué es el familigrama?', ['Un gráfico de la familia con edades, enfermedades y causas de muerte', 'Una lista de medicamentos', 'Un esquema del ciclo menstrual', 'Un análisis de sangre'], 0, 'Se usan círculos para mujeres y cuadrados para varones, en al menos tres generaciones.'),
 ('Frente a un tema íntimo como la vida sexual, el médico debe...', ['Preguntar con respeto, sin juzgar y garantizando privacidad', 'Evitar preguntar', 'Preguntar delante de todos', 'Hacer comentarios sobre las conductas'], 0, 'La confianza y la privacidad son la base de una anamnesis sexual confiable.'),
]
fundG = [dict(q=q, o=o, c=c, e=e) for q, o, c, e in QG]

filasG = [  # panel de historia clínica que se completa mientras el alumno pregunta
 ('Filiación', 'fil', 'h_fil'), ('Motivo de consulta', 'motivo', 'h_motivo'), ('Enfermedad actual', 'ea', 'h_ea'), ('Inicio', 'inicio', 'h_inicio'), ('Modo de comienzo', 'como', 'h_como'), ('Evolución', 'evol', 'h_evol'),
 ('Episodios previos', 'prim', 'h_prim'), ('Consultas / estudios / tratamiento', 'trat', 'h_trat'), ('Menarca y ciclos', 'menarca', 'h_menarca'), ('Inicio de relaciones', 'irs', 'h_irs'), ('Parejas', 'parejas', 'h_parejas'),
 ('Paridad', 'paridad', 'h_paridad'), ('ITS', 'its', 'h_its'), ('Genitorragia', 'genito', 'h_genito'), ('FUM', 'fum', 'h_fum'), ('Anticoncepción', 'anticon', 'h_anticon'),
 ('Enfermedades previas', 'enf', 'h_enf'), ('Cirugías / traumatismos', 'cirug', 'h_cirug'), ('Hábitos', 'habitos', 'h_habitos'), ('Medicamentos', 'med', 'h_med'), ('Aspectos sociales', 'social', 'h_social'), ('Antecedentes familiares', 'fam', 'h_fam')]

hp = {str(n): c for n, c in {2: None}.items() if False}
HP_G = {'3': 'h_fil', '4': 'h_motivo', '5': 'h_ea', '8': 'h_inicio', '9': 'h_como', '10': 'h_evol', '11': 'h_prim', '12': 'h_cons', '13': 'h_estudios', '14': 'h_dx', '15': 'h_trat', '16': 'h_menarca', '17': 'h_irs', '18': 'h_parejas',
        '19': 'h_paridad', '20': 'h_its', '21': 'h_genito', '22': 'h_fum', '23': 'h_anticon', '24': 'h_enf', '25': 'h_cirug', '26': 'h_habitos', '27': 'h_med', '28': 'h_social', '29': 'h_fam'}
HR_G = {k: '🗣 Paciente:' for k in HP_G}

elG = {
 'paciente': ('Paciente y acompañante', 'Se las saluda, se escucha el relato sin interrumpir y se despide cordialmente.'),
 'consultorio': ('Consultorio', 'Mesa y sillas a la misma altura, sin barreras, con privacidad.'),
 'hc': ('Historia clínica', 'Se registran filiación, motivo de consulta, enfermedad actual y los antecedentes.'),
 'familigrama': ('Familigrama', 'Gráfico breve de la familia: círculos para mujeres, cuadrados para varones.'),
}
def mk_el(d): return {k: dict(nombre=v[0], desc=v[1], pasos=[]) for k, v in d.items()}

# ----------------------------------------------------------------------- instrumental (consultorio)
def it(id, grupo, nombre, detalle, correcto, critico, desc, ficha, **kw):
    o = dict(id=id, grupo=grupo, nombre=nombre, detalle=detalle, img=f'assets/instrumental/{id}.svg', correcto=correcto, critico=critico, descripcion=desc, ficha=ficha); o.update(kw); return o
itemsG = [
 it('hc_blanca', 'registro', 'Historia clínica ginecológica', 'Formulario en blanco', True, True, 'Formulario donde se registran filiación, motivo de consulta, enfermedad actual y antecedentes.', [['Documento', 'Historia clínica']], falta='Falta la historia clínica donde registrar la anamnesis.'),
 it('lapicera', 'registro', 'Lapicera y tablilla', 'Para anotar', True, False, 'Para registrar los datos durante la entrevista.', [['Uso', 'Registro']]),
 it('mesa_sillas', 'confort', 'Mesa y sillas del consultorio', '2 sillas enfrentadas', True, True, 'Sillas a la misma altura y sin barreras para conversar con comodidad.', [['Cantidad', '2 mesas y 6 sillas']], falta='Faltan la mesa y las sillas del consultorio.'),
 it('panuelos', 'confort', 'Caja de pañuelos descartables', 'Para la contención', True, False, 'Un gesto simple de contención ante temas emotivos.', [['Uso', 'Contención']], opcional=True),
 it('familigrama_hoja', 'registro', 'Hoja para el familigrama', 'Con símbolos', True, False, 'Hoja para dibujar el familigrama breve.', [['Símbolos', 'Círculo mujer, cuadrado varón']]),
 it('especulo', 'otros', 'Espéculo vaginal', 'Descartable', False, False, 'Instrumento del examen físico.', [['Uso', 'Examen ginecológico']], feedback='El espéculo corresponde al examen físico, no a la anamnesis.'),
 it('camilla_obs', 'otros', 'Camilla ginecológica', 'Con estribos', False, False, 'Para el examen ginecológico.', [['Uso', 'Examen físico']], feedback='La anamnesis se hace sentadas, conversando; la camilla se usa recién en el examen físico.'),
 it('orden_estudios', 'otros', 'Órdenes de estudios ya completadas', 'Pedidos prellenados', False, False, 'Pedidos de laboratorio e imágenes.', [['Uso', 'Solicitud de estudios']], feedback='Los estudios se piden después de la anamnesis y según lo que surja; no antes de escuchar a la paciente.'),
]
INS_G = dict(id='anamg', titulo='Consultorio de ginecología · Anamnesis',
 consigna='Preparás el consultorio para la entrevista: la historia clínica y un lugar cómodo para conversar. Pasá el cursor (o tocá) cada insumo para inspeccionarlo; arrastralo a la bandeja o hacé clic para agregarlo.',
 caso_sub='consulta ginecológica', indicacion_def='Anamnesis ginecológica.', mision=['qué hace falta para una entrevista cómoda y registrada;', 'qué insumos no corresponden a la anamnesis.'],
 demo_caso='Primero se lee el caso clínico: el motivo de consulta orienta el interrogatorio.',
 grupos=[dict(id='registro', titulo='Registro'), dict(id='confort', titulo='Consultorio'), dict(id='otros', titulo='Otros insumos')], items=itemsG, bandeja_img='assets/instrumental/bandeja.svg')

machG = {'perlas': [
 {'t': 'Recepción', 'x': 'Presentate, saludá a la paciente y al acompañante, invitá a sentarse, y registrá filiación y motivo de consulta con sus palabras.'},
 {'t': 'Enfermedad actual', 'x': 'Dejala relatar sin interrumpir ni inducir. Después preguntá lo que no apareció: cuándo empezó, cómo empezó, evolución, episodios previos, consultas, estudios, diagnóstico y tratamientos.'},
 {'t': 'Gineco-obstétricos', 'x': 'Menarca y ciclos, inicio de relaciones, parejas, paridad (G P C A), ITS, genitorragia, FUM y anticoncepción.'},
 {'t': 'Otros antecedentes', 'x': 'Enfermedades previas, traumatismos y cirugías, hábitos, medicamentos, aspectos sociales, laborales, culturales y ambientales.'},
 {'t': 'Familiares y cierre', 'x': 'Antecedentes familiares y familigrama breve; despedite cordialmente.'}], 'por_paso': {'7': 'No interrumpir ni inducir.', '22': 'La FUM descarta embarazo.', '30': 'Círculo = mujer, cuadrado = varón.'}}

CRIT_G = dict(criterios_texto='La lista de cotejo no define criterios de desaprobación automática; el simulador califica la comunicación (presentación, escucha sin interrumpir), la cobertura del relato y de los antecedentes gineco-obstétricos y personales, y el registro (propuesto, a validar).',
  criterios=[dict(ico='🤝', titulo='Recepción y comunicación: presentarse, escuchar sin interrumpir', pasos=[1, 2, 6, 7]), dict(ico='📖', titulo='Relato y enfermedad actual completos', pasos=[4, 5, 8, 9, 10]), dict(ico='🌸', titulo='Antecedentes gineco-obstétricos', pasos=[16, 17, 18, 19, 20, 21, 22, 23]), dict(ico='🗂️', titulo='Otros antecedentes y familigrama', pasos=[24, 25, 26, 27, 28, 29, 30])],
  final_criticos='la comunicación, el relato de la enfermedad actual y los antecedentes gineco-obstétricos')

ALG_G = dict(titulo='Guía de la anamnesis ginecológica', boton_titulo='Ver el esquema de la anamnesis', boton_sub='Orden del interrogatorio ginecológico', aviso='el esquema de la anamnesis', flecha='▼ Interrogatorio dirigido', flecha_final='▼ Cierre', pie='Sin juzgar, con privacidad y sin interrumpir.',
 comun=[dict(t='Recepción', x='Presentación, saludo, asiento, filiación.', flag='fil'), dict(t='Motivo y enfermedad actual', x='Relato libre, escucha activa.', flag='ea')],
 columnas=[dict(titulo='Enfermedad actual', cls='nd', nodos=[dict(t='Inicio y modo de comienzo', x='¿Cuándo? ¿Cómo empezó?', flag='como'), dict(t='Evolución', x='Mejoró, empeoró, síntomas asociados.', flag='evol'), dict(t='Antecedentes del cuadro', x='Episodios previos, consultas, estudios, diagnóstico y tratamientos.', flag='trat')]),
  dict(titulo='Gineco-obstétricos', cls='fv', nodos=[dict(t='Menarca, relaciones y parejas', x='Edad de la menarca, IRS, número de parejas.', flag='parejas'), dict(t='Paridad, ITS, genitorragia', x='G P C A; ITS; sangrados anormales.', flag='genito'), dict(t='FUM y anticoncepción', x='Descartar embarazo; método anticonceptivo.', flag='anticon')]),
  dict(titulo='Personales y familiares', cls='nd', nodos=[dict(t='Personales', x='Enfermedades, cirugías, hábitos, medicamentos, aspectos sociales.', flag='social'), dict(t='Familiares', x='Antecedentes y familigrama.', flag='famili')])],
 final=[dict(t='Despedida', x='Agradecer y explicar los pasos a seguir.', flag='desp')])

EXG = dict(id='anamg', area='sim', titulo='Anamnesis ginecológica', icono='🗂️',
 resumen='Entrevista ginecológica con 31 pasos de la lista de cotejo: recepción, relato libre, enfermedad actual, antecedentes gineco-obstétricos, personales y familiares, con familigrama. La paciente responde y la historia clínica se completa en pantalla.',
 umbral=60, fuente='Lista de cotejo: Anamnesis ginecológica',
 elementos={}, distractores=dists_G, casos=casosG, fundamentos=fundG, voz=True, algoritmo=ALG_G, hallazgo_pasos=HP_G, hallazgo_rotulos=HR_G, hallazgo_voz={k: 'f' for k in HP_G},
 machete=machG, examen=dict(tiempos=[5, 10, 15, 30], penalizacion_incorrecta=3, penalizacion_repetida=1),
 visor='data/acreditaciones/sim/anamg_modelo.json', peso_modelo='2 MB', instrumental='data/acreditaciones/sim/instrumental_anamg.json', mesa_pasos=[], pasos=pasosG)
EXG.update(CRIT_G)
EXG['elementos'] = {k: dict(nombre=v[0], desc=v[1], pasos=[p['n'] for p in pasosG if p['target'] == k]) for k, v in elG.items()}
W(OUT + 'anamg.json', EXG); W(OUT + 'instrumental_anamg.json', INS_G)

# ======================================================================================  ANAMNESIS OBSTÉTRICA
O = [
 (1, 'Se presenta, saluda a la paciente y acompañante', FA, 'paciente', 0, {'pres': 1}, 'hablar', 'Presentarse y saludar también al acompañante abre la relación con respeto y confianza.',
  [['me presento'], ['soy la doctora'], ['soy el doctor'], ['buen dia'], ['buenas tardes'], ['mucho gusto']], 'Buenas tardes, soy la doctora, me presento con mi nombre y apellido. Saludo a la paciente y a su acompañante.'),
 (2, 'Invita a tomar asiento', FA, 'consultorio', 0, {'asiento': 1}, 'sentar', 'Invitar a sentarse favorece un ambiente cómodo y de confianza.',
  [['tome asiento'], ['tomar asiento'], ['siente'], ['sientese'], ['invito a sentarse']], 'La invito a tomar asiento, por favor.'),
 (3, 'Interroga sobre datos filiatorios, personales y los registra', FA, 'hc', 0, {'fil': 1}, 'registro', 'Nombre, edad, DNI, domicilio, estado civil, ocupación, nivel de instrucción y cobertura de salud.',
  [['datos filiatorios'], ['nombre completo'], ['cuantos anos tiene'], ['edad'], ['ocupacion'], ['estado civil'], ['domicilio'], ['dni']], 'Le pregunto sus datos filiatorios y personales y los registro.'),
 (4, 'Invita a la paciente a relatar el motivo que la lleva a la consulta y lo registra', FB, 'paciente', 0, {'motivo': 1}, 'preguntar', 'Se registra el motivo de consulta con las palabras de la embarazada.',
  [['motivo de consulta'], ['que la trae'], ['por que consulta'], ['que le pasa'], ['motivo que la lleva']], 'Le pregunto qué la trae a la consulta y registro el motivo de consulta.'),
 (5, 'Escucha atentamente el relato', FB, 'paciente', 0, {'escucha': 1}, 'escuchar', 'Escucha activa, sin interrumpir: la embarazada puede aportar datos relevantes de manera espontánea.',
  [['escucho'], ['escucha atenta'], ['atentamente'], ['sin interrumpir']], 'Escucho atentamente el relato, sin interrumpirla.'),
 (6, 'Solicita el carnet perinatal', FD, 'carnet', 1, {'carnet': 1}, 'carnet', 'El carnet perinatal resume los controles, los estudios y la medicación del embarazo en curso: se lo solicita al comienzo para revisar los datos.',
  [['carnet perinatal'], ['carnet'], ['libreta del embarazo'], ['solicito el carnet']], 'Le solicito el carnet perinatal para revisar los controles del embarazo.'),
 (7, 'Pregunta sobre la FUM e interroga sobre la edad gestacional', FD, 'hc', 1, {'fum': 1}, 'preguntar', 'La FUM permite calcular la edad gestacional y la fecha probable de parto; se la confirma con ecografía precoz si es dudosa.',
  [['fum'], ['ultima menstruacion'], ['ultima regla'], ['edad gestacional'], ['cuantas semanas'], ['semanas de embarazo']], 'Le pregunto la fecha de la última menstruación (FUM) y de cuántas semanas está.'),
 (8, 'Pregunta sobre embarazos previos', FD, 'hc', 0, {'prev': 1}, 'preguntar', 'Gestas, partos, cesáreas, abortos y resultados perinatales previos (prematurez, preeclampsia, diabetes gestacional).',
  [['embarazos previos'], ['embarazos anteriores'], ['cuantos hijos'], ['partos anteriores'], ['abortos'], ['cesareas'], ['gestas']], 'Le pregunto sobre embarazos previos: partos, cesáreas y abortos.'),
 (9, 'Pregunta sobre el uso de anticoncepción', FD, 'hc', 0, {'anticon': 1}, 'preguntar', 'Método usado antes del embarazo y planes anticonceptivos después del parto.',
  [['anticoncepcion'], ['metodo anticonceptivo'], ['se cuidaba'], ['pastillas'], ['preservativo'], ['anticonceptivo']], 'Le pregunto sobre el uso de anticoncepción antes del embarazo.'),
 (10, 'Pregunta si fue un embarazo deseado o no', FD, 'hc', 0, {'deseado': 1}, 'preguntar', 'Si fue planificado y deseado: orienta la aceptación, el apoyo y los riesgos psicosociales.',
  [['embarazo deseado'], ['planificado'], ['lo buscaba'], ['deseado'], ['busco el embarazo']], 'Le pregunto si fue un embarazo deseado o no.'),
 (11, 'Pregunta sobre un Papanicolau previo', FD, 'hc', 0, {'pap': 1}, 'preguntar', 'Fecha y resultado del último PAP: el embarazo es una oportunidad para completar el tamizaje cervical.',
  [['papanicolau'], ['pap'], ['citologia'], ['ultimo pap']], 'Le pregunto sobre un Papanicolau previo.'),
 (12, 'Pregunta sobre genitorragia', FD, 'hc', 1, {'genito': 1}, 'preguntar', 'Sangrado genital durante el embarazo: amenaza de aborto, placenta previa, desprendimiento: debe indagarse siempre.',
  [['genitorragia'], ['sangrado genital'], ['sangrado vaginal'], ['perdidas de sangre'], ['sangra']], 'Le pregunto sobre genitorragia: si tuvo pérdidas de sangre en este embarazo.'),
 (13, 'Pregunta por antecedentes personales: TBC, DBT, HTA, preeclampsia, cirugías previas, infertilidad, cardiopatías y otras', FD, 'hc', 1, {'enf': 1}, 'preguntar', 'Tuberculosis, diabetes, hipertensión, preeclampsia previa, cirugías, infertilidad, cardiopatías y otras: definen el riesgo obstétrico.',
  [['antecedentes personales'], ['tuberculosis'], ['diabetes'], ['hipertension'], ['preeclampsia'], ['cardiopatia'], ['infertilidad']], 'Pregunto por antecedentes personales: tuberculosis, diabetes, hipertensión, preeclampsia, cirugías previas, infertilidad, cardiopatías y otras.'),
 (14, 'Interroga sobre hábitos: tabaco, alcohol, drogas y violencia', FE, 'hc', 1, {'habitos': 1}, 'preguntar', 'Tabaco, alcohol, drogas y violencia (de pareja o familiar): factores de riesgo materno y fetal que obligan a intervenir.',
  [['habitos'], ['tabaco'], ['fuma'], ['alcohol'], ['drogas'], ['violencia']], 'Interrogo sobre hábitos: tabaco, alcohol, drogas y si sufre violencia.'),
 (15, 'Interroga sobre el uso de medicamentos', FE, 'hc', 0, {'med': 1}, 'preguntar', 'Medicación habitual, ácido fólico, hierro y automedicación: algunos fármacos son teratogénicos.',
  [['medicamentos'], ['medicacion'], ['acido folico'], ['toma algo'], ['remedios']], 'Interrogo sobre el uso de medicamentos, ácido fólico y hierro.'),
 (16, 'Pregunta sobre aspectos sociales, laborales y culturales: actividad física, actividad laboral y recreación', FE, 'hc', 0, {'social': 1}, 'preguntar', 'Actividad física semanal, horas de trabajo y actividades recreativas: orientan hábitos y estrés.',
  [['aspectos sociales'], ['actividad fisica'], ['actividad laboral'], ['trabaja'], ['clubes'], ['recreacion']], 'Pregunto sobre aspectos sociales, laborales y culturales: actividad física, trabajo y actividades de recreación.'),
 (17, 'Pregunta sobre antecedentes familiares: TBC, DBT, HTA, preeclampsia, cirugías, infertilidad, cardiopatías y otras', FE, 'hc', 0, {'fam': 1}, 'preguntar', 'Los mismos antecedentes en los familiares directos: diabetes, hipertensión, preeclampsia, malformaciones y embarazos múltiples.',
  [['antecedentes familiares'], ['en su familia'], ['familiares'], ['mama'], ['hermanas']], 'Pregunto sobre antecedentes familiares.'),
 (18, 'Pregunta sobre grupo y factor sanguíneo', FD, 'hc', 1, {'grupo': 1}, 'preguntar', 'El grupo y factor Rh definen el riesgo de isoinmunización: una madre Rh negativa necesita inmunoglobulina anti-D.',
  [['grupo y factor'], ['grupo sanguineo'], ['factor rh'], ['rh'], ['grupo']], 'Pregunto sobre el grupo y factor sanguíneo.'),
 (19, 'Pregunta sobre la vigencia de las vacunas: antirrubeólica, antitetánica y antigripal', FD, 'hc', 1, {'vacunas': 1}, 'vacunas', 'Antitetánica (dTpa desde la semana 20), antigripal y antirrubeólica (no se aplica en el embarazo): protegen a la madre y al recién nacido.',
  [['vacunas'], ['vigencia de las vacunas'], ['antitetanica'], ['antigripal'], ['antirrubeola'], ['dtpa']], 'Pregunto sobre la vigencia de las vacunas: antirrubeólica, antitetánica y antigripal.'),
 (20, 'Pesa a la paciente', FD, 'balanza', 0, {'peso': 1}, 'peso_pac', 'El peso y la ganancia de peso se controlan en cada visita y se grafican en el carnet.',
  [['peso'], ['balanza'], ['pesa'], ['pesar']], 'Pesa a la paciente en la balanza y registro el peso.'),
 (21, 'Toma la tensión arterial', FD, 'tensio', 1, {'ta': 1}, 'presion_art', 'La tensión arterial detecta trastornos hipertensivos del embarazo; se toma sentada, en reposo, con el brazalete adecuado.',
  [['tension arterial'], ['presion arterial'], ['ta'], ['tensiometro'], ['tomo la presion']], 'Tomo la tensión arterial a la paciente.'),
 (22, 'Saluda y se despide', FF, 'paciente', 0, {'desp': 1}, 'hablar', 'Se agradece la consulta, se acuerda el próximo control y se despide cordialmente.',
  [['me despido'], ['hasta luego'], ['hasta el proximo control'], ['gracias por venir'], ['chau']], 'Me despido de la paciente y acordamos el próximo control.'),
]
pasosO = pasos_de(O)
def co(i, nombre, edad, eg, motivo, ant, resp):
    c = dict(id=i, nombre=nombre, sexo='F', edad=edad, eg=eg, motivo=motivo, indicacion='Anamnesis obstétrica.', antecedentes=ant, alergia=None, extra=[f'Embarazo de {eg} semanas'], presentacion='cefalica', dorso='izq', fcf=146)
    c.update(resp); return c
casosO = [
 co('c1', 'Camila R.', 24, 12, 'Estoy embarazada y vengo a hacerme mi primer control.', 'Primigesta, sin antecedentes.', dict(
    h_fil='Camila R., 24 años, empleada de comercio, soltera, vive con su pareja.', h_motivo='«Estoy embarazada y vengo a mi primer control».', h_carnet='Es el primer control: no tiene carnet, se le abre uno nuevo.', h_fum='FUM: 10 de julio; calcula 12 semanas. Ciclos regulares.', h_prev='Primer embarazo (G1).', h_anticon='Usaba preservativo; lo dejó hace 4 meses para buscar el embarazo.', h_deseado='Sí, fue un embarazo buscado y deseado por ambos.', h_pap='Nunca se hizo un PAP.', h_genito='No tuvo pérdidas de sangre.', h_enf='Niega tuberculosis, diabetes, hipertensión, cardiopatías e infertilidad. Sin cirugías previas.', h_habitos='No fuma, no toma alcohol, sin drogas, sin violencia.', h_med='Toma ácido fólico desde hace 3 meses.', h_social='Camina 30 minutos por día; trabaja 40 horas semanales; no va a clubes.', h_fam='Madre con hipertensión; abuela paterna con diabetes tipo 2.', h_grupo='Grupo A, factor Rh positivo.', h_vacunas='Antirrubeólica completa en la niñez; antitetánica vencida; antigripal no aplicada.', h_peso='Pesa 62 kg (talla 1,64 m, IMC 23).', h_ta='Presión arterial 110/70 mmHg.')),
 co('c2', 'Lucía M.', 31, 28, 'Vengo a mi control; tengo la presión alta desde hace años.', 'G3P2. Hipertensión arterial crónica.', dict(
    h_fil='Lucía M., 31 años, docente, casada, vive con su esposo y dos hijos.', h_motivo='«Vengo a mi control de embarazo».', h_carnet='Trae el carnet con 5 controles previos, con presiones entre 130/85 y 140/90.', h_fum='FUM: 18 de enero; 28 semanas confirmadas por una ecografía del primer trimestre.', h_prev='G3 P2: dos partos vaginales; en el último tuvo preeclampsia.', h_anticon='Usaba DIU, que se retiró para buscar el embarazo.', h_deseado='Sí, embarazo planificado.', h_pap='Último PAP hace 1 año, normal.', h_genito='No refiere pérdidas de sangre.', h_enf='Hipertensión arterial crónica; preeclampsia en el embarazo anterior. Niega diabetes, tuberculosis y cardiopatías.', h_habitos='No fuma, no toma alcohol, sin drogas, sin violencia.', h_med='Metildopa 500 mg cada 8 horas, ácido fólico, hierro.', h_social='Hace caminatas 2 veces por semana; trabaja 30 horas semanales.', h_fam='Madre con hipertensión y preeclampsia; hermana con diabetes gestacional.', h_grupo='Grupo O, factor Rh positivo.', h_vacunas='Antigripal aplicada; dTpa pendiente; antirrubeólica completa.', h_peso='Pesa 78 kg (ganó 8 kg).', h_ta='Presión arterial 138/88 mmHg.')),
 co('c3', 'Gabriela P.', 38, 34, 'Tengo diabetes y vengo a controlar mi embarazo.', 'G3P2. Diabetes pregestacional tipo 2.', dict(
    h_fil='Gabriela P., 38 años, cocinera, casada, vive con su familia.', h_motivo='«Controlo mi embarazo; soy diabética».', h_carnet='Trae el carnet con glucemias de ayuno entre 110 y 130 mg/dL.', h_fum='FUM: 14 de febrero; 34 semanas por ecografía precoz.', h_prev='G3 P2: dos partos, el último de un bebé de 4,2 kg.', h_anticon='Usaba anticonceptivos orales.', h_deseado='No fue planificado, pero lo aceptó.', h_pap='Último PAP hace 3 años.', h_genito='No tuvo pérdidas de sangre.', h_enf='Diabetes tipo 2 desde hace 6 años; obesidad. Niega hipertensión, cardiopatías y tuberculosis.', h_habitos='No fuma, no toma alcohol, sin drogas, sin violencia.', h_med='Insulina NPH 20 UI por la noche, ácido fólico, hierro.', h_social='No hace actividad física; trabaja 45 horas semanales.', h_fam='Padre y hermana con diabetes tipo 2.', h_grupo='Grupo B, factor Rh positivo.', h_vacunas='Antitetánica y antigripal aplicadas; antirrubeólica completa.', h_peso='Pesa 91 kg (ganó 12 kg).', h_ta='Presión arterial 120/78 mmHg.')),
 co('c4', 'Natalia S.', 29, 32, 'Vengo a mi control; mi grupo es negativo.', 'G2P0A1. Rh negativo.', dict(
    h_fil='Natalia S., 29 años, administrativa, casada.', h_motivo='«Vengo a mi control; me dijeron que mi sangre es negativa».', h_carnet='Trae el carnet: Coombs indirecto negativo en la semana 28.', h_fum='FUM: 5 de marzo; 32 semanas por ecografía.', h_prev='G2 P0 A1: un aborto espontáneo de 8 semanas hace 2 años, sin recibir inmunoglobulina.', h_anticon='Usaba preservativo.', h_deseado='Sí, embarazo deseado.', h_pap='Último PAP hace 1 año, normal.', h_genito='No tuvo pérdidas de sangre en este embarazo.', h_enf='Niega tuberculosis, diabetes, hipertensión, cardiopatías y cirugías.', h_habitos='No fuma, no toma alcohol, sin drogas, sin violencia.', h_med='Ácido fólico y hierro.', h_social='Hace yoga 2 veces por semana; trabaja 35 horas semanales.', h_fam='Sin antecedentes familiares relevantes.', h_grupo='Grupo O, factor Rh NEGATIVO; la pareja es Rh positivo.', h_vacunas='dTpa y antigripal pendientes; antirrubeólica completa.', h_peso='Pesa 68 kg.', h_ta='Presión arterial 112/72 mmHg.')),
 co('c5', 'Micaela T.', 16, 30, 'No sabía que estaba embarazada; vengo con mi mamá.', 'Adolescente, primigesta, sin controles previos.', dict(
    h_fil='Micaela T., 16 años, estudiante secundaria, soltera, vive con su madre.', h_motivo='«Vengo con mi mamá porque estoy embarazada».', h_carnet='No tiene carnet ni controles previos: se abre uno nuevo.', h_fum='FUM incierta; por altura uterina y ecografía, cursa 30 semanas.', h_prev='Primer embarazo (G1).', h_anticon='No usaba ningún método.', h_deseado='No fue planificado ni deseado.', h_pap='Nunca se hizo un PAP.', h_genito='No tuvo pérdidas de sangre.', h_enf='Niega tuberculosis, diabetes, hipertensión y cardiopatías.', h_habitos='Fuma 5 cigarrillos por día; toma alcohol los fines de semana; refiere discusiones violentas con su pareja.', h_med='No toma ningún medicamento.', h_social='No hace actividad física; dejó la escuela; no tiene recreación.', h_fam='Sin antecedentes familiares relevantes.', h_grupo='Grupo A, factor Rh positivo.', h_vacunas='No tiene vacunas del embarazo.', h_peso='Pesa 52 kg.', h_ta='Presión arterial 100/60 mmHg.')),
 co('c6', 'Valeria D.', 36, 24, 'Tengo una enfermedad del corazón y estoy embarazada.', 'G2P1C1. Cardiopatía valvular. Infertilidad previa.', dict(
    h_fil='Valeria D., 36 años, contadora, casada.', h_motivo='«Tengo una válvula del corazón y estoy embarazada».', h_carnet='Trae el carnet con ecocardiograma y controles cardiológicos.', h_fum='FUM: 2 de abril; 24 semanas por ecografía.', h_prev='G2 P0 C1: una cesárea hace 4 años.', h_anticon='Dejó el DIU para buscar el embarazo; tuvo 3 años de infertilidad.', h_deseado='Sí, embarazo muy buscado.', h_pap='Último PAP hace 2 años, normal.', h_genito='No tuvo pérdidas de sangre.', h_enf='Cardiopatía valvular (estenosis mitral leve); infertilidad previa; cesárea. Niega diabetes y tuberculosis.', h_habitos='No fuma, no toma alcohol, sin drogas, sin violencia.', h_med='Metoprolol 50 mg por día, ácido fólico, hierro.', h_social='Camina 20 minutos por día; trabaja 30 horas semanales.', h_fam='Madre con valvulopatía.', h_grupo='Grupo A, factor Rh positivo.', h_vacunas='Antigripal aplicada; dTpa pendiente.', h_peso='Pesa 64 kg.', h_ta='Presión arterial 105/65 mmHg.')),
 co('c7', 'Romina F.', 27, 20, 'Vengo a controlarme; tuve tuberculosis.', 'G3P1A1. Antecedente de tuberculosis tratada.', dict(
    h_fil='Romina F., 27 años, moza, en pareja.', h_motivo='«Vengo a controlar el embarazo; hace dos años tuve tuberculosis».', h_carnet='Trae el carnet: serologías (HIV, sífilis, hepatitis B) solicitadas.', h_fum='FUM: 20 de mayo; 20 semanas por ecografía.', h_prev='G3 P1 A1: un parto vaginal y un aborto espontáneo.', h_anticon='Usaba anticonceptivos orales.', h_deseado='No fue planificado, pero está contenta.', h_pap='Último PAP hace 2 años, normal.', h_genito='Tuvo una pérdida escasa de sangre hace 2 semanas, ya resuelta.', h_enf='Tuberculosis pulmonar tratada hace 2 años. Niega diabetes, hipertensión y cardiopatías.', h_habitos='Fuma 10 cigarrillos por día; toma alcohol los fines de semana; sin drogas; sin violencia.', h_med='Ácido fólico y hierro.', h_social='No hace actividad física; trabaja 50 horas semanales.', h_fam='Un tío con tuberculosis.', h_grupo='Grupo B, factor Rh positivo.', h_vacunas='Antitetánica aplicada; antigripal pendiente.', h_peso='Pesa 59 kg.', h_ta='Presión arterial 110/70 mmHg.')),
 co('c8', 'Paula G.', 34, 38, 'Vengo a mi control; falta poco para el parto.', 'G3P2. Sin patologías.', dict(
    h_fil='Paula G., 34 años, docente, casada.', h_motivo='«Vengo a mi control; estoy por cumplir las 38 semanas».', h_carnet='Trae el carnet completo, con todos los controles normales.', h_fum='FUM: 3 de enero; 38 semanas.', h_prev='G3 P2: dos partos vaginales sin complicaciones.', h_anticon='Usaba preservativo.', h_deseado='Sí, embarazo planificado.', h_pap='Último PAP hace 1 año, normal.', h_genito='No tuvo pérdidas de sangre.', h_enf='Niega tuberculosis, diabetes, hipertensión, cardiopatías e infertilidad.', h_habitos='No fuma, no toma alcohol, sin drogas, sin violencia.', h_med='Ácido fólico y hierro.', h_social='Camina 40 minutos por día; trabaja 30 horas semanales; va a un club de natación.', h_fam='Sin antecedentes familiares relevantes.', h_grupo='Grupo O, factor Rh positivo.', h_vacunas='Antigripal y dTpa aplicadas; antirrubeólica completa.', h_peso='Pesa 74 kg.', h_ta='Presión arterial 115/70 mmHg.')),
]
HP_O = {'3': 'h_fil', '4': 'h_motivo', '6': 'h_carnet', '7': 'h_fum', '8': 'h_prev', '9': 'h_anticon', '10': 'h_deseado', '11': 'h_pap', '12': 'h_genito', '13': 'h_enf', '14': 'h_habitos', '15': 'h_med', '16': 'h_social', '17': 'h_fam', '18': 'h_grupo', '19': 'h_vacunas', '20': 'h_peso', '21': 'h_ta'}
HR_O = {'20': '⚖️ Balanza:', '21': '🩺 Medís:'}
for k in HP_O: HR_O.setdefault(k, '🗣 Embarazada:')
dists_O = [
 dd('d1', 'Interrumpe el relato de la embarazada', 1, 'Interrumpir sesga el relato y hace perder datos espontáneos.', 'paciente', [['interrumpo el relato'], ['la corto'], ['no la dejo terminar'], ['la interrumpo con']]),
 dd('d2', 'No solicita el carnet perinatal', 1, 'El carnet perinatal es el documento clave del control: omitirlo hace perder controles, estudios y medicación previos.', 'carnet', [['no solicito el carnet'], ['sin pedir el carnet'], ['omito el carnet'], ['no pido el carnet']]),
 dd('d3', 'Omite preguntar por el grupo y factor sanguíneo', 1, 'Una madre Rh negativa requiere seguimiento (Coombs indirecto) e inmunoglobulina anti-D.', 'hc', [['no pregunto el grupo'], ['sin preguntar el grupo'], ['omito el grupo'], ['no pregunto por el grupo']]),
 dd('d4', 'Omite preguntar por violencia, tabaco, alcohol y drogas', 1, 'Son factores de riesgo materno-fetales que obligan a intervenir.', 'hc', [['no pregunto por violencia'], ['sin preguntar por el tabaco'], ['omito los habitos'], ['no pregunto por los habitos']]),
 dd('d5', 'Indica la vacuna antirrubeólica durante el embarazo', 1, 'La vacuna antirrubeólica (virus vivo atenuado) está contraindicada en el embarazo; se aplica en el puerperio.', 'hc', [['aplico la antirrubeolica'], ['indico la vacuna antirrubeolica'], ['vacuno contra la rubeola']]),
 dd('d6', 'No toma la tensión arterial', 1, 'La tensión arterial es fundamental para detectar los trastornos hipertensivos del embarazo.', 'tensio', [['no tomo la tension'], ['sin tomar la presion'], ['omito la tension'], ['no tomo la presion']]),
 dd('d7', 'Hace comentarios que juzgan sobre el embarazo no deseado o el estado civil', 0, 'Se evitan los juicios de valor: la confianza permite detectar riesgos psicosociales.', 'paciente', [['juzgo'], ['comentario sobre su conducta'], ['la reto'], ['moralizo']]),
]
QO = [
 ('¿Para qué sirve el carnet perinatal?', ['Resume los controles, estudios y medicación del embarazo en curso', 'Reemplaza a la historia clínica', 'Es solo un trámite administrativo', 'Registra únicamente el peso'], 0, 'Se solicita al inicio para revisar la información del embarazo.'),
 ('¿Para qué se pregunta la FUM en la gestante?', ['Para calcular la edad gestacional y la fecha probable de parto', 'Para medir el peso', 'Para indicar anticoncepción', 'No se pregunta'], 0, 'La FUM permite estimar la EG y la FPP; se confirma con ecografía precoz si es dudosa.'),
 ('¿Qué significa G3 P2 A0?', ['3 embarazos, 2 partos y ningún aborto', '3 hijos vivos y 2 abortos', '3 cesáreas y 2 partos', '2 embarazos y 3 partos'], 0, 'G gestas; P partos; A abortos.'),
 ('¿Qué riesgo implica una madre Rh negativa con pareja Rh positivo?', ['Isoinmunización: Coombs indirecto e inmunoglobulina anti-D', 'Diabetes gestacional', 'Hipertensión', 'Ninguno'], 0, 'Se solicita Coombs indirecto y se indica inmunoglobulina anti-D si corresponde.'),
 ('¿Cuál es una vacuna contraindicada durante el embarazo?', ['Antirrubeólica (virus vivo)', 'Antitetánica (dTpa)', 'Antigripal', 'Hepatitis B'], 0, 'Las vacunas con virus vivos atenuados están contraindicadas; la dTpa se aplica desde la semana 20.'),
 ('¿Qué se registra al tomar la tensión arterial en la gestante?', ['Cifras para detectar trastornos hipertensivos del embarazo', 'Solo el pulso', 'La temperatura', 'La saturación'], 0, 'Una TA ≥ 140/90 mmHg obliga a descartar preeclampsia.'),
 ('¿Por qué se indaga por violencia en la anamnesis obstétrica?', ['Es un factor de riesgo materno y fetal que obliga a intervenir', 'Es una curiosidad', 'No se pregunta', 'Solo en adolescentes'], 0, 'La violencia aumenta el riesgo de parto prematuro, bajo peso y lesiones.'),
 ('Una pérdida de sangre durante el embarazo debe...', ['Indagarse siempre y estudiarse', 'Ignorarse si es escasa', 'Tratarse con reposo sin estudios', 'Atribuirse a la menstruación'], 0, 'Puede ser amenaza de aborto, placenta previa o desprendimiento.'),
 ('¿Qué antecedentes personales se interrogan en la embarazada?', ['TBC, DBT, HTA, preeclampsia, cirugías, infertilidad y cardiopatías', 'Solo diabetes', 'Solo cirugías', 'Ninguno'], 0, 'Definen el riesgo obstétrico y el nivel de atención.'),
]
filasO = None
machO = {'perlas': [
 {'t': 'Recepción', 'x': 'Presentate, saludá a la paciente y al acompañante, invitá a sentarse, filiación, motivo de consulta y escucha sin interrumpir.'},
 {'t': 'Embarazo actual', 'x': 'Pedí el carnet perinatal; FUM y EG; embarazos previos; anticoncepción; si fue deseado; PAP previo; genitorragia; grupo y factor; vacunas.'},
 {'t': 'Antecedentes', 'x': 'Personales y familiares: TBC, DBT, HTA, preeclampsia, cirugías, infertilidad, cardiopatías. Hábitos: tabaco, alcohol, drogas y violencia. Medicamentos y aspectos sociales.'},
 {'t': 'Examen básico', 'x': 'Pesá a la paciente y tomá la tensión arterial. Saludá y despedite.'}], 'por_paso': {'6': 'Carnet perinatal al comienzo.', '18': 'Rh negativo: Coombs y anti-D.', '19': 'Antirrubeólica NO en el embarazo.'}}
CRIT_O = dict(criterios_texto='La lista de cotejo no define criterios de desaprobación automática; el simulador califica la comunicación, el uso del carnet perinatal, la FUM y la edad gestacional, los antecedentes de riesgo, el grupo y factor, las vacunas y la toma de peso y tensión arterial (propuesto, a validar).',
  criterios=[dict(ico='🤝', titulo='Recepción y escucha', pasos=[1, 2, 5]), dict(ico='📒', titulo='Carnet perinatal, FUM y edad gestacional', pasos=[6, 7]), dict(ico='⚠️', titulo='Antecedentes de riesgo: personales, hábitos y violencia', pasos=[12, 13, 14]), dict(ico='🩸', titulo='Grupo y factor, vacunas', pasos=[18, 19]), dict(ico='⚖️', titulo='Peso y tensión arterial', pasos=[20, 21])],
  final_criticos='el carnet perinatal, la FUM, los antecedentes de riesgo, el grupo y factor, las vacunas y la tensión arterial')
ALG_O = dict(titulo='Guía de la anamnesis obstétrica', boton_titulo='Ver el esquema de la anamnesis', boton_sub='Orden del interrogatorio obstétrico', aviso='el esquema de la anamnesis', flecha='▼ Embarazo actual', flecha_final='▼ Examen básico y cierre', pie='Carnet perinatal, FUM, antecedentes de riesgo, grupo y factor, vacunas, peso y TA.',
 comun=[dict(t='Recepción', x='Presentación, asiento, filiación y motivo.', flag='motivo'), dict(t='Carnet perinatal', x='Controles, estudios y medicación del embarazo.', flag='carnet')],
 columnas=[dict(titulo='Embarazo actual', cls='nd', nodos=[dict(t='FUM y EG', x='Calcular la edad gestacional.', flag='fum'), dict(t='Embarazos previos', x='G P C A y resultados.', flag='prev'), dict(t='Deseado, PAP y genitorragia', x='Aceptación, tamizaje y sangrados.', flag='genito')]),
  dict(titulo='Antecedentes de riesgo', cls='fv', nodos=[dict(t='Personales y familiares', x='TBC, DBT, HTA, preeclampsia, cardiopatías...', flag='fam'), dict(t='Hábitos y violencia', x='Tabaco, alcohol, drogas, violencia.', flag='habitos'), dict(t='Medicamentos', x='Ácido fólico, hierro, otros.', flag='med')]),
  dict(titulo='Prevención', cls='nd', nodos=[dict(t='Grupo y factor', x='Rh negativo: Coombs y anti-D.', flag='grupo'), dict(t='Vacunas', x='dTpa, antigripal; antirrubeólica no.', flag='vacunas')])],
 final=[dict(t='Peso y tensión arterial', x='Ganancia de peso y detección de hipertensión.', flag='ta'), dict(t='Despedida', x='Próximo control.', flag='desp')])
elO = dict(elG); elO['carnet'] = ('Carnet perinatal', 'Resume los controles, estudios y medicación del embarazo.'); elO['balanza'] = ('Balanza', 'Para pesar a la paciente en cada control.'); elO['tensio'] = ('Tensiómetro', 'Para tomar la tensión arterial.')
itemsO = [
 it('carnet_perinatal', 'registro', 'Carnet perinatal', 'Control prenatal', True, True, 'Documento donde se registran los controles del embarazo.', [['Documento', 'Carnet perinatal']], falta='Falta el carnet perinatal.'),
 it('hc_blanca', 'registro', 'Historia clínica obstétrica', 'Formulario en blanco', True, True, 'Para registrar la anamnesis obstétrica.', [['Documento', 'Historia clínica']], falta='Falta la historia clínica.'),
 it('balanza_pie', 'medir', 'Balanza de pie', 'Peso materno', True, True, 'Para pesar a la embarazada.', [['Uso', 'Peso']], falta='Falta la balanza para pesar a la paciente.'),
 it('tensiometro', 'medir', 'Tensiómetro y brazalete', 'Aneroide', True, True, 'Para tomar la tensión arterial.', [['Uso', 'Tensión arterial']], falta='Falta el tensiómetro.'),
 it('mesa_sillas', 'confort', 'Mesa y sillas del consultorio', '2 sillas enfrentadas', True, False, 'Lugar cómodo para conversar.', [['Cantidad', '2 mesas y 6 sillas']]),
 it('lapicera', 'registro', 'Lapicera y tablilla', 'Para anotar', True, False, 'Para registrar los datos.', [['Uso', 'Registro']]),
 it('especulo', 'otros', 'Espéculo vaginal', 'Descartable', False, False, 'Instrumento del examen ginecológico.', [['Uso', 'Examen']], feedback='No corresponde a la anamnesis.'),
 it('doppler', 'otros', 'Doppler fetal portátil', 'Detector de latidos', False, False, 'Detector de latidos fetales.', [['Uso', 'Auscultación']], feedback='La auscultación fetal pertenece al examen obstétrico, no a la anamnesis.'),
]
INS_O = dict(id='anamo', titulo='Consultorio de control prenatal · Anamnesis', consigna='Preparás el consultorio: carnet, historia clínica, balanza y tensiómetro. Pasá el cursor (o tocá) cada insumo para inspeccionarlo; arrastralo a la bandeja o hacé clic para agregarlo.',
 caso_sub='control prenatal', indicacion_def='Anamnesis obstétrica.', mision=['qué hace falta para registrar y controlar peso y tensión;', 'qué insumos no corresponden.'], demo_caso='Primero se lee el caso: la edad gestacional y los antecedentes orientan el interrogatorio.',
 grupos=[dict(id='registro', titulo='Registro'), dict(id='medir', titulo='Peso y tensión'), dict(id='confort', titulo='Consultorio'), dict(id='otros', titulo='Otros insumos')], items=itemsO, bandeja_img='assets/instrumental/bandeja.svg')
EXO = dict(id='anamo', area='sim', titulo='Anamnesis obstétrica', icono='🤰',
 resumen='Entrevista obstétrica con 22 pasos de la lista de cotejo: recepción, carnet perinatal, FUM y edad gestacional, antecedentes de riesgo, hábitos, grupo y factor, vacunas, peso y tensión arterial.',
 umbral=60, fuente='Lista de cotejo: Anamnesis obstétrica', elementos={k: dict(nombre=v[0], desc=v[1], pasos=[p['n'] for p in pasosO if p['target'] == k]) for k, v in elO.items()},
 distractores=dists_O, casos=casosO, fundamentos=[dict(q=q, o=o, c=c, e=e) for q, o, c, e in QO], voz=True, algoritmo=ALG_O, hallazgo_pasos=HP_O, hallazgo_rotulos=HR_O, hallazgo_voz={k: 'f' for k in HP_O},
 machete=machO, examen=dict(tiempos=[5, 10, 15, 30], penalizacion_incorrecta=3, penalizacion_repetida=1),
 visor='data/acreditaciones/sim/anamo_modelo.json', peso_modelo='2 a 3 MB', instrumental='data/acreditaciones/sim/instrumental_anamo.json', mesa_pasos=[], pasos=pasosO)
EXO.update(CRIT_O)
W(OUT + 'anamo.json', EXO); W(OUT + 'instrumental_anamo.json', INS_O)

# ======================================================================================  MODELOS 3D (torso femenino + aparato reproductor; panel de historia clínica)
M = J('data/acreditaciones/siam/sv_modelo.json')
glb = lambda id, carpeta, f, capa, color, op, hs, nom, peso, **kw: dict(id=id, tipo='glb', src=f'assets/anatomia/{carpeta}/{f}.glb', escala=100, rot=[0, 0, 0], pos=[0, 0, 0], capa=capa, color=color, opacidad=op, hs=hs, nombre=nom, peso=peso, **kw)
def modelo(embarazada, filas):
    piezas = [glb('piel', 'sim', 'torso_f', 'piel', '#e8b89c', 0.46, None, 'Paciente', 1255052, piel_real=True), glb('pelvis', 'hra', 'pelvis_f', 'huesos', '#e8e1cf', 0.5, None, 'Pelvis ósea', 120000)]
    if not embarazada:
        piezas += [glb('utero', 'hra', 'uterus_f', 'organos', '#ff6fb5', 0.85, 'utero', 'Útero', 150000), glb('ovarios', 'sim', 'ovarios', 'organos', '#f9a8d4', 0.95, 'ovarios', 'Ovarios', 3044), glb('trompas', 'sim', 'trompas', 'organos', '#fda4af', 0.9, 'trompas', 'Trompas de Falopio', 24696), glb('vejiga', 'hra', 'bladder_f', 'organos', '#ffc21a', 0.6, 'vejiga', 'Vejiga', 100000)]
    VAR = dict(origen=[0, 19, 6], corte_x=0.0, rotacion=[0, 0, 0], piezas=piezas, procedurales={},
      pines=dict(utero=[-1.4, 4.2, -1.5], ovarios=[6, 5.5, -4], cuello=[-1.1, 0.7, -7.5], mamas=[0, 39, 9]),
      camara=dict(lat=[80, 4, 0], fro=[0, 4, 70], sup=[0.01, 80, 0], objetivo=[0, -6, 0], ini=[12, -2, 40]),
      etiquetas=dict(utero=[110, -30], ovarios=[-120, 20], cuello=[110, 60], mamas=[-100, -40]))
    G = dict(M['general']); G['camara'] = dict(M['general']['camara'], foco=40, min=16, max=160)
    pines = [dict(id='mamas', label='Mamas', capa='piel', externo=True)] if embarazada else [dict(id='utero', label='Útero', capa='organos'), dict(id='ovarios', label='Ovarios', capa='organos'), dict(id='cuello', label='Cuello uterino', capa='organos')]
    inst = [dict(id='hc', tipo='hc', filas=filas)]
    if embarazada: inst.insert(0, dict(id='gravida', tipo='gravida'))
    return dict(general=G, overlay_html='', tarjetas=dict(mesa=dict(titulo='🗂️ Registro', id='mesa', items=[['hc', '🗂️', 'Historia', 'clínica'], ['carnet', '📒', 'Carnet', 'perinatal']]), entorno=dict(titulo='🏥 Consultorio', items=[['paciente', '🧍‍♀️', 'Paciente', ''], ['consultorio', '🪑', 'Consultorio', '']])),
      chips=[['fil', 'Filiación'], ['motivo', 'Motivo'], ['ea', 'Enfermedad actual'], ['fum', 'FUM'], ['fam', 'Antecedentes familiares']], usables=['hc', 'paciente', 'consultorio', 'carnet'], pines=pines, instrumentos=inst, M=VAR, F=VAR)
W(OUT + 'anamg_modelo.json', modelo(False, [dict(t=a, f=b, c=c) for a, b, c in filasG]))
filasO_ = [('Filiación', 'fil', 'h_fil'), ('Motivo de consulta', 'motivo', 'h_motivo'), ('Carnet perinatal', 'carnet', 'h_carnet'), ('FUM y EG', 'fum', 'h_fum'), ('Embarazos previos', 'prev', 'h_prev'), ('Anticoncepción', 'anticon', 'h_anticon'), ('Embarazo deseado', 'deseado', 'h_deseado'), ('PAP previo', 'pap', 'h_pap'), ('Genitorragia', 'genito', 'h_genito'),
           ('Antecedentes personales', 'enf', 'h_enf'), ('Hábitos', 'habitos', 'h_habitos'), ('Medicamentos', 'med', 'h_med'), ('Aspectos sociales', 'social', 'h_social'), ('Antecedentes familiares', 'fam', 'h_fam'), ('Grupo y factor', 'grupo', 'h_grupo'), ('Vacunas', 'vacunas', 'h_vacunas'), ('Peso', 'peso', 'h_peso'), ('Tensión arterial', 'ta', 'h_ta')]
W(OUT + 'anamo_modelo.json', modelo(True, [dict(t=a, f=b, c=c) for a, b, c in filasO_]))
print('ok', len(pasosG), len(pasosO))
