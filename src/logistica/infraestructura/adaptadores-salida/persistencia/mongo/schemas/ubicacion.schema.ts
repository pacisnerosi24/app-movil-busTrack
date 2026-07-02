import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'telemetria_buses' })
export class UbicacionMongo extends Document {
  @Prop({ required: true, index: true })
  idBus!: string;

  @Prop({ required: true })
  latitud!: number;

  @Prop({ required: true })
  longitud!: number;

  @Prop({ required: true, default: Date.now })
  fechaRegistro!: Date;
}

export const UbicacionSchema = SchemaFactory.createForClass(UbicacionMongo);