# How a chip is made — Blender (Cycles) film for the SemiTec visit page.
# Usage:  python build.py <out_dir> <first_frame> <last_frame> [width height samples]
# Every frame is a state of the scene at story position P (0 … P_END); see state(P).
import bpy, bmesh, math, random, sys, os, json
from mathutils import Vector, Matrix, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'frames')
F0 = int(sys.argv[2]) if len(sys.argv) > 2 else 0
F1 = int(sys.argv[3]) if len(sys.argv) > 3 else 0
W = int(sys.argv[4]) if len(sys.argv) > 4 else 1280
H = int(sys.argv[5]) if len(sys.argv) > 5 else 720
SAMPLES = int(sys.argv[6]) if len(sys.argv) > 6 else 24
NFRAMES = 220
P_END = 10.6
os.makedirs(OUT, exist_ok=True)

def clamp(v, a=0.0, b=1.0): return max(a, min(b, v))
def ease(t): return 4 * t * t * t if t < .5 else 1 - (-2 * t + 2) ** 3 / 2
def seg(P, a, b): return ease(clamp((P - a) / (b - a)))
def lerp(a, b, k): return a + (b - a) * k
def vlerp(a, b, k): return Vector(a).lerp(Vector(b), k)
random.seed(7)

# ---------------------------------------------------------------- scene
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = SAMPLES
sc.cycles.use_adaptive_sampling = True
sc.cycles.adaptive_threshold = .03
sc.cycles.use_denoising = True
sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.cycles.max_bounces = 5; sc.cycles.glossy_bounces = 2; sc.cycles.transmission_bounces = 3; sc.cycles.diffuse_bounces = 1
sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
sc.render.resolution_x = W; sc.render.resolution_y = H; sc.render.resolution_percentage = 100
sc.render.film_transparent = True
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'; sc.view_settings.exposure = 0
sc.render.threads_mode = 'AUTO'

world = bpy.data.worlds.new('w'); sc.world = world; world.use_nodes = True
bg = world.node_tree.nodes['Background']; bg.inputs[0].default_value = (.62, .63, .62, 1); bg.inputs[1].default_value = .35

def mat(name, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    for k, v in kw.items(): b.inputs[k].default_value = v
    return m
def obj(name, mesh, mats=()):
    o = bpy.data.objects.new(name, mesh); sc.collection.objects.link(o)
    for m in mats: o.data.materials.append(m)
    return o
def prim(fn, name, mats=(), smooth=True, **kw):
    fn(**kw); o = bpy.context.active_object; o.name = name
    for m in mats: o.data.materials.append(m)
    if smooth:
        for p in o.data.polygons: p.use_smooth = True
    return o
def light(kind, name, energy, loc, rot=(0, 0, 0), size=1.0, color=(1, 1, 1)):
    d = bpy.data.lights.new(name, kind); d.energy = energy; d.color = color
    if kind == 'AREA': d.shape = 'RECTANGLE'; d.size = size; d.size_y = size * .6
    if kind == 'POINT': d.shadow_soft_size = size
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc; o.rotation_euler = rot
    return o

# studio: big softboxes (they also show in the reflections of the polished wafer)
key = light('AREA', 'key', 260, (3.5, -3.5, 6), (math.radians(40), 0, math.radians(45)), 4)
fill = light('AREA', 'fill', 110, (-5, -2, 3.5), (math.radians(60), 0, math.radians(-70)), 5)
rimL = light('AREA', 'rim', 160, (0, 5, 4), (math.radians(-50), 0, 0), 6)
top = light('AREA', 'top', 90, (0, 0, 8), (0, 0, 0), 6)

# a soft ceiling panel that only reflections see (polished silicon is a mirror)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, .5, 4.2)); ceil = bpy.context.active_object; ceil.scale = (22, 16, 1)
cm = bpy.data.materials.new('ceil'); cm.use_nodes = True; cnt = cm.node_tree; cnt.nodes.clear()
ce = cnt.nodes.new('ShaderNodeEmission'); ce.inputs[0].default_value = (1, 1, 1, 1); ce.inputs[1].default_value = 1.6
tc_ = cnt.nodes.new('ShaderNodeTexCoord'); gr = cnt.nodes.new('ShaderNodeTexGradient'); gr.gradient_type = 'SPHERICAL'
mp = cnt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (2.2, 2.2, 1)
cnt.links.new(tc_.outputs['Generated'], mp.inputs[0]); mp.inputs['Location'].default_value = (-.3, -.3, 0); cnt.links.new(mp.outputs[0], gr.inputs[0])
cr_ = cnt.nodes.new('ShaderNodeValToRGB'); cnt.links.new(gr.outputs[0], cr_.inputs[0]); cr_.color_ramp.elements[0].color = (.25, .26, .27, 1); cr_.color_ramp.elements[1].color = (1, 1, 1, 1)
cnt.links.new(cr_.outputs[0], ce.inputs[0])
co_ = cnt.nodes.new('ShaderNodeOutputMaterial'); cnt.links.new(ce.outputs[0], co_.inputs[0]); ceil.data.materials.append(cm)
ceil.visible_camera = False; ceil.visible_diffuse = False; ceil.visible_shadow = False

# ground that only catches shadows
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, -0.03)); ground = bpy.context.active_object; ground.is_shadow_catcher = True
ground.visible_glossy = False; ground.visible_transmission = False

