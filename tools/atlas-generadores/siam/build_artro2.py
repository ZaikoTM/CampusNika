import json, os
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
OUT = 'data/acreditaciones/siam/'
J = lambda p: json.load(open(p, encoding='utf8'))
W = lambda p, d: json.dump(d, open(p, 'w', encoding='utf8', newline=''), ensure_ascii=False, indent=1)

# =====================================================================  INSTRUMENTAL
S = J(OUT + 'instrumental_sv.json'); byid = {i['id']: i for i in S['items']}
def b(i, **kw):
    o = dict(byid[i]); [o.pop(k, None) for k in ('sexo', 'solo_alergia', 'latex', 'feedback_latex', 'feedback', 'falta', 'critico', 'correcto', 'ficha', 'opcional', 'uno_de')]; o.update(kw); return o
def nuevo(id, grupo, nombre, detalle, correcto, critico, descripcion, ficha, img=None, **kw):
    o = dict(id=id, grupo=grupo, nombre=nombre, detalle=detalle, img=img or f'assets/instrumental/{id}.svg', correcto=correcto, critico=critico, descripcion=descripcion, ficha=ficha); o.update(kw); return o
items = [
 nuevo('consentimiento', 'cierre', 'Consentimiento informado', 'Formulario para firmar', True, True, 'El paciente firma luego de comprender el procedimiento, sus beneficios y sus riesgos. Es un requisito ético y legal.', [['Documento', 'Consentimiento informado']], falta='Falta el consentimiento informado: sin él no se puede punzar.'),
 nuevo('tensiometro', 'cierre', 'Tensiómetro y brazalete', 'Aneroide · adulto', True, True, 'Para medir la presión arterial antes de comenzar y constatar la estabilidad hemodinámica.', [['Tipo', 'Aneroide'], ['Brazalete', 'Adulto']], falta='Falta el tensiómetro: la presión arterial previa es un paso crítico.'),
 b('alcohol', grupo='asep', nombre='Alcohol etílico al 70 %', detalle='Frasco con gasas o algodón', correcto=True, critico=True, uno_de='antisepsia', descripcion='Antiséptico aceptado para la primera y la segunda antisepsia de la piel (alcohol 70 % o iodopovidona).', falta='Falta un antiséptico: se necesita alcohol al 70 % o iodopovidona para las dos antisepsias.', ficha=[['Concentración', '70 % v/v'], ['Vencimiento', '06/2028']]),
 b('iodo', grupo='asep', nombre='Iodopovidona', detalle='Solución antiséptica al 10 %', correcto=True, critico=True, uno_de='antisepsia', descripcion='Antiséptico aceptado para las dos antisepsias, del centro hacia afuera. Alternativa al alcohol al 70 %.', falta='Falta un antiséptico: se necesita alcohol al 70 % o iodopovidona para las dos antisepsias.', ficha=[['Concentración', '10 %'], ['Vencimiento', '03/2029']]),
 b('gasas', grupo='asep', nombre='Gasas estériles', detalle='Sobre de gasas 10 × 10 cm', correcto=True, critico=True, descripcion='Para las antisepsias, la hemostasia del sitio de punción y el apósito.', falta='Faltan las gasas estériles para la antisepsia y la hemostasia.', ficha=[['Tamaño', '10 × 10 cm'], ['Estéril', 'Sí']]),
 nuevo('pano_fenestrado', 'asep', 'Paño fenestrado estéril', 'Con ventana central', True, True, 'Delimita el campo estéril y deja una ventana sobre el sitio de punción.', [['Tipo', 'Fenestrado'], ['Estéril', 'Sí']], falta='Falta el paño fenestrado estéril: delimita el campo para punzar.'),
 b('guantes_e', grupo='asep', nombre='Guantes estériles', detalle='Par de látex · talle a elección', correcto=True, critico=True, uno_de='guantes', descripcion='Guantes con técnica aséptica para tocar el campo estéril y punzar.', falta='Faltan los guantes: se colocan luego del lavado de manos.', ficha=[['Material', 'Látex'], ['Estéril', 'Sí']]),
 b('guantes_ns', grupo='asep', nombre='Guantes de examen', detalle='Caja de guantes', correcto=True, critico=True, uno_de='guantes', descripcion='Guantes de examen; sirven para colocarse los guantes del procedimiento (manoplas).', falta='Faltan los guantes: se colocan luego del lavado de manos.', ficha=[['Material', 'Látex'], ['Estéril', 'No']]),
 nuevo('lidocaina', 'anest', 'Lidocaína al 1 % sin epinefrina', 'Frasco ampolla de 20 mL', True, True, 'Anestésico local para infiltrar por planos (0,25 cc por plano), siempre aspirando antes de inyectar.', [['Concentración', '1 %'], ['Vasoconstrictor', 'No'], ['Vencimiento', '09/2028']], falta='Falta la lidocaína al 1 % sin epinefrina para anestesiar.'),
 b('jeringa10', grupo='anest', nombre='Jeringa de 10 cc', detalle='Descartable · Luer', correcto=True, critico=True, descripcion='Para cargar 5 cc de lidocaína y anestesiar por planos.', falta='Falta la jeringa de 10 cc para la anestesia.', ficha=[['Volumen', '10 mL'], ['Estéril', 'Sí']]),
 nuevo('aguja25', 'anest', 'Aguja 25 G (0,5 × 25 mm)', 'Naranja · para la piel', True, False, 'Aguja fina para infiltrar el anestésico en la piel y los planos superficiales.', [['Calibre', '25 G'], ['Longitud', '25 mm']], opcional=True),
 nuevo('aguja21', 'punc', 'Aguja 21 G (0,8 × 40 mm)', 'Verde · para extraer líquido', True, True, 'Calibre estándar para extraer líquido sinovial de la rodilla del adulto: las agujas más finas se obstruyen con la viscosidad del líquido.', [['Calibre', '21 G'], ['Longitud', '40 mm']], falta='Falta la aguja 21 G (o 25 G) para extraer el líquido.'),
 nuevo('jeringa20', 'punc', 'Jeringa de 20 mL', 'Para derrames importantes', True, False, 'Con la llave de 3 vías permite evacuar derrames grandes sin retirar la aguja. Solo hace falta si el derrame es importante.', [['Volumen', '20 mL'], ['Conexión', 'Luer lock']], opcional=True),
 nuevo('llave3vias', 'punc', 'Llave de 3 vías', 'Estéril · Luer', True, False, 'Conecta la aguja, la jeringa grande y el frasco colector para evacuar el derrame sin soltar la aguja.', [['Vías', '3'], ['Estéril', 'Sí']], opcional=True),
 nuevo('frasco_colector', 'punc', 'Frasco colector plástico', '1000 mL', True, False, 'Recibe el líquido evacuado en los derrames abundantes.', [['Capacidad', '1000 mL']], opcional=True),
 nuevo('tubos_nohep', 'punc', 'Tubos estériles SIN heparina (2)', 'Gram/cultivo y cristales', True, True, 'Tubo 1: examen directo, Gram y cultivo con antibiograma. Tubo 2: examen directo para cristales con luz polarizada. La heparina interfiere con la microbiología.', [['Cantidad', '2'], ['Anticoagulante', 'Ninguno']], falta='Faltan los tubos estériles sin heparina para el cultivo y los cristales.'),
 nuevo('tubos_hep', 'punc', 'Tubos estériles CON heparina (1–2)', 'Recuento celular y fisicoquímico', True, True, 'Tubo 3: recuento celular total y fórmula diferencial. Tubo 4 (opcional): proteínas, glucosa y otros. La heparina evita que el líquido coagule.', [['Cantidad', '1 a 2'], ['Anticoagulante', 'Heparina']], falta='Faltan los tubos con heparina para el recuento celular.'),
 nuevo('rotulos', 'punc', 'Rótulos para las muestras', 'Etiquetas autoadhesivas', True, True, 'Cada tubo se rotula con nombre, DNI, articulación, fecha y hora, condición (con o sin heparina) y firma del médico.', [['Datos', 'Paciente · articulación · fecha · hora · firma']], falta='Faltan los rótulos: una muestra sin identificar no se procesa.'),
 nuevo('aposito', 'cierre', 'Apósito estéril', 'Adhesivo · 6 × 7 cm', True, True, 'Cubre el sitio de punción después de la hemostasia.', [['Tamaño', '6 × 7 cm'], ['Estéril', 'Sí']], falta='Falta el apósito estéril para cubrir el sitio de punción.'),
 b('cinta', grupo='cierre', nombre='Cinta hipoalergénica', detalle='Rollo de 2,5 cm', correcto=True, critico=False, descripcion='Fija el apósito sin irritar la piel.', ficha=[['Ancho', '2,5 cm'], ['Material', 'Hipoalergénica']]),
 nuevo('descartador', 'cierre', 'Descartador de cortopunzantes', 'Rígido, rojo', True, True, 'La aguja usada se descarta de inmediato en el descartador rígido, sin reencapuchar.', [['Tipo', 'Rígido'], ['Color', 'Rojo']], falta='Falta el descartador de cortopunzantes: la aguja no se reencapucha ni va a la bolsa.'),
 nuevo('bolsa_roja', 'cierre', 'Bolsa roja de residuos patogénicos', 'Para gasas, apósitos y guantes', True, False, 'Recibe el material contaminado que no es cortopunzante.', [['Color', 'Rojo']]),
 nuevo('lidocaina_epi', 'otros', 'Lidocaína al 1 % con epinefrina', 'Frasco ampolla de 20 mL', False, False, 'Anestésico con vasoconstrictor.', [['Concentración', '1 %'], ['Vasoconstrictor', 'Sí']], feedback='En la artrocentesis se usa lidocaína sin epinefrina.'),
 nuevo('corticoide', 'otros', 'Metilprednisolona 40 mg/mL', 'Corticoide depot', False, False, 'Corticoide intraarticular.', [['Dosis', '40 mg/mL']], feedback='No corresponde en una artrocentesis diagnóstica: primero se estudia el líquido y no se inyecta corticoide si se sospecha infección.'),
 nuevo('aguja18', 'otros', 'Aguja 18 G (1,2 × 40 mm)', 'Rosa · gran calibre', False, False, 'Aguja gruesa.', [['Calibre', '18 G']], feedback='Una aguja de gran calibre lesiona más los tejidos: corresponde 21 G (25 G para la piel).'),
 b('suero', grupo='otros', correcto=False, critico=False, feedback='El suero fisiológico no se usa en este procedimiento.'),
 b('rinonera', grupo='otros', correcto=False, critico=False, feedback='La riñonera no hace falta: los cortopunzantes van al descartador rígido.'),
 b('vaselina', grupo='otros', correcto=False, critico=False, feedback='La vaselina no se usa en este procedimiento.'),
]
INS = dict(id='artro', titulo='Mesa de transporte · Artrocentesis de rodilla',
 consigna='Leé el caso clínico y reuní lo que hace falta en la mesa de transporte: asepsia, anestesia, punción, muestras y cierre. Pasá el cursor (o tocá) cada insumo para inspeccionarlo; arrastralo a la bandeja o hacé clic para agregarlo.',
 caso_sub='indicación de artrocentesis de rodilla', indicacion_def='Artrocentesis de rodilla derecha.',
 mision=['qué hace falta para punzar y anestesiar con asepsia;', 'cómo se toman, se rotulan y se envían las muestras;', 'qué insumos no corresponden.'],
 demo_caso='Primero se lee el caso clínico: puede haber una contraindicación y el derrame puede ser grande o escaso.',
 grupos=[dict(id='asep', titulo='Asepsia y campo'), dict(id='anest', titulo='Anestesia'), dict(id='punc', titulo='Punción y muestras'), dict(id='cierre', titulo='Cierre y control'), dict(id='otros', titulo='Otros insumos')],
 items=items, bandeja_img='assets/instrumental/bandeja.svg')
