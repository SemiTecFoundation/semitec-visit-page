# The prologue of the film: the mountains of Armenia → Mount Aragats and its four summits → quartz → sand.
# It ends on exactly the first frame of the fab film (the heap of sand), so the two join into one film.
# Elevation: NASA SRTM 1 arc-second (public domain); the border of Armenia: Natural Earth (public domain).
# Usage: python prologue.py <out_dir> <scene A|B|C> <first> <last> <W> <H> <samples>
#        python prologue.py --plan
import sys, os, json, math, random
HERE = os.path.dirname(os.path.abspath(__file__))
DEM = os.environ.get('DEM', os.path.join(HERE, 'dem'))
FPSP = 24

# ---------------------------------------------------------------- the timeline (frames of the prologue)
# A: the relief of Armenia (rest at frame 0); the move to Aragats crosses into scene B
# B: Aragats, its contour lines and four summits; the dive to its rock crosses into scene C
# C: a quartz specimen; it breaks into sand, which settles into the heap of the fab film
T_B, W_B, X_B = 2.4, 3.6, .9      # transition, work, cross-fade (seconds)
T_C, W_C, X_C = 2.1, 3.2, .8
T_D, W_D = 2.6, 1.3
def fr(s): return round(s * FPSP)
F_B0 = 1; F_B1 = F_B0 + fr(T_B) - 1; F_BX = F_B1 - fr(X_B) + 1; F_Bw = F_B1 + fr(W_B)
F_C0 = F_Bw + 1; F_C1 = F_C0 + fr(T_C) - 1; F_CX = F_C1 - fr(X_C) + 1; F_Cw = F_C1 + fr(W_C)
F_D0 = F_Cw + 1; F_D1 = F_D0 + fr(T_D) - 1; F_Dw = F_D1 + fr(W_D)     # F_Dw is the fab film's frame 0
PLAN = {'frames': F_Dw, 'rests': [0, F_Bw, F_Cw], 'texts': [0, F_B1, F_C1, F_D1],
        'A': [0, F_B1], 'B': [F_BX, F_C1], 'C': [F_CX, F_Dw - 1], 'xB': [F_BX, F_B1], 'xC': [F_CX, F_C1]}
if len(sys.argv) > 1 and sys.argv[1] == '--plan':
    json.dump(PLAN, open(os.path.join(HERE, 'prologue_plan.json'), 'w')); print(PLAN); sys.exit()

OUTP, SCN, P0, P1, WP, HP, SP = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5], sys.argv[6], sys.argv[7]
sys.argv = ['film.py', OUTP, '0', '-1', WP, HP, SP]
_src = open(os.path.join(HERE, 'film.py')).read().split("if __name__ == '__main__':\n    import time")[0]
exec(_src)
import numpy as np
sc.cycles.film_transparent_glass = False   # the crystals show the bright studio through them (crisper than a see-through hole)
os.makedirs(OUTP, exist_ok=True)

def smooth(t): t = clamp(t); return t * t * (3 - 2 * t)
def smoother(t): t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10)
def easeout(t): t = clamp(t); return 1 - (1 - t) ** 3

# ---------------------------------------------------------------- terrain from elevation data
def inside(px, py, poly):
    """vectorised even-odd test: points (px, py) in polygon poly (n×2)"""
    res = np.zeros(px.shape, bool); x0, y0 = poly[-1]
    for x1, y1 in poly:
        c = ((y1 > py) != (y0 > py)) & (px < (x0 - x1) * (py - y1) / (y0 - y1 + 1e-12) + x1)
        res ^= c; x0, y0 = x1, y1
    return res

def palette(e, slope, noise):
    """colour of the land at elevation e (m), slope (0 flat … 1 cliff): dry Armenian highland colours"""
    stops = [(300, (.24, .33, .14)), (900, (.36, .40, .19)), (1500, (.50, .46, .25)), (2100, (.44, .45, .25)),
             (2700, (.40, .36, .26)), (3300, (.38, .34, .30)), (3750, (.50, .49, .48)), (3950, (.88, .89, .92))]
    out = np.zeros(e.shape + (3,), np.float32)
    for i in range(len(stops) - 1):
        (e0, c0), (e1, c1) = stops[i], stops[i + 1]
        k = np.clip((e - e0) / (e1 - e0), 0, 1)[..., None]
        m = ((e >= e0) & (e < e1))[..., None] | ((i == 0) & (e < e0))[..., None] | ((i == len(stops) - 2) & (e >= e1))[..., None]
        out = np.where(m, np.array(c0) + (np.array(c1) - np.array(c0)) * k, out)
    rock = np.array((.42, .38, .34))
    s = np.clip((slope - .25) / .5, 0, 1)[..., None] * (e < 3800)[..., None]
    out = out * (1 - s * .6) + rock * s * .6
    return np.clip(out * (1 + (noise - .5) * .12)[..., None], 0, 1)

