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
import { AnalysisTypeEntity } from './analysis-type.entity';
import { CatalogActionEntity } from './catalog-action.entity';

@Entity({ name: 'categorias_acao' })
@Unique('categorias_acao_tipo_nome_unique', ['tipoAnaliseId', 'nome'])
export class ActionCategoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tipo_analise_id', type: 'smallint' })
  tipoAnaliseId!: number;

  @Column({ type: 'varchar', length: 100 })
  nome!: string;

  @ManyToOne(() => AnalysisTypeEntity, { nullable: false })
  @JoinColumn({ name: 'tipo_analise_id' })
  tipoAnalise?: AnalysisTypeEntity;

  @OneToMany(() => CatalogActionEntity, (action) => action.categoriaAcao)
  acoes?: CatalogActionEntity[];
}
