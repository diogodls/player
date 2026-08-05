import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTestePlanilhaPlayerUuids1786060800000 implements MigrationInterface {
  name = 'FixTestePlanilhaPlayerUuids1786060800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        id_change record;
      BEGIN
        FOR id_change IN
          SELECT *
          FROM (VALUES
            ('70000000-0000-0000-0000-000000000001'::uuid, '70000000-0000-4000-8000-000000000001'::uuid),
            ('70000000-0000-0000-0000-000000000002'::uuid, '70000000-0000-4000-8000-000000000002'::uuid),
            ('70000000-0000-0000-0000-000000000003'::uuid, '70000000-0000-4000-8000-000000000003'::uuid),
            ('70000000-0000-0000-0000-000000000004'::uuid, '70000000-0000-4000-8000-000000000004'::uuid)
          ) AS ids(old_id, new_id)
        LOOP
          INSERT INTO jogadores (
            id,
            equipe_id,
            posicao_id,
            lado_preferencial_id,
            nome,
            idade,
            created_at,
            updated_at,
            deleted_at
          )
          SELECT
            id_change.new_id,
            equipe_id,
            posicao_id,
            lado_preferencial_id,
            nome,
            idade,
            created_at,
            updated_at,
            deleted_at
          FROM jogadores
          WHERE id = id_change.old_id
          ON CONFLICT (id) DO NOTHING;

          UPDATE acoes_taggeadas
          SET jogador_id = id_change.new_id
          WHERE jogador_id = id_change.old_id;

          DELETE FROM jogadores
          WHERE id = id_change.old_id
            AND EXISTS (
              SELECT 1 FROM jogadores WHERE id = id_change.new_id
            )
            AND NOT EXISTS (
              SELECT 1
              FROM acoes_taggeadas
              WHERE jogador_id = id_change.old_id
            );
        END LOOP;
      END $$;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        id_change record;
      BEGIN
        FOR id_change IN
          SELECT *
          FROM (VALUES
            ('70000000-0000-4000-8000-000000000001'::uuid, '70000000-0000-0000-0000-000000000001'::uuid),
            ('70000000-0000-4000-8000-000000000002'::uuid, '70000000-0000-0000-0000-000000000002'::uuid),
            ('70000000-0000-4000-8000-000000000003'::uuid, '70000000-0000-0000-0000-000000000003'::uuid),
            ('70000000-0000-4000-8000-000000000004'::uuid, '70000000-0000-0000-0000-000000000004'::uuid)
          ) AS ids(old_id, new_id)
        LOOP
          INSERT INTO jogadores (
            id,
            equipe_id,
            posicao_id,
            lado_preferencial_id,
            nome,
            idade,
            created_at,
            updated_at,
            deleted_at
          )
          SELECT
            id_change.new_id,
            equipe_id,
            posicao_id,
            lado_preferencial_id,
            nome,
            idade,
            created_at,
            updated_at,
            deleted_at
          FROM jogadores
          WHERE id = id_change.old_id
          ON CONFLICT (id) DO NOTHING;

          UPDATE acoes_taggeadas
          SET jogador_id = id_change.new_id
          WHERE jogador_id = id_change.old_id;

          DELETE FROM jogadores
          WHERE id = id_change.old_id
            AND EXISTS (
              SELECT 1 FROM jogadores WHERE id = id_change.new_id
            )
            AND NOT EXISTS (
              SELECT 1
              FROM acoes_taggeadas
              WHERE jogador_id = id_change.old_id
            );
        END LOOP;
      END $$;
    `);
  }
}
