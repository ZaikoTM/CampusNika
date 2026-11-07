# -*- coding: utf-8 -*-
# Correcciones y ampliaciones de las UP 1 a 3 (base: plan del parcial integrador).
# Cada patch: (índice de día 0-14, acciones). Acciones: set (cambia un tema por prefijo), add (agrega un tema),
# dd (reemplaza un dato duro por prefijo), dd_add, chk_add.
from up4 import T

HORAS = [5, 6, 7, 8, 8, 8, 8, 6, 6, 8, 9, 9, 9, 9, 8]   # una por día base (D1..D15)

SETS = {}   # (dia, prefijo) -> dict(detalle=..., trampa=..., prio=...)
ADDS = {}   # dia -> [T(...)]
DDS = {}    # dia -> [(prefijo, nuevo)]
DDADD = {}  # dia -> [str]
CHK = {}    # dia -> [str]

# ------------------------------------------------------------ D1 · UP 1 · fisiología
ADDS[0] = [
  T("Ciclo menstrual: fases ovárica y endometrial", "alta",
    "Fase folicular (ovárica) = proliferativa (endometrio) bajo estradiol; ovulación 24-36 h después del pico de LH; fase lútea = secretora bajo progesterona; sin embarazo cae el cuerpo lúteo y llega la menstruación. Ciclo normal: 24 a 38 días y sangrado ≤ 8 días. Lo variable es la fase folicular. En la perimenopausia y en el SOP la anovulación produce estímulo estrogénico sin oposición.",
    "Decir que la progesterona domina la fase proliferativa."),
  T("Perspectiva de género, modelo biopsicosocial y comunicación (SPIKES)", "media",
    "Atención integral de la mujer más allá del modelo «mujer-útero»: autocuidado y derechos. Malas noticias con SPIKES (entorno, percepción, invitación, conocimiento con frase de advertencia, empatía y estrategia). Situaciones difíciles: reconducción por objetivos y sinceramiento.",
    ""),
  T("Mortalidad materna: modelo de las tres demoras", "sec",
    "Thaddeus y Maine: demora en decidir buscar atención (familia), demora en llegar al servicio (distancia y costos) y demora en recibir el tratamiento adecuado (calidad e insumos: sangre, antibióticos, sulfato de magnesio).",
    ""),
]
CHK[0] = ["Expliqué las tres demoras con un ejemplo de cada una."]

# ------------------------------------------------------------ D2 · UP 1 · semiología
ADDS[1] = [
  T("Anamnesis, examen físico ginecológico y examen mamario", "alta",
    "Historia gineco-obstétrica (G P A C, menarca, ciclos, FUM, métodos, vida sexual, antecedentes). Examen: inspección, especuloscopía, tacto bimanual y examen mamario (inspección, palpación de las mamas y las axilas). Cálculo de EG y FPP con regla de Naegele. Consentimiento, privacidad y trato respetuoso.",
    ""),
]
CHK[1] = ["Armé una historia gineco-obstétrica (G P A C) con la paridad de un caso."]

# ------------------------------------------------------------ D3 · UP 2 · infancia y pubertad
SETS[(2, "Desarrollo, caracteres sexuales")] = dict(
    texto="Ginecología infantojuvenil: vulvovaginitis, sinequia de labios y sospecha de abuso", prio="media",
    detalle="Vulvovaginitis en la niña: la inespecífica es la más frecuente (higiene, irritantes, cuerpo extraño ante flujo sanguinolento o fétido). Sinequia de labios menores: estrógenos tópicos. Ante sospecha de abuso sexual: examen cuidadoso, no revictimizar, notificar y proteger. Educación sexual integral en la infancia y la adolescencia.")
