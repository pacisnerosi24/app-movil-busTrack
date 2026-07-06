import { IsEmail, IsNotEmpty, IsEnum, Matches } from 'class-validator';
import { type TipoRol } from '../../../dominio/value-objects/rol';

enum RolesPermitidos {
  Administrador = 'administrador',
  Pasajero = 'pasajero',
  Conductor = 'conductor',
}

export class RegistrarUsuarioDto {
  @IsEmail({}, { message: 'El formato del correo es inválido' })
  @IsNotEmpty()
  readonly email!: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, {
    message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial.',
  })
  @IsNotEmpty()
  readonly password!: string;

  @IsEnum(RolesPermitidos, { message: 'El rol debe ser administrador, pasajero o conductor' })
  @IsNotEmpty()
  readonly rol!: TipoRol;
}