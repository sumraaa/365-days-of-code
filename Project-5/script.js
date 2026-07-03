// --- Track Center Path Definition ---
const initialTrackCenter = [
  { x: 100, y: 250 },
  { x: 120, y: 150 },
  { x: 220, y: 100 },
  { x: 400, y: 100 },
  { x: 580, y: 120 },
  { x: 680, y: 180 },
  { x: 720, y: 280 },
  { x: 650, y: 380 },
  { x: 500, y: 400 },
  { x: 380, y: 320 }, // S-Curve inward
  { x: 280, y: 380 },
  { x: 150, y: 380 }
];

let trackCenter = JSON.parse(JSON.stringify(initialTrackCenter));
let innerWalls = [];
let outerWalls = [];
let checkpoints = [];

// --- Global Simulation Variables ---
const POPULATION_SIZE = 100;
let rovers = [];
let generation = 1;
let allTimeBestFitness = 0;
let speedMultiplier = 1;
let mutationRate = 0.1;
let drawAllRays = false;

// --- Neural Network Class (Multilayer Perceptron) ---
class NeuralNetwork {
  constructor(inputCount, hiddenCount, outputCount) {
    this.inputCount = inputCount;
    this.hiddenCount = hiddenCount;
    this.outputCount = outputCount;
    
    // IH Weights matrix (hidden x input)
    this.weightsIH = [];
    for (let i = 0; i < this.hiddenCount; i++) {
      const row = [];
      for (let j = 0; j < this.inputCount; j++) {
        row.push(Math.random() * 2 - 1);
      }
      this.weightsIH.push(row);
    }
    
    // HO Weights matrix (output x hidden)
    this.weightsHO = [];
    for (let i = 0; i < this.outputCount; i++) {
      const row = [];
      for (let j = 0; j < this.hiddenCount; j++) {
        row.push(Math.random() * 2 - 1);
      }
      this.weightsHO.push(row);
    }
    
    // Biases arrays
    this.biasH = [];
    for (let i = 0; i < this.hiddenCount; i++) {
      this.biasH.push(Math.random() * 2 - 1);
    }
    
    this.biasO = [];
    for (let i = 0; i < this.outputCount; i++) {
      this.biasO.push(Math.random() * 2 - 1);
    }
  }

  feedForward(inputs) {
    // Hidden layer matrix multiplication + bias + tanh activation
    const hidden = [];
    for (let i = 0; i < this.hiddenCount; i++) {
      let sum = 0;
      for (let j = 0; j < this.inputCount; j++) {
        sum += inputs[j] * this.weightsIH[i][j];
      }
      sum += this.biasH[i];
      hidden.push(Math.tanh(sum));
    }
    
    // Output layer multiplication + bias + tanh activation
    const outputs = [];
    for (let i = 0; i < this.outputCount; i++) {
      let sum = 0;
      for (let j = 0; j < this.hiddenCount; j++) {
        sum += hidden[j] * this.weightsHO[i][j];
      }
      sum += this.biasO[i];
      outputs.push(Math.tanh(sum));
    }
    
    return outputs;
  }

  copy() {
    const clone = new NeuralNetwork(this.inputCount, this.hiddenCount, this.outputCount);
    
    // Copy weights
    for (let i = 0; i < this.hiddenCount; i++) {
      for (let j = 0; j < this.inputCount; j++) {
        clone.weightsIH[i][j] = this.weightsIH[i][j];
      }
    }
    for (let i = 0; i < this.outputCount; i++) {
      for (let j = 0; j < this.hiddenCount; j++) {
        clone.weightsHO[i][j] = this.weightsHO[i][j];
      }
    }
    
    // Copy biases
    for (let i = 0; i < this.hiddenCount; i++) {
      clone.biasH[i] = this.biasH[i];
    }
    for (let i = 0; i < this.outputCount; i++) {
      clone.biasO[i] = this.biasO[i];
    }
    
    return clone;
  }

