import bpy, bmesh, os, mathutils
SIAM='C:/Users/Augusto/AppData/Local/Temp/claude/siam/'
OUT='C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika/assets/anatomia/artro/'
Zf=SIAM+'za/Z-Anatomy/Startup.blend'
ZMIN,ZMAX=0.14,0.72
grupos={
 'femur':['Femur.r'],'tibia':['Tibia.r','Fibula.r'],'rotula':['Patella.r'],
 'ligamentos':['Patellar ligament.er','Patellar ligament.or','Quadriceps femoris muscle.er','Lateral patellar retinaculum.r','Medial patellar retinaculum.r','Fibular collateral ligament.r','Superficial part of tibial collateral ligament.r','Anterior cruciate ligament.r','Posterior cruciate ligament.r'],
 'meniscos':['Lateral meniscus.r','Medial meniscus.r'],
 'capsula':['Articular capsule of knee joint.r','Suprapatellar bursa.r','Infrapatellar fat pad.r','Deep infrapatellar bursa.r'],
 'musculos':['Vastus lateralis muscle.r','Vastus medialis muscle.r','Vastus intermedius muscle.r','Rectus femoris muscle.r'],
}
todos=sorted({n for g in grupos.values() for n in g}|{'Calcaneus.r'})
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(Zf) as (s,d):
    d.objects=[n for n in todos if n in s.objects]
    print('FALTAN',[n for n in todos if n not in s.objects])
obj={}
for o in d.objects:
    if o is None: continue
    bpy.context.scene.collection.objects.link(o); obj[o.name]=o
    o.hide_set(False); o.hide_viewport=False; o.hide_render=False
bpy.context.view_layer.update()
for o in obj.values():
    mw=o.matrix_world.copy(); o.parent=None; o.matrix_world=mw
bpy.context.view_layer.update()
def zmin(o): return min((o.matrix_world@mathutils.Vector(c)).z for c in o.bound_box)
SUELO=zmin(obj['Calcaneus.r'])
print('SUELO',SUELO)
bpy.data.objects.remove(obj.pop('Calcaneus.r'),do_unlink=True)

def cortar(o, cap=True):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active=o
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    bm=bmesh.new(); bm.from_mesh(o.data)
    for z,no,clear in ((ZMIN,(0,0,1),'inner'),(ZMAX,(0,0,1),'outer')):
        geom=bm.verts[:]+bm.edges[:]+bm.faces[:]
        r=bmesh.ops.bisect_plane(bm,geom=geom,plane_co=(0,0,z),plane_no=no,clear_inner=clear=='inner',clear_outer=clear=='outer')
        if cap:
            cut=[e for e in r['geom_cut'] if isinstance(e,bmesh.types.BMEdge)]
            try: bmesh.ops.holes_fill(bm,edges=cut,sides=200)
            except Exception as e: print('fill',o.name,e)
    bm.to_mesh(o.data); bm.free()
def suave(o,dec=None):
    for p in o.data.polygons: p.use_smooth=True
    if dec:
        m=o.modifiers.new('d','DECIMATE'); m.ratio=dec
def exportar(nombre, objs):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active=objs[0]
    ruta=OUT+nombre+'.glb'
    bpy.ops.export_scene.gltf(filepath=ruta,use_selection=True,export_format='GLB',export_apply=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6,export_materials='NONE',export_cameras=False,export_lights=False)
    print('EXPORTADO',nombre,os.path.getsize(ruta))
for g,lista in grupos.items():
    objs=[obj[n] for n in lista if n in obj]
    for o in objs:
        if g in ('femur','tibia','musculos'): cortar(o)
        suave(o, 0.35 if g=='musculos' else None)
    exportar(g,objs)

# ---- piel (BodyParts3D) alineada por 2 anclas en z: mandibula (1.5375) y suelo
S=1.02
bpy.ops.import_mesh.stl(filepath=SIAM+'za/piel/FMA7163.stl')
p=[x for x in bpy.data.objects if x.type=='MESH' and x.name.startswith('FMA')][0]
zs=[v.co.z for v in p.data.vertices]; zb=min(zs)
print('BP3D z min/max mm',zb,max(zs))
zm=1476.0
k=(1.5375-SUELO)/(zm-zb)      # m por mm
print('k',k)
for v in p.data.vertices:
    v.co=mathutils.Vector((v.co.x*S*0.001, (v.co.y+139.5)*S*0.001-0.0428, (v.co.z-zm)*k+1.5375))
p.name='piel'
bpy.ops.object.select_all(action='DESELECT'); p.select_set(True); bpy.context.view_layer.objects.active=p
bm=bmesh.new(); bm.from_mesh(p.data)
def rec(co,no,clear):
    geom=bm.verts[:]+bm.edges[:]+bm.faces[:]
    bmesh.ops.bisect_plane(bm,geom=geom,plane_co=co,plane_no=no,clear_inner=clear=='inner',clear_outer=clear=='outer')
rec((0,0,ZMIN),(0,0,1),'inner'); rec((0,0,ZMAX),(0,0,1),'outer'); rec((-0.005,0,0),(1,0,0),'outer')  # pierna derecha (x negativo)
bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=0.0004)
bm.to_mesh(p.data); bm.free()
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.separate(type='LOOSE'); bpy.ops.object.mode_set(mode='OBJECT')
partes=sorted([x for x in bpy.data.objects if x.type=='MESH' and x.name.startswith('piel')],key=lambda x:len(x.data.polygons),reverse=True)
print('partes',[len(x.data.polygons) for x in partes][:5])
for x in partes[1:]: bpy.data.objects.remove(x,do_unlink=True)
g=partes[0]
m=g.modifiers.new('d','DECIMATE'); m.ratio=min(1.0,30000/max(1,len(g.data.polygons)))
suave(g)
# anteriormente: ver separacion piel-rotula
cs=[v.co for v in g.data.vertices if abs(v.co.x+0.0845)<0.01 and abs(v.co.z-0.4445)<0.01]
print('PIEL_Y_MIN_ANTERIOR',min(c.y for c in cs) if cs else None,'(rotula y min -0.019)')
exportar('piel',[g])
