import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CrearUbicacionDto {
  @IsString({ message: 'El idBus debe ser un texto' })
  @IsNotEmpty({ message: 'El idBus es obligatorio' })
  readonly idBus!: string;

  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'La latitud mínima es -90' })
  @Max(90, { message: 'La latitud máxima es 90' })
  @IsNotEmpty()
  readonly latitud!: number;

  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud mínima es -180' })
  @Max(180, { message: 'La longitud máxima es 180' })
  @IsNotEmpty()
  readonly longitud!: number;
}