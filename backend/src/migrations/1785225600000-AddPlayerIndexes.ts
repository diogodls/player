import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlayerIndexes1785225600000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS indices_jogadores (
        jogador_id uuid PRIMARY KEY REFERENCES jogadores(id) ON DELETE CASCADE,
        radj double precision NULL,
        goals_relations double precision NULL,
        actions_relations double precision NULL,
        atd double precision NULL,
        dto double precision NULL,
        pgj double precision NULL,
        ic double precision NULL,
        tio double precision NULL CHECK (tio BETWEEN 0 AND 100),
        gtj double precision NULL,
        rf double precision NULL,
        tid double precision NULL CHECK (tid BETWEEN 0 AND 100)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS indices_jogadores');
  }
}
