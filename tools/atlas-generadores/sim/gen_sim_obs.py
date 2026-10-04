import math

# ---- cinta obstétrica
ticks = ''.join(f'<path d="M{24 + i * 8.2:.1f} 58 L{24 + i * 8.2:.1f} {66 if i % 5 else 72}" stroke="#1f2937" stroke-width="1"/>' + (txt(24 + i * 8.2, 83, str(i), 6, '#111827', 800) if i % 5 == 0 else '') for i in range(0, 21))
b = (sombra(130, 100, 100, 6) + '<rect x="14" y="50" width="232" height="38" rx="6" fill="#fff8dc" stroke="#b45309" stroke-width="1.4"/><rect x="14" y="50" width="232" height="6" fill="#dc2626"/>' + ticks +
     '<circle cx="232" cy="30" r="16" fill="#0d9488" stroke="#0f766e" stroke-width="2"/><circle cx="232" cy="30" r="6" fill="#134e4a"/>' + etiqueta(60, 6, 110, 'CINTA OBSTÉTRICA', ('Flexible e inextensible', '0 a 50 cm'), '#0d9488'))
svg('cinta_obstetrica', 260, 110, b)
# ---- estetoscopio de Pinard
b = (sombra(90, 176, 56, 6) + '<path d="M62 22 L118 22 L112 30 L96 120 C94 130 86 134 80 134 C74 134 66 130 64 120 L48 30 Z" fill="#c8955a" stroke="#7c4a1d" stroke-width="1.6"/>'
     '<ellipse cx="90" cy="22" rx="30" ry="9" fill="#e7b982" stroke="#7c4a1d" stroke-width="1.6"/><ellipse cx="90" cy="22" rx="20" ry="5.4" fill="#7c4a1d" opacity=".5"/>'
     '<path d="M72 46 C74 80 78 110 82 128" stroke="#fff" stroke-width="3" opacity=".35" fill="none" stroke-linecap="round"/>' + etiqueta(36, 140, 108, 'ESTETOSCOPIO DE PINARD', ('Cuerno de madera', 'Auscultación fetal'), '#92400e'))
svg('pinard', 180, 176, b)
# ---- reloj con segundero
b = (sombra(80, 150, 50, 6) + '<circle cx="80" cy="76" r="48" fill="#f8fafc" stroke="#334155" stroke-width="5"/><circle cx="80" cy="76" r="42" fill="#fff" stroke="#cbd5e1"/>'
     + ''.join(f'<path d="M{80 + 38 * math.cos(a):.1f} {76 + 38 * math.sin(a):.1f} L{80 + 42 * math.cos(a):.1f} {76 + 42 * math.sin(a):.1f}" stroke="#334155" stroke-width="{2 if i % 5 == 0 else 1}"/>' for i, a in enumerate([k * math.pi / 30 for k in range(60)]))
     + '<path d="M80 76 L80 46" stroke="#111827" stroke-width="3" stroke-linecap="round"/><path d="M80 76 L102 84" stroke="#111827" stroke-width="2.4" stroke-linecap="round"/><path d="M80 86 L80 38" stroke="#dc2626" stroke-width="1.4"/><circle cx="80" cy="76" r="3.4" fill="#dc2626"/>'
     '<rect x="72" y="20" width="16" height="8" rx="2" fill="#475569"/>' + etiqueta(26, 126, 108, 'RELOJ CON SEGUNDERO', ('Contar 1 minuto', 'FCF y pulso materno'), '#334155'))
svg('reloj_segundero', 160, 160, b)
# ---- curva de AU
d = ''.join(f'L{34 + i * 14:.0f} {110 - (i * 5.2):.0f} ' for i in range(0, 12))
b = (sombra(100, 140, 80, 5) + '<rect x="14" y="14" width="172" height="118" rx="8" fill="#fff" stroke="#94a3b8" stroke-width="1.4"/>'
     '<path d="M30 112 L170 40 L170 70 L30 126 Z" fill="#a7f3d0" opacity=".7"/><path d="M30 118 L170 52" stroke="#059669" stroke-width="2" stroke-dasharray="4 3" fill="none"/>'
     + ''.join(f'<path d="M30 {30 + i * 20} L176 {30 + i * 20}" stroke="#e2e8f0"/>' for i in range(5)) + '<circle cx="104" cy="84" r="5" fill="#f59e0b" stroke="#fff" stroke-width="1.6"/><circle cx="76" cy="98" r="4" fill="#94a3b8"/>'
     + txt(100, 26, 'CURVA DE INCREMENTO DE LA AU', 7, '#0f172a', 800) + txt(100, 142, 'Edad gestacional (semanas)', 6.4, '#475569', 700))
svg('curva_au', 200, 150, b)
# ---- carnet perinatal
b = (sombra(100, 130, 70, 5) + '<rect x="40" y="12" width="120" height="116" rx="8" fill="#fde68a" stroke="#b45309" stroke-width="1.6"/><rect x="40" y="12" width="120" height="26" rx="8" fill="#f59e0b"/>' + txt(100, 30, 'CARNET PERINATAL', 9, '#fff', 800)
     + ''.join(f'<rect x="54" y="{50 + i * 12}" width="{92 - (i % 3) * 16}" height="4" rx="2" fill="#b45309" opacity=".55"/>' for i in range(6)) + txt(100, 124, 'Ministerio de Salud', 5.6, '#92400e', 700))
