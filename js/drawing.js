/* =====================================================
   drawing.js — canvas, outils, calques, couleurs
   (dépend de config.js ; lit la variable `phase` de network.js)
   ===================================================== */
const layers = [...document.querySelectorAll('.layer')];
const ctxs = layers.map(c => c.getContext('2d', { willReadFrequently: true }));
const prev = $('preview'), pctx = prev.getContext('2d');

let tool = 'brush', color = '#000000', size = 8, opacity = 1, active = 0;
let hidden = [false, false, false];
const undo = [[], [], []];
let drawing = false, start, last, lastMid;

/* ---------- Utilitaires de tracé ---------- */
function pos(e){
  const r = prev.getBoundingClientRect();
  return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
}
function pushUndo(){
  const s = undo[active];
  s.push(ctxs[active].getImageData(0, 0, W, H));
  if (s.length > (COARSE ? 6 : 15)) s.shift();
}
function setupCtx(c, col){
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.lineWidth = size; c.strokeStyle = col; c.fillStyle = col;
}
function seg(c, p){
  const m = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
  c.beginPath(); c.moveTo(lastMid.x, lastMid.y);
  c.quadraticCurveTo(last.x, last.y, m.x, m.y); c.stroke();
  lastMid = m; last = p;
}
function dot(c, p){ c.beginPath(); c.arc(p.x, p.y, size / 2, 0, Math.PI * 2); c.fill(); }
function shape(c, a, b){
  const fill = $('fillShape').checked;
  c.beginPath();
  if (tool === 'line'){ c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); return; }
  if (tool === 'rect') c.rect(a.x, a.y, b.x - a.x, b.y - a.y);
  if (tool === 'ellipse') c.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
  if (tool === 'triangle'){ c.moveTo((a.x + b.x) / 2, a.y); c.lineTo(b.x, b.y); c.lineTo(a.x, b.y); c.closePath(); }
  fill ? c.fill() : c.stroke();
}

/* ---------- Remplissage (seau) ----------
   La zone est détectée sur l'image visible (tous calques confondus),
   la couleur est peinte sur le calque actif. */
function hexRgb(h){ const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function composite(){
  const t = document.createElement('canvas'); t.width = W; t.height = H;
  const c = t.getContext('2d', { willReadFrequently: true });
  c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
  layers.forEach((l, i) => { if (!hidden[i]) c.drawImage(l, 0, 0); });
  return c.getImageData(0, 0, W, H).data;
}
function floodFill(p){
  const x0 = Math.floor(p.x), y0 = Math.floor(p.y);
  if (x0 < 0 || y0 < 0 || x0 >= W || y0 >= H) return;
  const src = composite(), i0 = (y0 * W + x0) * 4, r0 = src[i0], g0 = src[i0 + 1], b0 = src[i0 + 2];
  const dist = i => Math.abs(src[i] - r0) + Math.abs(src[i + 1] - g0) + Math.abs(src[i + 2] - b0);
  const mask = new Uint8Array(W * H), stack = new Int32Array(W * H);
  let sp = 0;
  stack[sp++] = y0 * W + x0; mask[y0 * W + x0] = 1;
  while (sp){
    const idx = stack[--sp], x = idx % W, y = (idx / W) | 0;
    if (x > 0 && !mask[idx - 1] && dist((idx - 1) * 4) <= 60){ mask[idx - 1] = 1; stack[sp++] = idx - 1; }
    if (x < W - 1 && !mask[idx + 1] && dist((idx + 1) * 4) <= 60){ mask[idx + 1] = 1; stack[sp++] = idx + 1; }
    if (y > 0 && !mask[idx - W] && dist((idx - W) * 4) <= 60){ mask[idx - W] = 1; stack[sp++] = idx - W; }
    if (y < H - 1 && !mask[idx + W] && dist((idx + W) * 4) <= 60){ mask[idx + W] = 1; stack[sp++] = idx + W; }
  }
  /* léger débordement pour couvrir les bords lissés des traits, sans manger le cœur des lignes */
  for (let k = 0; k < 2; k++){
    const m2 = mask.slice();
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++){
      const i = y * W + x;
      if (!mask[i] && (mask[i - 1] || mask[i + 1] || mask[i - W] || mask[i + W]) && dist(i * 4) <= 380) m2[i] = 1;
    }
    mask.set(m2);
  }
  const [fr, fg, fb] = hexRgb(color), out = new ImageData(W, H), d = out.data;
  for (let i = 0; i < mask.length; i++) if (mask[i]){ const j = i * 4; d[j] = fr; d[j + 1] = fg; d[j + 2] = fb; d[j + 3] = 255; }
  const t = document.createElement('canvas'); t.width = W; t.height = H;
  t.getContext('2d').putImageData(out, 0, 0);
  const c = ctxs[active]; c.globalAlpha = opacity; c.drawImage(t, 0, 0); c.globalAlpha = 1;
}

