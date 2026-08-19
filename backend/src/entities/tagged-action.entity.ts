import { BaseEntity } from './base.entity';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CatalogActionEntity } from './catalog-action.entity';
import { PlayerEntity } from './player.entity';
import { SessionEntity } from './session.entity';
import { TeamActionContextEntity } from './team-action-context.entity';

@Entity({ name: 'acoes_taggeadas' })
@Check(`"timestamp_segundos" >= 0`)
export class TaggedActionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'sessao_id', type: 'uuid' })
  sessaoId!: string;

  @Column({ name: 'acao_catalogo_id', type: 'uuid' })
  acaoCatalogoId!: string;

  @Column({ name: 'jogador_id', type: 'uuid', nullable: true })
  jogadorId!: string | null;

  @Column({ name: 'contexto_acao_equipe_id', type: 'uuid', nullable: true })
  contextoAcaoEquipeId!: string | null;

  @Column({ name: 'timestamp_segundos', type: 'integer' })
  timestampSegundos!: number;

  @Column({
    name: 'client_action_id',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  clientActionId!: string | null;

  @ManyToOne(() => SessionEntity, (session) => session.acoesTaggeadas, {
    nullable: false,
  })
  @JoinColumn({ name: 'sessao_id' })
  sessao?: SessionEntity;

  @ManyToOne(() => CatalogActionEntity, (action) => action.acoesTaggeadas, {
    nullable: false,
  })
  @JoinColumn({ name: 'acao_catalogo_id' })
  acaoCatalogo?: CatalogActionEntity;

  @ManyToOne(() => PlayerEntity, (player) => player.acoesTaggeadas, {
    nullable: true,
  })
  @JoinColumn({ name: 'jogador_id' })
  jogador?: PlayerEntity | null;

  @ManyToOne(
    () => TeamActionContextEntity,
    (context) => context.acoesTaggeadas,
    { nullable: true },
  )
  @JoinColumn({ name: 'contexto_acao_equipe_id' })
  contextoAcaoEquipe?: TeamActionContextEntity | null;
}
