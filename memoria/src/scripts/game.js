const emojis = ['🐶','🐱','🐭','🐰','🦊','🐻','🐸','🐵','🦁'];
let cards = [];
let revealed = [];
let matched = [];
let scores = [0, 0];
let currentTeam = 0; // 0: Team 1, 1: Team 2
let lock = false;
const grid = document.getElementById('card-grid');
const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');
const team1 = document.getElementById('team1');
const team2 = document.getElementById('team2');
const instructions = document.getElementById('instructions');
const winner = document.getElementById('winner');

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
  instructions.textContent = 'Team 1 starts! Click two cards to find a pair.';
  winner.textContent = '';
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
    matched.push(i1, i2);
    scores[currentTeam]++;
    updateScores();
    if (matched.length === cards.length) {
      endGame();
    } else {
      instructions.textContent = `Good job! Team ${currentTeam+1} gets another turn.`;
    }
    revealed = [];
    lock = false;
    renderGrid();
  } else {
    instructions.textContent = `No match! Now it's Team ${currentTeam===0?2:1}'s turn.`;
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
    winner.textContent = 'Team 1 wins! 🎉';
  } else if (scores[1] > scores[0]) {
    winner.textContent = 'Team 2 wins! 🎉';
  } else {
    winner.textContent = "It's a tie!";
  }
  instructions.textContent = 'Game over! Click "Restart Game" to play again.';
}

startGame();