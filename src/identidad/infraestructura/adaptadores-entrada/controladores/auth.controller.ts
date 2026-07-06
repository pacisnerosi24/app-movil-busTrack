import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegistrarUsuarioService } from '../../../aplicacion/casos-uso/registrar-usuario.service';
import { RegistrarUsuarioDto } from '../dto/registrar-usuario.dto';
import { LoginDto } from '../dto/login.dto';
import { LoginService } from '../../../aplicacion/casos-uso/login.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly registrarUsuarioService: RegistrarUsuarioService,
    private readonly loginService: LoginService
  ) {}

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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto){
    return await this.loginService.ejecutar(body.email, body.password);
  }
}