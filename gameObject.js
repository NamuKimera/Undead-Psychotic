class GameObject {
  // Propiedades de la clase
  sprite;
  id;
  x = 0;
  y = 0;
  target;
  perseguidor;
  aceleracionMaxima = 0.2;
  velocidadMaxima = 3;
  spritesAnimados = {};
  radio = 10;
  distanciaPersonal = 20;
  distanciaParaLlegar = 300;
  container; // Añadido para manejar el contenedor

  constructor(textureData, x, y, juego) {
    this.container = new PIXI.Container(); // Crea el contenedor
    this.container.name = "container";
    this.vision = Math.random() * 200 + 1300;
    this.posicion = { x: x, y: y };
    this.velocidad = { x: Math.random() * 10, y: Math.random() * 10 };
    this.aceleracion = { x: 0, y: 0 };
    this.juego = juego;
    this.id = Math.floor(Math.random() * 99999999);


    this.cargarSpritesAnimados(textureData);
    this.cambiarAnimacion("caminarAbajo");
    this.juego.pixiApp.stage.addChild(this.container);
  }

  cambiarAnimacion(cual) {
    for (let key of Object.keys(this.spritesAnimados)) {
      this.spritesAnimados[key].visible = false;
    }
    if (this.spritesAnimados[cual]) { // Verifica si la animación existe
      this.spritesAnimados[cual].visible = true;
    }
  }

  cargarSpritesAnimados(textureData) {
    for (let key of Object.keys(textureData.animations)) {
      this.spritesAnimados[key] = new PIXI.AnimatedSprite(textureData.animations[key]);

      this.spritesAnimados[key].play();
      this.spritesAnimados[key].loop = true;
      this.spritesAnimados[key].animationSpeed = 0.1;
      this.spritesAnimados[key].scale.set(2);
      this.spritesAnimados[key].anchor.set(0.5, 1);

      this.container.addChild(this.spritesAnimados[key]);
    }
  }

  cambiarDeSpriteAnimadoSegunAngulo() {
    if ((this.angulo > 315 && this.angulo < 360) || this.angulo < 45) {
      this.cambiarAnimacion("caminarDerecha");
      this.spritesAnimados.caminarDerecha.scale.x = -2;
    } else if (this.angulo > 135 && this.angulo < 225) {
      this.cambiarAnimacion("caminarDerecha");
      this.spritesAnimados.caminarDerecha.scale.x = 2;
    } else if (this.angulo < 135 && this.angulo > 45) {
      this.cambiarAnimacion("caminarArriba");
    } else {
      this.cambiarAnimacion("caminarAbajo");
    }
  }

  cambiarVelocidadDeAnimacionSegunVelocidadLineal() {
    const keys = Object.keys(this.spritesAnimados);
    for (let key of keys) {
      this.spritesAnimados[key].animationSpeed =
        this.velocidadLineal * 0.05 * this.juego.pixiApp.ticker.deltaTime;
    }
  }

  limitarAceleracion() {
    this.aceleracion = limitarVector(this.aceleracion, this.aceleracionMaxima);
  }

  limitarVelocidad() {
    this.velocidad = limitarVector(this.velocidad, this.velocidadMaxima);
  }

  aplicarFriccion() {
    const friccion = Math.pow(0.95, this.juego.pixiApp.ticker.deltaTime);
    this.velocidad.x *= friccion;
    this.velocidad.y *= friccion;
  }

  rebotar() {
    //ejemplo mas realista
    if (this.posicion.x > this.juego.width || this.posicion.x < 0) {
      //si la coordenada X de este conejito es mayor al ancho del stage,
      //o si la coordenada X.. es menor q 0 (o sea q se fue por el lado izquierdo)
      //multiplicamos por -0.99, o sea que se invierte el signo (si era positivo se hace negativo y vicecversa)
      //y al ser 0.99 pierde 1% de velocidad
      this.velocidad.x *= -0.99;
    }

    if (this.posicion.y > this.juego.height || this.posicion.y < 0) {
      this.velocidad.y *= -0.99;
    }
  }

  asignarTarget(quien) {
    this.target = quien;
  }

  escapar() {
    if (!this.perseguidor) return;
    const dist = calcularDistancia(this.posicion, this.perseguidor.posicion);
    if (dist > this.vision) return;

    const difX = this.perseguidor.posicion.x - this.posicion.x;
    const difY = this.perseguidor.posicion.y - this.posicion.y;

    let vectorTemporal = {
      x: -difX,
      y: -difY,
    };
    vectorTemporal = limitarVector(vectorTemporal, 1);

    this.aceleracion.x += -vectorTemporal.x;
    this.aceleracion.y += -vectorTemporal.y;
  }

  separacion() {
    let promedioDePosicionDeAquellosQEstanMuyCercaMio = { x: 0, y: 0 };
    let contador = 0;

    for (let persona of this.juego.asesino) {
      if (this != persona) {
        this.subseparacion1(persona);
      }
    }

    if (contador == 0) return;

    promedioDePosicionDeAquellosQEstanMuyCercaMio.x /= contador;
    promedioDePosicionDeAquellosQEstanMuyCercaMio.y /= contador;

    let vectorQueSeAlejaDelPromedioDePosicion = {
      x: this.posicion.x - promedioDePosicionDeAquellosQEstanMuyCercaMio.x,
      y: this.posicion.y - promedioDePosicionDeAquellosQEstanMuyCercaMio.y,
    };

    vectorQueSeAlejaDelPromedioDePosicion = limitarVector(
      vectorQueSeAlejaDelPromedioDePosicion,
      1
    );

    const factor = 10;

    this.aceleracion.x += vectorQueSeAlejaDelPromedioDePosicion.x * factor;
    this.aceleracion.y += vectorQueSeAlejaDelPromedioDePosicion.y * factor;
  }

  subseparacion1(persona){
    if (calcularDistancia(this.posicion, persona.posicion) < this.distanciaPersonal) {
      contador++;
      promedioDePosicionDeAquellosQEstanMuyCercaMio.x += persona.posicion.x;
      promedioDePosicionDeAquellosQEstanMuyCercaMio.y += persona.posicion.y;
    }
  }

  getCiudadanoRandom() {
    return this.ciudadanos[Math.floor(Math.random() * this.ciudadanos.length)];
  }

  perseguir() {
    if (!this.target) return;
    const dist = calcularDistancia(this.posicion, this.target.posicion);
    if (dist > this.vision) return;

    // Decaimiento exponencial: va de 1 a 0 a medida que se acerca
    let factor = Math.pow(dist / this.distanciaParaLlegar, 3);

    const difX = this.target.posicion.x - this.posicion.x;
    const difY = this.target.posicion.y - this.posicion.y;

    let vectorTemporal = {
      x: -difX,
      y: -difY,
    };
    vectorTemporal = limitarVector(vectorTemporal, 1);

    this.aceleracion.x += -vectorTemporal.x * factor;
    this.aceleracion.y += -vectorTemporal.y * factor;
  }

  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };
    };
  }

  asignarTargets() {
    for (let ciu of this.ciudadanos) {
      ciu.asignarTarget(this.getCiudadanoRandom());
    }
  }

  asignarElMouseComoTargetATodosLosCiudadanos() {
    for (let ciu of this.ciudadanos) {
      ciu.asignarTarget(this.mouse);
    }
  }

  asignarPerseguidorRandomATodos() {
    for (let ciu of this.ciudadanos) {
      ciu.perseguidor = this.getCiudadanoRandom();
    }
  }
  asignarElMouseComoPerseguidorATodosLosCiudadanos() {
    for (let ciu of this.ciudadanos) {
      ciu.perseguidor = this.mouse;
    }
  }

  tick() {
    //TODO: hablar de deltatime
    this.aceleracion.x = 0;
    this.aceleracion.y = 0;

    this.separacion();

    this.escapar();
    this.perseguir();
    this.limitarAceleracion();
    this.velocidad.x += this.aceleracion.x * this.juego.pixiApp.ticker.deltaTime;
    this.velocidad.y += this.aceleracion.y * this.juego.pixiApp.ticker.deltaTime;

    //variaciones de la velocidad
    this.rebotar();
    this.aplicarFriccion();
    this.limitarVelocidad();

    //pixeles por frame
    this.posicion.x += this.velocidad.x * this.juego.pixiApp.ticker.deltaTime;
    this.posicion.y += this.velocidad.y * this.juego.pixiApp.ticker.deltaTime;

    //guardamos el angulo
    this.angulo = radianesAGrados(Math.atan2(this.velocidad.y, this.velocidad.x)) + 180;

    this.velocidadLineal = Math.sqrt(this.velocidad.x * this.velocidad.x + this.velocidad.y * this.velocidad.y);
  }

  render() {
    this.container.x = this.posicion.x;
    this.container.y = this.posicion.y;

    this.container.zIndex = this.posicion.y;

    this.cambiarDeSpriteAnimadoSegunAngulo();
    this.cambiarVelocidadDeAnimacionSegunVelocidadLineal();
  }
}