/* ---------- Événements du pinceau ---------- */
prev.addEventListener('pointerdown', e => {
  if (phase !== 'draw') return;
  if (hidden[active]){ toast('Ce calque est masqué'); return; }
  const p = pos(e);
  if (tool === 'fill'){ pushUndo(); floodFill(p); pushRecent(color); return; }
  prev.setPointerCapture(e.pointerId);
  drawing = true; start = last = lastMid = p; pushUndo();
  if (tool === 'eraser'){
    const c = ctxs[active]; c.globalCompositeOperation = 'destination-out'; setupCtx(c, '#000'); dot(c, start);
  } else {
    prev.style.opacity = opacity; setupCtx(pctx, color);
    if (tool === 'brush') dot(pctx, start);
  }
});
prev.addEventListener('pointermove', e => {
  if (!drawing) return;
  const p = pos(e);
  if (tool === 'eraser') seg(ctxs[active], p);
  else if (tool === 'brush') seg(pctx, p);
  else { pctx.clearRect(0, 0, W, H); setupCtx(pctx, color); shape(pctx, start, p); }
});
function endStroke(){
  if (!drawing) return;
  drawing = false;
  if (tool === 'eraser') ctxs[active].globalCompositeOperation = 'source-over';
  else {
    const c = ctxs[active]; c.globalAlpha = opacity; c.drawImage(prev, 0, 0); c.globalAlpha = 1;
    pushRecent(color);
  }
  pctx.clearRect(0, 0, W, H); prev.style.opacity = 1;
}
prev.addEventListener('pointerup', endStroke);
prev.addEventListener('pointercancel', endStroke);

function clearAll(){ ctxs.forEach(c => c.clearRect(0, 0, W, H)); undo.forEach(u => u.length = 0); }
function flatten(){
  const t = document.createElement('canvas'); t.width = W; t.height = H;
  const c = t.getContext('2d');
  c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
  layers.forEach((l, i) => { if (!hidden[i]) c.drawImage(l, 0, 0); });
  return t.toDataURL('image/jpeg', .85);
}
function doUndo(){
  if (phase !== 'draw') return;
  const s = undo[active];
  if (s.length) ctxs[active].putImageData(s.pop(), 0, 0);
}

/* ---------- Outils ---------- */
function selectTool(t){
  tool = t;
  document.querySelectorAll('.tool').forEach(x => x.classList.toggle('on', x.dataset.tool === t));
}
document.querySelectorAll('.tool').forEach(b => b.onclick = () => selectTool(b.dataset.tool));

/* ---------- Couleurs (palette + récentes) ---------- */
function hexToRgb(h){ const n = parseInt(h.slice(1), 16); return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`; }
function markSwatches(){
  document.querySelectorAll('.sw').forEach(s => s.classList.toggle('on', s.style.background === hexToRgb(color)));
}
function setColor(c){ color = c.toLowerCase(); $('color').value = color; markSwatches(); }

PALETTE.forEach(c => {
  const b = document.createElement('button');
  b.className = 'sw'; b.style.background = c; b.title = c;
  b.onclick = () => setColor(c);
  $('pal').appendChild(b);
});

let recent = [];
try {
  recent = JSON.parse(localStorage.getItem('cdc-recent') || '[]').filter(c => /^#[0-9a-f]{6}$/i.test(c)).slice(0, 8);
} catch (e) { recent = []; }

function pushRecent(c){
  c = c.toLowerCase();
  recent = [c, ...recent.filter(x => x !== c)].slice(0, 8);
  try { localStorage.setItem('cdc-recent', JSON.stringify(recent)); } catch (e) {}
  renderRecent();
}
function renderRecent(){
  const box = $('recent'); box.innerHTML = '';
  if (!recent.length){ box.innerHTML = '<span class="empty">Les couleurs que tu utilises apparaîtront ici</span>'; return; }
  recent.forEach(c => {
    const b = document.createElement('button');
    b.className = 'sw'; b.style.background = c; b.title = c;
    b.onclick = () => setColor(c);
    box.appendChild(b);
  });
  markSwatches();
}

$('color').oninput = e => setColor(e.target.value);
$('size').oninput = e => { size = +e.target.value; $('sizeVal').textContent = size + ' px'; };
$('opacity').oninput = e => { opacity = e.target.value / 100; $('opVal').textContent = e.target.value + ' %'; };

/* ---------- Calques ---------- */
function renderLayers(){
  const box = $('layerList'); box.innerHTML = '';
  for (let i = 2; i >= 0; i--){
    const d = document.createElement('div');
    d.className = 'lay' + (i === active ? ' on' : '');
    d.style.setProperty('--lc', LAYER_COLORS[i]);
    d.innerHTML = `<span>Calque ${i + 1}</span>`;
    const eye = document.createElement('button');
    eye.className = 'eye'; eye.title = hidden[i] ? 'Afficher' : 'Masquer';
    eye.innerHTML = hidden[i] ? IC_EYEOFF : IC_EYE;
    eye.onclick = ev => { ev.stopPropagation(); hidden[i] = !hidden[i]; layers[i].style.display = hidden[i] ? 'none' : ''; renderLayers(); };
    d.appendChild(eye);
    d.onclick = () => { active = i; renderLayers(); };
    box.appendChild(d);
  }
}
$('undoBtn').onclick = doUndo;
$('clearBtn').onclick = () => { if (phase !== 'draw') return; pushUndo(); ctxs[active].clearRect(0, 0, W, H); };

/* ---------- Confort tactile (téléphone / tablette) ---------- */
const COARSE = !!(window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
if (COARSE){
  size = 18; $('size').value = 18; $('sizeVal').textContent = '18 px';   // trait plus épais : le canvas est réduit sur petit écran
}
prev.addEventListener('contextmenu', e => e.preventDefault());
$('undoBtn2').onclick = doUndo;
$('clearBtn2').onclick = () => { if (phase !== 'draw') return; pushUndo(); ctxs[active].clearRect(0, 0, W, H); };
