// Game variables
let gameWidth = 0;
const blockHeight = 30;
let blocks = []; // placed blocks: { element, x, y, width, color }
let activeBlock = null; // sliding block: { element, x, y, width, speed, direction, color }
let fallingPieces = []; // slices falling: { element, x, y, width, vy, vx, rotation, vRotation }
let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let bestScore = localStorage.getItem('boutique_best_score') || 0;
let combo = 0;
let peakCombo = 0;

let cameraY = 0;
let targetCameraY = 0;

let lastTime = 0;
const baseSpeed = 200;
let currentSpeed = baseSpeed;
let animationFrameId = null;

// Audio Synth Context
let audioCtx = null;

// Retro Warm Color Palette (Terracotta, Mustard, Sage, Teal)
const COLOR_PALETTE = [
  '#D36B50', // Terracotta
  '#E9B857', // Mustard Yellow
  '#8FA882', // Sage Green
  '#5C8E90', // Muted Teal
  '#C05C46', // Warm Dark Red
  '#DCA13D', // Muted Gold
  '#7D9770', // Deep Sage
  '#4E7D7F'  // Deep Teal
];

// DOM Elements
let gameContainer, playArea, towerContainer, startScreen, gameOverScreen;
let currentScoreEl, bestScoreEl, finalScoreEl, peakComboEl, startButton, restartButton;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Bind DOM elements
  gameContainer = document.getElementById('gameContainer');
  playArea = document.getElementById('playArea');
  towerContainer = document.getElementById('towerContainer');
  startScreen = document.getElementById('startScreen');
  gameOverScreen = document.getElementById('gameOverScreen');
  
  currentScoreEl = document.getElementById('currentScore');
  bestScoreEl = document.getElementById('bestScore');
  finalScoreEl = document.getElementById('finalScore');
  peakComboEl = document.getElementById('peakCombo');
  startButton = document.getElementById('startButton');
  restartButton = document.getElementById('restartButton');

  // Display initial high score
  bestScoreEl.textContent = bestScore;

  // Measure gameWidth
  gameWidth = playArea.offsetWidth;

  // Event Listeners
  startButton.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();
    startGame();
  });

  restartButton.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();
    resetGame();
  });

  // unified pointerdown for clicks and taps
  gameContainer.addEventListener('pointerdown', (e) => {
    // If user clicked/tapped a button, ignore
    if (e.target.closest('.btn')) return;
    
    initAudio();
    
    if (gameState === 'PLAYING') {
      handleDrop();
    }
  });

  // Spacebar drop handler
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault(); // Stop page scrolling
      initAudio();
      
      if (gameState === 'PLAYING') {
        handleDrop();
      }
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    gameWidth = playArea.offsetWidth;
  });

  // Start checking loop frames
  lastTime = performance.now();
  animationFrameId = requestAnimationFrame(gameLoop);
});

// Initialize Web Audio Synth
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Play retro audio blips/chimes
function playDropSound(isPerfect) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (isPerfect) {
    // Pentatonic scale chime for perfect placements
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
    const noteIndex = combo % scale.length;
    const octaveShift = Math.floor(combo / scale.length);
    const freq = scale[noteIndex] * Math.pow(2, octaveShift);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    
    // Add harmonic
    const chimeOsc = audioCtx.createOscillator();
    const chimeGain = audioCtx.createGain();
    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(freq * 2, now);
    chimeOsc.connect(chimeGain);
    chimeGain.connect(audioCtx.destination);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    chimeGain.gain.setValueAtTime(0.1, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.start(now);
    chimeOsc.start(now);
    osc.stop(now + 0.4);
    chimeOsc.stop(now + 0.15);
  } else {
    // Short retro drop thud
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
    
    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    osc.start(now);
    osc.stop(now + 0.12);
  }
}

function playGameOverSound() {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  // Descending synthesizer sound
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.linearRampToValueAtTime(50, now + 0.5);
  
  gainNode.gain.setValueAtTime(0.2, now);
  gainNode.gain.linearRampToValueAtTime(0.001, now + 0.5);

  osc.start(now);
  osc.stop(now + 0.5);
}

// Game State Control
function startGame() {
  startScreen.classList.remove('active');
  gameState = 'PLAYING';
  
  // Set up base and start
  resetGameVars();
  spawnBaseBlock();
  spawnActiveBlock();
}

function resetGame() {
  gameOverScreen.classList.remove('active');
  gameState = 'PLAYING';
  
  // Clear HTML
  towerContainer.innerHTML = '';
  fallingPieces.forEach(p => p.element.remove());
  
  resetGameVars();
  spawnBaseBlock();
  spawnActiveBlock();
}

