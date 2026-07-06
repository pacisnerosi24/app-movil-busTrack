import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUsuarioRepository } from '../../../aplicacion/puertos/usuario.repository.interface';
import { Usuario } from '../../../dominio/entidades/usuario.entity';
import { UsuarioOrmEntity } from '../persistencia/postgres/usuario.orm-entity';

@Injectable()
export class PostgresUsuarioRepository implements IUsuarioRepository {
  constructor(
    @InjectRepository(UsuarioOrmEntity)
    private readonly repository: Repository<UsuarioOrmEntity>,
  ) {}

  async guardar(usuario: Usuario): Promise<void> {
    const entidadDb = this.repository.create({
      id: usuario.id,
      email: usuario.email,
      passwordHash: usuario.password.valorHash,
      rol: usuario.rol.valor,
      fechaRegistro: usuario.fechaRegistro,
    });
    await this.repository.save(entidadDb);
  }

  async existeEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }
}