# EL-EXP-REEL-001 — Launch Commands

Fresh checkout:

```bash
git clone --branch stage2/reel-001 --single-branch https://github.com/leonardodecreative/EmergenceLab.git
cd EmergenceLab/stage2/reel-001
python3 -m http.server 8000
```

Then open:

`http://localhost:8000/EL-EXP-REEL-001_FACTORIAL.html`

If the repository is already cloned:

```bash
cd EmergenceLab
git fetch origin
git switch stage2/reel-001
git pull --ff-only origin stage2/reel-001
cd stage2/reel-001
python3 -m http.server 8000
```

Do not use `index.html` or `EL-EXP-REEL-001.html` for the preregistered run.
