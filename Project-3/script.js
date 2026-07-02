// Game State variables
const COLORS = ['#FF3366', '#33FFFF', '#33FF33', '#FF6600', '#9933FF', '#FFFFFF'];
let secretCode = [];
let currentRound = 0; // 0 to 9
let activeGuess = [null, null, null, null];
let gameState = 'PLAYING'; // PLAYING, ENDED

// Audio Synth Context
let audioCtx = null;

// DOM Elements
let historyGrid, activeRow, checkBtn, clearBtn, statusOverlay;
let modalTitle, modalText, secretRevealRow, playAgainBtn;
let helpOverlay, closeHelpBtn;

// Initialize board when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  historyGrid = document.getElementById('historyGrid');
  activeRow = document.getElementById('activeRow');
  checkBtn = document.getElementById('checkBtn');
  clearBtn = document.getElementById('clearBtn');
  statusOverlay = document.getElementById('statusOverlay');
  modalTitle = document.getElementById('modalTitle');
  modalText = document.getElementById('modalText');
  secretRevealRow = document.getElementById('secretRevealRow');
  playAgainBtn = document.getElementById('playAgainBtn');

  // Build the board
  initGame();

  // Add event listeners to active row slots (to clear individual picks)
  const slots = activeRow.querySelectorAll('.slot');
  slots.forEach(slot => {
    slot.addEventListener('click', (e) => {
      if (gameState !== 'PLAYING') return;
      playClickSound();
      const index = parseInt(slot.dataset.index);
      activeGuess[index] = null;
      updateActiveRowUI();
    });
  });

  // Add event listeners to color palette buttons
  const paletteColors = document.querySelectorAll('.palette-color');
  paletteColors.forEach(button => {
    button.addEventListener('click', (e) => {
      if (gameState !== 'PLAYING') return;
      playClickSound();
      const color = button.dataset.color;
      placeColor(color);
    });
  });

  // Check guess button
  checkBtn.addEventListener('click', () => {
    if (gameState !== 'PLAYING' || !isGuessComplete()) return;
    playCheckSound();
    submitGuess();
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    if (gameState !== 'PLAYING') return;
    playClickSound();
    clearActiveGuess();
  });

  // Play again button
  playAgainBtn.addEventListener('click', () => {
    playClickSound();
    initGame();
  });

  // Help modal close button
  helpOverlay = document.getElementById('helpOverlay');
  closeHelpBtn = document.getElementById('closeHelpBtn');
  if (closeHelpBtn && helpOverlay) {
    closeHelpBtn.addEventListener('click', () => {
      helpOverlay.classList.remove('active');
      try {
        playClickSound();
      } catch (e) {
        console.warn("Click sound failed:", e);
      }
    });
  }
});

// Setup Game
function initGame() {
  gameState = 'PLAYING';
  currentRound = 0;
  activeGuess = [null, null, null, null];
  
  // Choose random secret code
  secretCode = [];
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    secretCode.push(COLORS[randomIndex]);
  }

  // Draw history grid
  historyGrid.innerHTML = '';
  for (let i = 9; i >= 0; i--) { // Row 10 (index 9) at the top, row 1 at the bottom
    const row = document.createElement('div');
    row.className = 'history-row';
    row.id = `row-${i}`;
    
    // Add row number badge
    const num = document.createElement('span');
    num.className = 'row-num';
    num.textContent = i + 1;
    row.appendChild(num);
    
    // Add 4 pegs
    const pegsContainer = document.createElement('div');
    pegsContainer.className = 'row-pegs';
    for (let p = 0; p < 4; p++) {
      const peg = document.createElement('div');
      peg.className = 'peg empty';
      pegsContainer.appendChild(peg);
    }
    row.appendChild(pegsContainer);
    
    // Add feedback section
    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = 'row-feedback';
    for (let f = 0; f < 4; f++) {
      const dot = document.createElement('div');
      dot.className = 'feedback-dot empty';
      feedbackContainer.appendChild(dot);
    }
    row.appendChild(feedbackContainer);
    
    historyGrid.appendChild(row);
  }

  // Highlight active row
  highlightActiveRow();
  
  // Reset active guess UI
  updateActiveRowUI();
  
  // Close overlay
  statusOverlay.classList.remove('active');
}

// Sound Synthesis using Web Audio API
function initAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("AudioContext creation failed:", e);
      audioCtx = null;
    }
  }
}

function playClickSound() {
  initAudio();
  if (!audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  
  osc.start(now);
  osc.stop(now + 0.05);
}

function playCheckSound() {
  initAudio();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, now);
  
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.start(now);
  osc.stop(now + 0.08);
}

function playWinSound() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
  
  notes.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now + index * 0.1);
    
    gain.gain.setValueAtTime(0.1, now + index * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.25);
    
    osc.start(now + index * 0.1);
    osc.stop(now + index * 0.1 + 0.25);
  });
}

function playLossSound() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const notes = [311.13, 293.66, 261.63, 196.00]; // Eb4, D4, C4, G3 descending sad
  
  notes.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now + index * 0.12);
    
    gain.gain.setValueAtTime(0.12, now + index * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.3);
    
    osc.start(now + index * 0.12);
    osc.stop(now + index * 0.12 + 0.3);
  });
}

