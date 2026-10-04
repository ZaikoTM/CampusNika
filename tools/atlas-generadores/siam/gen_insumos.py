# Genera renders vectoriales detallados (gradientes, brillos, sombras y rótulos) de los insumos de la mesa de sondaje.
import os, json
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
OUT = 'assets/instrumental'
os.makedirs(OUT, exist_ok=True)

def svg(name, w, h, body, defs=''):
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
         f'<defs>{defs}<filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="3"/></filter>'
         '<linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".5" stop-color="#dff1f7" stop-opacity=".7"/><stop offset="1" stop-color="#b9dbe8" stop-opacity=".85"/></linearGradient>'
         '<linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7f9"/><stop offset=".35" stop-color="#b8c2ca"/><stop offset=".6" stop-color="#eef2f4"/><stop offset="1" stop-color="#8d99a3"/></linearGradient>'
         '<linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e4ebef"/></linearGradient>'
         '<linearGradient id="film" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9f6fb" stop-opacity=".85"/><stop offset="1" stop-color="#c5e3ef" stop-opacity=".7"/></linearGradient>'
         f'</defs>{body}</svg>')
    open(f'{OUT}/{name}.svg', 'w', encoding='utf8').write(s)

def sombra(cx, cy, rx, ry=7):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#0b1b24" opacity=".35" filter="url(#sh)"/>'

def txt(x, y, t, size=9, fill='#0f172a', weight=700, anchor='middle', extra=''):
    return f'<text x="{x}" y="{y}" font-family="Plus Jakarta Sans,Arial,sans-serif" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}" {extra}>{t}</text>'

# ---------------------------------------------------------------- ampollas
def ampolla(name, l1, l2, l3, banda, liquido='#eaf6fb'):
    d = (f'<linearGradient id="liq" x1="0" x2="1"><stop offset="0" stop-color="{liquido}"/><stop offset="1" stop-color="#cfe9f3"/></linearGradient>')
    b = (sombra(70, 196, 36) +
         '<path d="M62 18 C62 8 78 8 78 18 L78 52 C78 62 98 70 98 92 L98 176 C98 188 90 194 70 194 C50 194 42 188 42 176 L42 92 C42 70 62 62 62 52 Z" fill="url(#glass)" stroke="#9cc7d8" stroke-width="1.2"/>'
         '<path d="M46 110 L46 176 C46 186 54 190 70 190 C86 190 94 186 94 176 L94 110 Z" fill="url(#liq)" opacity=".75"/>'
         f'<rect x="43" y="104" width="54" height="62" rx="3" fill="#fff"/><rect x="43" y="104" width="54" height="11" rx="3" fill="{banda}"/>' +
         txt(70, 113, l1, 6.2, '#fff', 800) + txt(70, 128, l2[0], 6.6, '#0f172a', 800) + txt(70, 139, l2[1], 7.2, '#0f172a', 800) +
         txt(70, 152, l3, 6.5, '#475569', 600) + txt(70, 161, 'Estéril · Apirógena', 5.4, '#64748b', 500) +
         '<path d="M50 74 C48 120 48 160 52 184" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".8" fill="none"/>'
         '<circle cx="70" cy="22" r="4" fill="#fff" opacity=".7"/>')
    svg(name, 140, 205, b, d)

ampolla('agua', 'AGUA', ('BIDESTILADA', 'ESTÉRIL'), '10 mL · Uso parenteral', '#0d9488')
ampolla('suero', 'SOLUCIÓN', ('FISIOLÓGICA', 'NaCl 0,9 %'), '10 mL · Uso parenteral', '#2563eb', '#e8f1fb')

