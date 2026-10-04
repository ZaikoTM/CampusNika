import json, os
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
OUT = 'data/acreditaciones/siam/'
J = lambda p: json.load(open(p, encoding='utf8'))
W = lambda p, d: json.dump(d, open(p, 'w', encoding='utf8', newline=''), ensure_ascii=False, indent=1)

# =====================================================================  INSTRUMENTAL
S = J(OUT + 'instrumental_sv.json'); byid = {i['id']: i for i in S['items']}
def b(i, **kw):
    o = dict(byid[i]); [o.pop(k, None) for k in ('sexo', 'solo_alergia', 'latex', 'feedback_latex', 'feedback', 'falta', 'critico', 'correcto', 'ficha')]; o.update(kw); return o
def nuevo(id, grupo, nombre, detalle, correcto, critico, descripcion, ficha, img=None, **kw):
    o = dict(id=id, grupo=grupo, nombre=nombre, detalle=detalle, img=img or f'assets/instrumental/{id}.svg', correcto=correcto, critico=critico, descripcion=descripcion, ficha=ficha); o.update(kw); return o
items = [
 b('guantes_ns', grupo='otros', nombre='Guantes de examen', detalle='Par · precaución estándar', correcto=True, critico=True, descripcion='Precaución estándar frente a sangre y fluidos antes de tocar al paciente.', falta='Faltan los guantes: la precaución estándar es obligatoria.', ficha=[['Tipo', 'Examen, no estériles']]),
 nuevo('desfibrilador', 'desf', 'Desfibrilador bifásico con palas', 'Monitor, carga y descarga', True, True, 'Para descargar ante FV o TV sin pulso: se selecciona la energía (120–200 J bifásico), se carga y se descarga con todos fuera.', [['Tipo', 'Bifásico'], ['Energía', '120–200 J'], ['Batería', 'Cargada']], falta='Falta el desfibrilador: sin él no se puede tratar la FV ni la TV sin pulso.'),
 nuevo('carro_paro', 'med', 'Carro de paro', 'Medicación y material de emergencia', True, True, 'Reúne la medicación de la reanimación (adrenalina, amiodarona) y el material de emergencia.', [['Contenido', 'Medicación y accesos'], ['Precinto', 'Intacto']], falta='Falta el carro de paro con la medicación de la reanimación.'),
 nuevo('adrenalina', 'med', 'Adrenalina 1 mg/mL', 'Ampolla de 1 mL', True, True, 'Fármaco de la reanimación: 1 mg EV/IO cada 3 a 5 minutos, en ritmos desfibrilables (tras la 2.ª descarga) y no desfibrilables.', [['Concentración', '1 mg/mL'], ['Vencimiento', '08/2028'], ['Lote', 'AD-30581']], falta='Falta la adrenalina: es el fármaco central de la reanimación.'),
 nuevo('amiodarona', 'med', 'Amiodarona 150 mg', 'Ampolla de 3 mL', True, False, 'Antiarrítmico para la FV/TV sin pulso refractaria: 300 mg EV tras el tercer choque. Es opcional en los demás casos.', [['Concentración', '50 mg/mL'], ['Vencimiento', '03/2029']], opcional=True),
 nuevo('via_ev', 'med', 'Equipo de vía periférica y solución fisiológica', 'Catéter 18 G + solución de 500 mL', True, True, 'Acceso venoso para la medicación: vía periférica (o intraósea) y solución salina para el lavado.', [['Catéter', '18 G'], ['Solución', 'NaCl 0,9 % 500 mL']], falta='Falta el material para la vía periférica: sin acceso no se puede administrar medicación.'),
 nuevo('ambu', 'aereo', 'Bolsa de ambú con máscara y reservorio', 'Adulto · con oxígeno', True, True, 'Ventilación durante la reanimación: 30:2 con ayudante o 10 por minuto con vía aérea avanzada.', [['Volumen', 'Adulto 1600 mL'], ['Reservorio', 'Sí']], falta='Falta la bolsa de ambú con máscara.'),
 nuevo('oxigeno', 'aereo', 'Fuente de oxígeno', 'Con caudalímetro', True, True, 'Oxígeno al 100 % para la ventilación durante la reanimación.', [['Gas', 'Oxígeno medicinal'], ['Flujo', '10–15 L/min']], falta='Falta la fuente de oxígeno.'),
 nuevo('kit_via_aerea', 'aereo', 'Kit de vía aérea avanzada', 'Laringoscopio, tubo, jeringa y guía', True, False, 'Para asegurar la vía aérea sin interrumpir las compresiones, si se decide hacerlo.', [['Contenido', 'Laringoscopio · TET · jeringa · guía']], falta='Falta el kit de vía aérea que se indica preparar a enfermería.'),
 nuevo('tabla_rigida', 'otros', 'Tabla rígida (dorsal)', 'Superficie firme', True, False, 'Una superficie firme bajo el tórax mejora la efectividad de las compresiones. Es opcional.', [['Material', 'Plástico rígido']], opcional=True),
 b('sonda_m', grupo='otros', nombre='Sonda vesical y bolsa', detalle='Sondaje vesical indicado a enfermería', correcto=True, critico=False, opcional=True, descripcion='El sondaje vesical figura entre las indicaciones a enfermería. Es opcional en el material.', ficha=[['Tipo', 'Foley']]),
 nuevo('atropina', 'med', 'Atropina 1 mg/mL', 'Ampolla de 1 mL', False, False, 'Anticolinérgico.', [['Concentración', '1 mg/mL']], feedback='La atropina ya no se recomienda en la asistolia ni en la AESP: corresponde adrenalina.'),
 nuevo('bicarbonato', 'med', 'Bicarbonato de sodio 8,4 %', 'Frasco de 10 mL', False, False, 'Alcalinizante.', [['Concentración', '8,4 %']], feedback='El bicarbonato de sodio no se usa de rutina en la reanimación; solo en causas específicas (hiperpotasemia, acidosis grave, intoxicaciones).'),
 b('alcohol', grupo='otros', correcto=False, critico=False, feedback='El alcohol no se usa en este procedimiento.'),
 b('iodo', grupo='otros', correcto=False, critico=False, feedback='La iodopovidona no se usa en este procedimiento.'),
 b('aguja', grupo='otros', correcto=False, critico=False, feedback='Una aguja suelta no sirve para la reanimación: el acceso es un catéter venoso o intraóseo.'),
 b('sng', grupo='otros', correcto=False, critico=False, feedback='La sonda nasogástrica no forma parte del material de la reanimación inicial.'),
]
INS = dict(id='rcp', titulo='Carro de paro y sala de reanimación · RCP avanzado',
 consigna='Leé el caso clínico y reuní lo que hace falta en el shock room: monitoreo, desfibrilación, vía aérea, accesos y medicación. Pasá el cursor (o tocá) cada insumo para inspeccionarlo; arrastralo a la bandeja o hacé clic para agregarlo.',
 caso_sub='indicación de reanimación cardiopulmonar avanzada', indicacion_def='Reanimación cardiopulmonar avanzada.',
 mision=['qué equipo y qué medicación hacen falta para la reanimación;', 'qué insumos no corresponden en un paro cardíaco.'],
 demo_caso='Primero se lee el caso clínico: el ritmo del monitor va a definir si se descarga o se da adrenalina.',
 grupos=[dict(id='desf', titulo='Desfibrilación'), dict(id='aereo', titulo='Vía aérea y oxigenación'), dict(id='med', titulo='Medicación y accesos'), dict(id='otros', titulo='Otros insumos')],
 items=items, bandeja_img='assets/instrumental/bandeja.svg')
