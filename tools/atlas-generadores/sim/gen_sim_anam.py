import math
# ---- historia clínica (formulario)
b = (sombra(100, 140, 70, 5) + '<rect x="40" y="10" width="120" height="124" rx="8" fill="#fff" stroke="#94a3b8" stroke-width="1.5"/><rect x="40" y="10" width="120" height="22" rx="8" fill="#0d9488"/>' + txt(100, 25, 'HISTORIA CLÍNICA', 9, '#fff', 800)
     + ''.join(f'<rect x="52" y="{42 + i * 11}" width="{96 - (i % 4) * 14}" height="3.6" rx="1.8" fill="#cbd5e1"/>' for i in range(8)) + '<circle cx="136" cy="116" r="9" fill="none" stroke="#0d9488" stroke-width="1.8"/><path d="M132 116 L135 119 L141 112" stroke="#0d9488" stroke-width="1.8" fill="none"/>')
svg('hc_blanca', 200, 150, b)
# ---- lapicera y tablilla
b = (sombra(100, 140, 66, 5) + '<rect x="46" y="14" width="96" height="116" rx="8" fill="#e2e8f0" stroke="#64748b" stroke-width="1.6"/><rect x="58" y="26" width="72" height="96" rx="4" fill="#fff"/><rect x="76" y="8" width="36" height="14" rx="4" fill="#475569"/>'
     + ''.join(f'<rect x="64" y="{40 + i * 12}" width="{58 - (i % 3) * 10}" height="3.4" rx="1.7" fill="#94a3b8"/>' for i in range(6))
     + '<path d="M150 30 L176 118" stroke="#1d4ed8" stroke-width="7" stroke-linecap="round"/><path d="M176 118 L172 130 L168 119" fill="#f8fafc" stroke="#1d4ed8"/>')
svg('lapicera', 200, 150, b)
# ---- mesa y sillas
b = (sombra(100, 140, 84, 6) + '<rect x="46" y="62" width="108" height="14" rx="4" fill="#d6a76a" stroke="#92602a" stroke-width="1.5"/><path d="M60 76 L56 126 M140 76 L144 126" stroke="#92602a" stroke-width="6" stroke-linecap="round"/>'
     '<path d="M14 80 L14 118 M14 80 L36 80 L36 118 M14 104 L36 104" stroke="#0d9488" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M186 80 L186 118 M186 80 L164 80 L164 118 M186 104 L164 104" stroke="#0d9488" stroke-width="5" stroke-linecap="round" fill="none"/>'
     + etiqueta(40, 8, 120, 'CONSULTORIO', ('Mesa y sillas', 'Sin barreras'), '#0d9488'))
svg('mesa_sillas', 200, 150, b)
# ---- pañuelos
b = (sombra(100, 130, 54, 5) + '<rect x="46" y="62" width="108" height="58" rx="8" fill="#a7f3d0" stroke="#0d9488" stroke-width="1.6"/><rect x="84" y="64" width="32" height="6" rx="3" fill="#0d9488"/>'
     '<path d="M70 62 C76 30 92 20 100 20 C96 34 102 46 110 62" fill="#fff" stroke="#cbd5e1"/><path d="M96 62 C104 34 126 28 134 30 C128 42 130 52 126 62" fill="#f8fafc" stroke="#cbd5e1"/>' + txt(100, 98, 'PAÑUELOS', 8, '#064e3b', 800))
svg('panuelos', 200, 150, b)
# ---- hoja para el familigrama
b = (sombra(100, 140, 66, 5) + '<rect x="36" y="10" width="128" height="124" rx="6" fill="#fff" stroke="#94a3b8" stroke-width="1.5"/>'
     '<rect x="56" y="24" width="18" height="18" fill="none" stroke="#0f172a" stroke-width="2"/><circle cx="126" cy="33" r="10" fill="none" stroke="#0f172a" stroke-width="2"/><path d="M74 33 L116 33" stroke="#0f172a" stroke-width="1.6"/><path d="M95 33 L95 66" stroke="#0f172a" stroke-width="1.6"/>'
     '<circle cx="95" cy="82" r="11" fill="#0d9488" stroke="#0f172a" stroke-width="2"/><rect x="60" y="72" width="18" height="18" fill="none" stroke="#0f172a" stroke-width="2"/>' + txt(100, 124, 'FAMILIGRAMA', 8, '#334155', 800))
svg('familigrama_hoja', 200, 150, b)
# ---- orden de estudios
b = (sombra(100, 140, 66, 5) + '<rect x="42" y="12" width="116" height="120" rx="6" fill="#fff" stroke="#94a3b8" stroke-width="1.5"/><rect x="42" y="12" width="116" height="20" rx="6" fill="#64748b"/>' + txt(100, 26, 'ORDEN DE ESTUDIOS', 8, '#fff', 800)
     + ''.join(f'<path d="M54 {46 + i * 14} l6 0" stroke="#0d9488" stroke-width="2"/><rect x="66" y="{43 + i * 14}" width="{70 - (i % 3) * 12}" height="4" rx="2" fill="#cbd5e1"/>' for i in range(6)))
svg('orden_estudios', 200, 150, b)
print('ok anam')
