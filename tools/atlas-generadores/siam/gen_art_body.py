import math

def tubo(x, y, cap, liq, rot=0):
    return (f'<g transform="translate({x},{y}) rotate({rot})"><rect x="-9" y="0" width="18" height="86" rx="9" fill="url(#glass)" stroke="#9cc7d8" stroke-width="1.2"/>'
            f'<path d="M-7.6 40 L7.6 40 L7.6 76 C7.6 82 3 84 0 84 C-3 84 -7.6 82 -7.6 76 Z" fill="{liq}" opacity=".85"/>'
            f'<rect x="-10.4" y="-8" width="20.8" height="16" rx="4" fill="{cap}" stroke="#0f172a" stroke-opacity=".25"/><rect x="-6" y="-12" width="12" height="6" rx="2" fill="{cap}"/>'
            '<path d="M-5 12 L-5 70" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".75"/></g>')

def frasco(name, l1, l2, l3, banda, tapa='#7c3aed'):
    d = '<linearGradient id="liq" x1="0" x2="1"><stop offset="0" stop-color="#f1f5f9"/><stop offset="1" stop-color="#dbeafe"/></linearGradient>'
    b = (sombra(75, 204, 44) + f'<rect x="56" y="10" width="38" height="24" rx="5" fill="{tapa}"/><rect x="50" y="30" width="50" height="9" rx="3" fill="#cbd5e1"/>'
         '<path d="M54 40 L96 40 L110 64 L110 190 C110 202 102 206 75 206 C48 206 40 202 40 190 L40 64 Z" fill="url(#glass)" stroke="#9cc7d8" stroke-width="1.2"/>'
         '<path d="M43 84 L107 84 L107 190 C107 198 100 202 75 202 C50 202 43 198 43 190 Z" fill="url(#liq)" opacity=".85"/>'
         f'<rect x="41" y="92" width="68" height="84" rx="4" fill="#fff"/><rect x="41" y="92" width="68" height="14" rx="4" fill="{banda}"/>'
         + txt(75, 102, l1, 6.6, '#fff', 800) + txt(75, 126, l2[0], 10, '#0f172a', 800) + txt(75, 139, l2[1], 8.4, '#0f172a', 800)
         + txt(75, 154, l3[0], 6.6, '#475569', 700) + txt(75, 164, l3[1], 6.2, '#64748b', 600)
         + '<path d="M47 60 C45 110 45 160 49 190" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".8" fill="none"/>')
    svg(name, 150, 216, b, d)

frasco('lidocaina', 'ANESTÉSICO LOCAL', ('LIDOCAÍNA 1 %', 'sin epinefrina'), ('Frasco ampolla 20 mL', 'Uso infiltrativo'), '#0d9488', '#0d9488')
frasco('lidocaina_epi', 'ANESTÉSICO LOCAL', ('LIDOCAÍNA 1 %', 'con epinefrina'), ('Frasco ampolla 20 mL', 'Vasoconstrictor'), '#b45309', '#b45309')
frasco('corticoide', 'CORTICOIDE', ('METILPREDNISOLONA', '40 mg/mL'), ('Acetato · depot', 'Intraarticular'), '#7c3aed', '#7c3aed')

def aguja_svg(name, color, g, mm, largo):
    b = (sombra(110, 62, 86, 5) + f'<rect x="20" y="40" width="{largo}" height="3.6" rx="1.8" fill="url(#steel)" stroke="#64748b" stroke-width=".6"/>'
         f'<path d="M20 40 L10 41.8 L20 43.6 Z" fill="#cbd5e1" stroke="#64748b" stroke-width=".6"/>'
         f'<rect x="{20 + largo}" y="34" width="26" height="15.6" rx="4" fill="{color}" stroke="#0f172a" stroke-opacity=".3"/><rect x="{46 + largo}" y="30" width="8" height="23.6" rx="3" fill="{color}"/>'
         + etiqueta(70, 6, 88, 'AGUJA ' + g, (mm, 'Estéril · descartable'), color))
    svg(name, 230, 84, b)

aguja_svg('aguja21', '#16a34a', '21 G', '0,8 × 40 mm · verde', 120)
aguja_svg('aguja25', '#f59e0b', '25 G', '0,5 × 25 mm · naranja', 96)
aguja_svg('aguja18', '#db2777', '18 G', '1,2 × 40 mm · rosa', 120)