W(OUT + 'instrumental_rcp.json', INS)

# =====================================================================  MODELO 3D
M = J(OUT + 'sv_modelo.json')
glb = lambda id, carpeta, f, capa, color, op, hs, nom, peso, **kw: dict(id=id, tipo='glb', src=f'assets/anatomia/{carpeta}/{f}.glb', escala=100, rot=[0, 0, 0], pos=[0, 0, 0], capa=capa, color=color, opacidad=op, hs=hs, nombre=nom, peso=peso, **kw)
piezas = [
 glb('piel', 'iet', 'piel', 'piel', '#d8a387', 0.28, None, 'Cuerpo del paciente', 140448, piel_real=True),
 glb('costillas', 'rcp', 'costillas', 'huesos', '#e8e1cf', 0.8, None, 'Costillas', 256772),
 glb('clavicula', 'rcp', 'clavicula', 'huesos', '#e8e1cf', 0.8, None, 'Clavículas', 9464),
 glb('esternon', 'rcp', 'esternon', 'huesos', '#f3ecd8', 0.95, 'esternon', 'Esternón y cartílagos costales', 247632, anim='esternon'),
 glb('corazon', 'rcp', 'corazon', 'organos', '#d6453b', 0.92, 'corazon', 'Corazón', 153028, anim='corazon'),
 glb('pulmones', 'iet', 'pulmones', 'organos', '#f4a9a8', 0.35, 'pulmones', 'Pulmones', 52968),
 glb('traquea', 'iet', 'traquea', 'organos', '#ffb4a2', 0.5, None, 'Tráquea', 21868),
]
MON = ('<div class="mon" aria-hidden="false"><div class="mon-top"><span class="mon-t">MONITOR MULTIPARAMÉTRICO</span><span class="mon-alarma">ALARMA</span><button type="button" class="mon-juego" title="Practicá el ritmo de las compresiones" aria-label="Practicar el ritmo">🎯</button><button type="button" class="mon-metro" title="Metrónomo de las compresiones" aria-label="Metrónomo">🥁</button><button type="button" class="mon-mute" title="Silenciar la alarma" aria-label="Silenciar la alarma">🔕</button></div>'
 '<canvas class="mon-ecg" width="640" height="110"></canvas>'
 '<div class="mon-num"><div class="mon-fc"><small>FC lpm</small><b>--</b></div><div class="mon-spo2"><small>SpO₂ %</small><b>--</b></div><div class="mon-pa"><small>PA mmHg</small><b>--/--</b></div><div class="mon-co2"><small>EtCO₂ mmHg</small><b>--</b></div></div></div>')