function resetGameVars() {
  blocks = [];
  activeBlock = null;
  fallingPieces = [];
  score = 0;
  combo = 0;
  peakCombo = 0;
  cameraY = 0;
  targetCameraY = 0;
  currentSpeed = baseSpeed;
  
  currentScoreEl.textContent = score;
  updateComboBadge(false);
  towerContainer.style.transform = `translateY(0px)`;
}

// Spawning Blocks
function spawnBaseBlock() {
  const baseWidth = 200;
  const x = (gameWidth - baseWidth) / 2;
  const y = 0;
  const color = COLOR_PALETTE[0];
  
  const el = document.createElement('div');
  el.className = 'block';
  el.style.width = baseWidth + 'px';
  el.style.left = x + 'px';
  el.style.bottom = y + 'px';
  el.style.backgroundColor = color;
  
  towerContainer.appendChild(el);
  
  blocks.push({
    element: el,
    x: x,
    y: y,
    width: baseWidth,
    color: color
  });
}

function spawnActiveBlock() {
  const level = blocks.length;
  const prevBlock = blocks[level - 1];
  const width = prevBlock.width;
  const y = level * blockHeight;
  const color = COLOR_PALETTE[level % COLOR_PALETTE.length];
  
  // Slowly scale speed up with level
  currentSpeed = baseSpeed + Math.min(level * 6, 250);
  
  // Alternating start positions
  const startLeft = level % 2 === 0;
  const x = startLeft ? 0 : (gameWidth - width);
  const direction = startLeft ? 1 : -1;
  
  const el = document.createElement('div');
  el.className = 'block';
  el.style.width = width + 'px';
  el.style.left = x + 'px';
  el.style.bottom = y + 'px';
  el.style.backgroundColor = color;
  
  towerContainer.appendChild(el);
  
  activeBlock = {
    element: el,
    x: x,
    y: y,
    width: width,
    speed: currentSpeed,
    direction: direction,
    color: color
  };
  
  // Adjust camera to focus on new active level
  const centerY = 200; // visual sweet spot inside play-area
  if (y > centerY) {
    targetCameraY = y - centerY;
  } else {
    targetCameraY = 0;
  }
}

// Placing / Dropping
function handleDrop() {
  if (gameState !== 'PLAYING' || !activeBlock) return;
  
  const level = blocks.length;
  const prevBlock = blocks[level - 1];
  
  const x1 = prevBlock.x;
  const w1 = prevBlock.width;
  const x2 = activeBlock.x;
  const w2 = activeBlock.width;
  
  // Overlap boundaries
  const overlapStart = Math.max(x1, x2);
  const overlapEnd = Math.min(x1 + w1, x2 + w2);
  const overlapWidth = overlapEnd - overlapStart;
  
  if (overlapWidth <= 0) {
    // Completely missed the platform
    handleGameOver();
    return;
  }
  
  const diff = Math.abs(x2 - x1);
  const isPerfect = diff <= 2;
  
  let finalX = overlapStart;
  let finalWidth = overlapWidth;
  
  if (isPerfect) {
    // Snap to match perfectly
    finalX = x1;
    finalWidth = w1;
    activeBlock.x = finalX;
    activeBlock.width = finalWidth;
    activeBlock.element.style.left = finalX + 'px';
    activeBlock.element.style.width = finalWidth + 'px';
    
    // Scale animation
    activeBlock.element.classList.add('perfect-hit');
    
    // Flash background
    triggerFlash();
    
    combo++;
    if (combo > peakCombo) peakCombo = combo;
    updateComboBadge(true);
  } else {
    // Non-perfect placement -> slice excess off
    combo = 0;
    updateComboBadge(false);
    
    let sliceX = 0;
    let sliceWidth = 0;
    
    if (x2 < x1) {
      // Piece hanging off left side
      sliceX = x2;
      sliceWidth = x1 - x2;
    } else if (x2 > x1) {
      // Piece hanging off right side
      sliceX = x1 + w1;
      sliceWidth = x2 - x1;
    }
    
    if (sliceWidth > 0) {
      createFallingSlice(sliceX, activeBlock.y, sliceWidth, activeBlock.color, x2 < x1 ? -1 : 1);
    }
    
    // Resize active block to match overlap
    activeBlock.x = finalX;
    activeBlock.width = finalWidth;
    activeBlock.element.style.left = finalX + 'px';
    activeBlock.element.style.width = finalWidth + 'px';
  }
  
  // Play blip
  playDropSound(isPerfect);
  
  // Add active block to static blocks stack
  blocks.push({
    element: activeBlock.element,
    x: finalX,
    y: activeBlock.y,
    width: finalWidth,
    color: activeBlock.color
  });
  
  score++;
  currentScoreEl.textContent = score;
  
  activeBlock = null;
  
  // Tiny delay before next block starts sliding
  setTimeout(() => {
    if (gameState === 'PLAYING') {
      spawnActiveBlock();
    }
  }, 100);
}