b = (sombra(130, 100, 100, 6) + '<rect x="40" y="46" width="130" height="30" rx="5" fill="url(#glass)" stroke="#7aa9bd" stroke-width="1.3"/><rect x="170" y="52" width="14" height="18" rx="3" fill="#e2e8f0" stroke="#94a3b8"/>'
     '<rect x="18" y="52" width="26" height="18" rx="3" fill="#cbd5e1" stroke="#94a3b8"/><rect x="6" y="44" width="8" height="34" rx="3" fill="#94a3b8"/><rect x="14" y="58" width="30" height="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width=".6"/>'
     + ''.join(f'<path d="M{60 + i * 11} 46 L{60 + i * 11} {54 if i % 2 else 58}" stroke="#334155" stroke-width="1"/>' for i in range(10))
     + '<path d="M184 61 L206 61" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>'
     + etiqueta(66, 8, 80, 'JERINGA', ('20 mL', 'Luer lock'), '#0d9488'))
svg('jeringa20', 220, 100, b)

b = (sombra(80, 94, 50, 5) + '<circle cx="80" cy="56" r="20" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/><rect x="70" y="14" width="20" height="30" rx="4" fill="#bae6fd" stroke="#0284c7" stroke-width="1.6"/>'
     '<rect x="14" y="46" width="36" height="20" rx="4" fill="#bae6fd" stroke="#0284c7" stroke-width="1.6"/><rect x="110" y="46" width="36" height="20" rx="4" fill="#bae6fd" stroke="#0284c7" stroke-width="1.6"/>'
     '<circle cx="80" cy="56" r="7" fill="#0284c7"/><path d="M80 56 L96 40" stroke="#0369a1" stroke-width="5" stroke-linecap="round"/>'
     + etiqueta(44, 74, 72, 'LLAVE 3 VÍAS', ('Para evacuar', 'sin soltar la aguja'), '#0369a1'))
svg('llave3vias', 160, 106, b)

d = '<linearGradient id="liqy" x1="0" x2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#facc15"/></linearGradient>'
b = (sombra(80, 150, 56, 7) + '<rect x="46" y="14" width="68" height="22" rx="5" fill="#2563eb"/><path d="M42 40 L118 40 L128 62 L128 140 C128 152 118 156 80 156 C42 156 32 152 32 140 L32 62 Z" fill="url(#glass)" stroke="#9cc7d8" stroke-width="1.4"/>'
     '<path d="M35 96 L125 96 L125 140 C125 149 116 153 80 153 C44 153 35 149 35 140 Z" fill="url(#liqy)" opacity=".8"/>'
     + ''.join(f'<path d="M35 {70 + i * 14} L52 {70 + i * 14}" stroke="#64748b" stroke-width="1"/>' for i in range(5))
     + etiqueta(82, 100, 62, 'FRASCO', ('Colector plástico', '1000 mL'), '#2563eb'))
svg('frasco_colector', 170, 168, b, d)

b = (sombra(110, 118, 78, 6) + tubo(54, 30, '#dc2626', '#fde68a') + tubo(86, 30, '#facc15', '#fde68a')
     + etiqueta(40, 4, 110, 'SIN HEPARINA', ('Tubos estériles (2)', 'Gram/cultivo · cristales'), '#b91c1c'))
svg('tubos_nohep', 160, 130, b)
b = (sombra(110, 118, 78, 6) + tubo(54, 30, '#16a34a', '#fde68a') + tubo(86, 30, '#16a34a', '#fde68a')
     + etiqueta(40, 4, 110, 'CON HEPARINA', ('Tubos estériles (1–2)', 'Recuento · fisicoquímico'), '#15803d'))
svg('tubos_hep', 160, 130, b)

def rot(x, y, c):
    return (f'<g transform="translate({x},{y}) rotate(-4)"><rect width="104" height="52" rx="5" fill="#fff" stroke="#cbd5e1"/><rect width="104" height="12" rx="5" fill="{c}"/>' + txt(52, 9, 'LÍQUIDO SINOVIAL', 6.2, '#fff', 800)
            + ''.join(f'<rect x="8" y="{20 + i * 8}" width="{72 - (i % 2) * 18}" height="3.6" rx="1.8" fill="#94a3b8"/>' for i in range(4)) + '<circle cx="90" cy="38" r="7" fill="none" stroke="#0d9488" stroke-width="1.6"/></g>')
b = sombra(120, 110, 90, 6) + rot(14, 16, '#0d9488') + rot(70, 44, '#2563eb') + rot(34, 70, '#7c3aed') + etiqueta(70, 100, 100, 'RÓTULOS', ('Paciente · DNI · fecha', 'Articulación · anticoagulante'), '#0d9488')
svg('rotulos', 230, 130, b)

