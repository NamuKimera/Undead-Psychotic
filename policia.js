class Policia extends Persona {
    constructor(texture, x, y, juego) {
      super(texture, x, y, juego);
    }

    tick() {
        // Algoritmo boid con otros policías
        BoidAlgorithm.separacion(this, this.juego.policias);
        BoidAlgorithm.alineacion(this, this.juego.policias);
        BoidAlgorithm.cohesion(this, this.juego.policias);

        // Perseguir al asesino si lo ve
        if (this.juego.asesino) {
          const dist = calcularDistancia(this.posicion, this.juego.asesino.posicion);
          if (dist < this.vision) {
            BoidAlgorithm.perseguir(this, this.juego.asesino);
          }
        }

        this.limitarAceleracion();
        this.velocidad.x += this.aceleracion.x * this.juego.pixiApp.ticker.deltaTime;
        this.velocidad.y += this.aceleracion.y * this.juego.pixiApp.ticker.deltaTime;
        this.rebotar();
        this.aplicarFriccion();
        this.limitarVelocidad();
        this.posicion.x += this.velocidad.x * this.juego.pixiApp.ticker.deltaTime;
        this.posicion.y += this.velocidad.y * this.juego.pixiApp.ticker.deltaTime;
    }
}