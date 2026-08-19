import { BaseEntity } from './base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ActionCategoryEntity } from './action-category.entity';
import { TaggedActionEntity } from './tagged-action.entity';

@Entity({ name: 'contextos_acao_equipe' })
@Unique('contextos_acao_equipe_categoria_nome_unique', [
  'categoriaAcaoId',
  'nome',
])
@Unique('contextos_acao_equipe_categoria_chave_unique', [
  'categoriaAcaoId',
  'chave',
])
export class TeamActionContextEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'categoria_acao_id', type: 'uuid' })
  categoriaAcaoId!: string;

  @Column({ type: 'varchar', length: 100 })
  nome!: string;

  @Column({ type: 'varchar', length: 50 })
  chave!: string;

  @Column({ type: 'smallint' })
  ordem!: number;

  @ManyToOne(
    () => ActionCategoryEntity,
    (category) => category.contextosAcaoEquipe,
    { nullable: false },
  )
  @JoinColumn({ name: 'categoria_acao_id' })
  categoriaAcao?: ActionCategoryEntity;

  @OneToMany(() => TaggedActionEntity, (action) => action.contextoAcaoEquipe)
  acoesTaggeadas?: TaggedActionEntity[];
}
