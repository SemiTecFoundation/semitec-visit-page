# How a chip is made — version 2 of the film: step by step.
# Every step of the fab is a TRANSITION (the camera moves to the next station, the last product is carried over)
# and then the WORK (the camera is almost still, the process runs). The page shows the step's text from the end
# of the transition, plays the work by itself and rests on the last frame of the step.
# Usage: python film.py <out_dir> <first_frame> <last_frame> <W> <H> <samples>   (frames of the plan below; existing frames are kept)
#        python film.py --plan          writes plan.json (frame numbers of the rests and the text) and exits
#        python film.py <out_dir> --rests <W> <H> <samples>   the rest frames once more, cleaner, and film.json
import sys, os, json, math
PLAN_ONLY = len(sys.argv) > 1 and sys.argv[1] == '--plan'
FPS = 24
# (transition s, work s, process P at the start, at the end of the transition, at the end of the work)
STEPS = [
    (2.0, 3.0, 0.00, 0.95, 1.88),   # 1 crystal growth (the sand pours into the crucible on the way)
    (1.5, 2.6, 1.88, 2.25, 2.62),   # 2 slicing and polishing
    (1.4, 3.2, 2.62, 3.08, 3.89),   # 3 oxidation and coating
    (1.0, 3.2, 3.89, 4.04, 4.90),   # 4 photolithography
    (1.0, 3.0, 4.90, 5.00, 5.90),   # 5 etching and doping
    (1.0, 2.8, 5.90, 6.00, 6.75),   # 6 metal interconnect
    (1.1, 3.0, 6.75, 7.02, 7.84),   # 7 wafer test
    (1.0, 2.8, 7.84, 8.00, 8.55),   # 8 dicing
    (1.8, 3.0, 8.55, 9.02, 9.96),   # 9 packaging and bonding
]
FINAL = (2.8, 9.96, 10.6)          # the package opens, the camera turns straight down onto the die

def clamp(v, a=0.0, b=1.0): return max(a, min(b, v))
def smooth(t): return t * t * (3 - 2 * t)
def smoother(t): return t * t * t * (t * (t * 6 - 15) + 10)

def plan():
    fr = [(0.0, ('rest', 0, 0.0))]   # (process P, camera spec)
    rests, texts = [0], [0]
    for s, (T, Wk, a, b, c) in enumerate(STEPS, 1):
        nT, nW = round(T * FPS), round(Wk * FPS)
        for i in range(1, nT + 1):
            u = i / nT; fr.append((a + (b - a) * smooth(u), ('move', s, smoother(u))))
        texts.append(len(fr) - 1)
        for i in range(1, nW + 1):
            u = i / nW; fr.append((b + (c - b) * u, ('rest', s, smooth(u))))
        rests.append(len(fr) - 1)
    T, a, c = FINAL; n = round(T * FPS)
    for i in range(1, n + 1):
        u = i / n; fr.append((a + (c - a) * u, ('final', 9, u)))
    return fr, rests, texts

FR, RESTS, TEXTS = plan()
if PLAN_ONLY:
    json.dump({'fps': FPS, 'frames': len(FR), 'rests': RESTS, 'texts': TEXTS}, open('plan.json', 'w'))
    print(len(FR), 'frames', RESTS, TEXTS); sys.exit()

RESTS_ONLY = len(sys.argv) > 2 and sys.argv[2] == '--rests'
if RESTS_ONLY: sys.argv = sys.argv[:2] + ['0', '-1'] + sys.argv[3:]
OUT2, A0, A1, W2, H2, SMP2 = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4], sys.argv[5], sys.argv[6]
sys.argv = ['scene.py', OUT2, '0', '-1', W2, H2, SMP2]
HERE2 = os.path.dirname(os.path.abspath(__file__))
__file__ = os.path.join(HERE2, 'scene.py')
exec(open(__file__).read().split("if __name__ == '__main__':")[0])
sc.render.use_persistent_data = True
sc.cycles.max_bounces = 4; sc.cycles.glossy_bounces = 2; sc.cycles.transmission_bounces = 2; sc.cycles.diffuse_bounces = 1
sc.cycles.adaptive_threshold = .05; sc.cycles.adaptive_min_samples = 2
sc.cycles.denoising_prefilter = 'ACCURATE'; sc.cycles.denoising_input_passes = 'RGB_ALBEDO'
from mathutils import Quaternion

