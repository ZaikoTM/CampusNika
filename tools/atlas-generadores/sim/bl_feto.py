import bpy, bmesh, mathutils, math, os
from mathutils import Vector
OUT = 'C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika/assets/anatomia/sim/'
PREV = 'C:/Users/Augusto/AppData/Local/Temp/claude/sim/'
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bm = bmesh.new()

def ell(c, sx, sy, sz):
    r = bmesh.ops.create_uvsphere(bm, u_segments=28, v_segments=18, radius=1.0)
    bmesh.ops.scale(bm, vec=(sx, sy, sz), verts=r['verts']); bmesh.ops.translate(bm, vec=c, verts=r['verts'])

def cap(p0, p1, r, r2=None):
    a = Vector(p0); b = Vector(p1); d = b - a; L = d.length; r2 = r if r2 is None else r2
    ell(a, r, r, r); ell(b, r2, r2, r2)
    c = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=20, radius1=r, radius2=r2, depth=L)
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix()
    bmesh.ops.rotate(bm, verts=c['verts'], cent=(0, 0, 0), matrix=rot); bmesh.ops.translate(bm, vec=(a + b) / 2, verts=c['verts'])

# marco: Z hacia la cabeza, +Y ventral, X lateral. Metros (feto de término ~0.50 m de longitud, posición fetal flexionada)
ell((0, 0.045, 0.335), 0.047, 0.058, 0.052)                  # cráneo
ell((0, 0.082, 0.320), 0.034, 0.033, 0.037)                  # cara / mentón
ell((0, 0.100, 0.328), 0.009, 0.010, 0.012)                  # nariz
for s in (-1, 1): ell((s * 0.043, 0.040, 0.332), 0.006, 0.012, 0.016)   # orejas
cap((0, 0.02, 0.29), (0, 0.012, 0.262), 0.026)               # cuello
ell((0, 0.005, 0.225), 0.052, 0.040, 0.055)                  # tórax
ell((0, 0.0, 0.155), 0.052, 0.044, 0.055)                    # abdomen
ell((0, -0.012, 0.095), 0.052, 0.046, 0.045)                 # pelvis / nalgas
for s in (-1, 1):
    cap((s * 0.060, 0.0, 0.255), (s * 0.075, 0.045, 0.205), 0.017, 0.014)    # brazo
    cap((s * 0.075, 0.045, 0.205), (s * 0.040, 0.078, 0.218), 0.014, 0.011)  # antebrazo
    ell((s * 0.034, 0.083, 0.221), 0.012, 0.012, 0.010)                     # mano
    cap((s * 0.036, 0.015, 0.095), (s * 0.050, 0.095, 0.150), 0.026, 0.020)  # muslo flexionado
    cap((s * 0.050, 0.095, 0.150), (s * 0.040, 0.055, 0.065), 0.019, 0.014)  # pierna
    ell((s * 0.040, 0.050, 0.050), 0.021, 0.013, 0.010)                     # pie
me = bpy.data.meshes.new('feto'); bm.to_mesh(me); bm.free()
f = bpy.data.objects.new('feto', me); bpy.context.scene.collection.objects.link(f)
bpy.context.view_layer.objects.active = f; f.select_set(True)
rm = f.modifiers.new('r', 'REMESH'); rm.mode = 'VOXEL'; rm.voxel_size = 0.0035
bpy.ops.object.modifier_apply(modifier='r')
print('FETO tras remesh', len(f.data.polygons))
sm = f.modifiers.new('sm', 'SMOOTH'); sm.factor = 0.8; sm.iterations = 18
bpy.ops.object.modifier_apply(modifier='sm')
for p in f.data.polygons: p.use_smooth = True
dd = f.modifiers.new('d', 'DECIMATE'); dd.ratio = min(1.0, 14000 / max(1, len(f.data.polygons)))
bpy.ops.object.modifier_apply(modifier='d')
print('FETO final', len(f.data.polygons), tuple(round(x, 3) for x in f.dimensions))
sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'; sc.render.resolution_x = 420; sc.render.resolution_y = 420
sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'SINGLE'; sc.display.shading.single_color = (0.93, 0.72, 0.62)
cam = bpy.data.objects.new('c', bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.type = 'ORTHO'; cam.data.ortho_scale = 0.55; cam.data.clip_end = 10
for nm, loc, rot in (('lat', (1.5, 0.05, 0.2), (math.radians(90), 0, math.radians(90))), ('fro', (0, 1.5, 0.2), (math.radians(90), 0, math.radians(180)))):
    cam.location = loc; cam.rotation_euler = rot; sc.render.filepath = PREV + 'feto_%s.png' % nm; bpy.ops.render.render(write_still=True)
bpy.ops.object.select_all(action='DESELECT'); f.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT + 'feto.glb', use_selection=True, export_format='GLB', export_draco_mesh_compression_enable=True, export_materials='NONE')
print('GLB', os.path.getsize(OUT + 'feto.glb'))