# ---------------------------------------------------------------- frascos
def frasco(name, color_liq, color_tapa, l1, l2, l3, w=150, banda='#f97316'):
    d = (f'<linearGradient id="liq" x1="0" x2="1"><stop offset="0" stop-color="{color_liq}"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>'
         f'<linearGradient id="tapa" x1="0" x2="1"><stop offset="0" stop-color="{color_tapa}"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".35"/><stop offset="1" stop-color="{color_tapa}"/></linearGradient>')
    b = (sombra(75, 210, 48) +
         '<rect x="60" y="14" width="30" height="22" rx="4" fill="url(#tapa)" stroke="#00000030"/>'
         '<rect x="62" y="36" width="26" height="12" fill="url(#glass)"/>'
         '<path d="M52 56 C52 46 62 46 62 48 L88 48 C88 46 98 46 98 56 L110 70 L110 196 C110 206 102 210 75 210 C48 210 40 206 40 196 L40 70 Z" fill="url(#glass)" stroke="#9cc7d8" stroke-width="1.2"/>'
         '<path d="M43 84 L107 84 L107 196 C107 204 100 207 75 207 C50 207 43 204 43 196 Z" fill="url(#liq)" opacity=".85"/>'
         f'<rect x="41" y="104" width="68" height="76" rx="4" fill="#fff"/><rect x="41" y="104" width="68" height="15" rx="4" fill="{banda}"/>' +
         txt(75, 115, l1, 7.4, '#fff', 800) + txt(75, 136, l2[0], 10, '#0f172a', 800) + txt(75, 148, l2[1], 8.4, '#0f172a', 800) + txt(75, 163, l3, 6.4, '#475569', 600) + txt(75, 173, 'Uso externo', 5.6, '#64748b', 500) +
         '<path d="M47 92 C45 130 45 170 49 196" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55" fill="none"/>')
    svg(name, w, 222, b, d)

frasco('iodo', '#8a4b0f', '#ea580c', 'ANTISÉPTICO', ('IODOPOVIDONA', 'jabonosa 10 %'), '250 mL', banda='#c2410c')
frasco('alcohol', '#dcecf4', '#2563eb', 'ANTISÉPTICO', ('ALCOHOL', 'etílico 70 %'), '250 mL', banda='#1d4ed8')

# ---------------------------------------------------------------- vaselina
b = (sombra(80, 138, 54, 8) +
     '<rect x="30" y="40" width="100" height="92" rx="12" fill="url(#glass)" stroke="#9cc7d8"/>'
     '<rect x="34" y="62" width="92" height="66" rx="8" fill="#fff6dc" opacity=".95"/>'
     '<rect x="26" y="20" width="108" height="28" rx="8" fill="#e5e7eb" stroke="#94a3b8"/><rect x="26" y="20" width="108" height="9" rx="6" fill="#ffffff" opacity=".7"/>'
     '<rect x="38" y="72" width="84" height="44" rx="5" fill="#fff"/><rect x="38" y="72" width="84" height="11" rx="5" fill="#0ea5e9"/>' +
     txt(80, 80.5, 'VASELINA', 7.4, '#fff', 800) + txt(80, 98, 'Pomada', 10, '#0f172a', 800) + txt(80, 109, 'Uso general · 100 g', 6, '#475569', 600) +
     '<path d="M36 52 C35 80 35 100 38 124" stroke="#fff" stroke-width="3" opacity=".6" fill="none"/>')
svg('vaselina', 160, 148, b)

# ---------------------------------------------------------------- jeringas
def jeringa(name, ml, rotulo, liquido, aguja=False, delgada=False, w=250):
    grosor = 14 if delgada else 26
    y0 = 60 - grosor / 2
    ticks = ''.join(f'<line x1="{70 + i * 11}" y1="{y0}" x2="{70 + i * 11}" y2="{y0 + (grosor * (.55 if i % 2 else .8))}" stroke="#1e293b" stroke-width=".8"/>' for i in range(0, 12))
    d = (f'<linearGradient id="liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{liquido}" stop-opacity=".75"/><stop offset="1" stop-color="{liquido}"/></linearGradient>'
         '<linearGradient id="cil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#e3f1f7" stop-opacity=".8"/><stop offset="1" stop-color="#b6d6e4" stop-opacity=".9"/></linearGradient>')
    needle = ('<rect x="210" y="58" width="36" height="2.4" fill="#cbd5e1"/><rect x="198" y="52" width="14" height="14" rx="3" fill="#f59e0b"/>' if aguja else '')
    b = ('<g transform="rotate(-14 125 60)">' + sombra(125, 100, 100, 5) +
         f'<rect x="40" y="{60 - 3}" width="40" height="6" fill="#cbd5e1"/><rect x="32" y="{60 - 15}" width="9" height="30" rx="3" fill="#94a3b8"/>'
         f'<rect x="72" y="{y0}" width="132" height="{grosor}" rx="3" fill="url(#cil)" stroke="#8fb3c4"/>'
         f'<rect x="73" y="{y0 + 2}" width="108" height="{grosor - 4}" rx="2" fill="url(#liq)"/>'
         f'<rect x="72" y="{60 - 2}" width="12" height="4" fill="#475569"/><rect x="70" y="{y0 - 2}" width="6" height="{grosor + 4}" rx="2" fill="#334155"/>' + ticks +
         f'<rect x="204" y="{60 - 4}" width="10" height="8" fill="#e2e8f0" stroke="#94a3b8"/>' + needle +
         f'<rect x="196" y="{y0 - 3}" width="6" height="{grosor + 6}" rx="2" fill="#e2e8f0" stroke="#94a3b8"/></g>' +
         txt(125, 124, rotulo, 9.5, '#0f172a', 800) + txt(125, 136, ml, 7.6, '#475569', 600))
    svg(name, w, 146, b, d)

