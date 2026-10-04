# Exporta a GLB (Draco) la vía aérea de Z-Anatomy y una piel de cabeza/cuello/tórax de BodyParts3D alineada por la mandíbula.
# Marco de salida: metros, Z arriba, anterior = -Y (el exportador glTF lo pasa a Y arriba, anterior = +Z).
import bpy, bmesh, sys, os, math
SIAM = 'C:/Users/Augusto/AppData/Local/Temp/claude/siam/'
OUT = SIAM + 'glb_rcp/'
os.makedirs(OUT, exist_ok=True)
P_Z = SIAM + 'za/Z-Anatomy/Startup.blend'

costales = ['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth']
grupos = {
 'esternon': ['Manubrium of sternum', 'Body of sternum', 'Xiphoid process'] + [f'Costal cartilage of {n.lower()} rib.{s}' for n in costales for s in ('l', 'r')],
 'costillas': [f'{n} rib.{s}' for n in costales + ['Eleventh', 'Twelfth'] for s in ('l', 'r')],
 'corazon': ['Left ventricle', 'Right ventricle', 'Left atrium', 'Right atrium', 'Ascending aorta', 'Aortic arch', 'Pulmonary trunk', 'Superior vena cava'],
 'clavicula': ['Clavicle.l', 'Clavicle.r'],
}
todos = sorted({n for g in grupos.values() for n in g})

bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(P_Z) as (src, dst):
    faltan = [n for n in todos if n not in src.objects]
    dst.objects = [n for n in todos if n in src.objects]
print('FALTAN', faltan)
obj = {}
for o in dst.objects:
    if o is None: continue
    bpy.context.scene.collection.objects.link(o); obj[o.name] = o
    o.hide_set(False); o.hide_viewport = False; o.hide_render = False; o.hide_select = False

bpy.context.view_layer.update()
for o in obj.values():
    mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
bpy.context.view_layer.update()
def seleccionar(lista):
    bpy.ops.object.select_all(action='DESELECT')
    ok = [obj[n] for n in lista if n in obj]
    for o in ok: o.select_set(True)
    if ok: bpy.context.view_layer.objects.active = ok[0]
    return ok

def suavizar(ok, niveles=0, decimar=None):
    for o in ok:
        if o.type != 'MESH': continue
        for p in o.data.polygons: p.use_smooth = True
        if niveles:
            m = o.modifiers.new('suave', 'SUBSURF'); m.levels = niveles; m.render_levels = niveles
        if decimar:
            m = o.modifiers.new('dec', 'DECIMATE'); m.ratio = decimar

def exportar(nombre, ok):
    if not ok: print('sin objetos', nombre); return
    bpy.ops.object.select_all(action='DESELECT')
    for o in ok: o.select_set(True)
    bpy.context.view_layer.objects.active = ok[0]
    ruta = OUT + nombre + '.glb'
    bpy.ops.export_scene.gltf(filepath=ruta, use_selection=True, export_format='GLB', export_apply=True, export_draco_mesh_compression_enable=True,
                              export_draco_mesh_compression_level=6, export_materials='NONE', export_cameras=False, export_lights=False)
    print('EXPORTADO', nombre, os.path.getsize(ruta))

for g, lista in grupos.items():
    ok = seleccionar(lista)
    if g == 'lengua': suavizar(ok, niveles=2)
    elif g == 'pulmones': suavizar(ok, niveles=0, decimar=0.35)
    elif g == 'costillas': suavizar(ok, decimar=0.45)
    elif g in ('esternon', 'corazon', 'clavicula'): suavizar(ok, decimar=0.7)
    else: suavizar(ok)
    try: exportar(g, ok)
    except Exception as e: print('ERROR', g, e)

# ---------------------------------------------------------------- BodyParts3D: piel y vértebras C3-C7 alineadas a Z-Anatomy por la mandíbula
if os.environ.get('SOLO_Z'):
    print('FIN'); sys.exit(0)
S = 1.02
def importar_bp3d(ruta):
    antes = set(bpy.data.objects)
    bpy.ops.import_mesh.stl(filepath=ruta)
    o = [x for x in bpy.data.objects if x not in antes][0]
    o.scale = (S * 0.001, S * 0.001, S * 0.001)
    o.location = (0, 139.5 * S * 0.001 - 0.0428, -1476 * S * 0.001 + 1.5375)
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return o

vert = []
for n in (12521, 12522, 12523, 12524, 12525):
    f = SIAM + f'za/piel/FMA{n}.stl'
    if os.path.exists(f):
        v = importar_bp3d(f); v.name = f'C{n-12518}'; suavizar([v]); vert.append(v)
if vert: exportar('vertebras', vert)

skin_stl = SIAM + 'za/piel/FMA7163.stl'
o = importar_bp3d(skin_stl); o.name = 'piel'
print('piel tris', len(o.data.polygons))
bm = bmesh.new(); bm.from_mesh(o.data)
def recortar(co, no, borrar):
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=no, clear_inner=borrar == 'inner', clear_outer=borrar == 'outer')
recortar((0, 0, 1.10), (0, 0, 1), 'inner')
recortar((0.19, 0, 0), (1, 0, 0), 'outer')
recortar((-0.19, 0, 0), (1, 0, 0), 'inner')
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0004)
bm.to_mesh(o.data); bm.free()
bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.separate(type='LOOSE'); bpy.ops.object.mode_set(mode='OBJECT')
partes = [x for x in bpy.data.objects if x.type == 'MESH' and x.name.startswith('piel')]
partes.sort(key=lambda x: len(x.data.polygons), reverse=True)
print('partes', [len(x.data.polygons) for x in partes][:5])
grande = partes[0]
for x in partes[1:]: bpy.data.objects.remove(x, do_unlink=True)
m = grande.modifiers.new('dec', 'DECIMATE'); m.ratio = min(1.0, 42000 / max(1, len(grande.data.polygons)))
for p in grande.data.polygons: p.use_smooth = True
exportar('piel', [grande])
print('FIN')
