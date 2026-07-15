import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCatalogGrouping1784102400000 implements MigrationInterface {
  name = 'AddCatalogGrouping1784102400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE categorias_acao ADD COLUMN IF NOT EXISTS chave varchar(50)',
    );
    await queryRunner.query(
      'ALTER TABLE categorias_acao ADD COLUMN IF NOT EXISTS ordem smallint',
    );
    await queryRunner.query(
      'ALTER TABLE acoes_catalogo ADD COLUMN IF NOT EXISTS ordem smallint',
    );

    await queryRunner.query(`
      UPDATE categorias_acao
      SET chave = CASE nome
        WHEN 'Acoes ofensivas' THEN 'OFFENSIVE_ACTIONS'
        WHEN 'Ações ofensivas' THEN 'OFFENSIVE_ACTIONS'
        WHEN 'Acoes defensivas' THEN 'DEFENSIVE_ACTIONS'
        WHEN 'Ações defensivas' THEN 'DEFENSIVE_ACTIONS'
        WHEN 'Gols em quadra' THEN 'COURT_GOALS'
        WHEN 'Gols tomados em quadra' THEN 'COURT_GOALS_CONCEDED'
      END,
      ordem = CASE nome
        WHEN 'Acoes ofensivas' THEN 1
        WHEN 'Ações ofensivas' THEN 1
        WHEN 'Acoes defensivas' THEN 2
        WHEN 'Ações defensivas' THEN 2
        WHEN 'Gols em quadra' THEN 3
        WHEN 'Gols tomados em quadra' THEN 4
      END
      WHERE tipo_analise_id = 1
    `);

    await queryRunner.query(`
      UPDATE categorias_acao
      SET nome = CASE chave
        WHEN 'OFFENSIVE_ACTIONS' THEN 'Ações ofensivas'
        WHEN 'DEFENSIVE_ACTIONS' THEN 'Ações defensivas'
        ELSE nome
      END
      WHERE tipo_analise_id = 1
    `);

    await queryRunner.query(`
      UPDATE acoes_catalogo AS acao
      SET ordem = ordering.ordem, nome = ordering.nome
      FROM (VALUES
        ('GM', 'Gol marcado', 1), ('ASS', 'Assistência', 2), ('AD', 'Ação decisiva', 3),
        ('CC', 'Chance criada', 4), ('PP', 'Perda de posse', 5),
        ('GP', 'Gol pago', 1), ('FD', 'Falha defensiva', 2), ('RB', 'Roubada de bola', 3),
        ('DIA', 'Desarme, interceptação e antecipação', 4),
        ('Gol TO', 'Gol transição ofensiva', 1), ('Gol OO', 'Gol organização ofensiva', 2),
        ('Gol BP', 'Gol bola parada', 3), ('Gol GL', 'Gol goleiro linha', 4),
        ('Gol MGL', 'Gol marcação de goleiro linha', 5),
        ('GS TO', 'Gol sofrido transição defensiva', 1),
        ('GS OO', 'Gol sofrido organização defensiva', 2), ('GS BP', 'Gol sofrido bola parada', 3),
        ('GS GLA', 'Gol sofrido goleiro linha adversário', 4),
        ('GS GLO', 'Gol sofrido usando goleiro linha ofensivo', 5)
      ) AS ordering(sigla, nome, ordem), categorias_acao categoria
      WHERE acao.sigla = ordering.sigla
        AND categoria.id = acao.categoria_acao_id
        AND categoria.tipo_analise_id = 1
    `);

    await queryRunner.query(`
      UPDATE acoes_catalogo AS acao
      SET impacto_id = impacto.id
      FROM categorias_acao categoria, impactos impacto
      WHERE acao.categoria_acao_id = categoria.id
        AND categoria.tipo_analise_id = 1
        AND acao.sigla = 'GS BP'
        AND impacto.nome = 'Negativa'
        AND acao.impacto_id IS DISTINCT FROM impacto.id
    `);

    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS categorias_acao_tipo_chave_unique ON categorias_acao (tipo_analise_id, chave) WHERE chave IS NOT NULL',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS categorias_acao_tipo_chave_unique',
    );
    await queryRunner.query(
      'ALTER TABLE acoes_catalogo DROP COLUMN IF EXISTS ordem',
    );
    await queryRunner.query(
      'ALTER TABLE categorias_acao DROP COLUMN IF EXISTS ordem',
    );
    await queryRunner.query(
      'ALTER TABLE categorias_acao DROP COLUMN IF EXISTS chave',
    );
  }
}
