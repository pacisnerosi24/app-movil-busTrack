// Value Object: Se asegura de que una coordenada siempre sea válida al nacer.
export class CoordenadaGps {
  constructor(
    public readonly latitud: number,
    public readonly longitud: number,
  ) {
    if (latitud < -90 || latitud > 90) {
      throw new Error('Latitud inválida');
    }
    if (longitud < -180 || longitud > 180) {
      throw new Error('Longitud inválida');
    }
  }
}