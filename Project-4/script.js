// --- Game Configuration & Constants ---
const GRID_SIZE = 6;
const OBSTACLE_COUNT = 5;
const PLAYER_START = { r: 0, c: 0 };
const BOT_START = { r: 5, c: 5 };
const ATTACK_RANGE = 2; // Manhattan distance
const ATTACK_AP_COST = 2;
const MOVE_AP_COST = 1;

// --- Game State ---
let gameState = {
  status: 'active', // 'active' | 'over'
  turn: 'player', // 'player' | 'bot'
  player: {
    r: PLAYER_START.r,
    c: PLAYER_START.c,
    hp: 100,
    maxHp: 100,
    ap: 3,
    maxAp: 3
  },
  bot: {
    r: BOT_START.r,
    c: BOT_START.c,
    hp: 100,
    maxHp: 100,
    ap: 3,
    maxAp: 3
  },
  obstacles: [], // Array of {r, c}
  playerMode: 'none', // 'none' | 'move' | 'attack'
  botActionTimeout: null
};

// --- DOM Elements ---
const arenaGrid = document.getElementById('arena-grid');
const playerHpText = document.getElementById('player-hp-text');
const playerHpBar = document.getElementById('player-hp-bar');
const playerApNodes = document.getElementById('player-ap-nodes');
const playerHudCard = document.getElementById('player-hud-card');

const botHpText = document.getElementById('bot-hp-text');
const botHpBar = document.getElementById('bot-hp-bar');
const botApNodes = document.getElementById('bot-ap-nodes');
const botHudCard = document.getElementById('bot-hud-card');

const btnMove = document.getElementById('btn-move');
const btnAttack = document.getElementById('btn-attack');
const btnEndTurn = document.getElementById('btn-end-turn');
const actionHelper = document.getElementById('action-helper');

const terminalLogs = document.getElementById('terminal-logs');
const gameOverModal = document.getElementById('game-over-modal');
const winnerTitle = document.getElementById('winner-title');
const winnerSubtitle = document.getElementById('winner-subtitle');
const endPlayerHp = document.getElementById('end-player-hp');
const endBotHp = document.getElementById('end-bot-hp');
const btnRestart = document.getElementById('btn-restart');

// --- Initialization ---
function initGame() {
  // Reset State
  gameState.status = 'active';
  gameState.turn = 'player';
  gameState.playerMode = 'none';
  
  gameState.player.r = PLAYER_START.r;
  gameState.player.c = PLAYER_START.c;
  gameState.player.hp = 100;
  gameState.player.ap = 3;

  gameState.bot.r = BOT_START.r;
  gameState.bot.c = BOT_START.c;
  gameState.bot.hp = 100;
  gameState.bot.ap = 0; // Starts at 0, refilled on Bot turn

  // Clear previous timeouts
  if (gameState.botActionTimeout) {
    clearTimeout(gameState.botActionTimeout);
    gameState.botActionTimeout = null;
  }

  // Generate obstacles until we get a valid layout (solvable by BFS)
  do {
    generateObstacles();
  } while (!isLayoutSolvable());

  // Render elements
  renderGrid();
  renderTokens();
  updateHUD();
  clearLogs();
  
  // Hide modal
  gameOverModal.classList.add('hidden');
  
  addLog('SYSTEM BOOT SEQUENCE COMPLETE. ONLINE.', 'system');
  addLog('GRID TACTICAL ARENA INITIALIZED.', 'system');
  addLog('TACTICAL PROTOCOL ACTIVATED: OPERATOR FIRST TURN.', 'system');
  
  updateHighlights();
  updateButtonStates();
}

// Generate 4-5 obstacles randomly
function generateObstacles() {
  gameState.obstacles = [];
  const count = OBSTACLE_COUNT;
  
  while (gameState.obstacles.length < count) {
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);
    
    // Do not place on starting spots
    const isPlayerPos = (r === PLAYER_START.r && c === PLAYER_START.c);
    const isBotPos = (r === BOT_START.r && c === BOT_START.c);
    
    // Check if already an obstacle
    const isDuplicate = gameState.obstacles.some(obs => obs.r === r && obs.c === c);
    
    if (!isPlayerPos && !isBotPos && !isDuplicate) {
      gameState.obstacles.push({ r, c });
    }
  }
}

