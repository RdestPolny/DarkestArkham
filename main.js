const heroListElement = document.querySelector('.hero-list');
const teamListElement = document.querySelector('.team-list');
const confirmBtn = document.getElementById('confirm');
const cancelBtn = document.getElementById('cancel');

let availableHeroes = [];
let selectedHeroes = new Set();
let playerParty = [];

function loadParty() {
  const saved = localStorage.getItem('playerParty');
  if (saved) {
    try {
      playerParty = JSON.parse(saved);
    } catch (e) {
      playerParty = [];
    }
  }
}

function saveParty() {
  localStorage.setItem('playerParty', JSON.stringify(playerParty));
}

function loadHeroes() {
  return fetch('data/heroes.json')
    .then((res) => res.json())
    .then((data) => {
      availableHeroes = data;
      renderHeroList();
      renderTeamList();
    });
}

function createHeroCard(hero, withCheckbox = false) {
  const card = document.createElement('div');
  card.className = 'hero-card';
  const image = hero.portrait
    ? `<img src="${hero.portrait}" alt="${hero.name}">`
    : `<div class="portrait-placeholder">${hero.name.charAt(0)}</div>`;
  card.innerHTML = `
    ${image}
    <div>
      <h3>${hero.name}</h3>
      <p>Klasa: ${hero.class}</p>
      <p>Atak: ${hero.attack} Obrona: ${hero.defense} HP: ${hero.max_health}</p>
    </div>
  `;
  if (withCheckbox) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', () => handleSelect(hero, checkbox));
    card.appendChild(checkbox);
  } else {
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Usuń';
    removeBtn.addEventListener('click', () => removeFromParty(hero));
    card.appendChild(removeBtn);
  }
  return card;
}

function renderHeroList() {
  heroListElement.innerHTML = '';
  availableHeroes.forEach((hero) => {
    if (playerParty.find((h) => h.id === hero.id)) {
      return; // skip already recruited
    }
    heroListElement.appendChild(createHeroCard(hero, true));
  });
}

function renderTeamList() {
  teamListElement.innerHTML = '';
  playerParty.forEach((hero) => {
    teamListElement.appendChild(createHeroCard(hero, false));
  });
}

function handleSelect(hero, checkbox) {
  if (checkbox.checked) {
    if (selectedHeroes.size >= 4) {
      checkbox.checked = false;
      alert('Możesz wybrać maksymalnie 4 bohaterów.');
      return;
    }
    selectedHeroes.add(hero);
  } else {
    selectedHeroes.delete(hero);
  }
}

function removeFromParty(hero) {
  playerParty = playerParty.filter((h) => h.id !== hero.id);
  saveParty();
  renderHeroList();
  renderTeamList();
}

confirmBtn.addEventListener('click', () => {
  playerParty = [...playerParty, ...selectedHeroes];
  selectedHeroes.clear();
  saveParty();
  renderHeroList();
  renderTeamList();
});

cancelBtn.addEventListener('click', () => {
  selectedHeroes.clear();
  document
    .querySelectorAll('.hero-card input[type="checkbox"]')
    .forEach((c) => (c.checked = false));
});

loadParty();
loadHeroes();
