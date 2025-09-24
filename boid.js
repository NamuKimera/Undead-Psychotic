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