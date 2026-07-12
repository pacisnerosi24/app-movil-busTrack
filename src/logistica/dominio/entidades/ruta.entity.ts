export class Ruta {
  constructor(
    public readonly idBus: string,
    public readonly destinoFinal: string,
    public activa: boolean = true, // Para saber si el bus está en ruta
  ) {}
}