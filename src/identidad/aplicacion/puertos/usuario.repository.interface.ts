import { Usuario } from '../../dominio/entidades/usuario.entity';

export const USUARIO_REPOSITORY = Symbol('USUARIO_REPOSITORY');

export interface IUsuarioRepository {
  guardar(usuario: Usuario): Promise<void>;
  existeEmail(email: string): Promise<boolean>;
}