ADDS[2] = [
  T("Amenorrea primaria: algoritmo diagnóstico", "alta",
    "Ausencia de menarca a los 15 años (o a los 13 sin caracteres sexuales secundarios). Orden: caracteres sexuales, β-hCG, FSH, LH y prolactina, ecografía pelviana y cariotipo. Útero o vagina (Rokitansky, Morris, himen imperforado), ovario (Turner 45,X con FSH alta y talla baja; disgenesia gonadal) y hipotálamo-hipófisis (retraso constitucional, Kallmann). FSH alta = origen gonadal; FSH baja = central.",
    "Pedir una resonancia de silla turca antes del laboratorio hormonal."),
  T("Pubertad precoz: diagnóstico y tratamiento", "media",
    "Precoz: telarca antes de los 8 años o menarca antes de los 9-10. Central (dependiente de GnRH, LH > 5 UI/L tras estímulo): tratamiento con análogos de GnRH. Periférica: causa gonadal o suprarrenal. Evaluar edad ósea.",
    "Tratar con análogos de GnRH una pubertad precoz periférica."),
]
DDADD[2] = ["Amenorrea primaria: FSH alta, origen gonadal (Turner 45,X); FSH baja, central; útero ausente con cariotipo 46,XX: Rokitansky."]

# ------------------------------------------------------------ D4 · UP 3 · S1 anticoncepción
SETS[(3, "Otros métodos y marco legal")] = dict(
    prio="alta",
    detalle="Anticoncepción de emergencia (AHE): levonorgestrel 1,5 mg en dosis única lo antes posible (dentro de las 72 h; hasta 120 h con menor eficacia); DIU de cobre dentro de los 5 días como método de mayor eficacia. Métodos de barrera, abstinencia periódica y coitus interruptus (menos eficaces). Anticoncepción quirúrgica (Ley 26.130), LARCs (implante y DIU), consejería en salud sexual y reproductiva, doble protección e identidad de género.")
ADDS[3] = [
  T("Anticoncepción en el posparto y el posaborto", "media",
    "Anticoncepción reversible de larga duración (implante y DIU) inmediata tras el parto o el aborto. Lactancia: progestágenos solos; los combinados están contraindicados antes de las 6 semanas (Cat. 4) y no se prefieren hasta los 6 meses. MELA: lactancia exclusiva, amenorrea y menos de 6 meses.",
    "Indicar ACO combinados a una puérpera de 4 semanas que amamanta."),
]

# ------------------------------------------------------------ D5 · UP 3 · S1 ITS y EPI
SETS[(4, "EPI e indicaciones de internación")] = dict(
    detalle="Diagnóstico clínico; con los criterios mínimos se inicia el tratamiento empírico: dolor o sensibilidad uterina y/o anexial y dolor a la movilización cervical (fiebre > 38,3 °C, leucocitosis o flujo mucopurulento aumentan la especificidad, pero su ausencia no descarta). Internación: embarazo, sin respuesta al tratamiento ambulatorio a las 72 h, enfermedad severa (náuseas, vómitos, fiebre alta), absceso tubo-ovárico, intolerancia oral o imposibilidad de seguimiento. Ambulatorio: ceftriaxona 500 mg IM única + doxiciclina 100 mg c/12 h + metronidazol 500 mg c/12 h por 14 días, con reevaluación a las 72 h. Hospitalario: clindamicina 900 mg c/8 h EV + gentamicina 3-5 mg/kg c/24 h, o ceftriaxona 1 g EV + doxiciclina + metronidazol; a las 24-48 h de mejoría se pasa a la vía oral hasta completar 14 días. Tratar a las parejas de los últimos 60 días. No retirar el DIU salvo mala evolución.",
    trampa="Omitir la cobertura de anaerobios, o retirar el DIU de entrada.")
SETS[(4, "Tricomoniasis y sífilis")] = dict(
    prio="alta",
    texto="Tricomoniasis y sífilis (guía MSAL)",
    detalle="Tricomoniasis: cérvix en fresa; metronidazol 2 g VO única o 500 mg c/12 h por 7 días; se trata a la pareja. Sífilis: chancre indoloro y VDRL; en la embarazada, penicilina G benzatínica 2,4 M UI IM: 2 dosis semanales si tiene menos de 1 año de evolución y 3 dosis si tiene más de 1 año o duración desconocida; neurosífilis: penicilina G sódica. Seguimiento con VDRL mensual hasta el parto; tratar siempre a la pareja; si se interrumpe, se reinicia. La alérgica verdadera se desensibiliza (no hay alternativa eficaz en el embarazo).")

