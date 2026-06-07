import { BaseEntity } from './base.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SessionEntity } from './session.entity';

@Entity({ name: 'adversarios' })
export class OpponentEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nome!: string;

  @OneToMany(() => SessionEntity, (session) => session.adversario)
  sessoes?: SessionEntity[];
}
