# Renders vectoriales de los insumos del shock room (reanimación cardiopulmonar avanzada).
import os
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
OUT = 'assets/instrumental'

def svg(name, w, h, body, defs=''):
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
         f'<defs>{defs}<filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="3"/></filter>'
         '<linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".5" stop-color="#dff1f7" stop-opacity=".7"/><stop offset="1" stop-color="#b9dbe8" stop-opacity=".85"/></linearGradient>'
         '<linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7f9"/><stop offset=".35" stop-color="#b8c2ca"/><stop offset=".6" stop-color="#eef2f4"/><stop offset="1" stop-color="#8d99a3"/></linearGradient>'
         '<linearGradient id="steelv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7f9"/><stop offset=".45" stop-color="#aeb9c2"/><stop offset="1" stop-color="#6b7782"/></linearGradient>'
         f'</defs>{body}</svg>')
    open(f'{OUT}/{name}.svg', 'w', encoding='utf8').write(s)

def sombra(cx, cy, rx, ry=7): return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#0b1b24" opacity=".35" filter="url(#sh)"/>'
def txt(x, y, t, size=9, fill='#0f172a', weight=700, anchor='middle', extra=''): return f'<text x="{x}" y="{y}" font-family="Plus Jakarta Sans,Arial,sans-serif" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}" {extra}>{t}</text>'
def etiqueta(x, y, w, l1, l2, color='#0d9488'):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="26" rx="4" fill="#fff"/><rect x="{x}" y="{y}" width="{w}" height="8" rx="4" fill="{color}"/>'
            + txt(x + w / 2, y + 7, l1, 5.4, '#fff', 800) + txt(x + w / 2, y + 17, l2[0], 6.6, '#0f172a', 800) + txt(x + w / 2, y + 24, l2[1], 5, '#475569', 600))

# ---------------------------------------------------------------- ampollas
def ampolla(name, l1, l2, l3, banda, liquido='#eaf6fb'):
    d = f'<linearGradient id="liq" x1="0" x2="1"><stop offset="0" stop-color="{liquido}"/><stop offset="1" stop-color="#cfe9f3"/></linearGradient>'
    b = (sombra(70, 196, 36) +
         '<path d="M62 18 C62 8 78 8 78 18 L78 52 C78 62 98 70 98 92 L98 176 C98 188 90 194 70 194 C50 194 42 188 42 176 L42 92 C42 70 62 62 62 52 Z" fill="url(#glass)" stroke="#9cc7d8" stroke-width="1.2"/>'
         '<path d="M46 110 L46 176 C46 186 54 190 70 190 C86 190 94 186 94 176 L94 110 Z" fill="url(#liq)" opacity=".75"/>'
         f'<rect x="43" y="104" width="54" height="62" rx="3" fill="#fff"/><rect x="43" y="104" width="54" height="11" rx="3" fill="{banda}"/>' +
         txt(70, 113, l1, 6.2, '#fff', 800) + txt(70, 128, l2[0], 6.6, '#0f172a', 800) + txt(70, 139, l2[1], 7.2, '#0f172a', 800) +
         txt(70, 152, l3, 6.5, '#475569', 600) + txt(70, 161, 'Estéril · Uso EV', 5.4, '#64748b', 500) +
         '<path d="M50 74 C48 120 48 160 52 184" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".8" fill="none"/><circle cx="70" cy="22" r="4" fill="#fff" opacity=".7"/>')
    svg(name, 140, 205, b, d)

ampolla('adrenalina', 'ADRENALINA', ('EPINEFRINA', '1 mg/mL'), '1 mL · EV/IO', '#dc2626', '#fff1f2')
ampolla('amiodarona', 'ANTIARRÍTMICO', ('AMIODARONA', '150 mg'), '3 mL · EV', '#7c3aed', '#f5f3ff')
ampolla('atropina', 'ANTICOLINÉRGICO', ('ATROPINA', '1 mg/mL'), '1 mL · EV', '#0f766e', '#ecfeff')