import os as _os
FIT = json.loads(_os.environ.get('FIT', '[1.3,1.6,1.5,1.45,1.6,1.45,1.7,1.45,1.55,1.45]'))   # how much further back each station's camera stands
AIM = json.loads(_os.environ.get('AIM', '[[0,0,-0.15],[0,0,-0.28],[0,0,-0.1],[0,0,0],[0,0,0],[0,0,0],[0,0,-0.05],[0,0,0],[0,0,-0.08],[0,0,0]]'))   # and where it looks
def drift(s, k):
    """station s's shot, k of the way through its work: a slow turn around the subject and a little closer"""
    loc, at, lens_mm = SHOTS[s]
    loc, at = Vector(loc), Vector(at)
    if s >= 10: return loc, at, lens_mm
    loc = at + (loc - at) * FIT[s]; at = at + Vector(AIM[s])
    ang = math.radians(4.5) * k * (1 if s % 2 else -1)
    r = loc - at; r = Matrix.Rotation(ang, 3, 'Z') @ r; r *= (1 - .05 * k)
    return at + r, at, lens_mm
def aim(loc, at):
    return (Vector(at) - Vector(loc)).to_track_quat('-Z', 'Y')
def camera(spec):
    kind, s, k = spec
    if kind == 'rest':
        loc, at, lens_mm = drift(s, k); q = aim(loc, at); fs = 4
    elif kind == 'move':
        l0, a0, m0 = drift(s - 1, 1); l1, a1, m1 = drift(s, 0)
        loc, at, lens_mm = l0.lerp(l1, k), a0.lerp(a1, k), m0 + (m1 - m0) * k; q = aim(loc, at); fs = 4
    else:   # final: to the top view, turning so the die's top edge is up
        l0, a0, m0 = drift(9, 1); l1, a1, m1 = Vector(SHOTS[10][0]), Vector(SHOTS[10][1]), SHOTS[10][2]
        e = smoother(clamp(k / .8)); loc, at, lens_mm = l0.lerp(l1, e), a0.lerp(a1, e), m0 + (m1 - m0) * e
        q = aim(loc, at).slerp(Quaternion((1, 0, 0, 0)), smoother(clamp((k - .25) / .6))) if k < .85 else Quaternion((1, 0, 0, 0))
        fs = 4 + 18 * smooth(clamp((k - .2) / .5))
    cam.location = loc; cam.rotation_euler = q.to_euler(); camd.lens = lens_mm
    camd.dof.focus_distance = (Vector(at) - Vector(loc)).length; camd.dof.aperture_fstop = fs

if __name__ == '__main__' and RESTS_ONLY:
    sc.cycles.samples = 28; sc.cycles.adaptive_threshold = .02
    for f in RESTS + [len(FR) - 1]:
        P, spec = FR[f]; state(P, f / FPS); camera(spec)
        sc.render.filepath = os.path.join(OUT2, f'f{f:04d}.png'); bpy.ops.render.render(write_still=True); print('rest', f, flush=True)
    A1 = len(FR) - 1; A0 = len(FR)
if __name__ == '__main__':
    import time
    for f in range(A0, min(A1, len(FR) - 1) + 1):
        out = os.path.join(OUT2, f'f{f:04d}.png')
        if os.path.exists(out): continue
        t0 = time.time(); P, spec = FR[f]
        state(P, f / FPS); camera(spec)
        sc.cycles.samples = 10 if 8.78 < P < 9.08 or 4.95 < P < 5.15 else int(SMP2)
        sc.render.filepath = out
        bpy.ops.render.render(write_still=True)
        print('frame', f, 'P', round(P, 3), round(time.time() - t0, 1), 's', flush=True)
    if A1 >= len(FR) - 1:
        state(FINAL[2], (len(FR) - 1) / FPS); camera(('final', 9, 1.0))
        json.dump({'fps': FPS, 'frames': len(FR), 'rests': RESTS, 'texts': TEXTS, 'width': int(W2), 'height': int(H2), 'die': die_rect()},
                  open(os.path.join(OUT2, 'film.json'), 'w'))
