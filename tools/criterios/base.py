"""Ayudante para escribir fichas de criterios y escalas con el esquema de data/nikafarma_patologias.json."""
UNIDADES = {
    'cr1': 'Cirugía y trauma',
    'cr2': 'Obstetricia y ginecología',
    'cr3': 'Emergencias y terapia',
    'cr4': 'Clínica, cardiología y neurología',
    'cr5': 'Gastro, hepatología y nefrología',
    'cr6': 'Pediatría y neonatología',
}

def C(id, titulo, up, definicion, criterios, uso=None, interp=None, ojo=None, seg=None, fuente=None, alias=None, calc=None):
    """criterios: lista de líneas; interp: [(titulo, [(etiqueta, texto), ...])]; fuente: (guia, sociedad, anio)."""
    g, soc, anio = fuente
    return {
        'id': 'cr-' + id, 'area': 'criterios', 'titulo': titulo, 'alias': alias or [], 'up': [up], 'unidad': UNIDADES[up], 'estado': 'guia',
        'definicion': definicion, 'diagnostico': criterios, 'estudios': uso or [],
        'tratamiento': [{'titulo': t, 'pasos': [{'etiqueta': e, 'texto': x} for e, x in pasos]} for t, pasos in (interp or [])],
        'seguimiento': seg or [], 'banderas': ojo or [],
        'fuente': {'guia': g, 'sociedad': soc, 'anio': str(anio), 'archivo': '', 'tipo': 'guia', 'nota': 'Criterio o escala validada; verificar con la versión vigente de la guía y el protocolo institucional.'},
        'revisarAntes': 'Contrastar con la versión vigente de la guía antes de aplicar.',
        **({'calculadora': calc} if calc else {}),
    }
