(() => {
'use strict';
const DATA = /*DATA*/null;
const NS = 'http://www.w3.org/2000/svg';
const $ = (s, r) => (r || document).querySelector(s);
const svgEl = (tag, attrs, parent) => {
  const e = document.createElementNS(NS, tag);
  if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
const M = {};
DATA.models.forEach(m => { M[m.id] = m; });
const RAD = {2: DATA.radius['2'], 3: DATA.radius['3'], 4: DATA.radius['4']};
const CAP = DATA.cap;
const KIND = {2: 'qubit', 3: 'qutrit', 4: 'hub'};
const WORD = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];
const GRADE = {theorem: 'Theorem', conditional: 'Conditional theorem', open: 'Open result', book: 'Built for the book'};
const GEN = {1: 'first generation', 2: 'second generation', 3: 'third generation'};
const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- what the placard says about each model: structure only, checked against the data file ---------- */
const COPY = {
  'up': {noun: 'up quark', sym: 'u', nm: 'up', title: 'Up quark', text: "One qutrit with a loose qubit on either side. It is the smallest of the quark and lepton networks, a chain of qubit, qutrit and qubit in the literal sense of the theory's name. Both of its rods are clear."},
  'charm': {noun: 'charm quark', sym: 'c', nm: 'charm', title: 'Charm quark', text: 'The up quark with one of its loose qubits replaced by a hub cluster: a hub with three qubits, two of them tied to each other.'},
  'top': {noun: 'top quark', sym: 't', nm: 'top', title: 'Top quark', text: 'One qutrit, one loose qubit and a chain of two hubs. The hubs are tied to each other by the largest kind of rod, four states at each end.'},
  'gluon': {noun: 'gluon', sym: 'g', nm: 'gluon', title: 'Gluon', text: 'Four qutrits in a row. Every rod joins a qutrit to a qutrit, so all three are hidden.'},
  'higgs': {noun: 'Higgs boson', sym: 'H', nm: 'Higgs', title: 'Higgs', text: 'Two hubs and the single rod between them, four states at each end. It is the largest kind of rod, and a hidden one.'},
  'down': {noun: 'down quark', sym: 'd', nm: 'down', title: 'Down quark', text: "The up quark with one hub cluster added at its qutrit, which fills the qutrit's third socket. That one cluster is all that separates the two."},
  'strange': {noun: 'strange quark', sym: 's', nm: 'strange', title: 'Strange quark', text: 'The down quark with one of its loose qubits replaced by a second hub cluster.'},
  'bottom': {noun: 'bottom quark', sym: 'b', nm: 'bottom', title: 'Bottom quark', text: 'One qutrit, one loose qubit and three hubs. Two of the hubs are tied to each other in a chain, as in the top quark.'},
  'photon': {noun: 'photon', sym: 'γ', nm: 'photon', title: 'Photon', text: "A chain of six balls, qubit and qutrit in turn. All five rods are of one kind, a qutrit tied to a qubit, and all five are clear. The same kind of rod, three of them at one qutrit, is what the theory's best-known number is computed from."},
  'proton': {noun: 'proton', sym: 'p', nm: 'proton', title: 'Proton', text: 'A central qutrit tied by hidden rods to three more qutrits. Each of those three carries one loose qubit, and a hub ties the three together. The theory reads the three loose ends as two up quarks and a down quark, and notes that this reading is not derived.'},
  'proton-star': {text: 'The proton drawn as three quarks: a central qutrit with two up quarks and one down quark on its three sockets. Every rod that reaches the center is hidden, which is how the theory reads the fact that quarks are never seen alone.'},
  'electron': {noun: 'electron', sym: 'e', nm: 'electron', title: 'Electron', text: "Three qutrits in a triangle. One corner carries a hub cluster, and each of the other two ends in one loose qubit. Seven of the ten rods are hidden, which is the theory's account of why experiments find no parts inside an electron."},
  'muon': {noun: 'muon', sym: 'μ', nm: 'muon', title: 'Muon', text: 'The electron with a second hub cluster at another corner of the triangle. The loose qubit that sat there stays on, tied to the new cluster.'},
  'tau': {noun: 'tau', sym: 'τ', nm: 'tau', title: 'Tau', text: 'A hub cluster at all three corners. Every socket of the triangle is now in use, and the theory reads that as the reason matter comes in three generations and no more.'},
  'z-boson': {noun: 'Z boson', sym: 'Z', nm: 'Z boson', title: 'Z boson', text: 'The same five-ball chain as the W boson. The theory tells the two apart by how the chain is read: along one of the middle rods for the W, along both for the Z. The read rods have a colored edge.'},
  'neutron': {noun: 'neutron', sym: 'n', nm: 'neutron', title: 'Neutron', text: "The proton's three-quark star with one up quark exchanged for a down quark, which adds exactly one hub cluster."},
  'neutrino-1': {noun: 'first neutrino', sym: 'ν<sub>1</sub>', nm: 'neutrino', title: 'Neutrino', text: "One hub with four qubits, two of them tied to each other. The theory's neutrino networks contain no qutrit at all, and its documents grade their reading as neutrinos unfinished."},
  'neutrino-2': {noun: 'second neutrino', sym: 'ν<sub>2</sub>', nm: 'neutrino', title: 'Neutrino', text: 'Two hubs joined through a qubit that they share. Again there is no qutrit.'},
  'neutrino-3': {noun: 'third neutrino', sym: 'ν<sub>3</sub>', nm: 'neutrino', title: 'Neutrino', text: 'Three hubs. The outer two are each joined to the middle one through a shared qubit.'},
  'w-boson': {noun: 'W boson', sym: 'W', nm: 'W boson', title: 'W boson', text: "A chain of five: hub, qubit, qutrit, qubit, hub. The theory's drawing marks one of the two middle rods as the one that is read, shown here with a colored edge."},
  'hydrogen': {noun: 'hydrogen atom', sym: '<sup>1</sup>H', nm: 'hydrogen', title: 'Hydrogen atom', text: "The electron's network and the proton's, plugged into the two sockets of one shared qubit, which is ringed. The proton appears in its cataloged form."}
};
const CHART = ['up', 'charm', 'top', 'gluon', 'higgs', 'down', 'strange', 'bottom', 'photon', 'proton', 'electron', 'muon', 'tau', 'z-boson', 'neutron', 'neutrino-1', 'neutrino-2', 'neutrino-3', 'w-boson', 'hydrogen'];
const HINT = 'Drag the model sideways to turn it. Pull on a ball. Tap a rod to try to look at it.';

/* ---------- small vector and matrix helpers ---------- */
const mul = (A, B) => {
  const C = new Array(9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j];
  return C;
};
const rotY = a => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
const rotX = b => [1, 0, 0, 0, Math.cos(b), -Math.sin(b), 0, Math.sin(b), Math.cos(b)];
const apply = (R, p) => [R[0] * p[0] + R[1] * p[1] + R[2] * p[2], R[3] * p[0] + R[4] * p[1] + R[5] * p[2], R[6] * p[0] + R[7] * p[1] + R[8] * p[2]];
const applyT = (R, v) => [R[0] * v[0] + R[3] * v[1] + R[6] * v[2], R[1] * v[0] + R[4] * v[1] + R[7] * v[2], R[2] * v[0] + R[5] * v[1] + R[8] * v[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => Math.hypot(a[0], a[1], a[2]);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const ortho = R => {            // keep the turning matrix a pure rotation
  let a = [R[0], R[1], R[2]], b = [R[3], R[4], R[5]];
  const la = norm(a); a = a.map(c => c / la);
  const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; b = [b[0] - d * a[0], b[1] - d * a[1], b[2] - d * a[2]];
  const lb = norm(b); b = b.map(c => c / lb);
  const c = cross(a, b);
  return [a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]];
};
const R0 = mul(rotX(0.26), rotY(-0.42));

/* ---------- the stage ---------- */
const scene = $('#scene'), layer = $('#layer'), overlay = $('#overlay'), inspect = $('#inspect');
const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const S = {model: null, tile: 'electron', protonForm: 'catalog', P: [], V: [], adj: [], view: [], R: R0.slice(), W: 0, H: 0, scale: 60, D: 8, yc: 0, cx: 0, cy: 0,
           items: [], orderKey: '', sel: null, drag: null, spin: !reduce, active: false, still: 0, raf: 0, last: 0};
const PHYS = DATA.phys, DT = 0.11, DAMP = 0.92, STEPS = 3;

function setModel(id) {
  const m = M[id];
  S.model = m;
  S.P = m.p.map(p => p.slice());
  S.V = m.p.map(() => [0, 0, 0]);
  S.adj = m.d.map(() => []);
  m.e.forEach(([a, b]) => { S.adj[a].push(b); S.adj[b].push(a); });
  S.R = R0.slice(); S.sel = null; S.drag = null; S.active = false;
  buildScene(); fit(); render();
  inspect.textContent = HINT;
}

function buildScene() {
  const m = S.model;
  layer.textContent = ''; overlay.textContent = '';
  S.items = []; S.orderKey = '';
  m.e.forEach(([a, b, flag], k) => {
    const clear = m.d[a] * m.d[b] <= CAP;
    const g = svgEl('g', {'class': 'rod ' + (clear ? 'clear' : 'dark'), 'data-e': k}, layer);
    const halo = flag ? svgEl('line', {'class': 'halo'}, g) : null;
    const vis = svgEl('line', {'class': 'vis'}, g);
    const hit = svgEl('line', {'class': 'hit'}, g);
    S.items.push({kind: 'rod', key: 'r' + k, k, a, b, g, vis, hit, halo, clear, lines: halo ? [halo, vis, hit] : [vis, hit], z: 0});
  });
  m.d.forEach((d, i) => {
    const free = d - S.adj[i].length;
    for (let j = 0; j < free; j++) {
      const g = svgEl('g', {'class': 'sock'}, layer);
      S.items.push({kind: 'sock', key: 's' + i + '_' + j, i, j, g, line: svgEl('line', null, g), ring: svgEl('circle', null, g), z: 0});
    }
  });
  m.d.forEach((d, i) => {
    const g = svgEl('g', {'class': 'ball d' + d, 'data-i': i}, layer);
    const ring = m.shared === i ? svgEl('circle', {'class': 'ring'}, g) : null;
    const c = svgEl('circle', {'class': 'body'}, g);
    const fog = svgEl('circle', {'class': 'fog'}, g);
    const t = svgEl('text', {'class': 'num', dy: '.36em'}, g);
    t.textContent = d;
    S.items.push({kind: 'ball', key: 'b' + i, i, g, c, fog, t, ring, z: 0});
  });
}

function fit() {
  const r = scene.getBoundingClientRect();
  S.W = r.width; S.H = r.height;
  if (S.model) S.D = Math.max(8, (S.model.ext + 0.30) * 4.4);
}
/* The largest scale at which the model stays inside the frame however it is spun about the upright axis.
   A point at distance q from that axis reaches at most q / sqrt(1 - (q/D)^2) sideways, and is magnified by at most D / (D - q). */
function fitScale(view) {
  const m = S.model, D = S.D;
  let h = 0.1, top = -Infinity, bot = Infinity;
  for (let i = 0; i < view.length; i++) {
    const p = view[i], q = Math.min(Math.hypot(p[0], p[2]), 0.8 * D), fm = D / (D - q), fn = D / (D + q), r = RAD[m.d[i]] + 0.30;
    h = Math.max(h, q / Math.sqrt(1 - (q / D) * (q / D)) + r * fm);
    const hi = p[1] + r, lo = p[1] - r;         // the highest and lowest this ball can appear during a spin
    top = Math.max(top, hi * (hi >= 0 ? fm : fn));
    bot = Math.min(bot, lo * (lo <= 0 ? fm : fn));
  }
  S.yc = (top + bot) / 2;                       // the model is centred on its height, not on its centre of mass
  return Math.min(Math.min(S.W, S.H) / 3.6, (S.W / 2 - 8) / h, (S.H / 2 - 8) / ((top - bot) / 2));
}

function socketDirs(i) {
  const m = S.model, P = S.P, p = P[i], nb = S.adj[i];
  let ax = [0, 0, 0];
  for (const j of nb) { const d = sub(P[j], p), L = norm(d) || 1; ax[0] -= d[0] / L; ax[1] -= d[1] / L; ax[2] -= d[2] / L; }
  let L = norm(ax);
  if (L < 0.25) {                 // neighbours pull in opposite directions: point across them
    const d = sub(P[nb[0]], p), ld = norm(d) || 1;
    ax = cross(d, Math.abs(d[2]) < 0.9 * ld ? [0, 0, 1] : [0, 1, 0]); L = norm(ax) || 1;
  }
  ax = ax.map(c => c / L);
  const free = m.d[i] - nb.length;
  if (free === 1) return [ax];
  let e1 = cross(ax, Math.abs(ax[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0]);
  const l1 = norm(e1) || 1; e1 = e1.map(c => c / l1);
  const e2 = cross(ax, e1), th = free === 2 ? 0.72 : 0.98, out = [];
  for (let k = 0; k < free; k++) {
    const ph = 2 * Math.PI * k / free + 0.6, c = Math.cos(th), s = Math.sin(th), cp = Math.cos(ph), sp = Math.sin(ph);
    out.push([ax[0] * c + (e1[0] * cp + e2[0] * sp) * s, ax[1] * c + (e1[1] * cp + e2[1] * sp) * s, ax[2] * c + (e1[2] * cp + e2[2] * sp) * s]);
  }
  return out;
}

const setLine = (ln, A, B) => { ln.setAttribute('x1', A[0].toFixed(1)); ln.setAttribute('y1', A[1].toFixed(1)); ln.setAttribute('x2', B[0].toFixed(1)); ln.setAttribute('y2', B[1].toFixed(1)); };
const setCircle = (c, x, y, r) => { c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('r', Math.max(0.5, r).toFixed(1)); };

function render() {
  const m = S.model;
  if (!m || !S.W) return;
  const R = S.R, D = S.D;
  const view = S.view = S.P.map(p => apply(R, p));
  if (!(S.drag && S.drag.ball >= 0 && S.drag.moved)) S.scale = fitScale(view);   // while a ball is being pulled the scale holds still
  const s = S.scale, cx = S.cx = S.W / 2, cy = S.cy = S.H / 2 + s * S.yc;
  let zmin = Infinity, zmax = -Infinity;
  for (const v of view) { if (v[2] < zmin) zmin = v[2]; if (v[2] > zmax) zmax = v[2]; }
  const span = Math.max(zmax - zmin, 0.8);
  const fog = z => clamp(0.30 * (zmax - z) / span, 0, 0.34);
  const pr = v => { const f = D / (D - v[2]); return [cx + s * f * v[0], cy - s * f * v[1], f]; };
  const dirs = {};
  for (const it of S.items) {
    if (it.kind === 'ball') {
      const v = view[it.i], q = pr(v), r = s * q[2] * RAD[m.d[it.i]];
      it.x = q[0]; it.y = q[1]; it.r = r; it.z = v[2];
      setCircle(it.c, q[0], q[1], r); setCircle(it.fog, q[0], q[1], r);
      it.fog.setAttribute('opacity', fog(v[2]).toFixed(3));
      it.t.setAttribute('x', q[0].toFixed(1)); it.t.setAttribute('y', q[1].toFixed(1)); it.t.setAttribute('font-size', (r * 1.22).toFixed(1));
      if (it.ring) setCircle(it.ring, q[0], q[1], r + 6);
    } else if (it.kind === 'rod') {
      const va = view[it.a], vb = view[it.b], d = sub(vb, va), L = norm(d) || 1;
      const ra = RAD[m.d[it.a]] * 0.9, rb = RAD[m.d[it.b]] * 0.9;
      const A = pr([va[0] + d[0] / L * ra, va[1] + d[1] / L * ra, va[2] + d[2] / L * ra]);
      const B = pr([vb[0] - d[0] / L * rb, vb[1] - d[1] / L * rb, vb[2] - d[2] / L * rb]);
      const w = Math.max(1.6, s * (A[2] + B[2]) / 2 * (it.clear ? 0.085 : 0.07));
      it.z = (va[2] + vb[2]) / 2; it.mx = (A[0] + B[0]) / 2; it.my = (A[1] + B[1]) / 2;
      for (const ln of it.lines) setLine(ln, A, B);
      it.vis.setAttribute('stroke-width', w.toFixed(2));
      if (!it.clear) it.vis.setAttribute('stroke-dasharray', (w * 1.4).toFixed(1) + ' ' + (w * 1.9).toFixed(1));
      it.vis.setAttribute('opacity', (1 - fog(it.z)).toFixed(3));
      if (it.halo) it.halo.setAttribute('stroke-width', (w + 8).toFixed(2));
    } else {
      const ds = dirs[it.i] || (dirs[it.i] = socketDirs(it.i)), dir = apply(R, ds[it.j]), v = view[it.i], rad = RAD[m.d[it.i]];
      const A = pr([v[0] + dir[0] * rad * 0.9, v[1] + dir[1] * rad * 0.9, v[2] + dir[2] * rad * 0.9]);
      const e = [v[0] + dir[0] * (rad + 0.25), v[1] + dir[1] * (rad + 0.25), v[2] + dir[2] * (rad + 0.25)], B = pr(e);
      it.z = e[2] - 0.01;
      setLine(it.line, A, B);
      it.line.setAttribute('stroke-width', Math.max(1.2, s * B[2] * 0.045).toFixed(2));
      setCircle(it.ring, B[0], B[1], s * B[2] * 0.062);
      it.ring.setAttribute('stroke-width', Math.max(1.1, s * B[2] * 0.028).toFixed(2));
      it.g.setAttribute('opacity', (1 - fog(e[2])).toFixed(3));
    }
  }
  const sorted = S.items.slice().sort((p, q) => p.z - q.z);
  const key = sorted.map(it => it.key).join(' ');
  if (key !== S.orderKey) { for (const it of sorted) layer.appendChild(it.g); S.orderKey = key; }
  drawPill();
}

function drawPill() {
  overlay.textContent = '';
  const sel = S.sel;
  if (!sel || sel.rod == null) return;
  const it = S.items.find(q => q.kind === 'rod' && q.k === sel.rod), m = S.model;
  if (!it) return;
  const da = Math.max(m.d[it.a], m.d[it.b]), db = Math.min(m.d[it.a], m.d[it.b]);
  const g = svgEl('g', {'class': 'pill'}, overlay);
  const rect = svgEl('rect', {rx: 3}, g), t = svgEl('text', null, g);
  t.textContent = da + ' × ' + db + ' = ' + da * db;
  const w = 12.5 * 0.62 * t.textContent.length + 16, x = clamp(it.mx, w / 2 + 4, S.W - w / 2 - 4), y = clamp(it.my - 20, 16, S.H - 10);
  rect.setAttribute('x', (x - w / 2).toFixed(1)); rect.setAttribute('y', (y - 12).toFixed(1)); rect.setAttribute('width', w.toFixed(1)); rect.setAttribute('height', 22);
  t.setAttribute('x', x.toFixed(1)); t.setAttribute('y', (y + 3.5).toFixed(1));
}

function physics() {
  const P = S.P, V = S.V, n = P.length, held = S.drag && S.drag.moved ? S.drag.ball : -1;
  const F = P.map(() => [0, 0, 0]);
  for (const [a, b] of S.model.e) {
    const d = sub(P[b], P[a]), r = norm(d) || 1e-6, f = PHYS.ks * (r - PHYS.L) / r;
    for (let k = 0; k < 3; k++) { F[a][k] += f * d[k]; F[b][k] -= f * d[k]; }
  }
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const d = sub(P[i], P[j]), r2 = d[0] * d[0] + d[1] * d[1] + d[2] * d[2] + 1e-6, f = PHYS.kr / (r2 * Math.sqrt(r2));
    for (let k = 0; k < 3; k++) { F[i][k] += f * d[k]; F[j][k] -= f * d[k]; }
  }
  let vmax = 0;
  for (let i = 0; i < n; i++) {
    if (i === held) { V[i] = [0, 0, 0]; continue; }
    for (let k = 0; k < 3; k++) { V[i][k] = (V[i][k] + F[i][k] * DT) * DAMP; P[i][k] += V[i][k] * DT; }
    vmax = Math.max(vmax, Math.abs(V[i][0]), Math.abs(V[i][1]), Math.abs(V[i][2]));
  }
  if (held < 0) {                 // let the model drift back to the middle of the stage
    const c = [0, 0, 0];
    for (const p of P) { c[0] += p[0] / n; c[1] += p[1] / n; c[2] += p[2] / n; }
    for (const p of P) { p[0] -= c[0] * 0.06; p[1] -= c[1] * 0.06; p[2] -= c[2] * 0.06; }
    vmax = Math.max(vmax, norm(c) * 0.06);
  }
  return vmax;
}

function tick(now) {
  S.raf = 0;
  const dt = Math.min(0.05, Math.max(0.001, (now - S.last) / 1000));
  S.last = now;
  let moving = false;
  if (S.spin && !S.drag && S.seen) { S.R = ortho(mul(rotY(0.22 * dt), S.R)); moving = true; }
  if (S.active) {
    let v = 0;
    for (let k = 0; k < STEPS; k++) v = physics();
    const held = S.drag && S.drag.ball >= 0 && S.drag.moved;
    S.free = held ? 0 : (S.free || 0) + 1;
    if (!held && (v < 5e-4 || S.free > 900)) { if (++S.still > 20 || S.free > 900) S.active = false; } else S.still = 0;
    moving = moving || S.active;
  }
  render();
  if (moving || S.drag) S.raf = requestAnimationFrame(tick);
}
function kick() { if (!S.raf) { S.last = performance.now(); S.raf = requestAnimationFrame(tick); } }

function rodText(k) {
  const m = S.model, e = m.e[k], da = Math.max(m.d[e[0]], m.d[e[1]]), db = Math.min(m.d[e[0]], m.d[e[1]]), prod = da * db;
  const say = SECTOR_SAY[SECTOR[da + ',' + db]];
  let t = 'Rod between ' + (da === db ? 'two ' + KIND[da] + 's' : 'a ' + KIND[da] + ' and a ' + KIND[db]) + ': ' + da + ' × ' + db + ' = ' + prod + ', ';
  t += prod <= CAP ? 'within the limit of six, so one look can pin it down. The theory matches this kind of rod with ' + say + '.'
                   : 'above the limit of six, so no single look can pin it down. The theory calls it dark and matches this kind of rod with ' + say + '.';
  if (e[2]) t += " Its drawing marks this rod as one that is read.";
  return t;
}
function ballText(i) {
  const m = S.model, d = m.d[i], used = S.adj[i].length, free = d - used;
  let t = d === 4 ? 'Hub: two qubits read as one piece with four states, so four sockets. ' : cap1(KIND[d]) + ': ' + WORD[d] + ' states, so ' + WORD[d] + ' sockets. ';
  t += (used === 1 ? 'One rod ends' : cap1(WORD[used]) + ' rods end') + ' here, which leaves ' + (free === 0 ? 'no socket' : free === 1 ? 'one socket' : WORD[free] + ' sockets') + ' free.';
  if (m.shared === i) t += " This is the qubit that the electron's network and the proton's share.";
  return t;
}
function select(sel) {
  S.sel = sel;
  for (const it of S.items) it.g.classList.toggle('sel', !!sel && ((it.kind === 'ball' && sel.ball === it.i) || (it.kind === 'rod' && sel.rod === it.k)));
  inspect.textContent = !sel ? HINT : sel.ball != null ? ballText(sel.ball) : rodText(sel.rod);
  render();
}
function stopSpin() { if (S.spin) { S.spin = false; $('#b-spin').setAttribute('aria-pressed', 'false'); } }

scene.addEventListener('pointerdown', e => {
  if (e.button > 0 || S.drag) return;
  const r = scene.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  const tb = e.target.closest('[data-i]'), te = e.target.closest('[data-e]');
  S.drag = {id: e.pointerId, x0: x, y0: y, x, y, moved: false, ball: tb ? +tb.getAttribute('data-i') : -1, rod: te ? +te.getAttribute('data-e') : -1, z: 0};
  if (tb) S.drag.z = S.view[S.drag.ball][2];
  try { scene.setPointerCapture(e.pointerId); } catch (err) { /* capture is a convenience */ }
  stopSpin();
  scene.classList.add('grabbing');
  e.preventDefault();
});
scene.addEventListener('pointermove', e => {
  const d = S.drag;
  if (!d || e.pointerId !== d.id) return;
  const r = scene.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  if (!d.moved && Math.hypot(x - d.x0, y - d.y0) > 5) d.moved = true;
  if (d.moved) {
    if (d.ball >= 0) {            // pull the ball in the plane of the screen
      const f = S.D / (S.D - d.z);
      S.P[d.ball] = applyT(S.R, [(clamp(x, 10, S.W - 10) - S.cx) / (S.scale * f), -(clamp(y, 10, S.H - 10) - S.cy) / (S.scale * f), d.z]);
      S.V[d.ball] = [0, 0, 0]; S.active = true; S.still = 0;
    } else {
      S.R = ortho(mul(rotX((y - d.y) * 0.011), mul(rotY((x - d.x) * 0.011), S.R)));
    }
    kick();
  }
  d.x = x; d.y = y;
});
const endDrag = e => {
  const d = S.drag;
  if (!d || e.pointerId !== d.id) return;
  S.drag = null;
  scene.classList.remove('grabbing');
  if (!d.moved && e.type === 'pointerup') select(d.ball >= 0 ? {ball: d.ball} : d.rod >= 0 ? {rod: d.rod} : null);
  if (d.ball >= 0 && d.moved) { S.active = true; S.still = 0; }
  kick();
};
scene.addEventListener('pointerup', endDrag);
scene.addEventListener('pointercancel', endDrag);
const turn = (a, b) => { stopSpin(); S.R = ortho(mul(rotX(b), mul(rotY(a), S.R))); render(); };
scene.addEventListener('keydown', e => {
  const k = e.key;
  if (k === 'ArrowLeft') turn(-0.2, 0); else if (k === 'ArrowRight') turn(0.2, 0); else if (k === 'ArrowUp') turn(0, -0.2); else if (k === 'ArrowDown') turn(0, 0.2); else return;
  e.preventDefault();
});
$('#b-left').addEventListener('click', () => turn(-0.4, 0));
$('#b-right').addEventListener('click', () => turn(0.4, 0));
$('#b-spin').addEventListener('click', () => { S.spin = !S.spin; $('#b-spin').setAttribute('aria-pressed', String(S.spin)); kick(); });
$('#b-sock').addEventListener('click', () => {
  const on = $('#b-sock').getAttribute('aria-pressed') !== 'true';
  $('#b-sock').setAttribute('aria-pressed', String(on));
  layer.classList.toggle('nosock', !on);
});
$('#b-reset').addEventListener('click', () => { setModel(S.model.id); kick(); });
if (window.ResizeObserver) new ResizeObserver(() => { fit(); render(); }).observe($('#frame'));
else window.addEventListener('resize', () => { fit(); render(); });
S.seen = true;                    // the model spins only while it is on screen
if (window.IntersectionObserver) new IntersectionObserver(en => { S.seen = en[en.length - 1].isIntersecting; if (S.seen) kick(); }).observe($('#frame'));

/* ---------- the chart of models and the placard ---------- */
const tiles = $('#tiles'), placard = $('#placard');
CHART.forEach(id => {
  const c = COPY[id], m = M[id], b = document.createElement('button');
  b.type = 'button'; b.className = 'tile'; b.id = 'tile-' + id;
  b.setAttribute('aria-pressed', 'false');
  b.setAttribute('aria-label', c.title + (m.gen ? ', ' + GEN[m.gen] : '') + ', ' + GRADE[m.grade].toLowerCase());
  b.innerHTML = '<span class="sym">' + c.sym + '</span><span class="nm">' + c.nm + '</span><i class="pip ' + m.grade + '"></i>';
  b.addEventListener('click', () => choose(id, true));
  tiles.appendChild(b);
});

function showPlacard() {
  const m = S.model, c = COPY[S.tile], text = m.id === 'proton-star' ? COPY['proton-star'].text : c.text;
  const part = (cls, n, one, many) => n ? '<span><i class="' + cls + '"></i><b>×' + n + '</b> ' + (n === 1 ? one : many) + '</span>' : '';
  let h = '<p class="kicker">' + m.family + (m.gen ? ' · ' + GEN[m.gen] : '') + '</p>';
  h += '<h2><span class="psym">' + c.sym + '</span>' + c.title + '</h2>';
  h += '<p>' + text + '</p>';
  if (S.tile === 'proton') {
    h += '<div class="forms" role="group" aria-label="Form of the proton"><button class="btn" type="button" id="form-catalog" aria-pressed="' + (m.id === 'proton') + '">As cataloged</button><button class="btn" type="button" id="form-star" aria-pressed="' + (m.id === 'proton-star') + '">As three quarks</button></div>';
  }
  if (S.tile === 'neutron') h += '<div class="forms"><button class="btn" type="button" id="go-proton-star">Show the proton as three quarks</button></div>';
  h += '<h3>Parts list</h3><div class="parts">' + part('b d2', m.n2, 'qubit', 'qubits') + part('b d3', m.n3, 'qutrit', 'qutrits') + part('b d4', m.n4, 'hub', 'hubs') + part('r', m.clear, 'clear rod', 'clear rods') + part('r dk', m.dark, 'hidden rod', 'hidden rods') + '</div>';
  h += '<h3>How firmly it stands</h3><p class="stand"><span class="chip"><i class="pip ' + m.grade + '"></i>' + GRADE[m.grade] + '</span>' + (m.source === 'particles.json' ? '<q id="standing"></q>' : '<span id="standing"></span>') + '</p>';
  h += '<p class="conj">' + (m.grade === 'book' ? "The theory's own catalog draws no neutron, because the body it records breaks the socket rule. That this network is the neutron is a conjecture." : 'That this network is the ' + c.noun + ' is a conjecture, as it is for every entry.') + '</p>';
  h += '<p class="tech">' + m.web + ' · ' + m.formula + ' · measure ' + m.measure + '</p>';
  placard.innerHTML = h;
  $('#standing').textContent = m.standing;
  const fc = $('#form-catalog'), fs = $('#form-star'), gp = $('#go-proton-star');
  if (fc) fc.addEventListener('click', () => { S.protonForm = 'catalog'; choose('proton', true); });
  if (fs) fs.addEventListener('click', () => { S.protonForm = 'star'; choose('proton', true); });
  if (gp) gp.addEventListener('click', () => { S.protonForm = 'star'; choose('proton', true); });
  const n = m.d.length;
  scene.setAttribute('aria-label', 'Ball-and-stick model of the ' + c.noun + ': ' + n + ' balls and ' + m.e.length + ' rods, of which ' + m.dark + ' hidden.');
}

function choose(id, fromUser) {
  if (!COPY[id] || !COPY[id].sym) id = 'electron';
  S.tile = id;
  setModel(id === 'proton' && S.protonForm === 'star' ? 'proton-star' : id);
  for (const b of tiles.children) b.setAttribute('aria-pressed', String(b.id === 'tile-' + id));
  showPlacard();
  if (fromUser) { try { history.replaceState(null, '', '#' + id); } catch (err) { try { location.hash = id; } catch (e2) { /* the address is a convenience */ } } }
  kick();
}
window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (CHART.indexOf(id) >= 0 && id !== S.tile) choose(id, false); });

/* ---------- the table of the six kinds of rod ---------- */
const WHERE = {'2,2': 'The tied pair of qubits in a hub cluster', '3,2': 'The loose ends of the electron, the muon and the quarks, and all five rods of the photon', '4,2': 'The three legs of every hub cluster',
               '3,3': "The triangle of the electron, muon and tau, the proton's center and the gluon", '4,3': 'The rod that ties a hub to its qutrit', '4,4': 'The Higgs, and the hub-to-hub rod of the top and bottom quarks'};
const SECTOR = {}, SECTOR_SAY = {'spacetime': 'spacetime', 'electromagnetism': 'electromagnetism', 'strong interaction': 'the strong interaction', 'weak interaction': 'the weak interaction', 'Yukawa sector': 'the Yukawa sector', 'Higgs': 'the Higgs'};
DATA.rods.forEach(r => { SECTOR[r[0] + ',' + r[1]] = r[2]; });
const mini = (a, b) => {
  const r = {2: 8, 3: 10, 4: 12}, clear = a * b <= CAP;
  return '<svg class="mini" viewBox="0 0 92 28" role="img" aria-label="' + KIND[a] + ' to ' + KIND[b] + '"><line class="ln' + (clear ? '' : ' dk') + '" x1="' + (16 + r[a]) + '" y1="14" x2="' + (76 - r[b]) + '" y2="14"/><circle cx="16" cy="14" r="' + r[a] + '" class="pc' + a + '"/><circle cx="76" cy="14" r="' + r[b] + '" class="pc' + b + '"/><text x="16" y="18.2">' + a + '</text><text x="76" y="18.2">' + b + '</text></svg>';
};
$('#rodtable tbody').innerHTML = DATA.rods.map(([a, b, sector]) => {
  const p = a * b, clear = p <= CAP;
  return '<tr' + (p === CAP ? ' class="cut"' : '') + '><td>' + mini(a, b) + '</td><td class="n">' + a + ' × ' + b + ' = ' + p + '</td><td class="' + (clear ? 'yes' : 'no') + '">' + (clear ? 'pins it down' : 'cannot') + '</td><td class="sc" data-l="Sector">' + cap1(sector) + (sector === 'Yukawa sector' ? ', how matter couples to the Higgs' : '') + '</td><td class="w" data-l="In the models">' + WHERE[a + ',' + b] + '</td></tr>';
}).join('');

/* ---------- bench trial 1: look at both ends of one rod ---------- */
const WAYS = [['up / down', 'up', 'down'], ['left / right', 'left', 'right'], ['toward / away', 'toward', 'away']];
const LK = {a: 0, b: 0, n: [[0, 0], [0, 0]], last: null};
const glyph = (way, ans) => {
  if (ans == null) return '<text y="8">?</text>';
  if (way === 2) return '<circle r="10.5"/>' + (ans === 0 ? '<circle class="dot" r="3.6"/>' : '<path d="M-7 -7L7 7M-7 7L7 -7"/>');
  const rot = way === 0 ? (ans === 0 ? 0 : 180) : (ans === 0 ? -90 : 90);
  return '<path transform="rotate(' + rot + ')" d="M0 12V-11M-7.5 -3.5L0 -11.5L7.5 -3.5"/>';
};
function drawLook() {
  const wa = WAYS[LK.a], wb = WAYS[LK.b], n = LK.n, N = n[0][0] + n[0][1] + n[1][0] + n[1][1];
  $('#ans-a').innerHTML = glyph(LK.a, LK.last ? LK.last[0] : null);
  $('#ans-b').innerHTML = glyph(LK.b, LK.last ? LK.last[1] : null);
  const cell = v => '<td>' + v + '<i style="width:' + (N ? (100 * v / N).toFixed(1) : 0) + '%"></i></td>';
  $('#tally').innerHTML = '<thead><tr><th scope="col">Left end said</th><th scope="col">Right: ' + wb[1] + '</th><th scope="col">Right: ' + wb[2] + '</th></tr></thead><tbody>' +
    [0, 1].map(i => '<tr><th scope="row">' + wa[i + 1] + '</th>' + cell(n[i][0]) + cell(n[i][1]) + '</tr>').join('') + '</tbody>';
  const times = k => k === 1 ? 'once' : k + ' times';
  $('#look-sum').textContent = !N ? 'No looks yet.' : LK.a === LK.b
    ? N + (N === 1 ? ' look' : ' looks') + ' with matching ways. The two ends gave the same answer every time. The left end said ' + wa[1] + ' ' + times(n[0][0] + n[0][1]) + ' and ' + wa[2] + ' ' + times(n[1][0] + n[1][1]) + '.'
    : N + (N === 1 ? ' look' : ' looks') + ' with different ways. The answers fall in all four boxes, about equally in the long run, so one end tells nothing about the other.';
}
function look(times) {
  for (let t = 0; t < times; t++) {
    const a = Math.random() < 0.5 ? 0 : 1, b = LK.a === LK.b ? a : (Math.random() < 0.5 ? 0 : 1);
    LK.n[a][b]++; LK.last = [a, b];
  }
  drawLook();
}
function clearLooks() { LK.n = [[0, 0], [0, 0]]; LK.last = null; drawLook(); }
['a', 'b'].forEach(end => {
  const seg = $('#seg-' + end);
  WAYS.forEach((w, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn'; b.id = 'way-' + end + '-' + i; b.textContent = w[0];
    b.setAttribute('aria-pressed', String(i === 0));
    b.addEventListener('click', () => { LK[end] = i; for (const o of seg.children) o.setAttribute('aria-pressed', String(o === b)); clearLooks(); });
    seg.appendChild(b);
  });
});
$('#look-1').addEventListener('click', () => look(1));
$('#look-100').addEventListener('click', () => look(100));
$('#look-clear').addEventListener('click', clearLooks);
drawLook();

/* ---------- bench trial 2: distill ---------- */
$('#distill').addEventListener('click', () => {
  const on = !$('#swap').classList.contains('done');
  $('#swap').classList.toggle('done', on);
  $('#distill').setAttribute('aria-pressed', String(on));
  $('#distill').textContent = on ? 'Start again' : 'Distill B with C';
  $('#distill-sum').textContent = on ? 'Still two pairs, re-matched: B with C, and A with D, which never met.' : 'Two pairs: A with B, and C with D.';
});

/* ---------- the one number ---------- */
const AL = DATA.alpha, GNAME = {1: 'pass neither end', 2: 'pass the qubit end', 3: 'pass the qutrit end', 6: 'pass both ends'};
$('#waffle').innerHTML = AL.groups.map(([k, n]) => '<div class="wg k' + k + '"><span><b>' + n + ' × ' + (k === 1 ? '1' : '√' + k) + '</b>' + GNAME[k] + '</span><div class="cells" style="grid-template-rows:repeat(' + Math.min(4, n) + ',8px)">' + new Array(n + 1).join('<i></i>') + '</div></div>').join('');
const NUMER = AL.groups.reduce((s, g) => s + g[1] * Math.sqrt(g[0]), 0), INV = AL.N / NUMER;
const grp = s => s.replace(/(\d{3})(?=\d)/g, (mm, a, off, str) => off > str.indexOf('.') ? a + ' ' : a);
$('#sumline').innerHTML = '79 + 48√2 + 42√3 + 3√6 = ' + NUMER.toFixed(5) + '<br>24 × 36 × 36 = 31,104<br>31,104 ÷ ' + NUMER.toFixed(5) + ' = <b id="inverse">' + grp(INV.toFixed(12)) + '</b>';

const CAND = (INV - 137.035999) * 1e9;
const MEAS = [{group: 'Official values'}, {label: 'CODATA 2010', v: 74, u: 44}, {label: 'CODATA 2014', v: 139, u: 31}, {label: 'CODATA 2018', v: 84, u: 21}, {label: 'CODATA 2022', v: 177, u: 21},
              {group: 'Single measurements'}, {label: 'Cesium, 2018', v: 46, u: 27}, {label: 'Rubidium, 2020', v: 206, u: 11}, {label: 'Electron, 2023', v: 166, u: 15}];
const pad3 = v => ('00' + v).slice(-3);
const sig = r => (CAND - r.v) / r.u;
const lies = r => { const z = sig(r); return Math.abs(z).toFixed(1) + ' standard uncertainties ' + (z >= 0 ? 'above' : 'below'); };
$('#plottable tbody').innerHTML = MEAS.filter(r => r.label).map(r => '<tr><td class="q">' + r.label + '</td><td class="n" data-l="Value">137.035 999 ' + pad3(r.v) + '(' + r.u + ')</td><td data-l="Candidate lies">' + lies(r) + '</td></tr>').join('') +
  '<tr><td class="q">Chain Theory candidate</td><td class="n" data-l="Value">' + grp(INV.toFixed(12)) + '</td><td></td></tr>';

function drawPlot() {
  const box = $('#plot'), W = Math.max(260, Math.floor(box.clientWidth - 12));
  const left = W < 430 ? 112 : 140, right = 52, top = 30, rowH = 30, headH = 28, X0 = 0, X1 = 250;
  const x = v => left + (v - X0) / (X1 - X0) * (W - left - right);
  let y = top; const rows = [];
  MEAS.forEach(r => { if (r.group) { rows.push({r, y: y + 18}); y += headH; } else { rows.push({r, y: y + rowH / 2}); y += rowH; } });
  const plotBottom = y + 4, H = plotBottom + 44;
  box.textContent = '';
  const svg = svgEl('svg', {width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Measured values of the inverse fine-structure constant against the Chain Theory candidate. The table under the chart gives the numbers.'}, box);
  for (let t = X0; t <= X1; t += 50) {
    svgEl('line', {'class': 'grid', x1: x(t), y1: top, x2: x(t), y2: plotBottom}, svg);
    const tx = svgEl('text', {'class': 'ax', x: x(t), y: plotBottom + 16, 'text-anchor': 'middle'}, svg); tx.textContent = pad3(t);
  }
  const at = svgEl('text', {'class': 'ax', x: (x(X0) + x(X1)) / 2, y: plotBottom + 34, 'text-anchor': 'middle'}, svg);
  at.textContent = W < 430 ? 'last digits of 137.035 999 …' : 'last three digits of 1/α = 137.035 999 …';
  svgEl('line', {'class': 'cand', x1: x(CAND), y1: top - 8, x2: x(CAND), y2: plotBottom}, svg);
  const cl = svgEl('text', {'class': 'cl', x: x(CAND) - 7, y: top - 12, 'text-anchor': 'end'}, svg); cl.textContent = 'Chain Theory candidate';
  let tip = null;
  const hide = () => { if (tip) { tip.remove(); tip = null; } };
  rows.forEach(({r, y: ry}) => {
    if (r.group) { const g = svgEl('text', {'class': 'gl', x: 8, y: ry}, svg); g.textContent = r.group; return; }
    const lb = svgEl('text', {'class': 'rl', x: 8, y: ry + 4.5}, svg); lb.textContent = r.label;
    svgEl('line', {'class': 'wh', x1: x(r.v - r.u), y1: ry, x2: x(r.v + r.u), y2: ry}, svg);
    svgEl('circle', {'class': 'pt', cx: x(r.v), cy: ry, r: 5.5}, svg);
    const z = sig(r), sg = svgEl('text', {'class': 'sg', x: W - 6, y: ry + 4}, svg); sg.textContent = (z >= 0 ? '+' : '−') + Math.abs(z).toFixed(1) + 'σ';
    const say = r.label + ': 1/α = 137.035 999 ' + pad3(r.v) + '(' + r.u + '). The candidate lies ' + lies(r) + ' it.';
    const hit = svgEl('rect', {'class': 'hit', x: 0, y: ry - rowH / 2, width: W, height: rowH, tabindex: 0, role: 'img', 'aria-label': say}, svg);
    const show = () => {
      hide();
      tip = document.createElement('div'); tip.className = 'tip'; tip.textContent = say; box.appendChild(tip);
      tip.style.left = clamp(x(r.v) - 110, 6, Math.max(6, W - 250)) + 'px'; tip.style.top = (ry + rowH / 2 + 12) + 'px';
    };
    hit.addEventListener('pointerenter', show); hit.addEventListener('pointerleave', hide);
    hit.addEventListener('focus', show); hit.addEventListener('blur', hide);
    hit.addEventListener('click', show);
  });
  box.onpointerleave = hide;
}
drawPlot();
let plotW = $('#plot').clientWidth;
if (window.ResizeObserver) new ResizeObserver(() => { const w = $('#plot').clientWidth; if (w !== plotW) { plotW = w; drawPlot(); } }).observe($('#plot'));

/* ---------- start ---------- */
$('#b-spin').setAttribute('aria-pressed', String(S.spin));
choose(CHART.indexOf(location.hash.slice(1)) >= 0 ? location.hash.slice(1) : 'electron', false);
window.__kit = {S, M, LK, look, clearLooks, choose, select, INV, NUMER, CAND, physics, render, rotX, rotY, mul, DATA}; /*TEST-HOOK*/
})();
