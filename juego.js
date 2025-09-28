class Juego {
  pixiApp;
  ciudadanos = [];
  policias = [];
  asesino = [];
  width;
  height;

  constructor() {
    this.width = 1920;
    this.height = 1080;
    this.background = "#102fbbff",
    this.mouse = { posicion: { x: 0, y: 0 } };
    this.initPIXI();
  }

  //async indica q este metodo es asyncronico, es decir q puede usar "await"
  async initPIXI() {
    this.pixiApp = new PIXI.Application();
    this.pixiApp.stage.name = "el stage";
    globalThis.__PIXI_APP__ = this.pixiApp;
    const opcionesDePixi = {
      background : this.background,
      width: this.width,
      height: this.height,
      antialias: false,
      scaleMode: 'nearest',
    };
    await this.pixiApp.init(opcionesDePixi);
    document.body.appendChild(this.pixiApp.canvas);

    // Carga los JSON de animaciones
    const animacionesCiudadano = await PIXI.Assets.load("img/ciudadano.json");
    const animacionesPolicia = await PIXI.Assets.load("img/policia.json");
    const animacionesAsesino = await PIXI.Assets.load("img/asesino.json");

    // Crea ciudadanos
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const ciudadano = new Ciudadano(animacionesCiudadano, x, y, this);
      this.ciudadanos.push(ciudadano);
    }

    // Crea policías
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const policia = new Policia(animacionesPolicia, x, y, this);
      this.policias.push(policia);
    }

  // Crea asesino (solo uno)
    const x = 0.5 * this.width;
    const y = 0.5 * this.height;
    const asesino = new Asesino(animacionesAsesino, x, y, this);
    this.asesino.push(asesino);

    this.pixiApp.ticker.add(this.gameLoop.bind(this));
    this.agregarInteractividadDelMouse();
    this.asignarPerseguidorRandomATodos();
    this.asignarTargets();
    this.asignarElMouseComoTargetATodosLosCiudadanos();
  }
  
  gameLoop(time) {
    // Actualiza ciudadanos
    for (const ciudadano of this.ciudadanos) {
      ciudadano.tick();
    }

    // Actualiza policías
    for (const policia of this.policias) {
      policia.tick();
    }

  // Actualiza asesino
    if (this.asesino) {
      this.asesino.tick();
    }
  }
  
  getCiudadanoRandom() {
    return this.ciudadanos[Math.floor(this.ciudadanos.length * Math.random())];
  }
  
  getPoliciaRandom() {
    return this.policias[Math.floor(this.policias.length * Math.random())];
  }
  
  asignarTargets() {
    for (let cone of this.ciudadanos) {
      cone.asignarTarget(this.getCiudadanoRandom());
    }
  }

  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };
    };
  }
  
  asignarElMouseComoTargetATodosLosCiudadanos() {
    for (let cone of this.ciudadanos) {
      cone.asignarTarget(this.mouse);
    }
  }
  
  asignarElMouseComoTargetATodosLosPolicias() {
    for (let cone of this.policias) {
      cone.asignarTarget(this.mouse);
    }
  }
  
  asignarPerseguidorRandomATodos() {
    for (let cone of this.ciudadanos) {
      cone.perseguidor = this.getPoliciaRandom();
    }
  }

  asignarElMouseComoPerseguidorATodosLosCiudadanos() {
    for (let cone of this.ciudadanos) {
      cone.perseguidor = this.mouse;
    }
  }
}