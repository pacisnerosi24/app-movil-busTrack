import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('alertas')
export class AlertaOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  idBus!: string;

  @Column({ type: 'varchar', length: 50 })
  tipo!: string; 

  // Es nullable (opcional) porque el botón de pánico manual no envía decibeles
  @Column({ type: 'float', nullable: true })
  decibeles!: number | null;

  @CreateDateColumn()
  fechaHora!: Date;

  @Column({ default: true })
  activa!: boolean;
}