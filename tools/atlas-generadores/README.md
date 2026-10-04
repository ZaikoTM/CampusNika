# Generadores del Atlas de acreditaciones

Scripts que producen los JSON, las imágenes del instrumental y los modelos 3D del Atlas (`data/acreditaciones/*`, `assets/instrumental/*`, `assets/anatomia/*`).
Se guardan acá para poder regenerar o ajustar el contenido; **no forman parte de la web**.

- `siam/`: sonda vesical, tacto rectal, intubación endotraqueal, RCP avanzado y artrocentesis. `t_gen.js <id> [area]` prueba el reconocimiento del chat con todas las frases modelo; `audit.js` verifica la consistencia de los datos.
- `sim/`: área Salud Integral de la Mujer (anamnesis ginecológica y obstétrica, cálculo de EG y FPP, examen ginecológico, obstétrico y mamario). `gen_md_sim.py` arma los documentos `REVISION_CLINICA_SIM_*.md`.
- Los `gen_*` de imágenes se concatenan con `gen_art_head.py` (funciones SVG comunes): `cat gen_art_head.py gen_sim_xxx.py > gen.py && python gen.py`.
- Los `bl_*.py` corren en Blender 3.6 en modo headless (`blender -b -P bl_xxx.py`) y exportan GLB con compresión Draco.
- Las rutas son absolutas de la computadora de desarrollo (Windows): ajustarlas si se usan en otro equipo.

Licencias de los modelos: Human Reference Atlas (CC BY 4.0), BodyParts3D (CC BY-SA 2.1 JP), Z-Anatomy (CC BY-SA 4.0), «Clasped hands» de Nancy/Lanzi Luo (CC BY). El feto, la vagina, el espéculo, las manos y los instrumentos son procedurales (creados para el Atlas).
