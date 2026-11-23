"""Model data for the Chain Theory building-set page.

Reads the theory's own particle file (compendium/figures/particles.json, commit a28db89), the two star graphs
that Appendix F built from the arms recorded in the compendium's Lean files, and the Letter's table of records.
For every network it checks the two rules the page draws (the valence law and the read cap), computes the parts
list and a three-dimensional spring layout, and writes one JSON block for the page.

Usage: python3 -I kit_data.py <particles.json> <f_calc.json> <records.csv> <genres.json> <out.json>
"""
import csv
import json
import math
import sys
from collections import Counter

import networkx as nx
import numpy as np
from scipy.optimize import minimize

PART, FCALC, REC, GENRES, OUT = sys.argv[1:6]

# One force law, used here to find the resting shape and again in the page when a ball is pulled.
PHYS = dict(L=1.0, ks=1.0, kr=0.22)
RADIUS = {2: 0.28, 3: 0.34, 4: 0.40}          # ball radii in units of the rod's natural length
READ_CAP = 6                                   # a rod is clear when the product of its ends is at most six


def energy_and_forces(P, edges):
    """Springs along the rods and an inverse-square push between every two balls: the energy and the force on each ball."""
    E = np.asarray(edges, int)
    d = P[E[:, 1]] - P[E[:, 0]]; r = np.linalg.norm(d, axis=1)
    en = 0.5 * PHYS["ks"] * ((r - PHYS["L"]) ** 2).sum()
    F = np.zeros_like(P)
    f = (PHYS["ks"] * (r - PHYS["L"]) / r)[:, None] * d
    np.add.at(F, E[:, 0], f); np.add.at(F, E[:, 1], -f)
    D = P[:, None, :] - P[None, :, :]; R = np.linalg.norm(D, axis=2); np.fill_diagonal(R, np.inf)
    en += 0.5 * (PHYS["kr"] / R).sum()
    F += (PHYS["kr"] * D / (R ** 3)[:, :, None]).sum(1)
    return en, F


def relax(P, edges):
    """The resting shape: the minimum of the energy, found from the given start."""
    n = len(P)
    def fun(x):
        en, F = energy_and_forces(x.reshape(n, 3), edges)
        return en, -F.ravel()
    res = minimize(fun, P.ravel(), jac=True, method="L-BFGS-B", options=dict(maxiter=20000, ftol=1e-15, gtol=1e-9))
    P = res.x.reshape(n, 3); P = P - P.mean(0)
    en, F = energy_and_forces(P, edges)
    return P, float(np.abs(F).max()), en


def layout(n, edges, seed):
    """A resting three-dimensional shape: several random starts, the most open one kept, turned to its widest face."""
    G = nx.Graph(); G.add_nodes_from(range(n)); G.add_edges_from(edges)
    best = None
    for trial in range(12):
        rng = np.random.default_rng(seed * 1000 + trial)
        init = {i: rng.normal(size=3) for i in range(n)}
        pos = nx.kamada_kawai_layout(G, pos=init, dim=3, scale=max(1.0, math.sqrt(n))) if n > 2 else init
        P = np.array([pos[i] for i in range(n)], float)
        P, resid, E = relax(P, edges)
        if best is None or E < best[0] - 1e-9:
            best = (E, P, resid)
    E, P, resid = best
    P = P - P.mean(0)
    if n > 2:                                   # widest face toward the viewer
        _, _, Vt = np.linalg.svd(P, full_matrices=False)
        if np.linalg.det(Vt) < 0: Vt[2] *= -1
        P = P @ Vt.T
    else:
        d = P[1] - P[0]; L = np.linalg.norm(d); P = np.array([[-L / 2, 0, 0], [L / 2, 0, 0]])
    return P, resid, E


