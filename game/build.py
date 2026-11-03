#!/usr/bin/env python3
"""Builds the single-file LEGACY FC game page from src/.

The game is plain JavaScript (no bundler): src/base.html holds the original
engine, and every src/p*.js module is appended in order. Later modules override
earlier function declarations, which is how each version layered on the last.

usage: python3 game/build.py [--out PATH]   (default: frontend/public/game/index.html)
"""
import argparse
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
MODULES = ["p7a", "p7b1", "p7b2", "p7c", "p7d1", "p7d2", "p7e1", "p7e2", "p7f1", "p7f2",
           "p8a", "p8b", "p8c", "p8d", "p8e", "p8f", "p8g", "p8h", "p7g", "p8z", "p9", "p10a", "p10b", "p10c", "p10d", "p10e", "p10f", "p10g", "p10h", "p10i", "p10j", "p10k"]

ap = argparse.ArgumentParser()
ap.add_argument("--out", default=str(ROOT.parent / "frontend" / "public" / "game" / "index.html"))
ap.add_argument("--check", action="store_true", help="syntax-check the assembled script with node --check")
args = ap.parse_args()

s = (SRC / "base.html").read_text(encoding="utf-8")


def rep(a, b):
    global s
    assert s.count(a)==1,('count',s.count(a),a[:80]); s=s.replace(a,b)
rep('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
 '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&display=swap" rel="stylesheet">')
rep('body{margin:0;background:var(--bg);color:var(--fg);font-family:"Courier New",monospace;',
 'body{margin:0;background:radial-gradient(ellipse at top,#1a2140 0%,#0b1020 55%,#070a14 100%) fixed;color:var(--fg);font-family:Rubik,"Segoe UI",Arial,sans-serif;')
rep('canvas{width:min(100%,760px);image-rendering:pixelated;border:3px solid #2a3558;border-radius:10px;box-shadow:0 0 40px #0008;margin-top:8px;background:#000}',
 'canvas{width:min(100%,760px);image-rendering:auto;border:1px solid #3a4258;border-radius:12px;box-shadow:0 0 0 1px #000,0 18px 50px #000a,0 0 60px rgba(212,167,44,.08);margin-top:10px;background:#000;touch-action:none}\n.ctl{display:flex;justify-content:space-between;align-items:center;width:min(100%,760px);box-sizing:border-box;padding:0 10px;gap:12px}')
rep('.pad{display:grid;grid-template-columns:repeat(3,58px);gap:6px;margin:8px}','.pad{display:grid;grid-template-columns:repeat(3,54px);gap:6px;margin:8px 0}')
rep('</style>','@media (max-width:520px){canvas{box-sizing:border-box}body{overflow-x:hidden}.ctl{gap:6px;padding:0 8px}.pad{grid-template-columns:repeat(3,48px);gap:5px}.pad button{height:48px}.ab{flex-wrap:wrap;justify-content:center;gap:8px;max-width:150px}.ab button{width:62px;height:62px}.ab .m{width:42px;height:42px;font-size:15px}}\n</style>')
rep('button{height:58px;font-size:20px;border-radius:12px;border:2px solid #2a3558;background:#1b2547;color:#ffd24a;touch-action:none}',
 'button{height:54px;font-size:18px;border-radius:12px;border:1px solid #3a4258;background:linear-gradient(#262c3b,#151925);color:#ffd96a;touch-action:none;box-shadow:0 3px 0 #0a0d14,inset 0 1px 0 rgba(255,255,255,.08);font-family:inherit;font-weight:700}')
rep('button:active{background:#e94560;color:#fff}','button:active{background:linear-gradient(#d4a72c,#8a6a12);color:#1a1200;transform:translateY(2px);box-shadow:0 1px 0 #0a0d14}')
rep('small{opacity:.7;margin:4px;text-align:center}','small{opacity:.7;margin:6px 4px 0;text-align:center;font-size:12px}')
rep('<div class="pad">','<div class="ctl"><div class="pad">')
rep('<button class="m" data-k="l">א/A</button></div>','<button class="m" data-k="l">א/A</button><button class="m run" data-k="runlock">RUN</button></div></div>')
rep('button:active{','.run{font-size:12px!important}.run.on{background:linear-gradient(#d4a72c,#8a6a12);color:#1a1200}\nbutton:active{')
rep("rn=!B&&WXD()=='Rain'","rn=!B&&wxNow()=='Rain'")
rep('const T=32,MW=80,MH=56;','const T=32,MW=160,MH=120;')

mod = "".join((SRC / f"{m}.js").read_text(encoding="utf-8") + "\n" for m in MODULES)
i = s.rindex("frame();\n</script>")
s = s[:i] + mod + s[i:]
out = pathlib.Path(args.out)
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(s, encoding="utf-8")
print(f"built {out} ({len(s):,} bytes)")
if args.check:
    js = ROOT / ".build_check.js"
    js.write_text(s.split("<script>")[1].split("</script>")[0], encoding="utf-8")
    r = subprocess.run(["node", "--check", str(js)], capture_output=True, text=True)
    js.unlink()
    if r.returncode:
        print(r.stderr)
        sys.exit(1)
    print("syntax OK")
