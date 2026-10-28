# -*- coding: utf-8 -*-
"""UP7 · Tumoración cervical. Base: Giménez 2.ª ed. (2025), caps. 23 (nódulo y cáncer tiroideos), 24 (glándulas salivales), 25 (tumores laterales del cuello) y 27 (traqueostomía). El cáncer diferenciado de tiroides conserva el consenso Delphi argentino como fuente principal."""
from base import I, A, F, D, FG, FC

CONTENIDO = {}

# ---------------- nódulo tiroideo ----------------
CONTENIDO['cx-nodulo-tiroideo'] = dict(
    algoritmo=dict(titulo='Nódulo tiroideo (Giménez 2025)', nodos=[
        I('Nódulo tiroideo (4 veces más frecuente en mujeres; el 15 % es maligno): ecografía de rutina que incluya la búsqueda de adenopatías cervicales, TSH'),
        A('PAAF según las características ecográficas y el tamaño; informar con la clasificación de Bethesda'),
        D('¿Es benigno (Bethesda II)?',
          [A('Seguimiento ecográfico cada 1 a 2 años con nueva punción si cambia'),
           F('Cirugía si hay síntomas compresivos, crecimiento mantenido o acelerado, o por estética en nódulos grandes')],
          [D('¿Es indeterminado (Bethesda III o IV)?',
             [F('Repetir la PAAF o estudios moleculares; hemitiroidectomía diagnóstica si hay sospecha')],
             [F('Sospechoso o maligno (Bethesda V o VI): cirugía (ver la ficha de cáncer diferenciado de tiroides)')])]),
    ]),
    diagnostico=[
        'El nódulo tiroideo es muy prevalente y aumenta con la edad; la mayoría es benigno y solo el 15 % es maligno. Más del 95 % de los malignos son carcinomas diferenciados (papilar, folicular y de células oncocíticas), de muy buen pronóstico.',
        'La ecografía es el mejor estudio por imágenes y se solicita siempre; la PAAF es el método más preciso para detectar malignidad y, informada por Bethesda, define la conducta.',
        'Peor pronóstico en el carcinoma diferenciado: variantes agresivas (células altas, hobnail), edad mayor de 55 años, sexo masculino, metástasis, extensión extratiroidea, tamaño mayor de 4 cm y compromiso ganglionar con extensión extranodal.',
        'Carcinoma medular: calcitonina y CEA; pedir mutación de RET en todos (forma hereditaria: descartar neoplasia endocrina múltiple y estudiar a los familiares). Carcinoma anaplásico: evolución rápida, avanzado al diagnóstico, cirugía limitada a biopsia o traqueostomía; predominan la radioterapia y las terapias sistémicas.',
    ],
    fuente=FG('23', 'Nódulo y cáncer tiroideos', 'Los puntos de corte de cirugía en nódulos benignos coinciden con el manual de la Universidad de Chile (2020).'),
)

# ---------------- cáncer diferenciado de tiroides ----------------
CONTENIDO['cx-cancer-diferenciado-tiroides'] = dict(
    algoritmo=dict(titulo='Cáncer diferenciado de tiroides (consenso argentino y Giménez 2025)', nodos=[
        I('Nódulo con PAAF Bethesda V o VI o cáncer confirmado: ecografía cervical con estudio de ganglios y discusión en equipo'),
        D('¿Hay compromiso ganglionar lateral (cN1b)?',
          [F('Tiroidectomía total con disección lateral terapéutica por compartimentos y disección central terapéutica asociada')],
          [D('¿Es un tumor único de menos de 2 cm, sin compromiso ganglionar clínico ni por imágenes y sin factores de alto riesgo?',
             [F('Hemitiroidectomía (consenso fuerte) tras discusión conjunta con el paciente')],
             [A('Tumores de 2 a 4 cm sin alto riesgo: individualizar entre hemitiroidectomía y tiroidectomía total según el plan de radioyodo y seguimiento con tiroglobulina'),
              F('Alto riesgo o mayor de 4 cm: tiroidectomía total')])]),
        A('Radioyodo de indicación selectiva según el riesgo'),
        F('Seguimiento con TSH, tiroglobulina (marcador del carcinoma diferenciado) y ecografía cervical; reevaluar la respuesta al tratamiento'),
    ]),
    fuente=FC('23', 'Nódulo y cáncer tiroideos'),
)

