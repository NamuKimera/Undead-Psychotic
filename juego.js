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
    

    this.crearAsesino()
    this.targetCamara = this.asesino;

    //agregamos el metodo this.gameLoop al ticker.
    //es decir: en cada frame vamos a ejecutar el metodo this.gameLoop
    this.pixiApp.ticker.add(this.gameLoop.bind(this));

    this.agregarInteractividadDelMouse();

    // this.asignarPerseguidorRandomATodos();
    this.asignarTargets();
    this.asignarElMouseComoTargetATodasLasPersonas();
  }

  async crearAsesino() {
    const x = 300;
    const y = 100;
    const animacionesAsesino = await PIXI.Assets.load("assets/personajes/img/asesino.json");
    const protagonista = new Asesino(animacionesAsesino, x, y, this);
    this.personas.push(protagonista);
    this.asesino = protagonista;
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

  hacerQLaCamaraSigaAAlguien() {
    if (!this.targetCamara) return;
    // Ajustar la posición considerando el zoom actual
    let targetX = -this.targetCamara.posicion.x * this.zoom + this.width / 2;
    let targetY = -this.targetCamara.posicion.y * this.zoom + this.height / 2;

    const x = (targetX - this.containerPrincipal.x) * 0.1;
    const y = (targetY - this.containerPrincipal.y) * 0.1;

    this.moverContainerPrincipalA(
      this.containerPrincipal.x + x,
      this.containerPrincipal.y + y
    );
  }

  moverContainerPrincipalA(x, y) {
    this.containerPrincipal.x = x;
    this.containerPrincipal.y = y;
    this.containerBG.x = x;
    this.containerBG.y = y;
  }

  calcularFPS() {
    this.deltaTime = performance.now() - this.ahora;
    this.ahora = performance.now();
    this.fps = 1000 / this.deltaTime;
    this.ratioDeltaTime = this.deltaTime / 16.66;
  }

  gameLoop(time) {
    //iteramos por todos los conejitos
    for (let unaPersona of this.personas) {
      //ejecutamos el metodo tick de cada conejito
      unaPersona.tick();
      unaPersona.render();
    }

    this.hacerQLaCamaraSigaAAlguien();
    this.calcularFPS();
  }

  async crearCruzTarget() {
    this.cruzTarget = new PIXI.Sprite(
      await PIXI.Assets.load("assets/pixelart/target.png")
    );
    this.cruzTarget.visible = false;

    this.cruzTarget.zIndex = 999999999999;
    this.cruzTarget.anchor.set(0.5, 0.5);
    this.containerPrincipal.addChild(this.cruzTarget);
  }

  hacerQueCruzTargetSeVaya() {
    gsap.to(this.cruzTarget, {
      alpha: 0,
      duration: 1,
      onComplete: () => {
        this.cruzTarget.visible = false;
      },
    });
  }

  hacerQueCruzTargetAparezca() {
    gsap.killTweensOf(this.cruzTarget);
    this.cruzTarget.visible = true;
    this.cruzTarget.alpha = 1;
  }

  hacerQueLaCamaraSigaAalguienRandom() {
    this.targetCamara = this.getPersonaRandom();
  }

  getPersonaRandom() {
    return this.personas[Math.floor(this.personas.length * Math.random())];
  }

  async cargarTexturas() {
    await PIXI.Assets.load([
      "assets/bg.jpg",
      "assets/pixelart/target.png",
    ]);
  }

  asignarTargets() {
    for (let personas of this.personas) {
      personas.asignarTarget(this.getPersonaRandom());
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
