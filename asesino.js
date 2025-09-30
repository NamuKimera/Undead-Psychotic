class Asesino extends GameObject {
    constructor(texture, x, y, juego) {
        super(texture, x, y, juego);
    }
    
    movimientoWASD() {
        const keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };

        window.addEventListener('keydown', (e) => {
            if (e.key in keys) {
                keys[e.key] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key in keys) {
                keys[e.key] = false;
            }
        });

        app.ticker.add(() => {
        const speed = 5; // Velocidad de movimiento

        if (keys.w) {
            player.y -= speed;
        }
        if (keys.s) {
            player.y += speed;
        }
        if (keys.a) {
            player.x -= speed;
        }
        if (keys.d) {
            player.x += speed;
        }
        });
    }
}