W(OUT + 'instrumental_artro.json', INS)

# =====================================================================  MODELO 3D (rodilla derecha, paciente en decúbito dorsal)
M = J(OUT + 'sv_modelo.json')
glb = lambda id, f, capa, color, op, hs, nom, peso, **kw: dict(id=id, tipo='glb', src=f'assets/anatomia/artro/{f}.glb', escala=100, rot=[0, 0, 0], pos=[0, 0, 0], capa=capa, color=color, opacidad=op, hs=hs, nombre=nom, peso=peso, **kw)
piezas = [
 glb('piel', 'piel', 'piel', '#d8a387', 0.3, None, 'Pierna derecha', 92732, piel_real=True),
 glb('musculos', 'musculos', 'organos', '#c25a52', 0.32, 'cuadriceps', 'Cuádriceps', 32872),
 glb('capsula', 'capsula', 'organos', '#8fd3e8', 0.34, 'receso', 'Cápsula articular y receso suprarrotuliano', 28432),
 glb('ligamentos', 'ligamentos', 'organos', '#e8d9a8', 0.9, 'ligamentos', 'Ligamentos y tendones', 31356),
 glb('meniscos', 'meniscos', 'organos', '#6fb7d6', 0.9, 'meniscos', 'Meniscos', 4548),
 glb('femur', 'femur', 'huesos', '#efe7d1', 0.9, 'femur', 'Fémur', 8160),
 glb('tibia', 'tibia', 'huesos', '#efe7d1', 0.9, 'tibia', 'Tibia y peroné', 9188),
 glb('rotula', 'rotula', 'huesos', '#f6efdb', 0.96, 'rotula', 'Rótula', 2240),
]
OVERLAY = ('<div class="art-hud" data-on="0"><span>💧 Aspirado</span> <b class="art-ml">0</b> <small>mL</small></div>'
 '<div class="art-tubos" aria-hidden="true"><div class="art-rack">'
 '<div class="tb t1"><i class="cap"></i><i class="liq"></i><em class="rot">Rótulo</em><span title="Gram y cultivo">1</span></div>'
 '<div class="tb t2"><i class="cap"></i><i class="liq"></i><em class="rot">Rótulo</em><span title="Cristales">2</span></div>'
 '<div class="tb t3"><i class="cap"></i><i class="liq"></i><em class="rot">Rótulo</em><span title="Recuento celular">3</span></div>'
 '<div class="tb t4"><i class="cap"></i><i class="liq"></i><em class="rot">Rótulo</em><span title="Fisicoquímico">4</span></div></div>'
 '<div class="art-lab"><b>🔬 Laboratorio</b><small>Enviado</small></div></div>')
