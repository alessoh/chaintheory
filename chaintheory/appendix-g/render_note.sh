#!/bin/bash
# Build the one-page note, render it to PDF and to a page image. Usage: render_note.sh
set -e
cd /home/claude/appG
O=out/Appendix_G_The_Chain_Theory_Building_Set.docx
node build_note.js noteG.js "$O" "Chain Theory for Physicists · Appendix G"
zip -d "$O" '*/' >/dev/null 2>&1 || true
R=out/render; rm -rf "$R"; mkdir -p "$R"; cp "$O" "$R/doc.docx"; cd "$R"
python3 /root/.claude/skills/synced/8ddac988-c20b-492c-857f-2c7d678d3485_473d260b-ae21-434d-8654-cbefeb939939/docx/scripts/office/soffice.py --headless --convert-to pdf doc.docx >/dev/null 2>&1
pdfinfo doc.pdf | grep Pages
pdftoppm -png -r 110 doc.pdf pg
pdftoppm -png -r 200 doc.pdf hi
