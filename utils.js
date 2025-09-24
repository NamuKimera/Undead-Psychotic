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

class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar) {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
    }
    return this;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag > 0) {
      this.divide(mag);
    }
    return this;
  }

  limit(max) {
    const mag = this.magnitude();
    if (mag > max) {
      this.normalize().multiply(max);
    }
    return this;
  }

  distance(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  clone() {
    return new Vector2D(this.x, this.y);
  }

  static subtract(v1, v2) {
    return new Vector2D(v1.x - v2.x, v1.y - v2.y);
  }
}

class Boid {
  constructor(x, y) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    this.acceleration = new Vector2D();

    // Crear sprite triangular
    this.sprite = new PIXI.Graphics();
    this.updateSprite();

    app.stage.addChild(this.sprite);
  }

  updateSprite() {
    this.sprite.clear();
    this.sprite.beginFill(0x00ff88);
    this.sprite.drawPolygon([
      0, -8,   // punta
      -4, 6,   // base izquierda
      4, 6     // base derecha
    ]);
    this.sprite.endFill();
  }

  update() {
    // Aplicar las reglas de boids
    const sep = this.separate();
    const ali = this.align();
    const coh = this.cohesion();
    const edge = this.avoidEdges();

    // Aplicar factores
    sep.multiply(config.separationFactor);
    ali.multiply(config.alignmentFactor);
    coh.multiply(config.cohesionFactor);
    edge.multiply(config.edgeAvoidance);

    // Sumar fuerzas
    this.acceleration.add(sep);
    this.acceleration.add(ali);
    this.acceleration.add(coh);
    this.acceleration.add(edge);

    // Limitar aceleración
    this.acceleration.limit(config.maxForce);
    // Actualizar velocidad y posición
    this.velocity.add(this.acceleration);
    this.velocity.limit(config.maxSpeed);
    this.position.add(this.velocity);

    // Wrap around edges
    this.wrapEdges();

    // Reset acceleration
    this.acceleration.multiply(0);

    // Actualizar sprite
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;
    this.sprite.rotation = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;
    }

  separate() {
    const steer = new Vector2D();
    let count = 0;

    for (let other of boids) {
      const distance = this.position.distance(other.position);
      if (distance > 0 && distance < config.separationDistance) {
        const diff = Vector2D.subtract(this.position, other.position);
        diff.normalize();
        diff.divide(distance); // Weight by distance
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.divide(count);
      steer.normalize();
      steer.multiply(config.maxSpeed);
      steer.subtract(this.velocity);
      steer.limit(config.maxForce);
    }

    return steer;
  }

  align() {
    const sum = new Vector2D();
    let count = 0;

    for (let other of boids) {
      const distance = this.position.distance(other.position);
      if (distance > 0 && distance < config.alignmentDistance) {
        sum.add(other.velocity);
        count++;
      }
    }

    if (count > 0) {
      sum.divide(count);
      sum.normalize();
      sum.multiply(config.maxSpeed);
      const steer = Vector2D.subtract(sum, this.velocity);
      steer.limit(config.maxForce);
      return steer;
    }

    return new Vector2D();
  }

  cohesion() {
    const sum = new Vector2D();
    let count = 0;

    for (let other of boids) {
      const distance = this.position.distance(other.position);
      if (distance > 0 && distance < config.cohesionDistance) {
        sum.add(other.position);
        count++;
      }
    }

    if (count > 0) {
      sum.divide(count);
      return this.seek(sum);
    }

    return new Vector2D();
  }

  seek(target) {
    const desired = Vector2D.subtract(target, this.position);
    desired.normalize();
    desired.multiply(config.maxSpeed);

    const steer = Vector2D.subtract(desired, this.velocity);
    steer.limit(config.maxForce);
    return steer;
  }

  avoidEdges() {
    const steer = new Vector2D();
    const margin = 50;

    if (this.position.x < margin) {
      steer.x = config.maxSpeed;
    } else if (this.position.x > app.screen.width - margin) {
      steer.x = -config.maxSpeed;
    }

    if (this.position.y < margin) {
      steer.y = config.maxSpeed;
    } else if (this.position.y > app.screen.height - margin) {
      steer.y = -config.maxSpeed;
    }

    return steer;
  }

  wrapEdges() {
    if (this.position.x < -10) this.position.x = app.screen.width + 10;
    if (this.position.x > app.screen.width + 10) this.position.x = -10;
    if (this.position.y < -10) this.position.y = app.screen.height + 10;
    if (this.position.y > app.screen.height + 10) this.position.y = -10;
  }

  destroy() {
    app.stage.removeChild(this.sprite);
  }
}