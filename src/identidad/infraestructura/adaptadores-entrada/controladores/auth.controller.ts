import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegistrarUsuarioService } from '../../../aplicacion/casos-uso/registrar-usuario.service';
import { RegistrarUsuarioDto } from '../dto/registrar-usuario.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly registrarUsuarioService: RegistrarUsuarioService) {}

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async registrar(@Body() body: RegistrarUsuarioDto) {
    const usuario = await this.registrarUsuarioService.ejecutar(
      body.email,
      body.password,
      body.rol,
    );

    // Por seguridad (KISS), jamás devolvemos el hash de la contraseña en la respuesta
    return {
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol.valor,
      },
    };
  }
}