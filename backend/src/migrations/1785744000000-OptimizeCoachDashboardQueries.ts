import { MigrationInterface, QueryRunner } from 'typeorm';
export class OptimizeCoachDashboardQueries1785744000000 implements MigrationInterface {
  name = 'OptimizeCoachDashboardQueries1785744000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS sessoes_equipe_data_ativas_idx ON sessoes (equipe_id, data) WHERE deleted_at IS NULL',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS acoes_taggeadas_coletivas_sessao_catalogo_idx ON acoes_taggeadas (sessao_id, acao_catalogo_id) WHERE jogador_id IS NULL AND deleted_at IS NULL',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS acoes_taggeadas_coletivas_sessao_catalogo_idx',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS sessoes_equipe_data_ativas_idx',
    );
  }
}
