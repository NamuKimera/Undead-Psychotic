class Persona extends GameObject {
    constructor() {
        
    }

    cambiarDeSpriteSegunVelocidad() {
    if (this.calcularVelocidadLineal() > 0) {
      this.cambiarSpriteAnimado("caminar");
    } else {
      this.cambiarSpriteAnimado("parado");
    }
  }
}