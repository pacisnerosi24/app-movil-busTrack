import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { USUARIO_REPOSITORY, type IUsuarioRepository } from '../puertos/usuario.repository.interface';
import { TOKEN_PROVIDER, type ITokenProvider } from '../puertos/token.provider.interface';

@Injectable()
export class LoginService {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepo: IUsuarioRepository,
    @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
  ) {}

  async ejecutar(email: string, passwordPlana: string) {
    // 1. Buscar al usuario
    const usuario = await this.usuarioRepo.obtenerPorEmail(email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 2. Validar la contraseña (usando la lógica pura de nuestro Dominio)
    const passwordValida = await usuario.password.esCorrecta(passwordPlana);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas'); // Mismo error intencionalmente (Seguridad)
    }

    // 3. Generar el JWT
    const token = this.tokenProvider.generarToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol.valor, // "Conductor", "Administrador", etc.
    });

    return { token, usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol.valor } };
  }
}