def build_terrain(name, Z, lat_n, lon_w, step, keep, sx, sy, zk, zbase, center, extra=None, snap=None):
    """Z: elevations (rows north→south); keep: bool mask of cells kept; sx/sy: scene units per column/row"""
    H_, W_ = Z.shape
    idx = -np.ones(Z.shape, np.int64); ys, xs = np.nonzero(keep); idx[ys, xs] = np.arange(len(xs))
    X = (xs - center[0]) * sx; Y = -(ys - center[1]) * sy; E = Z[ys, xs]
    verts = np.stack([X, Y, zbase + E * zk], 1)
    a, b, c, d = idx[:-1, :-1], idx[:-1, 1:], idx[1:, 1:], idx[1:, :-1]
    ok = (a >= 0) & (b >= 0) & (c >= 0) & (d >= 0)
    faces = np.stack([a[ok], d[ok], c[ok], b[ok]], 1)
    me = bpy.data.meshes.new(name); me.from_pydata(verts.tolist(), [], faces.tolist()); me.update()
    # slope and colour
    gy, gx = np.gradient(Z.astype(np.float32))
    sl = np.hypot(gx / (sx / zk), gy / (sy / zk)); sl = np.clip(sl / (np.percentile(sl[keep], 97) + 1e-6), 0, 1)
    rng = np.random.default_rng(3); nz = rng.random(Z.shape).astype(np.float32)
    from scipy.ndimage import gaussian_filter
    nz = gaussian_filter(nz, 2); nz = (nz - nz.min()) / (np.ptp(nz) + 1e-6)
    col = palette(Z, sl, nz)
    if extra is not None: col = extra(col, Z, ys, xs)
    C = np.concatenate([col[ys, xs], np.ones((len(xs), 1), np.float32)], 1)
    at = me.color_attributes.new('col', 'FLOAT_COLOR', 'POINT'); at.data.foreach_set('color', C.ravel())
    el = me.attributes.new('elev', 'FLOAT', 'POINT'); el.data.foreach_set('value', E.astype(np.float32))
    G = np.hypot(gx / sx, gy / sy)[ys, xs].astype(np.float32)        # metres per scene unit
    ga = me.attributes.new('grad', 'FLOAT', 'POINT'); ga.data.foreach_set('value', G)
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    for p in me.polygons: p.use_smooth = True
    # walls: the boundary pulled straight down to the paper, closed underneath
    bm = bmesh.new(); bm.from_mesh(me)
    if snap is not None:   # a clean outline: the boundary moved onto the true border
        bv = [v for v in bm.verts if v.is_boundary]
        P_ = np.array([(v.co.x, v.co.y) for v in bv]); Q = snap(P_)
        for v, q in zip(bv, Q): v.co.x, v.co.y = float(q[0]), float(q[1])
    edges = [e for e in bm.edges if e.is_boundary]
    ret = bmesh.ops.extrude_edge_only(bm, edges=edges)
    nv = [g for g in ret['geom'] if isinstance(g, bmesh.types.BMVert)]
    for v in nv: v.co.z = 0.0
    walls = [g for g in ret['geom'] if isinstance(g, bmesh.types.BMFace)]
    for f in walls: f.material_index = 1; f.smooth = False
    bm.to_mesh(me); bm.free()
    return o

