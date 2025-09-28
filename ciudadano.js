class Ciudadano extends Persona {
    constructor(texture, x, y, juego) {
        super(texture, x, y, juego);
    }

    getOtrosCiudadanos() {
        return this.juego.ciudadano;
    }
}