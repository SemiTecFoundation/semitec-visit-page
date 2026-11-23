# the whole film: the prologue (scenes A, B, C with their cross-fades) followed by the fab film, as one numbered sequence
import json, os, sys, numpy as np
from PIL import Image
PRO, FAB, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
pl = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'prologue_plan.json')))
fab = json.load(open(os.path.join(FAB, 'film.json')))
os.makedirs(OUT, exist_ok=True)
def load(scn, f):
    a = np.asarray(Image.open(os.path.join(PRO, f'{scn}{f:04d}.png')).convert('RGBA')).astype(np.float32) / 255
    a[..., :3] *= a[..., 3:4]; return a                     # premultiplied, so a cross-fade is exact
def save(a, f):
    al = a[..., 3:4]; rgb = np.where(al > 1e-4, a[..., :3] / np.maximum(al, 1e-4), 0)
    Image.fromarray((np.clip(np.concatenate([rgb, al], -1), 0, 1) * 255 + .5).astype(np.uint8)).save(os.path.join(OUT, f'f{f:04d}.png'))
def sm(t): t = min(1, max(0, t)); return t * t * (3 - 2 * t)
N = pl['frames']; xB, xC = pl['xB'], pl['xC']
for f in range(N):
    if f < xB[0]: a = load('A', f)
    elif f <= xB[1]: w = sm((f - xB[0]) / (xB[1] - xB[0])); a = load('A', f) * (1 - w) + load('B', f) * w
    elif f < xC[0]: a = load('B', f)
    elif f <= xC[1]: w = sm((f - xC[0]) / (xC[1] - xC[0])); a = load('B', f) * (1 - w) + load('C', f) * w
    else: a = load('C', f)
    save(a, f)
for f in range(fab['frames']):
    dst = os.path.join(OUT, f'f{N + f:04d}.png')
    if os.path.lexists(dst): os.remove(dst)
    os.symlink(os.path.abspath(os.path.join(FAB, f'f{f:04d}.png')), dst)
meta = dict(fab); meta['frames'] = N + fab['frames']
meta['rests'] = pl['rests'] + [N + r for r in fab['rests']]
meta['texts'] = pl['texts'] + [N + t for t in fab['texts'][1:]]
json.dump(meta, open(os.path.join(OUT, 'film.json'), 'w')); print(meta['frames'], meta['rests'], meta['texts'])
