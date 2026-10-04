import math
# ---- espátula de Ayre
b = (sombra(100, 150, 76, 5) + '<path d="M24 78 L126 78 C150 78 164 66 176 56 C176 66 176 90 176 100 C164 90 150 78 126 78 Z" fill="#e7c590" stroke="#a16207" stroke-width="1.6"/><path d="M26 74 L124 74 L124 82 L26 82 Z" fill="#f4d9a8" stroke="#a16207" stroke-width="1.2"/>'
     + etiqueta(36, 8, 128, 'ESPÁTULA DE AYRE', ('Madera descartable', 'Toma del exocérvix'), '#a16207'))
svg('espatula_ayre', 220, 130, b)
# ---- citobrush
b = (sombra(100, 140, 76, 5) + '<rect x="20" y="70" width="110" height="6" rx="3" fill="#cbd5e1" stroke="#64748b"/><rect x="12" y="64" width="22" height="18" rx="4" fill="#0ea5e9"/>'
     + ''.join(f'<path d="M{132 + i * 3} {73} l{5 if i % 2 else -5} {-9 if i % 2 else 9}" stroke="#94a3b8" stroke-width="1.8"/>' for i in range(14)) + '<ellipse cx="156" cy="73" rx="26" ry="9" fill="none" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2 2"/>'
     + etiqueta(40, 8, 120, 'CITOBRUSH', ('Cepillo endocervical', 'Toma del endocérvix'), '#0ea5e9'))
svg('citobrush', 220, 130, b)
# ---- portaobjetos
b = (sombra(100, 120, 70, 5) + '<rect x="26" y="40" width="148" height="50" rx="3" fill="#e0f2fe" stroke="#7aa9bd" stroke-width="1.6" transform="rotate(-6 100 65)"/><rect x="32" y="46" width="30" height="38" rx="2" fill="#7dd3fc" transform="rotate(-6 100 65)"/>'
     + '<rect x="30" y="86" width="148" height="30" rx="3" fill="#f0f9ff" stroke="#7aa9bd" stroke-width="1.4" opacity=".9"/>' + etiqueta(44, 4, 110, 'PORTAOBJETOS', ('Vidrio con zona rotulable', 'Para extender la muestra'), '#0284c7'))
svg('portaobjetos', 200, 126, b)
# ---- fijador en spray
b = (sombra(70, 160, 40, 6) + '<rect x="44" y="52" width="52" height="100" rx="12" fill="#e2e8f0" stroke="#64748b" stroke-width="1.6"/><rect x="52" y="30" width="36" height="26" rx="5" fill="#16a34a"/><rect x="60" y="20" width="20" height="12" rx="3" fill="#15803d"/>'
     '<path d="M96 28 C110 24 118 30 124 26" stroke="#94a3b8" stroke-width="2.4" fill="none"/>' + txt(70, 96, 'FIJADOR', 8, '#0f172a', 800) + txt(70, 108, 'CITOLÓGICO', 6.6, '#0f172a', 800) + txt(70, 124, 'SPRAY', 7, '#16a34a', 800))
svg('fijador_spray', 140, 170, b)
# ---- lámpara de pie
b = (sombra(80, 170, 36, 5) + '<path d="M80 40 L80 160" stroke="#475569" stroke-width="5"/><ellipse cx="80" cy="162" rx="28" ry="6" fill="#334155"/><path d="M80 44 C100 36 120 30 132 22" stroke="#64748b" stroke-width="4" fill="none"/>'
     '<path d="M118 14 L152 8 L148 40 L116 36 Z" fill="#fde68a" stroke="#a16207" stroke-width="1.6"/><path d="M134 40 L120 80 L160 80 Z" fill="#fef9c3" opacity=".55"/>' + etiqueta(14, 6, 90, 'LÁMPARA DE PIE', ('Luz orientable', 'Para ver el cuello'), '#a16207'))