jeringa('jeringa10', '10 mL · Luer · sin aguja', 'JERINGA ESTÉRIL 10 mL', '#e8f4fa')
jeringa('jeringa_gel', 'Lidocaína gel 2 % · pico Luer', 'LIDOCAÍNA GEL 2 %', '#7dd3fc')
jeringa('jeringa_ins', '1 mL · aguja fija', 'JERINGA INSULINA 1 mL', '#e8f4fa', aguja=True, delgada=True)

# ---------------------------------------------------------------- aguja
b = (sombra(105, 112, 80, 5) + '<g transform="rotate(-10 105 60)"><rect x="40" y="57" width="130" height="2.6" fill="#cbd5e1"/><polygon points="170,57 184,58.3 170,59.6" fill="#94a3b8"/>'
     '<path d="M24 46 L44 50 L44 70 L24 74 Z" fill="#f59e0b" stroke="#b45309"/><rect x="14" y="44" width="12" height="32" rx="3" fill="#fbbf24" stroke="#b45309"/></g>' +
     txt(105, 100, 'AGUJA 21 G × 1½"', 9.5, '#0f172a', 800) + txt(105, 112, 'Descartable · estéril', 7.4, '#475569', 600))
svg('aguja', 210, 120, b)

# ---------------------------------------------------------------- sondas en su empaque
def pouch(name, titulo, sub, extra_texto, catetero, w=250, h=150):
    b = (sombra(125, h - 8, 100, 6) +
         '<rect x="10" y="12" width="230" height="118" rx="8" fill="url(#paper)" stroke="#b6c4cc"/>'
         '<rect x="10" y="12" width="230" height="118" rx="8" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>'
         '<rect x="10" y="12" width="76" height="118" rx="8" fill="#f1f6f9"/>'
         '<rect x="86" y="18" width="148" height="106" rx="5" fill="url(#film)" stroke="#a7cddc"/>'
         + catetero +
         '<rect x="10" y="12" width="76" height="22" rx="8" fill="#0d9488"/>' + txt(48, 27, titulo, 6.4, '#fff', 800) +
         txt(48, 54, sub[0], 11, '#0f172a', 800) + txt(48, 68, sub[1], 5.6, '#0f172a', 700) +
         txt(48, 84, extra_texto[0], 6.4, '#475569', 600) + txt(48, 94, extra_texto[1], 6.4, '#475569', 600) +
         '<rect x="22" y="102" width="52" height="16" rx="3" fill="#fff" stroke="#cbd5e1"/>' + ''.join(f'<rect x="{25 + i * 2.4}" y="105" width="{1 + (i % 3) * .6}" height="10" fill="#0f172a"/>' for i in range(0, 20)) +
         '<path d="M214 14 L238 14 L238 38 Z" fill="#cde4ee" opacity=".7"/>')
    svg(name, w, h, b)

foley = ('<path d="M104 70 C104 40 150 38 170 52 C196 70 150 92 128 90 C108 88 112 112 150 108 C190 104 220 96 224 78" stroke="#f0c36a" stroke-width="6" fill="none" stroke-linecap="round"/>'
         '<path d="M104 70 C104 40 150 38 170 52 C196 70 150 92 128 90 C108 88 112 112 150 108 C190 104 220 96 224 78" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>'
         '<ellipse cx="224" cy="78" rx="6" ry="3" fill="#f59e0b"/><rect x="92" y="63" width="14" height="14" rx="3" fill="#2dd4bf" stroke="#0f766e"/><rect x="92" y="74" width="14" height="4" fill="#3b82f6"/>'
         '<ellipse cx="205" cy="94" rx="9" ry="5" fill="#fde68a" stroke="#d97706"/>')
