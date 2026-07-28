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
import { ImpactEntity } from './impact.entity';
import { TaggedActionEntity } from './tagged-action.entity';

@Entity({ name: 'acoes_catalogo' })
@Unique('acoes_catalogo_categoria_nome_unique', ['categoriaAcaoId', 'nome'])
@Unique('acoes_catalogo_categoria_sigla_unique', ['categoriaAcaoId', 'sigla'])
export class CatalogActionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'categoria_acao_id', type: 'uuid' })
  categoriaAcaoId!: string;

  @Column({ name: 'impacto_id', type: 'smallint' })
  impactoId!: number;

  @Column({ type: 'varchar', length: 255 })
  nome!: string;

  @Column({ type: 'varchar', length: 30 })
  sigla!: string;

  @Column({ type: 'smallint', nullable: true })
  ordem!: number | null;

  @ManyToOne(() => ActionCategoryEntity, (category) => category.acoes, {
    nullable: false,
  })
  @JoinColumn({ name: 'categoria_acao_id' })
  categoriaAcao?: ActionCategoryEntity;

  @ManyToOne(() => ImpactEntity, { nullable: false })
  @JoinColumn({ name: 'impacto_id' })
  impacto?: ImpactEntity;

  @OneToMany(() => TaggedActionEntity, (action) => action.acaoCatalogo)
  acoesTaggeadas?: TaggedActionEntity[];
}