svg('lampara_pie', 170, 182, b)
# ---- bata de la paciente
b = (sombra(100, 150, 60, 5) + '<path d="M54 30 L84 22 L100 40 L116 22 L146 30 L160 56 L140 64 L140 140 L60 140 L60 64 L40 56 Z" fill="#bae6fd" stroke="#0284c7" stroke-width="1.6"/><path d="M100 40 L100 140" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="3 3"/>' + txt(100, 98, 'BATA', 9, '#075985', 800))
svg('bata_paciente', 200, 156, b)
# ---- sábana / campo para resguardar la intimidad
b = (sombra(100, 130, 70, 5) + '<path d="M26 40 L174 40 L186 108 L14 108 Z" fill="#86efac" stroke="#16a34a" stroke-width="1.6"/><path d="M26 40 L174 40 L170 52 L30 52 Z" fill="#bbf7d0"/>' + txt(100, 84, 'SÁBANA / CAMPO', 8.4, '#14532d', 800) + txt(100, 98, 'Resguarda la intimidad', 6.6, '#166534', 700))
svg('sabana_campo', 200, 140, b)
# ---- camilla ginecológica con estribos
b = (sombra(110, 140, 90, 6) + '<rect x="30" y="66" width="130" height="22" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.6"/><rect x="132" y="60" width="38" height="16" rx="6" fill="#fff" stroke="#94a3b8"/><path d="M40 88 L36 130 M150 88 L154 130" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>'
     '<path d="M30 74 L10 52 L10 40 M30 74 L6 80" stroke="#475569" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M14 38 C20 34 26 38 22 46 Z" fill="#334155"/>' + etiqueta(60, 8, 110, 'CAMILLA GINECOLÓGICA', ('Con estribos', 'Posición ginecológica'), '#0284c7'))
svg('camilla_gin', 220, 150, b)
# ---- orden de PAP
b = (sombra(100, 140, 66, 5) + '<rect x="42" y="12" width="116" height="120" rx="6" fill="#fff" stroke="#94a3b8" stroke-width="1.5"/><rect x="42" y="12" width="116" height="22" rx="6" fill="#be185d"/>' + txt(100, 27, 'ORDEN DE PAP', 9, '#fff', 800)
     + ''.join(f'<rect x="54" y="{46 + i * 12}" width="{92 - (i % 3) * 14}" height="3.6" rx="1.8" fill="#cbd5e1"/>' for i in range(6)) + '<circle cx="132" cy="112" r="8" fill="none" stroke="#be185d" stroke-width="1.8"/>')
svg('orden_pap', 200, 146, b)
# ---- distractores: histerómetro, pinza de Pozzi, gel, colposcopio, hisopo
b = (sombra(100, 120, 76, 5) + '<rect x="20" y="62" width="150" height="5" rx="2.5" fill="url(#steel)" stroke="#64748b"/><rect x="164" y="56" width="22" height="16" rx="4" fill="#94a3b8"/><circle cx="26" cy="64" r="4" fill="#475569"/>' + etiqueta(40, 8, 120, 'HISTERÓMETRO', ('Mide la cavidad uterina', 'No es parte del PAP'), '#64748b'))
svg('histerometro', 200, 130, b)
b = (sombra(100, 130, 76, 5) + '<path d="M30 40 L150 80 M30 90 L150 70" stroke="url(#steel)" stroke-width="8" stroke-linecap="round"/><circle cx="160" cy="76" r="14" fill="none" stroke="#64748b" stroke-width="5"/><circle cx="160" cy="76" r="4" fill="#64748b"/><path d="M26 40 l-8 -8 M26 90 l-8 8" stroke="#475569" stroke-width="4" stroke-linecap="round"/>' + etiqueta(40, 100, 120, 'PINZA DE POZZI', ('Para tracción del cuello', 'No se usa en el PAP'), '#64748b'))
svg('pinza_pozzi', 200, 130, b)
b = (sombra(70, 150, 40, 6) + '<rect x="46" y="62" width="48" height="84" rx="10" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.6"/><rect x="58" y="34" width="24" height="30" rx="4" fill="#6366f1"/>' + txt(70, 100, 'GEL', 10, '#312e81', 800) + txt(70, 114, 'LUBRICANTE', 6.6, '#312e81', 800))
svg('gel_lubricante', 140, 160, b)
b = (sombra(100, 160, 60, 6) + '<rect x="84" y="14" width="40" height="64" rx="8" fill="#334155" stroke="#0f172a" stroke-width="2"/><circle cx="104" cy="30" r="12" fill="#0b1220" stroke="#64748b" stroke-width="3"/><path d="M104 78 L104 150" stroke="#475569" stroke-width="6"/><ellipse cx="104" cy="152" rx="36" ry="7" fill="#475569"/>' + etiqueta(10, 94, 80, 'COLPOSCOPIO', ('Magnifica el cuello', 'Estudio posterior'), '#334155'))
svg('colposcopio', 200, 170, b)
b = (sombra(100, 100, 60, 5) + '<rect x="24" y="60" width="132" height="5" rx="2.5" fill="#d6a76a"/><ellipse cx="164" cy="62" rx="12" ry="7" fill="#fff" stroke="#cbd5e1"/><ellipse cx="22" cy="62" rx="10" ry="6" fill="#fff" stroke="#cbd5e1"/>' + etiqueta(40, 8, 110, 'HISOPO DE ALGODÓN', ('Toma de cultivo', 'No reemplaza al PAP'), '#a16207'))
svg('hisopo_algodon', 190, 100, b)
print('ok gin')
