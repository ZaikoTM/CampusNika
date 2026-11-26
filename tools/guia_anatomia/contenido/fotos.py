# -*- coding: utf-8 -*-
"""Registro de láminas reales (en color siempre que se pudo) con fuente, licencia y rótulos traducidos. Las imágenes están en tools/guia_anatomia/img/."""

CC3 = 'Wikimedia Commons, {a}, licencia CC BY-SA 3.0. Rótulos traducidos para esta guía.'
OSX = 'OpenStax College, Anatomy & Physiology, «{t}» (Wikimedia Commons), licencia CC BY 3.0. Rótulos traducidos para esta guía.'

FOTOS = {
    'epidermis': ('os_502_capas_epidermis.jpg', 'Capas de la epidermis sobre la dermis: estratos basal, espinoso, granuloso, lúcido y córneo.', OSX.format(t='Layers of epidermis'),
                  [('Stratum corneum', 'Estrato córneo'), ('Stratum lucidum', 'Estrato lúcido (solo palma y planta)'), ('Stratum granulosum', 'Estrato granuloso'), ('Stratum spinosum', 'Estrato espinoso'),
                   ('Stratum basale', 'Estrato basal'), ('Melanocyte', 'Melanocito'), ('Merkel cell', 'Célula de Merkel (tacto)'), ('Dermis', 'Dermis')], 105),
    'laringoscopia': ('os_2307_laringe_endoscopica.jpg', 'Vista laringoscópica: lo que se ve al intubar (lengua abajo, epiglotis, glotis entre las cuerdas verdaderas y tráquea al fondo).', OSX.format(t='Cartilages of the larynx'),
                      [('Tongue', 'Lengua'), ('Epiglottis', 'Epiglotis'), ('Glottis', 'Glotis'), ('True vocal cord', 'Cuerda vocal verdadera'), ('Vestibular fold', 'Pliegue vestibular (cuerda falsa)'),
                       ('Pyriform fossa', 'Seno (fosa) piriforme'), ('Trachea', 'Tráquea'), ('Esophagus', 'Esófago')], 95),
    'laringe': ('cc_laringe_diseccion_anterior.jpg', 'Laringe, vista anterior de una disección: cartílago tiroides, ligamento cricotiroideo y cricoides.', CC3.format(a='Anatomist90'),
                [('Thyroid cartilage', 'Cartílago tiroides'), ('Cricothyroid ligament', 'Ligamento (membrana) cricotiroideo'), ('Cricoid cartilage', 'Cartílago cricoides'), ('Cricotracheal ligament', 'Ligamento cricotraqueal'),
                 ('Trachea', 'Tráquea'), ('Thyroid gland', 'Glándula tiroides'), ('Sternohyoid muscle', 'Músculo esternohioideo')], 90),
    'plexo_esq': ('cc_plexo_braquial_esquema.png', 'Plexo braquial en color: cada raíz con su color y los nervios que de ella salen.', 'Wikimedia Commons, «Brachial plexus color» (Selket; obra derivada de Marshall Strother), licencia CC BY-SA 3.0. Rótulos en inglés, con traducción al pie.',
                  [('musculocutaneous n.', 'musculocutáneo'), ('axillary n.', 'axilar'), ('median n.', 'mediano'), ('radial n.', 'radial'), ('ulnar n.', 'cubital'), ('dorsal scapular n.', 'dorsal de la escápula'),
                   ('suprascapular n.', 'supraescapular'), ('long thoracic n.', 'torácico largo'), ('thoracodorsal n.', 'toracodorsal'), ('subscapular n.', 'subescapulares'), ('lateral / medial pectoral n.', 'pectorales lateral / medial')], 62),
    'plexo_diseccion': ('cc_plexo_braquial_diseccion.jpg', 'Disección del plexo en la axila: mediano, cubital y radial, con los pectorales y el bíceps.', CC3.format(a='Anatomist90'),
                        [('Median nerve', 'Nervio mediano'), ('Ulnar nerve', 'Nervio cubital'), ('Radial nerve', 'Nervio radial'), ('Pectoralis major / minor', 'Pectoral mayor / menor'), ('Biceps brachii', 'Bíceps braquial'),
                         ('Latissimus dorsi', 'Dorsal ancho')], 85),
    'arterias': ('os_2127_arterias_miembro_superior.jpg', 'Arterias del miembro superior derecho, de la subclavia a los arcos palmares y las digitales.', OSX.format(t='Thoracic and upper limb arteries'),
                 [('Right subclavian', 'Subclavia derecha'), ('Axillary', 'Axilar'), ('Humeral circumflex', 'Circunfleja humeral'), ('Deep brachial', 'Braquial profunda'), ('Brachial', 'Braquial'),
                  ('Ulnar collateral', 'Colaterales cubitales'), ('Radial', 'Radial'), ('Anterior interosseous', 'Interósea anterior'), ('Ulnar', 'Cubital'), ('Deep palmar arch', 'Arco palmar profundo'),
                  ('Superficial palmar arch', 'Arco palmar superficial'), ('Digital', 'Digitales')], 150),
    'axila_nervios': ('cc_axila_nervios_diseccion.jpg', 'Disección de la axila y el brazo: arteria y vena axilares con los nervios mediano, cubital y musculocutáneo.', CC3.format(a='Anatomist90'),
                      [('Axillary artery / vein', 'Arteria / vena axilar'), ('Median nerve', 'Nervio mediano'), ('Ulnar nerve', 'Nervio cubital'), ('Musculocutaneous nerve', 'Nervio musculocutáneo'),
                       ('Coracobrachialis muscle', 'Músculo coracobraquial'), ('Biceps brachii muscle', 'Músculo bíceps braquial')], 90),
    'radial': ('cc_nervio_radial_cuadrilatero.jpg', 'Región posterior del brazo: el nervio radial entre las cabezas del tríceps y el espacio cuadrangular.', CC3.format(a='Anatomist90'),
               [('Radial nerve', 'Nervio radial'), ('Long head of triceps', 'Cabeza larga del tríceps'), ('Lateral head of triceps', 'Cabeza lateral del tríceps'), ('Teres major', 'Redondo mayor'),
                ('Quadrangular space', 'Espacio cuadrangular (axilar y circunfleja posterior)')], 85),
    'mediano_mano': ('cc_nervio_mediano_mano_3d.jpg', 'Ramas del nervio mediano en la mano: nervios digitales palmares de los tres dedos y medio radiales.', 'scientificanimations.com (Wikimedia Commons), licencia CC BY-SA 4.0.', None, 75),
    'mano_diseccion': ('cc_mano_diseccion_eminencias.jpg', 'Disección de la palma: túnel carpiano y eminencias tenar e hipotenar.', CC3.format(a='Anatomist90'),
                       [('Carpal tunnel', 'Túnel carpiano'), ('Thenar eminence', 'Eminencia tenar'), ('Hypothenar eminence', 'Eminencia hipotenar')], 90),
    'tunel': ('os_815_tunel_carpiano.jpg', 'Corte transversal del túnel carpiano: nueve tendones flexores y el nervio mediano bajo el retináculo.', OSX.format(t='The carpal tunnel'),
              [('Transverse carpal ligament', 'Retináculo flexor (ligamento carpiano transverso)'), ('Median nerve', 'Nervio mediano'), ('Flexor tendons', 'Tendones flexores'), ('Carpal bones', 'Huesos del carpo')], 80),
    'tunel_rv': ('rv_1-79_tunel_carpiano_guyon.png', 'Túnel carpiano y canal de Guyon; la luxación del semilunar como causa de compresión del mediano.', 'Ramos Vértiz, Traumatología y Ortopedia, 2.ª ed., cap. 1, fig. 1-79 (imagen en blanco y negro).', None, 60),
}


def fotos(u, *claves):
    for c in claves:
        a, t, f, ley, h = FOTOS[c]
        u.foto(a, t, f, ley, h)