def build(key, name, sym, family, gen, web, grade, standing, ids, dims, links, flags, seed, source):
    idx = {s: i for i, s in enumerate(ids)}
    E = [(idx[a], idx[b]) for a, b in links]
    deg = Counter(); [deg.update(e) for e in E]
    n = len(ids)
    # rule 1, the valence law: a piece with d states ends at most d rods
    over = [ids[i] for i in range(n) if deg[i] > dims[i]]
    assert not over, (key, "valence law broken at", over)
    assert all(d in (2, 3, 4) for d in dims), key
    G = nx.Graph(); G.add_nodes_from(range(n)); G.add_edges_from(E)
    assert nx.is_connected(G), key
    assert len(set(map(frozenset, E))) == len(E), (key, "doubled rod")
    # rule 2, the read cap: clear when the product of the ends is at most six
    prod = [dims[a] * dims[b] for a, b in E]
    clear = [p <= READ_CAP for p in prod]
    Gc = nx.Graph(); Gc.add_nodes_from(range(n)); Gc.add_edges_from(e for e, c in zip(E, clear) if c)
    genres = Counter((max(dims[a], dims[b]), min(dims[a], dims[b])) for a, b in E)
    order = [(3, 3), (4, 4), (4, 3), (4, 2), (2, 2), (3, 2)]
    formula = ", ".join(f"({a},{b})" + (f"×{genres[(a, b)]}" if genres[(a, b)] > 1 else "") for a, b in order if genres[(a, b)])
    P, resid, _ = layout(n, E, seed)
    assert resid < 1e-6, (key, "layout not at rest", resid)
    dmin = min(np.linalg.norm(P[i] - P[j]) - RADIUS[dims[i]] - RADIUS[dims[j]] for i in range(n) for j in range(i + 1, n))
    assert dmin > 0.05, (key, "balls touch", dmin)
    return dict(
        id=key, name=name, sym=sym, family=family, gen=gen, web=web, grade=grade, standing=standing, source=source,
        d=dims, p=[[round(float(v), 3) for v in row] for row in P],
        e=[[a, b, 1 if f else 0] for (a, b), f in zip(E, flags)],
        n2=dims.count(2), n3=dims.count(3), n4=dims.count(4),
        clear=sum(clear), dark=len(E) - sum(clear), measure=sum(prod), formula=formula,
        free=sum(dims[i] - deg[i] for i in range(n)),
        clear_rods_form_no_ring=nx.is_forest(Gc),
        ext=round(float(max(np.linalg.norm(P[i]) + RADIUS[dims[i]] for i in range(n))), 3),
        ids=ids)


data = json.load(open(PART, encoding="utf-8"))
fc = json.load(open(FCALC, encoding="utf-8"))
KEYS = {"E_TWODOCK": "electron", "T6-MU-LEAF": "muon", "T6-TAU-LL": "tau", "CROSS-CORE-N0": "neutrino-1",
        "CROSS-CORE-N1": "neutrino-2", "CROSS-CORE-N2": "neutrino-3", "U_DOCKED": "up", "D_DOCKED": "down",
        "C_DOCKED": "charm", "S_DOCKED": "strange", "TA_DOCKED": "top", "BA_DOCKED": "bottom", "r-GAM": "photon",
        "PROTON-SINK-NAMED": "proton", "SEED-EP2S1": "hydrogen", "r-WPM": "w-boson", "r-Z0D": "z-boson",
        "r-GLU": "gluon", "r-HIG": "higgs"}
models = []
for k, p in enumerate(data["particles"]):
    ids = [s["id"] for s in p["sites"]]
    assert not any(s["beyond_valence"] for s in p["sites"]), p["web"]
    models.append(build(KEYS[p["web"]], p["name"], p["symbol"], p["family"], p["generation"], p["web"], p["grade"],
                        p["standing"], ids, [s["d"] for s in p["sites"]], [(l["a"], l["b"]) for l in p["links"]],
                        [l["read"] for l in p["links"]], seed=k + 1, source="particles.json"))
assert len(models) == 19

# The two star forms of Appendix F, built from the arms recorded in the compendium's Lean files.
for key, name, sym, gname, grade, standing, seed in (
        ("proton-star", "proton", "p", "proton star _graph", "conditional",
         "From Appendix F of the book: the star with arms up, up and down, and its register, are the theory's conditional theorems 174.1 and 174.2. The drawing was made for the book from the arms the theory records.", 31),
        ("neutron", "neutron", "n", "neutron star _graph", "book",
         "From Appendix F of the book: assembled from the arms that the theory's Lean files record for the neutron, an up quark and two down quarks at a central qutrit. It matches the counts the theory prints and obeys the socket rule.", 32)):
    g = fc["C1_webs"][gname]
    ids = list(g["dims"].keys())
    models.append(build(key, name, sym, "composite", 0, "star, arms " + ("u, u, d" if key == "proton-star" else "u, d, d"),
                        grade, standing, ids, [g["dims"][i] for i in ids], [tuple(l) for l in g["links"]],
                        [False] * len(g["links"]), seed=seed, source="Appendix F, from the compendium's recorded arms"))

M = {m["id"]: m for m in models}
# Counts already established in Appendices E and F.
known = {"electron": (9, 10, 7, 79), "muon": (13, 15, 11, 117), "tau": (17, 20, 15, 155), "up": (3, 2, 0, 12),
         "down": (7, 7, 4, 52), "proton": (8, 9, 6, 81), "proton-star": (11, 11, 7, 85), "neutron": (15, 16, 11, 125),
         "hydrogen": (16, 19, 13, 160), "photon": (6, 5, 0, 30)}
