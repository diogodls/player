import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { PlayerEntity } from './player.entity';

@Entity({ name: 'indices_jogadores' })
export class PlayerIndexesEntity {
  @PrimaryColumn({ name: 'jogador_id', type: 'uuid' })
  jogadorId!: string;

  @Column({ type: 'double precision', nullable: true })
  radj!: number | null;

  @Column({ name: 'goals_relations', type: 'double precision', nullable: true })
  goalsRelations!: number | null;

  @Column({
    name: 'actions_relations',
    type: 'double precision',
    nullable: true,
  })
  actionsRelations!: number | null;

  @Column({ type: 'double precision', nullable: true })
  atd!: number | null;

  @Column({ type: 'double precision', nullable: true })
  dto!: number | null;

  @Column({ type: 'double precision', nullable: true })
  pgj!: number | null;

  @Column({ type: 'double precision', nullable: true })
  ic!: number | null;

  @Column({ type: 'double precision', nullable: true })
  tio!: number | null;

  @Column({ type: 'double precision', nullable: true })
  gtj!: number | null;

  @Column({ type: 'double precision', nullable: true })
  rf!: number | null;

  @Column({ type: 'double precision', nullable: true })
  tid!: number | null;

  @OneToOne(() => PlayerEntity, (player) => player.indices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'jogador_id' })
  jogador?: PlayerEntity;
}