b = (sombra(90, 96, 60, 6) + '<rect x="30" y="28" width="110" height="56" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.4"/><rect x="62" y="40" width="46" height="32" rx="4" fill="#e2e8f0"/>'
     + txt(85, 60, 'ESTÉRIL', 7, '#475569', 800) + etiqueta(40, 4, 90, 'APÓSITO', ('Estéril adhesivo', '6 × 7 cm'), '#0891b2'))
svg('aposito', 180, 110, b)

b = (sombra(80, 166, 50, 6) + '<path d="M40 40 L120 40 L112 160 L48 160 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.6"/><rect x="34" y="28" width="92" height="16" rx="5" fill="#991b1b"/><rect x="62" y="30" width="36" height="6" rx="3" fill="#1f2937"/>'
     + txt(80, 92, '⚠', 26, '#fde68a', 800) + txt(80, 122, 'CORTOPUNZANTES', 8.2, '#fff', 800) + txt(80, 136, 'No reencapuchar', 6.6, '#fecaca', 700))
svg('descartador', 160, 176, b)
b = (sombra(80, 160, 50, 6) + '<path d="M30 40 C30 30 130 30 130 40 L124 160 L36 160 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.6"/><path d="M40 40 C60 24 100 24 120 40" fill="none" stroke="#7f1d1d" stroke-width="3"/>'
     + txt(80, 96, '☣', 30, '#fef2f2', 800) + txt(80, 126, 'RESIDUOS', 9, '#fff', 800) + txt(80, 140, 'PATOGÉNICOS', 8, '#fecaca', 700))
svg('bolsa_roja', 160, 172, b)

ticks = ''.join(f'<path d="M{168 + 21 * math.cos(a):.1f} {40 + 21 * math.sin(a):.1f} L{168 + 24 * math.cos(a):.1f} {40 + 24 * math.sin(a):.1f}" stroke="#64748b" stroke-width="1.2"/>' for a in [i * 0.52 for i in range(12)])
b = (sombra(100, 120, 76, 6) + '<rect x="24" y="44" width="116" height="42" rx="12" fill="#bae6fd" stroke="#0284c7" stroke-width="1.6"/><path d="M30 46 L134 46" stroke="#fff" stroke-width="2" opacity=".5"/>'
     '<circle cx="168" cy="40" r="26" fill="#f8fafc" stroke="#475569" stroke-width="3"/><path d="M168 40 L182 28" stroke="#dc2626" stroke-width="2.4" stroke-linecap="round"/><circle cx="168" cy="40" r="3" fill="#1f2937"/>' + ticks
     + '<path d="M140 68 C160 90 150 108 130 110" stroke="#0f172a" stroke-width="3" fill="none"/><ellipse cx="124" cy="112" rx="10" ry="8" fill="#0f172a"/>' + etiqueta(36, 92, 98, 'TENSIÓMETRO', ('Aneroide + brazalete', 'Presión arterial'), '#0284c7'))
svg('tensiometro', 210, 130, b)

b = (sombra(90, 138, 60, 6) + '<rect x="34" y="14" width="112" height="122" rx="6" fill="#fff" stroke="#94a3b8" stroke-width="1.4"/><rect x="34" y="14" width="112" height="20" rx="6" fill="#0d9488"/>' + txt(90, 28, 'CONSENTIMIENTO INFORMADO', 6.4, '#fff', 800)
     + ''.join(f'<rect x="46" y="{44 + i * 11}" width="{88 - (i % 3) * 14}" height="4" rx="2" fill="#cbd5e1"/>' for i in range(6))
     + '<path d="M50 120 C58 106 64 128 72 114 C78 106 84 126 94 112" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round"/><path d="M46 126 L134 126" stroke="#94a3b8" stroke-width="1"/>' + txt(90, 134, 'Firma del paciente', 5.4, '#64748b', 600))
svg('consentimiento', 180, 150, b)

b = (sombra(100, 120, 80, 6) + '<path d="M22 28 L178 28 L170 112 L30 112 Z" fill="#7dd3c8" stroke="#0f766e" stroke-width="1.6"/><ellipse cx="100" cy="70" rx="24" ry="20" fill="#e9f7f4" stroke="#0f766e" stroke-width="1.6"/>'
     + txt(100, 130, 'PAÑO FENESTRADO ESTÉRIL', 6.6, '#0f172a', 800))
svg('pano_fenestrado', 200, 140, b)
print('ok')
