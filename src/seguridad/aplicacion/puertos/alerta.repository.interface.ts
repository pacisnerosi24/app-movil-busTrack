import { Alerta } from '../../dominio/entidades/alerta.entity';

export const ALERTA_REPOSITORY = Symbol('ALERTA_REPOSITORY');

export interface IAlertaRepository {
  guardar(alerta: Alerta): Promise<void>;
  obtenerAlertasActivas(): Promise<Alerta[]>;
}