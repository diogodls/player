import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'posicoes' })
export class PositionEntity {
  @PrimaryColumn({ type: 'smallint' })
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nome!: string;
}
