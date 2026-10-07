# Revisión clínica · S.I.A.M. choices

Auditoría del banco `data/UP1..UP9_siam.json` (892 preguntas). Archivos fuente y herramientas: `tools/siam-banco/`.

## Qué se corrigió en las 892 preguntas

- **Ortografía**: ~110 correcciones puntuales (tildes faltantes y errores de tipeo: *aministración, broncoespamo, calremia, dextrucción, dupación, moviemiento, périda, ronpatía → roncopatía*, etc.), anglicismos sueltos (*Because, mediated, extracellular, interstitial, Trimethoprim*) y "hipertiroidismo felino".
- **Notación**: `K^+`, `V_1`, `Ca^{2+}`, `\sqrt{RR}` → `K⁺`, `V₁`, `Ca²⁺`, `√RR`; entidades HTML (`&gt;`) → símbolos.
- **Gramática**: conjunción *y → e* ante `i-`/`hi-`; palabras repetidas.
- **Longitud de opciones**: antes la correcta era la más larga en el **79 %** de las preguntas (el azar daría 25 %). Ahora lo es en el **34 %**, y nunca supera 1,3 veces a la opción más larga que no es la correcta.
- **Letras correctas parejas**: A 225 · B 224 · C 223 · D 220.
- **Sin menciones a UNER** (0).

## ❓ Qué conviene validar (NotebookLM)

Para equilibrar longitudes se **reescribieron o ampliaron opciones**. La justificación detallada (Nikamed+) está redactada contra el texto original de cada opción, así que conviene verificar:
1. que la opción correcta siga siendo la única correcta tras acortarla;
2. que los distractores ampliados sigan siendo claramente incorrectos y coherentes con lo que dice la justificación.

| UP | Opciones reescritas | Distractor ampliado con "cola" | Enunciado corregido |
|---|---|---|---|
| UP1 | 2 | 24 | 0 |
| UP2 | 28 | 43 | 1 |
| UP3 | 51 | 41 | 0 |
| UP4 | 85 | 54 | 0 |
| UP5 | 60 | 54 | 0 |
| UP6 | 59 | 42 | 0 |
| UP7 | 34 | 49 | 0 |
| UP8 | 19 | 44 | 0 |
| UP9 | 18 | 48 | 0 |

### IDs con opciones reescritas

**UP1**: UP1-089, UP1-100

**UP2**: UP2-005, UP2-007, UP2-008, UP2-010, UP2-011, UP2-012, UP2-013, UP2-015, UP2-016, UP2-017, UP2-018, UP2-020, UP2-031, UP2-035, UP2-039, UP2-046, UP2-051, UP2-066, UP2-069, UP2-071, UP2-075, UP2-076, UP2-079, UP2-080, UP2-087, UP2-092, UP2-095, UP2-097

**UP3**: UP3-009, UP3-012, UP3-015, UP3-018, UP3-019, UP3-025, UP3-036, UP3-042, UP3-044, UP3-045, UP3-047, UP3-050, UP3-051, UP3-052, UP3-054, UP3-055, UP3-057, UP3-059, UP3-062, UP3-064, UP3-065, UP3-067, UP3-068, UP3-069, UP3-070, UP3-071, UP3-072, UP3-073, UP3-074, UP3-077, UP3-078, UP3-079, UP3-080, UP3-082, UP3-084, UP3-085, UP3-086, UP3-087, UP3-088, UP3-089, UP3-090, UP3-091, UP3-092, UP3-093, UP3-094, UP3-095, UP3-096, UP3-097, UP3-098, UP3-099, UP3-100

