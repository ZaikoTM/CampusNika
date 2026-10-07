"""Limpieza y auditoria de las preguntas choice de SIAM.

Aplica, en orden: entidades HTML, espacios, marcado tipo LaTeX -> unicode (K^+ -> K⁺, V_1 -> V₁), ortografia
(tildes y errores de tipeo encontrados en la auditoria), la conjuncion 'y' -> 'e' ante palabras que empiezan con i-/hi-,
y palabras repetidas. Cada correccion es explicita (no hay reemplazos "a ciegas" por diccionario).
"""
import html, re

# ---------------------------------------------------------------- ortografia: palabra completa (minuscula) -> correcta
ORTOGRAFIA = {
    # errores de tipeo
    'aministración': 'administración', 'broncoespamo': 'broncoespasmo', 'calremia': 'calcemia', 'cardiovascolares': 'cardiovasculares',
    'dextrucción': 'destrucción', 'dupación': 'duración', 'dupacion': 'duración', 'eccéntrica': 'excéntrica',
    'fotorrecptores': 'fotorreceptores', 'hemodinómicamente': 'hemodinámicamente', 'moviemiento': 'movimiento',
    'périda': 'pérdida', 'producctoras': 'productoras', 'prolifetativa': 'proliferativa', 'pereféricas': 'periféricas',
    'meccanismo': 'mecanismo', 'lethales': 'letales', 'ideopática': 'idiopática', 'ronpatía': 'roncopatía', 'atanía': 'atonía',
    'engurgitación': 'ingurgitación', 'extracellular': 'extracelular', 'interstitial': 'intersticial', 'immuno': 'inmuno',
    'stricta': 'estricta', 'strictas': 'estrictas', 'mediated': 'mediado', 'córneales': 'corneales', 'dopper': 'doppler',
    'corticospinal': 'corticoespinal', 'bloquante': 'bloqueante', 'cinchonismo': 'cinconismo', 'disinhibición': 'desinhibición',
    'transplante': 'trasplante', 'bifosfonatos': 'bisfosfonatos', 'bifosfonato': 'bisfosfonato',
    'postcarga': 'poscarga', 'postmenopáusica': 'posmenopáusica', 'postmenopáusicas': 'posmenopáusicas',
    # tildes faltantes o sobrantes
    'hipertension': 'hipertensión', 'acido': 'ácido', 'funcion': 'función', 'musculo': 'músculo', 'triada': 'tríada',
    'opióides': 'opioides', 'diástolico': 'diastólico', 'cornea': 'córnea', 'varices': 'várices', 'atonia': 'atonía',
    'cremacíon': 'cremación', 'embolico': 'embólico', 'electrólitos': 'electrolitos', 'ileo': 'íleo', 'uremica': 'urémica',
    'lucido': 'lúcido', 'hipertonica': 'hipertónica', 'fovea': 'fóvea', 'meningea': 'meníngea', 'diafisis': 'diáfisis',
    'cuadríceps': 'cuádriceps', 'estrias': 'estrías', 'origenes': 'orígenes', 'celiaca': 'celíaca', 'proctorrágia': 'proctorragia',
    'because': 'porque', 'cuadruple': 'cuádruple', 'sínergico': 'sinérgico', 'cinetico': 'cinético', 'eversion': 'eversión', 'subclinica': 'subclínica',
    'peristaltica': 'peristáltica', 'autolisis': 'autólisis', 'taquiarrítmias': 'taquiarritmias', 'épicárdicas': 'epicárdicas',
    'digitalica': 'digitálica', 'contínuas': 'continuas', 'catetérismo': 'cateterismo', 'potenciacíón': 'potenciación',
    'vísceromegalias': 'visceromegalias', 'aurículoventricular': 'auriculoventricular', 'perdida': None,   # None = solo por frase
    'clinica': 'clínica', 'clinicas': 'clínicas', 'clinicamente': 'clínicamente', 'farmaco': 'fármaco', 'cancer': 'cáncer',
    'suspension': 'suspensión', 'deficit': 'déficit', 'confusion': 'confusión', 'unico': 'único', 'organo': 'órgano',
    'metodo': 'método', 'reseccion': 'resección', 'organica': 'orgánica', 'medico': None, 'cardiaca': 'cardíaca',
    'cardiaco': 'cardíaco', 'cardiacos': 'cardíacos', 'tonico': 'tónico', 'cerebro-vascular': None,
}
ORTOGRAFIA = {k: v for k, v in ORTOGRAFIA.items() if v}

