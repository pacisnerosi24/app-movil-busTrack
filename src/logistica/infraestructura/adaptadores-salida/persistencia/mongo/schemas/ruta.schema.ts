import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'rutas_buses' })
export class RutaMongo extends Document {
  @Prop({ required: true, index: true })
  idBus!: string;

  @Prop({ required: true })
  destinoFinal!: string;

  @Prop({ default: true })
  activa!: boolean;
}

export const RutaSchema = SchemaFactory.createForClass(RutaMongo);