"""How well the code on the rendered page survives a camera's view: turned, shrunk, blurred, noisy, in perspective.
Decoded with zxing-cpp, a different decoder from the one used for the first check. Usage: python3 robust_qr.py <page.png> <address>"""
import sys
import cv2, numpy as np, zxingcpp
png, url = sys.argv[1], sys.argv[2]
img = cv2.imread(png)
rng = np.random.default_rng(1)
n = ok = 0; fails = []
for ang in (0, 7, -12, 25, 40):
    for blur in (0, 3, 5):
        for scale in (1.0, 0.6, 0.4):
            h, w = img.shape[:2]
            M = cv2.getRotationMatrix2D((w / 2, h / 2), ang, scale)
            im = cv2.warpAffine(img, M, (w, h), borderValue=(255, 255, 255))
            if blur: im = cv2.GaussianBlur(im, (2 * blur + 1, 2 * blur + 1), 0)
            im = np.clip(im.astype(float) * 0.82 + 20 + rng.normal(0, 9, im.shape), 0, 255).astype(np.uint8)
            good = any(x.text == url for x in zxingcpp.read_barcodes(im)); n += 1; ok += good
            if not good: fails.append((ang, blur, scale))
print(f"turned, shrunk, blurred and noisy views decoded: {ok} of {n}; failures (angle, blur, scale): {fails}")
h, w = img.shape[:2]
src = np.float32([[0, 0], [w, 0], [w, h], [0, h]]); dst = np.float32([[60, 40], [w - 140, 0], [w - 20, h - 60], [0, h - 10]])
im = cv2.GaussianBlur(cv2.warpPerspective(img, cv2.getPerspectiveTransform(src, dst), (w, h), borderValue=(255, 255, 255)), (5, 5), 0)
print("perspective view decoded:", any(x.text == url for x in zxingcpp.read_barcodes(im)))
r = zxingcpp.read_barcodes(img)
print("clean page:", [(x.text, str(x.format)) for x in r])
