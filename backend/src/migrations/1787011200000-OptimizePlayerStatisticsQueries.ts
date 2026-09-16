import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizePlayerStatisticsQueries1787011200000 implements MigrationInterface {
  name = 'OptimizePlayerStatisticsQueries1787011200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS acoes_taggeadas_sessao_jogador_catalogo_ativas_idx ON acoes_taggeadas (sessao_id, jogador_id, acao_catalogo_id) WHERE deleted_at IS NULL AND jogador_id IS NOT NULL',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS acoes_taggeadas_sessao_jogador_catalogo_ativas_idx',
    );
  }
}