# correcciones de contexto (frase exacta -> frase correcta)
FRASES = [
    ('(mas Hipoglucemia', '(más Hipoglucemia'), ('perdida de iniciativa', 'pérdida de iniciativa'),
    ('por deposito de', 'por depósito de'), ('el Trimethoprim', 'la Trimetoprima'), ('Trimethoprim', 'Trimetoprima'),
    ('disociación proteíno-citológica', 'disociación albuminocitológica'), ('TONICO-CLÓNICAS E PARO', 'TÓNICO-CLÓNICAS Y PARO'),
    ('otra fótica/miótica', 'otra contraída/miótica'), ('QTc = QT / \\sqrt{RR}', 'QTc = QT / √RR'),
    ('ISQUÉMICO ISQUÉMICO EMBÓLICO', 'ISQUÉMICO EMBÓLICO'), ('Eco-Doppler', 'Eco-Doppler'), ('T_{1/2}', 'T½'),
    ('GABA_A', 'GABA-A'), ('GABA_B', 'GABA-B'), ('ECO-DOPPER', 'ECO-DOPPLER'),
    ('hipertiroidismo felino', 'hipertiroidismo'), ('Hipertiroidismo felino', 'Hipertiroidismo'),
    ('TP_{paciente}', 'TP paciente'), ('TP_{control}', 'TP control'), ('τ_{disociación}', 'τ disociación'),
]

# ---------------------------------------------------------------- marcado LaTeX -> unicode
SUP = {**{str(i): c for i, c in enumerate('⁰¹²³⁴⁵⁶⁷⁸⁹')}, '+': '⁺', '-': '⁻', '−': '⁻', '°': '°', 'm': 'ᵐ', 'I': 'ᴵ', 'S': 'ˢ'}
SUB = {**{str(i): c for i, c in enumerate('₀₁₂₃₄₅₆₇₈₉')}, '+': '₊', '-': '₋', 'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ', 'h': 'ₕ',
       'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'p': 'ₚ', 's': 'ₛ', 't': 'ₜ'}


def _conv(mapa, texto):
    return ''.join(mapa[c] for c in texto) if all(c in mapa for c in texto) else None


def _latex(t):
    def sup(m):
        cont = m.group(1) if m.group(1) is not None else m.group(2)
        return _conv(SUP, cont) or cont if cont != '°' else '°'
    def sub(m):
        cont = m.group(1) if m.group(1) is not None else m.group(2)
        return _conv(SUB, cont) or cont
    t = re.sub(r'\^\{([^}]*)\}|\^([+\-°\d])', lambda m: sup(m), t)
    t = re.sub(r'_\{([^}]*)\}|_([A-Za-z0-9]+)', lambda m: sub(m), t)
    return t


# ---------------------------------------------------------------- pasos
def _entidades(t):
    return html.unescape(t)


def _espacios(t):
    t = t.replace(' ', ' ').replace('​', '')
    t = re.sub(r'[ \t]+', ' ', t)
    t = re.sub(r' +([,.;:!?)])', r'\1', t)
    t = re.sub(r'\( +', '(', t)
    return t.strip()


def _frases(t):
    for a, b in FRASES:
        t = t.replace(a, b)
    return t


def _ortografia(t):
    def sub(m):
        w = m.group(0); k = w.lower()
        if k not in ORTOGRAFIA:
            return w
        r = ORTOGRAFIA[k]
        if w.isupper() and len(w) > 1:
            return r.upper()
        return (r[0].upper() + r[1:]) if w[0].isupper() else r
    return re.sub(r'[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+', sub, t)


_ROMANO = re.compile(r'^(?:[IVX]+[ABC]?)$')


def _y_e(t):
    """'y' -> 'e' delante de i-/hi- (salvo diptongos hia/hie/hio/hiu, numeros romanos y siglas cortas)."""
    return re.sub(r'(?<![\wÁÉÍÓÚáéíóúñ])([yY]) (?=[iIhH])([A-Za-zÁÉÍÓÚáéíóúñ]+)', _y_e_un, t)


def _y_e_un(m):
    y, sig = m.group(1), m.group(2)
    base = sig.lower()
    if _ROMANO.match(sig) or (sig.isupper() and len(sig) <= 4):
        return m.group(0)
    if base.startswith('hi') and len(base) > 2 and base[2] in 'aeou':
        return m.group(0)
    if not base.startswith('i') and not base.startswith('hi'):
        return m.group(0)
    return ('E' if y == 'Y' else 'e') + ' ' + sig


def _repetidas(t):
    return re.sub(r'\b(\w{4,})\s+\1\b', r'\1', t, flags=re.I)


def limpiar_texto(t):
    t = _entidades(t)
    t = _frases(t)          # antes del LaTeX: hay formulas con tratamiento propio (T½, GABA-A, TP paciente)
    t = _latex(t)
    t = _espacios(t)
    t = _ortografia(t)
    t = _y_e(t)
    t = _repetidas(t)
    return t


def limpiar_pregunta(p):
    return {
        'id': p['id'], 'numero': p.get('numero'),
        'pregunta': limpiar_texto(p['pregunta']),
        'opciones': {k: limpiar_texto(v) for k, v in p['opciones'].items()},
        'respuesta_correcta': p['respuesta_correcta'],
        'justificacion': limpiar_texto(p['justificacion']),
    }
