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

  down(queryRunner: QueryRunner): Promise<void> {
    void queryRunner;
    // Data consolidation is intentionally irreversible because the previous
    // category may not have existed before this migration ran.
    return Promise.resolve();
  }
}
