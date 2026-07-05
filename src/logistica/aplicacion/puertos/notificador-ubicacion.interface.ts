import { Bus } from '../../dominio/entidades/bus.entity';

// Símbolo para inyectar la dependencia en NestJS
export const NOTIFICADOR_UBICACION = Symbol('NOTIFICADOR_UBICACION');

export interface INotificadorUbicacion {
  notificarNuevaUbicacion(bus: Bus): void;
}