VAR = dict(
 origen=[-8.45, 44.45, 0.75], corte_x=0.0, rotacion=[-1.5707963, 3.1415927, 0], piezas=piezas, procedurales={},
 artro=dict(  # coordenadas en cm (marco del modelo: x lateral = negativo en la pierna derecha, y arriba, z anterior)
   entrada=[-13.7, 47.3, 1.45], dentro=[-9.0, 47.9, 1.2], derrame_centro=[-8.4, 49.2, 1.15], derrame_radios=[4.9, 6.2, 1.55],
   rotula=[-8.45, 44.45, 1.0], lateral_x=-13.9, largo_aguja=4.2),
 pines=dict(rodilla=[-8.45, 44.45, 5.9], sitio=[-13.9, 47.3, 1.45], rotula=[-8.45, 44.45, 1.9], receso=[-8.4, 50.5, 1.4], femur=[-8.2, 56.0, -0.6], tibia=[-6.6, 36.0, 0.3], cuadriceps=[-7.2, 58.0, 2.4]),
 camara=dict(lat=[54, 9, 0], fro=[3.5, 10, 54], sup=[3.5, 56, 0.01], objetivo=[3.5, 0, 0], ini=[12, 36, 13]),
 etiquetas=dict(rodilla=[-120, -40], sitio=[-130, 20], rotula=[120, -50], receso=[110, 30], femur=[-110, -70], tibia=[100, 70], cuadriceps=[110, -90]),
)
G = dict(M['general']); G['vistas'] = dict(fro='Frente'); G['camara'] = dict(M['general']['camara'], foco=22, min=8)
IM = dict(
 general=G, overlay_html=OVERLAY,
 tarjetas=dict(
  mesa=dict(titulo='🛒 Mesa de transporte', id='mesa', items=[['mesa', '🛒', 'Mesa de', 'transporte'], ['tensio', '🩺', 'Tensiómetro', ''], ['guantes', '🧤', 'Guantes', ''], ['campo', '🟦', 'Paño', 'fenestrado'], ['jeringa', '💉', 'Jeringa', 'y aguja'], ['tubos', '🧪', 'Tubos', 'estériles']]),
  entorno=dict(titulo='🏥 Entorno', items=[['ambiente', '🏥', 'Ambiente', ''], ['solicitud', '📋', 'Solicitud', 'médica'], ['paciente', '🧍', 'Paciente', ''], ['manos', '🫧', 'Lavado', 'de manos'], ['descarte', '🗑️', 'Descartador', ''], ['hc', '🗂️', 'Historia', 'clínica'], ['lab', '🔬', 'Laboratorio', '']])),
 chips=[['sitio', 'Sitio elegido'], ['a1', '1.ª antisepsia'], ['guantes', 'Guantes'], ['pano', 'Campo estéril'], ['a2', '2.ª antisepsia'], ['anest', 'Anestesia'], ['dentro', 'En la articulación'], ['aspira', 'Líquido obtenido'], ['apos', 'Apósito'], ['tubos', 'Muestras'], ['rotulo', 'Rotuladas'], ['envio', 'Enviadas'], ['reg', 'Registrado']],
 usables=['mesa', 'tensio', 'guantes', 'campo', 'jeringa', 'tubos', 'ambiente', 'solicitud', 'paciente', 'manos', 'descarte', 'hc', 'lab'],
 pines=[dict(id='rodilla', label='Rodilla derecha', capa='piel', externo=True), dict(id='sitio', label='Sitio de punción: supero-lateral', capa='piel', externo=True), dict(id='rotula', label='Rótula', capa='huesos'),
        dict(id='receso', label='Receso suprarrotuliano (derrame)', capa='organos'), dict(id='femur', label='Fémur', capa='huesos'), dict(id='tibia', label='Tibia', capa='huesos'), dict(id='cuadriceps', label='Cuádriceps', capa='organos')],
 instrumentos=[dict(id='artro', tipo='artro', clases=dict(sitio='s-sitio', a1='s-a1', pano='s-pano', a2='s-a2', anest='s-anest', espera='s-espera', aguja='s-aguja', punza='s-punza', dentro='s-dentro', aspira='s-aspira', evac='s-evac', llave='s-llave', vacio='s-vacio', retira='s-retira', apos='s-apos', contra='s-contra'))],
 M=VAR, F=VAR)
W(OUT + 'artro_modelo.json', IM)

IX = J(OUT + 'index.json')
for a in IX['acreditaciones']:
    if a['id'] == 'artro': a['estado'] = 'activo'; a['pasos'] = 45
W(OUT + 'index.json', IX)
print('ok', len(items), 'items')
