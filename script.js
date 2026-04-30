const mazes = [
  [
    "##########",
    "#S      G#",
    "#        #",
    "#        #",
    "#        #",
    "#        #",
    "#        #",
    "#        #",
    "#        #",
    "##########"
  ],
  [
    "##########",
    "#S     #G#",
    "#   ##   #",
    "#   ##   #",
    "#        #",
    "#   ##   #",
    "#   ##   #",
    "#        #",
    "#        #",
    "##########"
  ],
  [
    "##########",
    "#S  ###  G#",
    "#   #     #",
    "#   #     #",
    "#   ###   #",
    "#        ##",
    "#  ####   #",
    "#        ##",
    "#   ####  #",
    "##########"
  ],
  [
    "##########",
    "#S       #",
    "# ###### #",
    "# #    # #",
    "# # ## # #",
    "# # ## # #",
    "# #    # #",
    "# ###### #",
    "#       G#",
    "##########"
  ],
  [
    "##########",
    "#S   ##  #",
    "#    ##  #",
    "#  ####  #",
    "#  #  #  #",
    "#  #  #  #",
    "#        #",
    "#  ####  #",
    "#     G  #",
    "##########"
  ],
  [
    "##########",
    "#S  #### #",
    "#   #  # #",
    "#   #  # #",
    "#   #### #",
    "#        #",
    "#  ####  #",
    "#        #",
    "#      G #",
    "##########"
  ],
  [
    "##########",
    "#S  #    #",
    "# # # ## #",
    "# # #    #",
    "#   ###  #",
    "###   ## #",
    "#   ##   #",
    "# ##   # #",
    "#    ## G#",
    "##########"
  ],
  [
    "##########",
    "#S   ##  #",
    "# #  ##  #",
    "# #     ##",
    "# ###### #",
    "#        #",
    "## ####  #",
    "#   #    #",
    "#   ####G#",
    "##########"
  ],
  [
    "##########",
    "#S  ##   #",
    "#  ## ## #",
    "#  ## ## #",
    "#     ## #",
    "###      #",
    "#  ####  #",
    "#        #",
    "#   ####G#",
    "##########"
  ],
  [
    "##########",
    "#S #  #  #",
    "#  ## #  #",
    "##  ## # #",
    "#   ##   #",
    "# ####  ##",
    "#      # #",
    "#  ####  #",
    "#   G    #",
    "##########"
  ]
];

const drawings = [
  { label: 'Dibujo 1', src: 'SVG/a.svg' },
  { label: 'Dibujo 2', src: 'SVG/a1.svg' },
  { label: 'Dibujo 3', src: 'SVG/a2.svg' },
  { label: 'Dibujo 4', src: 'SVG/a3.svg' },
  { label: 'Dibujo 5', src: 'SVG/a4.svg' },
  { label: 'Dibujo 6', src: 'SVG/n.svg' },
  { label: 'Dibujo 7', src: 'SVG/n1.svg' },
  { label: 'Dibujo 8', src: 'SVG/n2.svg' },
  { label: 'Dibujo 9', src: 'SVG/n3.svg' },
  { label: 'Dibujo 10', src: 'SVG/n4.svg' }
];

const mazeCanvas = document.getElementById('mazeCanvas');
const ctx = mazeCanvas.getContext('2d');
const levelLabel = document.getElementById('levelLabel');
const completedCount = document.getElementById('completedCount');
const gameMessage = document.getElementById('gameMessage');
const rewardThumb = document.getElementById('rewardThumb');
const rewardMessage = document.getElementById('rewardMessage');
const downloadRewardBtn = document.getElementById('downloadRewardBtn');
const rewardList = document.getElementById('rewardList');
const upBtn = document.getElementById('upBtn');
const leftBtn = document.getElementById('leftBtn');
const downBtn = document.getElementById('downBtn');
const rightBtn = document.getElementById('rightBtn');
const restartBtn = document.getElementById('restartBtn');
const nextBtn = document.getElementById('nextBtn');

let currentLevel = 0;
let player = { x: 0, y: 0 };
let start = { x: 0, y: 0 };
let goal = { x: 0, y: 0 };
let cells = [];
let levelComplete = false;
let unlocked = new Set();
let touchStart = null;

const cellCount = 10;
const drawSize = 64;

function initializeGame() {
  mazeCanvas.width = 640;
  mazeCanvas.height = 640;
  attachEvents();
  loadLevel(0);
  updateRewardPanel();
}

function parseMaze(levelIndex) {
  const map = mazes[levelIndex];
  cells = map.map((row) => row.split(''));
  for (let y = 0; y < cells.length; y += 1) {
    for (let x = 0; x < cells[y].length; x += 1) {
          if (cells[y][x] === 'S') {
        player = { x, y };
        start = { x, y };
        cells[y][x] = ' ';
      }
      if (cells[y][x] === 'G') {
        goal = { x, y };
        cells[y][x] = ' ';
      }
    }
  }
}

function loadLevel(index) {
  currentLevel = Math.max(0, Math.min(drawings.length - 1, index));
  levelComplete = false;
  parseMaze(currentLevel);
  levelLabel.textContent = currentLevel + 1;
  gameMessage.textContent = `Nivel ${currentLevel + 1}: la dificultad sube con cada laberinto. Usa flechas, botones o desliza el dedo.`;
  nextBtn.disabled = true;
  updateRewardPanel();
  drawMaze();
}

