import bpy, mathutils, json
bpy.ops.wm.read_factory_settings(use_empty=True)
def imp(n):
    antes=set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath='hra/%s.glb'%n)
    o=[x for x in bpy.data.objects if x not in antes and x.type=='MESH']
    return o
sk=imp('VH_F_Skin')[0]; vs=[sk.matrix_world@v.co for v in sk.data.vertices]
perfil=[]
for i in range(-15,63):
    z=i/100
    s=[v for v in vs if abs(v.z-z)<0.004 and abs(v.x+0.006)<0.012]
    if s: perfil.append([round(z*100,1), round(-min(v.y for v in s)*100,2), round(-max(v.y for v in s)*100,2)])   # z_cm, frente (z_front cm), espalda
print('PERFIL',json.dumps(perfil))
pv=imp('VH_F_Pelvis'); pvs=[o.matrix_world@v.co for o in pv for v in o.data.vertices]
c=[v for v in pvs if abs(v.x+0.006)<0.02]
a=min(c,key=lambda v:v.y); print('PELVIS_ANT_CENTRAL',[round(x,3) for x in a])
sy=[v for v in pvs if abs(v.x+0.006)<0.02 and v.y<0.02]
print('SINFISIS z', round(min(v.z for v in sy),3), round(max(v.z for v in sy),3), 'y', round(min(v.y for v in sy),3), round(max(v.y for v in sy),3))
print('PELVIS bbox z', round(min(v.z for v in pvs),3), round(max(v.z for v in pvs),3))
# cintura escapular / apofisis xifoides aprox: no disponible en piel; costillas no
ut=imp('VH_F_Uterus')[0]; us=[ut.matrix_world@v.co for v in ut.data.vertices]
cervix=min(us,key=lambda v:v.z); print('UTERO inferior', [round(x,3) for x in cervix], 'sup', [round(x,3) for x in max(us,key=lambda v:v.z)])
print('UTERO centro', [round(sum(v[i] for v in us)/len(us),3) for i in range(3)])
bl=imp('VH_F_Urinary_Bladder')[0]; bs=[bl.matrix_world@v.co for v in bl.data.vertices]
print('VEJIGA centro', [round(sum(v[i] for v in bs)/len(bs),3) for i in range(3)])