# ---------------------------------------------------------------- bicarbonato (frasco)
d = '<linearGradient id="liq" x1="0" x2="1"><stop offset="0" stop-color="#dbeafe"/><stop offset="1" stop-color="#93c5fd"/></linearGradient>'
b = (sombra(75, 204, 44) + '<rect x="58" y="12" width="34" height="22" rx="5" fill="#475569"/>'
     '<path d="M52 56 C52 46 62 46 62 48 L88 48 C88 46 98 46 98 56 L110 70 L110 190 C110 202 102 206 75 206 C48 206 40 202 40 190 L40 70 Z" fill="url(#glass)" stroke="#9cc7d8" stroke-width="1.2"/>'
     '<path d="M43 84 L107 84 L107 190 C107 198 100 202 75 202 C50 202 43 198 43 190 Z" fill="url(#liq)" opacity=".85"/>'
     '<rect x="41" y="100" width="68" height="76" rx="4" fill="#fff"/><rect x="41" y="100" width="68" height="15" rx="4" fill="#2563eb"/>' +
     txt(75, 111, 'SOLUCIÓN', 7.2, '#fff', 800) + txt(75, 132, 'BICARBONATO', 8.6, '#0f172a', 800) + txt(75, 144, 'de sodio 8,4 %', 7.6, '#0f172a', 800) + txt(75, 160, '10 mL · EV', 6.4, '#475569', 600))
svg('bicarbonato', 150, 216, b, d)

# ---------------------------------------------------------------- desfibrilador
b = (sombra(130, 156, 100, 9) +
     '<rect x="30" y="36" width="150" height="108" rx="14" fill="#f1f5f9" stroke="#64748b" stroke-width="1.6"/><rect x="30" y="36" width="150" height="26" rx="14" fill="#fbbf24"/>'
     '<rect x="42" y="68" width="92" height="56" rx="6" fill="#0b1220"/><path d="M48 98 L62 98 L66 88 L72 112 L78 94 L84 98 L92 98 L97 80 L104 108 L110 98 L128 98" stroke="#4ade80" stroke-width="1.6" fill="none"/>' +
     txt(112, 82, '200 J', 9, '#fde68a', 800) +
     '<circle cx="154" cy="82" r="13" fill="#dc2626" stroke="#7f1d1d" stroke-width="2"/>' + txt(154, 86, '⚡', 12, '#fff', 800) +
     '<rect x="142" y="104" width="30" height="14" rx="4" fill="#16a34a"/>' + txt(157, 114, 'CARGA', 6.2, '#fff', 800) +
     '<rect x="132" y="22" width="22" height="16" rx="5" fill="#94a3b8"/>'
     '<path d="M184 70 C206 70 214 96 218 126" stroke="#111827" stroke-width="3.4" fill="none"/><rect x="206" y="120" width="30" height="40" rx="7" fill="url(#steelv)" stroke="#64748b"/><rect x="210" y="124" width="22" height="9" rx="3" fill="#fbbf24"/>' +
     etiqueta(34, 8, 94, 'DESFIBRILADOR', ('Bifásico con palas', 'Monitor y carga'), '#b91c1c'))
svg('desfibrilador', 250, 168, b)

# ---------------------------------------------------------------- carro de paro
b = (sombra(100, 168, 74, 8) +
     '<rect x="34" y="22" width="132" height="132" rx="10" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.6"/><rect x="34" y="22" width="132" height="20" rx="10" fill="#ef4444"/>' +
     txt(100, 36, 'CARRO DE PARO', 9.4, '#fff', 800) +
     ''.join(f'<rect x="44" y="{50 + i * 25}" width="112" height="20" rx="4" fill="#fef2f2" stroke="#fca5a5"/><rect x="88" y="{57 + i * 25}" width="24" height="6" rx="3" fill="#7f1d1d"/>' for i in range(4)) +
     '<circle cx="52" cy="162" r="9" fill="#1f2937"/><circle cx="148" cy="162" r="9" fill="#1f2937"/><rect x="42" y="152" width="116" height="6" rx="3" fill="#7f1d1d"/>'
     '<path d="M166 40 C186 40 188 70 188 90" stroke="#374151" stroke-width="5" fill="none" stroke-linecap="round"/>' + txt(100, 18, '✚', 14, '#dc2626', 800))
