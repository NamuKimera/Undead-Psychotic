class Ciudadano extends GameObject {
  constructor(texture, x, y, juego) {
    super(texture, x, y, juego);
  }

  getOtrosCiudadanos() {
    return this.juego.conejitos;
  }
}