class Juego {
  pixiApp;
  personas = [];
  asesino;
  width;
  height;
  debug = false;
  barrasDeVidaVisibles = true;
  distanciaALaQueLosObjetosTienenTodaLaLuz = 157;
  factorMagicoArriba = 2;
  factorMagicoAbajo = 2.18;
  teclado = {};
  ahora = performance.now();
  BASE_Z_INDEX = 50000;

  constructor() {
    this.updateDimensions();
    this.anchoDelMapa = 5000;
    this.altoDelMapa = 5000;
    this.mouse = { posicion: { x: 0, y: 0 } };

    // Variables para el zoom
    this.zoom = 1;
    this.minZoom = 0.1;
    this.maxZoom = 2;
    this.zoomStep = 0.1;
    // this.grilla = new Grilla(this, 150, this.anchoDelMapa, this.altoDelMapa);

    this.initPIXI();
    this.setupResizeHandler();
  }

  //async indica q este metodo es asyncronico, es decir q puede usar "await"
  async initPIXI() {
    //creamos la aplicacion de pixi y la guardamos en la propiedad pixiApp
    this.pixiApp = new PIXI.Application();

    this.pixiApp.stage.name = "el stage";

    //esto es para que funcione la extension de pixi
    globalThis.__PIXI_APP__ = this.pixiApp;

    const opcionesDePixi = {
      background: "#1099bb",
      width: this.width,
      height: this.height,
      antialias: false,
      SCALE_MODE: PIXI.SCALE_MODES.NEAREST,
    };

    //inicializamos pixi con las opciones definidas anteriormente
    //await indica q el codigo se frena hasta que el metodo init de la app de pixi haya terminado
    //puede tardar 2ms, 400ms.. no lo sabemos :O
    await this.pixiApp.init(opcionesDePixi);

    // //agregamos el elementos canvas creado por pixi en el documento html
    document.body.appendChild(this.pixiApp.canvas);

    for (let i = 0; i < 1; i++) {
      const x = 0.5 * this.width;
      const y = 0.5 * this.height;
      //crea una instancia de clase Conejito, el constructor de dicha clase toma como parametros la textura
      // q queremos usar,X,Y y una referencia a la instancia del juego (this)
      const animacionesProtagonista = await PIXI.Assets.load("assets/personajes/img/personaje.json");
      const protagonista = new Asesino(animacionesProtagonista, x, y, this);
      this.personas.push(protagonista);
    }

    //agregamos el metodo this.gameLoop al ticker.
    //es decir: en cada frame vamos a ejecutar el metodo this.gameLoop
    this.pixiApp.ticker.add(this.gameLoop.bind(this));

    this.agregarInteractividadDelMouse();

    // this.asignarPerseguidorRandomATodos();
    // this.asignarTargets();
    this.asignarElMouseComoTargetATodasLasPersonas();
  }

  updateDimensions() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  setupResizeHandler() {
    window.addEventListener("resize", () => {
      this.updateDimensions();
      if (this.pixiApp) {
        this.pixiApp.renderer.resize(this.width, this.height);
      }
      // Redimensionar la RenderTexture del sistema de iluminación
      if (this.sistemaDeIluminacion) {
        this.sistemaDeIluminacion.redimensionarRenderTexture();
      }
      if (this.ui) this.ui.resize();
    });
  }

  async crearFondo() {
    this.fondo = new PIXI.TilingSprite(await PIXI.Assets.load("assets/bg.jpg"));
    this.fondo.zIndex = -999999999999999999999;
    this.fondo.tileScale.set(0.5);
    this.fondo.width = this.anchoDelMapa;
    this.fondo.height = this.altoDelMapa;
    this.containerBG.addChild(this.fondo);
  }

  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };
    };
  }

  gameLoop(time) {
    //iteramos por todos los conejitos
    for (let unaPersona of this.personas) {
      //ejecutamos el metodo tick de cada conejito
      unaPersona.tick();
      unaPersona.render();
    }
  }

  getConejitoRandom() {
    return this.conejitos[Math.floor(this.conejitos.length * Math.random())];
  }

  asignarTargets() {
    for (let personas of this.personas) {
      personas.asignarTarget(this.getConejitoRandom());
    }
  }

  asignarElMouseComoTargetATodasLasPersonas() {
    for (let personas of this.personas) {
      personas.asignarTarget(this.mouse);
    }
  }

  asignarPerseguidorRandomATodos() {
    for (let personas of this.personas) {
      personas.perseguidor = this.getConejitoRandom();
    }
  }
  asignarElMouseComoPerseguidorATodasLasPersonas() {
    for (let personas of this.personas) {
      personas.perseguidor = this.mouse;
    }
  }
}
