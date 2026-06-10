import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'lados_preferenciais' })
export class PreferredSideEntity {
  @PrimaryColumn({ type: 'smallint' })
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nome!: string;
}
