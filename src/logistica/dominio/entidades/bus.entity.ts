import { CoordenadaGps } from '../value-objects/coordenada-gps';

export class Bus {
  constructor(
    public readonly idBus: string,
    public ubicacionActual: CoordenadaGps,
    public readonly ultimaActualizacion: Date,
  ) {}

  // Lógica de negocio pura (Ejemplo: Si lleva más de 5 mins sin reportar)
  estaDesconectado(): boolean {
    const cincoMinutos = 5 * 60 * 1000;
    const tiempoTranscurrido = new Date().getTime() - this.ultimaActualizacion.getTime();
    return tiempoTranscurrido > cincoMinutos;
  }
}