import { NivelAudio } from '../value-objects/nivel-audio';

// Entidad Pura: Cero dependencias de NestJS o Bases de datos
export type TipoAlerta = 'PANICO_MANUAL' | 'IA_ACUSTICO';

export class Alerta {
  constructor(
    public readonly id: string,
    public readonly idBus: string,
    public readonly tipo: TipoAlerta,
    public readonly fechaHora: Date,
    public activa: boolean,
    public nivelAudio?: NivelAudio, 
  ) {}

  // Regla de negocio: Validar si la alerta justifica llamar a la policía
  esAmenazaCritica(): boolean {
    if (this.tipo === 'PANICO_MANUAL') {
      return true; // Si el chofer pulsó el botón, es crítico por defecto
    }
    
    if (this.tipo === 'IA_ACUSTICO' && this.nivelAudio) {
      return this.nivelAudio.esRuidoPeligroso();
    }

    return false;
  }

  desactivar(): void {
    this.activa = false;
  }
}