// js/game.js

let audioCtx;
let source;
let analyser;
let dataArray;
let bufferLength;

const noteSpeed = 3; // pixels per frame
const lanes = ['A', 'S', 'D', 'F'];
const laneKeys = ['a', 's', 'd', 'f'];
let notes = [];
let score = 0;
let lives = 3;
let gameRunning = false;
let startTime;
let highScore = localStorage.getItem("hiphopHeroHighScore") || 0;

const audio = new Audio("audio/beathero.mp3");
audio.crossOrigin = "anonymous";

document.addEventListener("DOMContentLoaded", () => {
  const gameArea = document.getElementById("game");
  const scoreDisplay = document.getElementById("score");
  const startScreen = document.getElementById("start-screen");
  const startButton = document.getElementById("start-button");

  // Create lanes and hitboxes
  lanes.forEach((laneKey, i) => {
    const lane = document.createElement("div");
    lane.classList.add("lane");
    lane.style.left = `${i * 25}%`;

    const hitbox = document.createElement("div");
    hitbox.classList.add("hitbox");
    lane.appendChild(hitbox);
    gameArea.appendChild(lane);
  });

  startButton.addEventListener("click", () => {
    startScreen.style.display = "none";
    startGame();
  });

  document.addEventListener("keydown", (e) => {
    const index = laneKeys.indexOf(e.key);
    if (index !== -1) {
      hitNote(index);
    }
  });

  function startGame() {
    gameRunning = true;
    score = 0;
    lives = 3;
    scoreDisplay.textContent = `Score: ${score} | High: ${highScore}`;
    notes = [];

    // Initialize audio
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    source = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    audio.play();
    startTime = performance.now();

    requestAnimationFrame(gameLoop);
    generateNotes();
  }

  function generateNotes() {
    setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;

      if (avg > 140) {
        const lane = Math.floor(Math.random() * 4);
        const note = document.createElement("div");
        note.classList.add("note");
        note.dataset.lane = lane;
        note.style.left = `${lane * 25 + 10}%`;
        note.style.top = `-40px`;
        document.getElementById("game").appendChild(note);
        notes.push(note);
      }
    }, 200);
  }

  function hitNote(lane) {
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const noteTop = parseFloat(note.style.top);
      const noteLane = parseInt(note.dataset.lane);

      if (noteLane === lane && noteTop > window.innerHeight - 100 && noteTop < window.innerHeight - 20) {
        score++;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("hiphopHeroHighScore", highScore);
        }
        document.getElementById("score").textContent = `Score: ${score} | High: ${highScore}`;
        note.remove();
        notes.splice(i, 1);
        return;
      }
    }
  }

  function gameLoop(timestamp) {
    if (!gameRunning) return;

    notes.forEach((note, index) => {
      let top = parseFloat(note.style.top);
      top += noteSpeed;
      note.style.top = `${top}px`;

      if (top > window.innerHeight) {
        note.remove();
        notes.splice(index, 1);
        lives--;
        if (lives <= 0) {
          endGame();
        }
      }
    });

    requestAnimationFrame(gameLoop);
  }

  function endGame() {
    gameRunning = false;
    alert(`Game Over! Final Score: ${score}`);
    window.location.reload();
  }
});
