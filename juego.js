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
    this.pixiApp.stage.name = "Undead Psychotic";
    globalThis.__PIXI_APP__ = this.pixiApp;
    const opcionesDePixi = {
      background : this.background,
      width: this.width,
      height: this.height,
      antialias: false,
      SCALE_MODE: PIXI.SCALE_MODES.NEAREST,
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

    console.log("Juego inicializado");
  }

  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };
    };
  }

  getConejitoRandom() {
    return this.conejitos[Math.floor(this.conejitos.length * Math.random())];
  }

  asignarTargets() {
    for (let cone of this.conejitos) {
      cone.asignarTarget(this.getConejitoRandom());
    }
  }

  asignarElMouseComoTargetATodosLosConejitos() {
    for (let cone of this.conejitos) {
      cone.asignarTarget(this.mouse);
    }
  }

  asignarPerseguidorRandomATodos() {
    for (let cone of this.conejitos) {
      cone.perseguidor = this.getConejitoRandom();
    }
  }
  asignarElMouseComoPerseguidorATodosLosConejitos() {
    for (let cone of this.conejitos) {
      cone.perseguidor = this.mouse;
    }
  }
  
  gameLoop(time) {
    // Actualiza ciudadanos
    for (const ciudadano of this.ciudadanos) {
      ciudadano.tick();
      ciudadano.render();
    }

    // Actualiza policías
    for (const policia of this.policias) {
      policia.tick();
      policia.render();
    }

  // Actualiza asesino
    for (const asesino of this.asesino) {
      asesino.tick();
      asesino.render();
    }
  }
}