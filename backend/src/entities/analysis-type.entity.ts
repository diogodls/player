import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'tipos_analise' })
export class AnalysisTypeEntity {
  @PrimaryColumn({ type: 'smallint' })
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nome!: string;
}