  mutate(rate) {
    const mutateVal = (val) => {
      if (Math.random() < rate) {
        // Uniform offset perturbation
        return val + (Math.random() * 2 - 1) * 0.25;
      }
      return val;
    };
    
    for (let i = 0; i < this.hiddenCount; i++) {
      for (let j = 0; j < this.inputCount; j++) {
        this.weightsIH[i][j] = mutateVal(this.weightsIH[i][j]);
      }
    }
    for (let i = 0; i < this.outputCount; i++) {
      for (let j = 0; j < this.hiddenCount; j++) {
        this.weightsHO[i][j] = mutateVal(this.weightsHO[i][j]);
      }
    }
    for (let i = 0; i < this.hiddenCount; i++) {
      this.biasH[i] = mutateVal(this.biasH[i]);
    }
    for (let i = 0; i < this.outputCount; i++) {
      this.biasO[i] = mutateVal(this.biasO[i]);
    }
  }
}

// Uniform Crossover between two parent networks
function crossover(brainA, brainB) {
  const child = new NeuralNetwork(brainA.inputCount, brainA.hiddenCount, brainA.outputCount);
  
  for (let i = 0; i < child.hiddenCount; i++) {
    for (let j = 0; j < child.inputCount; j++) {
      child.weightsIH[i][j] = Math.random() < 0.5 ? brainA.weightsIH[i][j] : brainB.weightsIH[i][j];
    }
  }
  for (let i = 0; i < child.outputCount; i++) {
    for (let j = 0; j < child.hiddenCount; j++) {
      child.weightsHO[i][j] = Math.random() < 0.5 ? brainA.weightsHO[i][j] : brainB.weightsHO[i][j];
    }
  }
  for (let i = 0; i < child.hiddenCount; i++) {
    child.biasH[i] = Math.random() < 0.5 ? brainA.biasH[i] : brainB.biasH[i];
  }
  for (let i = 0; i < child.outputCount; i++) {
    child.biasO[i] = Math.random() < 0.5 ? brainA.biasO[i] : brainB.biasO[i];
  }
  
  return child;
}

// --- Rover Agent Class (Autonomous car) ---
class Rover {
  constructor(x, y, angle, brain = null) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    
    this.angle = angle;
    this.speed = 0;
    
    // Physics constants
    this.maxSpeed = 3.5;
    this.acceleration = 0.12;
    this.friction = 0.97;
    this.maxTurnSpeed = 0.055;
    
    // Sensor rays
    this.maxRayDist = 150;
    this.rayAngles = [-Math.PI / 4, -Math.PI / 8, 0, Math.PI / 8, Math.PI / 4]; // 5 rays
    this.sensorReadings = [0, 0, 0, 0, 0];
    this.activeRays = []; // Coordinates of closest intersections
    
    // Brain: 5 inputs (sensors), 6 hidden, 2 outputs (steer, throttle)
    this.brain = brain || new NeuralNetwork(5, 6, 2);
    
