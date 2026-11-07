# -*- coding: utf-8 -*-
# Genera data/planes/gineco_final_up1_4.json: base = plan del parcial integrador (UP 1-3) corregido y ampliado + Unidad 4.
# Uso: python tools/plan_gineco_final/build.py   (lee gineco_integrador_up1_3.json, que no se modifica)
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from up4 import DIAS_UP4
from patches import HORAS, SETS, ADDS, DDS, DDADD, CHK
from cierre import CIERRE

PLANES = os.path.join(HERE, "..", "..", "data", "planes")
base = json.load(open(os.path.join(PLANES, "gineco_integrador_up1_3.json"), encoding="utf-8"))
dias = [d for d in base["dias"] if d["unidad"] != "Integración"]
assert len(dias) == 15 and len(HORAS) == 15

def tema(t, unidad):
    return dict(t, hecho=False, manual=False, unidad=unidad)

for i, d in enumerate(dias):
    d["horas"] = float(HORAS[i])
    s = json.dumps(d, ensure_ascii=False)
    s = s.replace("(hoja de ruta: 18 meses)", "(12 meses; si persiste positivo, colposcopía)")
    d.clear(); d.update(json.loads(s))
    for (di, pref), cambios in SETS.items():
        if di != i:
            continue
        hit = [t for t in d["temas"] if t["texto"].startswith(pref)]
        assert hit, (i, pref)
        hit[0].update(cambios)
    for t in ADDS.get(i, []):
        d["temas"].append(tema(t, d["unidad"]))
    for pref, nuevo in DDS.get(i, []):
        hit = [k for k, x in enumerate(d["datos_duros"]) if x.startswith(pref)]
        assert hit, (i, pref)
        d["datos_duros"][hit[0]] = nuevo
    d["datos_duros"] += DDADD.get(i, [])
    for c in CHK.get(i, []):
        d["checklist"].append({"texto": c, "hecho": False})
    d["agenda"] = []

def nuevo_dia(x):
    return {"titulo": x["titulo"], "horas": x["horas"], "unidad": x["unidad"], "caso": x["caso"],
            "temas": [tema(t, x["unidad"]) for t in x["temas"]], "datos_duros": x["datos_duros"], "agenda": [],
            "checklist": [{"texto": c, "hecho": False} for c in x["checklist"]]}

todos = dias + [nuevo_dia(x) for x in DIAS_UP4] + [nuevo_dia(CIERRE)]
plan = {
    "id": "gineco_final_up1_4", "materia": "ginecologia", "tipo": "final",
    "titulo": "Final integrador · Ginecología y Obstetricia (UP 1 a 4)",
    "subtitulo": "Plan modelo · Examen final (escrito y oral)",
    "descripcion": "El parcial integrador (UP 1 a 3) revisado y ampliado, más la Unidad 4 completa (climaterio, patología endometrial, cáncer de cuello, uroginecología y cáncer de mama): temas con trampas, datos duros, casos de la cátedra y un cierre con simulacro escrito y oral con el caso integrador.",
    "nota": "Es una guía de estudio orientativa. Las cifras y conductas se contrastaron con el material de la cátedra, los consensos FASGO/SOGIBA y las guías nacionales de tu carpeta; las que difieren entre fuentes están en «Puntos a verificar con la cátedra». Verificá siempre con el material vigente.",
    "unidades": ["UP 1", "UP 2", "UP 3 - Sección 1", "UP 3 - Sección 2", "UP 3 - Sección 3", "UP 3 - Sección 4", "UP 3 - Sección 5", "UP 4"],
    "practica": {"modulo": "ginecologia", "mode": "final"},
    "dias": todos,
}
out = os.path.join(PLANES, "gineco_final_up1_4.json")
json.dump(plan, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("dias:", len(todos), "temas:", sum(len(d["temas"]) for d in todos), "horas contenido:", sum(d["horas"] for d in todos[:-1]))
for d in todos:
    print(d["horas"], d["unidad"], "|", d["titulo"][:62], "|", len(d["temas"]))
