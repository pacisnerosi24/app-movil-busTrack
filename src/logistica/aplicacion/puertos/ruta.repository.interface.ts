import { Ruta } from '../../dominio/entidades/ruta.entity';

export const RUTA_REPOSITORY = Symbol('RUTA_REPOSITORY');

export interface IRutaRepository {
  guardarRuta(ruta: Ruta): Promise<void>;
  eliminarRutaPorBus(idBus: string): Promise<void>;
  obtenerTodasLasRutas(): Promise<Ruta[]>;
}