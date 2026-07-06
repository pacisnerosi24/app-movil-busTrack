import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';

// Usamos un Enum para forzar que el cliente solo pueda enviar estos dos valores exactos
export enum TipoAlertaEnum {
  PANICO_MANUAL = 'PANICO_MANUAL',
  IA_ACUSTICO = 'IA_ACUSTICO',
}

export class CrearAlertaDto {
  @IsString()
  @IsNotEmpty()
  readonly idBus!: string;

  @IsEnum(TipoAlertaEnum, { message: 'El tipo debe ser PANICO_MANUAL o IA_ACUSTICO' })
  @IsNotEmpty()
  readonly tipo!: TipoAlertaEnum;

  // Si es un botón de pánico, este campo puede venir vacío
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly decibeles?: number;
}