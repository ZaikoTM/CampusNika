import json, re
items = json.load(open('C:/Users/Augusto/AppData/Local/Temp/claude/siam/items.json', encoding='utf8'))
key = [k for k in items if 'SV' in k][0]
txt = {n: t for n, t in items[key]}
txt[30] = txt[30].split('PUNTAJE')[0].strip()

# n: (fase, target, critico, explica, estado)
M = {
1: ('Preparación', 'mesa', 0, 'Se reúne y prepara todo antes de empezar para no interrumpir la técnica una vez iniciada. La mesa alta de traslado permite llevar el material junto al paciente.', {}),
2: ('Preparación', 'hc', 0, 'Verificar apellido, nombre y la solicitud del procedimiento evita errores de paciente y de práctica (seguridad del paciente).', {'id': 1}),
3: ('Preparación', 'lado', 0, 'El material queda al lado del paciente, al alcance de la mano, antes de comenzar con la parte limpia.', {}),
4: ('Comunicación', 'paciente', 0, 'Saludar y presentarse es la base de la relación médico-paciente y reduce la ansiedad ante un procedimiento invasivo.', {}),
5: ('Comunicación', 'paciente', 0, 'La explicación incluye los motivos de la práctica, sus riesgos (infección, trauma o falsa vía uretral) y sus beneficios, con lenguaje claro y sencillo.', {}),
6: ('Comunicación', 'consent', 1, 'El consentimiento informado es un requisito ético y legal. Se solicita la firma y se anexa firmado a la planilla de registro y a la historia clínica.', {'consent': 1}),
7: ('Posición y asepsia', 'paciente', 0, 'Mujeres: posición ginecológica (litotomía) para exponer el meato. Varones: decúbito supino.', {'pos': 1}),
8: ('Posición y asepsia', 'paciente', 0, 'Se resguarda la intimidad del paciente: se retira la ropa interior y se cubre el área genital con sábana o paño clínico no estéril.', {}),
9: ('Posición y asepsia', 'guantes-ns', 0, 'Los guantes no estériles protegen al operador durante la higiene, que es la etapa limpia-sucia del procedimiento.', {'gloves': 'ns'}),
10: ('Posición y asepsia', 'iodo', 0, 'La antisepsia con iodopovidona jabonoso del meato y zonas adyacentes reduce la carga bacteriana y el riesgo de infección urinaria asociada a la sonda.', {'higiene': 1}),
11: ('Posición y asepsia', 'panos-ns', 0, 'Un paño clínico no estéril debajo de los muslos mantiene la zona seca y aislada de la cama.', {}),
12: ('Posición y asepsia', 'guantes-ns', 0, 'Terminada la etapa de higiene, los guantes sucios se descartan para no contaminar el campo estéril.', {'gloves': 'none'}),
13: ('Posición y asepsia', 'lavabo', 1, 'El lavado de manos con técnica clínica antes de los guantes estériles es la medida de asepsia más importante para prevenir infecciones.', {'manos': 1}),
14: ('Campo estéril', 'guantes-e', 1, 'Los guantes estériles se colocan con técnica cerrada para no tocar su exterior con la piel y mantener la esterilidad.', {'gloves': 'e'}),
15: ('Campo estéril', 'pano-e', 0, 'El paño estéril cubriendo la región pelviana y genital delimita el campo estéril de trabajo.', {'campo': 1}),
16: ('Campo estéril', 'campo-aux', 0, 'Un paño adicional estéril, cerca de la zona, es la superficie donde se ordenan los elementos necesarios sin contaminarlos.', {'aux': 1}),
17: ('Campo estéril', 'pack', 0, 'El pack se abre con la mano dominante y la sonda se retira enrollándola de a poco, sin que toque superficies no estériles.', {'pack': 1}),
18: ('Técnica', 'sonda', 1, 'Se infla y desinfla el balón con aire para confirmar que no pierde y que no está roto. Un balón defectuoso puede romperse dentro de la vejiga o no fijar la sonda. No comprobarlo es criterio de desaprobación.', {'tested': 1}),
19: ('Técnica', 'gel', 0, 'La lidocaína en gel lubrica y anestesia localmente el extremo de la sonda, y disminuye el trauma uretral y el dolor.', {'gel': 1}),
20: ('Técnica', 'paciente', 0, 'Se avisa al paciente que comienza el procedimiento para que se prepare y colabore (respirar tranquilo, no contraer).', {}),
21: ('Técnica', 'uretra', 0, 'Se introduce siguiendo el recorrido de la uretra de cada sexo (corta en la mujer, larga y con curvas en el varón) hasta que fluye orina. Ante resistencia no se fuerza: se reevalúa, para evitar una falsa vía uretral.', {'ins': 1}),
22: ('Técnica', 'jeringa', 0, 'Una vez que sale orina se infla el balón con agua bidestilada (no suero fisiológico, que puede cristalizar y dificultar el desinflado). Inflar antes de confirmar que está en la vejiga lesiona la uretra.', {'infl': 1}),
23: ('Técnica', 'balon', 0, 'La tracción suave hasta sentir resistencia apoya el balón en el cuello vesical y confirma que quedó fijo.', {}),
24: ('Cierre', 'bolsa', 0, 'Se conecta la bolsa colectora y se comprueba que la orina fluye hacia ella (sistema cerrado).', {'bag': 1}),
25: ('Cierre', 'prepucio', 0, 'En el varón se reduce el prepucio sobre el glande para evitar una parafimosis, que estrangula el glande y es una urgencia.', {'prep': 1}),
26: ('Cierre', 'gancho', 0, 'La bolsa se cuelga del ganchillo de la cama, por debajo del nivel de la vejiga y sin apoyarla en el piso, para evitar el reflujo de orina.', {'hook': 1}),
27: ('Cierre', 'cinta', 0, 'Fijar la sonda a la cara interna del muslo evita la tracción sobre la uretra y el cuello vesical.', {'fix': 1}),
28: ('Cierre', 'paciente', 0, 'Se informa el final de la práctica y los cuidados: no tironear, mantener la bolsa debajo de la vejiga y consultar ante dolor, fiebre o falta de diuresis.', {}),
29: ('Cierre', 'residuos', 0, 'Se retiran los elementos de la cama y se desechan los usados en los residuos correspondientes.', {'limpio': 1}),
30: ('Cierre', 'hc', 1, 'Registrar el procedimiento (fecha, tipo y calibre de sonda, volumen de agua del balón, características de la orina, tolerancia) deja constancia legal y asistencial.', {'reg': 1}),
}
pasos = []
for n in range(1, 31):
    f, t, c, e, st = M[n]
    p = {'n': n, 'texto': txt[n], 'fase': f, 'target': t, 'critico': bool(c), 'explica': e, 'estado': st}
    if n == 25: p['solo'] = 'M'
    pasos.append(p)