SETS[(4, "Candidiasis, herpes, chancroide")] = dict(
    detalle="Chancroide (Haemophilus ducreyi): úlcera genital dolorosa con adenopatía inguinal supurada; azitromicina 1 g VO única. Linfogranuloma venéreo (Chlamydia L1-L3): úlcera transitoria y adenopatía inguinal con «signo del surco»; doxiciclina 100 mg c/12 h por 21 días. Candidiasis y herpes: ver el tema siguiente.")

ADDS[4] = [
  T("Cervicitis por Chlamydia y gonococo, candidiasis y herpes genital", "media",
    "Chlamydia y gonococo: ceftriaxona 500 mg IM única + azitromicina 1 g VO (o doxiciclina 100 mg c/12 h por 7 días); tratar a la pareja y estudiar otras ITS. Candidiasis: fluconazol 150 mg VO única o clotrimazol local; no se trata a la pareja de rutina. Herpes genital: aciclovir 400 mg c/8 h por 7-10 días; en el embarazo cerca del término, cesárea si hay lesiones activas.",
    ""),
]
DDS[4] = [("EPI hospitalaria", "EPI hospitalaria: clindamicina 900 mg c/8 h EV + gentamicina 3-5 mg/kg c/24 h (o ceftriaxona 1 g EV + doxiciclina + metronidazol); pasar a VO a las 24-48 h de mejoría hasta 14 días.")]
DDADD[4] = ["Sífilis en el embarazo (MSAL): < 1 año, 2 dosis de 2,4 M UI de penicilina G benzatínica; > 1 año, 3 dosis; VDRL mensual; tratar a la pareja."]

# ------------------------------------------------------------ D6 · UP 3 · S1 VPH
ADDS[5] = [
  T("Guía 2022: triage, autotoma y manejo de la citología anormal", "alta",
    "Tamizaje: citología hasta los 29 años (anual y, tras 2 negativas, cada 3 años); test de VPH desde los 30 años, cada 5 años si es negativo. Test de VPH positivo: triage con citología (doble toma). Citología ASC-US o mayor: colposcopía y biopsia. Citología negativa: repetir el test de VPH a los 12 meses; si persiste positivo, colposcopía. ASC-H y H-SIL: colposcopía directa. La autotoma con cepillo vaginal mejora el acceso. Inicio a los 25 años (o a los 3 años del inicio de las relaciones); fin a los 65 años con VPH o a los 70 con citología (pruebas previas negativas). La histerectomía no es el tratamiento de primera elección del H-SIL.",
    "Repetir el test de VPH a los 18 meses o indicar test de VPH en menores de 30 años."),
  T("Colposcopía, zona de transformación y seguimiento posterior al tratamiento", "media",
    "La zona de transformación puede ser tipo 1, 2 o 3 (esta última no se visualiza completa: requiere estudio del conducto endocervical). H-SIL: tratamiento escisional (LEEP/conización). Después del tratamiento: citología y colposcopía cada 4-6 meses y test de VPH a los 6-12 meses. Adenocarcinoma in situ: conización y evaluación del conducto.",
    ""),
]
DDS[5] = [("L-SIL", "L-SIL / CIN 1: observación; control a los 6-12 meses (regresión espontánea > 60-80 %)."),]
DDADD[5] = ["VPH positivo con citología negativa: repetir el test de VPH a los 12 meses (Guía 2022); si persiste positivo, colposcopía."]

