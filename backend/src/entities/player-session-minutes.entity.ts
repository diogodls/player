import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PlayerEntity } from './player.entity';
import { SessionEntity } from './session.entity';

@Entity({ name: 'player_session_minutes' })
@Unique('player_session_minutes_session_player_uidx', ['sessionId', 'playerId'])
@Check('player_session_minutes_total_seconds_check', '"total_seconds" >= 0')
export class PlayerSessionMinutesEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId!: string;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId!: string;

  @Column({ name: 'total_seconds', type: 'integer', default: 0 })
  totalSeconds!: number;

  @Column({ name: 'active_since', type: 'timestamptz', nullable: true })
  activeSince!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => SessionEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session?: SessionEntity;

  @ManyToOne(() => PlayerEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player?: PlayerEntity;
}
