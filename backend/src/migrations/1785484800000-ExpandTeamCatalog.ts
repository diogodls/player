import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandTeamCatalog1785484800000 implements MigrationInterface {
  name = 'ExpandTeamCatalog1785484800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE acoes_catalogo AS acao SET ordem = metadata.ordem
      FROM categorias_acao AS categoria, (VALUES
        ('OFFENSIVE_ORGANIZATION', 'GSP', 1), ('OFFENSIVE_ORGANIZATION', 'PPSP', 4),
        ('OFFENSIVE_ORGANIZATION', 'GAP', 5), ('OFFENSIVE_ORGANIZATION', 'PPAP', 8),
        ('OFFENSIVE_ORGANIZATION', 'GGL', 9), ('OFFENSIVE_ORGANIZATION', 'PPGL', 12),
        ('OFFENSIVE_TRANSITION', 'GT', 1), ('OFFENSIVE_TRANSITION', 'PPT', 4),
        ('DEFENSIVE_ORGANIZATION', 'MBRP', 1), ('DEFENSIVE_ORGANIZATION', 'MBGT', 4),
        ('DEFENSIVE_ORGANIZATION', 'VRP', 5), ('DEFENSIVE_ORGANIZATION', 'VGT', 8),
        ('DEFENSIVE_ORGANIZATION', 'PRP', 9), ('DEFENSIVE_ORGANIZATION', 'PRGT', 12),
        ('DEFENSIVE_TRANSITION', 'TRP', 1), ('DEFENSIVE_TRANSITION', 'TGT', 3)
      ) AS metadata(categoria_chave, sigla, ordem)
      WHERE categoria.id = acao.categoria_acao_id AND categoria.tipo_analise_id = 2
        AND categoria.chave = metadata.categoria_chave AND acao.sigla = metadata.sigla
    `);
    await queryRunner.query(`
      INSERT INTO acoes_catalogo (id, categoria_acao_id, impacto_id, nome, sigla, ordem)
      SELECT metadata.id, categoria.id, impacto.id, metadata.nome, metadata.sigla, metadata.ordem
      FROM (VALUES
        ('00000000-0000-0000-0000-000000000601'::uuid, 'OFFENSIVE_ORGANIZATION', 'FSP', 'Finalização em saída de pressão', 'Positiva', 2),
        ('00000000-0000-0000-0000-000000000602'::uuid, 'OFFENSIVE_ORGANIZATION', 'PMSP', 'Posse mantida em saída de pressão', 'Positiva', 3),
        ('00000000-0000-0000-0000-000000000603'::uuid, 'OFFENSIVE_ORGANIZATION', 'FAP', 'Finalização em ataque posicional', 'Positiva', 6),
        ('00000000-0000-0000-0000-000000000604'::uuid, 'OFFENSIVE_ORGANIZATION', 'PMAP', 'Posse mantida ou progressão em ataque posicional', 'Positiva', 7),
        ('00000000-0000-0000-0000-000000000605'::uuid, 'OFFENSIVE_ORGANIZATION', 'FGL', 'Finalização com goleiro-linha', 'Positiva', 10),
        ('00000000-0000-0000-0000-000000000606'::uuid, 'OFFENSIVE_ORGANIZATION', 'PMGL', 'Posse mantida ou progressão com goleiro-linha', 'Positiva', 11),
        ('00000000-0000-0000-0000-000000000607'::uuid, 'OFFENSIVE_TRANSITION', 'FT', 'Finalização em transição ofensiva', 'Positiva', 2),
        ('00000000-0000-0000-0000-000000000608'::uuid, 'OFFENSIVE_TRANSITION', 'PMT', 'Posse mantida ou progressão em transição ofensiva', 'Positiva', 3),
        ('00000000-0000-0000-0000-000000000609'::uuid, 'DEFENSIVE_ORGANIZATION', 'MBJI', 'Jogada interceptada em marcação baixa', 'Positiva', 2),
        ('00000000-0000-0000-0000-000000000610'::uuid, 'DEFENSIVE_ORGANIZATION', 'MBFS', 'Finalização sofrida em marcação baixa', 'Negativa', 3),
        ('00000000-0000-0000-0000-000000000611'::uuid, 'DEFENSIVE_ORGANIZATION', 'VJI', 'Jogada interceptada em marcação variando', 'Positiva', 6),
        ('00000000-0000-0000-0000-000000000612'::uuid, 'DEFENSIVE_ORGANIZATION', 'VFS', 'Finalização sofrida em marcação variando', 'Negativa', 7),
        ('00000000-0000-0000-0000-000000000613'::uuid, 'DEFENSIVE_ORGANIZATION', 'PJI', 'Jogada interceptada em marcação pressão', 'Positiva', 10),
        ('00000000-0000-0000-0000-000000000614'::uuid, 'DEFENSIVE_ORGANIZATION', 'PFS', 'Finalização sofrida em marcação pressão', 'Negativa', 11),
        ('00000000-0000-0000-0000-000000000615'::uuid, 'DEFENSIVE_TRANSITION', 'TFS', 'Finalização sofrida em transição defensiva', 'Negativa', 2)
      ) AS metadata(id, categoria_chave, sigla, nome, impacto_nome, ordem)
      JOIN categorias_acao AS categoria ON categoria.tipo_analise_id = 2
        AND categoria.chave = metadata.categoria_chave AND categoria.deleted_at IS NULL
      JOIN impactos AS impacto ON impacto.nome = metadata.impacto_nome
      WHERE NOT EXISTS (SELECT 1 FROM acoes_catalogo AS existente
        WHERE existente.categoria_acao_id = categoria.id AND existente.sigla = metadata.sigla)
      ON CONFLICT (id) DO NOTHING
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM acoes_catalogo WHERE id IN (
      '00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000602',
      '00000000-0000-0000-0000-000000000603', '00000000-0000-0000-0000-000000000604',
      '00000000-0000-0000-0000-000000000605', '00000000-0000-0000-0000-000000000606',
      '00000000-0000-0000-0000-000000000607', '00000000-0000-0000-0000-000000000608',
      '00000000-0000-0000-0000-000000000609', '00000000-0000-0000-0000-000000000610',
      '00000000-0000-0000-0000-000000000611', '00000000-0000-0000-0000-000000000612',
      '00000000-0000-0000-0000-000000000613', '00000000-0000-0000-0000-000000000614',
      '00000000-0000-0000-0000-000000000615')`);
    await queryRunner.query(`
      UPDATE acoes_catalogo AS acao SET ordem = metadata.ordem
      FROM categorias_acao AS categoria, (VALUES
        ('OFFENSIVE_ORGANIZATION', 'GSP', 1), ('OFFENSIVE_ORGANIZATION', 'PPSP', 2),
        ('OFFENSIVE_ORGANIZATION', 'GAP', 3), ('OFFENSIVE_ORGANIZATION', 'PPAP', 4),
        ('OFFENSIVE_ORGANIZATION', 'GGL', 5), ('OFFENSIVE_ORGANIZATION', 'PPGL', 6),
        ('OFFENSIVE_TRANSITION', 'GT', 1), ('OFFENSIVE_TRANSITION', 'PPT', 2),
        ('DEFENSIVE_ORGANIZATION', 'MBRP', 1), ('DEFENSIVE_ORGANIZATION', 'MBGT', 2),
        ('DEFENSIVE_ORGANIZATION', 'VRP', 3), ('DEFENSIVE_ORGANIZATION', 'VGT', 4),
        ('DEFENSIVE_ORGANIZATION', 'PRP', 5), ('DEFENSIVE_ORGANIZATION', 'PRGT', 6),
        ('DEFENSIVE_TRANSITION', 'TRP', 1), ('DEFENSIVE_TRANSITION', 'TGT', 2)
      ) AS metadata(categoria_chave, sigla, ordem)
      WHERE categoria.id = acao.categoria_acao_id AND categoria.tipo_analise_id = 2
        AND categoria.chave = metadata.categoria_chave AND acao.sigla = metadata.sigla
    `);
  }
}
