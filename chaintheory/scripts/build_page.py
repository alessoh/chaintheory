"""Assemble the page from its stylesheet, body, script and data block.
Usage: python3 build_page.py <srcdir> <kit_data.json> <out.html> [--test]"""
import json, re, sys
src, data, out = sys.argv[1:4]; test = "--test" in sys.argv
css = open(f"{src}/page.css", encoding="utf-8").read()
body = open(f"{src}/page.body.html", encoding="utf-8").read()
js = open(f"{src}/page.js", encoding="utf-8").read()
blob = json.dumps(json.load(open(data, encoding="utf-8")), ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
assert js.count("/*DATA*/null") == 1
js = js.replace("/*DATA*/null", blob)
if not test:
    js, n = re.subn(r"\n[^\n]*/\*TEST-HOOK\*/", "", js); assert n == 1
head = ('<title>Chain Theory Building Set</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap">\n')
page = head + "<style>\n" + css + "</style>\n\n" + body + "\n<script>\n" + js + "</script>\n"
for bad in ("—", "–"):
    assert bad not in page, "dash found"
open(out, "w", encoding="utf-8").write(page)
print("wrote", out, len(page.encode("utf-8")), "bytes", "(test build)" if test else "")