**UP4**: UP4-001, UP4-002, UP4-004, UP4-005, UP4-006, UP4-008, UP4-009, UP4-010, UP4-011, UP4-012, UP4-013, UP4-014, UP4-016, UP4-019, UP4-020, UP4-021, UP4-022, UP4-026, UP4-027, UP4-029, UP4-030, UP4-031, UP4-032, UP4-034, UP4-035, UP4-036, UP4-037, UP4-038, UP4-039, UP4-040, UP4-041, UP4-042, UP4-043, UP4-044, UP4-045, UP4-046, UP4-047, UP4-048, UP4-049, UP4-050, UP4-051, UP4-052, UP4-053, UP4-054, UP4-055, UP4-056, UP4-057, UP4-058, UP4-059, UP4-060, UP4-061, UP4-062, UP4-063, UP4-064, UP4-066, UP4-068, UP4-069, UP4-070, UP4-072, UP4-073, UP4-074, UP4-075, UP4-077, UP4-078, UP4-079, UP4-080, UP4-081, UP4-082, UP4-083, UP4-084, UP4-085, UP4-086, UP4-087, UP4-088, UP4-089, UP4-090, UP4-092, UP4-093, UP4-094, UP4-095, UP4-096, UP4-097, UP4-098, UP4-099, UP4-100

**UP5**: UP5-010, UP5-012, UP5-015, UP5-018, UP5-020, UP5-022, UP5-028, UP5-029, UP5-031, UP5-032, UP5-035, UP5-037, UP5-038, UP5-040, UP5-045, UP5-049, UP5-050, UP5-052, UP5-054, UP5-055, UP5-056, UP5-058, UP5-060, UP5-061, UP5-063, UP5-064, UP5-066, UP5-067, UP5-068, UP5-069, UP5-070, UP5-071, UP5-072, UP5-073, UP5-074, UP5-075, UP5-076, UP5-077, UP5-078, UP5-079, UP5-080, UP5-081, UP5-082, UP5-083, UP5-084, UP5-085, UP5-086, UP5-087, UP5-088, UP5-089, UP5-090, UP5-091, UP5-092, UP5-093, UP5-094, UP5-095, UP5-096, UP5-097, UP5-098, UP5-099

**UP6**: UP6-013, UP6-025, UP6-027, UP6-029, UP6-030, UP6-031, UP6-032, UP6-033, UP6-035, UP6-036, UP6-037, UP6-038, UP6-039, UP6-040, UP6-042, UP6-043, UP6-045, UP6-046, UP6-048, UP6-049, UP6-051, UP6-052, UP6-053, UP6-055, UP6-056, UP6-057, UP6-058, UP6-059, UP6-062, UP6-063, UP6-064, UP6-066, UP6-067, UP6-069, UP6-070, UP6-071, UP6-072, UP6-073, UP6-074, UP6-075, UP6-076, UP6-077, UP6-078, UP6-080, UP6-081, UP6-083, UP6-084, UP6-085, UP6-086, UP6-087, UP6-088, UP6-089, UP6-090, UP6-091, UP6-092, UP6-093, UP6-095, UP6-097, UP6-098

**UP7**: UP7-010, UP7-016, UP7-019, UP7-038, UP7-039, UP7-048, UP7-051, UP7-052, UP7-054, UP7-056, UP7-059, UP7-063, UP7-065, UP7-068, UP7-071, UP7-072, UP7-073, UP7-076, UP7-077, UP7-078, UP7-080, UP7-084, UP7-085, UP7-086, UP7-087, UP7-089, UP7-090, UP7-091, UP7-092, UP7-093, UP7-094, UP7-095, UP7-098, UP7-099

**UP8**: UP8-011, UP8-015, UP8-017, UP8-018, UP8-019, UP8-028, UP8-031, UP8-052, UP8-056, UP8-057, UP8-059, UP8-066, UP8-071, UP8-072, UP8-076, UP8-077, UP8-078, UP8-079, UP8-094

**UP9**: UP9-009, UP9-011, UP9-025, UP9-027, UP9-035, UP9-057, UP9-058, UP9-063, UP9-068, UP9-069, UP9-074, UP9-077, UP9-078, UP9-091, UP9-095, UP9-096, UP9-098, UP9-099

### Cómo reconstruir el banco

```bash
PYTHONIOENCODING=utf8 python tools/siam-banco/construir_banco.py   # choices (data/UPn_siam.json)
PYTHONIOENCODING=utf8 python tools/siam-banco/construir_escrito.py  # escrito (data/escrito_siam.json)
PYTHONIOENCODING=utf8 python tools/siam-banco/construir_sala.py <docx> # sala de estudio (data/siam_data.json)
PYTHONIOENCODING=utf8 python tools/siam-banco/medir.py              # métricas de longitud y letras
```
