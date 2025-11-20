const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const startBtn = document.getElementById('start');
const newGameBtn = document.getElementById('new-game');
const scoreEl = document.getElementById('score');

const cellSize = 16;
const cols = canvas.width / cellSize;
const rows = canvas.height / cellSize;

let snake = [];
let direction = { x: 1, y: 0 };
let food = { x: 10, y: 10 };
let score = 0;
let speed = 130;
let loopId;
let glow = 0;

function resetGame() {
  snake = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  score = 0;
  speed = 130;
  scoreEl.textContent = score.toString();
  spawnFood();
  showOverlay('Pulsa empezar', 'Usa las flechas o WASD para mover la serpiente.');
}

function spawnFood() {
  const freeCells = [];
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (!snake.some((s) => s.x === x && s.y === y)) {
        freeCells.push({ x, y });
      }
    }
  }
  food = freeCells[Math.floor(Math.random() * freeCells.length)];
}

function drawBackground() {
  ctx.fillStyle = 'rgba(3, 27, 18, 0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // brillo del césped
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(61, 224, 126, 0.06)');
  gradient.addColorStop(1, 'rgba(108, 240, 255, 0.05)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize + 0.5, 0);
    ctx.lineTo(x * cellSize + 0.5, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize + 0.5);
    ctx.lineTo(canvas.width, y * cellSize + 0.5);
    ctx.stroke();
  }
}

function drawSnake() {
  glow = (glow + 1) % 30;
  snake.forEach((segment, idx) => {
    const alpha = 0.85 - idx * 0.02;
    const radius = 6 + Math.max(0, 4 - idx * 0.1);
    const x = segment.x * cellSize + cellSize / 2;
    const y = segment.y * cellSize + cellSize / 2;

    const gradient = ctx.createRadialGradient(x, y, radius / 2, x, y, radius * 1.8);
    gradient.addColorStop(0, `rgba(61, 224, 126, ${alpha})`);
    gradient.addColorStop(1, 'rgba(15, 164, 90, 0.25)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (idx === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.beginPath();
      ctx.arc(x + 3, y - 2, 2, 0, Math.PI * 2);
      ctx.arc(x + 6, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawFood() {
  const x = food.x * cellSize + cellSize / 2;
  const y = food.y * cellSize + cellSize / 2;
  const baseRadius = 6;
  const pulse = 2 + Math.sin(Date.now() / 120) * 1.5;

  const gradient = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, baseRadius + pulse);
  gradient.addColorStop(0, 'rgba(255, 248, 198, 0.98)');
  gradient.addColorStop(0.4, 'rgba(255, 209, 95, 0.9)');
  gradient.addColorStop(1, 'rgba(251, 168, 61, 0.35)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, baseRadius + pulse, 0, Math.PI * 2);
  ctx.fill();
}

function update() {
  const head = { ...snake[0] };
  head.x += direction.x;
  head.y += direction.y;

  if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows || snake.some((s) => s.x === head.x && s.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    speed = Math.max(60, speed - 4);
    scoreEl.textContent = score.toString();
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
  loopId = setTimeout(update, speed);
}

function draw() {
  drawBackground();
  drawFood();
  drawSnake();
}

function changeDirection(event) {
  const key = event.key.toLowerCase();
  if (['arrowup', 'w'].includes(key) && direction.y !== 1) {
    direction = { x: 0, y: -1 };
  }
  if (['arrowdown', 's'].includes(key) && direction.y !== -1) {
    direction = { x: 0, y: 1 };
  }
  if (['arrowleft', 'a'].includes(key) && direction.x !== 1) {
    direction = { x: -1, y: 0 };
  }
  if (['arrowright', 'd'].includes(key) && direction.x !== -1) {
    direction = { x: 1, y: 0 };
  }
}

function showOverlay(title, text, showButton = true) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  startBtn.classList.toggle('hidden', !showButton);
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function startGame() {
  hideOverlay();
  clearTimeout(loopId);
  draw();
  loopId = setTimeout(update, speed);
}

function endGame() {
  clearTimeout(loopId);
  showOverlay('Fin de la partida', `Marcador final: ${score} puntos`, true);
}

function init() {
  document.addEventListener('keydown', changeDirection);
  startBtn.addEventListener('click', startGame);
  newGameBtn.addEventListener('click', () => {
    resetGame();
  });

  resetGame();
  draw();
}

init();