pouch('sonda_f', 'SONDA FOLEY', ('14 Fr', '2 vías · látex siliconado'), ('Balón 10 mL', 'ESTÉRIL · de un solo uso'), foley)
pouch('sonda_m', 'SONDA FOLEY', ('16 Fr', '2 vías · látex siliconado'), ('Balón 10 mL', 'ESTÉRIL · de un solo uso'), foley)
foley3 = foley + '<rect x="92" y="52" width="14" height="10" rx="3" fill="#ef4444" stroke="#991b1b"/>'
pouch('sonda_3v', 'SONDA FOLEY', ('22 Fr', '3 vías · irrigación'), ('Balón 30 mL', 'ESTÉRIL · de un solo uso'), foley3)
nel = ('<path d="M104 70 C140 70 170 66 224 66" stroke="#f3d9a8" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M104 70 C140 70 170 66 224 66" stroke="#fff" stroke-width="1.5" opacity=".7" fill="none"/>'
       '<path d="M96 60 L112 66 L112 74 L96 80 Z" fill="#a3e635" stroke="#4d7c0f"/><ellipse cx="224" cy="66" rx="5" ry="3" fill="#e5c58a"/>')
pouch('nelaton', 'SONDA NÉLATON', ('12 Fr', 'Recta · sin balón'), ('Evacuadora', 'ESTÉRIL · de un solo uso'), nel)
sng = ('<path d="M104 90 C130 100 160 40 190 60 C210 74 180 104 156 98" stroke="#7dd3fc" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M104 90 C130 100 160 40 190 60 C210 74 180 104 156 98" stroke="#fff" stroke-width="1.4" opacity=".7" fill="none"/>'
       '<rect x="92" y="82" width="16" height="16" rx="3" fill="#fb923c" stroke="#9a3412"/>')
pouch('sng', 'SONDA NASOGÁSTRICA', ('16 Fr', 'Vía digestiva · 120 cm'), ('Con conector', 'ESTÉRIL · de un solo uso'), sng)

# ---------------------------------------------------------------- bolsa colectora
b = (sombra(95, 226, 62, 8) +
     '<path d="M40 56 L150 56 L160 214 C160 222 150 226 95 226 C40 226 30 222 30 214 Z" fill="url(#film)" stroke="#8fb9cb" stroke-width="1.5"/>'
     '<path d="M44 150 L146 150 L154 212 C154 218 146 221 95 221 C44 221 36 218 36 212 Z" fill="#fde68a" opacity=".55"/>'
     + ''.join(f'<line x1="{44 + (j % 2) * 6}" y1="{74 + j * 22}" x2="{82 + (j % 2) * 2}" y2="{74 + j * 22}" stroke="#0f172a" stroke-width="1"/>' + txt(120, 77 + j * 22, str(2000 - j * 400 if j else 2000), 7, '#334155', 700) for j in range(0, 6)) +
     '<rect x="52" y="30" width="86" height="30" rx="6" fill="#f1f5f9" stroke="#94a3b8"/><circle cx="70" cy="45" r="5" fill="#cbd5e1"/><circle cx="120" cy="45" r="5" fill="#cbd5e1"/>'
     '<path d="M95 56 L95 44 C95 28 70 20 60 8" stroke="#0ea5e9" stroke-width="4" fill="none"/><path d="M95 56 L95 44 C95 28 70 20 60 8" stroke="#fff" stroke-width="1" opacity=".6" fill="none"/>'
     '<rect x="52" y="0" width="16" height="14" rx="3" fill="#2dd4bf" stroke="#0f766e"/>'
     '<rect x="132" y="196" width="22" height="28" rx="4" fill="#e2e8f0" stroke="#94a3b8"/><rect x="80" y="104" width="30" height="34" rx="3" fill="#fff" opacity=".9"/>' +
     txt(95, 118, 'BOLSA', 7.5, '#0f172a', 800) + txt(95, 128, 'COLECTORA', 7, '#0f172a', 800) + txt(95, 138, '2000 mL', 6.5, '#0d9488', 700) +
     '<path d="M44 66 C42 120 42 170 46 212" stroke="#fff" stroke-width="3" opacity=".6" fill="none" stroke-linecap="round"/>')
svg('bolsa', 190, 236, b)