// BFS check to ensure Player and Bot can reach each other
function isLayoutSolvable() {
  const queue = [[PLAYER_START.r, PLAYER_START.c]];
  const visited = new Set([`${PLAYER_START.r},${PLAYER_START.c}`]);
  
  while (queue.length > 0) {
    const [r, c] = queue.shift();
    
    if (r === BOT_START.r && c === BOT_START.c) {
      return true;
    }
    
    const dirs = [[-1,0], [1,0], [0,-1], [0,1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
        // Not an obstacle
        const isObstacle = gameState.obstacles.some(obs => obs.r === nr && obs.c === nc);
        if (!isObstacle && !visited.has(key)) {
          visited.add(key);
          queue.push([nr, nc]);
        }
      }
    }
  }
  return false;
}

// Render grid structure
function renderGrid() {
  arenaGrid.innerHTML = '';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      
      // Check if obstacle
      const isObstacle = gameState.obstacles.some(obs => obs.r === r && obs.c === c);
      if (isObstacle) {
        cell.classList.add('cell-obstacle');
      }
      
      cell.addEventListener('click', () => handleCellClick(r, c));
      arenaGrid.appendChild(cell);
    }
  }
}

// Render player and bot tokens overlays
function renderTokens() {
  // Remove existing tokens if any
  document.querySelectorAll('.token').forEach(t => t.remove());

  // Player Token
  const playerToken = document.createElement('div');
  playerToken.className = 'token player-token';
  playerToken.id = 'player-token';
  playerToken.innerText = 'P';
  playerToken.style.setProperty('--row', gameState.player.r);
  playerToken.style.setProperty('--col', gameState.player.c);
  arenaGrid.appendChild(playerToken);

  // Bot Token
  const botToken = document.createElement('div');
  botToken.className = 'token bot-token';
  botToken.id = 'bot-token';
  botToken.innerText = 'B';
  botToken.style.setProperty('--row', gameState.bot.r);
  botToken.style.setProperty('--col', gameState.bot.c);
  arenaGrid.appendChild(botToken);
}

// Update the position variables on the tokens
function moveToken(type, r, c) {
  const token = document.getElementById(`${type}-token`);
  if (token) {
    token.style.setProperty('--row', r);
    token.style.setProperty('--col', c);
  }
}

// --- HUD Updates ---
function updateHUD() {
  // Player HUD
  playerHpText.innerText = `${gameState.player.hp} / 100`;
  playerHpBar.style.width = `${gameState.player.hp}%`;
  renderApNodes('player', gameState.player.ap);
  
  // Bot HUD
  botHpText.innerText = `${gameState.bot.hp} / 100`;
  botHpBar.style.width = `${gameState.bot.hp}%`;
  renderApNodes('bot', gameState.bot.ap);

  // Turn Highlights
  if (gameState.turn === 'player') {
    playerHudCard.classList.add('active-turn-hud');
    botHudCard.classList.remove('active-turn-hud');
  } else {
    playerHudCard.classList.remove('active-turn-hud');
    botHudCard.classList.add('active-turn-hud');
  }
}

function renderApNodes(faction, ap) {
  const container = document.getElementById(`${faction}-ap-nodes`);
  container.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const node = document.createElement('span');
    node.className = 'ap-node';
    if (i < ap) {
      node.classList.add('active');
    }
    container.appendChild(node);
  }
}

function updateButtonStates() {
  if (gameState.status === 'over' || gameState.turn === 'bot') {
    btnMove.disabled = true;
    btnAttack.disabled = true;
    btnEndTurn.disabled = true;
    btnMove.classList.remove('active-mode');
    btnAttack.classList.remove('active-mode');
    
    if (gameState.turn === 'bot') {
      actionHelper.innerText = 'PROCESSING DECISION MATRIX... PLEASE WAIT.';
    } else {
      actionHelper.innerText = 'ARENA SYSTEM OFFLINE. DEPLOY RE-BOOT.';
    }
  } else {
    // Player turn
    btnEndTurn.disabled = false;
    btnMove.disabled = gameState.player.ap < MOVE_AP_COST;
    btnAttack.disabled = gameState.player.ap < ATTACK_AP_COST;

    // Toggle active state classes based on player mode
    if (gameState.playerMode === 'move') {
      btnMove.classList.add('active-mode');
      btnAttack.classList.remove('active-mode');
      actionHelper.innerText = 'SELECT ADJACENT GLOWING CELL TO NAVIGATE [1 AP].';
    } else if (gameState.playerMode === 'attack') {
      btnMove.classList.remove('active-mode');
      btnAttack.classList.add('active-mode');
      actionHelper.innerText = 'SELECT TARGET UNIT [B] WITHIN RANGE [2 AP].';
    } else {
      btnMove.classList.remove('active-mode');
      btnAttack.classList.remove('active-mode');
      actionHelper.innerText = 'SELECT A COMMAND OR DIRECT-CLICK TILES TO BEGIN.';
    }
  }
}

