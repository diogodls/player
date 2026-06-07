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
import { OpponentEntity } from './opponent.entity';
import { SessionLocationEntity } from './session-location.entity';
import { SessionTypeEntity } from './session-type.entity';
import { TaggedActionEntity } from './tagged-action.entity';
import { TeamEntity } from './team.entity';

@Entity({ name: 'sessoes' })
@Check(
  `(("session_type_id" = 1 AND "adversario_id" IS NULL) OR ("session_type_id" = 2 AND "adversario_id" IS NOT NULL))`,
)
export class SessionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'equipe_id', type: 'uuid' })
  equipeId!: string;

  @Column({ name: 'session_type_id', type: 'smallint' })
  sessionTypeId!: number;

  @Column({ name: 'session_location_id', type: 'smallint' })
  sessionLocationId!: number;

  @Column({ type: 'date' })
  data!: Date;

  @Column({ type: 'text', nullable: true })
  descricao!: string | null;

  @Column({ name: 'adversario_id', type: 'uuid', nullable: true })
  adversarioId!: string | null;

  @ManyToOne(() => TeamEntity, (team) => team.sessoes, { nullable: false })
  @JoinColumn({ name: 'equipe_id' })
  equipe?: TeamEntity;

  @ManyToOne(() => SessionTypeEntity, { nullable: false })
  @JoinColumn({ name: 'session_type_id' })
  sessionType?: SessionTypeEntity;

  @ManyToOne(() => SessionLocationEntity, { nullable: false })
  @JoinColumn({ name: 'session_location_id' })
  sessionLocation?: SessionLocationEntity;

  @ManyToOne(() => OpponentEntity, (opponent) => opponent.sessoes, { nullable: true })
  @JoinColumn({ name: 'adversario_id' })
  adversario?: OpponentEntity | null;

  @OneToMany(() => TaggedActionEntity, (action) => action.sessao)
  acoesTaggeadas?: TaggedActionEntity[];
}
