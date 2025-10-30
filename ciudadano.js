class Ciudadano extends Persona {
  constructor(textureData, x, y, juego) {
    super(x, y, juego);
    this.cargarSpritesAnimados(textureData, 15);
    this.cambiarAnimacion("idleAbajo")
    console.log("Los Ciudadanos fueron insertados correctamente", textureData, x, y, juego)
    this.asignarTarget({posicion: {x: Math.random() * 500, y: Math.random() * 500}});
  }


  moverseUnaVezLlegadoAlObjetivo(){
    if(calcularDistancia(this.posicion, this.target.posicion) < 100){
      this.asignarTarget({posicion: {x: Math.random() * this.juego.width, y: Math.random() * this.juego.height}});
      console.log("El Ciudadano llego al Target")
    }
  }

  
  tick() {
    super.tick()
    this.moverseUnaVezLlegadoAlObjetivo()
  }
}