import { TipoEventoEmergencia } from './tipos-evento-emergencia';

export class EventoMonitoreo {
  constructor(
    public readonly id: string,
    public readonly idBus: string,
    public readonly tipo: TipoEventoEmergencia,
    public readonly confianza: number,
    public readonly timestamp: Date,
    public readonly metadata?: Record<string, unknown>,
  ) {}
}
