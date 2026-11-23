"""Wrap the page in a skeleton like the one it is published in, with the three typefaces loaded from local files.
Usage: python3 harness.py <page.html> <out.html> <fontdir>"""
import sys, glob, os, re
page, out, fd = sys.argv[1:4]
faces = []
def face(fam, pkg, sub, w, style, rng):
    f = f"{fd}/{pkg}/files/{pkg}-{sub}-{w}-{style}.woff2"
    if os.path.exists(f): faces.append(f"@font-face{{font-family:'{fam}';font-style:{style};font-weight:{w};src:url('file://{f}') format('woff2');unicode-range:{rng}}}")
LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
GREEK = "U+0370-03FF"
for w in (500, 600, 700): face("Barlow Semi Condensed", "barlow-semi-condensed", "latin", w, "normal", LATIN)
for w in (400, 500, 600):
    face("IBM Plex Sans", "ibm-plex-sans", "latin", w, "normal", LATIN); face("IBM Plex Sans", "ibm-plex-sans", "greek", w, "normal", GREEK)
face("IBM Plex Sans", "ibm-plex-sans", "latin", 400, "italic", LATIN)
for w in (400, 500): face("IBM Plex Mono", "ibm-plex-mono", "latin", w, "normal", LATIN)
html = open(page, encoding="utf-8").read()
html = re.sub(r'<link rel="(preconnect|stylesheet)"[^>]*>\n', "", html)          # the test run has no network
skel = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}'
        + "".join(faces) + '</style></head><body>\n' + html + '\n</body></html>')
open(out, "w", encoding="utf-8").write(skel); print("harness", out, len(faces), "font faces")
