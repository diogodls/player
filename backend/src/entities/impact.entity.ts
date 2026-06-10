import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'impactos' })
export class ImpactEntity {
  @PrimaryColumn({ type: 'smallint' })
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nome!: string;
}
