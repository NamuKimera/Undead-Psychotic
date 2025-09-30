class Asesino extends GameObject {
    constructor(textureData, x, y, juego) {
        super(textureData, x, y, juego);

        // Propiedades de movimiento
        this.speed = 5; // Velocidad de movimiento
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };

        // Inicializa el sprite del asesino (usando el contenedor de GameObject)
        this.cambiarAnimacion("caminarAbajo"); // O la animación inicial que desees
        this.container.x = x; // Posición inicial
        this.container.y = y;
        this.container.scale.set(2); // Escala el contenedor

        // Agrega los listeners de teclado
        this.setupKeyboardListeners();

        // Agrega el ticker para la actualización del movimiento
        this.juego.pixiApp.ticker.add(this.updateMovement.bind(this)); // Usa bind para mantener el contexto
    }

    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key in this.keys) {
                this.keys[e.key] = true;
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.key in this.keys) {
                this.keys[e.key] = false;
            }
        });
    }

    updateMovement() {
        if (this.keys.w) {
            this.container.y -= this.speed;
            this.cambiarAnimacion("caminarArriba");
        }
        if (this.keys.s) {
            this.container.y += this.speed;
            this.cambiarAnimacion("caminarAbajo");
        }
        if (this.keys.a) {
            this.container.x -= this.speed;
            this.cambiarAnimacion("caminarDerecha");
            this.spritesAnimados.caminarDerecha.scale.x = 2;
        }
        if (this.keys.d) {
            this.container.x += this.speed;
            this.cambiarAnimacion("caminarDerecha");
            this.spritesAnimados.caminarDerecha.scale.x = -2;
        }
    }
}
