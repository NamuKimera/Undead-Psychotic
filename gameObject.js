class GameObject {
  //defino las propiedades q tiene mi clase, aunq podria no definirlas
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

  constructor(x, y, juego) {
    // Rango de visión aleatorio entre 400-700 píxeles
    this.vision = Math.random() * 300 + 400;

    // Sistema de física vectorial 2D
    this.posicion = { x: x, y: y }; // Posición actual en píxeles
    this.velocidad = { x: 0, y: 0 }; // Velocidad en píxeles/frame
    this.aceleracion = { x: 0, y: 0 }; // Aceleración en píxeles/frame²

    // Límites físicos para estabilidad del sistema
    this.aceleracionMaxima = 0.2; // Máxima aceleración aplicable
    this.velocidadMaxima = 3; // Velocidad terminal del objeto

    // Propiedades de colisión y combate
    this.radio = 12; // Radio de colisión en píxeles
    this.rangoDeAtaque = 25 + Math.random() * 10; // Rango aleatorio 25-35 píxeles

    // Referencias del sistema
    this.juego = juego; // Referencia al motor del juego
    this.id = Math.floor(Math.random() * 9999999999999); // ID único aleatorio

    // Configuración del sistema de renderizado PIXI.js
    this.container = new PIXI.Container(); // Container para agrupar elementos visuales
    this.container.label = "gameObject - " + this.id;
    this.container.x = x; // Posición inicial X en pantalla
    this.container.y = y; // Posición inicial Y en pantalla

    // Jerarquía de renderizado: Juego -> ContainerPrincipal -> Container -> Sprite
    // El containerPrincipal maneja la cámara y el scrolling del mundo
    // this.juego.containerPrincipal.addChild(this.container);
  }

  cambiarAnimacion(cual) {
    //hacemos todos invisibles
    for (let key of Object.keys(this.spritesAnimados)) {
      this.spritesAnimados[key].visible = false;
    }
    //y despues hacemos visible el q queremos
    this.spritesAnimados[cual].visible = true;
  }

  

  tick() {
    //TODO: hablar de deltatime
    this.aceleracion.x = 0;
    this.aceleracion.y = 0;

    this.separacion();

    this.escapar();
    this.perseguir();
    this.limitarAceleracion();
    this.velocidad.x +=
      this.aceleracion.x * this.juego.pixiApp.ticker.deltaTime;
    this.velocidad.y +=
      this.aceleracion.y * this.juego.pixiApp.ticker.deltaTime;

    //variaciones de la velocidad
    this.rebotar();
    this.aplicarFriccion();
    this.limitarVelocidad();

    //pixeles por frame
    this.posicion.x += this.velocidad.x * this.juego.pixiApp.ticker.deltaTime;
    this.posicion.y += this.velocidad.y * this.juego.pixiApp.ticker.deltaTime;

    //guardamos el angulo
    this.angulo =
      radianesAGrados(Math.atan2(this.velocidad.y, this.velocidad.x)) + 180;

    this.velocidadLineal = Math.sqrt(
      this.velocidad.x * this.velocidad.x + this.velocidad.y * this.velocidad.y
    );
  }

  async crearSombra() {
    await PIXI.Assets.load({alias: "sombra", src: "assets/pixelart/sombra.png"});
    this.sombra = new PIXI.Sprite(PIXI.Assets.get("sombra"));

    this.sombra.zIndex = -1;
    this.sombra.anchor.set(0.5, 0.5);
    this.sombra.width = this.radio * 3;
    this.sombra.height = this.radio * 1.33;
    this.sombra.alpha = 0.8;
    this.container.addChild(this.sombra);
  }
  
  separacion() {
    let promedioDePosicionDeAquellosQEstanMuyCercaMio = { x: 0, y: 0 };
    let contador = 0;

    for (let persona of this.juego.personas) {
      if (this != persona) {
        if (
          calcularDistancia(this.posicion, persona.posicion) <
          this.distanciaPersonal
        ) {
          contador++;
          promedioDePosicionDeAquellosQEstanMuyCercaMio.x += persona.posicion.x;
          promedioDePosicionDeAquellosQEstanMuyCercaMio.y += persona.posicion.y;
        }
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

  cambiarDeSpriteAnimadoSegunAngulo() {
    //0 grados es a la izq, abre en sentido horario, por lo cual 180 es a la derecha
    //90 es para arriba
    //270 abajo

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

  asignarVelocidad(x, y) {
    this.velocidad.x = x;
    this.velocidad.y = y;
  }

  render() {
    this.container.x = this.posicion.x;
    this.container.y = this.posicion.y;

    this.container.zIndex = this.posicion.y;

    this.cambiarDeSpriteAnimadoSegunAngulo();
    this.cambiarVelocidadDeAnimacionSegunVelocidadLineal();
  }

  cambiarVelocidadDeAnimacionSegunVelocidadLineal() {
    const keys = Object.keys(this.spritesAnimados);
    for (let key of keys) {
      this.spritesAnimados[key].animationSpeed =
        this.velocidadLineal * 0.05 * this.juego.pixiApp.ticker.deltaTime;
    }
  }
}
