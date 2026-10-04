# Renders vectoriales de los insumos de la mesa de intubación endotraqueal (mismo estilo que los de sondaje).
import os
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
OUT = 'assets/instrumental'

def svg(name, w, h, body, defs=''):
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
         f'<defs>{defs}<filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="3"/></filter>'
         '<linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".5" stop-color="#dff1f7" stop-opacity=".7"/><stop offset="1" stop-color="#b9dbe8" stop-opacity=".85"/></linearGradient>'
         '<linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7f9"/><stop offset=".35" stop-color="#b8c2ca"/><stop offset=".6" stop-color="#eef2f4"/><stop offset="1" stop-color="#8d99a3"/></linearGradient>'
         '<linearGradient id="steelv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7f9"/><stop offset=".45" stop-color="#aeb9c2"/><stop offset="1" stop-color="#6b7782"/></linearGradient>'
         '<linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e4ebef"/></linearGradient>'
         '<radialGradient id="luz"><stop offset="0" stop-color="#fffbe0"/><stop offset=".4" stop-color="#fde68a" stop-opacity=".9"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient>'
         f'</defs>{body}</svg>')
    open(f'{OUT}/{name}.svg', 'w', encoding='utf8').write(s)

def sombra(cx, cy, rx, ry=7): return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#0b1b24" opacity=".35" filter="url(#sh)"/>'
def txt(x, y, t, size=9, fill='#0f172a', weight=700, anchor='middle', extra=''): return f'<text x="{x}" y="{y}" font-family="Plus Jakarta Sans,Arial,sans-serif" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}" {extra}>{t}</text>'
def etiqueta(x, y, w, l1, l2, color='#0d9488'):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="26" rx="4" fill="#fff"/><rect x="{x}" y="{y}" width="{w}" height="8" rx="4" fill="{color}"/>'
            + txt(x + w / 2, y + 7, l1, 5.4, '#fff', 800) + txt(x + w / 2, y + 17, l2[0], 6.6, '#0f172a', 800) + txt(x + w / 2, y + 24, l2[1], 5, '#475569', 600))

# ------------------------------------------------------------ laringoscopio con hoja curva
def laringo(name, hoja, l2, recta=False):
    mango = ('<rect x="18" y="78" width="112" height="26" rx="12" fill="url(#steelv)" stroke="#64748b" stroke-width="1"/>'
             + ''.join(f'<rect x="{30 + i * 8}" y="80" width="3" height="22" fill="#1f2937" opacity=".35"/>' for i in range(12))
             + '<rect x="12" y="82" width="12" height="18" rx="5" fill="#334155"/>')
    bisagra = '<rect x="124" y="74" width="16" height="34" rx="5" fill="url(#steelv)" stroke="#64748b"/><circle cx="132" cy="91" r="3" fill="#475569"/>'
    if recta:
        h = '<path d="M140 80 L200 76 L206 82 L200 90 L140 100 Z" fill="url(#steel)" stroke="#64748b" stroke-width="1"/>'
        tip = (206, 83)
    else:
        h = '<path d="M140 78 C166 76 190 68 208 50 C214 58 212 72 196 86 C180 98 160 102 140 102 Z" fill="url(#steel)" stroke="#64748b" stroke-width="1"/>'
        tip = (205, 58)
    luz = (f'<circle cx="{tip[0]-3}" cy="{tip[1]+4}" r="16" fill="url(#luz)"/><circle cx="{tip[0]-3}" cy="{tip[1]+4}" r="3.2" fill="#fffde7"/>')
    body = sombra(112, 124, 96) + mango + bisagra + h + luz + etiqueta(40, 48, 74, 'LARINGOSCOPIO', (hoja, l2), '#0f766e')
    svg(name, 224, 136, body)

laringo('laringoscopio', 'Hoja curva Macintosh', 'N.º 3 · adulto · luz LED')
laringo('hoja_miller0', 'Hoja recta Miller', 'N.º 0 · neonatal', recta=True)