// --- Tactical Highlights ---
function updateHighlights() {
  // Clear highlights first
  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.remove('highlight-move', 'highlight-attack');
  });

  if (gameState.status !== 'active' || gameState.turn !== 'player') return;

  if (gameState.playerMode === 'move' && gameState.player.ap >= MOVE_AP_COST) {
    const adj = getWalkableNeighbors(gameState.player.r, gameState.player.c, 'player');
    adj.forEach(cell => {
      const cellEl = getCellElement(cell.r, cell.c);
      if (cellEl) cellEl.classList.add('highlight-move');
    });
  } else if (gameState.playerMode === 'attack' && gameState.player.ap >= ATTACK_AP_COST) {
    // Highlight Bot tile if bot is in range
    const dist = getDistance(gameState.player, gameState.bot);
    if (dist <= ATTACK_RANGE) {
      const cellEl = getCellElement(gameState.bot.r, gameState.bot.c);
      if (cellEl) cellEl.classList.add('highlight-attack');
    }
  }
}

// --- Helper Functions ---
function getCellElement(r, c) {
  return document.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
}

function getDistance(p1, p2) {
  return Math.abs(p1.r - p2.r) + Math.abs(p1.c - p2.c);
}

// Get adjacent cells that are within boundaries, not obstacle, and not occupied by opponent
function getWalkableNeighbors(r, c, faction) {
  const dirs = [[-1,0], [1,0], [0,-1], [0,1]];
  const neighbors = [];
  const opponentPos = faction === 'player' ? gameState.bot : gameState.player;
  
  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    
    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
      // Check obstacle
      const isObstacle = gameState.obstacles.some(obs => obs.r === nr && obs.c === nc);
      // Check occupied
      const isOccupied = (nr === opponentPos.r && nc === opponentPos.c);
      
      if (!isObstacle && !isOccupied) {
        neighbors.push({ r: nr, c: nc });
      }
    }
  }
  return neighbors;
}

// --- Combat Visual FX ---
function playVisualEffects(fromRow, fromCol, toRow, toCol, damage, isPlayerAttack) {
  // 1. Draw Laser Line
  const grid = document.getElementById('arena-grid');
  const laser = document.createElement('div');
  laser.className = 'laser-line';
  if (isPlayerAttack) {
    laser.classList.add('player-laser');
  }

  const cellPct = 100 / GRID_SIZE;
  const x1 = fromCol * cellPct + cellPct / 2;
  const y1 = fromRow * cellPct + cellPct / 2;
  const x2 = toCol * cellPct + cellPct / 2;
  const y2 = toRow * cellPct + cellPct / 2;

  const width = grid.offsetWidth;
  const height = grid.offsetHeight;

  const px1 = (x1 / 100) * width;
  const py1 = (y1 / 100) * height;
  const px2 = (x2 / 100) * width;
  const py2 = (y2 / 100) * height;

  const dx = px2 - px1;
  const dy = py2 - py1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  laser.style.width = `${distance}px`;
  laser.style.left = `${px1}px`;
  laser.style.top = `${py1}px`;
  laser.style.transform = `rotate(${angle}deg)`;

  grid.appendChild(laser);

  // 2. Shake Grid
  const gridWrapper = document.querySelector('.grid-wrapper');
  gridWrapper.classList.add('shake');
  
  // 3. Floating Damage Numbers
  const damageText = document.createElement('div');
  damageText.className = 'floating-damage';
  damageText.innerText = `-${damage}`;
  damageText.style.left = `${px2}px`;
  damageText.style.top = `${py2}px`;
  grid.appendChild(damageText);

  // Cleanups
  setTimeout(() => {
    gridWrapper.classList.remove('shake');
  }, 400);

  setTimeout(() => {
    laser.remove();
  }, 450);

  setTimeout(() => {
    damageText.remove();
  }, 750);
}

