class Ciudadano extends Persona {
  constructor(texture, x, y, juego) {
      super(texture, x, y, juego);
  }

  tick() {
    super.tick();
    // Algoritmo boid con otros ciudadanos
    // Huir si ve al asesino
    if (this.juego.asesino) {
      const dist = calcularDistancia(this.posicion, this.juego.asesino.posicion);
      this.huirDeAsesino(dist);
    }
  }

  huirDeAsesino(dist) {
    if (dist < this.vision) {
      BoidAlgorithm.escapar(this, this.juego.asesino);
    }
  }
  
  getOtrosCiudadanos() {
    return this.juego.ciudadanos;
  }
}