# ---------------------------------------------------------------- materials
M_si = mat('silicon', **{'Base Color': (.56, .58, .62, 1), 'Metallic': 1, 'Roughness': .12})
M_wafer = mat('wafer', **{'Base Color': (.6, .62, .66, 1), 'Metallic': 1, 'Roughness': .04, 'Thin Film Thickness': 0, 'Thin Film IOR': 1.46})
M_graphite = mat('graphite', **{'Base Color': (.05, .055, .06, 1), 'Roughness': .55})
M_quartz = mat('quartz', **{'Base Color': (.95, .95, .93, 1), 'Roughness': .25, 'Transmission Weight': .7, 'IOR': 1.46})
M_steel = mat('steel', **{'Base Color': (.75, .76, .78, 1), 'Metallic': 1, 'Roughness': .3})
M_gold = mat('gold', **{'Base Color': (1, .76, .38, 1), 'Metallic': 1, 'Roughness': .18})
M_sand = mat('sand', **{'Base Color': (.62, .5, .32, 1), 'Roughness': .7, 'Subsurface Weight': .2})
M_resist = mat('resist', **{'Base Color': (.95, .62, .2, 1), 'Roughness': .08, 'Coat Weight': 1, 'Transmission Weight': .25, 'Alpha': 1})
M_tape = mat('tape', **{'Base Color': (.25, .45, .85, 1), 'Roughness': .35, 'Alpha': .85})
M_pcb = mat('pcb', **{'Base Color': (.05, .16, .12, 1), 'Roughness': .4, 'Coat Weight': .6})
M_mold = mat('mold', **{'Base Color': (.025, .028, .03, 1), 'Roughness': .7})
M_leadframe = mat('leadframe', **{'Base Color': (.85, .86, .88, 1), 'Metallic': 1, 'Roughness': .2})

