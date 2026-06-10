import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'session_locations' })
export class SessionLocationEntity {
  @PrimaryColumn({ type: 'smallint' })
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nome!: string;
}
