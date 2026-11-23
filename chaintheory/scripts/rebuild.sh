#!/bin/bash
# Rebuild the data block and the test build of the page, and check that the script parses.
set -e
cd /home/claude/kit
python3 -I scripts/kit_data.py /home/claude/chain-theory/compendium/figures/particles.json /home/claude/appF/out/f_calc.json /home/claude/chain-theory/papers/alpha/anc/records.csv /home/claude/chain-theory/compendium/figures/genres.json out/kit_data.json | head -1
python3 scripts/build_page.py src out/kit_data.json test/page.html --test
python3 test/harness.py test/page.html test/harness.html /home/claude/kit/test/node_modules/@fontsource
node -e 'const fs=require("fs"); const h=fs.readFileSync("test/page.html","utf8"); const m=h.match(/<script>\n([\s\S]*)<\/script>/); fs.writeFileSync("test/page.js", m[1]);'
node --check test/page.js && echo "script parses"
