import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizeTeamCatalog1784275200000 implements MigrationInterface {
  name = 'OrganizeTeamCatalog1784275200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO categorias_acao (id, tipo_analise_id, nome, chave, ordem) VALUES
        ('00000000-0000-0000-0000-000000000307', 2, 'Transição ofensiva', 'OFFENSIVE_TRANSITION', 3),
        ('00000000-0000-0000-0000-000000000308', 2, 'Organização defensiva', 'DEFENSIVE_ORGANIZATION', 4),
        ('00000000-0000-0000-0000-000000000309', 2, 'Transição defensiva', 'DEFENSIVE_TRANSITION', 5),
        ('00000000-0000-0000-0000-000000000310', 2, 'Goleiro-linha', 'FLY_GOALKEEPER', 6)
      ON CONFLICT (id) DO UPDATE SET
        tipo_analise_id = EXCLUDED.tipo_analise_id,
        nome = EXCLUDED.nome,
        chave = EXCLUDED.chave,
        ordem = EXCLUDED.ordem
    `);
    await queryRunner.query(`
      UPDATE categorias_acao AS categoria
      SET nome = metadata.nome, chave = metadata.chave, ordem = metadata.ordem
      FROM (VALUES
        ('00000000-0000-0000-0000-000000000305'::uuid, 'Bola parada', 'SET_PIECE', 1),
        ('00000000-0000-0000-0000-000000000306'::uuid, 'Organização ofensiva', 'OFFENSIVE_ORGANIZATION', 2)
      ) AS metadata(id, nome, chave, ordem)
      WHERE categoria.id = metadata.id AND categoria.tipo_analise_id = 2
    `);
    await queryRunner.query(`
      UPDATE acoes_catalogo AS acao
      SET categoria_acao_id = metadata.categoria_id,
          nome = metadata.nome,
          ordem = metadata.ordem
      FROM (VALUES
        ('BPSE', '00000000-0000-0000-0000-000000000305'::uuid, 'Bola parada sem execução', 1),
        ('BPME', '00000000-0000-0000-0000-000000000305'::uuid, 'Bola parada mal executada', 2),
        ('BPBE', '00000000-0000-0000-0000-000000000305'::uuid, 'Bola parada bem executada', 3),
        ('GBP', '00000000-0000-0000-0000-000000000305'::uuid, 'Gol de bola parada', 4),
        ('GSP', '00000000-0000-0000-0000-000000000306'::uuid, 'Gol de saída de pressão', 1),
        ('PPSP', '00000000-0000-0000-0000-000000000306'::uuid, 'Perda de posse na saída de pressão', 2),
        ('GAP', '00000000-0000-0000-0000-000000000306'::uuid, 'Gol de ataque posicional', 3),
        ('PPAP', '00000000-0000-0000-0000-000000000306'::uuid, 'Perda de posse no ataque posicional', 4),
        ('GT', '00000000-0000-0000-0000-000000000307'::uuid, 'Gol em transição ofensiva', 1),
        ('PPT', '00000000-0000-0000-0000-000000000307'::uuid, 'Perda de posse em transição ofensiva', 2),
        ('MBRP', '00000000-0000-0000-0000-000000000308'::uuid, 'Recuperação de bola em marcação baixa', 1),
        ('MBGT', '00000000-0000-0000-0000-000000000308'::uuid, 'Gol sofrido em marcação baixa', 2),
        ('VRP', '00000000-0000-0000-0000-000000000308'::uuid, 'Recuperação de bola em marcação variando', 3),
        ('VGT', '00000000-0000-0000-0000-000000000308'::uuid, 'Gol sofrido em marcação variando', 4),
        ('PRP', '00000000-0000-0000-0000-000000000308'::uuid, 'Recuperação de bola em marcação pressão', 5),
        ('PRGT', '00000000-0000-0000-0000-000000000308'::uuid, 'Gol sofrido em marcação pressão', 6),
        ('TRP', '00000000-0000-0000-0000-000000000309'::uuid, 'Recuperação de bola em transição defensiva', 1),
        ('TGT', '00000000-0000-0000-0000-000000000309'::uuid, 'Gol sofrido em transição defensiva', 2),
        ('GGL', '00000000-0000-0000-0000-000000000310'::uuid, 'Gol de goleiro-linha', 1),
        ('PPGL', '00000000-0000-0000-0000-000000000310'::uuid, 'Perda de posse com goleiro-linha', 2)
      ) AS metadata(sigla, categoria_id, nome, ordem), categorias_acao categoria_atual
      WHERE acao.sigla = metadata.sigla
        AND categoria_atual.id = acao.categoria_acao_id
        AND categoria_atual.tipo_analise_id = 2
    `);
  }

  async down(): Promise<void> {
    // Catalog reorganization preserves data and is intentionally irreversible.
  }
}