# ------------------------------------------------------------ tubos endotraqueales
def tet(name, mm, l2, cuff=True, banda='#0d9488'):
    cuerpo = ('<path d="M44 66 C80 60 120 62 160 76 C182 84 196 98 200 112 L194 114 C186 104 172 92 156 86 C120 72 82 72 44 78 Z" fill="url(#glass)" stroke="#8fb5c6" stroke-width="1.2"/>'
              '<path d="M200 112 L194 114 L190 108 L196 106 Z" fill="#d7e9f0" stroke="#8fb5c6"/>'
              '<line x1="60" y1="64" x2="60" y2="80" stroke="#0f172a" stroke-width=".9"/>'
              + ''.join(f'<line x1="{100 + i * 14}" y1="{64 + i * 3}" x2="{100 + i * 14}" y2="{74 + i * 3.5}" stroke="#0f172a" stroke-width=".8"/>' for i in range(5)))
    conector = '<rect x="14" y="62" width="34" height="20" rx="5" fill="#2563eb" stroke="#1d4ed8"/><rect x="8" y="66" width="10" height="12" rx="3" fill="#ffffff" stroke="#94a3b8"/>'
    balon = ''
    if cuff:
        balon = ('<ellipse cx="170" cy="94" rx="15" ry="9" transform="rotate(34 170 94)" fill="#38bdf8" opacity=".55" stroke="#0284c7"/>'
                 '<path d="M110 78 C110 104 80 112 62 118" stroke="#38bdf8" stroke-width="2" fill="none"/>'
                 '<ellipse cx="58" cy="122" rx="8" ry="5" fill="#38bdf8" stroke="#0284c7"/><rect x="46" y="125" width="9" height="12" rx="2" fill="#ffffff" stroke="#94a3b8"/>')
    body = sombra(110, 142, 92) + conector + cuerpo + balon + etiqueta(124, 30, 78, 'TUBO ENDOTRAQUEAL', (mm, l2), banda)
    svg(name, 220, 150, body)

tet('tet_f', '7,5 mm ID', 'Con balón · mujer', True)
tet('tet_m', '8,5 mm ID', 'Con balón · varón', True)
tet('tet_ped', '4,0 mm', 'Sin balón · pediátrico', False, '#d97706')

# ------------------------------------------------------------ bolsa de ambú con máscara
body = (sombra(104, 130, 84) +
        '<ellipse cx="108" cy="78" rx="46" ry="34" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.6"/><ellipse cx="96" cy="66" rx="24" ry="12" fill="#ffffff" opacity=".6"/>'
        '<rect x="148" y="66" width="26" height="24" rx="6" fill="#0284c7"/><rect x="170" y="70" width="14" height="16" rx="3" fill="#bae6fd" stroke="#0284c7"/>'
        '<path d="M184 74 C206 66 218 80 210 96 L186 88 Z" fill="#fde68a" stroke="#b45309"/>'
        '<path d="M184 78 L214 64" stroke="#0f172a" stroke-width="0"/>'
        '<rect x="48" y="62" width="14" height="32" rx="5" fill="#0284c7"/><path d="M48 70 C20 60 12 94 34 108 C44 114 52 104 52 100" fill="#ecfeff" stroke="#0284c7" stroke-width="1.6" opacity=".9"/>'
        '<path d="M186 90 C190 112 212 118 222 104" fill="none" stroke="#38bdf8" stroke-width="3"/>' +
        etiqueta(66, 100, 84, 'BOLSA DE AMBÚ', ('Con máscara', 'Reservorio de O₂ · adulto'), '#0369a1'))
svg('ambu', 232, 140, body)

