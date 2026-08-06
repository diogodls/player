import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaggedActionIdempotency1786320000000 implements MigrationInterface {
  name = 'AddTaggedActionIdempotency1786320000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE acoes_taggeadas ADD COLUMN IF NOT EXISTS client_action_id varchar(64)',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS acoes_taggeadas_sessao_client_action_ativas_uidx ON acoes_taggeadas (sessao_id, client_action_id) WHERE client_action_id IS NOT NULL AND deleted_at IS NULL',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS acoes_taggeadas_sessao_client_action_ativas_uidx',
    );
    await queryRunner.query(
      'ALTER TABLE acoes_taggeadas DROP COLUMN IF EXISTS client_action_id',
    );
  }
}
