import subprocess, re, json, pypdf
B = r'C:\Users\Augusto\Desktop\Medicina\PFO\PFO ESTANI\PFO\CLINICA MEDICA' + '\\'
PR = 'Procedimientos relevantes para la practica de la clinica medica\\'
G = [
 ('pd',   'Paracentesis diagnóstica', '💧', PR + '(2) PD - Guía para el desarrollo del procedimiento.pdf'),
 ('pt',   'Paracentesis terapéutica', '💧', PR + '(3) PT - Guía para el desarrollo del procedimiento.pdf'),
 ('pl',   'Punción lumbar (raquicentesis)', '🦴', PR + 'PL - Guía del procedimiento.pdf'),
 ('sng',  'Colocación de sonda nasogástrica', '🧵', PR + 'SNG - Guia del procedim.pdf'),
 ('vp',   'Extracción de sangre venosa', '🩸', PR + 'VP - Guía del Procedimiento.pdf'),
 ('oto',  'Otoscopía', '👂', PR + '(2) Otoscopía - Guía del Procedimiento.pdf'),
 ('hisf', 'Hisopado uretral femenino', '🧪', PR + 'Hisop Fem - Guía del Procedimiento.pdf'),
 ('hism', 'Hisopado uretral masculino', '🧪', PR + 'Hisop Masc - Guía del Procedimiento.pdf'),
 ('hisfa', 'Hisopado de fauces', '🧪', PR + 'Hisopado F - Guía del Procedimiento.pdf'),
 ('hisnf', 'Hisopado nasofaríngeo', '🧪', PR + 'Hisopado NF - PFO.pdf'),
 ('ecgn', 'Lectura de un ECG normal', '📈', 'Lectura e interpretación en trazados electrocardiograficos\\ECG Normal - Guia Procedim.pdf'),
 ('ecgsca', 'Lectura de un ECG en síndrome coronario agudo', '📈', 'Lectura e interpretación en trazados electrocardiograficos\\ECG SCA - Guia Procedim.pdf'),
]
NL = chr(10)

def texto(f):
    return subprocess.run(['pdftotext', '-layout', '-enc', 'UTF-8', B + f, '-'], capture_output=True).stdout.decode('utf8', 'replace')

def pasos(t):
    L = t.replace(chr(12), NL).split(NL)
    ini = 0
    for i, l in enumerate(L):
        if re.search(r'DESARROLLO|Desarrollo', l) and i < 15:
            ini = i + 1; break
    out = []; pend = []; cont = False
    for l in L[ini:]:
        if not l.strip():
            cont = False; continue
        m = re.match(r'^(\d{1,2})(?:\s+|$)(.*)$', l)
        if m and int(m.group(1)) == len(out) + 1 and not re.match(r'^\d+\.\d', l):
            out.append(' '.join(pend + [m.group(2).strip()]).strip()); pend = []; cont = True; continue
        if re.match(r'^\s*\d+(\.\d+)+\.?-?', l):
            if out: out[-1] += ' ' + l.strip(); cont = True
            continue
        if cont and out: out[-1] += ' ' + l.strip()
        else: pend.append(l.strip())
    return [re.sub(r'\s+', ' ', x).strip() for x in out if x.strip()]

def pasos_pypdf(f):
    r = pypdf.PdfReader(B + f); t = NL.join((x.extract_text() or '') for x in r.pages)
    out = []
    for l in t.split(NL):
        l = l.strip()
        if not l: continue
        m = re.match(r'^(\d{1,2})(?:\s+(.+))?$', l)
        if m and int(m.group(1)) == len(out) + 1:
            out.append((m.group(2) or '').strip()); continue
        if out and not re.match(r'^(Paso|N°|Desarrollo|DESARROLLO)', l) and not re.match(r'^[A-ZÁÉÍÓÚ ]{6,}$', l): out[-1] += ' ' + l
    return [re.sub(r'\s+', ' ', x).strip() for x in out]

def pasos_vp(f):
    r = pypdf.PdfReader(B + f); t = NL.join((x.extract_text() or '') for x in r.pages)
    i = t.index('2. Extracción de sangre venosa'); t = t[i:]
    j = t.find('Procedimiento:'); t = t[j + 14:]
    out = []
    for l in t.split(NL):
        ls = l.strip()
        if not ls: continue
        if ls[:1] in (chr(0xf0b7), chr(0x2022), chr(0xb7)):
            out.append(ls[1:].strip())
        elif out and not re.match(r'^\d+\.', ls): out[-1] += ' ' + ls
        elif re.match(r'^\d+\.', ls): break
    return [re.sub(r'\s+', ' ', x).strip() for x in out if len(x) > 8]

res = {}
for id_, tit, ico, f in G:
    p = pasos(texto(f))
    if id_ in ('oto', 'hisnf'): p = pasos_pypdf(f)
    if id_ == 'vp': p = pasos_vp(f)
    print(id_, len(p), '|', p[0][:50] if p else None, '|', p[-1][:60] if p else None)
    res[id_] = {'id': id_, 'area': 'pfo', 'titulo': tit, 'icono': ico, 'umbral': 60, 'criterios_texto': '', 'pasos': [{'n': i + 1, 'texto': x, 'fase': '', 'critico': False} for i, x in enumerate(p)]}
json.dump(res, open(r'C:\Users\Augusto\Desktop\Programacion\campus-nika\campus-nika\data\pfo\procedimientos_guias.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
