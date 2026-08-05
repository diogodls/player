import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTestePlanilhaSessionUuid1786147200000 implements MigrationInterface {
  name = 'FixTestePlanilhaSessionUuid1786147200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await this.moveSession(
      queryRunner,
      '70000000-0000-0000-0000-000000000010',
      '70000000-0000-4000-8000-000000000010',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await this.moveSession(
      queryRunner,
      '70000000-0000-4000-8000-000000000010',
      '70000000-0000-0000-0000-000000000010',
    );
  }

  private async moveSession(
    queryRunner: QueryRunner,
    oldId: string,
    newId: string,
  ): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        INSERT INTO sessoes (
          id,
          equipe_id,
          session_type_id,
          session_location_id,
          session_court_size_id,
          data,
          descricao,
          created_at,
          updated_at,
          deleted_at
        )
        SELECT
          '${newId}'::uuid,
          equipe_id,
          session_type_id,
          session_location_id,
          session_court_size_id,
          data,
          descricao,
          created_at,
          updated_at,
          deleted_at
        FROM sessoes
        WHERE id = '${oldId}'::uuid
        ON CONFLICT (id) DO NOTHING;

        UPDATE acoes_taggeadas
        SET sessao_id = '${newId}'::uuid
        WHERE sessao_id = '${oldId}'::uuid
          AND EXISTS (
            SELECT 1 FROM sessoes WHERE id = '${newId}'::uuid
          );

        DELETE FROM sessoes
        WHERE id = '${oldId}'::uuid
          AND EXISTS (
            SELECT 1 FROM sessoes WHERE id = '${newId}'::uuid
          )
          AND NOT EXISTS (
            SELECT 1
            FROM acoes_taggeadas
            WHERE sessao_id = '${oldId}'::uuid
          );
      END $$;
    `);
  }
}