def emissive(name, color, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs[0].default_value = (*color, 1); e.inputs[1].default_value = strength
    o = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(e.outputs[0], o.inputs[0]); return m
def glow(name, color, strength):
    """emission that fades with the object's 'a' property (0 … 1)"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs[0].default_value = (*color, 1); e.inputs[1].default_value = strength
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mx = nt.nodes.new('ShaderNodeMixShader'); at = nt.nodes.new('ShaderNodeAttribute')
    at.attribute_type = 'OBJECT'; at.attribute_name = 'a'
    nt.links.new(at.outputs['Fac'], mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(e.outputs[0], mx.inputs[2])
    o = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(mx.outputs[0], o.inputs[0]); return m
def fading(base):
    """wrap a material so the object's 'a' property fades it out (transparent)"""
    nt = base.node_tree; b = nt.nodes['Principled BSDF']; out = nt.nodes['Material Output']
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mx = nt.nodes.new('ShaderNodeMixShader'); at = nt.nodes.new('ShaderNodeAttribute')
    at.attribute_type = 'OBJECT'; at.attribute_name = 'a'
    nt.links.new(at.outputs['Fac'], mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(b.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], out.inputs[0])
    return base
for m in (M_si, M_wafer, M_graphite, M_quartz, M_steel, M_gold, M_sand, M_resist, M_tape, M_pcb, M_mold, M_leadframe): fading(m)
M_melt = glow('melt', (1, .5, .15), 5)
M_heater = glow('heater', (1, .32, .06), 4)
M_uv = glow('uv', (.45, .25, 1), 1.2)
M_ion = glow('ion', (.3, .9, .9), 14)
M_kerf = glow('kerf', (1, 1, 1), 2)

# the die: exposure (violet), etching (pattern), metal, and at the end exactly the chip map (texture as emission)
IMG_FINAL = bpy.data.images.load(os.path.join(HERE, 'die_final.png'))
IMG_GRAY = bpy.data.images.load(os.path.join(HERE, 'die_gray.png'))
IMG_GRAY.colorspace_settings.name = 'Non-Color'
def die_material():
    m = bpy.data.materials.new('die'); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links
    b = N['Principled BSDF']; out = N['Material Output']
    tc = N.new('ShaderNodeTexCoord')
    tf = N.new('ShaderNodeTexImage'); tf.image = IMG_FINAL; tf.interpolation = 'Cubic'
    tg = N.new('ShaderNodeTexImage'); tg.image = IMG_GRAY
    for t in (tf, tg): Lk.new(tc.outputs['UV'], t.inputs[0])
    def attr(nm):
        a = N.new('ShaderNodeAttribute'); a.attribute_type = 'OBJECT'; a.attribute_name = nm; return a.outputs['Fac']
    # unexposed resist → exposed (violet pattern) → etched (blue-grey pattern) → finished (the chip map's colours)
    amber = N.new('ShaderNodeRGB'); amber.outputs[0].default_value = (.95, .62, .2, 1)
    violet = N.new('ShaderNodeMix'); violet.data_type = 'RGBA'; violet.blend_type = 'MULTIPLY'; violet.inputs[0].default_value = 1
    violet.inputs[6].default_value = (.75, .55, 1, 1); Lk.new(tg.outputs['Color'], violet.inputs[7])
    etched = N.new('ShaderNodeMix'); etched.data_type = 'RGBA'; etched.blend_type = 'MULTIPLY'; etched.inputs[0].default_value = 1
    etched.inputs[6].default_value = (.45, .62, .68, 1); Lk.new(tg.outputs['Color'], etched.inputs[7])
    m1 = N.new('ShaderNodeMix'); m1.data_type = 'RGBA'; Lk.new(attr('expose'), m1.inputs[0]); Lk.new(amber.outputs[0], m1.inputs[6]); Lk.new(violet.outputs[2], m1.inputs[7])
    m2 = N.new('ShaderNodeMix'); m2.data_type = 'RGBA'; Lk.new(attr('etch'), m2.inputs[0]); Lk.new(m1.outputs[2], m2.inputs[6]); Lk.new(etched.outputs[2], m2.inputs[7])
    m3 = N.new('ShaderNodeMix'); m3.data_type = 'RGBA'; Lk.new(attr('metal'), m3.inputs[0]); Lk.new(m2.outputs[2], m3.inputs[6]); Lk.new(tf.outputs['Color'], m3.inputs[7])
    Lk.new(m3.outputs[2], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = .22; b.inputs['Coat Weight'].default_value = .5
    # the last frames: the texture as plain emission, so the film's die matches the page's chip map exactly
    em = N.new('ShaderNodeEmission'); Lk.new(tf.outputs['Color'], em.inputs[0]); em.inputs[1].default_value = 1
    mx = N.new('ShaderNodeMixShader'); Lk.new(attr('flat'), mx.inputs[0]); Lk.new(b.outputs[0], mx.inputs[1]); Lk.new(em.outputs[0], mx.inputs[2])
    tr = N.new('ShaderNodeBsdfTransparent'); mx2 = N.new('ShaderNodeMixShader'); Lk.new(attr('a'), mx2.inputs[0]); Lk.new(tr.outputs[0], mx2.inputs[1]); Lk.new(mx.outputs[0], mx2.inputs[2])
    Lk.new(mx2.outputs[0], out.inputs[0])
    return m
M_die = die_material()
M_dieside = fading(mat('dieside', **{'Base Color': (.35, .37, .4, 1), 'Metallic': .8, 'Roughness': .3}))

def setv(o, **kw):
    for k, v in kw.items(): o[k] = float(v)

# ---------------------------------------------------------------- objects
R = 1.0                       # wafer radius
ASP = 918 / 1208              # the die's aspect (the chip map's floorplan)
DIE = R / 4.4                 # die width on the wafer

# sand: irregular grains in one mesh, moved every frame
NS = 2200
bm = bmesh.new()
bmesh.ops.create_icosphere(bm, subdivisions=1, radius=1)
tmpl = [v.co.copy() for v in bm.verts]; tfaces = [[v.index for v in f.verts] for f in bm.faces]; bm.free()
grains = []
for i in range(NS):
    a = random.random() * math.tau; r = (random.random() ** .65) * 1.7
    h = (1 - r / 1.7) * .55 * random.random() ** .6
    grains.append(((math.cos(a) * r, math.sin(a) * r * .85, h), .012 + random.random() * .014, random.random()))
verts, faces = [], []
for gi, (c, s, _) in enumerate(grains):
    base = len(verts)
    k = [1 + random.uniform(-.25, .25) for _ in range(3)]
    verts += [(v.x * s * k[0], v.y * s * k[1], v.z * s * k[2]) for v in tmpl]
    faces += [[base + i for i in f] for f in tfaces]
sand_me = bpy.data.meshes.new('sand'); sand_me.from_pydata(verts, [], faces); sand = obj('sand', sand_me, [M_sand])
SAND_LOCAL = [Vector(v) for v in verts]
NT = len(tmpl)

# Czochralski puller: graphite susceptor, quartz crucible, melt, heaters, the ingot and its seed cable
def lathe(name, pts, mats, segs=96):
    bm = bmesh.new(); prof = [bm.verts.new((x, 0, z)) for x, z in pts]
    for i in range(len(prof) - 1): bm.edges.new((prof[i], prof[i + 1]))
    bmesh.ops.spin(bm, geom=bm.verts[:] + bm.edges[:], cent=(0, 0, 0), axis=(0, 0, 1), angle=math.tau, steps=segs, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = obj(name, me, mats)
    for p in o.data.polygons: p.use_smooth = True
    return o
puller = bpy.data.objects.new('puller', None); sc.collection.objects.link(puller)
susceptor = lathe('susceptor', [(0, 0), (.78, 0), (.86, .05), (.88, .55), (.8, .56), (.78, .08), (0, .08)], [M_graphite]); susceptor.parent = puller
crucible = lathe('crucible', [(0, .08), (.74, .08), (.77, .12), (.78, .54), (.75, .55), (.73, .14), (0, .12)], [M_quartz]); crucible.parent = puller
melt = prim(bpy.ops.mesh.primitive_cylinder_add, 'melt', [M_melt], vertices=96, radius=.725, depth=.02, location=(0, 0, .4)); melt.parent = puller
heaters = []
for i, z in enumerate((.12, .26, .4)):
    t = prim(bpy.ops.mesh.primitive_torus_add, f'heater{i}', [M_heater], major_radius=.98, minor_radius=.018, major_segments=96, minor_segments=8, location=(0, 0, z)); t.parent = puller; heaters.append(t)
melt_light = light('POINT', 'meltlight', 40, (0, 0, .9), size=.4, color=(1, .55, .2)); melt_light.parent = puller

ingot = bpy.data.objects.new('ingot', None); sc.collection.objects.link(ingot)
IR, IL = .3, 1.2
body = prim(bpy.ops.mesh.primitive_cylinder_add, 'ingot_body', [M_si], vertices=96, radius=IR, depth=IL, location=(0, 0, IL / 2)); body.parent = ingot
crown = prim(bpy.ops.mesh.primitive_cone_add, 'ingot_crown', [M_si], vertices=96, radius1=IR, radius2=.03, depth=.22, location=(0, 0, IL + .11)); crown.parent = ingot
for k in range(4):   # growth ridges
    a = k * math.pi / 2
    rd = prim(bpy.ops.mesh.primitive_cylinder_add, f'ridge{k}', [M_si], vertices=8, radius=.012, depth=IL, location=(math.cos(a) * IR, math.sin(a) * IR, IL / 2)); rd.parent = ingot
cable = prim(bpy.ops.mesh.primitive_cylinder_add, 'cable', [M_steel], vertices=12, radius=.008, depth=4, location=(0, 0, IL + .2 + 2)); cable.parent = ingot

# wire saw: guide rollers and a web of wires; the stack of wafers it leaves
saw = bpy.data.objects.new('saw', None); sc.collection.objects.link(saw)
for yy in (-.45, .45):
    r = prim(bpy.ops.mesh.primitive_cylinder_add, 'roller', [M_steel], vertices=48, radius=.07, depth=1.5, location=(0, yy, .0), rotation=(0, math.pi / 2, 0)); r.parent = saw
wires = []
for k in range(70):
    x = -.7 + k * 1.4 / 69
    wv = prim(bpy.ops.mesh.primitive_cylinder_add, 'wire', [M_steel], vertices=6, radius=.0012, depth=.9, location=(x, 0, .07), rotation=(math.pi / 2, 0, 0)); wv.parent = saw; wires.append(wv)
stack = []
for k in range(14):
    s = prim(bpy.ops.mesh.primitive_cylinder_add, f'slice{k}', [M_wafer], vertices=96, radius=IR, depth=.012, location=(0, 0, 0)); stack.append(s)

# the wafer (with its notch) and the resist on it
wafer = prim(bpy.ops.mesh.primitive_cylinder_add, 'wafer', [M_wafer], vertices=192, radius=R, depth=.02, location=(0, 0, -.01))
bev = wafer.modifiers.new('bevel', 'BEVEL'); bev.width = .004; bev.segments = 3; bev.limit_method = 'ANGLE'
resist = prim(bpy.ops.mesh.primitive_cylinder_add, 'resist', [M_resist], vertices=192, radius=R * .985, depth=.006, location=(0, 0, .003))
nozzle = prim(bpy.ops.mesh.primitive_cylinder_add, 'nozzle', [M_steel], vertices=24, radius=.02, depth=1.6, location=(0, 0, 1.2))
drop = prim(bpy.ops.mesh.primitive_uv_sphere_add, 'drop', [M_resist], segments=24, ring_count=12, radius=.03, location=(0, 0, .5))

# dies on the wafer
grid = []
for j in range(-6, 7):
    for i in range(-6, 7):
        x, y = i * DIE, j * DIE * ASP
        if math.hypot(abs(x) + DIE / 2, abs(y) + DIE * ASP / 2) < R * .95: grid.append([x, y])
grid.sort(key=lambda g: (-g[1], g[0]))
centre = min(range(len(grid)), key=lambda k: math.hypot(*grid[k]))
def die_mesh(w, h, t, name):
    bpy.ops.mesh.primitive_cube_add(size=1); o = bpy.context.active_object; o.name = name
    o.scale = (w, h, t); bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(M_die); o.data.materials.append(M_dieside)
    # top face gets the texture (UV 0…1), every other face the side material
    me = o.data; uv = me.uv_layers.active.data
    for p in me.polygons:
        if p.normal.z > .9:
            p.material_index = 0
            for li in p.loop_indices:
                co = me.vertices[me.loops[li].vertex_index].co
                uv[li].uv = ((co.x / w) + .5, (co.y / h) + .5)
        else: p.material_index = 1
    return o
dies = []
for k, (x, y) in enumerate(grid):
    o = die_mesh(DIE * .93, DIE * ASP * .93, .006, f'die{k}'); o.location = (x, y, .004); dies.append(o)
    setv(o, expose=0, etch=0, metal=0, flat=0, a=1)

# lithography: the reticle (glass with the pattern in chrome), the lens and the UV beam
reticle = die_mesh(.9, .9 * ASP, .02, 'reticle'); reticle.data.materials[0] = None
M_ret = mat('reticle', **{'Base Color': (.9, .92, .95, 1), 'Roughness': .05, 'Transmission Weight': .9, 'IOR': 1.46}); fading(M_ret)
ret_chrome = bpy.data.materials.new('chrome'); ret_chrome.use_nodes = True
nt = ret_chrome.node_tree; b = nt.nodes['Principled BSDF']; tg = nt.nodes.new('ShaderNodeTexImage'); tg.image = IMG_GRAY
inv = nt.nodes.new('ShaderNodeInvert'); nt.links.new(tg.outputs['Color'], inv.inputs[1])
nt.links.new(inv.outputs[0], b.inputs['Alpha']); b.inputs['Base Color'].default_value = (.12, .13, .15, 1); b.inputs['Metallic'].default_value = 1; b.inputs['Roughness'].default_value = .15
reticle.data.materials[0] = ret_chrome; reticle.data.materials[1] = M_ret
lens = prim(bpy.ops.mesh.primitive_cylinder_add, 'lens', [M_steel], vertices=64, radius=.32, depth=.5, location=(0, 0, 1.6))
beam = prim(bpy.ops.mesh.primitive_cone_add, 'beam', [M_uv], vertices=48, radius1=.06, radius2=.28, depth=1, end_fill_type='NOTHING', location=(0, 0, .5))
uvlight = light('SPOT', 'uvlight', 60, (0, 0, 1.3), color=(.55, .35, 1)); uvlight.data.spot_size = .45; uvlight.data.spot_blend = .6

# ions (one mesh of thin streaks)
NI = 260
iv, ifc = [], []
ion_seed = [(random.uniform(-1, 1), random.uniform(-1, 1), random.random()) for _ in range(NI)]
for i in range(NI):
    b0 = len(iv); iv += [(-.0015, 0, 0), (.0015, 0, 0), (.0015, 0, .03), (-.0015, 0, .03)]; ifc.append([b0, b0 + 1, b0 + 2, b0 + 3])
ion_me = bpy.data.meshes.new('ions'); ion_me.from_pydata(iv, [], ifc); ions = obj('ions', ion_me, [M_ion])

# the probe card
probe = bpy.data.objects.new('probe', None); sc.collection.objects.link(probe)
pc = prim(bpy.ops.mesh.primitive_cylinder_add, 'probecard', [M_pcb], vertices=64, radius=.2, depth=.02, location=(0, 0, .26)); pc.parent = probe
hole = prim(bpy.ops.mesh.primitive_cylinder_add, 'probering', [M_gold], vertices=64, radius=.07, depth=.025, location=(0, 0, .26)); hole.parent = probe
for k in range(16):
    a = k / 16 * math.tau
    n = prim(bpy.ops.mesh.primitive_cylinder_add, 'needle', [M_gold], vertices=6, radius=.003, depth=.3, location=(math.cos(a) * .045, math.sin(a) * .045, .13), rotation=(math.sin(a) * .35, -math.cos(a) * .35, 0)); n.parent = probe
marks = []
M_ok = glow('ok', (.2, 1, .45), 6); M_bad = glow('bad', (1, .25, .15), 6)
BAD = {len(grid) // 5, (len(grid) * 2) // 3}
for k, (x, y) in enumerate(grid):
    mk = prim(bpy.ops.mesh.primitive_uv_sphere_add, f'mark{k}', [M_bad if k in BAD else M_ok], segments=12, ring_count=6, radius=.012, location=(x + DIE * .33, y + DIE * ASP * .3, .016)); marks.append(mk)

# dicing: tape on a steel frame, the blade, the kerfs
tape = prim(bpy.ops.mesh.primitive_cylinder_add, 'tape', [M_tape], vertices=128, radius=R * 1.2, depth=.004, location=(0, 0, -.026))
frame = lathe('frame', [(R * 1.22, -.03), (R * 1.42, -.03), (R * 1.42, -.015), (R * 1.22, -.015)], [M_steel])
blade = prim(bpy.ops.mesh.primitive_cylinder_add, 'blade', [M_steel], vertices=96, radius=.22, depth=.01, location=(0, 0, .2), rotation=(math.pi / 2, 0, 0))
kerfs = []
xs = sorted({round((i + .5) * DIE, 5) for i in range(-6, 6) if abs((i + .5) * DIE) < R})
ys = sorted({round((j + .5) * DIE * ASP, 5) for j in range(-6, 6) if abs((j + .5) * DIE * ASP) < R})
for x in xs:
    L = 2 * math.sqrt(max(0, R * R - x * x)) * .985
    k = prim(bpy.ops.mesh.primitive_cube_add, 'kerf', [M_kerf], size=1, location=(x, 0, .009)); k.scale = (.006, L, .002); kerfs.append((k, 'y', L))
for y in ys:
    L = 2 * math.sqrt(max(0, R * R - y * y)) * .985
    k = prim(bpy.ops.mesh.primitive_cube_add, 'kerf', [M_kerf], size=1, location=(0, y, .009)); k.scale = (L, .006, .002); kerfs.append((k, 'x', L))

# the package (QFP): die pad, gull-wing leads, gold bond wires, the moulded body with its mark
pkg = bpy.data.objects.new('pkg', None); sc.collection.objects.link(pkg)
S = 1.0
pad = prim(bpy.ops.mesh.primitive_cube_add, 'diepad', [M_leadframe], size=1, location=(0, 0, -.012)); pad.scale = (.62, .62 * ASP + .04, .012); pad.parent = pkg
leads = []
NL = 14
def gull(name):
    bm = bmesh.new()
    pts = [(0, 0), (.12, 0), (.16, -.05), (.24, -.07), (.28, -.07)]
    prev = None
    for i, (x, z) in enumerate(pts):
        a = bm.verts.new((x, -.012, z)); b = bm.verts.new((x, .012, z)); c = bm.verts.new((x, .012, z - .008)); d = bm.verts.new((x, -.012, z - .008))
        cur = (a, b, c, d)
        if prev:
            for q in range(4): bm.faces.new((prev[q], prev[(q + 1) % 4], cur[(q + 1) % 4], cur[q]))
        prev = cur
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); return me
for side in range(4):
    for k in range(NL):
        u = (k + .5) / NL * .9 - .45
        o = obj('lead', gull('lead'), [M_leadframe]); o.parent = pkg
        if side == 0: o.location = (u, -.5, 0); o.rotation_euler = (0, 0, -math.pi / 2)
        elif side == 1: o.location = (u, .5, 0); o.rotation_euler = (0, 0, math.pi / 2)
        elif side == 2: o.location = (-.5, u, 0); o.rotation_euler = (0, 0, math.pi)
        else: o.location = (.5, u, 0); o.rotation_euler = (0, 0, 0)
        leads.append(o)
bwires = []
PD = .62 / 2; PH = .62 * ASP / 2
for side in range(4):
    for k in range(NL):
        u = (k + .5) / NL
        if side == 0: a = Vector((-PD + u * 2 * PD * .95 + .015, -PH + .02, .008)); b = Vector((u * .9 - .45, -.47, 0))
        elif side == 1: a = Vector((-PD + u * 2 * PD * .95 + .015, PH - .02, .008)); b = Vector((u * .9 - .45, .47, 0))
        elif side == 2: a = Vector((-PD + .02, -PH + u * 2 * PH * .95 + .01, .008)); b = Vector((-.47, u * .9 - .45, 0))
        else: a = Vector((PD - .02, -PH + u * 2 * PH * .95 + .01, .008)); b = Vector((.47, u * .9 - .45, 0))
        cu = bpy.data.curves.new('bw', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = .0028; cu.bevel_resolution = 2
        sp = cu.splines.new('BEZIER'); sp.bezier_points.add(1)
        p0, p1 = sp.bezier_points
        p0.co = a; p1.co = b
        p0.handle_right = a + Vector((0, 0, .09)) + (b - a) * .15; p0.handle_left = a
        p1.handle_left = b + Vector((0, 0, .05)) - (b - a) * .25; p1.handle_right = b
        o = bpy.data.objects.new('bw', cu); sc.collection.objects.link(o); o.data.materials.append(M_gold); o.parent = pkg
        bwires.append(o)
# the moulded body, with the laser mark
from PIL import Image as PImg, ImageDraw, ImageFont
mark_path = os.path.join(HERE, 'mark.png')
if not os.path.exists(mark_path):
    im = PImg.new('RGB', (1024, 1024), (8, 9, 10)); dr = ImageDraw.Draw(im)
    tri = [[(635, 0), (0, 842), (1270, 842)], [(306, 438), (0, 842), (610, 842)], [(557, 500), (674, 621), (508, 842), (225, 842)], [(889, 335), (1270, 842), (508, 842)]]
    for t in tri: dr.polygon([(170 + x * .16, 420 + y * .16) for x, y in t], fill=(70, 72, 74))
    try: f1 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 96); f2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 34)
    except Exception: f1 = f2 = None
    dr.text((400, 430), 'SEMITEC', fill=(78, 80, 82), font=f1); dr.text((404, 545), 'F O U N D A T I O N', fill=(70, 72, 74), font=f2)
    dr.ellipse((90, 90, 130, 130), fill=(30, 31, 32))
    im.save(mark_path)
IMG_MARK = bpy.data.images.load(mark_path)
M_body = mat('body', **{'Base Color': (.03, .032, .035, 1), 'Roughness': .65})
nt = M_body.node_tree; ti = nt.nodes.new('ShaderNodeTexImage'); ti.image = IMG_MARK; nt.links.new(ti.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color'])
fading(M_body)
body_mold = prim(bpy.ops.mesh.primitive_cube_add, 'mold', [M_body], smooth=False, size=1, location=(0, 0, .04))
body_mold.scale = (1.0, 1.0, .09); bpy.ops.object.transform_apply(scale=True)
bvm = body_mold.modifiers.new('b', 'BEVEL'); bvm.width = .02; bvm.segments = 3
me = body_mold.data; uv = me.uv_layers.active.data
for p in me.polygons:
    for li in p.loop_indices:
        co = me.vertices[me.loops[li].vertex_index].co; uv[li].uv = (co.x + .5, co.y + .5)
body_mold.parent = pkg
hero = die_mesh(.62 * .97, .62 * ASP * .97, .01, 'hero')   # the chosen die, at package scale
setv(hero, expose=1, etch=1, metal=1, flat=0, a=1)

# every object starts fully shown (materials fade with the object's 'a')
for o in bpy.data.objects:
    if 'a' not in o.keys(): o['a'] = 1.0

# camera
camd = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', camd); sc.collection.objects.link(cam); sc.camera = cam
camd.sensor_width = 36; camd.clip_start = .01; camd.clip_end = 200
camd.dof.use_dof = True; camd.dof.aperture_fstop = 5.6

# ---------------------------------------------------------------- the film: the scene at P
# camera shots per stage: (location, target, lens mm)
SHOTS = [
    ((0, -4.6, 2.4), (0, 0, .25), 50),     # 0 sand
    ((0, -4.8, 2.1), (0, 0, 1.0), 50),     # 1 crystal growth
    ((1.3, -3.8, 2.0), (0, 0, .5), 50),    # 2 slicing
    ((0, -3.0, 3.0), (0, 0, 0), 50),       # 3 oxide, resist
    ((0, -3.2, 3.3), (0, 0, .25), 50),     # 4 lithography
    ((0, -2.8, 3.0), (0, 0, 0), 50),       # 5 etching, doping
    ((-.9, -2.1, 2.0), (0, 0, 0), 50),     # 6 metal
    ((0, -2.8, 3.0), (0, 0, 0), 50),       # 7 test
    ((0, -3.2, 3.6), (0, 0, 0), 50),       # 8 dicing
    ((0, -1.9, 1.9), (0, 0, 0), 50),       # 9 packaging
    ((0, -.0001, 7.0), (0, 0, 0), 135),    # 10 the opened die, from above (almost orthographic)
    ((0, -.0001, 7.0), (0, 0, 0), 135),
]
def smooth(t): return t * t * (3 - 2 * t)
def shot(P):
    i = int(clamp(math.floor(P), 0, len(SHOTS) - 2)); k = smooth(clamp(P - i))
    a, b = SHOTS[i], SHOTS[i + 1]
    return vlerp(a[0], b[0], k), vlerp(a[1], b[1], k), lerp(a[2], b[2], k)

def put(o, loc=None, rot=None, scale=None, a=None, show=True):
    o.hide_render = not show
    if loc is not None: o.location = loc
    if rot is not None: o.rotation_euler = rot
    if scale is not None: o.scale = scale if hasattr(scale, '__len__') else (scale, scale, scale)
    if a is not None: o['a'] = float(a)
def show_tree(o, on):
    o.hide_render = not on
    for c in o.children_recursive: c.hide_render = not on

def state(P, t):
    # sand: a heap that swirls into the crucible and melts
    go = seg(P, .45, 1.05)
    me = sand.data; co = [0.0] * (len(me.vertices) * 3)
    for gi, (c, s, r) in enumerate(grains):
        ang = math.atan2(c[1], c[0]) + go * 5 + r * go
        rad = math.hypot(c[0], c[1]) * (1 - go * .62)
        cx = lerp(c[0], math.cos(ang) * rad * .42, go); cy = lerp(c[1], math.sin(ang) * rad * .42, go); cz = lerp(c[2], .42 + r * .05, go) + math.sin(go * math.pi) * .5 * r
        base = gi * NT
        for vi in range(NT):
            lv = SAND_LOCAL[base + vi]; j = (base + vi) * 3
            co[j] = cx + lv.x; co[j + 1] = cy + lv.y; co[j + 2] = cz + lv.z
    me.vertices.foreach_set('co', co); me.update()
    put(sand, a=1 - seg(P, .95, 1.15), show=P < 1.15)
    # the puller
    cr = seg(P, .4, .8) * (1 - seg(P, 2.0, 2.3))
    show_tree(puller, cr > .01)
    for o in (susceptor, crucible): o['a'] = cr
    melt['a'] = cr; [h.__setitem__('a', cr * (.8 + .2 * math.sin(t * 3 + i))) for i, h in enumerate(heaters)]
    melt_light.data.energy = 40 * cr
    puller.location = (0, 0, lerp(-.6, 0, seg(P, .4, .8)))
    # the ingot grows from the melt, then lies down on the wire saw
    grow = seg(P, .95, 1.85); lie = seg(P, 1.9, 2.25); cut = seg(P, 2.25, 2.8)
    show_tree(ingot, grow > .01 and P < 2.85)
    sx = 1 - cut * .8
    ingot.location = (lerp(0, -.55 + (1 - sx) * .0, lie), 0, lerp(.42 - (1 - grow) * 0, .3, lie))
    ingot.rotation_euler = (0, lerp(0, math.pi / 2, lie), t * .6 * (1 - lie))
    ingot.scale = (1, 1, max(.001, grow) * sx)
    for o in [body, crown, cable] + [c for c in ingot.children]: o['a'] = 1 - seg(P, 2.6, 2.85)
    cable['a'] = 1 - lie
    sv = seg(P, 2.05, 2.25) * (1 - seg(P, 2.75, 2.95))
    show_tree(saw, sv > .01); saw.location = (.1, 0, lerp(.9, .3, seg(P, 2.15, 2.3)) - cut * .3)
    for o in saw.children: o['a'] = sv
    # slices: a stack that fans out, then one becomes the wafer
    n = len(stack)
    gather = seg(P, 2.72, 3.05)
    for k, s in enumerate(stack):
        a = clamp(cut * (n + 2) - k)
        on = a > 0 and gather < .99
        x0 = -.55 + 1.2 * .8 * 0 + .65 - k * .02
        pos = Vector((lerp(.25 + k * .012, .2 + k * .11, a), 0, .3))
        rot = Euler((0, math.pi / 2, 0))
        put(s, loc=vlerp(pos, (0, 0, 0), gather) if k == 0 else pos, rot=Euler((0, lerp(math.pi / 2, 0, gather if k == 0 else 0), 0)),
            scale=(lerp(1, R / IR, gather) if k == 0 else 1), a=(1 if k == 0 else 1 - gather), show=on or (k == 0 and P < 3.05 and a > 0))
    # the wafer
    wv = seg(P, 2.98, 3.08) * (1 - seg(P, 8.45, 8.75))
    put(wafer, a=wv, show=wv > .01)
    M_wafer.node_tree.nodes['Principled BSDF'].inputs['Thin Film Thickness'].default_value = 480 * seg(P, 3.05, 3.5)
    spin = seg(P, 3.4, 3.5) * (1 - seg(P, 3.95, 4.05))
    wafer.rotation_euler = (0, 0, P * .15 + spin * t * 6)
    rs = seg(P, 3.5, 3.95); strip = seg(P, 4.95, 5.3)
    put(resist, scale=(max(.02, rs), max(.02, rs), 1), a=.9 * (1 - strip), show=rs > .01 and strip < .99)
    resist.rotation_euler = wafer.rotation_euler
    put(nozzle, loc=(0, 0, lerp(2.2, 1.0, seg(P, 3.35, 3.5)) + seg(P, 3.95, 4.05) * 1.5), show=3.33 < P < 4.05)
    put(drop, loc=(0, 0, .95 - ((t * 1.3) % 1) * .9), show=3.45 < P < 3.95)
    # dies: exposure, etch, metal, test, dicing, pick
    N = len(grid)
    scan = (P - 4.0) / .9 * N; etch = P - 5.0; met = (P - 6.0) / .8
    apart = seg(P, 8.3, 8.55); pick = seg(P, 8.55, 9.0); others = 1 - seg(P, 8.8, 9.05)
    for k, (x, y) in enumerate(grid):
        d = dies[k]; e = clamp(scan - k); k8 = (k * 7) % 11 / 11
        et = clamp((etch - k8 * .3) / .5); mt = clamp((met - k8 * .3) / .6)
        is_c = k == centre
        on = 4.0 < P < 9.1 and e > 0 and not (is_c and pick > 0)
        off = 1 + apart * .12
        put(d, loc=(x * off, y * off, .004), show=on, a=others)
        setv(d, expose=e, etch=et, metal=mt)
        tested = 7.0 < P < 8.9 and (P - 7.0) / .85 * N > k
        put(marks[k], loc=(x * off + DIE * .33, y * off + DIE * ASP * .3, .016), show=tested, a=1)
    # lithography
    lv = seg(P, 3.9, 4.02) * (1 - seg(P, 4.9, 5.05))
    cur = grid[int(clamp(math.floor(scan), 0, N - 1))]
    for o in (reticle, lens, beam): o.hide_render = lv < .01
    reticle['a'] = lv; lens['a'] = lv; beam['a'] = lv * (.8 + .2 * math.sin(t * 20))
    reticle.location = (cur[0] * .3, cur[1] * .3, 1.05); lens.location = (cur[0] * .3, cur[1] * .3, 1.45)
    tgt = Vector((cur[0], cur[1], .01)); src = Vector((cur[0] * .3, cur[1] * .3, 1.0)); dv = src - tgt
    beam.location = (tgt + src) / 2; beam.rotation_euler = dv.to_track_quat('Z', 'Y').to_euler(); beam.scale = (1, 1, dv.length)
    uvlight.location = src; uvlight.rotation_euler = (-dv).to_track_quat('-Z', 'Y').to_euler(); uvlight.data.energy = 60 * lv; uvlight.hide_render = lv < .01
    # ions
    iv_ = seg(P, 4.95, 5.15) * (1 - seg(P, 5.75, 5.95))
    ions.hide_render = iv_ < .01; ions['a'] = iv_
    if iv_ > .01:
        co = [0.0] * (NI * 12)
        for i, (a_, b_, c_) in enumerate(ion_seed):
            ph = (t * 1.1 + c_) % 1; x, y, z = a_ * .9, b_ * .9, lerp(1.6, .01, ph)
            for q, (dx, dz) in enumerate(((-.0015, 0), (.0015, 0), (.0015, .03), (-.0015, .03))):
                j = (i * 4 + q) * 3; co[j] = x + dx; co[j + 1] = y; co[j + 2] = z + dz
        ions.data.vertices.foreach_set('co', co); ions.data.update()
    # the probe card steps from die to die
    pv = seg(P, 6.9, 7.05) * (1 - seg(P, 7.85, 8.0))
    show_tree(probe, pv > .01)
    for c in probe.children: c['a'] = pv
    test = (P - 7.0) / .85 * N; tc = grid[int(clamp(math.floor(test), 0, N - 1))]
    probe.location = (tc[0], tc[1], abs(math.sin((test % 1) * math.pi)) * .06)
    # dicing
    tv = seg(P, 7.85, 8.05) * (1 - seg(P, 8.85, 9.05))
    for o in (tape, frame): put(o, a=tv, show=tv > .01)
    cut2 = seg(P, 8.0, 8.32)
    for idx, (k, ax, L) in enumerate(kerfs):
        f = clamp(cut2 * (len(kerfs) + 3) - idx)
        k.hide_render = not (f > 0 and P < 8.9); k['a'] = 1 - apart
        if ax == 'y': k.scale = (.006, max(.0001, L * f), .002)
        else: k.scale = (max(.0001, L * f), .006, .002)
    bl = seg(P, 7.98, 8.02) * (1 - seg(P, 8.3, 8.4))
    bi = int(clamp(cut2 * len(kerfs), 0, len(kerfs) - 1)); kb = kerfs[bi][0]
    put(blade, loc=(kb.location.x, kb.location.y, .2), show=bl > .01, a=bl)
    blade.rotation_euler = (math.pi / 2, 0, 0 if kerfs[bi][1] == 'y' else math.pi / 2)
    # the chosen die rises and the package forms around it
    pk = seg(P, 9.0, 9.3); ld = seg(P, 9.08, 9.32); bw = seg(P, 9.3, 9.72); lc = seg(P, 9.72, 9.96); op = seg(P, 10.02, 10.38)
    cx, cy = grid[centre]
    hs = lerp(DIE * .93 / (.62 * .97), 1, pk)
    put(hero, loc=(lerp(cx, 0, pick), lerp(cy, 0, pick), lerp(lerp(.004, .5, pick), .002, pk)), rot=(0, 0, lerp(0, math.tau, pick) * (1 - pk)),
        scale=(hs, hs, 1), show=pick > 0 and P <= P_END + .01, a=1)
    hero['flat'] = seg(P, 10.15, 10.5)
    show_tree(pkg, pk > .01 and P < 10.55)
    gone = 1 - seg(op, .05, .33)
    pad['a'] = pk * gone; pad.hide_render = not (pk > .01 and op < .35)
    for i, o in enumerate(leads): o['a'] = clamp(ld * 1.5 - (i % NL) / NL * .5) * gone; o.hide_render = not (ld > 0 and op < .35)
    for i, o in enumerate(bwires):
        f = clamp(bw * len(bwires) * 1.03 - i); o.hide_render = not (f > 0 and P < 10.55)
        o.data.bevel_factor_end = max(.001, f); o['a'] = gone
        if op > .35: o.hide_render = True
    body_mold.location = (0, 0, lerp(.9, .042, lc) + op * 1.4)
    body_mold.hide_render = not (lc > 0 and op < .99); body_mold['a'] = lc * (1 - seg(op, .25, .7))
    # camera
    loc, at, lens_mm = shot(P)
    cam.location = loc; d = Vector(at) - loc
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    if P > 9.9:   # the last move: straight down onto the die, with the die's top edge up
        cam.rotation_euler = (0, 0, 0) if P >= 10.4 else cam.rotation_euler.to_quaternion().slerp(Euler((0, 0, 0)).to_quaternion(), seg(P, 9.9, 10.4)).to_euler()
    camd.lens = lens_mm
    camd.dof.focus_distance = d.length
    camd.dof.aperture_fstop = lerp(4, 22, seg(P, 9.8, 10.3))
    # the studio dims a little for the melt, and goes flat for the final die
    for o, e in ((key, 260), (fill, 110), (rimL, 160), (top, 90)):
        o.data.energy = e * (1 - .35 * cr) * (1 - .9 * seg(P, 10.15, 10.5))
    bg.inputs[1].default_value = .35 * (1 - .9 * seg(P, 10.15, 10.5))
    ground.hide_render = P > 10.1

# the final die rectangle in the frame (for the page to put the chip map exactly over it)
def die_rect():
    from bpy_extras.object_utils import world_to_camera_view
    pts = [Vector((sx * .62 * .97 / 2, sy * .62 * ASP * .97 / 2, .007)) for sx in (-1, 1) for sy in (-1, 1)]
    vs = [world_to_camera_view(sc, cam, p) for p in pts]
    xs = [v.x for v in vs]; ys = [1 - v.y for v in vs]
    return {'l': min(xs), 't': min(ys), 'w': max(xs) - min(xs), 'h': max(ys) - min(ys)}

if __name__ == '__main__':
    for f in range(F0, F1 + 1):
        P = f / (NFRAMES - 1) * P_END
        state(P, f / 24)
        sc.render.filepath = os.path.join(OUT, f'f{f:03d}.png')
        bpy.ops.render.render(write_still=True)
        print('frame', f, 'P', round(P, 3), flush=True)
    if F1 >= NFRAMES - 1:
        state(P_END, (NFRAMES - 1) / 24)
        json.dump({'frames': NFRAMES, 'pEnd': P_END, 'width': W, 'height': H, 'die': die_rect()}, open(os.path.join(OUT, 'film.json'), 'w'))
