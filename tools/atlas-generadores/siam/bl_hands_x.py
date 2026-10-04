import bpy, mathutils
R='C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika/assets/anatomia/rcp/'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=R+'clasped_hands.glb')
ms=[o for o in bpy.data.objects if o.type=='MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in ms:
    o.select_set(True)
    bpy.context.view_layer.objects.active=o
bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.object.join()
o=bpy.context.active_object
o.data.materials.clear()
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.remove_doubles(threshold=0.05); bpy.ops.object.mode_set(mode='OBJECT')
print('TRIS',len(o.data.polygons))
d=o.modifiers.new('d','DECIMATE'); d.ratio=28000/max(1,len(o.data.polygons))
bpy.ops.object.modifier_apply(modifier='d')
bpy.ops.object.shade_smooth()
print('TRIS2',len(o.data.polygons))
# centrar y escalar a metros-cm: queda en unidades originales
c=sum((o.matrix_world@mathutils.Vector(b) for b in o.bound_box),mathutils.Vector())/8
for v in o.data.vertices: v.co-=c
print('DIM',tuple(o.dimensions))
bpy.ops.export_scene.gltf(filepath=R+'manos_rcp.glb',export_format='GLB',export_draco_mesh_compression_enable=True,export_materials='NONE',export_normals=True,use_selection=True)
