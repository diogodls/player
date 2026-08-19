import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlayerSessionMinutes1786406400000 implements MigrationInterface {
  name = 'CreatePlayerSessionMinutes1786406400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE player_session_minutes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id uuid NOT NULL,
        player_id uuid NOT NULL,
        total_seconds integer NOT NULL DEFAULT 0,
        active_since timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT player_session_minutes_total_seconds_check CHECK (total_seconds >= 0),
        CONSTRAINT player_session_minutes_session_player_uidx UNIQUE (session_id, player_id),
        CONSTRAINT player_session_minutes_session_fk FOREIGN KEY (session_id) REFERENCES sessoes(id) ON DELETE CASCADE,
        CONSTRAINT player_session_minutes_player_fk FOREIGN KEY (player_id) REFERENCES jogadores(id) ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS player_session_minutes');
  }
}