# ---------------- patología benigna de tiroides ----------------
CONTENIDO['cx-patologia-benigna-tiroides'] = dict(
    algoritmo=dict(titulo='Patología tiroidea benigna', nodos=[
        I('Bocio, hipertiroidismo o hipotiroidismo: TSH y T4 libre, ecografía y, si hay nódulos, PAAF'),
        D('¿Hay compresión, un nódulo sospechoso, crecimiento mantenido o falla del tratamiento médico?',
          [F('Tiroidectomía total o subtotal')],
          [F('Tratamiento médico: antitiroideos en el hipertiroidismo, levotiroxina según el caso, AINE o corticoides en la tiroiditis subaguda; controles periódicos')]),
    ]),
)

# ---------------- complicaciones de la tiroidectomía ----------------
CONTENIDO['cx-complicaciones-tiroidectomia'] = dict(
    algoritmo=dict(titulo='Complicaciones tempranas de la tiroidectomía', nodos=[
        I('Posoperatorio de tiroidectomía: vigilar la herida, la voz, la respiración y los síntomas de hipocalcemia (hormigueo perioral, calambres)'),
        D('¿Hay hematoma cervical con dificultad respiratoria?',
          [F('Abrir la herida de inmediato a pie de cama para descomprimir y llevar al paciente al quirófano')],
          [D('¿Hay hipocalcemia sintomática?',
             [F('Calcio endovenoso y luego calcio oral con calcitriol')],
             [D('¿Hay disfonía o parálisis cordal (nervio laríngeo recurrente)?',
                [F('Evaluación otorrinolaringológica, fonoterapia y reparación si el nervio fue seccionado')],
                [F('Calcio oral si hay hipocalcemia asintomática; control del calcio y de la voz')])])]),
    ]),
    fuente=FC('23', 'Nódulo y cáncer tiroideos'),
)

# ---------------- masa cervical ----------------
CONTENIDO['cx-masa-cervical'] = dict(
    algoritmo=dict(titulo='Tumor lateral del cuello (Giménez 2025)', nodos=[
        I('Masa en la región lateral del cuello: inspección, examen de la cavidad oral y palpación cervical; ecografía (estudio primario más útil) con PAAF guiada'),
        D('¿Es inflamatoria o infecciosa (adenitis, tuberculosis, micosis)?',
          [F('Antibióticos y drenaje de abscesos; tratar la causa')],
          [D('¿Es congénita (quiste branquial o tirogloso)?',
             [F('Resección (técnica de Sistrunk en el quiste tirogloso)')],
             [A('Neoplásica: las metástasis de primarios de cabeza y cuello son las más frecuentes; completar con TC, RM, estudios vasculares o PET según el caso'),
              D('¿Sospecha de linfoma (punción citológica)?',
                [F('Biopsia quirúrgica del ganglio con inmunohistoquímica para definir el tipo y el tratamiento')],
                [F('Estadificación y tratamiento oncológico en equipo: cirugía con radioterapia o quimiorradioterapia posoperatoria si el primario es resecable; los de base de lengua y nasofaringe se tratan primero con radioterapia o quimiorradioterapia; los primarios infraclaviculares, con tratamiento sistémico')])])]),
    ]),
    diagnostico=[
        '"Tumores laterales del cuello" es un término general: masas de distinta consistencia y tamaño en la región lateral. Causas: inflamatorias (adenitis por infecciones de cabeza y cuello, micosis, tuberculosis), congénitas (quistes branquiales) y neoplásicas (las metástasis de primarios de cabeza y cuello son las más frecuentes; también linfomas y tumores primarios cervicales como lipomas, neurinomas y sarcomas).',
        'La ecografía es el estudio primario más útil y accesible, y guía la punción con aguja fina; la TC, la RM, los estudios vasculares y el PET se usan según la naturaleza del tumor.',
    ],
    fuente=FG('25', 'Tumores laterales del cuello', 'La estructura de niveles ganglionares y la resección de quistes congénitos se mantienen del manual de la Universidad de Chile (2020).'),
)

