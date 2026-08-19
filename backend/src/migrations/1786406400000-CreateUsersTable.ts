import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateUsersTable1786406400000 implements MigrationInterface {
  name = 'CreateUsersTable1786406400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela de usuários
    await queryRunner.query(`
      CREATE TABLE usuarios (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) NOT NULL,
        password_hash varchar(255) NOT NULL,
        refresh_token_hash varchar(255) NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT usuarios_email_unique UNIQUE (email)
      )
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION usuarios_set_updated_at()
      RETURNS trigger AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER usuarios_set_updated_at
      BEFORE UPDATE ON usuarios
      FOR EACH ROW
      EXECUTE FUNCTION usuarios_set_updated_at()
    `);

    // Seed do usuário administrador padrão
    // Senha padrão: Player@2025 — TROQUE IMEDIATAMENTE após o primeiro acesso
    const adminHash = await bcrypt.hash('Player@2025', 12);
    await queryRunner.query(
      `INSERT INTO usuarios (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@player.local', adminHash],
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS usuarios`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS usuarios_set_updated_at`);
  }
}
