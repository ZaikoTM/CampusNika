import math
# ---- biombo
b = (sombra(100, 140, 84, 6) + ''.join(f'<path d="M{24 + i * 50} 24 L{24 + i * 50 + 46} 30 L{24 + i * 50 + 46} 128 L{24 + i * 50} 122 Z" fill="{["#a7f3d0", "#6ee7b7", "#a7f3d0"][i]}" stroke="#047857" stroke-width="1.6"/>' for i in range(3))
     + etiqueta(50, 4, 100, 'BIOMBO', ('Plegable de 3 hojas', 'Privacidad'), '#047857'))
svg('biombo', 200, 146, b)
# ---- guía del autoexamen
b = (sombra(100, 140, 66, 5) + '<rect x="44" y="10" width="112" height="126" rx="7" fill="#fff" stroke="#be185d" stroke-width="1.6"/><rect x="44" y="10" width="112" height="24" rx="7" fill="#ec4899"/>' + txt(100, 26, 'AUTOEXAMEN MAMARIO', 8.6, '#fff', 800)
     + '<circle cx="76" cy="66" r="18" fill="#fbcfe8" stroke="#be185d"/><circle cx="76" cy="66" r="5" fill="#be185d"/><circle cx="124" cy="66" r="18" fill="#fbcfe8" stroke="#be185d"/><circle cx="124" cy="66" r="5" fill="#be185d"/>'
     + ''.join(f'<rect x="56" y="{96 + i * 10}" width="{88 - (i % 2) * 18}" height="3.4" rx="1.7" fill="#cbd5e1"/>' for i in range(3)))
svg('guia_autoexamen', 200, 146, b)
# ---- mamógrafo
b = (sombra(100, 160, 66, 6) + '<rect x="30" y="20" width="56" height="124" rx="10" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/><rect x="86" y="60" width="64" height="12" rx="4" fill="#94a3b8"/><rect x="86" y="96" width="64" height="12" rx="4" fill="#94a3b8"/><circle cx="58" cy="44" r="12" fill="#334155"/>'
     + etiqueta(86, 14, 100, 'MAMÓGRAFO', ('Estudio por imágenes', 'No es el examen clínico'), '#64748b'))
svg('mamografo', 200, 166, b)
# ---- gel de ecografía
b = (sombra(70, 160, 40, 6) + '<rect x="42" y="56" width="56" height="94" rx="14" fill="#cffafe" stroke="#0891b2" stroke-width="1.6"/><rect x="58" y="26" width="24" height="32" rx="5" fill="#0891b2"/>' + txt(70, 98, 'GEL', 11, '#164e63', 800) + txt(70, 112, 'ECOGRAFÍA', 6.6, '#164e63', 800))
svg('gel_ecografia', 140, 164, b)
print('ok mam')
