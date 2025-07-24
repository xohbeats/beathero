const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const audio = new Audio('audio/beathero.mp3');
let analyser, dataArray, source, audioCtx;
let difficulty = 'easy';

const notes = [];
let score = 0;
let highScore = localStorage.getItem('beatHeroHighScore') || 0;
let lives = 3;
let playing = false;

function startGame(selectedDifficulty) {
  document.getElementById('startScreen').style.display = 'none';
  difficulty = selectedDifficulty;
  score = 0;
  lives = 3;
  notes.length = 0;
  setupAudio();
  playing = true;
  audio.play();
  animate();
}

function setupAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  source = audioCtx.createMediaElementSource(audio);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

function spawnNote() {
  const lane = Math.floor(Math.random() * 4);
  notes.push({ y: 0, lane });
}

function drawLanes() {
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#333';
    ctx.fillRect(i * 200, 0, 200, canvas.height);
  }
}

function drawNotes() {
  ctx.fillStyle = '#0ff';
  notes.forEach(note => {
    ctx.fillRect(note.lane * 200 + 80, note.y, 40, 20);
  });
}

function drawScore() {
  ctx.fillStyle = '#fff';
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`High Score: ${highScore}`, 20, 60);
  ctx.fillText(`Lives: ${lives}`, 20, 90);
}

function updateNotes() {
  notes.forEach(note => {
    note.y += 5;
    if (note.y > canvas.height) {
      lives--;
      notes.splice(notes.indexOf(note), 1);
    }
  });
}

function checkBeat() {
  analyser.getByteFrequencyData(dataArray);
  const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
  if (average > (difficulty === 'easy' ? 180 : difficulty === 'medium' ? 150 : 120)) {
    spawnNote();
  }
}

function animate() {
  if (!playing) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawLanes();
  updateNotes();
  drawNotes();
  drawScore();
  checkBeat();
  if (lives <= 0) {
    endGame();
    return;
  }
  requestAnimationFrame(animate);
}

function endGame() {
  playing = false;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('beatHeroHighScore', highScore);
  }
  alert('Game Over! Your score: ' + score);
  document.getElementById('startScreen').style.display = 'flex';
}

window.addEventListener('keydown', (e) => {
  if (!playing) return;
  let hit = false;
  notes.forEach(note => {
    if (
      (e.key === 'a' && note.lane === 0 ||
      e.key === 's' && note.lane === 1 ||
      e.key === 'd' && note.lane === 2 ||
      e.key === 'f' && note.lane === 3) &&
      note.y > 500 && note.y < 580
    ) {
      score += 10;
      notes.splice(notes.indexOf(note), 1);
      hit = true;
    }
  });
  if (!hit) lives--;
});