# ------------------------------------------------------------ D7 · UP 3 · S2 mama benigna y miomas
ADDS[6] = [
  T("Miomatosis uterina: clínica y tratamiento", "media",
    "Tumor benigno más frecuente del útero. Síntomas: hipermenorrea, anemia, dolor y síntomas compresivos; infertilidad en los submucosos. Los asintomáticos no se tratan. Médico: AINE, ácido tranexámico, anticonceptivos o DIU de levonorgestrel y análogos de GnRH como tratamiento preoperatorio. Quirúrgico: miomectomía (si desea fertilidad), histerectomía o embolización según el caso. Cambios degenerativos y sarcoma ante crecimiento rápido en la posmenopausia.",
    "Operar un mioma asintomático solo por su tamaño."),
]

# ------------------------------------------------------------ D8 · UP 3 · S2 SOP
SETS[(7, "Insulinorresistencia, hiperandrogenismo")] = dict(
    prio="media", texto="Tratamiento del SOP y falla ovárica precoz",
    detalle="SOP: cambios del estilo de vida y pérdida de peso; ACO para regularizar el ciclo y tratar el hirsutismo y el acné; metformina si hay insulinorresistencia; antiandrógenos (espironolactona); inducción de la ovulación con letrozol si desea embarazo. Falla ovárica precoz: amenorrea antes de los 40 años con FSH elevada (> 25-40 UI/L) en dos determinaciones; evaluar cariotipo y autoinmunidad y considerar THM.")

# ------------------------------------------------------------ D9 · UP 3 · S2 endometriosis, IVE
SETS[(8, "Adenomiosis e infertilidad femenina")] = dict(
    detalle="Adenomiosis: útero globuloso y blando, menorragia y dismenorrea; ecografía y RMN. Infertilidad: 12 meses sin protección (6 meses si ≥ 35 años). Estudio simultáneo de la pareja. Mujer: FSH, LH, estradiol (día 2-4), prolactina, TSH y AMH (cualquier día); ecografía transvaginal con recuento de folículos antrales; histerosalpingografía con prueba de Cotte en la primera fase del ciclo; cultivos de flujo (Chlamydia, gonococo). Varón: espermograma con abstinencia de 2 a 7 días y, si es anormal, repetirlo y derivar a andrología.")
SETS[(8, "Abuso sexual")] = dict(
    prio="alta",
    detalle="Atención integral e inmediata: contención, examen y toma de muestras con consentimiento, profilaxis postexposición (ITS y VIH), anticoncepción de emergencia, vacunación, notificación y acompañamiento; ILE por causal violación sin autorización judicial ni denuncia obligatoria.")
DDADD[8] = ["Infertilidad: AMH, recuento de folículos antrales, histerosalpingografía (Cotte) y espermograma con abstinencia de 2-7 días."]

# ------------------------------------------------------------ D10 · UP 3 · S3 urgencias
SETS[(9, "Notificación de malas noticias")] = dict(
    prio="alta", texto="Masa anexial, torsión anexial y quiste hemorrágico",
    detalle="Torsión anexial: dolor pelviano súbito con náuseas; un Doppler normal no la descarta; urgencia quirúrgica con destorsión y conservación del ovario si es posible. Quiste hemorrágico o roto: analgesia y observación si hay estabilidad. Masa anexial: ecografía transvaginal; la sospecha de malignidad (sólida, tabiques, ascitis, posmenopausia) requiere marcadores (CA-125) y derivación al oncólogo; no puncionar. Comunicar malas noticias con SPIKES.")

# ------------------------------------------------------------ D11 · UP 3 · S4 control prenatal
SETS[(10, "Control prenatal, nutrición")] = dict(
    prio="alta", texto="Control prenatal: estudios por trimestre y tamizajes",
    detalle="Mínimo de 5 controles (la OMS propone 8 contactos). Primer control: grupo y Rh, hemograma, glucemia, VDRL, VIH, hepatitis B, Chagas, toxoplasmosis, urocultivo y ecografía de datación y translucencia nucal (11-13,6 semanas). Segundo trimestre: ecografía morfológica (20-24 semanas) y PTOG 75 g entre las semanas 24 y 28. Tercer trimestre: hisopado vagino-rectal para EGB (35-37 semanas), repetir serologías y anti-D a las 28 semanas en Rh negativas. Ácido fólico preconcepcional, hierro, ficha CLAP y detección de violencia y del embarazo adolescente.")