elementos = {
 'mesa': ['Mesa alta de traslado', 'Donde se reúne y prepara todo el material antes de ir al paciente.', [1]],
 'lado': ['Lado del paciente', 'Zona junto a la cama donde queda el material, al alcance del operador.', [3]],
 'hc': ['Historia clínica y solicitud', 'Se verifican los datos y la indicación al inicio, y se registra el procedimiento al final.', [2, 30]],
 'consent': ['Consentimiento informado', 'Formulario que firma el paciente; se anexa a la planilla de registro y a la historia clínica.', [6]],
 'paciente': ['Paciente', 'Con él se dialoga (saludo, explicación, aviso) y se lo ubica en la posición correcta.', [4, 5, 7, 8, 20, 28]],
 'lavabo': ['Lavabo', 'Lavado de manos con técnica clínica antes de colocar los guantes estériles.', [13]],
 'guantes-ns': ['Guantes no estériles', 'Para la etapa de higiene. Se descartan antes del campo estéril.', [9, 12]],
 'iodo': ['Iodopovidona jabonoso', 'Antisepsia de la zona genital y adyacencias.', [10]],
 'panos-ns': ['Paños clínicos no estériles', 'Para cubrir la zona y apoyar los muslos durante la higiene.', [8, 11]],
 'guantes-e': ['Guantes estériles', 'Se colocan con técnica cerrada luego del lavado de manos.', [14]],
 'pano-e': ['Paño estéril', 'Cubre la región pelviana y genital: campo estéril.', [15]],
 'campo-aux': ['Paño estéril adicional', 'Superficie estéril donde se ubican los elementos de la práctica.', [16]],
 'pack': ['Pack estéril con sonda', 'Se abre con la mano dominante evitando contaminar la sonda.', [17]],
 'sonda': ['Sonda Foley', 'Se comprueba la indemnidad inflando y desinflando el balón con aire.', [18]],
 'gel': ['Lidocaína gel', 'Lubricación y anestesia local del extremo de la sonda.', [19]],
 'uretra': ['Uretra', 'Vía por la que avanza la sonda hasta la vejiga. Corta en la mujer; larga y con dos curvas en el varón.', [21]],
 'jeringa': ['Jeringa con agua bidestilada', 'Para inflar el balón una vez que fluye orina.', [22]],
 'balon': ['Balón de la sonda', 'Se apoya en el cuello vesical; la tracción suave confirma la fijación.', [23]],
 'bolsa': ['Bolsa colectora', 'Se conecta a la sonda formando un sistema cerrado.', [24]],
 'prepucio': ['Prepucio (varón)', 'Debe volver a su lugar para prevenir parafimosis.', [25]],
 'gancho': ['Ganchillo de la cama', 'Sostiene la bolsa por debajo del nivel de la vejiga.', [26]],
 'cinta': ['Cinta hipoalergénica', 'Fija la sonda a la cara interna del muslo.', [27]],
 'residuos': ['Residuos', 'Descarte de los elementos utilizados.', [29]],
}
elementos = {k: {'nombre': v[0], 'desc': v[1], 'pasos': v[2]} for k, v in elementos.items()}

