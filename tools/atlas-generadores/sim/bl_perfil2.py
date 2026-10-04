import bpy, mathutils
bpy.ops.wm.read_factory_settings(use_empty=True)
def imp(n):
    antes=set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath='hra/%s.glb'%n)
    return [x for x in bpy.data.objects if x not in antes and x.type=='MESH']
for n in ('VH_F_Uterus','VH_F_Urinary_Bladder','VH_F_Ovary_L','VH_F_Ovary_R'):
    os_=imp(n); vs=[o.matrix_world@v.co for o in os_ for v in o.data.vertices]
    print('OBJ',n,len(os_),'bbox',[round(min(v[i] for v in vs),3) for i in range(3)],[round(max(v[i] for v in vs),3) for i in range(3)])
    if n=='VH_F_Uterus':
        low=sorted(vs,key=lambda v:v.z)[:40]; print('UTERO_OS', [round(sum(v[i] for v in low)/40,3) for i in range(3)])
        top=sorted(vs,key=lambda v:-v.z)[:40]; print('UTERO_FONDO', [round(sum(v[i] for v in top)/40,3) for i in range(3)])