// --- Action Log Terminal ---
function addLog(text, type = 'system') {
  const entry = document.createElement('div');
  entry.className = 'log-entry';

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const timeSpan = document.createElement('span');
  timeSpan.className = 'log-time';
  timeSpan.innerText = `[${timeStr}]`;

  const textSpan = document.createElement('span');
  textSpan.className = `log-text log-${type}`;
  textSpan.innerText = text;

  entry.appendChild(timeSpan);
  entry.appendChild(textSpan);
  
  terminalLogs.appendChild(entry);
  terminalLogs.scrollTop = terminalLogs.scrollHeight;
}

function clearLogs() {
  terminalLogs.innerHTML = '';
}

// --- Player Actions ---
function handleCellClick(r, c) {
  if (gameState.status !== 'active' || gameState.turn !== 'player') return;

  // Context Click Logic: 
  // If player clicks adjacent tile directly (mode === 'none'), trigger move
  // If player clicks bot tile directly (mode === 'none') and range <= 2, trigger attack
  if (gameState.playerMode === 'none') {
    const isAdjacent = Math.abs(r - gameState.player.r) + Math.abs(c - gameState.player.c) === 1;
    const isObstacle = gameState.obstacles.some(obs => obs.r === r && obs.c === c);
    
    if (r === gameState.bot.r && c === gameState.bot.c) {
      // Direct click Bot
      const dist = getDistance(gameState.player, gameState.bot);
      if (dist <= ATTACK_RANGE) {
        if (gameState.player.ap >= ATTACK_AP_COST) {
          executePlayerAttack();
        } else {
          addLog('ERROR: INSUFFICIENT AP TO ATTACK [REQUIRES 2 AP].', 'system');
        }
      }
    } else if (isAdjacent && !isObstacle) {
      // Direct click adjacent cell
      if (gameState.player.ap >= MOVE_AP_COST) {
        executePlayerMove(r, c);
      } else {
        addLog('ERROR: INSUFFICIENT AP TO MOVE [REQUIRES 1 AP].', 'system');
      }
    }
    return;
  }

  // Selected Mode click logic
  if (gameState.playerMode === 'move') {
    const cellEl = getCellElement(r, c);
    if (cellEl && cellEl.classList.contains('highlight-move')) {
      executePlayerMove(r, c);
    } else {
      // Exit mode or click error
      gameState.playerMode = 'none';
      updateHighlights();
      updateButtonStates();
    }
  } else if (gameState.playerMode === 'attack') {
    const cellEl = getCellElement(r, c);
    if (cellEl && cellEl.classList.contains('highlight-attack')) {
      executePlayerAttack();
    } else {
      gameState.playerMode = 'none';
      updateHighlights();
      updateButtonStates();
    }
  }
}

function executePlayerMove(r, c) {
  gameState.player.r = r;
  gameState.player.c = c;
  gameState.player.ap -= MOVE_AP_COST;

  // Move token visually
  moveToken('player', r, c);
  addLog(`BLUE_SHADOW NAVIGATED TO GRID CELL (${r}, ${c}). AP spent: 1.`, 'player');

  gameState.playerMode = 'none';
  updateHUD();
  
  if (gameState.player.ap <= 0) {
    endPlayerTurn();
  } else {
    updateHighlights();
    updateButtonStates();
  }
}

function executePlayerAttack() {
  gameState.player.ap -= ATTACK_AP_COST;

  // Calculate damage 10-20
  const dmg = Math.floor(Math.random() * 11) + 10;
  gameState.bot.hp = Math.max(0, gameState.bot.hp - dmg);

  playVisualEffects(
    gameState.player.r, gameState.player.c, 
    gameState.bot.r, gameState.bot.c, 
    dmg, true
  );

  addLog(`BLUE_SHADOW LAUNCHED WEAPON STRIKE ON RED_STALKER: DEALT ${dmg} HP INTEGRITY DAMAGE. AP spent: 2.`, 'player');

  gameState.playerMode = 'none';
  updateHUD();

  if (checkGameOver()) return;

  if (gameState.player.ap <= 0) {
    endPlayerTurn();
  } else {
    updateHighlights();
    updateButtonStates();
  }
}