// Game Play Helpers
function isGuessComplete() {
  return activeGuess.every(color => color !== null);
}

function placeColor(color) {
  // Find first empty slot index
  const emptyIndex = activeGuess.findIndex(val => val === null);
  if (emptyIndex !== -1) {
    activeGuess[emptyIndex] = color;
    updateActiveRowUI();
  }
}

function clearActiveGuess() {
  activeGuess = [null, null, null, null];
  updateActiveRowUI();
}

function updateActiveRowUI() {
  const slots = activeRow.querySelectorAll('.slot');
  slots.forEach((slot, index) => {
    const color = activeGuess[index];
    if (color) {
      slot.classList.remove('empty');
      slot.style.backgroundColor = color;
    } else {
      slot.classList.add('empty');
      slot.style.backgroundColor = '';
    }
  });

  // Enable/Disable Check Button
  checkBtn.disabled = !isGuessComplete();
}

function highlightActiveRow() {
  // Remove highlighted class from all rows
  for (let i = 0; i < 10; i++) {
    const r = document.getElementById(`row-${i}`);
    if (r) r.classList.remove('active-row-indicator');
  }
  
  // Highlight the current round row
  const activeRowEl = document.getElementById(`row-${currentRound}`);
  if (activeRowEl) {
    activeRowEl.classList.add('active-row-indicator');
  }
}

// Comparison & Evaluation
function evaluateGuess(secret, guess) {
  // Create temporary copies to prevent original mutations
  const tempSecret = [...secret];
  const tempGuess = [...guess];
  
  let exact = 0;
  let partial = 0;

  // First Pass: Calculate Exact Matches and nullify in temp arrays
  for (let i = 0; i < 4; i++) {
    if (tempGuess[i] === tempSecret[i]) {
      exact++;
      tempSecret[i] = null;
      tempGuess[i] = null;
    }
  }

  // Second Pass: Calculate Partial (Misplaced) Matches on remaining
  for (let i = 0; i < 4; i++) {
    if (tempGuess[i] === null) continue;
    
    for (let j = 0; j < 4; j++) {
      if (tempSecret[j] === null) continue;
      
      if (tempGuess[i] === tempSecret[j]) {
        partial++;
        tempSecret[j] = null;
        break;
      }
    }
  }

  return { exact, partial };
}

// Submit Turn
function submitGuess() {
  // Get row elements
  const rowEl = document.getElementById(`row-${currentRound}`);
  if (!rowEl) return;

  const pegs = rowEl.querySelectorAll('.peg');
  const feedbackDots = rowEl.querySelectorAll('.feedback-dot');

  // Render colors in historical row
  activeGuess.forEach((color, i) => {
    pegs[i].classList.remove('empty');
    pegs[i].style.backgroundColor = color;
  });

  // Calculate Matches
  const result = evaluateGuess(secretCode, activeGuess);

  // Render Feedback
  let feedbackIndex = 0;
  // Render exact matches (Green)
  for (let i = 0; i < result.exact; i++) {
    feedbackDots[feedbackIndex].className = 'feedback-dot exact';
    feedbackDots[feedbackIndex].textContent = '';
    feedbackIndex++;
  }
  // Render partial matches (m)
  for (let i = 0; i < result.partial; i++) {
    feedbackDots[feedbackIndex].className = 'feedback-dot partial';
    feedbackDots[feedbackIndex].textContent = 'm';
    feedbackIndex++;
  }
  // Render remaining incorrect empty circles
  while (feedbackIndex < 4) {
    feedbackDots[feedbackIndex].className = 'feedback-dot empty';
    feedbackDots[feedbackIndex].textContent = '';
    feedbackIndex++;
  }

  // Check Game States
  if (result.exact === 4) {
    // Player wins!
    handleEndGame(true);
    return;
  }

  currentRound++;

  if (currentRound >= 10) {
    // Player lost!
    handleEndGame(false);
    return;
  }

  // Move active row indicator
  highlightActiveRow();
  
  // Clear slots for next guess
  clearActiveGuess();
}

// Game Over Win/Loss
function handleEndGame(isWin) {
  gameState = 'ENDED';
  
  // Disable check button
  checkBtn.disabled = true;

  // Reveal secret code in modal
  secretRevealRow.innerHTML = '';
  secretCode.forEach(color => {
    const peg = document.createElement('div');
    peg.className = 'secret-peg';
    peg.style.backgroundColor = color;
    secretRevealRow.appendChild(peg);
  });

  // Set message text
  if (isWin) {
    modalTitle.textContent = 'CODE_CRACKED';
    modalTitle.style.color = 'var(--accent-green)';
    modalText.textContent = `Excellent logic. You solved the puzzle in ${currentRound + 1} turns!`;
    playWinSound();
  } else {
    modalTitle.textContent = 'SYSTEM_LOCKED';
    modalTitle.style.color = 'var(--accent-red)';
    modalText.textContent = 'Operational failure. The maximum guess limit of 10 turns has been reached.';
    playLossSound();
  }

  // Open modal
  setTimeout(() => {
    statusOverlay.classList.add('active');
  }, 600);
}