distractores = [
 {'id': 'd1', 'texto': 'Introduce la sonda sin comprobar la indemnidad del balón', 'critico': True, 'porque': 'Es criterio de desaprobación: un balón defectuoso puede romperse en la vejiga o no fijar la sonda.'},
 {'id': 'd2', 'texto': 'Infla el balón con suero fisiológico', 'critico': False, 'porque': 'Corresponde agua bidestilada: el suero puede cristalizar y dificultar el desinflado.'},
 {'id': 'd3', 'texto': 'Comienza el procedimiento sin solicitar el consentimiento informado', 'critico': True, 'porque': 'El consentimiento informado es un requisito ético y legal previo.'},
 {'id': 'd4', 'texto': 'Introduce la sonda con guantes no estériles', 'critico': True, 'porque': 'La introducción es una maniobra estéril: requiere guantes estériles y campo estéril.'},
 {'id': 'd5', 'texto': 'Fuerza la sonda al encontrar resistencia', 'critico': True, 'porque': 'Forzar puede crear una falsa vía uretral o lacerar la uretra. Ante resistencia se reevalúa.'},
 {'id': 'd6', 'texto': 'Infla el balón antes de confirmar que sale orina', 'critico': True, 'porque': 'Inflar fuera de la vejiga lesiona la uretra. Primero debe fluir orina.'},
 {'id': 'd7', 'texto': 'Se coloca los guantes estériles sin lavarse las manos', 'critico': True, 'porque': 'El lavado de manos con técnica clínica es previo a los guantes estériles.'},
 {'id': 'd8', 'texto': 'Deja la bolsa colectora apoyada sobre el piso', 'critico': False, 'porque': 'Debe colgarse del ganchillo de la cama, por debajo de la vejiga y sin tocar el piso.'},
 {'id': 'd9', 'texto': 'Deja el prepucio retraído sobre el glande al finalizar', 'critico': False, 'solo': 'M', 'porque': 'Puede producir parafimosis: el prepucio debe volver a su lugar.'},
]

casos = [
 {'sexo': 'F', 'edad': 82, 'motivo': 'Retención aguda de orina luego de una cirugía de cadera. Globo vesical palpable.'},
 {'sexo': 'M', 'edad': 76, 'motivo': 'Retención aguda de orina por hiperplasia benigna de próstata. Dolor hipogástrico.'},
 {'sexo': 'F', 'edad': 79, 'motivo': 'Sepsis de foco respiratorio. Requiere control estricto de la diuresis.'},
 {'sexo': 'M', 'edad': 71, 'motivo': 'Internado en terapia. Requiere control horario de la diuresis.'},
 {'sexo': 'F', 'edad': 85, 'motivo': 'Retención urinaria por impactación fecal. Se indica sondaje evacuador.'},
 {'sexo': 'M', 'edad': 68, 'motivo': 'Hematuria con coágulos y retención. Se indica sonda para irrigación vesical.'},
]

