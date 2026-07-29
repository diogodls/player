import { BaseEntity } from './base.entity';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PositionEntity } from './position.entity';
import { PreferredSideEntity } from './preferred-side.entity';
import { TeamEntity } from './team.entity';
import { TaggedActionEntity } from './tagged-action.entity';

@Entity({ name: 'jogadores' })
@Check(`"idade" > 0`)
export class PlayerEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'equipe_id', type: 'uuid' })
  equipeId!: string;

  @Column({ name: 'posicao_id', type: 'smallint' })
  posicaoId!: number;

  @Column({ name: 'lado_preferencial_id', type: 'smallint' })
  ladoPreferencialId!: number;

  @Column({ type: 'varchar', length: 255 })
  nome!: string;

  @Column({ type: 'integer' })
  idade!: number;

  @ManyToOne(() => TeamEntity, (team) => team.jogadores, { nullable: false })
  @JoinColumn({ name: 'equipe_id' })
  equipe?: TeamEntity;

  @ManyToOne(() => PositionEntity, { nullable: false })
  @JoinColumn({ name: 'posicao_id' })
  posicao?: PositionEntity;

  @ManyToOne(() => PreferredSideEntity, { nullable: false })
  @JoinColumn({ name: 'lado_preferencial_id' })
  ladoPreferencial?: PreferredSideEntity;

  @OneToMany(() => TaggedActionEntity, (action) => action.jogador)
  acoesTaggeadas?: TaggedActionEntity[];
}
