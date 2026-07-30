import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlayerCourtEvents1785312000000 implements MigrationInterface {
  name = 'AddPlayerCourtEvents1785312000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO impactos (id, nome)
      VALUES (3, 'Neutra')
      ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome
    `);

    await queryRunner.query(`
      INSERT INTO categorias_acao (
        id,
        tipo_analise_id,
        nome,
        chave,
        ordem
      )
      VALUES (
        '00000000-0000-0000-0000-000000000311',
        1,
        'Minutagem',
        'PLAYING_TIME',
        5
      )
      ON CONFLICT (id) DO UPDATE
      SET nome = EXCLUDED.nome,
          chave = EXCLUDED.chave,
          ordem = EXCLUDED.ordem,
          deleted_at = NULL
    `);

    await queryRunner.query(`
      INSERT INTO acoes_catalogo (
        id,
        categoria_acao_id,
        impacto_id,
        nome,
        sigla,
        ordem
      )
      VALUES
        (
          '00000000-0000-0000-0000-000000000440',
          '00000000-0000-0000-0000-000000000311',
          3,
          'Entrou em quadra',
          'ENTROU',
          1
        ),
        (
          '00000000-0000-0000-0000-000000000441',
          '00000000-0000-0000-0000-000000000311',
          3,
          'Saiu de quadra',
          'SAIU',
          2
        )
      ON CONFLICT (id) DO UPDATE
      SET categoria_acao_id = EXCLUDED.categoria_acao_id,
          impacto_id = EXCLUDED.impacto_id,
          nome = EXCLUDED.nome,
          sigla = EXCLUDED.sigla,
          ordem = EXCLUDED.ordem,
          deleted_at = NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM acoes_catalogo
      WHERE id IN (
        '00000000-0000-0000-0000-000000000440',
        '00000000-0000-0000-0000-000000000441'
      )
    `);
    await queryRunner.query(`
      DELETE FROM categorias_acao
      WHERE id = '00000000-0000-0000-0000-000000000311'
    `);
    await queryRunner.query(`
      DELETE FROM impactos
      WHERE id = 3
        AND NOT EXISTS (
          SELECT 1 FROM acoes_catalogo WHERE impacto_id = 3
        )
    `);
  }
}
