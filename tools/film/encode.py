# Usage: python encode.py <frames_dir> <out_dir>   (then copy out_dir/* to assets/film/)
# frames (RGBA PNG) → the page's film: a video with the picture on top and its transparency below, forwards and backwards,
# plus stills of the rests (same layout, WebP) and assets/film/film-meta.js
import sys, os, json, subprocess, numpy as np
from PIL import Image
SRC, OUT = sys.argv[1], sys.argv[2]
meta = json.load(open(os.path.join(SRC, 'film.json'))) if os.path.exists(os.path.join(SRC, 'film.json')) else json.load(open(sys.argv[3]))
N, W, H, GAP = meta['frames'], meta['width'], meta['height'], 8
CRF = os.environ.get('CRF', '24')
os.makedirs(OUT, exist_ok=True)
def stacked(f):
    im = np.asarray(Image.open(os.path.join(SRC, f'f{f:04d}.png')).convert('RGBA')).astype(np.float32) / 255
    a = im[..., 3:4]; rgb = im[..., :3] * a                     # premultiplied: no colour where there is nothing
    out = np.zeros((H * 2 + GAP, W, 3), np.float32)
    out[:H] = rgb; out[H:H + GAP] = .5; out[H + GAP:] = np.repeat(1 - a, 3, axis=2)   # bottom: 1 − transparency
    return (np.clip(out, 0, 1) * 255 + .5).astype(np.uint8)
def encode(order, name):
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H * 2 + GAP}', '-r', str(meta['fps']), '-i', '-',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-g', '12', '-bf', '2', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
           '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', '-an', os.path.join(OUT, name)]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in order: p.stdin.write(stacked(f).tobytes())
    p.stdin.close(); p.wait()
encode(range(N), 'film.mp4'); encode(range(N - 1, -1, -1), 'film-rev.mp4')
for s, f in enumerate(meta['rests']): Image.fromarray(stacked(f)).save(os.path.join(OUT, f'rest{s}.webp'), quality=88)
meta.update({'gap': GAP, 'video': 'film.mp4', 'reverse': 'film-rev.mp4', 'stills': 'rest{s}.webp'})
open(os.path.join(OUT, 'film-meta.js'), 'w').write('window.FILM_META = ' + json.dumps(meta) + ';\n')
print('ok', {n: os.path.getsize(os.path.join(OUT, n)) for n in ('film.mp4', 'film-rev.mp4')})