// Slice Creation & Physics
function createFallingSlice(x, y, width, color, direction) {
  const el = document.createElement('div');
  el.className = 'block falling';
  el.style.width = width + 'px';
  el.style.left = x + 'px';
  el.style.bottom = y + 'px';
  el.style.backgroundColor = color;
  
  towerContainer.appendChild(el);
  
  fallingPieces.push({
    element: el,
    x: x,
    y: y,
    width: width,
    vy: 0,
    vx: direction * 140, // push slightly to the side
    rotation: 0,
    vRotation: direction * 240 // spin speed
  });
}

function updatePhysics(deltaTime) {
  const gravity = -1400; // gravity acceleration (px/s^2)
  
  for (let i = fallingPieces.length - 1; i >= 0; i--) {
    const piece = fallingPieces[i];
    piece.vy += gravity * deltaTime;
    piece.x += piece.vx * deltaTime;
    piece.y += piece.vy * deltaTime;
    piece.rotation += piece.vRotation * deltaTime;
    
    piece.element.style.left = piece.x + 'px';
    piece.element.style.bottom = piece.y + 'px';
    piece.element.style.transform = `rotate(${piece.rotation}deg)`;
    
    // Remove if fallen below visible scope
    if (piece.y < cameraY - 150) {
      piece.element.remove();
      fallingPieces.splice(i, 1);
    }
  }
}

// Visual Effects
function triggerFlash() {
  const flash = document.getElementById('flashEffect');
  flash.classList.add('flash');
  setTimeout(() => {
    flash.classList.remove('flash');
  }, 100);
}

function updateComboBadge(isPerfect) {
  const badge = document.getElementById('comboBadge');
  const text = document.getElementById('comboText');
  
  if (isPerfect && combo > 0) {
    text.textContent = `PERFECT x${combo}`;
    badge.classList.add('active');
    
    // Bounce badge
    badge.style.transform = 'scale(1.15)';
    setTimeout(() => {
      badge.style.transform = 'scale(1)';
    }, 120);
  } else {
    badge.classList.remove('active');
  }
}

// Game Over Handler
function handleGameOver() {
  gameState = 'GAMEOVER';
  
  if (activeBlock) {
    // Drop the entire block off
    createFallingSlice(activeBlock.x, activeBlock.y, activeBlock.width, activeBlock.color, activeBlock.direction);
    activeBlock.element.remove();
    activeBlock = null;
  }
  
  playGameOverSound();
  
  // Save/Update highscore
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('boutique_best_score', bestScore);
    bestScoreEl.textContent = bestScore;
  }
  
  // Show Game Over panel
  finalScoreEl.textContent = score;
  peakComboEl.textContent = peakCombo;
  gameOverScreen.classList.add('active');
}

// Main Game Loop
function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  let deltaTime = (timestamp - lastTime) / 1000;
  
  // Cap delta time to prevent giant jumps when backgrounded
  if (deltaTime > 0.1) deltaTime = 0.1;
  
  lastTime = timestamp;
  
  // Update moving block
  if (gameState === 'PLAYING' && activeBlock) {
    activeBlock.x += activeBlock.speed * activeBlock.direction * deltaTime;
    
    // Bounds check & direction swap
    if (activeBlock.direction === 1 && activeBlock.x >= gameWidth - activeBlock.width) {
      activeBlock.x = gameWidth - activeBlock.width;
      activeBlock.direction = -1;
    } else if (activeBlock.direction === -1 && activeBlock.x <= 0) {
      activeBlock.x = 0;
      activeBlock.direction = 1;
    }
    
    activeBlock.element.style.left = activeBlock.x + 'px';
  }
  
  // Update falling physics
  updatePhysics(deltaTime);
  
  // Smoothly move the camera
  if (gameState === 'PLAYING' || gameState === 'GAMEOVER') {
    cameraY += (targetCameraY - cameraY) * 6 * deltaTime;
    towerContainer.style.transform = `translateY(${cameraY}px)`;
  }
  
  animationFrameId = requestAnimationFrame(gameLoop);
}
