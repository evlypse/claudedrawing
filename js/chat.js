/* =====================================================
   chat.js — chat de la room
   Les invités envoient leur message à l'hôte, qui le diffuse à tous.
   (utilise isHost, hostConn, me, bcast de network.js)
   ===================================================== */
let chatOpen = false, unread = 0;

function chatInit(){
  $('chatToggle').onclick = () => setChat(!chatOpen);
  $('chatClose').onclick = () => setChat(false);
  $('chatForm').onsubmit = e => {
    e.preventDefault();
    const t = $('chatInput').value.trim();
    if (!t) return;
    $('chatInput').value = '';
    sendChat(t);
  };
}

function setChat(open){
  chatOpen = open;
  $('chatBox').hidden = !open;
  if (open){ unread = 0; updBadge(); $('chatInput').focus(); scrollChat(); }
}
function updBadge(){
  const b = $('chatBadge');
  b.hidden = !unread;
  b.textContent = unread > 9 ? '9+' : unread;
}

/* Envoi d'un message (depuis ce navigateur) */
function sendChat(text){
  text = text.slice(0, 300);
  if (isHost) hostChat(me.id, me.name, text);
  else if (hostConn && hostConn.open) hostConn.send({ t: 'chat', text });
}

/* Hôte : diffuse un message de joueur à tout le monde et l'affiche */
function hostChat(id, name, text){
  const m = { t: 'chat', id, name, text: String(text).slice(0, 300) };
  bcast(m); addChat(m);
}
/* Hôte : message système (arrivée / départ) */
function hostSys(text){
  const m = { t: 'chat', sys: true, text };
  bcast(m); addChat(m);
}

/* Affichage d'un message */
function addChat(m){
  const log = $('chatLog'), d = document.createElement('div');
  const mine = !m.sys && m.id === me.id;
  if (m.sys){
    d.className = 'cmsg sys'; d.textContent = m.text;
  } else {
    d.className = 'cmsg' + (mine ? ' mine' : '');
    const n = document.createElement('span');
    n.className = 'cname'; n.textContent = m.name; n.style.color = colorOf(m.id);
    const t = document.createElement('span');
    t.className = 'ctext'; t.textContent = m.text;
    d.append(n, t);
  }
  const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 60;
  log.appendChild(d);
  while (log.children.length > 100) log.removeChild(log.firstChild);
  if (atBottom || mine) scrollChat();
  if (!chatOpen && !m.sys && !mine){ unread++; updBadge(); }
}
function scrollChat(){ const l = $('chatLog'); l.scrollTop = l.scrollHeight; }
