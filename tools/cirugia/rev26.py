# -*- coding: utf-8 -*-
"""Fisiopatologia (decima tanda) desde Harrison 21.ª ed. (2023): pie diabetico (cap. 405), tiroides (384 y 385), enfermedad anorrectal (328) e hipoparatiroidismo (410)."""
CONTENIDO = {}

def fisio(pid, items): CONTENIDO[pid] = {'fisiopatologia': items}

fisio('cx-pie-diabetico', [
 'Contribuyen cuatro factores: la neuropatía, la biomecánica anormal del pie, la enfermedad arterial periférica y la cicatrización deficiente. La neuropatía sensitiva quita los mecanismos protectores y permite traumatismos mayores o lesiones menores constantes, a menudo sin que el paciente lo sepa; la cinestesia alterada carga el peso de forma desigual y forma callos y úlceras (Harrison, cap. 405).',
 'La neuropatía sensitiva y motora altera la mecánica muscular y produce deformidades (dedo en martillo, dedos en garra, cabezas metatarsianas prominentes, articulación de Charcot); la autónoma causa anhidrosis y cambios del flujo superficial, con resequedad y fisuras de la piel. La enfermedad arterial periférica y la mala cicatrización impiden resolver las lesiones mínimas, que se extienden y se infectan (Harrison, cap. 405).',
 'Muchos diabéticos desarrollan una úlcera en el pie (primer ortejo y región metatarsofalángica) y el riesgo de amputación por ella es de 14 a 24 %. Son factores de riesgo el sexo masculino, la diabetes de más de 10 años, la neuropatía, las deformidades, la enfermedad arterial periférica, el tabaquismo, las úlceras o amputaciones previas, el mal control glucémico y la nefropatía (Harrison, cap. 405).'])
fisio('cx-patologia-benigna-tiroides', [
 'En la enfermedad de Graves (60 a 80 % de las tirotoxicosis) hay autoanticuerpos contra el receptor de TSH (TRAb, inmunoglobulinas estimulantes del tiroides, TSI); también hay anticuerpos antiperoxidasa y antitiroglobulina hasta en el 80 %. Afecta al 2 % de las mujeres, con frecuencia diez veces menor en varones, y la prevalencia aumenta con la ingesta alta de yodo (Harrison, cap. 384).',
 'Las TSI elevadas atraviesan la placenta y pueden producir tirotoxicosis neonatal. En la oftalmopatía las citocinas son fundamentales: los músculos extraoculares se infiltran con linfocitos T activados (Harrison, cap. 384).',
 'El bocio multinodular reemplaza el parénquima con nódulos por lo general hiperplásicos. La enfermedad nodular se palpa en el 3 a 7 % de los adultos y la ecografía halla nódulos en más del 50 %, casi todos de menos de 1 cm (Harrison, cap. 385).'])
fisio('cx-complicaciones-tiroidectomia', [
 'El hipoparatiroidismo adquirido por cirugía del cuello sigue siendo más frecuente que el hereditario, pero su frecuencia disminuyó con las técnicas que respetan las paratiroides y con el menor uso de la cirugía en el hipertiroidismo (Harrison, cap. 410).',
 'La PTH mantiene el calcio extracelular; su déficit produce hipocalcemia con calcificaciones extraóseas, síntomas extrapiramidales, edema de papila e hipertensión intracraneal, alteraciones ungueales, del cabello y cataratas, que suelen revertir al corregir la hipocalcemia. La hipocalcemia con hipomagnesemia se acompaña de falla en la liberación de PTH y menor respuesta a ella (Harrison, cap. 410).'])
fisio('cx-fisura-anal', [
 'La defecación puede traumatizar el conducto anal, sobre todo en su porción posterior. La irritación eleva la presión de reposo del esfínter interno y, como los vasos que irrigan el esfínter y la mucosa penetran lateralmente, el mayor tono produce isquemia relativa en la fisura y dificulta la cicatrización (Harrison, cap. 328).',
 'Se relaciona con estreñimiento, diarrea, infecciones, traumatismo perianal y enfermedad de Crohn. Una fisura que no está en posición anterior o posterior obliga a pensar en tuberculosis, sífilis, Crohn o cáncer (Harrison, cap. 328).'])
fisio('cx-absceso-fistula-anal', [
 'El absceso anorrectal es una cavidad llena de líquido por infección de las glándulas que rodean al conducto anal, que normalmente liberan moco que facilita la defecación; si penetra materia fecal en ellas, se infectan y forman abscesos (Harrison, cap. 328).',
 'Se ubican en la región perianal en el 40 a 50 %, isquiorrectales en el 20 a 25 %, interesfintéricos en el 2 a 5 % y supraelevadores en el 2,5 %. Son 3 veces más frecuentes en varones y más prevalentes en diabéticos, hematológicos, enfermedad inflamatoria intestinal y VIH; las infecciones perianales repetidas obligan a buscar estas condiciones (Harrison, cap. 328).'])