for k, (ns, nl, nd, meas) in known.items():
    m = M[k]
    assert (len(m["d"]), len(m["e"]), m["dark"], m["measure"]) == (ns, nl, nd, meas), (k, len(m["d"]), len(m["e"]), m["dark"], m["measure"])
# The neutron's star less the proton's star is one hub assembly: four pieces, five rods, measure 40.
assert (len(M["neutron"]["d"]) - len(M["proton-star"]["d"]), len(M["neutron"]["e"]) - len(M["proton-star"]["e"]),
        M["neutron"]["measure"] - M["proton-star"]["measure"]) == (4, 5, 40)
# Pieces per family, as in Appendix E: one qutrit in every quark, three in every charged lepton, none in a neutrino.
assert all(M[k]["n3"] == 1 for k in ("up", "down", "charm", "strange", "top", "bottom"))
assert all(M[k]["n3"] == 3 for k in ("electron", "muon", "tau")) and all(M[k]["n3"] == 0 for k in ("neutrino-1", "neutrino-2", "neutrino-3"))
# Hydrogen is the electron's network and the proton's sharing one qubit that uses both of its sockets.
h = M["hydrogen"]; s = h["ids"].index("s.w1=s0")
assert h["d"][s] == 2 and sum(1 for a, b, _ in h["e"] if s in (a, b)) == 2
assert len(h["d"]) == len(M["electron"]["d"]) + len(M["proton"]["d"]) - 1 and len(h["e"]) == len(M["electron"]["e"]) + len(M["proton"]["e"])
h["shared"] = s
# The theory's drawing marks which rods of the W and Z chains are read.
assert sum(f for _, _, f in M["w-boson"]["e"]) == 1 and sum(f for _, _, f in M["z-boson"]["e"]) == 2
assert sum(f for m in models for _, _, f in m["e"]) == 3

# The Letter's records: four groups by the weight each record earns.
rows = list(csv.DictReader(open(REC, newline="", encoding="utf-8")))
groups = Counter(int(r["k"]) for r in rows)
assert len(rows) == 172 and dict(groups) == {1: 79, 2: 48, 3: 42, 6: 3}
numer = sum(n * math.sqrt(k) for k, n in groups.items())
N = 24 * 36 * 36
assert N == 31104 and (3 ** 2 - 1) * (2 ** 2 - 1) == 24 and (3 * 2) ** 2 == 36
inv = N / numer
assert abs(inv - 137.035999189566) < 1e-9, inv

# The theory's own table of the six kinds of link: the sector each is taken to correspond to (marked there as conjectured).
gj = json.load(open(GENRES, encoding="utf-8"))
rods = []
for g in gj["genres"]:
    a, b = g["genre"]
    assert a >= b and g["readable"] == (a * b <= READ_CAP), g["genre"]
    rods.append([a, b, g["sector"]])
assert sorted((a, b) for a, b, _ in rods) == [(2, 2), (3, 2), (3, 3), (4, 2), (4, 3), (4, 4)] and "Conjectured: sector" in gj["about"]
used = Counter()
for m in models:
    for a, b, _ in m["e"]:
        used[(max(m["d"][a], m["d"][b]), min(m["d"][a], m["d"][b]))] += 1
assert set(used) == {(a, b) for a, b, _ in rods}, used      # every kind of rod appears in some model, and no other kind does
rods.sort(key=lambda r: r[0] * r[1])

for m in models:
    del m["ids"]
out = dict(commit="a28db89", checked="2026-11-22", phys=PHYS, radius={str(k): v for k, v in RADIUS.items()}, cap=READ_CAP,
           grades=data["grades"], models=models, rods=rods,
           alpha=dict(records=len(rows), groups=[[k, groups[k]] for k in (1, 2, 3, 6)], N=N, numerator=round(numer, 9), inverse=f"{inv:.12f}"))
json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(models)} models written, {len(json.dumps(out, ensure_ascii=False, separators=(',', ':')))} bytes")
print(f"{'id':<12}{'balls':>6}{'2/3/4':>9}{'rods':>6}{'clear':>6}{'dark':>6}{'free':>6}{'meas':>6}{'extent':>8}  no-ring  formula")
for m in models:
    print(f"{m['id']:<12}{len(m['d']):>6}{str(m['n2'])+'/'+str(m['n3'])+'/'+str(m['n4']):>9}{len(m['e']):>6}{m['clear']:>6}{m['dark']:>6}{m['free']:>6}{m['measure']:>6}{m['ext']:>8}  {str(m['clear_rods_form_no_ring']):<7}  {m['formula']}")
print("alpha:", out["alpha"])