# ------------------------------------------------------------ D12 · UP 3 · S4 hemorragias
SETS[(11, "Rotura uterina y aborto séptico")] = dict(
    prio="media", texto="Aborto: tratamiento, aborto séptico, rotura uterina y otras causas",
    detalle="Aborto: misoprostol 800 µg (vaginal o sublingual) o evacuación con AMEU; aborto retenido o incompleto según el cuadro; gammaglobulina anti-D si es Rh negativa. Aborto séptico: antibióticos de amplio espectro y evacuación urgente. Rotura uterina: antecedente de cesárea o de uso de oxitócicos, dolor, pérdida del latido y shock; laparotomía. Otras causas de sangrado de la segunda mitad: vasa previa y acretismo placentario.")

# ------------------------------------------------------------ D13 · UP 3 · S4 THE y DG
SETS[(12, "Preeclampsia, HELLP")] = dict(
    detalle="Preeclampsia: TA ≥ 140/90 después de la semana 20 con proteinuria (≥ 0,3 g/24 h o relación proteinuria/creatinina ≥ 30 mg/mmol) o disfunción de órgano diana. HTA grave: PAS ≥ 160 y/o PAD ≥ 110 mmHg (confirmar en 15 minutos); tratamiento urgente con labetalol EV o nifedipina VO. Sulfato de magnesio (consenso FASGO): 4 g EV de ataque y 1 g/h por 24 h; sin magnesemia de rutina; antídoto gluconato de calcio 1 g EV (signos de toxicidad: pérdida del reflejo patelar, frecuencia respiratoria < 12). Antihipertensivos permitidos: labetalol, nifedipina y alfa-metildopa; IECA y ARA II contraindicados. HELLP: hemólisis, enzimas hepáticas elevadas y plaquetas < 100.000. Interrupción a las 37 semanas sin gravedad; con criterios de gravedad, tras estabilizar y desde las 34 semanas. Corticoides antenatales < 34 semanas.",
    trampa="Indicar enalapril o losartán en la gestante, o dosificar la magnesemia de rutina.")
SETS[(12, "Anemia, colestasis")] = dict(
    prio="media",
    detalle="Anemia (Hb < 11 g/dL): casi siempre ferropénica; hierro oral y control. Colestasis intrahepática: prurito palmoplantar nocturno y ácidos biliares elevados; ácido ursodesoxicólico y finalización a las 37 semanas. Enfermedad hemolítica perinatal: aloinmunización Rh (Coombs indirecta positiva) con Doppler de la arteria cerebral media; profilaxis con anti-D.")
DDS[12] = [("Sulfato de Mg", "Sulfato de Mg (consenso FASGO): 4 g EV de ataque y 1 g/h por 24 h. Antídoto: gluconato de calcio 1 g EV.")]
DDADD[12] = ["HTA grave: PAS ≥ 160 y/o PAD ≥ 110; tratar con labetalol EV o nifedipina VO. Meta de control en la gestante con HTA crónica: < 140/90.",
             "Metas de DG: ayunas 70-90 mg/dL (ALAD) o 70-95 (SOGIBA 2022); 1 h < 140 y 2 h < 120."]

# ------------------------------------------------------------ D14 · UP 3 · S4 RPM, infecciones
SETS[(13, "Manejo de la RPM pretérmino")] = dict(
    detalle="Maduración pulmonar: betametasona 12 mg IM c/24 h (2 dosis) entre las semanas 24 y 34,6 (no se retrasa el parto por completarla). Antibióticos de latencia (consenso SOGIBA): ampicilina 1 g EV c/6 h + eritromicina 250 mg EV c/6 h por 48 h y luego vía oral hasta completar 7 días. Tocolíticos solo hasta 48 h para completar los corticoides; sin tocolisis de mantenimiento. Neuroprotección con sulfato de magnesio si < 32 semanas. Corioamnionitis: antibióticos y finalizar el embarazo. Si se desconoce el hisopado para EGB, profilaxis intraparto.")
