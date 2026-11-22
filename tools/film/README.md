# The opening film: how a chip is made

The film at the start of the page (`assets/film/`) is rendered in Blender with these scripts.

- `scene.py` — the scene: sand, the crystal puller, the ingot and the wire saw, the wafer, resist, the lithography
  lens and beam, ions, the probe card, tape and blade, the package with its leads, bond wires and lid. `state(P)`
  sets everything for a process position P (0 … 10.6). The die shows `die_final.png`, a picture of the page's chip map,
  so the last frame of the film is the chip map itself. `mark.png` is the logo on the lid.
- `film.py` — the timeline of the page: every step is a move of the camera to the next station and then the work of
  that step; the page rests on the last frame of each step. `STEPS` holds the seconds and the process positions,
  `FIT` / `AIM` how far back each station's camera stands and where it looks (so nothing is cut at the frame's edge).
- `encode.py` — turns the frames into the page's videos: the picture on top, 1 − its transparency below
  (`film.mp4`, and `film-rev.mp4` for scrolling back), the stills of the rests and `film-meta.js`.

Needs Blender 4.5 as a Python module (`pip install bpy`), numpy, Pillow and ffmpeg.

    python film.py frames 0 988 1152 648 6        # every frame (about 15 s each on two CPU cores)
    python film.py frames --rests 1152 648 6      # the rest frames once more, cleaner, and frames/film.json
    python encode.py frames out                   # then copy out/* to assets/film/