svg('carnet_perinatal', 200, 140, b)
# ---- camilla
b = (sombra(110, 130, 96, 6) + '<rect x="20" y="62" width="180" height="30" rx="10" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.6"/><rect x="26" y="50" width="52" height="16" rx="8" fill="#fff" stroke="#94a3b8"/>'
     '<path d="M40 92 L36 124 M180 92 L184 124" stroke="#64748b" stroke-width="5" stroke-linecap="round"/><path d="M30 106 L190 106" stroke="#94a3b8" stroke-width="3"/>' + etiqueta(60, 6, 100, 'CAMILLA', ('Con almohada', 'Decúbito dorsal'), '#0284c7'))
svg('camilla_obs', 220, 140, b)
# ---- alcohol en gel
b = (sombra(70, 160, 40, 6) + '<rect x="42" y="64" width="56" height="92" rx="12" fill="url(#glass)" stroke="#7dd3c8" stroke-width="1.6"/><rect x="46" y="100" width="48" height="52" rx="8" fill="#a7f3d0" opacity=".7"/>'
     '<rect x="58" y="40" width="24" height="26" rx="4" fill="#0d9488"/><path d="M58 40 L98 36 L98 44 L82 46" fill="#0f766e"/>' + txt(70, 120, 'ALCOHOL', 7, '#134e4a', 800) + txt(70, 130, 'EN GEL', 7, '#134e4a', 800))
svg('alcohol_gel', 140, 170, b)
# ---- estetoscopio común
b = (sombra(100, 140, 70, 5) + '<path d="M50 24 C40 70 70 96 100 96 C130 96 160 70 150 24" stroke="#475569" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="50" cy="22" r="6" fill="#1e293b"/><circle cx="150" cy="22" r="6" fill="#1e293b"/>'
     '<path d="M100 96 L100 120" stroke="#475569" stroke-width="5"/><circle cx="100" cy="128" r="14" fill="url(#steel)" stroke="#475569" stroke-width="2.4"/>' + etiqueta(50, 146, 100, 'ESTETOSCOPIO', ('Biauricular', 'Adultos'), '#475569'))
svg('estetoscopio_c', 200, 180, b)
# ---- cinta de costura
b = (sombra(100, 100, 80, 6) + '<rect x="16" y="46" width="168" height="26" rx="4" fill="#fde68a" stroke="#a16207" stroke-width="1.2"/>' + ''.join(f'<path d="M{20 + i * 8:.0f} 46 L{20 + i * 8:.0f} {56 if i % 5 else 62}" stroke="#78350f"/>' for i in range(20)) + etiqueta(44, 8, 112, 'CINTA DE COSTURA', ('De tela, extensible', 'No es obstétrica'), '#a16207'))
svg('cinta_costura', 200, 112, b)
# ---- espéculo
b = (sombra(100, 150, 70, 6) + '<path d="M30 70 C60 56 110 56 140 70 L140 84 C110 74 60 74 30 84 Z" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.6"/><path d="M30 84 C60 98 110 98 140 84" fill="#bae6fd" stroke="#0284c7" stroke-width="1.6"/>'
     '<rect x="136" y="64" width="12" height="30" rx="3" fill="#0ea5e9"/><path d="M148 74 L186 40 M148 86 L186 120" stroke="#0369a1" stroke-width="6" stroke-linecap="round"/><circle cx="188" cy="38" r="7" fill="#0284c7"/><circle cx="188" cy="122" r="7" fill="#0284c7"/>' + etiqueta(26, 8, 100, 'ESPÉCULO VAGINAL', ('Descartable', 'Valvas bivalvas'), '#0284c7'))
svg('especulo', 220, 160, b)
# ---- doppler
b = (sombra(100, 130, 60, 5) + '<rect x="56" y="30" width="88" height="90" rx="14" fill="#1e293b" stroke="#0f172a" stroke-width="2"/><rect x="66" y="42" width="68" height="34" rx="6" fill="#0b1220"/><path d="M70 60 L82 60 L86 50 L92 70 L98 56 L106 60 L130 60" stroke="#4ade80" fill="none" stroke-width="1.6"/>'
     '<circle cx="100" cy="98" r="10" fill="#64748b"/><path d="M144 96 C168 96 168 130 150 134" stroke="#334155" stroke-width="4" fill="none"/>' + etiqueta(50, 6, 100, 'DOPPLER FETAL', ('Portátil', 'Detector de latidos'), '#334155'))
svg('doppler', 200, 150, b)
# ---- balanza
b = (sombra(100, 150, 70, 6) + '<rect x="36" y="70" width="128" height="72" rx="10" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/><rect x="76" y="50" width="48" height="22" rx="4" fill="#0f172a"/>' + txt(100, 66, '58.4', 11, '#4ade80', 800) + txt(100, 112, 'BALANZA DE PIE', 8, '#334155', 800) + etiqueta(50, 6, 100, 'BALANZA', ('Peso materno', 'Control prenatal'), '#64748b'))
svg('balanza_pie', 200, 160, b)
print('ok obs')
