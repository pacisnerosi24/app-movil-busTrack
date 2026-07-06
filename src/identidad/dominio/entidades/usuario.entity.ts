import { Password } from '../value-objects/password';
import { Rol } from '../value-objects/rol';

export class Usuario {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: Password,
    public readonly rol: Rol,
    public readonly fechaRegistro: Date,
  ) {}
}