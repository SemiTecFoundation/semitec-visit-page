# Elevation data for the prologue: NASA SRTM 1 arc-second tiles (public domain, via the AWS terrain tiles mirror)
# and the border of Armenia (Natural Earth 10 m, public domain). Writes dem/armenia.npy, dem/aragats.npy and dem/arm.json.
import gzip, json, os, urllib.request, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(HERE, 'dem'); os.makedirs(D, exist_ok=True)
N = 3601
def tile(la, lo):
    f = os.path.join(D, f'N{la}E{lo:03d}.hgt.gz')
    if not os.path.exists(f):
        urllib.request.urlretrieve(f'https://elevation-tiles-prod.s3.amazonaws.com/skadi/N{la}/N{la}E{lo:03d}.hgt.gz', f)
    a = np.frombuffer(gzip.open(f).read(), '>i2').reshape(N, N).astype(np.float32); a[a < -1000] = np.nan; return a
S = 240; big = np.zeros((4 * S, 4 * S), np.float32)          # 38…42 N, 43…47 E at 1/240°
for i, la in enumerate(range(41, 37, -1)):
    for j, lo in enumerate(range(43, 47)):
        t = tile(la, lo)[:-1, :-1]
        big[i * S:(i + 1) * S, j * S:(j + 1) * S] = np.nanmean(t.reshape(S, 3600 // S, S, 3600 // S), axis=(1, 3))
np.save(os.path.join(D, 'armenia.npy'), np.nan_to_num(big, nan=0))
json.dump({'north': 42, 'south': 38, 'west': 43, 'east': 47, 'n': 4 * S}, open(os.path.join(D, 'armenia.json'), 'w'))
t = tile(40, 44); lat0, lat1, lon0, lon1 = 40.39, 40.68, 44.01, 44.39       # Aragats at full resolution
a = t[int(round((41 - lat1) * 3600)):int(round((41 - lat0) * 3600)) + 1, int(round((lon0 - 44) * 3600)):int(round((lon1 - 44) * 3600)) + 1]
np.save(os.path.join(D, 'aragats.npy'), np.nan_to_num(a, nan=0))
json.dump({'north': lat1, 'south': lat0, 'west': lon0, 'east': lon1}, open(os.path.join(D, 'aragats.json'), 'w'))
ne = json.load(urllib.request.urlopen('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson'))
json.dump(next(f['geometry'] for f in ne['features'] if f['properties'].get('ADM0_A3') == 'ARM'), open(os.path.join(D, 'arm.json'), 'w'))
print('ok')