    // Genetic scoring metrics
    this.isDead = false;
    this.checkpointCount = 0;
    this.nextCpIndex = 1; // start heading to checkpoint index 1
    this.distanceScore = 0;
    this.survivalTimer = 0;
    this.framesSinceLastCp = 0;
  }

  update() {
    if (this.isDead) return;
    
    this.prevX = this.x;
    this.prevY = this.y;
    
    // 1. Gather sensor inputs by raycasting
    this.castRays();
    
    // 2. Feedforward inputs into Neural Network Brain
    const outputs = this.brain.feedForward(this.sensorReadings);
    
    // Output 0: steering (tanh output -1 to 1)
    const steer = outputs[0]; 
    
    // Output 1: throttle (tanh output mapped to forward 0 to 1)
    const throttle = (outputs[1] + 1) / 2;
    
    // 3. Apply physics updates
    this.angle += steer * this.maxTurnSpeed;
    this.speed += throttle * this.acceleration;
    this.speed *= this.friction;
    this.speed = Math.max(0, Math.min(this.maxSpeed, this.speed));
    
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    
    // 4. Update fitness score and survivability
    this.survivalTimer++;
    this.framesSinceLastCp++;
    if (this.speed > 0.1) {
      this.distanceScore += this.speed;
    }
    
    // 5. Evaluate checkpoint crossings
    this.checkCheckpoints();
    
    // 6. Check collisions with boundaries
    this.checkCollisions();
    
    // 7. Survival limit constraint (prevent parking/spinning)
    if (this.framesSinceLastCp > 180) {
      this.isDead = true;
    }
  }

  castRays() {
    this.activeRays = [];
    this.sensorReadings = [];
    
    for (let i = 0; i < this.rayAngles.length; i++) {
      const theta = this.angle + this.rayAngles[i];
      const rayStart = { x: this.x, y: this.y };
      const rayEnd = {
        x: this.x + Math.cos(theta) * this.maxRayDist,
        y: this.y + Math.sin(theta) * this.maxRayDist
      };
      
      let closestIntersect = null;
      let minDst = Infinity;
      
      // Intersect with all outer walls
      for (let j = 0; j < outerWalls.length; j++) {
        const wall = outerWalls[j];
        const intersect = getLineIntersection(rayStart, rayEnd, wall.p1, wall.p2);
        if (intersect && intersect.dist < minDst) {
          minDst = intersect.dist;
          closestIntersect = intersect;
        }
      }
      
      // Intersect with all inner walls
      for (let j = 0; j < innerWalls.length; j++) {
        const wall = innerWalls[j];
        const intersect = getLineIntersection(rayStart, rayEnd, wall.p1, wall.p2);
        if (intersect && intersect.dist < minDst) {
          minDst = intersect.dist;
          closestIntersect = intersect;
        }
      }
      
      if (closestIntersect) {
        this.activeRays.push(closestIntersect);
        // Normalize: close obstacle -> 1, far obstacle -> 0
        this.sensorReadings.push(1 - (minDst * this.maxRayDist) / this.maxRayDist);
      } else {
        this.activeRays.push(rayEnd);
        this.sensorReadings.push(0);
      }
    }
  }

  checkCheckpoints() {
    const cp = checkpoints[this.nextCpIndex];
    const prevPos = { x: this.prevX, y: this.prevY };
    const currPos = { x: this.x, y: this.y };
    
    // Check if the segment of motion crossed the checkpoint segment line
    const crossed = getLineIntersection(prevPos, currPos, cp.p1, cp.p2);
    if (crossed) {
      this.checkpointCount++;
      this.nextCpIndex = (this.nextCpIndex + 1) % checkpoints.length;
      this.framesSinceLastCp = 0;
    }
  }

  checkCollisions() {
    const corners = this.getCorners();
    
    // Check if any of the rover edges intersect with any wall boundary
    for (let i = 0; i < 4; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % 4];
      
      // Outer walls check
      for (let j = 0; j < outerWalls.length; j++) {
        if (getLineIntersection(p1, p2, outerWalls[j].p1, outerWalls[j].p2)) {
          this.isDead = true;
          return;
        }
      }
      // Inner walls check
      for (let j = 0; j < innerWalls.length; j++) {
        if (getLineIntersection(p1, p2, innerWalls[j].p1, innerWalls[j].p2)) {
          this.isDead = true;
          return;
        }
      }
    }
  }

  getCorners() {
    const w = 12; // width
    const l = 20; // length
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    
    return [
      { // Front-Right
        x: this.x + cos * (l/2) - sin * (w/2),
        y: this.y + sin * (l/2) + cos * (w/2)
      },
      { // Front-Left
        x: this.x + cos * (l/2) + sin * (w/2),
        y: this.y + sin * (l/2) - cos * (w/2)
      },
      { // Back-Left
        x: this.x - cos * (l/2) + sin * (w/2),
        y: this.y - sin * (l/2) - cos * (w/2)
      },
      { // Back-Right
        x: this.x - cos * (l/2) - sin * (w/2),
        y: this.y - sin * (l/2) + cos * (w/2)
      }
    ];
  }

  getFitness() {
    return this.checkpointCount * 10000 + this.distanceScore;
  }
}

