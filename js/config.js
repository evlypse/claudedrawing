/* =====================================================
   config.js — constantes et petits utilitaires
   ===================================================== */
const $ = id => document.getElementById(id);

const W = 1200, H = 800;

const THEMES = ["Un chat astronaute","Une maison dans un arbre","Un petit monstre mignon","Pique-nique sous la pluie","Un dragon timide","Une ville la nuit","Un robot qui jardine","Un gâteau géant","Une sirène fatiguée","La forêt enchantée","Un voyage en train","Un château dans les nuages","Un renard et la lune","Un café cosy","Une île déserte","Un hibou lecteur","Le monstre sous le lit","Un jardin de fleurs étranges","Une baleine volante","Un sorcier en vacances","Un phare dans la tempête","Une fusée en papier","Un hérisson en pyjama","Un marché de nuit","Un bonhomme de neige au soleil","Une grenouille samouraï","Un pirate gourmand","Une planète inconnue","Un chat sur un nuage","Le roi des glaces","Un oiseau musicien","Une cabane secrète","Un poisson dans un bocal géant","Un champignon magique","Un super-héros raté","Une licorne en ville","Un dinosaure à la plage","Un ours qui fait du vélo","Un lapin magicien","Un volcan de bonbons","Un bateau dans le ciel","Une fée des cuisines","Un panda au karaoké","Un monde sous l'eau","Un escargot pressé","Un fantôme poli","Une rue sous la neige","Un tigre en origami","Un moulin à vent","Un oiseau de feu"];

const PALETTE = ['#000000','#4b5563','#9ca3af','#ffffff','#ef4444','#f97316','#facc15','#84cc16','#16a34a','#14b8a6','#0ea5e9','#2563eb','#7c3aed','#db2777','#92400e','#fbcfe8'];

const LAYER_COLORS = ['#2bd4a1','#19c3e6','#ff6fb1'];   // un repère de couleur par calque
const PLAYER_COLORS = ['#6c5ce7','#ff6fb1','#19c3e6','#ffb54d','#2bd4a1','#ef5da8','#4f8cff','#f97316'];

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

function toast(t){
  const d = document.createElement('div');
  d.className = 'toast'; d.textContent = t;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2600);
}