def terrain_material(name, contour=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links
    b = N['Principled BSDF']; b.inputs['Roughness'].default_value = .82
    ca = N.new('ShaderNodeAttribute'); ca.attribute_name = 'col'; ca.attribute_type = 'GEOMETRY'
    L.new(ca.outputs['Color'], b.inputs['Base Color'])
    # a gentle bump so the land is not plastic-smooth
    tx = N.new('ShaderNodeTexNoise'); tx.inputs['Scale'].default_value = 900; tx.inputs['Detail'].default_value = 6
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = .18; bp.inputs['Distance'].default_value = .002
    L.new(tx.outputs['Fac'], bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
    out = N['Material Output']
    if contour:
        # gold contour lines every 100 m, drawn from the foot of the mountain up to `reveal` (object property)
        ea = N.new('ShaderNodeAttribute'); ea.attribute_name = 'elev'; ea.attribute_type = 'GEOMETRY'
        rv = N.new('ShaderNodeAttribute'); rv.attribute_name = 'reveal'; rv.attribute_type = 'OBJECT'
        dv = N.new('ShaderNodeMath'); dv.operation = 'DIVIDE'; dv.inputs[1].default_value = 200
        fr_ = N.new('ShaderNodeMath'); fr_.operation = 'PINGPONG'; fr_.inputs[1].default_value = .5
        L.new(ea.outputs['Fac'], dv.inputs[0]); L.new(dv.outputs[0], fr_.inputs[0])
        # thin line: pingpong distance to the nearest 100 m < width (widened where the slope is gentle by the derivative-free trick: fixed)
        gr = N.new('ShaderNodeAttribute'); gr.attribute_name = 'grad'; gr.attribute_type = 'GEOMETRY'
        wd = N.new('ShaderNodeMath'); wd.operation = 'MULTIPLY'; wd.inputs[1].default_value = .0035 / 200   # line half-width .0035 units
        L.new(gr.outputs['Fac'], wd.inputs[0])
        ln = N.new('ShaderNodeMath'); ln.operation = 'LESS_THAN'
        L.new(fr_.outputs[0], ln.inputs[0]); L.new(wd.outputs[0], ln.inputs[1])
        lt = N.new('ShaderNodeMath'); lt.operation = 'LESS_THAN'
        L.new(ea.outputs['Fac'], lt.inputs[0]); L.new(rv.outputs['Fac'], lt.inputs[1])
        mk = N.new('ShaderNodeMath'); mk.operation = 'MULTIPLY'; L.new(ln.outputs[0], mk.inputs[0]); L.new(lt.outputs[0], mk.inputs[1])
        gl = N.new('ShaderNodeAttribute'); gl.attribute_name = 'glowk'; gl.attribute_type = 'OBJECT'
        mk2 = N.new('ShaderNodeMath'); mk2.operation = 'MULTIPLY'; L.new(mk.outputs[0], mk2.inputs[0]); L.new(gl.outputs['Fac'], mk2.inputs[1])
        em = N.new('ShaderNodeEmission'); em.inputs[0].default_value = (1, .74, .34, 1); em.inputs[1].default_value = 4.5
        mx = N.new('ShaderNodeMixShader'); L.new(mk2.outputs[0], mx.inputs[0]); L.new(b.outputs[0], mx.inputs[1]); L.new(em.outputs[0], mx.inputs[2])
        L.new(mx.outputs[0], out.inputs[0])
    return m

def strata_material(name):
    """the cut sides: layers of volcanic rock"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links
    b = N['Principled BSDF']; b.inputs['Roughness'].default_value = .9
    tc = N.new('ShaderNodeTexCoord'); sp = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sp.inputs[0])
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 14; nz.inputs['Detail'].default_value = 4
    L.new(tc.outputs['Object'], nz.inputs['Vector'])
    ad = N.new('ShaderNodeMath'); ad.operation = 'MULTIPLY_ADD'; ad.inputs[1].default_value = .035
    L.new(nz.outputs['Fac'], ad.inputs[0]); L.new(sp.outputs['Z'], ad.inputs[2])
    wv = N.new('ShaderNodeMath'); wv.operation = 'MULTIPLY'; wv.inputs[1].default_value = 34; L.new(ad.outputs[0], wv.inputs[0])
    sn = N.new('ShaderNodeMath'); sn.operation = 'SINE'; L.new(wv.outputs[0], sn.inputs[0])
    cr = N.new('ShaderNodeValToRGB'); L.new(sn.outputs[0], cr.inputs[0])
    cr.color_ramp.elements[0].position = .2; cr.color_ramp.elements[0].color = (.16, .13, .11, 1)
    cr.color_ramp.elements[1].position = .8; cr.color_ramp.elements[1].color = (.34, .29, .24, 1)
    L.new(cr.outputs[0], b.inputs['Base Color'])
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = .25; L.new(nz.outputs['Fac'], bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

M_STRATA = strata_material('strata')

# ---- A: Armenia, cut along its border, standing on the paper
Zr = np.load(os.path.join(DEM, 'armenia.npy')); mr = json.load(open(os.path.join(DEM, 'armenia.json')))
nR = mr['n']; dd = (mr['east'] - mr['west']) / nR
latc, lonc = 40.08, 45.03
KM_A = 80.0                                    # km per scene unit
ky = 111.0 / KM_A * dd; kx = 111.32 * math.cos(math.radians(latc)) / KM_A * dd
cx = (lonc - mr['west']) / dd; cy = (mr['north'] - latc) / dd
arm = json.load(open(os.path.join(DEM, 'arm.json')))
lons = mr['west'] + (np.arange(nR) + .5) * dd; lats = mr['north'] - (np.arange(nR) + .5) * dd
LON, LAT = np.meshgrid(lons, lats)
keep = np.zeros(Zr.shape, bool)
for poly in arm['coordinates']: keep |= inside(LON, LAT, np.array(poly[0]))
def sevan(col, Z, ys, xs):
    lake = (LAT > 40.0) & (LAT < 40.68) & (LON > 44.9) & (LON < 45.7) & (np.abs(Z - 1900) < 6)
    from scipy.ndimage import binary_opening
    lake = binary_opening(lake, iterations=1)
    col[lake] = (.16, .33, .42); return col
ZK_A = 7.0 / (KM_A * 1000)                      # vertical exaggeration ×7
def to_scene_A(lon, lat): return np.stack([(lon - lonc) * 111.32 * math.cos(math.radians(latc)) / KM_A, (lat - latc) * 111.0 / KM_A], -1)
SEGS = []
for poly in arm['coordinates']:
    q = to_scene_A(np.array(poly[0])[:, 0], np.array(poly[0])[:, 1]); SEGS.append(np.stack([q, np.roll(q, -1, 0)], 1))
SEGS = np.concatenate(SEGS)
def snap_A(P_):
    a, b = SEGS[:, 0][None], SEGS[:, 1][None]; p = P_[:, None]
    ab = b - a; t = np.clip(((p - a) * ab).sum(-1) / ((ab * ab).sum(-1) + 1e-12), 0, 1)
    c = a + ab * t[..., None]; d = ((p - c) ** 2).sum(-1); i = d.argmin(1)
    return c[np.arange(len(P_)), i]
relief = build_terrain('armenia', Zr, mr['north'], mr['west'], dd, keep, kx, ky, ZK_A, .05, (cx, cy), sevan, snap_A)
relief.data.materials.append(terrain_material('land_a')); relief.data.materials.append(M_STRATA)
def geoA(lat, lon, elev=None):
    x = (lon - lonc) * 111.32 * math.cos(math.radians(latc)) / KM_A; y = (lat - latc) * 111.0 / KM_A
    return Vector((x, y, .05 + (elev or 0) * ZK_A))
ARAG = (40.515, 44.19)

# ---- B: Aragats, a round core of the massif
Za = np.load(os.path.join(DEM, 'aragats.npy')); ma = json.load(open(os.path.join(DEM, 'aragats.json')))
Za = Za[::2, ::2]; da = 2 / 3600.0
KM_B = 4.6; RB_KM = 7.0
ky_b = 111.0 / KM_B * da; kx_b = 111.32 * math.cos(math.radians(ARAG[0])) / KM_B * da
cxb = (ARAG[1] - ma['west']) / da; cyb = (ma['north'] - ARAG[0]) / da
yy, xx = np.mgrid[0:Za.shape[0], 0:Za.shape[1]]
rkm = np.hypot((xx - cxb) * kx_b * KM_B, (yy - cyb) * ky_b * KM_B)
ZK_B = 2.1 / (KM_B * 1000); ZB0 = 2350.0
keepb = rkm < RB_KM
def palette_b(col, Z):
    """Aragats in early summer: green alpine meadows, brown scree, grey rock, snow in the high hollows"""
    zz = Z + ZB0
    gy, gx = np.gradient(zz); sl = np.clip(np.hypot(gx, gy) / 55, 0, 1)
    from scipy.ndimage import gaussian_filter
    nz = gaussian_filter(np.random.default_rng(5).random(zz.shape), 1.5); nz = (nz - nz.min()) / np.ptp(nz)
    stops = [(2300, (.30, .38, .17)), (2800, (.34, .40, .19)), (3200, (.42, .40, .27)), (3500, (.40, .35, .29)),
             (3750, (.45, .43, .41)), (3900, (.62, .62, .63)), (4000, (.9, .91, .94))]
    out = np.zeros(zz.shape + (3,), np.float32)
    for i in range(len(stops) - 1):
        (e0, c0), (e1, c1) = stops[i], stops[i + 1]
        k = np.clip((zz - e0) / (e1 - e0), 0, 1)[..., None]
        m = ((zz >= e0) & (zz < e1)) | ((i == 0) & (zz < e0)) | ((i == len(stops) - 2) & (zz >= e1))
        out = np.where(m[..., None], np.array(c0) + (np.array(c1) - np.array(c0)) * k, out)
    rock = np.array((.33, .29, .26)); k = np.clip((sl - .35) / .45, 0, 1)[..., None] * (zz < 3950)[..., None]
    out = out * (1 - k * .7) + rock * k * .7
    # snow lingers in the shaded hollows near the top
    nz2 = gaussian_filter(np.random.default_rng(9).random(zz.shape), 5); nz2 = (nz2 - nz2.min()) / np.ptp(nz2)
    snow = np.clip((zz - 3600) / 250, 0, 1) * (nz2 > .5) * (gy > 0)
    snow = gaussian_filter(snow.astype(np.float32), 1.2)[..., None] * .8
    out = out * (1 - snow) + np.array((.88, .89, .92)) * snow
    return np.clip(out * (1 + (nz - .5)[..., None] * .14), 0, 1)
aragats = build_terrain('aragats', Za - ZB0, ma['north'], ma['west'], da, keepb, kx_b, ky_b, ZK_B, .1, (cxb, cyb),
                        lambda col, Z, ys, xs: palette_b(col, Z),
                        lambda P_: P_ / np.linalg.norm(P_, axis=1, keepdims=True) * (RB_KM / KM_B))
# rebuild colours with the right elevations (build_terrain coloured Z - ZB0)
_e = np.zeros(len(aragats.data.vertices), np.float32); aragats.data.attributes['elev'].data.foreach_get('value', _e)
_e += ZB0; aragats.data.attributes['elev'].data.foreach_set('value', _e)
aragats.data.materials.append(terrain_material('land_b', contour=True)); aragats.data.materials.append(M_STRATA)
aragats['reveal'] = 0.0; aragats['glowk'] = 1.0
def geoB(lat, lon, elev):
    x = (lon - ARAG[1]) * 111.32 * math.cos(math.radians(ARAG[0])) / KM_B; y = (lat - ARAG[0]) * 111.0 / KM_B
    return Vector((x, y, .1 + (elev - ZB0) * ZK_B))
SUMMITS = [('north', 40.5233, 44.1944, 4064), ('west', 40.5131, 44.1767, 3975), ('east', 40.5139, 44.2042, 3893), ('south', 40.5053, 44.1833, 3875)]
M_PIN = glow('pin', (1, .74, .32), 6)
pins = []
for nm, la, lo, el in SUMMITS:
    p = geoB(la, lo, el)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=.018, location=p + Vector((0, 0, .012))); s_ = bpy.context.active_object; s_.data.materials.append(M_PIN)
    bpy.ops.mesh.primitive_torus_add(major_radius=.05, minor_radius=.004, location=p + Vector((0, 0, .004))); t_ = bpy.context.active_object; t_.data.materials.append(M_PIN)
    for o in (s_, t_): o['a'] = 0.0
    pins.append((s_, t_, p))

# ---- C: a quartz specimen: crystals on a piece of volcanic rock
random.seed(11)
M_ROCK = bpy.data.materials.new('rock'); M_ROCK.use_nodes = True
_n = M_ROCK.node_tree.nodes; _b = _n['Principled BSDF']; _b.inputs['Roughness'].default_value = .85
_nz = _n.new('ShaderNodeTexNoise'); _nz.inputs['Scale'].default_value = 16; _nz.inputs['Detail'].default_value = 12
_cr = _n.new('ShaderNodeValToRGB'); _cr.color_ramp.elements[0].position = .3; _cr.color_ramp.elements[1].position = .72
_cr.color_ramp.elements[0].color = (.018, .017, .019, 1); _cr.color_ramp.elements[1].color = (.13, .11, .1, 1)
M_ROCK.node_tree.links.new(_nz.outputs['Fac'], _cr.inputs[0]); M_ROCK.node_tree.links.new(_cr.outputs[0], _b.inputs['Base Color'])
_bp = _n.new('ShaderNodeBump'); _bp.inputs['Strength'].default_value = .9; M_ROCK.node_tree.links.new(_nz.outputs['Fac'], _bp.inputs['Height']); M_ROCK.node_tree.links.new(_bp.outputs['Normal'], _b.inputs['Normal'])
M_QZ = mat('qz', **{'Base Color': (.97, .97, 1, 1), 'Roughness': .04, 'Transmission Weight': 1, 'IOR': 1.544})
M_QZM = mat('qz_milky', **{'Base Color': (.92, .9, .9, 1), 'Roughness': .35, 'Transmission Weight': .55, 'IOR': 1.544, 'Subsurface Weight': .3})
specimen = bpy.data.objects.new('specimen', None); sc.collection.objects.link(specimen)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=5, radius=.62, location=(0, 0, .12)); rock = bpy.context.active_object
rock.scale = (1.25, 1.0, .5); tex = bpy.data.textures.new('rk', 'CLOUDS'); tex.noise_scale = .45
dm = rock.modifiers.new('d', 'DISPLACE'); dm.texture = tex; dm.strength = .22
bpy.ops.object.modifier_apply(modifier='d'); rock.data.materials.append(M_ROCK); rock.parent = specimen
crystals = []
def hexcrystal(r, L, tipk=1.7):
    bm_ = bmesh.new()
    bot = [bm_.verts.new((r * math.cos(k * math.pi / 3), r * math.sin(k * math.pi / 3), -.1)) for k in range(6)]
    top = [bm_.verts.new((r * math.cos(k * math.pi / 3), r * math.sin(k * math.pi / 3), L)) for k in range(6)]
    tip = bm_.verts.new((0, 0, L + r * tipk))
    for k in range(6):
        k2 = (k + 1) % 6
        bm_.faces.new((bot[k], bot[k2], top[k2], top[k])); bm_.faces.new((top[k], top[k2], tip))
    bm_.faces.new(list(reversed(bot)))
    me = bpy.data.meshes.new('qz'); bm_.to_mesh(me); bm_.free(); return me
for i in range(64):
    big = i < 5
    th = random.uniform(0, math.tau); rr_ = (random.random() ** .7) if i else 0
    r = random.uniform(.06, .085) if big else random.uniform(.02, .055); L = random.uniform(.32, .5) if big else random.uniform(.1, .34)
    o = bpy.data.objects.new(f'qz{i}', hexcrystal(r, L)); sc.collection.objects.link(o)
    o.data.materials.append(M_QZ if random.random() < .8 else M_QZM)
    base = Vector((math.cos(th) * rr_ * .5, math.sin(th) * rr_ * .34, .3 - rr_ * rr_ * .1))
    tilt = rr_ * math.radians(55) + random.uniform(-.15, .15)
    d = Vector((math.sin(tilt) * math.cos(th), math.sin(tilt) * math.sin(th), math.cos(tilt))).normalized()
    o.location = base; o.rotation_euler = Vector((0, 0, 1)).rotation_difference(d).to_euler()
    o.rotation_euler.z += random.uniform(0, 1); o.parent = specimen
    crystals.append((o, base.copy(), L, r))

# ---------------------------------------------------------------- show / hide
def show(o, on):
    o.hide_render = not on
    for c in o.children_recursive: c.hide_render = not on
GROUPS = {'A': [relief], 'B': [aragats] + [x for p in pins for x in p[:2]], 'C': [specimen, sand]}

# ---------------------------------------------------------------- cameras
def look(loc, at, lens, fstop=4.5):
    cam.location = Vector(loc); cam.rotation_euler = (Vector(at) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    camd.lens = lens; camd.dof.focus_distance = (Vector(at) - Vector(loc)).length; camd.dof.aperture_fstop = fstop
A_AT = Vector((.16, -.33, .1)); A_LOC = A_AT + (Vector((.42, -5.15, 6.0)) - Vector((.16, -.36, .1))) * 1.2
ARAG_A = geoA(*ARAG, 3000)
A_END = ARAG_A + Vector((.04, -.5, .55))
def cam_A(f):
    """the whole country, then down towards Aragats"""
    u = smoother((f - F_B0 + 1) / (F_B1 - F_B0 + 1)) if f >= F_B0 else 0
    at = A_AT.lerp(ARAG_A, smooth(clamp(u * 1.25)))
    loc = A_LOC.lerp(A_END, 1 - (1 - u) ** 1.6)
    look(loc, at, 50, 22)
B_AT = Vector((0, -.3, .18))
B_DIR = (A_END - ARAG_A).normalized()
B_W = B_AT + B_DIR * 6.4
def cam_B(f):
    """from far (the massif lifts out of the map), in, around it; then down onto its rock"""
    if f <= F_B1:
        u = smoother((f - F_BX) / max(1, F_B1 - F_BX))
        look(B_AT + B_DIR * (18.5 + (9.2 - 18.5) * u), B_AT, 50, 22); return
    if f <= F_Bw:
        u = smooth((f - F_B1) / (F_Bw - F_B1))
        r = Matrix.Rotation(math.radians(-32) * u, 3, 'Z') @ (B_DIR * (9.2 - .5 * u))
        look(B_AT + r, B_AT, 50, 8); return
    u = smoother((f - F_Bw) / (F_C1 - F_Bw))
    r = Matrix.Rotation(math.radians(-32), 3, 'Z') @ (B_DIR * 8.7)
    tgt = geoB(40.5131, 44.1767, 3975)
    look((B_AT + r).lerp(tgt + Vector((.03, -.3, .22)), u), B_AT.lerp(tgt, smooth(clamp(u * 1.3))), 50 + 30 * u, 8 + 10 * u)
C_REST = (Vector((0, -.2, .22)) + (Vector((.25, -3.15, 1.9)) - Vector((0, 0, .34))) * 1.22, Vector((0, -.2, .22)), 50)
def cam_C(f):
    if f <= F_C1:   # the cross-fade: from very close to the crystals, pulling back
        u = smooth((f - F_CX) / max(1, F_C1 - F_CX))
        look(Vector((.08, -.95, .75)).lerp(C_REST[0], easeout(u) * .5), C_REST[1].lerp(Vector((0, 0, .45)), 1 - u), 50, 5); return
    if f <= F_Cw:
        u = smooth((f - F_C1) / (F_Cw - F_C1))
        p0 = Vector((.08, -.95, .75)).lerp(C_REST[0], .5)
        r = (C_REST[0] - C_REST[1]); r = Matrix.Rotation(math.radians(22) * u, 3, 'Z') @ r
        look(p0.lerp(C_REST[1] + r, smooth(u * 1.4)), C_REST[1], 50, 4); return
    # to the sand: the fab film's first camera
    u = smoother((f - F_Cw) / ((F_Dw - F_Cw) * .72))
    r = Matrix.Rotation(math.radians(22), 3, 'Z') @ (C_REST[0] - C_REST[1]); p0 = C_REST[1] + r
    camera(('rest', 0, 0.0)); L1, R1, l1, fs1 = cam.location.copy(), cam.rotation_euler.to_quaternion(), camd.lens, camd.dof.aperture_fstop
    fd1 = camd.dof.focus_distance
    look(p0, C_REST[1], 50, 4); q0 = cam.rotation_euler.to_quaternion(); fd0 = camd.dof.focus_distance
    cam.location = p0.lerp(L1, u); cam.rotation_euler = q0.slerp(R1, u).to_euler(); camd.lens = 50 + (l1 - 50) * u
    camd.dof.focus_distance = fd0 + (fd1 - fd0) * u; camd.dof.aperture_fstop = 4 + (fs1 - 4) * u

# ---------------------------------------------------------------- the state of each frame
heap = [Vector(c) for (c, s, r) in grains]
qsrc = []
rng = random.Random(4)
for gi in range(len(grains)):
    o, base, L, r = crystals[rng.randrange(len(crystals))]
    qsrc.append((crystals.index((o, base, L, r)), rng.random(), rng.uniform(-1, 1), rng.uniform(-1, 1), rng.random()))
def state_C(f, t):
    """the specimen; then it breaks into grains that fall into the heap"""
    u = clamp((f - F_Cw) / (F_D1 - F_Cw)) if f > F_Cw else 0.0      # 0 … 1 over the breaking
    settle = clamp((f - F_D1) / (F_Dw - F_D1)) if f > F_D1 else 0.0
    specimen.rotation_euler = (0, 0, 0)
    for k, (o, base, L, r) in enumerate(crystals):
        kk = clamp(u * 1.6 - (k % 9) / 9 * .6)
        s_ = max(.001, 1 - smooth(kk)); o.scale = (s_, s_, s_)
    rs = max(.001, 1 - smooth(clamp(u * 1.4 - .35))); rock.scale = (1.25 * rs, rs, .5 * rs)
    show(specimen, u < .999); sand.hide_render = u <= 0
    if u <= 0: return
    me = sand.data; co = [0.0] * (len(me.vertices) * 3)
    for gi, (c, s, r) in enumerate(grains):
        ci, al, ox, oy, rr = qsrc[gi]
        o, base, L, rad = crystals[ci]
        # where the grain was: inside its crystal (world space)
        p0 = o.matrix_world @ Vector((ox * rad * .6, oy * rad * .6, al * L)) if o.scale.x > .002 else Vector(c)
        if gi % 3 == 0: p0 = Vector((ox * .55, oy * .42, .1 + rr * .2))     # a third of the sand is the rock itself
        start = (ci % 9) / 9 * .5 + rr * .25 if gi % 3 else .35 + rr * .3
        k = smooth(clamp((u - start) / .45))
        k = k + (1 - k) * 0 if settle == 0 else 1.0
        p = p0.lerp(Vector(c), k) + Vector((0, 0, math.sin(k * math.pi) * .35 * (1 - .5 * rr)))
        sc_ = .25 + .75 * smooth(k)
        base_i = gi * NT
        for vi in range(NT):
            lv = SAND_LOCAL[base_i + vi]; j = (base_i + vi) * 3
            co[j] = p.x + lv.x * sc_; co[j + 1] = p.y + lv.y * sc_; co[j + 2] = p.z + lv.z * sc_
    me.vertices.foreach_set('co', co); me.update(); sand['a'] = 1.0

_bw = {}
def bright_world(on):
    """quartz reflects a bright studio, not darkness (camera and diffuse rays still see the usual world)"""
    nt = world.node_tree; N = nt.nodes; L = nt.links; out = N['World Output']
    if 'mx' not in _bw:
        lp = N.new('ShaderNodeLightPath'); bg2 = N.new('ShaderNodeBackground'); bg2.inputs[0].default_value = (1, 1, 1, 1); bg2.inputs[1].default_value = 1.1
        mx = N.new('ShaderNodeMixShader'); mxf = N.new('ShaderNodeMath'); mxf.operation = 'MAXIMUM'
        L.new(lp.outputs['Is Camera Ray'], mxf.inputs[0]); L.new(lp.outputs['Is Diffuse Ray'], mxf.inputs[1])
        L.new(mxf.outputs[0], mx.inputs[0]); L.new(bg2.outputs[0], mx.inputs[1]); L.new(bg.outputs[0], mx.inputs[2]); _bw['mx'] = mx
    L.new((_bw['mx'] if on else bg).outputs[0], out.inputs[0])
def render_frame(f):
    t = f / FPSP
    state(0.0, t)                      # the fab film at its start: only the heap of sand
    for g in GROUPS.values():
        for o in g: show(o, False)
    sand.hide_render = True
    if SCN == 'A':
        show(relief, True); cam_A(f)
    elif SCN == 'B':
        show(aragats, True)
        u = clamp((f - F_B1) / (F_Bw - F_B1))
        aragats['reveal'] = 2350 + 1800 * smooth(clamp(u * 1.25))
        aragats['glowk'] = 1 - smooth(clamp((f - F_Bw) / (F_C1 - F_Bw) * 1.6))
        for i, (s_, t_, p) in enumerate(pins):
            a = smooth(clamp(u * 4 - 2.2 - i * .35)) * aragats['glowk']
            for o in (s_, t_): o.hide_render = a < .01; o['a'] = a
            t_.scale = (1 + .6 * (1 - a),) * 3
        cam_B(f)
    else:
        sc.cycles.max_bounces = 12; sc.cycles.transmission_bounces = 10; sc.cycles.glossy_bounces = 4
        show(specimen, True); state_C(f, t); cam_C(f)
        bright_world(f < F_D0 + (F_D1 - F_D0) * .8)
    sc.render.filepath = os.path.join(OUTP, f'{SCN}{f:04d}.png')
    bpy.ops.render.render(write_still=True)

if __name__ == '__main__':
    import time
    FL = [int(x) for x in os.environ['FRAMES'].split(',')] if os.environ.get('FRAMES') else range(P0, P1 + 1)
    for f in FL:
        if os.path.exists(os.path.join(OUTP, f'{SCN}{f:04d}.png')): continue
        t0 = time.time(); render_frame(f); print('frame', SCN, f, round(time.time() - t0, 1), 's', flush=True)
