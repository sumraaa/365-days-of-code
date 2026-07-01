// Game State
let gameState = 'idle'; // 'idle', 'delay', 'pitching', 'ended'
let bestReflex = null; // in milliseconds
let pitchSpeedMPH = 0;
let pitchDuration = 0; // in milliseconds, computed from speed
let releaseTime = 0; // timestamp when ball starts moving
let delayTimeout = null;
let animationId = null;
let pitchStartTime = null;

// DOM Elements
const startBtn = document.getElementById('startBtn');
const strikeBtn = document.getElementById('strikeBtn');
const ball = document.getElementById('ball');
const creaseZone = document.getElementById('creaseZone');
const statusIndicator = document.getElementById('statusIndicator');
const feedbackText = document.getElementById('feedbackText');
const subFeedback = document.getElementById('subFeedback');
const bestReflexVal = document.getElementById('bestReflex');
const pitchSpeedVal = document.getElementById('pitchSpeed');

// Start the pitching sequence
function startPitch() {
  if (gameState === 'delay' || gameState === 'pitching') return;

  // Reset ball & visual elements
  cancelAnimationFrame(animationId);
  clearTimeout(delayTimeout);
  
  ball.style.display = 'none';
  ball.style.top = '0px';
  creaseZone.className = 'crease-zone'; // clear success/failure highlights
  
  // Set random speed (simulating 70 to 105 MPH)
  pitchSpeedMPH = Math.floor(Math.random() * (105 - 70 + 1)) + 70;
  pitchSpeedVal.textContent = `${pitchSpeedMPH} MPH`;
  
  // Pitch duration is inversely proportional to speed:
  // 70 MPH -> 550ms, 105 MPH -> 320ms
  // Interpolation formula: duration = 550 - ((speed - 70) / (105 - 70)) * (550 - 320)
  pitchDuration = 550 - ((pitchSpeedMPH - 70) / 35) * 230;

  // Update game state
  gameState = 'delay';
  pitchStartTime = null;

  // Toggle buttons
  startBtn.disabled = true;
  strikeBtn.disabled = false;

  // Update feedback panels
  statusIndicator.textContent = 'WAITING';
  statusIndicator.className = 'status-indicator waiting';
  feedbackText.textContent = 'Pitcher is winding up...';
  subFeedback.textContent = 'Get ready to strike!';

  // Random delay between 1.0 and 3.0 seconds
  const randomDelay = Math.random() * (3000 - 1000) + 1000;
  
  delayTimeout = setTimeout(() => {
    releaseBall();
  }, randomDelay);
}

// Release the ball (it starts moving down the pitch)
function releaseBall() {
  gameState = 'pitching';
  
  // Update indicator
  statusIndicator.textContent = 'PITCHING';
  statusIndicator.className = 'status-indicator pitching';
  feedbackText.textContent = 'SWING!';
  subFeedback.textContent = 'The pitch is coming fast!';

  // Show ball
  ball.style.display = 'block';
  ball.style.top = '0px';

  // Mark release time
  releaseTime = performance.now();

  // Run the animation loop
  animationId = requestAnimationFrame(animateBall);
}

// Animation loop for the ball moving down the pitch
function animateBall(timestamp) {
  if (!pitchStartTime) pitchStartTime = timestamp;
  const elapsed = timestamp - pitchStartTime;
  const progressRatio = elapsed / pitchDuration;

  if (progressRatio >= 1.0) {
    // Ball reached bottom - missed completely
    handleBallMiss();
  } else {
    // Move ball down the pitch (from top 0% to 100%)
    ball.style.top = `${progressRatio * 100}%`;
    animationId = requestAnimationFrame(animateBall);
  }
}

// Handle the user clicking the Strike button or pressing space
function handleStrike() {
  if (gameState !== 'delay' && gameState !== 'pitching') return;

  const strikeTime = performance.now();
  
  // Stop animation frame and timers
  cancelAnimationFrame(animationId);
  clearTimeout(delayTimeout);

  // Toggle button states
  startBtn.disabled = false;
  strikeBtn.disabled = true;

  if (gameState === 'delay') {
    // Clicked early (before ball release)
    handleEarlyStrike();
  } else if (gameState === 'pitching') {
    // Clicked while ball is in motion - evaluate timing
    evaluateStrikeTiming(strikeTime);
  }
}

// Clicked before the ball was pitched
function handleEarlyStrike() {
  gameState = 'ended';
  ball.style.display = 'none';
  creaseZone.className = 'crease-zone strike-failure';

  statusIndicator.textContent = 'EARLY';
  statusIndicator.className = 'status-indicator early';
  feedbackText.textContent = 'Too Early!';
  subFeedback.textContent = 'You swung before the pitcher released the ball.';
}

// Ball reached the bottom without a swing
function handleBallMiss() {
  gameState = 'ended';
  ball.style.display = 'none';
  creaseZone.className = 'crease-zone strike-failure';
  
  startBtn.disabled = false;
  strikeBtn.disabled = true;

  statusIndicator.textContent = 'LATE';
  statusIndicator.className = 'status-indicator late';
  feedbackText.textContent = 'Too Late!';
  subFeedback.textContent = 'The ball sailed past the wickets.';
}

// Evaluate overlapping of ball and crease at strike time
function evaluateStrikeTiming(strikeTime) {
  gameState = 'ended';

  const ballRect = ball.getBoundingClientRect();
  const creaseRect = creaseZone.getBoundingClientRect();

  // Check vertical overlap
  const isOverlapping = ballRect.bottom >= creaseRect.top && ballRect.top <= creaseRect.bottom;

  if (isOverlapping) {
    // Hit! Calculate reaction time from release to strike
    const reflexTimeMs = strikeTime - releaseTime;
    const reflexTimeSec = (reflexTimeMs / 1000).toFixed(3);

    // Apply success highlight
    creaseZone.className = 'crease-zone strike-success';

    statusIndicator.textContent = 'PERFECT';
    statusIndicator.className = 'status-indicator perfect';
    feedbackText.textContent = `Perfect Timing! ${reflexTimeSec}s`;
    subFeedback.textContent = `Smacked it! Ball speed: ${pitchSpeedMPH} MPH.`;

    // Update best score if it's the fastest successful hit
    if (bestReflex === null || reflexTimeMs < bestReflex) {
      bestReflex = reflexTimeMs;
      bestReflexVal.textContent = `${(bestReflex / 1000).toFixed(3)}s`;
    }
  } else {
    // No overlap - was the ball above or below the crease?
    creaseZone.className = 'crease-zone strike-failure';

    if (ballRect.bottom < creaseRect.top) {
      // Too early swing
      statusIndicator.textContent = 'EARLY';
      statusIndicator.className = 'status-indicator early';
      feedbackText.textContent = 'Too Early!';
      subFeedback.textContent = 'Swung before the ball entered the strike zone.';
    } else {
      // Too late swing
      statusIndicator.textContent = 'LATE';
      statusIndicator.className = 'status-indicator late';
      feedbackText.textContent = 'Too Late!';
      subFeedback.textContent = 'Swung after the ball passed the strike zone.';
    }
  }

  // Hide the ball
  ball.style.display = 'none';
}

// Event Listeners
startBtn.addEventListener('click', startPitch);
strikeBtn.addEventListener('click', handleStrike);

// Keyboard Spacebar integration for quick reflex action
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault(); // Prevent page scrolling
    if (!strikeBtn.disabled) {
      handleStrike();
    } else if (!startBtn.disabled && gameState === 'ended' || gameState === 'idle') {
      startPitch();
    }
  }
});
