import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

// Exportamos el Enum para usarlo en el controlador y asegurar consistencia
export enum TipoAlertaEnum {
  PANICO_MANUAL = 'PANICO_MANUAL',
  IA_ACUSTICO = 'IA_ACUSTICO',
}

export class CrearAlertaDto {
  @IsString()
  @IsNotEmpty({ message: 'El ID del bus es obligatorio.' })
  readonly idBus!: string;

  @IsEnum(TipoAlertaEnum, { message: 'El tipo debe ser PANICO_MANUAL o IA_ACUSTICO.' })
  @IsNotEmpty({ message: 'El tipo de alerta es obligatorio.' })
  readonly tipo!: TipoAlertaEnum;

}