# ---------------------------------------------------------------- guantes
b = (sombra(100, 128, 76, 8) +
     '<path d="M24 52 L176 52 L184 124 L16 124 Z" fill="#38bdf8" stroke="#0369a1"/><path d="M24 52 L176 52 L168 40 L32 40 Z" fill="#7dd3fc" stroke="#0369a1"/>'
     '<rect x="60" y="58" width="80" height="26" rx="13" fill="#0f172a" opacity=".85"/><rect x="30" y="92" width="140" height="26" rx="4" fill="#fff"/>' +
     txt(100, 74, '↓ sacar un guante ↓', 6.5, '#7dd3fc', 600) + txt(100, 104, 'GUANTES DE EXAMEN', 10.5, '#0f172a', 800) + txt(100, 114, 'NO ESTÉRILES · talle M · 100 u.', 6.8, '#475569', 600) +
     '<path d="M82 48 C78 24 90 16 98 24 C106 12 118 22 112 48" fill="#bae6fd" stroke="#0369a1" stroke-width=".8"/>')
svg('guantes_ns', 200, 138, b)
b = (sombra(80, 152, 56, 7) +
     '<rect x="20" y="14" width="120" height="132" rx="6" fill="url(#paper)" stroke="#b6c4cc"/><rect x="20" y="14" width="120" height="30" rx="6" fill="#0d9488"/>' +
     txt(80, 33, 'GUANTES', 11, '#fff', 800) + txt(80, 62, 'ESTÉRILES', 10, '#0f172a', 800) + txt(80, 74, 'Talle 7½', 8.6, '#0f172a', 700) + txt(80, 86, 'Cirugía · látex libre de polvo', 6, '#475569', 600) +
     '<path d="M44 96 L116 96 L116 134 L44 134 Z" fill="#f1f5f9" stroke="#cbd5e1"/><path d="M52 104 C52 98 60 98 60 104 L60 126 M64 100 C64 94 72 94 72 100 L72 126 M76 98 C76 92 84 92 84 98 L84 126 M88 100 C88 94 96 94 96 100 L96 126" stroke="#94a3b8" fill="none" stroke-width="1.6"/>'
     '<path d="M118 14 L140 14 L140 36 Z" fill="#cde4ee" opacity=".8"/><circle cx="130" cy="130" r="9" fill="#0d9488"/>' + txt(130, 133, 'E', 9, '#fff', 800))
svg('guantes_e', 160, 160, b)

# ---------------------------------------------------------------- gasas
b = (sombra(90, 118, 66, 7) +
     '<rect x="20" y="18" width="140" height="94" rx="7" fill="url(#paper)" stroke="#b6c4cc"/><rect x="20" y="18" width="140" height="26" rx="7" fill="#0ea5e9"/>' +
     txt(90, 36, 'GASAS ESTÉRILES', 10, '#fff', 800) + txt(90, 62, '10 × 10 cm', 11, '#0f172a', 800) + txt(90, 75, '8 capas · 100 % algodón', 6.8, '#475569', 600) + txt(90, 87, 'Paquete x 20 unidades', 6.8, '#475569', 600) +
     '<rect x="38" y="94" width="104" height="10" rx="2" fill="#fff" stroke="#cbd5e1"/>' + ''.join(f'<rect x="{42 + i * 2.6}" y="96" width="{1 + (i % 3) * .5}" height="6" fill="#0f172a"/>' for i in range(0, 36)) +
     '<path d="M140 18 L160 18 L160 38 Z" fill="#cde4ee" opacity=".8"/>')
svg('gasas', 180, 128, b)

# ---------------------------------------------------------------- paños
b = (sombra(90, 126, 70, 8) +
     '<path d="M16 40 L150 24 L174 98 L40 118 Z" fill="#0f766e" stroke="#064e3b"/><path d="M16 40 L150 24 L174 98 L40 118 Z" fill="none" stroke="#fff" stroke-width="1" opacity=".25"/>'
     '<path d="M34 54 L140 40" stroke="#14b8a6" stroke-width="1.2"/><path d="M42 74 L156 58" stroke="#14b8a6" stroke-width="1.2"/>'
     '<ellipse cx="96" cy="72" rx="24" ry="17" fill="#134e4a" stroke="#042f2e" transform="rotate(-8 96 72)"/><ellipse cx="96" cy="72" rx="24" ry="17" fill="none" stroke="#5eead4" stroke-width="1" transform="rotate(-8 96 72)" opacity=".6"/>'
     '<rect x="62" y="96" width="70" height="20" rx="4" fill="#fff" transform="rotate(-8 97 106)"/>' +
     txt(98, 108, 'CAMPO FENESTRADO ESTÉRIL', 6.1, '#0f172a', 800, extra='transform="rotate(-8 98 106)"') + txt(98, 117, '75 × 90 cm', 5.6, '#475569', 600, extra='transform="rotate(-8 98 116)"'))
