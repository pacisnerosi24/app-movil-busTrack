import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenProvider } from '../../../aplicacion/puertos/token.provider.interface';

@Injectable()
export class JwtAdapterService implements ITokenProvider {
  constructor(private readonly jwtService: JwtService) {}

  generarToken(payload: { id: string; email: string; rol: string }): string {
    return this.jwtService.sign(payload);
  }
}