function endPlayerTurn() {
  gameState.playerMode = 'none';
  gameState.turn = 'bot';
  updateHighlights();
  updateHUD();
  updateButtonStates();
  
  addLog('OPERATOR ACTION PROTOCOL COMPLETED. TURNING CONTROL TO ENEMY AI.', 'system');
  
  // Sequence Bot Actions after a short delay
  gameState.botActionTimeout = setTimeout(() => {
    startBotTurn();
  }, 1000);
}

// --- Bot Actions (Sequence AI Loop) ---
function startBotTurn() {
  gameState.bot.ap = 3;
  updateHUD();
  updateButtonStates();
  addLog('ENEMY AI INITIALIZING THREAT LOGIC MATRIX. REFUELED AP: 3.', 'bot');
  
  gameState.botActionTimeout = setTimeout(executeBotNextAction, 600);
}

function executeBotNextAction() {
  if (gameState.status !== 'active') return;

  // Bot Turn End Condition
  if (gameState.bot.ap <= 0) {
    addLog('ENEMY AI AP EXHAUSTED. POWERING DOWN ACTION PHASE.', 'bot');
    endBotTurn();
    return;
  }

  // Heuristic priorities
  // PRIORITY 1: Bot HP < 30 - Retreat/Run Away
  if (gameState.bot.hp < 30) {
    addLog('ALERT: BOT UNIT INTEGRITY SEVERELY COMPROMISED. EXECUTING RETREAT.', 'bot');
    const moved = botActionFlee();
    if (moved) {
      gameState.botActionTimeout = setTimeout(executeBotNextAction, 800);
      return;
    } else {
      addLog('RETREAT PATH BLOCKED. CONTINUING ALTERNATIVE PROTOCOLS.', 'bot');
      // If retreat blocked, fallback to combat/advance
    }
  }

  // PRIORITY 2: Player is within range (<= 2) and Bot has enough AP
  const dist = getDistance(gameState.bot, gameState.player);
  if (dist <= ATTACK_RANGE && gameState.bot.ap >= ATTACK_AP_COST) {
    botActionAttack();
    gameState.botActionTimeout = setTimeout(executeBotNextAction, 800);
    return;
  }

  // PRIORITY 3: Player out of range OR Bot has only 1 AP (and cannot attack) -> Move Closer
  if (gameState.bot.ap >= MOVE_AP_COST) {
    const moved = botActionAdvance();
    if (moved) {
      gameState.botActionTimeout = setTimeout(executeBotNextAction, 800);
    } else {
      addLog('AI BLOCKED: PATH TO OPERATOR IS UNPASSABLE. TURNING END.', 'bot');
      gameState.bot.ap = 0;
      executeBotNextAction();
    }
    return;
  }

  // Fallback: End Turn
  endBotTurn();
}

// Bot retreat logic: moves adjacent to maximize distance from player
function botActionFlee() {
  const neighbors = getWalkableNeighbors(gameState.bot.r, gameState.bot.c, 'bot');
  if (neighbors.length === 0) return false;

  let bestMove = null;
  let maxDist = -1;

  neighbors.forEach(cell => {
    const d = getDistance(cell, gameState.player);
    if (d > maxDist) {
      maxDist = d;
      bestMove = cell;
    }
  });

  if (bestMove) {
    gameState.bot.r = bestMove.r;
    gameState.bot.c = bestMove.c;
    gameState.bot.ap -= MOVE_AP_COST;
    moveToken('bot', bestMove.r, bestMove.c);
    updateHUD();
    addLog(`RED_STALKER DISENGAGED AND RETREATED TO GRID CELL (${bestMove.r}, ${bestMove.c}). AP spent: 1.`, 'bot');
    return true;
  }
  return false;
}

// Bot attack logic
function botActionAttack() {
  gameState.bot.ap -= ATTACK_AP_COST;
  const dmg = Math.floor(Math.random() * 11) + 10;
  gameState.player.hp = Math.max(0, gameState.player.hp - dmg);

  playVisualEffects(
    gameState.bot.r, gameState.bot.c,
    gameState.player.r, gameState.player.c,
    dmg, false
  );

  updateHUD();
  addLog(`RED_STALKER FIRED WEAPON ON BLUE_SHADOW: DEALT ${dmg} HP INTEGRITY DAMAGE. AP spent: 2.`, 'bot');

  checkGameOver();
}

