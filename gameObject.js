class GameObject {
  // Propiedades
  id;
  x = 0;
  y = 0;
  target;
  posicion;
  velocidad;
  aceleracion;
  perseguidor;
  aceleracionMaxima = 1;
  velocidadMaxima = 3;
  spritesAnimados = {};
  radio = 10;
  distanciaPersonal = 20;
  distanciaParaLlegar = 300;

  constructor(textureData, x, y, juego) {
    this.container = new PIXI.Container();
    this.container.label = "container";
    this.vision = Math.random() * 200 + 1300;
    this.angulo = Math.random() * 360;
    this.posicion = { x: x, y: y };
    this.velocidad = { x: Math.random() * 10, y: Math.random() * 10 };
    this.aceleracion = { x: 0, y: 0 };
    this.juego = juego;
    this.posicion = new Vector2D(x, y);
    this.velocidad = new Vector2D(Math.random() * 2, Math.random() * 2);
    this.aceleracion = new Vector2D(0, 0);
    this.id = Math.floor(Math.random() * 99999999);

    // Cargar sprites animados
    this.cargarSpritesAnimados(textureData);
    this.cambiarAnimacion("caminarAbajo");
    // Opcional: referencia al sprite principal
    this.sprite = this.spritesAnimados["caminarAbajo"];

    // Agregar solo el container al stage
    this.juego.pixiApp.stage.addChild(this.container);
  }

  cambiarAnimacion(cual) {
    for (let key of Object.keys(this.spritesAnimados)) {
      this.spritesAnimados[key].visible = false;
    }
    if (this.spritesAnimados[cual]) {
      this.spritesAnimados[cual].visible = true;
      this.sprite = this.spritesAnimados[cual]; // Actualiza referencia
    }
  }

  cargarSpritesAnimados(textureData) {
    for (let key of Object.keys(textureData.animations)) {
      this.spritesAnimados[key] = new PIXI.AnimatedSprite(
        textureData.animations[key]
      );
      this.spritesAnimados[key].play();
      this.spritesAnimados[key].loop = true;
      this.spritesAnimados[key].animationSpeed = 0.1;
      this.spritesAnimados[key].scale.set(2);
      this.spritesAnimados[key].anchor.set(0.5, 1);
      this.spritesAnimados[key].visible = false; // Oculta por defecto
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

  limitarAceleracion() {
    this.aceleracion.limit(this.aceleracionMaxima);
  }

  limitarVelocidad() {
    this.velocidad.limit(this.velocidadMaxima);
  }

  aplicarFriccion() {
    const friccion = Math.pow(0.95, this.juego.pixiApp.ticker.deltaTime);
    this.velocidad.multiply(friccion);
  }

  rebotar() {
    if (this.posicion.x > this.juego.width || this.posicion.x < 0) {
      this.velocidad.x *= -0.99;
    }
    if (this.posicion.y > this.juego.height || this.posicion.y < 0) {
      this.velocidad.y *= -0.99;
    }
  }

  asignarVelocidad(x, y) {
    this.velocidad.x = x;
    this.velocidad.y = y;
  }

  asignarTarget(quien) {
    this.target = quien;
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

  tick() {
    this.aceleracion.x = 0;
    this.aceleracion.y = 0;
    BoidAlgorithm.separacion(this, this.juego.ciudadanos);
    BoidAlgorithm.alineacion(this, this.juego.ciudadanos);
    BoidAlgorithm.cohesion(this, this.juego.ciudadanos);
    BoidAlgorithm.escapar(this);
    this.limitarAceleracion();
    this.velocidad.x += this.aceleracion.x * this.juego.pixiApp.ticker.deltaTime;
    this.velocidad.y += this.aceleracion.y * this.juego.pixiApp.ticker.deltaTime;
    this.rebotar();
    this.aplicarFriccion();
    this.limitarVelocidad();
    this.posicion.add(this.velocidad);
    this.angulo = radianesAGrados(Math.atan2(this.velocidad.y, this.velocidad.x)) + 180;
    this.velocidadLineal = Math.sqrt(this.velocidad.x * this.velocidad.x + this.velocidad.y * this.velocidad.y);
  }
}