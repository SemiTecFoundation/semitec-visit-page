# The opening film: from the mountains to the chip

The film at the start of the page (`assets/film/`) is rendered in Blender with these scripts.

- `dem.py` — downloads the elevation data and the border: NASA SRTM 1 arc-second tiles (public domain) and Natural
  Earth's border of Armenia (public domain), into `dem/`.
- `scene.py` — the fab scene: sand, the crystal puller, the ingot and the wire saw, the wafer, resist, the
  lithography lens and beam, ions, the probe card, tape and blade, the package with its leads, bond wires and lid.
  `state(P)` sets everything for a process position P (0 … 10.6). The die shows `die_final.png`, a picture of the
  page's chip map, so the last frame of the film is the chip map itself. `mark.png` is the logo on the lid.
- `film.py` — the timeline of the fab part: every step is a move of the camera to the next station and then the
  work of that step; the page rests on the last frame of each step. `STEPS` holds the seconds and the process
  positions, `FIT` / `AIM` how far back each station's camera stands and where it looks (nothing cut at the edges).
- `prologue.py` — the part before it: the relief of Armenia cut along its border → Mount Aragats as a round core,
  its gold contour lines and four summits → a quartz specimen → the quartz breaking into the heap of sand that
  starts the fab part. Three scenes (A, B, C) that cross-fade into each other.
- `compose.py` — joins the prologue (with its cross-fades) and the fab part into one numbered sequence and writes
  the frame numbers of every rest and every text (`film.json`).
- `encode.py` — turns the frames into the page's videos: the picture on top, 1 − its transparency below
  (`film.mp4`, and `film-rev.mp4` for scrolling back), the stills of the rests and `film-meta.js`.

Needs Blender 4.5 as a Python module (`pip install bpy`), numpy, scipy, Pillow and ffmpeg.

    python dem.py
    python film.py fab 0 988 1152 648 6            # the fab part (about 15 s a frame on two CPU cores)
    python film.py fab --rests 1152 648 6          # its rest frames once more, cleaner, and fab/film.json
    python prologue.py --plan                      # the prologue's frame plan
    python prologue.py pro A 0 58 1152 648 6       # the prologue, scene by scene (see prologue_plan.json)
    python prologue.py pro B 37 194 1152 648 6
    python prologue.py pro C 176 363 1152 648 10
    python compose.py pro fab all                  # one sequence
    python encode.py all out                       # then copy out/* to assets/film/

The texts beside the film are not in the film: they are `SITE_CONTENT.story.film` in `content.js`.
