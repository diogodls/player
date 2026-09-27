import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

const MASCULINA_ID = '00000000-0000-0000-0000-000000000001';
const FEMININA_ID = '00000000-0000-0000-0000-000000000002';
const JUVENIS_ID = '00000000-0000-0000-0000-000000000003';
const DEFAULT_PASSWORD = 'Player@2025';

const USERS = [
  ['pranke@player.ufsm', MASCULINA_ID],
  ['analista@player.ufsm', MASCULINA_ID],
  ['dados@player.ufsm', MASCULINA_ID],
  ['coach@feminina.player', FEMININA_ID],
  ['analyst@feminina.player', FEMININA_ID],
  ['data@feminina.player', FEMININA_ID],
  ['coach@juvenil.player', JUVENIS_ID],
  ['analyst@juvenil.player', JUVENIS_ID],
  ['data@juvenil.player', JUVENIS_ID],
] as const;

export class LinkUsersToTeams1787011200000 implements MigrationInterface {
  name = 'LinkUsersToTeams1787011200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO equipes (id, nome)
      VALUES
        ('${MASCULINA_ID}', 'Masculina'),
        ('${FEMININA_ID}', 'Feminina'),
        ('${JUVENIS_ID}', 'Juvenis')
      ON CONFLICT (id) DO UPDATE
      SET nome = EXCLUDED.nome
    `);

    await queryRunner.query(`
      ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS equipe_id uuid NULL
    `);

    await queryRunner.query(
      `UPDATE usuarios SET equipe_id = $1 WHERE equipe_id IS NULL`,
      [MASCULINA_ID],
    );

    await queryRunner.query(`
      ALTER TABLE usuarios
      ADD CONSTRAINT usuarios_equipe_fk
      FOREIGN KEY (equipe_id) REFERENCES equipes(id)
    `);

    await queryRunner.query(`
      ALTER TABLE usuarios
      ALTER COLUMN equipe_id SET NOT NULL
    `);

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
    for (const [email, equipeId] of USERS) {
      await queryRunner.query(
        `
          INSERT INTO usuarios (email, password_hash, equipe_id)
          VALUES ($1, $2, $3)
          ON CONFLICT (email) DO UPDATE
          SET equipe_id = EXCLUDED.equipe_id
        `,
        [email, passwordHash, equipeId],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM usuarios WHERE email = ANY($1::varchar[])`,
      [USERS.map(([email]) => email)],
    );
    await queryRunner.query(
      `ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_equipe_fk`,
    );
    await queryRunner.query(
      `ALTER TABLE usuarios DROP COLUMN IF EXISTS equipe_id`,
    );
    await queryRunner.query(
      `DELETE FROM equipes WHERE id IN ($1, $2)`,
      [FEMININA_ID, JUVENIS_ID],
    );
    await queryRunner.query(
      `UPDATE equipes SET nome = 'Equipe Principal' WHERE id = $1`,
      [MASCULINA_ID],
    );
  }
}