DEFI = '<div class="defi" data-est="apagado"><div class="defi-tit">⚡ DESFIBRILADOR</div><div class="defi-est">EN ESPERA</div><div class="defi-barra"><i></i></div><div class="defi-j">BIFÁSICO · 200 J</div></div>'
DOCK = '<div class="mon-dock">' + MON + DEFI + '</div>'
OVERLAY = ('<div class="cron"><small>CICLO DE 2 MIN</small><b>--:--</b></div>'
 '<div class="rcp-hud" data-on="0"><b>110</b> /min · <b>5–6</b> cm · <span class="rcp-cnt">0/30</span></div>')
VAR = dict(
 origen=[0, 129.0, 6.0], corte_x=0.0, rotacion=[-1.5707963, 3.1415927, 0], piezas=piezas, procedurales={},
 compresion=dict(sitio=[0, 128.3, 14.4], brazos=24, profundidad=4.5, frecuencia=110, manos=dict(src='assets/anatomia/rcp/manos_rcp.glb', escala=0.09, rot=[-90,0,0], pos=[0,0,4.5])),
 ventila=dict(mascara=[0, 153.0, 10.0], bolsa_tet=[0, 156.4, 20.5], cuello_bolsa=[[0, 156.4, 18.0], [0, 156.4, 19.4]]),
 pines=dict(paciente=[0, 142, 6], torax=[0, 131, 11], xifoides=[0, 123.2, 10.6], esternon=[0, 128.5, 13.2], corazon=[4, 129, 3], pulmones=[10, 127, 0], mano=[0, 128.3, 18]),
 camara=dict(lat=[56, 5, 0], fro=[0, 8, 56], sup=[0.01, 60, 0], objetivo=[0, 3, 0], ini=[40, 26, 22]),
 etiquetas=dict(paciente=[0, -50], torax=[-120, -40], xifoides=[-130, 40], esternon=[110, -50], corazon=[120, 40], pulmones=[-60, 90], mano=[110, -90]),
)
G = dict(M['general']); G['vistas'] = dict(fro='Cabecera'); G['camara'] = dict(M['general']['camara'], foco=30, min=8)
IM = dict(
 general=G, overlay_html=OVERLAY, dock_html=DOCK,
 tarjetas=dict(
  mesa=dict(titulo='🏥 Shock room', id='mesa', items=[['monitor', '📟', 'Monitor', 'multiparamétrico'], ['desfibrilador', '⚡', 'Desfibrilador', ''], ['carro', '🧰', 'Carro de paro', ''], ['oxigeno', '🫁', 'Oxígeno y', 'vía aérea'], ['guantes', '🧤', 'Guantes', '']]),
  entorno=dict(titulo='👥 Equipo y entorno', items=[['equipo', '👥', 'Equipo', 'de trabajo'], ['reloj', '⏱️', 'Cronómetro', ''], ['familia', '🫂', 'Familiar', 'o acompañante'], ['hc', '📋', 'Historia clínica', '']])),
 chips=[['guantes', 'Guantes'], ['ritmo', 'Ritmo leído'], ['conc', 'Respuesta evaluada'], ['voz', 'Inicio anunciado'], ['rcp', 'Compresiones'], ['carga', 'Desfibrilador cargado'], ['descarga', 'Descarga'], ['adre', 'Adrenalina'], ['relevo', 'Relevo'], ['rosc', 'Retorno de la circulación'], ['muerte', 'Hora de la muerte'], ['reg', 'Registrado']],
 usables=['monitor', 'desfibrilador', 'carro', 'oxigeno', 'guantes', 'equipo', 'reloj', 'familia', 'hc'],
 pines=[dict(id='paciente', label='Paciente', capa='piel', externo=True), dict(id='torax', label='Tórax', capa='piel', externo=True), dict(id='xifoides', label='Apéndice xifoides', capa='huesos'),
        dict(id='esternon', label='Esternón: sitio de compresión', capa='huesos'), dict(id='corazon', label='Corazón', capa='organos'), dict(id='pulmones', label='Pulmones', capa='organos'),
        dict(id='mano', label='Manos del reanimador', capa='sonda', solo_con='instrumento')],
 instrumentos=[dict(id='compresion', tipo='compresion', clases=dict(mano='s-talon', rcp='s-rcp', rosc='s-rosc', muerte='s-muerte')), dict(id='ventila', tipo='ventila', clases=dict(mascara='s-nada', laringo='s-nada', bolsa_tet='s-nada'))],
 M=VAR, F=VAR)
W(OUT + 'rcp_modelo.json', IM)

IX = J(OUT + 'index.json')
for a in IX['acreditaciones']:
    if a['id'] == 'rcp': a['estado'] = 'activo'; a['pasos'] = 24
W(OUT + 'index.json', IX)
print('ok')
