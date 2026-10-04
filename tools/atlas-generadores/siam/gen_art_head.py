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

