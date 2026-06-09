import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'session_court_sizes' })
export class SessionCourtSizeEntity {
  @PrimaryColumn({ type: 'smallint' })
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nome!: string;
}
