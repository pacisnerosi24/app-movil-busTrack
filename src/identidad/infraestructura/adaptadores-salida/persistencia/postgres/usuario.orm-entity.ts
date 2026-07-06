import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('usuarios')
export class UsuarioOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'varchar', length: 20 })
  rol!: string;

  @CreateDateColumn()
  fechaRegistro!: Date;
}