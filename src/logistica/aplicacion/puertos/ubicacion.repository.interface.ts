import { Bus } from '../../dominio/entidades/bus.entity';

// Símbolo para inyectar la dependencia en NestJS
export const UBICACION_REPOSITORY = Symbol('UBICACION_REPOSITORY');

export interface IUbicacionRepository {
  guardarUbicacion(bus: Bus): Promise<void>;
  obtenerUltimaUbicacion(idBus: string): Promise<Bus | null>;
}