SETS[(13, "Parto prematuro, polihidramnios")] = dict(
    prio="alta", texto="Amenaza de parto prematuro, polihidramnios, oligoamnios y COVID-19 en el embarazo",
    detalle="Amenaza de parto prematuro: reposo relativo, corticoides, tocolíticos por 48 h (nifedipina, atosibán o indometacina) y neuroprotección con magnesio si < 32 semanas; progesterona vaginal y cerclaje en cuello corto o antecedentes. Polihidramnios (ILA > 24 cm): diabetes y malformaciones; oligoamnios (ILA < 5 cm): RPM, RCIU y uropatías. COVID-19 (anexo de la cátedra): criterios de internación (fiebre persistente, neumonía, CURB-65 ≥ 1); la infección no es indicación de cesárea ni de adelantar el parto; lactancia permitida con medidas; dexametasona 6 mg c/12 h si requiere corticoides por neumonía grave, betametasona habitual en las demás; heparina de bajo peso molecular profiláctica durante la internación.")
SETS[(13, "RCIU y otras infecciones")] = dict(
    detalle="RCIU: peso fetal estimado < P10 con Doppler alterado; severo < P3; el PEG constitucional tiene Doppler normal. Sífilis congénita (penicilina; ver tratamiento de la gestante), toxoplasmosis (espiramicina en la gestante), Chagas y VIH (profilaxis antirretroviral, carga viral y cesárea electiva si > 1000 copias/mL; lactancia contraindicada).")

# ------------------------------------------------------------ D15 · UP 3 · S5 parto y puerperio
ADDS[14] = [
  T("Trabajo de parto: períodos, mecanismo y partograma", "alta",
    "Períodos: dilatación (latente y activa), expulsivo y alumbramiento (patológico si > 30 minutos). Mecanismo en cefálica de vértice: encajamiento, descenso, flexión, rotación interna, deflexión, restitución y rotación externa. Planos de Hodge, índice de Bishop y partograma; episiotomía selectiva. Monitoreo fetal intraparto: FCF normal 110-160 lpm; desaceleraciones precoces (compresión cefálica), tardías (insuficiencia placentaria) y variables (cordón).",
    "Interpretar las desaceleraciones tardías como fisiológicas."),
  T("Puerperio normal y patológico", "media",
    "Puerperio inmediato, mediato y tardío; involución uterina, loquios, lactancia y anticoncepción. Patológico: endometritis (la causa más frecuente de fiebre puerperal; clindamicina + gentamicina), mastitis, infección de la herida, TVP/TEP, hemorragia tardía y depresión posparto.",
    ""),
]
SETS[(14, "Hemorragia posparto")] = dict(
    detalle="HPP: sangrado > 500 mL (parto vaginal) o > 1000 mL (cesárea) o con compromiso hemodinámico; causa más frecuente: atonía (70 %); regla de las 4 T. El manejo activo del tercer período reduce la HPP en un 60 %. Tratamiento escalonado: pedir ayuda, vías de grueso calibre (14-16 G), oxígeno y sonda vesical; masaje uterino y compresión bimanual; oxitocina 20-40 UI por litro; metilergometrina 0,2 mg IM (contraindicada en hipertensas) o misoprostol 600 µg; revisión de la cavidad y del canal; ácido tranexámico 1 g EV; si no cede: balón, sutura de B-Lynch, ligaduras vasculares, embolización y, como último recurso, histerectomía.",
    trampa="Usar metilergometrina en una paciente con preeclampsia o hipertensión.")
DDADD[14] = ["HPP: atonía 70 %; oxitocina 20-40 UI/L, metilergometrina 0,2 mg IM (no en HTA) o misoprostol 600 µg, ácido tranexámico 1 g EV; B-Lynch, ligaduras o histerectomía si no cede."]
