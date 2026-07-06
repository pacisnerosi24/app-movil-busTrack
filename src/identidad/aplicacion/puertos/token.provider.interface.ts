export const TOKEN_PROVIDER = Symbol('TOKEN_PROVIDER');

export interface ITokenProvider {
  generarToken(payload: { id: string; email: string; rol: string }): string;
}