function drawMaze() {
  const cols = cells[0].length;
  const rows = cells.length;
  const size = Math.min(mazeCanvas.width / cols, mazeCanvas.height / rows);
  ctx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);

  ctx.fillStyle = '#eef2ff';
  ctx.fillRect(0, 0, mazeCanvas.width, mazeCanvas.height);

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const tile = cells[y][x];
      const px = x * size;
      const py = y * size;

      if (tile === '#') {
        ctx.fillStyle = '#2f3a52';
        ctx.fillRect(px, py, size, size);
      } else {
        ctx.fillStyle = '#f8fbff';
        ctx.fillRect(px, py, size, size);
      }
    }
  }

  ctx.fillStyle = '#86efac';
  ctx.fillRect(start.x * size + size * 0.18, start.y * size + size * 0.18, size * 0.64, size * 0.64);

  ctx.fillStyle = '#fde68a';
  ctx.fillRect(goal.x * size + size * 0.18, goal.y * size + size * 0.18, size * 0.64, size * 0.64);

  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.arc(player.x * size + size / 2, player.y * size + size / 2, size * 0.32, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `${Math.max(14, size * 0.4)}px Inter, system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', start.x * size + size / 2, start.y * size + size / 2);
  ctx.fillText('G', goal.x * size + size / 2, goal.y * size + size / 2);

  ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(goal.x * size + size * 0.18, goal.y * size + size * 0.18, size * 0.64, size * 0.64);
}

function canMove(x, y) {
  return y >= 0 && y < cells.length && x >= 0 && x < cells[0].length && cells[y][x] !== '#';
}

function movePlayer(dx, dy) {
  if (levelComplete) return;
  const nextX = player.x + dx;
  const nextY = player.y + dy;
  if (!canMove(nextX, nextY)) return;
  player = { x: nextX, y: nextY };
  drawMaze();
  if (player.x === goal.x && player.y === goal.y) {
    completeLevel();
  }
}

function completeLevel() {
  levelComplete = true;
  unlocked.add(currentLevel);
  updateRewardPanel();
  gameMessage.textContent = '¡Felicidades! Has completado el laberinto y desbloqueado un dibujo.';
  nextBtn.disabled = currentLevel === drawings.length - 1;
}

function updateRewardPanel() {
  const reward = drawings[currentLevel];
  rewardThumb.src = reward.src;
  rewardThumb.alt = reward.label;

  if (unlocked.has(currentLevel)) {
    rewardMessage.textContent = `Has desbloqueado ${reward.label}. Descárgalo y colórealo.`;
    downloadRewardBtn.classList.remove('disabled');
    downloadRewardBtn.href = reward.src;
    downloadRewardBtn.download = `${reward.label.replace(/\s+/g, '-').toLowerCase()}.svg`;
    downloadRewardBtn.removeAttribute('aria-disabled');
  } else {
    rewardMessage.textContent = 'Completa el laberinto para desbloquear tu dibujo.';
    downloadRewardBtn.classList.add('disabled');
    downloadRewardBtn.href = reward.src;
    downloadRewardBtn.setAttribute('aria-disabled', 'true');
  }

  completedCount.textContent = unlocked.size;
  renderUnlockedRewards();
}

function renderUnlockedRewards() {
  rewardList.innerHTML = '';
  if (unlocked.size === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Aún no has completado ningún laberinto.';
    rewardList.appendChild(empty);
    return;
  }

  unlocked.forEach((levelIndex) => {
    const reward = drawings[levelIndex];
    const card = document.createElement('div');
    card.className = 'reward-card-small';
    card.innerHTML = `
      <img src="${reward.src}" alt="${reward.label}">
      <div>
        <strong>${reward.label}</strong>
        <a href="${reward.src}" download="${reward.label.replace(/\s+/g, '-').toLowerCase()}.svg">Descargar</a>
      </div>
    `;
    rewardList.appendChild(card);
  });
}

function attachEvents() {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') movePlayer(0, -1);
    if (event.key === 'ArrowDown') movePlayer(0, 1);
    if (event.key === 'ArrowLeft') movePlayer(-1, 0);
    if (event.key === 'ArrowRight') movePlayer(1, 0);
  });

  upBtn.addEventListener('click', () => movePlayer(0, -1));
  leftBtn.addEventListener('click', () => movePlayer(-1, 0));
  downBtn.addEventListener('click', () => movePlayer(0, 1));
  rightBtn.addEventListener('click', () => movePlayer(1, 0));

  restartBtn.addEventListener('click', () => {
    loadLevel(currentLevel);
  });

  nextBtn.addEventListener('click', () => {
    loadLevel(currentLevel + 1);
  });

  mazeCanvas.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });

  mazeCanvas.addEventListener('touchend', (event) => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    const threshold = 25;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
      movePlayer(dx > 0 ? 1 : -1, 0);
    } else if (Math.abs(dy) > threshold) {
      movePlayer(0, dy > 0 ? 1 : -1);
    }
    touchStart = null;
  }, { passive: true });
}

initializeGame();