svg('carro_paro', 200, 178, b)

# ---------------------------------------------------------------- tabla rígida (dorsal)
b = (sombra(110, 110, 90, 7) +
     '<path d="M20 48 L184 36 L200 54 L200 78 L20 86 Z" fill="#facc15" stroke="#a16207" stroke-width="1.6"/><path d="M20 48 L184 36 L200 54 L36 66 Z" fill="#fde047" stroke="#a16207"/>' +
     ''.join(f'<ellipse cx="{50 + i * 34}" cy="{66 - i * 2}" rx="7" ry="3.4" fill="#a16207" opacity=".7"/>' for i in range(5)) +
     etiqueta(52, 82, 112, 'TABLA RÍGIDA', ('Dorsal para compresiones', 'Superficie firme'), '#a16207'))
svg('tabla_rigida', 220, 122, b)

# ---------------------------------------------------------------- vía venosa (solución + equipo + catéter)
b = (sombra(100, 160, 70, 8) +
     '<path d="M52 18 L108 18 L116 36 L116 108 C116 118 108 124 80 124 C52 124 44 118 44 108 L44 36 Z" fill="url(#glass)" stroke="#9cc7d8" stroke-width="1.4"/><rect x="62" y="8" width="36" height="12" rx="4" fill="#94a3b8"/>'
     '<path d="M47 66 L113 66 L113 108 C113 116 106 120 80 120 C54 120 47 116 47 108 Z" fill="#bae6fd" opacity=".8"/>' + txt(80, 56, 'SOL. FISIOLÓGICA', 6.4, '#0f172a', 800) + txt(80, 88, 'NaCl 0,9 %', 8, '#0369a1', 800) + txt(80, 100, '500 mL', 7, '#475569', 700) +
     '<path d="M80 124 L80 138 C80 150 110 150 140 146" stroke="#38bdf8" stroke-width="3" fill="none"/><rect x="72" y="130" width="16" height="12" rx="3" fill="#e0f2fe" stroke="#0284c7"/>'
     '<path d="M140 146 L176 140" stroke="#fb923c" stroke-width="5" stroke-linecap="round"/><rect x="170" y="134" width="20" height="14" rx="4" fill="#fb923c" stroke="#c2410c"/>' + txt(100, 174, 'VÍA PERIFÉRICA · CATÉTER 18 G', 6.4, '#0f172a', 800))
svg('via_ev', 200, 184, b)

# ---------------------------------------------------------------- kit de vía aérea
b = (sombra(110, 130, 90, 8) +
     '<rect x="16" y="26" width="188" height="100" rx="10" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.4"/><rect x="16" y="26" width="188" height="18" rx="10" fill="#0284c7"/>' + txt(110, 39, 'KIT DE VÍA AÉREA', 9, '#fff', 800) +
     '<rect x="30" y="58" width="60" height="14" rx="6" fill="url(#steelv)" stroke="#64748b"/><path d="M84 60 C98 58 108 54 114 48 C116 56 112 64 100 70 L84 72 Z" fill="url(#steel)" stroke="#64748b"/><circle cx="110" cy="52" r="3" fill="#fde68a"/>'
     '<path d="M32 98 C70 86 120 96 160 112" stroke="#7dd3fc" stroke-width="8" fill="none" stroke-linecap="round"/><ellipse cx="136" cy="104" rx="10" ry="6" transform="rotate(26 136 104)" fill="#38bdf8" opacity=".7"/><rect x="24" y="92" width="14" height="14" rx="3" fill="#2563eb"/>' +
     txt(110, 120, 'Laringoscopio · tubo · jeringa · guía', 6, '#075985', 700))
svg('kit_via_aerea', 220, 140, b)
print('ok')
