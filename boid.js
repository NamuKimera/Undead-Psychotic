class Boid {
    boids = [];
    isPaused = false;
    frameCount = 0;
    lastTime = performance.now();

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

    configuracion(){
        const config = {boidCount: 150, maxSpeed: 2.5, maxForce: 0.1, visionRange: 50, separationDistance: 25, alignmentDistance: 40, cohesionDistance: 45, separationFactor: 1.5, alignmentFactor: 1.0, cohesionFactor: 1.0, edgeAvoidance: 0.5};
        return config;
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
        const separate = this.separate();
        const align = this.align();
        const cohesion = this.cohesion();
        const edge = this.avoidEdges();

        // Aplicar factores
        separate.multiply(config.separationFactor);
        align.multiply(config.alignmentFactor);
        cohesion.multiply(config.cohesionFactor);
        edge.multiply(config.edgeAvoidance);

        // Sumar fuerzas
        this.acceleration.add(separate);
        this.acceleration.add(align);
        this.acceleration.add(cohesion);
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
            this.subseparate1(distance);
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

    subseparate1(distance){
        if (distance > 0 && distance < config.separationDistance) {
            const diff = Vector2D.subtract(this.position, other.position);
            diff.normalize();
            diff.divide(distance); // Weight by distance
            steer.add(diff);
            count++;
        }
    }

    align() {
        const sum = new Vector2D(0,0);
        let count = 0;

        for (let other of boids) {
            const distance = this.position.distance(other.position);
            this.subalign1(distance);
        }

        if (count > 0) {
            sum.divide(count);
            sum.normalize();
            sum.multiply(config.maxSpeed);
            const steer = Vector2D.subtract(sum, this.velocity);
            steer.limit(config.maxForce);
            return steer;
        }

        return new Vector2D(0,0);
    }

    subalign1(distance){
        if (distance > 0 && distance < config.alignmentDistance) {
            sum.add(other.velocity);
            count++;
        }
    }

    cohesion() {
        const sum = new Vector2D(0,0);
        let count = 0;

        for (let other of boids) {
            const distance = this.position.distance(other.position);
            this.subcohesion1(distance);
        }
        if (count > 0) {
            sum.divide(count);
            return this.seek(sum);
        }
        return new Vector2D(0,0);
    }

    subcohesion1(distance){
        if (distance > 0 && distance < config.cohesionDistance) {
            sum.add(other.position);
            count++;
        }
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
        const steer = new Vector2D(0,0);
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

    
    // Inicializar boids
    initBoids() {
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
    setupControls() {
        const controls = { boidCount: ['boidCountSlider', 'boidCount', (v) => parseInt(v)], maxSpeed: ['maxSpeedSlider', 'maxSpeed', (v) => parseFloat(v)], maxForce: ['maxForceSlider', 'maxForce', (v) => parseFloat(v)], visionRange: ['visionRangeSlider', 'visionRange', (v) => parseInt(v)], separationDistance: ['separationDistanceSlider', 'separationDistance', (v) => parseInt(v)], alignmentDistance: ['alignmentDistanceSlider', 'alignmentDistance', (v) => parseInt(v)], cohesionDistance: ['cohesionDistanceSlider', 'cohesionDistance', (v) => parseInt(v)], separationFactor: ['separationFactorSlider', 'separationFactor', (v) => parseFloat(v)], alignmentFactor: ['alignmentFactorSlider', 'alignmentFactor', (v) => parseFloat(v)], cohesionFactor: ['cohesionFactorSlider', 'cohesionFactor', (v) => parseFloat(v)], edgeAvoidance: ['edgeAvoidanceSlider', 'edgeAvoidance', (v) => parseFloat(v)]};

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
    animate() {
        if (!isPaused) {
            // Actualizar cada boid
            boids.forEach(boid => boid.update());

            // Calcular FPS
            frameCount++;
            const currentTime = performance.now();
            this.subTime(currentTime);
            
        // Actualizar stats
            document.getElementById('activeBoids').textContent = boids.length;
        }

        requestAnimationFrame(animate);
    }


    subTime(currentTime){
        if (currentTime - lastTime >= 1000) {
            document.getElementById('fps').textContent = frameCount;
            frameCount = 0;
            lastTime = currentTime;
        }
    }

    // Funciones de control
    resetBoids() {
        initBoids();
    }

    togglePause() {
        isPaused = !isPaused;
        document.getElementById('pauseBtn').textContent = isPaused ? 'Reanudar' : 'Pausar';
    }
}