import math
# ---- gestograma (disco)
b = sombra(100, 150, 70, 6) + '<circle cx="100" cy="76" r="62" fill="#fff" stroke="#334155" stroke-width="3"/><circle cx="100" cy="76" r="46" fill="#ecfeff" stroke="#0d9488" stroke-width="2"/><circle cx="100" cy="76" r="26" fill="#fde68a" stroke="#b45309" stroke-width="2"/>'
b += ''.join(f'<path d="M{100 + 52 * math.cos(a):.1f} {76 + 52 * math.sin(a):.1f} L{100 + 62 * math.cos(a):.1f} {76 + 62 * math.sin(a):.1f}" stroke="#334155" stroke-width="1.2"/>' for a in [k * math.pi / 18 for k in range(36)])
b += '<path d="M100 76 L100 22" stroke="#dc2626" stroke-width="2.2"/><circle cx="100" cy="76" r="4" fill="#dc2626"/>' + txt(100, 80, 'EG', 8, '#78350f', 800) + etiqueta(40, 6, 120, 'GESTOGRAMA', ('Rueda de edad gestacional', 'FUM → EG y FPP'), '#0d9488')
svg('gestograma', 200, 156, b)
# ---- calendario
b = (sombra(100, 140, 70, 5) + '<rect x="36" y="14" width="128" height="116" rx="8" fill="#fff" stroke="#94a3b8" stroke-width="1.5"/><rect x="36" y="14" width="128" height="26" rx="8" fill="#dc2626"/>' + txt(100, 32, 'CALENDARIO', 10, '#fff', 800)
     + ''.join(f'<rect x="{46 + (i % 7) * 15.5:.1f}" y="{48 + (i // 7) * 15.5:.1f}" width="12" height="12" rx="2" fill="{"#fecaca" if i == 10 else "#f1f5f9"}"/>' for i in range(35)))
svg('calendario', 200, 146, b)
# ---- bolígrafo y cuadernillo
b = (sombra(100, 140, 66, 5) + '<rect x="42" y="14" width="100" height="116" rx="6" fill="#bae6fd" stroke="#0284c7" stroke-width="1.6"/><rect x="42" y="14" width="14" height="116" rx="4" fill="#0284c7"/>'
     + ''.join(f'<rect x="66" y="{34 + i * 14}" width="{64 - (i % 3) * 10}" height="3.4" rx="1.7" fill="#0369a1" opacity=".55"/>' for i in range(6)) + '<path d="M150 26 L176 116" stroke="#dc2626" stroke-width="7" stroke-linecap="round"/><path d="M176 116 L172 128 L168 117" fill="#f8fafc" stroke="#dc2626"/>')
svg('boligrafo_cuad', 200, 146, b)
# ---- calculadora
b = (sombra(100, 140, 52, 5) + '<rect x="58" y="12" width="84" height="122" rx="10" fill="#334155" stroke="#0f172a" stroke-width="2"/><rect x="66" y="22" width="68" height="24" rx="4" fill="#86efac"/>' + txt(128, 40, '16,4', 13, '#064e3b', 800, 'end')
     + ''.join(f'<rect x="{66 + (i % 4) * 17.5:.1f}" y="{56 + (i // 4) * 17:.1f}" width="14" height="13" rx="3" fill="{"#f59e0b" if i % 4 == 3 else "#94a3b8"}"/>' for i in range(16)))
svg('calculadora', 200, 146, b)
print('ok eg')
