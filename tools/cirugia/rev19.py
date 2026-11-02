# -*- coding: utf-8 -*-
"""Fisiopatologia (tercera tanda): fichas de traumatologia (CTO, Orrego), urologia (Manual SCHU 2025), vasculares (Schwartz 2015),
neurotrauma y nutricion (Michans 2002), biliar (Schwartz, Michans) y digestivas (Galindo). Todo redactado desde lo leido en cada capitulo."""
CONTENIDO = {}

def fisio(pid, items): CONTENIDO[pid] = {'fisiopatologia': items}

# ---- Traumatologia ----
fisio('cx-sindrome-compartimental', [
 'La presión tisular dentro de un compartimento osteofascial aumenta hasta ocluir la circulación muscular. Sube el contenido (edema por traumatismo, quemadura o reperfusión, hematoma de una fractura, infusión intracompartimental de líquido) o baja la distensibilidad (yeso o vendaje muy apretado, sutura de fascias a tensión) (Manual CTO).',
 'La isquemia sostenida produce necrosis muscular y nerviosa: primero dolor desproporcionado que aumenta con el estiramiento pasivo, después alteraciones sensitivas; el pulso distal suele conservarse porque solo se afecta la circulación muscular. La presión intracompartimental supera 30 a 40 mmHg, y las secuelas son retracciones por fibrosis y fracaso renal por mioglobinuria (Manual CTO).'])
fisio('cx-fracturas-generalidades', [
 'La consolidación secundaria o indirecta es la habitual cuando no hay inmovilización absoluta (yeso, férulas, fijadores externos, clavos endomedulares): se forma un callo, primero fibrocartilaginoso (blando) y luego óseo (duro). Tiene tres fases superpuestas: inflamatoria, de reparación y de remodelación (Orrego y Morán).',
 'Fase inflamatoria (hasta 1 a 2 semanas): las plaquetas del hematoma liberan mediadores y factores de crecimiento (IL, TGF-β, PDGF) con infiltración de neutrófilos y células mesenquimales. En la reparación, que dura meses, el hematoma es invadido por vasos, fibroblastos y condroblastos que forman una matriz fibrosa y cartilaginosa; luego el callo se reabsorbe y se remodela. A mayor desplazamiento o movilidad del foco, mayor callo; depende sobre todo de la vascularización perióstica (Orrego y Morán).'])

# ---- Urologia (Manual SCHU) ----
fisio('cx-retencion-aguda-orina', [
 'El vaciado vesical resulta de la fuerza expulsiva (presión del detrusor al contraerse más la del abdomen sobre la vejiga) frente a la resistencia del tracto de salida (cuello vesical, uretra proximal, esfínter externo y uretra distal). Toda retención es un desbalance entre ambos sistemas: falla el detrusor (menor trabajo muscular o mayor viscoelasticidad de la pared) o aumenta la resistencia de salida (Manual SCHU, cap. 12).'])
fisio('cx-itu-cistitis-pielonefritis', [
 'El mecanismo principal es el ascendente: los microorganismos entéricos pasan desde la uretra anterior y la piel periuretral hasta la vejiga, el uréter y el riñón, lo que explica la mayor frecuencia en mujeres por la anatomía uretral. Menos frecuente es la vía hematógena (2 %), propia de Staphylococcus aureus, Candida, Salmonella y Mycobacterium tuberculosis (Manual SCHU, cap. 13).',
 'La infección depende del equilibrio entre las defensas del huésped (moco y respuesta inmunológica de la mucosa vesical, pH bajo, osmolaridad y urea de la orina) y la virulencia de la cepa (pili que permiten el ascenso). Con catéter permanente la bacteria migra por la secreción mucopurulenta entre la sonda y la uretra y, a las 4 semanas, todos los pacientes tienen bacteriuria (Manual SCHU, cap. 13).'])
