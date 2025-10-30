class Ciudadano extends Persona {
  constructor(textureData, x, y, juego) {
    super(x, y, juego);
    this.cargarSpritesAnimados(textureData, 15);
    this.cambiarAnimacion("idleAbajo")
    console.log("Los Ciudadanos fueron insertados correctamente", textureData, x, y, juego)
  }

  tick() {
    super.tick()
  }
}