svg('pano_e', 190, 140, b)
b = (sombra(90, 124, 66, 7) +
     '<path d="M14 88 L150 78 L158 106 L24 118 Z" fill="#cfe8f3" stroke="#7ea9be"/><path d="M20 70 L152 60 L160 88 L28 100 Z" fill="#e0f1f8" stroke="#7ea9be"/><path d="M22 52 L154 42 L162 70 L30 82 Z" fill="#f2f9fc" stroke="#7ea9be"/>'
     '<rect x="52" y="86" width="76" height="22" rx="4" fill="#fff" transform="rotate(-5 90 97)"/>' +
     txt(90, 98, 'PAÑOS CLÍNICOS', 7.6, '#0f172a', 800, extra='transform="rotate(-5 90 98)"') + txt(90, 107, 'No estériles · x 2', 6, '#475569', 600, extra='transform="rotate(-5 90 106)"'))
svg('panos_ns', 180, 134, b)

# ---------------------------------------------------------------- riñonera
b = (sombra(100, 112, 80, 8) +
     '<path d="M16 40 C40 24 90 20 140 28 C176 34 190 52 176 70 C164 84 130 88 90 90 C54 92 24 84 16 66 C12 56 12 48 16 40 Z" fill="url(#steel)" stroke="#6b7a85" stroke-width="1.4"/>'
     '<path d="M30 46 C54 34 96 32 138 38 C162 42 170 52 160 62 C150 72 120 74 88 76 C58 78 36 72 30 62 C27 56 27 51 30 46 Z" fill="#c4ced6" stroke="#9aa7b1"/>'
     '<path d="M40 48 C70 40 110 40 144 46" stroke="#fff" stroke-width="3" opacity=".7" fill="none" stroke-linecap="round"/>' +
     txt(98, 108, 'RIÑONERA ESTÉRIL', 8.4, '#0f172a', 800))
svg('rinonera', 200, 124, b)

# ---------------------------------------------------------------- cinta
b = (sombra(80, 112, 54, 7) +
     '<ellipse cx="80" cy="64" rx="56" ry="44" fill="#e9d7b8" stroke="#a88b56"/><ellipse cx="80" cy="64" rx="40" ry="30" fill="#f6ecd6" stroke="#c9b27f"/><ellipse cx="80" cy="64" rx="22" ry="16" fill="#ffffff" stroke="#c9b27f"/><ellipse cx="80" cy="64" rx="14" ry="10" fill="#d6dde2"/>'
     '<path d="M24 76 C30 108 130 108 136 76 L136 86 C130 118 30 118 24 86 Z" fill="#d9c59b" stroke="#a88b56"/>'
     '<path d="M120 90 C150 96 160 100 172 98 L170 110 C156 112 144 106 118 100 Z" fill="#f2e7cf" stroke="#c9b27f"/>'
     '<rect x="52" y="52" width="56" height="24" rx="4" fill="#fff" opacity=".95"/>' + txt(80, 63, 'CINTA', 8, '#0f172a', 800) + txt(80, 72, 'HIPOALERGÉNICA', 6, '#0d9488', 800) +
     '<path d="M36 44 C44 30 62 22 80 22" stroke="#fff" stroke-width="3" opacity=".7" fill="none"/>')
svg('cinta', 180, 130, b)
print(sorted(os.listdir(OUT)))

# variantes de silicona (alergia al látex)
pouch('sonda_f_sil', 'SONDA FOLEY', ('14 Fr', '2 vías · SILICONA'), ('Libre de látex', 'ESTÉRIL · de un solo uso'), foley.replace('#f0c36a', '#d7e4ea'))
pouch('sonda_m_sil', 'SONDA FOLEY', ('16 Fr', '2 vías · SILICONA'), ('Libre de látex', 'ESTÉRIL · de un solo uso'), foley.replace('#f0c36a', '#d7e4ea'))