fisio('cx-cancer-pene', [
 'La fimosis es el factor de riesgo más importante (20 a 60 % de los pacientes la tiene; OR 16 para el carcinoma invasor y 1,7 para el in situ). Se suman las lesiones premalignas, el tabaco, el número de parejas sexuales y el VPH, que está en el 30 a 50 % de los invasores, sobre todo el VPH 16; la circuncisión neonatal protege (Manual SCHU, cap. 29).',
 'Los tumores del glande y del meato (centrales) se asocian al VPH y suelen ser carcinomas mal diferenciados; los carcinomas queratinizantes de bajo grado predominan en la piel prepucial (Manual SCHU, cap. 29).'])
fisio('cx-criptorquidia-teste-no-descendido', [
 'Desde los 6 meses la mayor temperatura inguinal o abdominal produce cambios histológicos y degeneración de células germinales: de 1 % en testículos normales a 20 % a los 2 años, 40 % a los 6 y 45 % a los 10, con espermatogonias que no completan su maduración (Manual SCHU, cap. 35).',
 'Esto se asocia a infertilidad y a mayor riesgo de cáncer testicular, más aún si el descenso se hace después de la pubertad. El testículo puede bajar hasta pasada la minipubertad de los 2 a 4 meses (Manual SCHU, cap. 35).'])
fisio('cx-hipospadias', [
 'Es una hipoplasia de los tejidos de la cara ventral del pene, más allá de la división del cuerpo esponjoso: meato ventral, prepucio alado y curvatura ventral (Manual SCHU, cap. 35).',
 'La etiología no está clara; se sospechan endocrinopatías, bajo peso al nacer, edad materna avanzada (por posible insuficiencia placentaria), diabetes materna y disruptores ambientales como pesticidas (Manual SCHU, cap. 35).'])
fisio('cx-cancer-prostata-riesgo-tratamiento', [
 'Los cánceres de la zona de transición suelen ser menos agresivos que los de la zona periférica (menor grado de Gleason, menor volumen extracapsular y menos metástasis, con mejor pronóstico tras la prostatectomía), pero su detección es más difícil por la localización anterior y porque simulan hiperplasia nodular (Manual SCHU, cap. 26).',
 'Los de la zona central son raros y poco estudiados, con un fenotipo basal-luminal mixto y mayor asociación con la raza negra. El sistema de Gleason califica la arquitectura glandular de la biopsia de 2 a 10; la ISUP lo reformuló en grupos de grado porque tendía a subestimar la agresividad (Manual SCHU, cap. 26).'])
fisio('cx-cancer-via-urinaria-alta', [
 'Gran parte de los factores son los del cáncer de vejiga. El tabaquismo está en cerca del 65 % de los casos y multiplica el riesgo de 2,5 a 7 veces, con efecto dosis-dependiente y peor pronóstico (Manual SCHU, cap. 24).',
 'Otros factores: síndrome de Lynch (mutaciones de reparación del ADN; sospechar si hay menos de 60 años o antecedentes del espectro) y, de particular relevancia en Chile, la exposición al arsénico, con 34 % de las muertes por este tumor en Antofagasta (Manual SCHU, cap. 24).'])
fisio('cx-trauma-vesical-uretral', [
 'Los traumatismos cerrados de la uretra son por golpe perineal (uretra anterior, bulbar) o por fractura pélvica (uretra posterior). Otras causas: actividad sexual (fractura de pene, anillos constrictores), cuerpos extraños y lesiones iatrogénicas por sondaje o cirugía urológica, con falsa vía en la región penobulbar, la más vulnerable (Manual SCHU, cap. 34).'])

# ---- Vasculares (Schwartz) ----
fisio('cx-aneurisma-aorta-toracica-diseccion', [
 'Causas del aneurisma torácico: degeneración inespecífica de la capa media, disección, alteraciones genéticas (síndromes de Marfan, Loeys-Dietz y Ehlers-Danlos, aneurismas aórticos familiares, aorta bivalva), dilatación posestenótica, infección, aortitis (Takayasu, células gigantes) y traumatismo (Schwartz, cap. 22).',
 'Marfan es una alteración autosómica dominante del tejido conjuntivo con talla alta, paladar ojival, hipermovilidad, alteraciones del cristalino, prolapso mitral y aneurismas aórticos. La disección se clasifica por los segmentos aórticos afectados (DeBakey y Stanford), no por el sitio del desgarro de la íntima (Schwartz, cap. 22).'])
