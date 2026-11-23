"""Checks on the built note: the code on the rendered page decodes to the address, also after the page is turned,
blurred and made noisy as a camera would see it; the link in the file points to the same address; the text holds
no dash, no bullet and none of the words the house style avoids.
Usage: python3 check_note.py <rendered page.png> <docx> <address>"""
import re, sys, zipfile
import cv2
import numpy as np

png, docx, url = sys.argv[1:4]
img = cv2.imread(png)
det = cv2.QRCodeDetector()
text, pts, _ = det.detectAndDecode(img)
assert text == url, ("rendered page", text)
side = float(np.linalg.norm(pts[0][0] - pts[0][1]))
dpi = 200
print(f"code on the rendered page decodes to the address: True | symbol side {side / dpi:.2f} in, module {side / dpi / 37 * 25.4:.2f} mm")
rng = np.random.default_rng(1)
ok = 0; trials = []
for ang in (0, 7, -12, 25):
    for blur in (0, 3, 5):
        for scale in (1.0, 0.6):
            h, w = img.shape[:2]
            M = cv2.getRotationMatrix2D((w / 2, h / 2), ang, scale)
            im = cv2.warpAffine(img, M, (w, h), borderValue=(255, 255, 255))
            if blur: im = cv2.GaussianBlur(im, (2 * blur + 1, 2 * blur + 1), 0)
            im = np.clip(im.astype(float) * 0.82 + 20 + rng.normal(0, 9, im.shape), 0, 255).astype(np.uint8)   # lower contrast, sensor noise
            t, _, _ = det.detectAndDecode(im)
            trials.append((ang, blur, scale, t == url)); ok += t == url
print(f"degraded views decoded: {ok} of {len(trials)}", [t[:3] for t in trials if not t[3]])

z = zipfile.ZipFile(docx)
rels = z.read("word/_rels/document.xml.rels").decode()
links = re.findall(r'Type="[^"]*hyperlink" Target="([^"]*)" TargetMode="External"', rels)
assert links == [url], links
doc = z.read("word/document.xml").decode()
assert doc.count("<w:hyperlink ") == 1
shown = "".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", re.search(r"<w:hyperlink .*?</w:hyperlink>", doc, re.S).group(0)))
assert url == "https://" + shown, shown
print("link target:", links[0], "| shown as:", shown)
body = re.sub(r"<w:p[ >]", "\n<w:p ", doc)
text = "\n".join("".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", p)) for p in body.split("\n")).strip()
text = text.replace("&apos;", "'").replace("&amp;", "&")
for bad in ("—", "–", "•", "genuinely", "honestly", "straightforward"):
    assert bad not in text.lower(), bad
assert "<w:numPr>" not in doc, "list formatting present"
alts = re.findall(r'descr="([^"]*)"', doc)
print("alt text:", alts)
words = len(re.findall(r"[A-Za-z0-9'.\-]+", text.split("\n", 2)[2]))
print("paragraphs:", len([p for p in text.split("\n") if p.strip()]), "| words after the title and deck:", words)
print("images:", [n for n in z.namelist() if n.startswith("word/media/")], "| folder entries:", [n for n in z.namelist() if n.endswith("/")])
print("-----"); print(text)
