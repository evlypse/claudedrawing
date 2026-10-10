/* =====================================================
   config.js — constantes et petits utilitaires
   ===================================================== */
const $ = id => document.getElementById(id);

const W = 1200, H = 800;

/* Thèmes simples et assez larges : faciles à dessiner en peu de temps */
const THEMES = [
  /* animaux */
  "Un chat","Un chien","Un poisson","Un oiseau","Un lapin","Une tortue","Un éléphant","Un papillon",
  "Un escargot","Une grenouille","Un cheval","Un hérisson","Un canard","Un ours","Une girafe","Un pingouin",
  "Un hibou","Une abeille","Un renard","Un dauphin","Une souris","Un cochon","Une vache","Un lion",
  /* nature */
  "Un arbre","Une fleur","Le soleil","La lune","Un nuage","Un arc-en-ciel","Une montagne","La mer",
  "Une île","Un champignon","Un volcan","Une forêt","Une étoile","La pluie","La neige","Un cactus",
  "Une plage","Un jardin","L'automne","L'été",
  /* objets et maison */
  "Une maison","Un château","Un bateau","Une voiture","Un avion","Une fusée","Un vélo","Un train",
  "Un parapluie","Une lampe","Une chaise","Un livre","Une horloge","Un téléphone","Un ballon","Un cadeau",
  "Des lunettes","Une guitare","Un chapeau","Une clé","Une tasse","Un sac à dos","Une bougie","Une montre",
  /* nourriture */
  "Une pizza","Un gâteau","Une glace","Une pomme","Un burger","Une banane","Un café","Des cerises",
  "Une pastèque","Un cupcake","Des sushis","Une carotte","Un croissant","Des fraises","Un ananas",
  /* personnages */
  "Un robot","Un fantôme","Un monstre","Un pirate","Un dragon","Un astronaute","Un clown","Un sorcier",
  "Une sirène","Un bonhomme de neige","Un chevalier","Un ninja","Une princesse","Un super-héros",
  /* idées larges */
  "Les vacances","Un anniversaire","Une ville","La nuit","Un voyage","L'école","Un pique-nique","Une fête",
  "Un sport","La musique","Un rêve","Un trésor"
];

const PALETTE = ['#000000','#4b5563','#9ca3af','#ffffff','#ef4444','#f97316','#facc15','#84cc16','#16a34a','#14b8a6','#0ea5e9','#2563eb','#7c3aed','#db2777','#92400e','#fbcfe8'];

const LAYER_COLORS = ['#8cc49a','#6fb8a8','#e6879a'];   // un repère de couleur par calque
const PLAYER_COLORS = ['#dd6f50','#d4849a','#5fae9e','#dfa24f','#8fb06a','#b9806b','#6d9ac2','#a98ad0'];

const IC_EYE = '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const IC_EYEOFF = '<svg viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4M6.5 6.6A17 17 0 002 12s3.6 7 10 7a9.5 9.5 0 004.2-1M9.9 9.9a3 3 0 004.2 4.2"/></svg>';

/* Couleur stable associée à un joueur (même rendu chez tout le monde) */
function colorOf(id){
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PLAYER_COLORS[h % PLAYER_COLORS.length];
}

function esc(s){
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function fmt(s){ return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

/* Anneau du chrono : p = pourcentage de temps restant (0 à 100) */
function setProgress(p){
  $('ring').style.setProperty('--p', Math.max(0, Math.min(100, p)).toFixed(1));
}

function toast(t){
  const d = document.createElement('div');
  d.className = 'toast'; d.textContent = t;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2600);
}
