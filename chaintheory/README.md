# Chain Theory Building Set

An interactive ball-and-stick model of Chain Theory, made as a companion to the book *Chain Theory for Physicists* by H. Peter Alesso. The published page is at https://claude.ai/artifact/Pa65gZNaMm6mYg2Z3hSxzi and is described in Appendix G of the book. Status as of November 22, 2026.

Chain Theory is an unproven research program announced by Alex Wissner-Gross in October 2026. Every identification of a network with a particle on the page is a conjecture of that program, and the shapes of the models carry no physical content.

## What is here

The folder `dist` holds the page exactly as published, one self-contained HTML file. The folder `src` holds its three sources, the style sheet, the body and the script. The folder `data` holds the data block that the page embeds. The folder `scripts` holds the Python step that builds that data block from the theory's files and the step that assembles the page. The folder `test` holds the scripted browser tests. The folder `appendix-g` holds the one-page appendix, its QR code and the scripts that built and checked them.

## Sources and credit

The networks come from `compendium/figures/particles.json`, the sectors from `compendium/figures/genres.json` and the records from `papers/alpha/anc/records.csv` in A. D. Wissner-Gross's repository, https://github.com/alexwg/chain-theory, at commit a28db89. That repository licenses its text under CC BY 4.0 and its code under Apache 2.0. The neutron and the three-quark form of the proton were built for Appendix F of the book.

## Rebuilding

The scripts were written in a working session and still carry that session's absolute paths, which begin with `/home/claude`. They need those paths changed before they run elsewhere. The data step needs Python 3 with NumPy, SciPy and NetworkX, and the tests need Node with Playwright. No license has been chosen yet for the files in this repository.
