import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

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

  // Transformamos el string del form-data a Number automáticamente
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La latitud debe ser un número válido.' })
  readonly latitud?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La longitud debe ser un número válido.' })
  readonly longitud?: number;
}