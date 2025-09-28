class BoidAlgorithm {
  static separacion(objeto, vecinos, distanciaPersonal = 20, fuerza = 10) {
    let promedio = { x: 0, y: 0 };
    let contador = 0;
    for (let vecino of vecinos) {
      if (objeto !== vecino) {
        const dist = calcularDistancia(objeto.posicion, vecino.posicion);
        if (dist < distanciaPersonal) {
          promedio.x += vecino.posicion.x;
          promedio.y += vecino.posicion.y;
          contador++;
        }
      }
    }
    if (contador === 0) return;
    promedio.x /= contador;
    promedio.y /= contador;
    let alejamiento = {
      x: objeto.posicion.x - promedio.x,
      y: objeto.posicion.y - promedio.y,
    };
    alejamiento = limitarVector(alejamiento, 1);
    objeto.aceleracion.x += alejamiento.x * fuerza;
    objeto.aceleracion.y += alejamiento.y * fuerza;
  }
  static perseguir() {
    if (!this.target) return;
    const dist = calcularDistancia(this.posicion, this.target.posicion);
    if (dist > this.vision) return;

    // Decaimiento exponencial: va de 1 a 0 a medida que se acerca
    let factor = Math.pow(dist / this.distanciaParaLlegar, 3);

    const difX = this.target.posicion.x - this.posicion.x;
    const difY = this.target.posicion.y - this.posicion.y;

    let vectorTemporal = {
      x: -difX,
      y: -difY,
    };
    vectorTemporal = limitarVector(vectorTemporal, 1);

    this.aceleracion.x += -vectorTemporal.x * factor;
    this.aceleracion.y += -vectorTemporal.y * factor;
  }

  static alineacion(objeto, vecinos, distanciaAlineacion = 50, fuerza = 1) {
    let promedioVelocidad = { x: 0, y: 0 };
    let contador = 0;
    for (let vecino of vecinos) {
      if (objeto !== vecino) {
        const dist = calcularDistancia(objeto.posicion, vecino.posicion);
        if (dist < distanciaAlineacion) {
          promedioVelocidad.x += vecino.velocidad.x;
          promedioVelocidad.y += vecino.velocidad.y;
          contador++;
        }
      }
    }
    if (contador === 0) return;
    promedioVelocidad.x /= contador;
    promedioVelocidad.y /= contador;
    promedioVelocidad = limitarVector(promedioVelocidad, 1);
    objeto.aceleracion.x += promedioVelocidad.x * fuerza;
    objeto.aceleracion.y += promedioVelocidad.y * fuerza;
  }

  static escapar(objeto) {
    if (!objeto.perseguidor) return;
    const dist = calcularDistancia(objeto.posicion, objeto.perseguidor.posicion);
    if (dist > objeto.vision) return;
    const difX = objeto.perseguidor.posicion.x - objeto.posicion.x;
    const difY = objeto.perseguidor.posicion.y - objeto.posicion.y;
    let vectorTemporal = { x: -difX, y: -difY };
    vectorTemporal = limitarVector(vectorTemporal, 1);
    objeto.aceleracion.x += -vectorTemporal.x;
    objeto.aceleracion.y += -vectorTemporal.y;
  }

  static cohesion(objeto, vecinos, distanciaCohesion = 100, fuerza = 0.5) {
    let promedioPosicion = { x: 0, y: 0 };
    let contador = 0;
    for (let vecino of vecinos) {
      if (objeto !== vecino) {
        const dist = calcularDistancia(objeto.posicion, vecino.posicion);
        if (dist < distanciaCohesion) {
          promedioPosicion.x += vecino.posicion.x;
          promedioPosicion.y += vecino.posicion.y;
          contador++;
        }
      }
    }
    if (contador === 0) return;
    promedioPosicion.x /= contador;
    promedioPosicion.y /= contador;
    let acercamiento = {
      x: promedioPosicion.x - objeto.posicion.x,
      y: promedioPosicion.y - objeto.posicion.y,
    };
    acercamiento = limitarVector(acercamiento, 1);
    objeto.aceleracion.x += acercamiento.x * fuerza;
    objeto.aceleracion.y += acercamiento.y * fuerza;
  }
}