preguntas = [
 {'q': '¿Cuál de las siguientes es una indicación diagnóstica de sondaje vesical?', 'o': ['Prostatitis aguda con fiebre', 'Control estricto de la diuresis en un paciente crítico', 'Incontinencia urinaria leve sin complicaciones', 'Comodidad del personal en un paciente autoválido'], 'c': 1, 'e': 'En pacientes críticos el control de la diuresis exige medición exacta. La prostatitis aguda es una contraindicación, y la comodidad no es una indicación.'},
 {'q': 'Paciente con traumatismo pélvico que presenta sangre en el meato uretral. ¿Qué corresponde?', 'o': ['Colocar una sonda de menor calibre', 'Colocar la sonda con abundante lidocaína gel', 'No sondar: sospecha de rotura uretral', 'Colocar la sonda e inflar el balón de inmediato'], 'c': 2, 'e': 'La uretrorragia postraumática hace sospechar rotura uretral: es contraindicación absoluta del sondaje a ciegas.'},
 {'q': '¿Cuál es una contraindicación absoluta del sondaje vesical?', 'o': ['Prostatitis aguda', 'Retención aguda de orina', 'Hematuria con coágulos', 'Cirugía urológica programada'], 'c': 0, 'e': 'Prostatitis aguda, uretritis aguda, abscesos periuretrales y sospecha de rotura uretral son contraindicaciones absolutas.'},
 {'q': '¿Con qué se debe inflar el balón de la sonda una vez dentro de la vejiga?', 'o': ['Aire', 'Suero fisiológico', 'Agua bidestilada', 'Solución con lidocaína'], 'c': 2, 'e': 'Con agua bidestilada. El suero puede cristalizar y el aire no es estable ni seguro dentro de la vejiga.'},
 {'q': 'Luego de drenar de golpe 1200 mL de una vejiga muy distendida, el paciente se hipotensa y presenta hematuria. ¿Cómo se previene?', 'o': ['Vaciando de a poco, clampeando la sonda cada 500 mL por unos minutos', 'Retirando la sonda tras el primer litro', 'Aumentando el calibre de la sonda', 'Irrigando la vejiga con agua destilada'], 'c': 0, 'e': 'Es la hematuria ex vacuo con hipotensión por descompresión brusca. Se previene con vaciado progresivo.'},
 {'q': 'En un varón sondado, ¿qué complicación se evita volviendo el prepucio a su lugar?', 'o': ['Uretritis', 'Parafimosis', 'Fimosis congénita', 'Epididimitis'], 'c': 1, 'e': 'Si el prepucio queda retraído por detrás del glande, se estrangula y produce parafimosis, una urgencia isquémica.'},
 {'q': 'Al avanzar la sonda se encuentra resistencia. ¿Qué corresponde?', 'o': ['Empujar con más fuerza para vencerla', 'Aumentar el calibre de la sonda', 'No forzar y reevaluar para evitar una falsa vía', 'Inflar el balón para que avance'], 'c': 2, 'e': 'Forzar puede crear una falsa vía uretral o lacerar la uretra.'},
 {'q': '¿Cuál es una contraindicación relativa del sondaje vesical?', 'o': ['Retención aguda de orina', 'Alergia conocida al látex o a la lidocaína', 'Control de diuresis', 'Hematuria con coágulos'], 'c': 1, 'e': 'La alergia al látex o a anestésicos locales obliga a usar materiales alternativos; es una contraindicación relativa, igual que la estenosis uretral.'},
]

data = {
 'id': 'sv', 'area': 'siam', 'titulo': 'Colocación de sonda vesical', 'icono': '🧪',
 'resumen': 'Recorrido virtual de la colocación de sonda vesical, con 30 pasos de la lista de cotejo de la cátedra.',
 'umbral': 60, 'fuente': 'Lista de cotejo: Evaluación en colocación de sonda vesical (30 ítems)',
 'pasos': pasos, 'elementos': elementos, 'distractores': distractores, 'casos': casos, 'fundamentos': preguntas,
 'criterios_texto': 'Desaprueba si no comprueba la indemnidad del balón (paso 18), si omite el consentimiento (6), el lavado de manos (13), los guantes estériles (14) o el registro (30).',
}
json.dump(data, open('data/acreditaciones/siam/sv.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
idx = [
 {'id': 'sv', 'titulo': 'Colocación de sonda vesical', 'icono': '🧪', 'pasos': 30, 'estado': 'activo'},
 {'id': 'tr', 'titulo': 'Tacto rectal', 'icono': '🖐️', 'pasos': 25, 'estado': 'proximamente'},
 {'id': 'iet', 'titulo': 'Intubación endotraqueal', 'icono': '🫁', 'pasos': 26, 'estado': 'proximamente'},
 {'id': 'rcp', 'titulo': 'RCP avanzado', 'icono': '❤️‍🔥', 'pasos': 24, 'estado': 'proximamente'},
 {'id': 'artro', 'titulo': 'Artrocentesis', 'icono': '🦵', 'pasos': 45, 'estado': 'proximamente'},
 {'id': 'tc', 'titulo': 'TC de cráneo', 'icono': '🧠', 'pasos': 27, 'estado': 'proximamente'},
 {'id': 'rmn', 'titulo': 'RMN cerebral', 'icono': '🧲', 'pasos': 14, 'estado': 'proximamente'},
 {'id': 'rxo', 'titulo': 'Rx de esqueleto óseo', 'icono': '🦴', 'pasos': 16, 'estado': 'proximamente'},
 {'id': 'ue', 'titulo': 'Urograma excretor', 'icono': '💧', 'pasos': 15, 'estado': 'proximamente'},
]
json.dump({'area': 'siam', 'nombre': 'S.I.A.M.', 'acreditaciones': idx}, open('data/acreditaciones/siam/index.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('ok', len(pasos))
