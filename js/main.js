/* =====================================================
   main.js — branche l'interface et démarre l'appli
   (chargé en dernier)
   ===================================================== */
(function init(){
  /* pseudo mémorisé */
  try { $('pseudo').value = localStorage.getItem('cdc-pseudo') || ''; } catch (e) {}

  /* lobby + hôte */
  $('btnCreate').onclick = createRoom;
  $('btnJoin').onclick = joinRoom;
  $('startBtn').onclick = startRoundClick;
  $('copyBtn').onclick = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(roomCode);
    toast('Code copié');
  };
  $('dur').onchange = () => { $('durCustom').hidden = $('dur').value !== 'custom'; showIdleTime(); };
  $('durCustom').oninput = showIdleTime;

  /* raccourcis clavier */
  const KEYS = { b: 'brush', e: 'eraser', f: 'fill', l: 'line', r: 'rect', o: 'ellipse', t: 'triangle' };
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'){ e.preventDefault(); doUndo(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = KEYS[e.key.toLowerCase()];
    if (t && !$('game').hidden) selectTool(t);
  });

  /* état initial de l'interface */
  chatInit();
  renderRecent();
  setColor(color);
  renderLayers();
})();