# ------------------------------------------------------------ fuente de oxígeno
body = (sombra(80, 158, 40) +
        '<rect x="46" y="48" width="68" height="104" rx="22" fill="#16a34a" stroke="#166534"/><rect x="62" y="32" width="36" height="22" rx="6" fill="url(#steelv)" stroke="#64748b"/>'
        '<rect x="50" y="62" width="14" height="80" rx="7" fill="#ffffff" opacity=".35"/>'
        '<circle cx="80" cy="22" r="17" fill="#f8fafc" stroke="#475569" stroke-width="2"/><path d="M80 22 L90 14" stroke="#dc2626" stroke-width="2.4"/>'
        '<rect x="104" y="36" width="34" height="16" rx="5" fill="url(#steelv)" stroke="#64748b"/><path d="M134 44 C150 44 150 70 150 78" stroke="#16a34a" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        txt(80, 100, 'O₂', 22, '#ffffff', 800) + txt(80, 118, 'OXÍGENO', 7.4, '#dcfce7', 800) + txt(80, 129, 'MEDICINAL', 5.6, '#dcfce7', 600))
svg('oxigeno', 160, 166, body)

# ------------------------------------------------------------ saturómetro
body = (sombra(100, 112, 64) +
        '<path d="M26 56 C26 34 42 30 60 30 L150 30 C170 30 178 44 178 60 L178 84 C178 100 166 104 150 104 L60 104 C40 104 26 98 26 80 Z" fill="#e5e7eb" stroke="#94a3b8" stroke-width="1.4"/>'
        '<rect x="46" y="42" width="84" height="40" rx="6" fill="#0f172a"/>' + txt(88, 69, '98 %', 24, '#4ade80', 800) + txt(88, 78, 'SpO₂', 6, '#86efac', 700) +
        '<path d="M52 52 L60 52 L63 46 L67 58 L71 50 L76 52 L84 52" stroke="#f87171" stroke-width="1.4" fill="none"/>'
        '<rect x="140" y="46" width="30" height="34" rx="14" fill="#fecaca" stroke="#f87171" opacity=".9"/><circle cx="155" cy="63" r="4" fill="#ef4444"/>' +
        etiqueta(46, 84, 84, 'PULSIOXÍMETRO', ('De dedo', 'Saturometría continua'), '#b91c1c'))
svg('saturometro', 204, 120, body)

# ------------------------------------------------------------ estetoscopio
body = (sombra(104, 134, 62) +
        '<path d="M60 14 C58 40 70 62 104 62 C138 62 150 40 148 14" fill="none" stroke="#111827" stroke-width="5" stroke-linecap="round"/>'
        '<path d="M104 62 L104 96" stroke="#111827" stroke-width="5"/><circle cx="104" cy="112" r="20" fill="url(#steel)" stroke="#64748b" stroke-width="2"/><circle cx="104" cy="112" r="12" fill="#e2e8f0" stroke="#94a3b8"/>'
        '<circle cx="60" cy="12" r="6" fill="#94a3b8"/><circle cx="148" cy="12" r="6" fill="#94a3b8"/>' +
        txt(104, 148, 'ESTETOSCOPIO', 8, '#0f172a', 800))
svg('estetoscopio', 208, 156, body)

# ------------------------------------------------------------ kit de ropa estéril
body = (sombra(100, 124, 76) +
        '<path d="M24 50 L176 50 L184 120 L16 120 Z" fill="#4ade80" stroke="#15803d"/><path d="M24 50 L176 50 L168 38 L32 38 Z" fill="#86efac" stroke="#15803d"/>'
        '<rect x="30" y="58" width="140" height="56" rx="4" fill="#fff"/>' + txt(100, 76, 'ROPA ESTÉRIL', 12, '#0f172a', 800) + txt(100, 90, 'Camisolín · cofia · antiparras', 7, '#334155', 700) + txt(100, 102, 'Barbijo · guantes · botas', 6.4, '#475569', 600) +
        '<rect x="66" y="42" width="68" height="10" rx="3" fill="#15803d" opacity=".5"/>')
svg('kit_esteril', 200, 134, body)

# ------------------------------------------------------------ cánula orofaríngea (Guedel)
body = (sombra(100, 112, 54) +
        '<path d="M34 40 C34 28 60 26 86 40 C118 58 150 82 160 98 C166 108 150 110 140 102 C112 84 92 70 70 62 C48 56 34 52 34 40 Z" fill="#f97316" stroke="#c2410c" stroke-width="1.6"/>'
        '<ellipse cx="46" cy="42" rx="14" ry="18" fill="#fb923c" stroke="#c2410c" transform="rotate(-18 46 42)"/><ellipse cx="46" cy="42" rx="6" ry="10" fill="#7c2d12" transform="rotate(-18 46 42)"/>'
        '<path d="M70 54 C100 62 124 82 142 98" stroke="#fed7aa" stroke-width="2.4" fill="none" opacity=".7"/>' +
        etiqueta(104, 20, 78, 'CÁNULA DE GUEDEL', ('Orofaríngea', 'N.º 4 · adulto'), '#c2410c'))
svg('guedel', 204, 124, body)

# ------------------------------------------------------------ aspirador con cánula de Yankauer
body = (sombra(100, 120, 70) +
        '<path d="M170 28 C170 14 150 14 140 30 L112 90 C104 106 84 112 54 108" fill="none" stroke="#60a5fa" stroke-width="9" stroke-linecap="round" opacity=".85"/>'
        '<path d="M170 28 C170 14 150 14 140 30 L112 90 C104 106 84 112 54 108" fill="none" stroke="#dbeafe" stroke-width="3" stroke-linecap="round"/>'
        '<rect x="168" y="14" width="22" height="34" rx="10" fill="#e0f2fe" stroke="#0284c7"/><circle cx="179" cy="22" r="3" fill="#0284c7"/><rect x="40" y="100" width="24" height="16" rx="4" fill="#475569"/>' +
        etiqueta(12, 20, 92, 'ASPIRADOR', ('Cánula de Yankauer', 'Succión rígida'), '#1d4ed8'))
svg('aspirador', 204, 132, body)
print('ok')

# ------------------------------------------------------------ mandril (guía) estéril
body = (sombra(100, 100, 70) +
        '<rect x="20" y="62" width="150" height="6" rx="3" fill="url(#steelv)" stroke="#64748b"/>'
        '<path d="M170 62 C196 54 198 84 176 82" fill="none" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>'
        '<path d="M20 65 C10 65 10 56 22 56" fill="none" stroke="#94a3b8" stroke-width="3"/>' +
        etiqueta(40, 76, 92, 'MANDRIL', ('Guía maleable', 'Estéril · uso intratubo'), '#475569'))
svg('mandril', 210, 116, body)
