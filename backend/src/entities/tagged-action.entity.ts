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

  @Column({ name: 'timestamp_segundos', type: 'integer' })
  timestampSegundos!: number;

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
}
