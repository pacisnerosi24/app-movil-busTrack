export type TipoRol = 'administrador' | 'pasajero' | 'conductor';

export class Rol {
  constructor(public readonly valor: TipoRol) {
    const rolesPermitidos = ['administrador', 'pasajero', 'conductor'];
    if (!rolesPermitidos.includes(valor)) {
      throw new Error(`Rol inválido. Solo se permite: ${rolesPermitidos.join(', ')}`);
    }
  }
}