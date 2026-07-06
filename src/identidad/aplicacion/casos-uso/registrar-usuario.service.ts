import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { USUARIO_REPOSITORY, type IUsuarioRepository } from '../puertos/usuario.repository.interface';
import { Usuario } from '../../dominio/entidades/usuario.entity';
import { Password } from '../../dominio/value-objects/password';
import { Rol, TipoRol } from '../../dominio/value-objects/rol';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RegistrarUsuarioService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async ejecutar(email: string, passwordPlana: string, rolStr: TipoRol): Promise<Usuario> {
    // 1. Verificamos que el email no esté duplicado
    const existe = await this.usuarioRepository.existeEmail(email);
    if (existe) {
      throw new ConflictException(`El correo ${email} ya está registrado.`);
    }

    // 2. Instanciamos los Objetos de Valor (aquí ocurren las validaciones puras y el hashing)
    const password = await Password.crear(passwordPlana);
    const rol = new Rol(rolStr);

    // 3. Ensamblamos la Entidad
    const nuevoUsuario = new Usuario(uuidv4(), email, password, rol, new Date());

    // 4. Guardamos en Base de Datos usando el puerto
    await this.usuarioRepository.guardar(nuevoUsuario);

    return nuevoUsuario;
  }
}