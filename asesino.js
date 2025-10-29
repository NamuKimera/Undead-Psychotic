class Asesino extends Persona {
  constructor(textureData, x, y, juego) {
    super(x, y, juego);
    
    this.container = new PIXI.Container();

    this.container.name = "container";
    this.vision = Math.random() * 200 + 1300;
    //guarda una referencia a la instancia del juego
    this.posicion = { x: x, y: y };
    this.velocidad = { x: Math.random() * 10, y: Math.random() * 10 };
    this.aceleracion = { x: 0, y: 0 };

    this.juego = juego;
    //generamos un ID para este conejito
    this.id = Math.floor(Math.random() * 99999999);

    // tomo como parametro la textura y creo un sprite

    this.cargarSpritesAnimados(textureData, 15);

    this.cambiarAnimacion("caminarAbajo");

    // this.sprite.play();
    // this.sprite.loop = true;
    // this.sprite.animationSpeed = 0.1;
    // this.sprite.scale.set(2);

    // //le asigno x e y al sprite
    // this.sprite.x = x;
    // this.sprite.y = y;

    // //establezco el punto de pivot en el medio:
    // this.sprite.anchor.set(0.5);

    // //agrego el sprite al stage
    // //this.juego es una referencia a la instancia de la clase Juego
    // //a su vez el juego tiene una propiedad llamada pixiApp, q es la app de PIXI misma,
    // //q a su vez tiene el stage. Y es el Stage de pixi q tiene un metodo para agregar 'hijos'
    // //(el stage es como un container/nodo)
    // this.juego.pixiApp.stage.addChild(this.sprite);

    this.juego.pixiApp.stage.addChild(this.container);

  }

  getAsesino() {
    return this.juego.asesino;
  }
}
