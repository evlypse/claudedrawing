/* =====================================================
   network.js — room, connexion (PeerJS) et déroulement du jeu
   Architecture : l'hôte est le « serveur », les invités se connectent à lui.
   ===================================================== */
let peer, isHost = false, hostConn = null, conns = [], roomPw = '', roomCode = '';
let me = { id: '', name: '' }, players = [], scores = {}, rv = {};
let phase = 'lobby', curTheme = '', roundEnd = 0, tick, drawings = {}, votes = {}, voted = false, deck = [];

/* ---------- Utilitaires ---------- */
function lobbyErr(t){ $('err').textContent = t; }
function pseudo(){
  const v = $('pseudo').value.trim() || 'Artiste';
  try { localStorage.setItem('cdc-pseudo', v); } catch (e) {}
  return v;
}
function newCode(){
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '';
  for (let i = 0; i < 5; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

/* Durée choisie par l'hôte */
function getDur(){
  if ($('dur').value === 'custom') return Math.min(1800, Math.max(10, parseInt($('durCustom').value) || 60));
  return +$('dur').value;
}
function showIdleTime(){
  if (isHost && (phase === 'wait' || phase === 'results')){
    $('time').textContent = fmt(getDur());
    setProgress(100);
  }
}

/* ---------- Créer une room (hôte) ---------- */
function createRoom(){
  const pw = $('cPw').value.trim();
  if (!pw) return lobbyErr('Choisis un mot de passe pour ta room.');
  me.name = pseudo(); roomPw = pw; isHost = true; lobbyErr('');
  createPeer();
}
function createPeer(){
  roomCode = newCode();
  peer = new Peer('dessin-' + roomCode);
  peer.on('open', id => {
    me.id = id; players = [{ id, name: me.name }]; scores[id] = 0;
    hostListen(); enterGame(); setPhase('wait'); renderPlayers();
  });
  peer.on('error', e => {
    if (e.type === 'unavailable-id'){ peer.destroy(); createPeer(); }
    else lobbyErr('Erreur réseau : ' + e.type);
  });
}
function hostListen(){
  peer.on('connection', conn => {
    let ok = false;
    conn.on('data', d => {
      if (d.t === 'join'){
        if (d.pw !== roomPw){
          conn.send({ t: 'denied', why: 'Mot de passe incorrect.' });
          setTimeout(() => conn.close(), 400);
          return;
        }
        ok = true;
        const p = { id: conn.peer, name: (d.name || 'Joueur').slice(0, 16) };
        conns.push(conn); players.push(p); scores[p.id] = scores[p.id] || 0;
        conn.send({ t: 'welcome' });
        pushPlayers();
        hostSys(p.name + ' a rejoint la room');
        if (phase === 'draw') conn.send({ t: 'round', theme: curTheme, dur: Math.max(1, Math.round((roundEnd - Date.now()) / 1000)) });
      }
      else if (!ok) return;
      else if (d.t === 'drawing'){ drawings[conn.peer] = d.img; checkAll(); }
      else if (d.t === 'vote') handleVote(conn.peer, d.for);
      else if (d.t === 'chat'){
        const p = players.find(x => x.id === conn.peer);
        if (p && typeof d.text === 'string' && d.text.trim()) hostChat(p.id, p.name, d.text.trim());
      }
    });
    conn.on('close', () => {
      const p = players.find(x => x.id === conn.peer);
      conns = conns.filter(c => c !== conn);
      players = players.filter(x => x.id !== conn.peer);
      pushPlayers();
      if (ok && p) hostSys(p.name + ' a quitté la room');
      checkAll();
    });
  });
}
function bcast(m){ conns.forEach(c => c.open && c.send(m)); }
function pushPlayers(){ bcast({ t: 'players', players, scores }); renderPlayers(); }

/* ---------- Rejoindre une room (invité) ---------- */
function joinRoom(){
  const code = $('jCode').value.trim().toUpperCase(), pw = $('jPw').value.trim();
  if (code.length !== 5) return lobbyErr('Le code de la room fait 5 caractères.');
  if (!pw) return lobbyErr('Entre le mot de passe.');
  me.name = pseudo(); roomCode = code; lobbyErr('Connexion…');
  peer = new Peer();
  const to = setTimeout(() => lobbyErr('Impossible de joindre la room (délai dépassé).'), 12000);
  peer.on('error', e => {
    clearTimeout(to);
    lobbyErr(e.type === 'peer-unavailable' ? 'Room introuvable.' : 'Erreur réseau : ' + e.type);
  });
  peer.on('open', id => {
    me.id = id;
    hostConn = peer.connect('dessin-' + code, { reliable: true });
    hostConn.on('open', () => hostConn.send({ t: 'join', pw, name: me.name }));
    hostConn.on('data', d => { clearTimeout(to); guestMsg(d); });
    hostConn.on('close', () => {
      if (phase !== 'lobby'){ alert("L'hôte a quitté la room."); location.reload(); }
    });
  });
}
function guestMsg(d){
  if (d.t === 'denied'){ lobbyErr(d.why); hostConn.close(); phase = 'lobby'; }
  else if (d.t === 'welcome'){ enterGame(); setPhase('wait'); }
  else if (d.t === 'players'){ players = d.players; scores = d.scores; renderPlayers(); }
  else if (d.t === 'round') startRound(d.theme, d.dur);
  else if (d.t === 'results'){ setPhase('results'); renderResults(d.items); }
  else if (d.t === 'scores'){ scores = d.scores; rv = d.rv; renderPlayers(); updateHearts(); }
  else if (d.t === 'chat') addChat(d);
}

function enterGame(){
  $('lobby').hidden = true; $('game').hidden = false; $('chat').hidden = false;
  $('roomCode').textContent = roomCode; $('hostPanel').hidden = !isHost;
  setColor(color); renderLayers();
}
function renderPlayers(){
  $('players').innerHTML = '';
  players.forEach((p, i) => {
    const d = document.createElement('div');
    d.className = 'chip' + (p.id === me.id ? ' me' : '');
    d.style.setProperty('--c', colorOf(p.id));
    d.innerHTML = `<span class="av">${esc((p.name[0] || '?').toUpperCase())}</span><span>${esc(p.name)}</span><span class="pt">${scores[p.id] || 0} pt</span>` + (i === 0 ? '<span class="tag">Hôte</span>' : '');
    $('players').appendChild(d);
  });
}

/* ---------- Phases du jeu ---------- */
function setPhase(p){
  phase = p;
  const msgs = {
    wait: isHost ? 'Choisis la durée et le thème, puis lance le round.' : "En attente de l'hôte…",
    collect: 'Envoi des dessins…'
  };
  $('overlay').hidden = !(p in msgs); $('ovMsg').textContent = msgs[p] || '';
  $('results').hidden = p !== 'results';
  document.body.classList.toggle('in-results', p === 'results');
  $('startBtn').disabled = !(p === 'wait' || p === 'results');
  $('startBtn').textContent = p === 'wait' ? 'Lancer le round' : 'Thème suivant';
  if (p === 'results' || p === 'wait'){
    $('timer').classList.remove('low');
    if (p === 'wait') $('time').textContent = isHost ? fmt(getDur()) : '—:——';
    showIdleTime();
  }
}

function startRoundClick(){
  if (!isHost || !(phase === 'wait' || phase === 'results')) return;
  let t = $('customTheme').value.trim(); $('customTheme').value = '';
  if (!t) t = pickTheme();
  const dur = getDur();
  drawings = {}; votes = {}; rv = {};
  bcast({ t: 'round', theme: t, dur }); startRound(t, dur);
}
function startRound(theme, dur){
  endStroke(); clearAll(); voted = false; curTheme = theme;
  $('theme').textContent = theme; setPhase('draw');
  const end = roundEnd = Date.now() + dur * 1000;
  clearInterval(tick);
  const upd = () => {
    const left = Math.max(0, end - Date.now()), s = Math.ceil(left / 1000);
    $('time').textContent = fmt(s);
    setProgress(left / (dur * 1000) * 100);
    $('timer').classList.toggle('low', s <= 10);
    if (left <= 0){ clearInterval(tick); endRound(); }
  };
  upd(); tick = setInterval(upd, 200);
}
function endRound(){
  endStroke(); setPhase('collect');
  const img = flatten();
  if (isHost){ drawings[me.id] = img; setTimeout(publish, 6000); checkAll(); }
  else hostConn.send({ t: 'drawing', img });
}
function checkAll(){
  if (isHost && phase === 'collect' && players.every(p => drawings[p.id])) publish();
}
function publish(){
  if (!isHost || phase !== 'collect') return;
  const items = players.filter(p => drawings[p.id]).map(p => ({ id: p.id, name: p.name, img: drawings[p.id] }));
  bcast({ t: 'results', items }); setPhase('results'); renderResults(items);
}

/* ---------- Votes & résultats ---------- */
function handleVote(voter, forId){
  if (phase !== 'results' || voter === forId || votes[voter] || !players.some(p => p.id === forId)) return;
  votes[voter] = forId;
  scores[forId] = (scores[forId] || 0) + 1;
  rv[forId] = (rv[forId] || 0) + 1;
  bcast({ t: 'scores', scores, rv }); renderPlayers(); updateHearts();
}
function renderResults(items){
  const r = $('results');
  r.innerHTML = '<h3>Thème : ' + esc(curTheme) + '</h3><p class="hint">Votez pour le dessin que vous préférez.</p><div class="grid"></div>';
  const g = r.querySelector('.grid');
  items.forEach(it => {
    const d = document.createElement('div');
    d.className = 'res'; d.style.setProperty('--c', colorOf(it.id));
    d.innerHTML = `<img src="${it.img}" alt=""><div class="row"><span class="nm">${esc(it.name)}${it.id === me.id ? ' (toi)' : ''}</span><span class="cnt" data-id="${it.id}"></span></div>`;
    const row = d.querySelector('.row');
    if (it.id !== me.id){
      const b = document.createElement('button');
      b.textContent = '♥ Voter'; b.className = 'heart'; b.dataset.id = it.id;
      b.onclick = () => {
        if (voted) return;
        voted = true;
        isHost ? handleVote(me.id, it.id) : hostConn.send({ t: 'vote', for: it.id });
        document.querySelectorAll('.heart').forEach(x => x.disabled = true);
      };
      row.appendChild(b);
    }
    const a = document.createElement('a');
    a.href = it.img; a.download = 'dessin-' + it.name + '.jpg'; a.textContent = 'Enregistrer';
    row.appendChild(a);
    g.appendChild(d);
  });
  if (isHost){
    const nb = document.createElement('button');
    nb.id = 'nextBtn'; nb.type = 'button'; nb.className = 'next'; nb.textContent = 'Thème suivant';
    nb.onclick = startRoundClick;
    r.appendChild(nb);
  }
  updateHearts();
}
function updateHearts(){
  document.querySelectorAll('.cnt').forEach(s => {
    const n = rv[s.dataset.id] || 0;
    s.textContent = n ? '♥ ' + n : '';
  });
}
