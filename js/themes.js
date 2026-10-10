/* =====================================================
   themes.js — générateur de thèmes aléatoires
   Combine un sujet + un lieu / une action / un accessoire.
   Tout reste simple à dessiner, et on obtient plus de 3 000 thèmes.
   (utilise THEMES de config.js)
   ===================================================== */
const GEN = {
  living: [
    "un chat","un chien","un lapin","un ours","un renard","un hibou","une grenouille","une tortue","un poisson","un oiseau",
    "un cochon","une vache","un cheval","un éléphant","une girafe","un pingouin","un lion","une souris","un canard","une abeille",
    "un escargot","un dauphin","un hérisson","un singe","un panda","une licorne","un dragon","un robot","un fantôme","un monstre",
    "un pirate","un astronaute","un sorcier","une sirène","un clown","un chevalier","un ninja","une princesse","un bonhomme de neige",
    "un dinosaure","un extraterrestre"
  ],
  things: [
    "une maison","un arbre","une voiture","un bateau","un avion","une fusée","un vélo","un train","un château","une fleur",
    "un gâteau","une pizza","une glace","un burger","un cupcake","une pomme","un champignon","une lampe","une chaise","un livre",
    "une horloge","une guitare","un ballon","un cadeau","une tasse","un parapluie","une montgolfière","une tente","un phare","un moulin"
  ],
  actions: [
    "qui dort","qui danse","qui mange une glace","qui fait du vélo","qui chante","qui court","qui vole","qui lit un livre","qui nage",
    "qui fait du skate","qui joue de la guitare","qui mange une pizza","qui boit un café","qui saute","qui prend un bain",
    "qui fait un gâteau","qui regarde les étoiles","qui fait du surf","qui fait de la magie","qui pêche","qui cuisine","qui rit",
    "qui a peur","qui a faim","qui fait la fête"
  ],
  places: [
    "sur la plage","dans l'espace","sous la pluie","sous la neige","dans la forêt","sur la lune","au soleil","la nuit","sur un nuage",
    "dans le désert","à la montagne","dans un jardin","sous l'eau","en ville","dans la jungle","sur une île","à la campagne","en hiver",
    "en été","à la fête foraine","dans la cuisine","au bord de la mer","dans un parc"
  ],
  accessories: [
    "un chapeau","des lunettes","une écharpe","un parapluie","un ballon","une couronne","un sac à dos","un nœud papillon","une cape",
    "une cravate","un casque","des bottes","un gâteau","une fleur","une canne à pêche"
  ]
};

const recentThemes = [];

function rnd(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

/* Un thème généré (jamais deux fois le même d'affilée) */
function generateTheme(){
  const r = Math.random();
  if (r < 0.30) return cap(rnd(GEN.living) + ' ' + rnd(GEN.places));
  if (r < 0.60) return cap(rnd(GEN.living) + ' ' + rnd(GEN.actions));
  if (r < 0.80) return cap(rnd(GEN.living) + ' avec ' + rnd(GEN.accessories));
  return cap(rnd(GEN.things) + ' ' + rnd(GEN.places));
}

/* Thème pour le round : 30 % de classiques, 70 % de combinaisons, sans répétition récente */
function pickTheme(){
  let t = '';
  for (let i = 0; i < 12; i++){
    t = Math.random() < 0.30 ? rnd(THEMES) : generateTheme();
    if (!recentThemes.includes(t.toLowerCase())) break;
  }
  recentThemes.push(t.toLowerCase());
  if (recentThemes.length > 60) recentThemes.shift();
  return t;
}
