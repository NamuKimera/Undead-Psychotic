class Asesino extends GameObject {
  constructor(textureData, x, y, juego) {
    super(textureData, x, y, juego);
    // Configuración especial del protagonista
    this.vida = 1;
    this.vision = 1000; // Visión ilimitada
    this.cargarSpritesAnimados(textureData, 15);
    this.cambiarAnimacion("idleAbajo")
    this.container.label = "prota";
    this.factorIrAlTarget = 0.5;
    this.distanciaParaEmpezarABajarLaVelocidad = this.radio * 20;
    this.distanciaAlTarget = Infinity;
    juego.targetCamara = this.asesino;
  }
}