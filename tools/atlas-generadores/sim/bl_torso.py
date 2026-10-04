import bpy, bmesh, mathutils, math, os
from mathutils import Vector
OUT = 'C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika/assets/anatomia/sim/'
SIM = 'C:/Users/Augusto/AppData/Local/Temp/claude/sim/'
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)

def importar(nombre):
    antes = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=SIM + 'hra/' + nombre + '.glb')
    nuevos = [o for o in bpy.data.objects if o not in antes and o.type == 'MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in nuevos: o.select_set(True)
    bpy.context.view_layer.objects.active = nuevos[0]
    if len(nuevos) > 1: bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active
    bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return o

def exportar(o, nombre, morph=False):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.export_scene.gltf(filepath=OUT + nombre + '.glb', use_selection=True, export_format='GLB', export_apply=False,
                              export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7, export_materials='NONE',
                              export_morph=morph, export_cameras=False, export_lights=False)
    print('EXPORTADO', nombre, os.path.getsize(OUT + nombre + '.glb'))

import sys
SOLO=os.environ.get('SOLO')
# ---------------- piel femenina: tronco y muslos (con mamas), con morph target de embarazo a término
sk = importar('VH_F_Skin')
print('piel tris', len(sk.data.polygons))
bm = bmesh.new(); bm.from_mesh(sk.data)
def rec(co, no, borrar):
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=no, clear_inner=borrar == 'inner', clear_outer=borrar == 'outer')
rec((0, 0, -0.16), (0, 0, 1), 'inner'); rec((0, 0, 0.62), (0, 0, 1), 'outer')
rec((0.215, 0, 0), (1, 0, 0), 'outer'); rec((-0.215, 0, 0), (1, 0, 0), 'inner')
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0006)
bm.to_mesh(sk.data); bm.free()
bpy.ops.object.select_all(action='DESELECT'); sk.select_set(True); bpy.context.view_layer.objects.active = sk
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.separate(type='LOOSE'); bpy.ops.object.mode_set(mode='OBJECT')
partes = sorted([x for x in bpy.data.objects if x.type == 'MESH' and x.name.startswith('VH_F_Skin')] or [x for x in bpy.data.objects if x.type == 'MESH'], key=lambda x: len(x.data.polygons), reverse=True)
print('partes', [len(p.data.polygons) for p in partes][:5])
tr = partes[0]
for p in partes[1:]:
    if len(p.data.polygons) < 0.2 * len(tr.data.polygons): bpy.data.objects.remove(p, do_unlink=True)
partes2 = [x for x in bpy.data.objects if x.type == 'MESH' and x is not tr]
if partes2:
    bpy.ops.object.select_all(action='DESELECT'); tr.select_set(True)
    for p in partes2: p.select_set(True)
    bpy.context.view_layer.objects.active = tr; bpy.ops.object.join()
tr = bpy.context.view_layer.objects.active
dm = tr.modifiers.new('d', 'DECIMATE'); dm.ratio = min(1.0, 60000 / max(1, len(tr.data.polygons)))
bpy.ops.object.modifier_apply(modifier='d')
for p in tr.data.polygons: p.use_smooth = True
print('torso tris', len(tr.data.polygons))
tr.name = 'torso_f'
# morph target: abdomen gestante (A = 17 cm hacia adelante, lóbulo en z 0.13)
tr.shape_key_add(name='Basis', from_mix=False)
g = tr.shape_key_add(name='gravida', from_mix=False)
A, z0, sz, sx = 0.17, 0.14, 0.19, 0.15
for i, v in enumerate(tr.data.vertices):
    x, y, z = v.co
    w = max(0.0, min(1.0, (0.075 - y) / 0.13))          # solo la mitad anterior del cuerpo
    gg = math.exp(-((z - z0) / sz) ** 2 - (x / sx) ** 2) * w
    g.data[i].co = Vector((x * (1 + 0.16 * gg), y - A * gg, z + 0.02 * gg))
exportar(tr, 'torso_f', morph=True)
b = [tr.matrix_world @ v.co for v in tr.data.vertices]
print('BBOX torso', [round(min(c[i] for c in b), 3) for i in range(3)], [round(max(c[i] for c in b), 3) for i in range(3)])

# ---------------- placenta (reducida) y anexos
bpy.ops.object.select_all(action='DESELECT')
pl = importar('VH_F_Placenta')
c = sum((pl.matrix_world @ Vector(v) for v in pl.bound_box), Vector()) / 8
print('placenta centro', [round(x, 3) for x in c])
dm = pl.modifiers.new('d', 'DECIMATE'); dm.ratio = min(1.0, 16000 / max(1, len(pl.data.polygons))); bpy.ops.object.modifier_apply(modifier='d')
for v in pl.data.vertices: v.co -= c
for p in pl.data.polygons: p.use_smooth = True
print('placenta dims', [round(x, 3) for x in pl.dimensions])
exportar(pl, 'placenta')
ov = [importar('VH_F_Ovary_L'), importar('VH_F_Ovary_R')]
tb = [importar('VH_F_Fallopian_Tube_L'), importar('VH_F_Fallopian_Tube_R')]
for lista, nombre, dec in ((ov, 'ovarios', None), (tb, 'trompas', 0.25)):
    bpy.ops.object.select_all(action='DESELECT')
    for o in lista: o.select_set(True)
    bpy.context.view_layer.objects.active = lista[0]
    bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active
    if dec:
        m = o.modifiers.new('d', 'DECIMATE'); m.ratio = dec; bpy.ops.object.modifier_apply(modifier='d')
    for p in o.data.polygons: p.use_smooth = True
    exportar(o, nombre)
