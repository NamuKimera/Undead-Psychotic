class Ciudadano extends Persona {
  constructor(texture, x, y, juego) {
      super(texture, x, y, juego);
  }

  tick() {
    super.tick();
    // Algoritmo boid con otros ciudadanos
    // Huir si ve al asesino
  }
}