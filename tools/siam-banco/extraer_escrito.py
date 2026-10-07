#!/usr/bin/env python
"""Extrae las preguntas de desarrollo (examen escrito) de SIAM desde el Word 'Preguntas examen escrito SIAM.docx'.
El .docx trae bloques JSON pegados por UP (a veces con barras invertidas de LaTeX que rompen el JSON): se reparan y se
decodifica objeto por objeto. Salida: tools/siam-banco/escrito_crudo.json (lista ordenada por id).

Uso: PYTHONIOENCODING=utf8 python tools/siam-banco/extraer_escrito.py <ruta .docx>"""
import html, json, os, re, sys, zipfile

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))


def texto_docx(ruta):
    x = zipfile.ZipFile(ruta).read('word/document.xml').decode('utf8')
    pars = []
    for p in re.findall(r'<w:p[ >].*?</w:p>', x, re.S):
        pars.append(html.unescape(''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>', p, re.S))))
    return '\n'.join(pars)


def reparar(t):
    # barras invertidas que no son escapes JSON validos (ej. \sqrt, \alpha) -> se duplican
    # En este banco las unicas barras validas son \" (comilla escapada) y \\ ; el resto (\times, \beta, \frac, \le, \alpha...)
    # son comandos LaTeX y deben conservarse como texto (si no, \t, \b, \f, \n se leerian como caracteres de control).
    out, i = [], 0
    while i < len(t):
        c = t[i]
        if c == '\\':
            sig = t[i + 1] if i + 1 < len(t) else ''
            if sig in ('"', '\\'):
                out.append(c + sig); i += 2; continue
            out.append('\\\\'); i += 1; continue
        out.append(c); i += 1
    return ''.join(out)


def extraer(ruta):
    t = reparar(texto_docx(ruta))
    # comillas dobles sin escapar dentro de un texto (siam_up5_26): se escapan
    t = t.replace(' "en pimentón" ', ' \\"en pimentón\\" ')
    dec = json.JSONDecoder()
    objs, fallos = {}, []
    for m in re.finditer(r'\{\s*"id"\s*:\s*"siam_up\d+_\d+"', t):
        try:
            o, _ = dec.raw_decode(t, m.start())
            objs.setdefault(o['id'], o)
        except Exception as e:
            fallos.append((t[m.start():m.start() + 40].replace('\n', ' '), str(e)[:60]))
    return objs, fallos


if __name__ == '__main__':
    objs, fallos = extraer(sys.argv[1])
    print('objetos', len(objs), '| no decodificados', len(fallos))
    for f in fallos[:10]:
        print('  ', f)
    salida = os.path.join(RAIZ, 'tools/siam-banco/escrito_crudo.json')
    json.dump([objs[k] for k in sorted(objs)], open(salida, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
