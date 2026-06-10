import { BaseEntity } from './base.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PlayerEntity } from './player.entity';
import { SessionEntity } from './session.entity';

@Entity({ name: 'equipes' })
export class TeamEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nome!: string;

  @OneToMany(() => PlayerEntity, (player) => player.equipe)
  jogadores?: PlayerEntity[];

  @OneToMany(() => SessionEntity, (session) => session.equipe)
  sessoes?: SessionEntity[];
}
