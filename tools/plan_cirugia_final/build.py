# -*- coding: utf-8 -*-
# Genera data/planes/cirugia_final_up1_11.json (plan modelo del Final de Cirugía).
# Uso: python tools/plan_cirugia_final/build.py
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from verificar import VERIFICAR
from dias_a import DIAS_A
from dias_b import DIAS_B, CIERRE

def dia(d, cierre=False):
    temas = [dict(t, hecho=False, manual=False, unidad=d["unidad"]) for t in d["temas"]]
    return {
        "titulo": d["titulo"], "horas": d["horas"], "unidad": d["unidad"], "caso": d["caso"],
        "temas": temas, "datos_duros": d["datos_duros"], "agenda": [],
        "checklist": [{"texto": c, "hecho": False} for c in d["checklist"]],
    }

plan = {
    "id": "cirugia_final_up1_11", "materia": "cirugia", "tipo": "final",
    "titulo": "Final integrador · Cirugía (UP 1 a 11)",
    "subtitulo": "Plan modelo · Examen final (las 11 unidades problema)",
    "descripcion": "Las 11 unidades problema en un solo recorrido, ordenadas por prioridad de examen (trauma y abdomen agudo primero, generalidades al final): temas con trampas de choice, datos duros, casos de la cátedra, resumen de fórmulas y escalas, y un simulacro final integrado (choice + oral con la regla de los 6 pasos).",
    "nota": "Es una guía de estudio orientativa. Las cifras y conductas se contrastaron con Giménez, Michans, el manual de Cirugía en Medicina General y los consensos de tu carpeta; las que difieren entre fuentes quedan marcadas en «Puntos a verificar con la cátedra». Verificá siempre con el material vigente de tu cátedra.",
    "unidades": ["UP 1", "UP 2", "UP 3", "UP 4", "UP 5", "UP 6", "UP 7", "UP 8", "UP 9", "UP 10", "UP 11"],
    "practica": {"modulo": "cirugia", "mode": "final"},
    "dias": [dia(d) for d in DIAS_A + DIAS_B] + [dia(CIERRE, True)],
}

usados = set()
for _d in plan["dias"]:
    for _t in _d["temas"]:
        for _k, _v in VERIFICAR.items():
            if _t["texto"].startswith(_k):
                _t["verificar"] = _v; usados.add(_k)
assert usados == set(VERIFICAR), set(VERIFICAR) - usados
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "data", "planes", "cirugia_final_up1_11.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(plan, f, ensure_ascii=False, indent=1)
tot = sum(d["horas"] for d in plan["dias"][:-1])
print("dias:", len(plan["dias"]), "temas:", sum(len(d["temas"]) for d in plan["dias"]), "horas contenido:", tot)
for d in plan["dias"]: print(round(d["horas"],1), d["unidad"], "|", d["titulo"][:70], "|", len(d["temas"]))
