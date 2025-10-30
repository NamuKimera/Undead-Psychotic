class Juego {
  pixiApp;
  personas = [];
  width;
  height;

  constructor() {
    this.width = 1280;
    this.height = 720;
    this.mouse = { posicion: { x: 0, y: 0 } };
    this.initPIXI();
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
    this.crearCiudadanos(50)
    this.crearPolicias(20)
    

    //agregamos el metodo this.gameLoop al ticker.
    //es decir: en cada frame vamos a ejecutar el metodo this.gameLoop
    this.pixiApp.ticker.add(this.gameLoop.bind(this));

    this.agregarInteractividadDelMouse();

    // this.asignarPerseguidorRandomATodos();
    // this.asignarTargets();
    this.asignarElMouseComoTargetATodosLosConejitos();
  }


  async crearAsesino() {
    const x = 0.5 * this.width;
    const y = 0.5 * this.height;
    //crea una instancia de clase Conejito, el constructor de dicha clase toma como parametros la textura
    // q queremos usar,X,Y y una referencia a la instancia del juego (this)
    const animacionesProtagonista = await PIXI.Assets.load("assets/personajes/img/asesino.json");
    const protagonista = new Asesino(animacionesProtagonista, x, y, this);
    this.personas.push(protagonista);
  }

  async crearCiudadanos(cant) {
    for (let i = 0; i < cant; i++) {
      const x = 0.5 * this.width;
      const y = 0.5 * this.height;
      //crea una instancia de clase Conejito, el constructor de dicha clase toma como parametros la textura
      // q queremos usar,X,Y y una referencia a la instancia del juego (this)
      const animacionesCiudadano = await PIXI.Assets.load("assets/personajes/img/ciudadano.json");
      const protagonista = new Ciudadano(animacionesCiudadano, x, y, this);
      this.personas.push(protagonista);
    }
  }

  async crearPolicias(cant) {
    for (let i = 0; i < cant; i++) {
      const x = 0.5 * this.width;
      const y = 0.5 * this.height;
      //crea una instancia de clase Conejito, el constructor de dicha clase toma como parametros la textura
      // q queremos usar,X,Y y una referencia a la instancia del juego (this)
      const animacionesProtagonista = await PIXI.Assets.load("assets/personajes/img/policia.json");
      const protagonista = new Policia(animacionesProtagonista, x, y, this);
      this.personas.push(protagonista);
    }
  }


  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };
    };
  }

  getConejitoRandom() {
    return this.personas[Math.floor(this.personas.length * Math.random())];
  }

  asignarTargets() {
    for (let unaPersona of this.personas) {
      unaPersona.asignarTarget(this.getConejitoRandom());
    }
  }

  asignarElMouseComoTargetATodosLosConejitos() {
    for (let unaPersona of this.personas) {
      unaPersona.asignarTarget(this.mouse);
    }
  }

  asignarPerseguidorRandomATodos() {
    for (let unaPersona of this.personas) {
      unaPersona.perseguidor = this.getConejitoRandom();
    }
  }
  
  asignarElMouseComoPerseguidorATodosLosConejitos() {
    for (let unaPersona of this.personas) {
      unaPersona.perseguidor = this.mouse;
    }
  }


  gameLoop(time) {
    //iteramos por todos los conejitos
    for (let unaPersona of this.personas) {
      //ejecutamos el metodo tick de cada conejito
      unaPersona.tick();
      unaPersona.render();
    }
  }
}