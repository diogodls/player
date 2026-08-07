import { BaseEntity } from './base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SessionCourtSizeEntity } from './session-court-size.entity';
import { SessionLocationEntity } from './session-location.entity';
import { SessionTypeEntity } from './session-type.entity';
import { TaggedActionEntity } from './tagged-action.entity';
import { TeamEntity } from './team.entity';

@Entity({ name: 'sessoes' })
export class SessionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'equipe_id', type: 'uuid' })
  equipeId!: string;

  @Column({ name: 'session_type_id', type: 'smallint' })
  sessionTypeId!: number;

  @Column({ name: 'session_location_id', type: 'smallint' })
  sessionLocationId!: number;

  @Column({ name: 'session_court_size_id', type: 'smallint' })
  sessionCourtSizeId!: number;

  @Column({ type: 'date' })
  data!: string;

  @Column({ type: 'text', nullable: true })
  descricao!: string | null;

  @ManyToOne(() => TeamEntity, (team) => team.sessoes, { nullable: false })
  @JoinColumn({ name: 'equipe_id' })
  equipe?: TeamEntity;

  @ManyToOne(() => SessionTypeEntity, { nullable: false })
  @JoinColumn({ name: 'session_type_id' })
  sessionType?: SessionTypeEntity;

  @ManyToOne(() => SessionLocationEntity, { nullable: false })
  @JoinColumn({ name: 'session_location_id' })
  sessionLocation?: SessionLocationEntity;

  @ManyToOne(() => SessionCourtSizeEntity, { nullable: false })
  @JoinColumn({ name: 'session_court_size_id' })
  sessionCourtSize?: SessionCourtSizeEntity;

  @OneToMany(() => TaggedActionEntity, (action) => action.sessao)
  acoesTaggeadas?: TaggedActionEntity[];
}
