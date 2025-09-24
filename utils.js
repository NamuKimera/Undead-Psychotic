function radianesAGrados(radianes) {
  return radianes * (180 / Math.PI);
}

function calcularDistancia(obj1, obj2) {
  const dx = obj2.x - obj1.x;
  const dy = obj2.y - obj1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function limitarVector(vector, magnitudMaxima) {
  const magnitudActual = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  if (magnitudActual > magnitudMaxima) {
    const escala = magnitudMaxima / magnitudActual;
    return {
      x: vector.x * escala,
      y: vector.y * escala,
    };
  }

  // Si ya está dentro del límite, se devuelve igual
  return { ...vector };
}

// Configuración
const config = {
  boidCount: 150,
  maxSpeed: 2.5,
  maxForce: 0.1,
  visionRange: 50,
  separationDistance: 25,
  alignmentDistance: 40,
  cohesionDistance: 45,
  separationFactor: 1.5,
  alignmentFactor: 1.0,
  cohesionFactor: 1.0,
  edgeAvoidance: 0.5
};

let boids = [];
let isPaused = false;
let frameCount = 0;
let lastTime = performance.now();

// Inicializar boids
function initBoids() {
  // Limpiar boids existentes
  boids.forEach(boid => boid.destroy());
  boids = [];

  // Crear nuevos boids
  for (let i = 0; i < config.boidCount; i++) {
  const x = Math.random() * app.screen.width;
  const y = Math.random() * app.screen.height;
  boids.push(new Boid(x, y));
  }
}

// Setup controles
function setupControls() {
  const controls = {
    boidCount: ['boidCountSlider', 'boidCount', (v) => parseInt(v)],
    maxSpeed: ['maxSpeedSlider', 'maxSpeed', (v) => parseFloat(v)],
    maxForce: ['maxForceSlider', 'maxForce', (v) => parseFloat(v)],
    visionRange: ['visionRangeSlider', 'visionRange', (v) => parseInt(v)],
    separationDistance: ['separationDistanceSlider', 'separationDistance', (v) => parseInt(v)],
    alignmentDistance: ['alignmentDistanceSlider', 'alignmentDistance', (v) => parseInt(v)],
    cohesionDistance: ['cohesionDistanceSlider', 'cohesionDistance', (v) => parseInt(v)],
    separationFactor: ['separationFactorSlider', 'separationFactor', (v) => parseFloat(v)],
    alignmentFactor: ['alignmentFactorSlider', 'alignmentFactor', (v) => parseFloat(v)],
    cohesionFactor: ['cohesionFactorSlider', 'cohesionFactor', (v) => parseFloat(v)],
    edgeAvoidance: ['edgeAvoidanceSlider', 'edgeAvoidance', (v) => parseFloat(v)]
  };

  Object.keys(controls).forEach(key => {
    const [sliderId, displayId, parser] = controls[key];
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);

    slider.addEventListener('input', (e) => {
      const value = parser(e.target.value);
      config[key] = value;
      display.textContent = value;

      // Si cambió el número de boids, reinicializar
      if (key === 'boidCount') {
          initBoids();
      }
    });
  });
}

// Función de animación
function animate() {
  if (!isPaused) {
    // Actualizar cada boid
    boids.forEach(boid => boid.update());
    // Calcular FPS
    frameCount++;
    const currentTime = performance.now();
    if (currentTime - lastTime >= 1000) {
      document.getElementById('fps').textContent = frameCount;
      frameCount = 0;
      lastTime = currentTime;
    }

    // Actualizar stats
    document.getElementById('activeBoids').textContent = boids.length;
  }

  requestAnimationFrame(animate);
}

// Funciones de control
function resetBoids() {
  initBoids();
}

function togglePause() {
  isPaused = !isPaused;
  document.getElementById('pauseBtn').textContent = isPaused ? 'Reanudar' : 'Pausar';
}