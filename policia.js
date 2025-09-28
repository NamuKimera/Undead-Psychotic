class Policia extends Persona {
    constructor(texture, x, y, juego) {
      super(texture, x, y, juego);
    }

    perseguirAsesino(dist) {
    if (dist < this.vision) {
      BoidAlgorithm.perseguir(this, this.juego.asesino);
    }
  }

    tick() {
      super.tick();
      if (this.juego.asesino) {
        const dist = calcularDistancia(this.posicion, this.juego.asesino.posicion);
        this.perseguirAsesino(dist);
      }
  }
}