import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'session_types' })
export class SessionTypeEntity {
  @PrimaryColumn({ type: 'smallint' })
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nome!: string;
}