// Bot advance logic: moves adjacent to minimize distance to player
function botActionAdvance() {
  const neighbors = getWalkableNeighbors(gameState.bot.r, gameState.bot.c, 'bot');
  if (neighbors.length === 0) return false;

  let bestMove = null;
  let minDist = 999;

  neighbors.forEach(cell => {
    const d = getDistance(cell, gameState.player);
    if (d < minDist) {
      minDist = d;
      bestMove = cell;
    }
  });

  if (bestMove) {
    gameState.bot.r = bestMove.r;
    gameState.bot.c = bestMove.c;
    gameState.bot.ap -= MOVE_AP_COST;
    moveToken('bot', bestMove.r, bestMove.c);
    updateHUD();
    addLog(`RED_STALKER ADVANCED TO GRID CELL (${bestMove.r}, ${bestMove.c}) TO ENGAGE. AP spent: 1.`, 'bot');
    return true;
  }
  return false;
}

function endBotTurn() {
  gameState.turn = 'player';
  gameState.player.ap = 3;
  updateHUD();
  updateHighlights();
  updateButtonStates();
  addLog('OPERATOR SHADOW SYSTEM RESTORED. CURRENT TURN AP: 3.', 'system');
}

// --- Game End Check ---
function checkGameOver() {
  if (gameState.player.hp <= 0) {
    gameState.status = 'over';
    updateHUD();
    updateButtonStates();
    
    winnerTitle.innerText = 'MISSION COMPROMISED';
    winnerTitle.style.color = 'var(--accent-crimson)';
    winnerSubtitle.innerText = 'OPERATOR INTEGRITY REDUCED TO 0%';
    winnerSubtitle.style.color = 'var(--text-muted)';
    
    endPlayerHp.innerText = '0%';
    endPlayerHp.style.color = 'var(--accent-crimson)';
    endBotHp.innerText = `${gameState.bot.hp}%`;
    endBotHp.style.color = 'var(--accent-teal)';

    gameOverModal.classList.remove('hidden');
    addLog('CRITICAL: BLUE_SHADOW OFFLINE. ENEMY AI SECURED THE GRID.', 'system');
    return true;
  }

  if (gameState.bot.hp <= 0) {
    gameState.status = 'over';
    updateHUD();
    updateButtonStates();

    winnerTitle.innerText = 'MISSION COMPLETED';
    winnerTitle.style.color = 'var(--accent-teal)';
    winnerSubtitle.innerText = 'ENEMY THREAT SYSTEM NEUTRALIZED';
    winnerSubtitle.style.color = 'var(--text-muted)';
    
    endPlayerHp.innerText = `${gameState.player.hp}%`;
    endPlayerHp.style.color = 'var(--accent-teal)';
    endBotHp.innerText = '0%';
    endBotHp.style.color = 'var(--accent-crimson)';

    gameOverModal.classList.remove('hidden');
    addLog('SUCCESS: RED_STALKER DEFEATED. GRID ENTIRELY CLEARED.', 'system');
    return true;
  }

  return false;
}

// --- Button Listeners ---
btnMove.addEventListener('click', () => {
  if (gameState.status !== 'active' || gameState.turn !== 'player') return;
  if (gameState.player.ap >= MOVE_AP_COST) {
    gameState.playerMode = gameState.playerMode === 'move' ? 'none' : 'move';
    updateHighlights();
    updateButtonStates();
  }
});

btnAttack.addEventListener('click', () => {
  if (gameState.status !== 'active' || gameState.turn !== 'player') return;
  if (gameState.player.ap >= ATTACK_AP_COST) {
    gameState.playerMode = gameState.playerMode === 'attack' ? 'none' : 'attack';
    updateHighlights();
    updateButtonStates();
  }
});

btnEndTurn.addEventListener('click', () => {
  if (gameState.status !== 'active' || gameState.turn !== 'player') return;
  endPlayerTurn();
});

btnRestart.addEventListener('click', () => {
  initGame();
});

// --- Boot Game ---
window.addEventListener('DOMContentLoaded', () => {
  initGame();
});