fisio('cx-raynaud-buerger', [
 'Raynaud: vasoespasmo periférico provocado por frío, tabaco o estrés, que da palidez, cianosis y luego hiperemia reactiva. La causa precisa no está aclarada; se destacan el aumento y la hipersensibilidad de los receptores adrenérgicos α2 y alteraciones de la respuesta termorreguladora controlada por el simpático. Entre el 11 y el 65 % evoluciona luego a una colagenopatía (Schwartz, cap. 23).',
 'Buerger: trombosis de arterias y venas de pequeño y mediano calibre con infiltrado de polimorfonucleares, microabscesos y células gigantes; en la fase crónica hay recanalización y en la terminal trombos organizados y fibrosis. La causa se desconoce, pero el tabaco es esencial para el diagnóstico y la progresión (Schwartz, cap. 23).'])
fisio('cx-quiste-coledoco', [
 'Más del 90 % tiene una anomalía de la unión pancreatobiliar: el conducto pancreático desemboca en el colédoco más de 1 cm proximal a la ampolla. El conducto común largo deja pasar libremente secreciones pancreáticas a la vía biliar, lo que causa inflamación, mayor presión biliar y debilidad de la pared hasta formar el quiste (Schwartz, cap. 32).',
 'Michans propone que el reflujo pancreaticobiliar debilita de forma progresiva la pared del colédoco, y describe dos mecanismos de la fisiopatología: el reflujo libre de ambas secreciones y su estasis por mal vaciamiento del sistema ductal (Michans, cap. 38).'])

# ---- Neurotrauma, nutricion y biliar (Michans) ----
fisio('cx-traumatismo-encefalocraneano', [
 'Las lesiones primarias son el resultado de la absorción de energía en el impacto (cuero cabelludo, injuria difusa, fractura, contusiones corticales, neumoencéfalo, hemorragia subaracnoidea, lesiones vasculares y de los pares craneanos). Las secundarias derivan de las primarias por mecanismos simples (hematomas) o complejos (hiperemia, edema, isquemia, hidrocefalia, hipertensión endocraneana) (Michans, cap. 14).',
 'En la hipertensión endocraneana el edema vasogénico aumenta el volumen cerebral y la presión; si no se compensa bajando el flujo cerebral hay hipoxia e isquemia, el metabolismo pasa a glucólisis anaerobia, aparece acidosis (un potente vasodilatador cerebral), sube el volumen sanguíneo cerebral y cae más la perfusión. La hipotensión sistémica y el shock son el factor concausal más importante de la lesión isquémica (Michans, cap. 14).'])
fisio('cx-soporte-nutricional-quirurgico', [
 'La desnutrición calórico-proteica se desarrolla por ingesta insuficiente, alteración de la digestión-absorción o del metabolismo, o aumento de los requerimientos por hipermetabolismo (más producción y uso de calorías) o hipercatabolismo (más degradación proteica y pérdida urinaria de nitrógeno). En el paciente hospitalizado puede aparecer con rapidez cuando actúan estos factores a la vez (Michans, cap. 5).',
 'La depleción de las reservas energéticas y proteicas altera funciones y estructuras: peor cicatrización (dehiscencias), disfunción inmunológica con más infecciones, problemas respiratorios, debilidad muscular, hipotrofia de la mucosa intestinal con pérdida de la barrera y translocación bacteriana, e hipoalbuminemia (Michans, cap. 5).'])
fisio('cx-atresia-biliar', [
 'Proceso inflamatorio destructivo de causa desconocida que afecta los conductos biliares extrahepáticos del recién nacido, con ensanchamiento de los tractos portales por edema y fibrosis, arquitectura hepática conservada y estasis biliar en hepatocitos y canalículos (Michans, cap. 38).',
 'Hay tres teorías sobre el origen: alteración de la vascularización de los conductos extrahepáticos en la vida intrauterina, alteraciones del desarrollo de la unión coledocopancreática en ciertas trisomías (17, 18 y 21) y la teoría viral que relaciona la hepatitis viral con la atresia y el quiste coledociano (Michans, cap. 38).'])

