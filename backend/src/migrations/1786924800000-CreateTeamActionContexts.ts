import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamActionContexts1786924800000 implements MigrationInterface {
  name = 'CreateTeamActionContexts1786924800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE contextos_acao_equipe (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        categoria_acao_id uuid NOT NULL,
        nome varchar(100) NOT NULL,
        chave varchar(50) NOT NULL,
        ordem smallint NOT NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        deleted_at timestamptz NULL,
        CONSTRAINT contextos_acao_equipe_categoria_nome_unique
          UNIQUE (categoria_acao_id, nome),
        CONSTRAINT contextos_acao_equipe_categoria_chave_unique
          UNIQUE (categoria_acao_id, chave),
        CONSTRAINT contextos_acao_equipe_categoria_fk
          FOREIGN KEY (categoria_acao_id) REFERENCES categorias_acao(id)
      )
    `);
    await queryRunner.query(
      'CREATE INDEX contextos_acao_equipe_categoria_deleted_at_idx ON contextos_acao_equipe (categoria_acao_id, deleted_at)',
    );
    await queryRunner.query(`
      CREATE TRIGGER contextos_acao_equipe_set_updated_at
      BEFORE UPDATE ON contextos_acao_equipe
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);
    await queryRunner.query(
      'ALTER TABLE acoes_taggeadas ADD COLUMN contexto_acao_equipe_id uuid NULL',
    );
    await queryRunner.query(`
      ALTER TABLE acoes_taggeadas
      ADD CONSTRAINT acoes_taggeadas_contexto_acao_equipe_fk
      FOREIGN KEY (contexto_acao_equipe_id) REFERENCES contextos_acao_equipe(id)
    `);
    await queryRunner.query(
      'CREATE INDEX acoes_taggeadas_contexto_acao_equipe_idx ON acoes_taggeadas (contexto_acao_equipe_id)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS acoes_taggeadas_contexto_acao_equipe_idx',
    );
    await queryRunner.query(
      'ALTER TABLE acoes_taggeadas DROP CONSTRAINT IF EXISTS acoes_taggeadas_contexto_acao_equipe_fk',
    );
    await queryRunner.query(
      'ALTER TABLE acoes_taggeadas DROP COLUMN IF EXISTS contexto_acao_equipe_id',
    );
    await queryRunner.query(
      'DROP TRIGGER IF EXISTS contextos_acao_equipe_set_updated_at ON contextos_acao_equipe',
    );
    await queryRunner.query('DROP TABLE IF EXISTS contextos_acao_equipe');
  }
}
