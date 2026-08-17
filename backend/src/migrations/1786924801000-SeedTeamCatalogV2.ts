import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTeamCatalogV21786924801000 implements MigrationInterface {
  name = 'SeedTeamCatalogV21786924801000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO categorias_acao (id, tipo_analise_id, nome, chave, ordem) VALUES
        ('00000000-0000-0000-0000-000000000701', 2, 'Bola parada - novo catálogo', 'TEAM_V2_SET_PIECE', 1),
        ('00000000-0000-0000-0000-000000000702', 2, 'Ataque', 'TEAM_V2_ATTACK', 2),
        ('00000000-0000-0000-0000-000000000703', 2, 'Defesa', 'TEAM_V2_DEFENSE', 3)
      ON CONFLICT (id) DO UPDATE SET
        tipo_analise_id = EXCLUDED.tipo_analise_id,
        nome = EXCLUDED.nome,
        chave = EXCLUDED.chave,
        ordem = EXCLUDED.ordem,
        deleted_at = NULL
    `);

    await queryRunner.query(`
      INSERT INTO acoes_catalogo
        (id, categoria_acao_id, impacto_id, nome, sigla, ordem)
      SELECT metadata.id, metadata.categoria_id, impacto.id,
        metadata.nome, metadata.sigla, metadata.ordem
      FROM (VALUES
        ('00000000-0000-0000-0000-000000000711'::uuid, '00000000-0000-0000-0000-000000000701'::uuid, 'Gol', 'BP_GOL', 'Positiva', 1),
        ('00000000-0000-0000-0000-000000000712'::uuid, '00000000-0000-0000-0000-000000000701'::uuid, 'Jogada bem executada', 'BP_BEM_EXEC', 'Positiva', 2),
        ('00000000-0000-0000-0000-000000000713'::uuid, '00000000-0000-0000-0000-000000000701'::uuid, 'Jogada mal executada', 'BP_MAL_EXEC', 'Negativa', 3),
        ('00000000-0000-0000-0000-000000000714'::uuid, '00000000-0000-0000-0000-000000000701'::uuid, 'Sem execução', 'BP_SEM_EXEC', 'Negativa', 4),
        ('00000000-0000-0000-0000-000000000715'::uuid, '00000000-0000-0000-0000-000000000702'::uuid, 'Gol', 'AT_GOL', 'Positiva', 1),
        ('00000000-0000-0000-0000-000000000716'::uuid, '00000000-0000-0000-0000-000000000702'::uuid, 'Finalização', 'AT_FINALIZACAO', 'Positiva', 2),
        ('00000000-0000-0000-0000-000000000717'::uuid, '00000000-0000-0000-0000-000000000702'::uuid, 'Posse mantida', 'AT_POSSE_MANTIDA', 'Positiva', 3),
        ('00000000-0000-0000-0000-000000000718'::uuid, '00000000-0000-0000-0000-000000000702'::uuid, 'Posse perdida', 'AT_POSSE_PERDIDA', 'Negativa', 4),
        ('00000000-0000-0000-0000-000000000719'::uuid, '00000000-0000-0000-0000-000000000703'::uuid, 'Gol sofrido', 'DF_GOL_SOFRIDO', 'Negativa', 1),
        ('00000000-0000-0000-0000-000000000720'::uuid, '00000000-0000-0000-0000-000000000703'::uuid, 'Finalização sofrida', 'DF_FINALIZACAO_SOFRIDA', 'Negativa', 2),
        ('00000000-0000-0000-0000-000000000721'::uuid, '00000000-0000-0000-0000-000000000703'::uuid, 'Jogada interceptada', 'DF_JOGADA_INTERCEPTADA', 'Positiva', 3),
        ('00000000-0000-0000-0000-000000000722'::uuid, '00000000-0000-0000-0000-000000000703'::uuid, 'Recuperação de bola', 'DF_RECUPERACAO', 'Positiva', 4)
      ) AS metadata(id, categoria_id, nome, sigla, impacto_nome, ordem)
      JOIN impactos AS impacto ON impacto.nome = metadata.impacto_nome
      ON CONFLICT (id) DO UPDATE SET
        categoria_acao_id = EXCLUDED.categoria_acao_id,
        impacto_id = EXCLUDED.impacto_id,
        nome = EXCLUDED.nome,
        sigla = EXCLUDED.sigla,
        ordem = EXCLUDED.ordem,
        deleted_at = NULL
    `);

    await queryRunner.query(`
      INSERT INTO contextos_acao_equipe
        (id, categoria_acao_id, nome, chave, ordem) VALUES
        ('00000000-0000-0000-0000-000000000731', '00000000-0000-0000-0000-000000000701', 'Canto', 'CORNER', 1),
        ('00000000-0000-0000-0000-000000000732', '00000000-0000-0000-0000-000000000701', 'Lateral ofensivo', 'OFFENSIVE_KICK_IN', 2),
        ('00000000-0000-0000-0000-000000000733', '00000000-0000-0000-0000-000000000701', 'Falta', 'FREE_KICK', 3),
        ('00000000-0000-0000-0000-000000000734', '00000000-0000-0000-0000-000000000701', 'Lateral defensivo', 'DEFENSIVE_KICK_IN', 4),
        ('00000000-0000-0000-0000-000000000735', '00000000-0000-0000-0000-000000000701', 'Arremesso de meta', 'GOAL_CLEARANCE', 5),
        ('00000000-0000-0000-0000-000000000736', '00000000-0000-0000-0000-000000000702', 'Transição ofensiva', 'OFFENSIVE_TRANSITION', 1),
        ('00000000-0000-0000-0000-000000000737', '00000000-0000-0000-0000-000000000702', 'Saída de pressão', 'PRESSURE_EXIT', 2),
        ('00000000-0000-0000-0000-000000000738', '00000000-0000-0000-0000-000000000702', 'Goleiro linha', 'FLY_GOALKEEPER', 3),
        ('00000000-0000-0000-0000-000000000739', '00000000-0000-0000-0000-000000000702', 'Ataque posicional', 'POSITIONAL_ATTACK', 4),
        ('00000000-0000-0000-0000-000000000740', '00000000-0000-0000-0000-000000000703', 'Transição defensiva', 'DEFENSIVE_TRANSITION', 1),
        ('00000000-0000-0000-0000-000000000741', '00000000-0000-0000-0000-000000000703', 'Marcação variando pra pressão', 'VARIABLE_PRESSING', 2),
        ('00000000-0000-0000-0000-000000000742', '00000000-0000-0000-0000-000000000703', 'Marcação baixa', 'LOW_BLOCK', 3),
        ('00000000-0000-0000-0000-000000000743', '00000000-0000-0000-0000-000000000703', 'Pressão', 'PRESSING', 4),
        ('00000000-0000-0000-0000-000000000744', '00000000-0000-0000-0000-000000000703', 'Goleiro linha defensivo', 'DEFENSIVE_FLY_GOALKEEPER', 5)
      ON CONFLICT (id) DO UPDATE SET
        categoria_acao_id = EXCLUDED.categoria_acao_id,
        nome = EXCLUDED.nome,
        chave = EXCLUDED.chave,
        ordem = EXCLUDED.ordem,
        deleted_at = NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM contextos_acao_equipe
      WHERE id BETWEEN '00000000-0000-0000-0000-000000000731'
        AND '00000000-0000-0000-0000-000000000744'
    `);
    await queryRunner.query(`
      DELETE FROM acoes_catalogo
      WHERE id BETWEEN '00000000-0000-0000-0000-000000000711'
        AND '00000000-0000-0000-0000-000000000722'
    `);
    await queryRunner.query(`
      DELETE FROM categorias_acao
      WHERE id IN (
        '00000000-0000-0000-0000-000000000701',
        '00000000-0000-0000-0000-000000000702',
        '00000000-0000-0000-0000-000000000703'
      )
    `);
  }
}