# ---- Digestivas (Galindo) ----
fisio('cx-ulcera-peptica-hp', [
 'La úlcera nace del desequilibrio entre factores defensivos (capa preepitelial de moco y bicarbonato, epitelio con secreción de moco, bicarbonato y prostaglandinas, y microcirculación mucosa) y agresivos (ácido clorhídrico y pepsina, infección por H. pylori, AINE, tabaco, alcohol, mala alimentación y estrés); destacan el ácido, el H. pylori y los AINE (Galindo, cap. 206).'])
fisio('cx-sindromes-posgastrectomia', [
 'Dumping: el paso rápido de contenido hiperosmolar al yeyuno desplaza líquido desde el compartimento vascular (hipovolemia relativa y transitoria) y libera péptidos vasoactivos (serotonina, GIP, VIP, neurotensina). La hipoglucemia tardía se atribuye a la absorción brusca de hidratos de carbono con liberación de enteroglucagón e insulina (Galindo, cap. 217).',
 'Gastritis alcalina: la presencia sostenida de ácidos y sales biliares daña la barrera mucosa y permite la retrodifusión de hidrogeniones. Asa aferente: mala evacuación del asa de la anastomosis gastroyeyunal, con acúmulo biliopancreático, dilatación y proliferación bacteriana que causa diarrea y malabsorción. Estasis de la Y de Roux: la sección del yeyuno interrumpe el marcapasos duodenal (Galindo, cap. 217).'])
fisio('cx-colangitis-esclerosante-primaria', [
 'Se desconoce la causa, pero se la considera inmunológica en pacientes con predisposición genética: mayor frecuencia de HLA-B8, anticuerpos citoplasmáticos perinucleares antineutrófilos, hipergammaglobulinemia con IgM aumentada y destrucción de conductos biliares con infiltrado linfocitario. Coexiste con enfermedades autoinmunes, sobre todo la colitis ulcerosa (Galindo, cap. 445).',
 'Se produce una reacción fibrosa en los conductos biliares que avanza del espacio porta con infiltrado linfocitario, edema y proliferación ductal hasta la fibrosis del parénquima y la cirrosis biliar, en cuatro estadios (portal, periportal, septal y cirrótico). La coloproctectomía no altera su evolución (Galindo, cap. 445).'])
fisio('cx-trauma-duodenopancreatico', [
 'Son órganos retroperitoneales (el duodeno lo es en toda su extensión salvo la mitad anterior de su primera porción) y comparten irrigación; por eso la lesión pasa desapercibida con frecuencia y se acompaña de lesiones asociadas. Un golpe en el epigastrio puede estallar el duodeno al aumentar de golpe la presión en un asa cerrada entre el píloro y el ángulo de Treitz (Galindo, cap. 491).',
 'Hay alta frecuencia de fugas o dehiscencias en cualquier reparación y el diagnóstico de las complicaciones suele ser confuso y tardío (Galindo, cap. 491).'])
fisio('cx-polipos-gastricos', [
 'Los pólipos hiperplásicos (regenerativos) tienen glándulas hiperplásicas y elongadas con infiltrado linfocitario; no son verdaderos tumores y se considera que no se malignizan. Los de glándulas fúndicas, con aumento de células parietales y principales normales, se localizan en la región productora de ácido y pueden involucionar; el uso prolongado de IBP favorecería su producción (Galindo, cap. 220).',
 'Los adenomatosos (10 % de los pólipos) tienen riesgo de malignización de cerca del 10 %. Los síndromes de poliposis múltiples (adenomatosa familiar, Peutz-Jeghers, Cowden, Cronkhite-Canada) los asocian a otras lesiones (Galindo, cap. 220).'])