// --- Geometry Intersection helper ---
function getLineIntersection(p1, p2, p3, p4) {
  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  const x4 = p4.x, y4 = p4.y;
  
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) return null; // parallel
  
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
  
  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return {
      x: x1 + ua * (x2 - x1),
      y: y1 + ua * (y2 - y1),
      dist: ua // fraction along first segment
    };
  }
  return null;
}

// --- Track Boundaries Generation ---
function generateTrack() {
  innerWalls = [];
  outerWalls = [];
  checkpoints = [];
  
  const trackWidth = 76;
  const n = trackCenter.length;
  
  const outerPoints = [];
  const innerPoints = [];
  
  for (let i = 0; i < n; i++) {
    const curr = trackCenter[i];
    const prev = trackCenter[(i - 1 + n) % n];
    const next = trackCenter[(i + 1) % n];
    
    // Segment direction vectors
    const dir1 = { x: curr.x - prev.x, y: curr.y - prev.y };
    const len1 = Math.hypot(dir1.x, dir1.y);
    const ndir1 = { x: dir1.x / len1, y: dir1.y / len1 };
    
    const dir2 = { x: next.x - curr.x, y: next.y - curr.y };
    const len2 = Math.hypot(dir2.x, dir2.y);
    const ndir2 = { x: dir2.x / len2, y: dir2.y / len2 };
    
    // Average tangent vector
    const tangent = { x: ndir1.x + ndir2.x, y: ndir1.y + ndir2.y };
    const tanLen = Math.hypot(tangent.x, tangent.y);
    const nTangent = { x: tangent.x / tanLen, y: tangent.y / tanLen };
    
    // Normal vector perpendicular to path
    const normal = { x: -nTangent.y, y: nTangent.x };
    
    outerPoints.push({
      x: curr.x + normal.x * (trackWidth / 2),
      y: curr.y + normal.y * (trackWidth / 2)
    });
    
    innerPoints.push({
      x: curr.x - normal.x * (trackWidth / 2),
      y: curr.y - normal.y * (trackWidth / 2)
    });
  }
  
  // Assemble walls
  for (let i = 0; i < n; i++) {
    const nextIdx = (i + 1) % n;
    
    outerWalls.push({
      p1: outerPoints[i],
      p2: outerPoints[nextIdx]
    });
    
    innerWalls.push({
      p1: innerPoints[i],
      p2: innerPoints[nextIdx]
    });
    
    // Checkpoint line segment goes from inner wall point to outer wall point
    checkpoints.push({
      p1: innerPoints[i],
      p2: outerPoints[i]
    });
  }
}

// --- Simulation Initialization ---

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

function initSimulation() {
  generateTrack();
  spawnPopulation();
  setupUI();
}

function spawnPopulation() {
  rovers = [];
  const startPt = trackCenter[0];
  const secondPt = trackCenter[1];
  const startAngle = Math.atan2(secondPt.y - startPt.y, secondPt.x - startPt.x);
  
  for (let i = 0; i < POPULATION_SIZE; i++) {
    rovers.push(new Rover(startPt.x, startPt.y, startAngle));
  }
}

