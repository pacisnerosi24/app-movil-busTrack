import { IsString, IsNotEmpty } from 'class-validator';

export class RegistrarRutaDto {
  @IsString()
  @IsNotEmpty()
  readonly idBus!: string;

  @IsString()
  @IsNotEmpty()
  readonly destinoFinal!: string;
}