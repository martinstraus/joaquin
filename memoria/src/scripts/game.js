const emojis = ['🐶','🐱','🐭','🐰','🦊','🐻','🐸','🐵','🦁'];
let cards = [];
let revealed = [];
let matched = [];
let scores = [0, 0];
let currentTeam = 0; // 0: Team 1, 1: Team 2
let lock = false;
const grid = document.getElementById('card-grid');
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');
const team1 = document.getElementById('team1');
const team2 = document.getElementById('team2');
const instructions = document.getElementById('instructions');
const winner = document.getElementById('winner');
const players = ['Joaquín', 'Martín'];
const flipSound = new Audio('./sounds/flip_card.mp3');
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startGame() {
  // Prepare cards
  cards = shuffle([...emojis, ...emojis]);
  revealed = [];
  matched = [];
  scores = [0, 0];
  currentTeam = 0;
  lock = false;
  score1.textContent = '0';
  score2.textContent = '0';
  team1.classList.add('active');
  team2.classList.remove('active');
  instructions.textContent = `¡Empieza ${players[0]}!`;
  winner.textContent = '';
  player1.textContent = players[0];
  player2.textContent = players[1];
  renderGrid();
}

function renderGrid() {
  grid.innerHTML = '';
  for (let i = 0; i < cards.length; i++) {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.dataset.index = i;
    if (matched.includes(i)) {
      btn.classList.add('matched');
      btn.textContent = cards[i];
      btn.disabled = true;
    } else if (revealed.includes(i)) {
      btn.classList.add('revealed');
      btn.textContent = cards[i];
      btn.disabled = true;
    } else {
      btn.textContent = '';
      btn.disabled = lock;
      btn.onclick = () => revealCard(i);
    }
    grid.appendChild(btn);
  }
}

function revealCard(idx) {
  if (lock || revealed.includes(idx) || matched.includes(idx)) return;
  flipSound.currentTime = 0;
  flipSound.play();
  revealed.push(idx);
  renderGrid();
  if (revealed.length === 2) {
    lock = true;
    setTimeout(checkMatch, 800);
  }
}

function checkMatch() {
  const [i1, i2] = revealed;
  if (cards[i1] === cards[i2]) {
    // Play match sound
    const matchSound = new Audio('./sounds/match.mp3');
    matchSound.currentTime = 0;
    matchSound.play();
    matched.push(i1, i2);
    scores[currentTeam]++;
    updateScores();
    if (matched.length === cards.length) {
      endGame();
    } else {
      instructions.textContent = `¡Buen trabajo! ${players[currentTeam]} suma 1 punto y sigue jugando.`;
    }
    revealed = [];
    lock = false;
    renderGrid();
  } else {
    const matchSound = new Audio('./sounds/error.mp3');
    matchSound.currentTime = 0;
    matchSound.play();
    instructions.textContent = `¡No hay coincidencia! Ahora le toca a ${players[currentTeam]}.`;
    setTimeout(() => {
      revealed = [];
      currentTeam = 1 - currentTeam;
      updateActiveTeam();
      lock = false;
      renderGrid();
    }, 900);
  }
}

function updateScores() {
  score1.textContent = scores[0];
  score2.textContent = scores[1];
}

function updateActiveTeam() {
  if (currentTeam === 0) {
    team1.classList.add('active');
    team2.classList.remove('active');
  } else {
    team2.classList.add('active');
    team1.classList.remove('active');
  }
}

function endGame() {
  lock = true;
  if (scores[0] > scores[1]) {
    winner.textContent = `¡Ganó ${players[0]} 🎉`;
  } else if (scores[1] > scores[0]) {
    winner.textContent = `¡Ganó ${players[1]}! 🎉`;
  } else {
    winner.textContent = "¡Empate!";
  }
  instructions.textContent = '¡Fin del juego!';
}

startGame();