// Create the next generation based on parent weights
function evolveNextGen() {
  // Sort rovers by fitness descending
  rovers.sort((a, b) => b.getFitness() - a.getFitness());
  
  const bestFitness = Math.round(rovers[0].getFitness());
  if (bestFitness > allTimeBestFitness) {
    allTimeBestFitness = bestFitness;
  }
  
  logTerminal(`[GEN ${generation}] Complete. Best Fitness: ${bestFitness} | All-time: ${allTimeBestFitness}`, 'green');
  
  // Select top 15% parents
  const parentPool = rovers.slice(0, 15);
  
  const startPt = trackCenter[0];
  const secondPt = trackCenter[1];
  const startAngle = Math.atan2(secondPt.y - startPt.y, secondPt.x - startPt.x);
  
  const nextGenRovers = [];
  
  // Elitism: copy top performer exactly
  const eliteBrain = parentPool[0].brain.copy();
  nextGenRovers.push(new Rover(startPt.x, startPt.y, startAngle, eliteBrain));
  
  // Breed next generation children
  for (let i = 1; i < POPULATION_SIZE; i++) {
    const parentA = parentPool[Math.floor(Math.random() * parentPool.length)];
    const parentB = parentPool[Math.floor(Math.random() * parentPool.length)];
    
    let childBrain = crossover(parentA.brain, parentB.brain);
    childBrain.mutate(mutationRate);
    
    nextGenRovers.push(new Rover(startPt.x, startPt.y, startAngle, childBrain));
  }
  
  rovers = nextGenRovers;
  generation++;
  
  // Update HUD
  document.getElementById('hud-generation').innerText = generation.toString().padStart(2, '0');
  logTerminal(`[GEN ${generation}] Breeding generation... Mutation rate: ${Math.round(mutationRate*100)}%`, 'muted');
}

function getLeader() {
  // Return the alive rover with highest fitness
  let maxFitness = -Infinity;
  let leader = null;
  
  for (let i = 0; i < rovers.length; i++) {
    const r = rovers[i];
    if (!r.isDead) {
      const f = r.getFitness();
      if (f > maxFitness) {
        maxFitness = f;
        leader = r;
      }
    }
  }
  return leader;
}

// --- Render Loop Functions ---

