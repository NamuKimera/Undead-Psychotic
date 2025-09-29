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

    limitarVector(vector, magnitudMaxima) {
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

    calcularDistancia(obj1, obj2) {
        const dx = obj2.x - obj1.x;
        const dy = obj2.y - obj1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    radianesAGrados(radianes) {
        return radianes * (180 / Math.PI);
    }
}

        