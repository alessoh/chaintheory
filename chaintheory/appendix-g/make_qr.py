"""Draw the QR code of an address and confirm, with a second program, that it decodes to the same address.
Usage: python3 make_qr.py <address> <out.png>"""
import sys
import cv2
import segno

url, out = sys.argv[1], sys.argv[2]
qr = segno.make(url, error="q", micro=False, boost_error=True)
qr.save(out, scale=24, border=4, dark="#000000", light="#FFFFFF")
img = cv2.imread(out)
# decode with OpenCV, which shares no code with the library that drew the symbol; also at reduced sizes, as a print would be seen
for scale in (1.0, 0.5, 0.25, 0.12):
    im = img if scale == 1.0 else cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    text, pts, _ = cv2.QRCodeDetector().detectAndDecode(im)
    assert text == url, (scale, text)
    print(f"decoded at {im.shape[1]} px: {text == url}")
side = qr.symbol_size(scale=1, border=0)[0]
print("version", qr.version, "| error correction", qr.error, "| modules", side, "| with quiet zone", side + 8, "| image", img.shape[1], "px")
