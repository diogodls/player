import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConsolidateAnalysisGroups1784361600000 implements MigrationInterface {
  name = 'ConsolidateAnalysisGroups1784361600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE acoes_catalogo
      SET categoria_acao_id = '00000000-0000-0000-0000-000000000306',
          ordem = CASE sigla
            WHEN 'GGL' THEN 5
            WHEN 'PPGL' THEN 6
            ELSE ordem
          END
      WHERE categoria_acao_id = '00000000-0000-0000-0000-000000000310'
    `);

    await queryRunner.query(`
      DELETE FROM categorias_acao
      WHERE id = '00000000-0000-0000-0000-000000000310'
        AND NOT EXISTS (
          SELECT 1
          FROM acoes_catalogo
          WHERE categoria_acao_id = '00000000-0000-0000-0000-000000000310'
        )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO categorias_acao (id, tipo_analise_id, nome, chave, ordem)
      VALUES (
        '00000000-0000-0000-0000-000000000310',
        2,
        'Goleiro-linha',
        'FLY_GOALKEEPER',
        6
      )
      ON CONFLICT (id) DO NOTHING
    `);

    await queryRunner.query(`
      UPDATE acoes_catalogo
      SET categoria_acao_id = '00000000-0000-0000-0000-000000000310'
      WHERE sigla IN ('GGL', 'PPGL')
        AND categoria_acao_id = '00000000-0000-0000-0000-000000000306'
    `);
  }
}