# ---------------- traqueostomía ----------------
CONTENIDO['cx-traqueostomia'] = dict(
    algoritmo=dict(titulo='Traqueostomía (Giménez 2025)', nodos=[
        I('Obstrucción de la vía aérea superior, intubación prolongada, fracaso del destete del ventilador o secreciones abundantes mal manejadas'),
        D('¿Es una emergencia con la vía aérea comprometida?',
          [F('Cricotiroidotomía como acceso de emergencia')],
          [D('¿El paciente está en terapia intensiva y es candidato a técnica mínimamente invasiva?',
             [F('Traqueostomía percutánea a la cabecera de la cama (menos complicaciones)')],
             [F('Traqueostomía abierta en quirófano')])]),
        A('Cuidados diarios: aspiración de secreciones, piel periestoma, fijación de la cánula, control de la insuflación del balón (evitar el exceso: traqueomalacia y fístula traqueoesofágica) y recambio periódico con asepsia'),
    ]),
    diagnostico=[
        'Consiste en canular la luz traqueal con una incisión en su cara anterior para restablecer el flujo aéreo. Indicaciones: obstrucción de la vía aérea superior, intubación prolongada, fracaso del destete y secreciones abundantes.',
        'Complicaciones: hemorragia, neumotórax, infección, traqueomalacia y fístula traqueoesofágica.',
    ],
    fuente=FG('27', 'Indicaciones y cuidados de la traqueostomía'),
)

# ---------------- ficha nueva: glándulas salivales ----------------
_sal = {
    'id': 'cx-glandulas-salivales', 'area': 'cirugia',
    'titulo': 'Patología de las glándulas salivales',
    'alias': ['parotida', 'submaxilar', 'sialoadenitis', 'litiasis salival', 'adenoma pleomorfo', 'tumor de warthin', 'sjogren', 'nervio facial'],
    'up': ['cx7'], 'unidad': 'UP7 · Tumoración cervical', 'estado': 'verificar',
    'definicion': 'Las glándulas salivales pueden afectarse por patología inflamatoria (sialoadenitis, sobre todo por litiasis ductal) o tumoral. La posibilidad de malignidad aumenta de las glándulas mayores a las menores.',
    'diagnostico': [
        'El grueso de las sialoadenitis del adulto se debe a la obstrucción ductal por cálculos; el síndrome de Sjögren tiene manejo sintomático y conservador.',
        'Tumores benignos más frecuentes: adenoma pleomorfo y tumor de Warthin. Malignos más frecuentes: carcinoma mucoepidermoide y carcinoma adenoide quístico (invasión perineural, metástasis a distancia tardías, incluso una década después).',
    ],
    'estudios': ['Ecografía y PAAF; TC o RM según la extensión y la relación con el nervio facial en los tumores de parótida.'],
    'tratamiento': [{'titulo': 'Tratamiento', 'pasos': [
        {'etiqueta': 'Litiasis', 'texto': 'Conducta conservadora respecto de la glándula: resolver la obstrucción ductal.'},
        {'etiqueta': 'Tumores', 'texto': 'La cirugía es el tratamiento de elección, benignos y malignos, siempre conservando el nervio facial en la parótida (solo se sacrifica si el tumor lo compromete directamente). Parótida: parotidectomía; submaxilar: submaxilectomía como operación mínima; sublingual y accesorias: técnicas según la localización. Vaciamiento cervical si hay enfermedad ganglionar y, en algunos casos, de forma electiva.'},
    ]}],
    'seguimiento': ['Seguimiento a largo plazo en los malignos: las metástasis pulmonares aparecen muchos años después.'],
    'banderas': [
        'Tumor parotídeo con parálisis facial o dolor: sospechar malignidad.',
        'Preservar el nervio facial siempre que el tumor no lo comprometa.',
    ],
    'algoritmo': dict(titulo='Glándulas salivales (Giménez 2025)', nodos=[
        I('Tumefacción o dolor de una glándula salival: ecografía y PAAF; examen del nervio facial'),
        D('¿Es inflamatoria por obstrucción ductal (litiasis)?',
          [F('Conducta conservadora de la glándula: resolver la obstrucción; Sjögren: manejo sintomático')],
          [D('¿Es un tumor?',
             [A('Cirugía como tratamiento de elección, conservando el nervio facial (parotidectomía, submaxilectomía)'),
              F('Alto grado: cirugías más agresivas y vaciamiento cervical si hay ganglios; seguimiento prolongado')],
             [F('Otras causas: ver el diagnóstico diferencial de la masa cervical')])]),
    ]),
    'fuente': FG('24', 'Patologías de las glándulas salivales'),
    'revisarAntes': 'Contrastar con la guía o el protocolo vigente de la institución antes de aplicar.',
}
NUEVAS = [_sal]
