import { EventoMonitoreo } from '../dominio/evento-monitoreo.entity';

export interface PuertoEventosMonitoreoRepository {
  guardar(evento: EventoMonitoreo): Promise<void>;
  listarPorBus(idBus: string): Promise<EventoMonitoreo[]>;
}