function drawTrack() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2.5;
  
  // Draw outer boundaries
  ctx.beginPath();
  ctx.moveTo(outerWalls[0].p1.x, outerWalls[0].p1.y);
  for (let i = 0; i < outerWalls.length; i++) {
    ctx.lineTo(outerWalls[i].p2.x, outerWalls[i].p2.y);
  }
  ctx.closePath();
  ctx.stroke();
  
  // Draw inner boundaries
  ctx.beginPath();
  ctx.moveTo(innerWalls[0].p1.x, innerWalls[0].p1.y);
  for (let i = 0; i < innerWalls.length; i++) {
    ctx.lineTo(innerWalls[i].p2.x, innerWalls[i].p2.y);
  }
  ctx.closePath();
  ctx.stroke();
  
  // Draw visual dashed checkpoint markers on radar screen
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < checkpoints.length; i++) {
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(checkpoints[i].p1.x, checkpoints[i].p1.y);
    ctx.lineTo(checkpoints[i].p2.x, checkpoints[i].p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawRover(rover, isLeader = false) {
  const corners = rover.getCorners();
  
  ctx.fillStyle = isLeader ? 'rgba(0, 240, 255, 0.45)' : 'rgba(255, 255, 255, 0.15)';
  ctx.strokeStyle = isLeader ? 'rgba(0, 240, 255, 0.95)' : 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = isLeader ? 2 : 1;
  
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < 4; i++) {
    ctx.lineTo(corners[i].x, corners[i].y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Draw indicator direction line inside the leader
  if (isLeader) {
    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.moveTo(rover.x, rover.y);
    ctx.lineTo(rover.x + Math.cos(rover.angle) * 12, rover.y + Math.sin(rover.angle) * 12);
    ctx.stroke();
  }
}

function drawSensorRays(rover) {
  // Draw Leader sensor rays
  ctx.lineWidth = 1;
  for (let i = 0; i < rover.activeRays.length; i++) {
    const end = rover.activeRays[i];
    const reading = rover.sensorReadings[i];
    
    // Adjust colors from cyan (far) to red (colliding)
    ctx.strokeStyle = `rgba(255, ${Math.floor(240 * (1 - reading))}, ${Math.floor(255 * (1 - reading))}, 0.55)`;
    
    ctx.beginPath();
    ctx.moveTo(rover.x, rover.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    
    // Draw small dot on wall intersection point
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(end.x, end.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- Main Engine Simulation Loop ---

function animate() {
  // Multi-step calculations per frame for execution speed acceleration
  for (let step = 0; step < speedMultiplier; step++) {
    let aliveCount = 0;
    
    for (let i = 0; i < rovers.length; i++) {
      const r = rovers[i];
      if (!r.isDead) {
        r.update();
        aliveCount++;
      }
    }
    
    // If everyone is dead, generate crossover offspring (Generation N+1)
    if (aliveCount === 0) {
      evolveNextGen();
      break;
    }
  }
  
  // Render updates
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Technical radar green grids
  drawRadarGrids();
  
  // Draw Track boundaries
  drawTrack();
  
  const leader = getLeader();
  const aliveCount = rovers.filter(r => !r.isDead).length;
  
  // Draw standard rovers
  for (let i = 0; i < rovers.length; i++) {
    const r = rovers[i];
    if (!r.isDead && r !== leader) {
      drawRover(r, false);
      if (drawAllRays) {
        drawSensorRays(r);
      }
    }
  }
  
  // Draw the leader rover last (on top, in bright neon cyan)
  if (leader) {
    drawRover(leader, true);
    drawSensorRays(leader); // always draw the leader's rays
    
    // Update live best stats
    const leadFitness = Math.round(leader.getFitness());
    document.getElementById('hud-best-fitness').innerText = leadFitness;
    if (leadFitness > allTimeBestFitness) {
      allTimeBestFitness = leadFitness;
    }
  }
  
  document.getElementById('hud-alive').innerText = `${aliveCount} / ${POPULATION_SIZE}`;
  document.getElementById('hud-all-time').innerText = allTimeBestFitness;
  
  requestAnimationFrame(animate);
}

function drawRadarGrids() {
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.02)';
  ctx.lineWidth = 1;
  
  // Draw concentric radar circle grids
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2);
  ctx.arc(canvas.width / 2, canvas.height / 2, 220, 0, Math.PI * 2);
  ctx.arc(canvas.width / 2, canvas.height / 2, 340, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw grid intersecting lines
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
}

// --- Controller Interfacing ---

function setupUI() {
  const sliderSpeed = document.getElementById('slider-speed');
  const labelSpeed = document.getElementById('label-speed');
  sliderSpeed.addEventListener('input', (e) => {
    speedMultiplier = parseInt(e.target.value);
    labelSpeed.innerText = `${speedMultiplier}x`;
  });
  
  const sliderMutation = document.getElementById('slider-mutation');
  const labelMutation = document.getElementById('label-mutation');
  sliderMutation.addEventListener('input', (e) => {
    mutationRate = parseFloat(e.target.value);
    labelMutation.innerText = `${Math.round(mutationRate * 100)}%`;
  });
  
  const checkRays = document.getElementById('check-all-rays');
  checkRays.addEventListener('change', (e) => {
    drawAllRays = e.target.checked;
  });
  
  document.getElementById('btn-restart').addEventListener('click', () => {
    logTerminal('[SYS] Triggering manual mutation phase. Spawning next gen.', 'orange');
    evolveNextGen();
  });
  
  document.getElementById('btn-new-track').addEventListener('click', randomizeTrackShape);
}

function randomizeTrackShape() {
  logTerminal('[SYS] Recalibrating coordinates. Generating new track shape.', 'orange');
  
  trackCenter.forEach((pt, idx) => {
    if (idx === 0 || idx === 1) return; // preserve starting alignment coordinates
    pt.x = initialTrackCenter[idx].x + (Math.random() * 2 - 1) * 35;
    pt.y = initialTrackCenter[idx].y + (Math.random() * 2 - 1) * 35;
  });
  
  generateTrack();
  spawnPopulation();
  logTerminal('[SYS] Track boundaries randomized. Simulation rebooted.', 'muted');
}

function logTerminal(message, type = 'info') {
  const log = document.getElementById('terminal-log');
  const line = document.createElement('div');
  line.className = `log-line text-${type}`;
  line.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
  
  log.appendChild(line);
  log.scrollTop = log.scrollHeight; // Autoscroll to bottom
  
  // Slice terminal size to prevent performance lag
  while (log.children.length > 25) {
    log.removeChild(log.firstChild);
  }
}

// --- Initial simulation Boot ---
initSimulation();
animate();
