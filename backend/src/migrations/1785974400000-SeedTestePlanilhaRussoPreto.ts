import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTestePlanilhaRussoPreto1785974400000 implements MigrationInterface {
  name = 'SeedTestePlanilhaRussoPreto1785974400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        equipe_uuid uuid;
        tipo_id smallint;
        local_id smallint;
        quadra_id smallint;
        lado_id smallint;
        referencias_encontradas integer;
      BEGIN
        SELECT id INTO equipe_uuid
        FROM equipes
        WHERE nome = 'Equipe Principal' AND deleted_at IS NULL;

        SELECT id INTO tipo_id FROM session_types WHERE nome = 'Treino';
        SELECT id INTO local_id FROM session_locations WHERE nome = 'Casa';
        SELECT id INTO quadra_id FROM session_court_sizes WHERE nome = 'Grande';
        SELECT id INTO lado_id FROM lados_preferenciais WHERE nome = 'Destro';

        IF equipe_uuid IS NULL OR tipo_id IS NULL OR local_id IS NULL
          OR quadra_id IS NULL OR lado_id IS NULL THEN
          RAISE EXCEPTION
            'Nao foi possivel localizar a equipe ou as configuracoes reais da sessao de teste';
        END IF;

        SELECT count(*) INTO referencias_encontradas
        FROM (VALUES ('Pivo'), ('Ala'), ('Fixo')) AS esperada(nome)
        WHERE EXISTS (
          SELECT 1 FROM posicoes AS posicao
          WHERE lower(translate(posicao.nome, 'Ã´', 'o')) = lower(esperada.nome)
        );
        IF referencias_encontradas <> 3 THEN
          RAISE EXCEPTION 'Nao foi possivel localizar todas as posicoes dos jogadores';
        END IF;

        SELECT count(*) INTO referencias_encontradas
        FROM (VALUES
          ('Gol TO'), ('Gol OO'), ('Gol BP'), ('Gol GL'), ('Gol MGL'),
          ('GS TO'), ('GS OO'), ('GS BP'), ('GS GLA'), ('GS GLO'),
          ('GM'), ('ASS'), ('AD'), ('CC'), ('PP'), ('GP'), ('FD'), ('RB'), ('DIA'),
          ('ENTROU'), ('SAIU')
        ) AS esperada(sigla)
        WHERE EXISTS (
          SELECT 1
          FROM acoes_catalogo AS acao
          JOIN categorias_acao AS categoria ON categoria.id = acao.categoria_acao_id
          JOIN tipos_analise AS tipo ON tipo.id = categoria.tipo_analise_id
          WHERE upper(acao.sigla) = upper(esperada.sigla)
            AND tipo.nome = 'Individual'
            AND acao.deleted_at IS NULL AND categoria.deleted_at IS NULL
        );
        IF referencias_encontradas <> 21 THEN
          RAISE EXCEPTION 'Nao foi possivel localizar as 21 acoes individuais por sigla';
        END IF;

        INSERT INTO jogadores
          (id, equipe_id, posicao_id, lado_preferencial_id, nome, idade)
        SELECT dados.id, equipe_uuid, posicao.id, lado_id, dados.nome, 25
        FROM (VALUES
          ('70000000-0000-4000-8000-000000000001'::uuid, 'LEO ELIAS', 'Pivo'),
          ('70000000-0000-4000-8000-000000000002'::uuid, 'EVERTON', 'Ala'),
          ('70000000-0000-4000-8000-000000000003'::uuid, 'SENNA', 'Ala'),
          ('70000000-0000-4000-8000-000000000004'::uuid, 'PET', 'Fixo')
        ) AS dados(id, nome, posicao_nome)
        JOIN posicoes AS posicao
          ON lower(translate(posicao.nome, 'Ã´', 'o')) = lower(dados.posicao_nome)
        ON CONFLICT (id) DO UPDATE SET
          equipe_id = EXCLUDED.equipe_id,
          posicao_id = EXCLUDED.posicao_id,
          lado_preferencial_id = EXCLUDED.lado_preferencial_id,
          nome = EXCLUDED.nome,
          idade = EXCLUDED.idade,
          deleted_at = NULL;

        INSERT INTO sessoes
          (id, equipe_id, session_type_id, session_location_id,
           session_court_size_id, data, descricao)
        VALUES
          ('70000000-0000-0000-0000-000000000010', equipe_uuid, tipo_id,
           local_id, quadra_id, DATE '2026-08-05', 'Teste planilha Russo Preto')
        ON CONFLICT (id) DO UPDATE SET
          equipe_id = EXCLUDED.equipe_id,
          session_type_id = EXCLUDED.session_type_id,
          session_location_id = EXCLUDED.session_location_id,
          session_court_size_id = EXCLUDED.session_court_size_id,
          data = EXCLUDED.data,
          descricao = EXCLUDED.descricao,
          deleted_at = NULL;
      END $$;
    `);

    await queryRunner.query(`
      WITH quantidades(jogador_id, jogador_ordem, sigla, quantidade) AS (VALUES
        ('70000000-0000-4000-8000-000000000001'::uuid, 1, 'Gol TO', 1),
        ('70000000-0000-4000-8000-000000000001'::uuid, 1, 'Gol GL', 1),
        ('70000000-0000-4000-8000-000000000001'::uuid, 1, 'GS TO', 2),
        ('70000000-0000-4000-8000-000000000001'::uuid, 1, 'GM', 1),
        ('70000000-0000-4000-8000-000000000001'::uuid, 1, 'CC', 4),
        ('70000000-0000-4000-8000-000000000001'::uuid, 1, 'PP', 2),
        ('70000000-0000-4000-8000-000000000001'::uuid, 1, 'FD', 3),
        ('70000000-0000-4000-8000-000000000001'::uuid, 1, 'DIA', 4),
        ('70000000-0000-4000-8000-000000000002'::uuid, 2, 'Gol GL', 1),
        ('70000000-0000-4000-8000-000000000002'::uuid, 2, 'GS OO', 2),
        ('70000000-0000-4000-8000-000000000002'::uuid, 2, 'GS BP', 1),
        ('70000000-0000-4000-8000-000000000002'::uuid, 2, 'ASS', 1),
        ('70000000-0000-4000-8000-000000000002'::uuid, 2, 'CC', 24),
        ('70000000-0000-4000-8000-000000000002'::uuid, 2, 'PP', 8),
        ('70000000-0000-4000-8000-000000000002'::uuid, 2, 'FD', 4),
        ('70000000-0000-4000-8000-000000000002'::uuid, 2, 'RB', 2),
        ('70000000-0000-4000-8000-000000000002'::uuid, 2, 'DIA', 2),
        ('70000000-0000-4000-8000-000000000003'::uuid, 3, 'Gol TO', 1),
        ('70000000-0000-4000-8000-000000000003'::uuid, 3, 'GS TO', 2),
        ('70000000-0000-4000-8000-000000000003'::uuid, 3, 'ASS', 1),
        ('70000000-0000-4000-8000-000000000003'::uuid, 3, 'CC', 10),
        ('70000000-0000-4000-8000-000000000003'::uuid, 3, 'PP', 9),
        ('70000000-0000-4000-8000-000000000003'::uuid, 3, 'FD', 2),
        ('70000000-0000-4000-8000-000000000003'::uuid, 3, 'RB', 1),
        ('70000000-0000-4000-8000-000000000003'::uuid, 3, 'DIA', 5),
        ('70000000-0000-4000-8000-000000000004'::uuid, 4, 'GS TO', 1),
        ('70000000-0000-4000-8000-000000000004'::uuid, 4, 'GS OO', 2),
        ('70000000-0000-4000-8000-000000000004'::uuid, 4, 'GS BP', 1),
        ('70000000-0000-4000-8000-000000000004'::uuid, 4, 'CC', 12),
        ('70000000-0000-4000-8000-000000000004'::uuid, 4, 'PP', 2),
        ('70000000-0000-4000-8000-000000000004'::uuid, 4, 'FD', 7),
        ('70000000-0000-4000-8000-000000000004'::uuid, 4, 'DIA', 7)
      ), eventos AS (
        SELECT q.jogador_id, q.jogador_ordem, q.sigla, serie.ocorrencia
        FROM quantidades AS q
        CROSS JOIN LATERAL generate_series(1, q.quantidade) AS serie(ocorrencia)
      ), catalogo AS (
        SELECT acao.id, upper(acao.sigla) AS sigla
        FROM acoes_catalogo AS acao
        JOIN categorias_acao AS categoria ON categoria.id = acao.categoria_acao_id
        JOIN tipos_analise AS tipo ON tipo.id = categoria.tipo_analise_id
        WHERE tipo.nome = 'Individual'
          AND acao.deleted_at IS NULL AND categoria.deleted_at IS NULL
      ), preparados AS (
        SELECT evento.*, catalogo.id AS acao_id,
          row_number() OVER (
            ORDER BY evento.jogador_ordem, evento.sigla, evento.ocorrencia
          )::integer AS instante
        FROM eventos AS evento
        JOIN catalogo ON catalogo.sigla = upper(evento.sigla)
      )
      INSERT INTO acoes_taggeadas
        (id, sessao_id, acao_catalogo_id, jogador_id, timestamp_segundos)
      SELECT md5(
          'teste-planilha-russo-preto:' || jogador_id::text || ':' ||
          sigla || ':' || ocorrencia::text
        )::uuid,
        '70000000-0000-0000-0000-000000000010', acao_id, jogador_id,
        instante * 5
      FROM preparados
      ON CONFLICT (id) DO UPDATE SET
        sessao_id = EXCLUDED.sessao_id,
        acao_catalogo_id = EXCLUDED.acao_catalogo_id,
        jogador_id = EXCLUDED.jogador_id,
        timestamp_segundos = EXCLUDED.timestamp_segundos,
        deleted_at = NULL
    `);
    await queryRunner.query(`
      INSERT INTO acoes_taggeadas
        (id, sessao_id, acao_catalogo_id, jogador_id, timestamp_segundos)
      SELECT evento.id, '70000000-0000-0000-0000-000000000010', acao.id,
        evento.jogador_id, evento.timestamp_segundos
      FROM (VALUES
        ('70000000-0000-0000-0000-000000000101'::uuid, '70000000-0000-4000-8000-000000000003'::uuid, 'ENTROU', 0),
        ('70000000-0000-0000-0000-000000000102'::uuid, '70000000-0000-4000-8000-000000000003'::uuid, 'SAIU', 851),
        ('70000000-0000-0000-0000-000000000103'::uuid, '70000000-0000-4000-8000-000000000002'::uuid, 'ENTROU', 0),
        ('70000000-0000-0000-0000-000000000104'::uuid, '70000000-0000-4000-8000-000000000002'::uuid, 'SAIU', 1561),
        ('70000000-0000-0000-0000-000000000105'::uuid, '70000000-0000-4000-8000-000000000004'::uuid, 'ENTROU', 0),
        ('70000000-0000-0000-0000-000000000106'::uuid, '70000000-0000-4000-8000-000000000004'::uuid, 'SAIU', 1090),
        ('70000000-0000-0000-0000-000000000107'::uuid, '70000000-0000-4000-8000-000000000001'::uuid, 'ENTROU', 0),
        ('70000000-0000-0000-0000-000000000108'::uuid, '70000000-0000-4000-8000-000000000001'::uuid, 'SAIU', 1183)
      ) AS evento(id, jogador_id, sigla, timestamp_segundos)
      JOIN acoes_catalogo AS acao ON upper(acao.sigla) = evento.sigla
      JOIN categorias_acao AS categoria ON categoria.id = acao.categoria_acao_id
      JOIN tipos_analise AS tipo ON tipo.id = categoria.tipo_analise_id
      WHERE tipo.nome = 'Individual'
        AND acao.deleted_at IS NULL AND categoria.deleted_at IS NULL
      ON CONFLICT (id) DO UPDATE SET
        sessao_id = EXCLUDED.sessao_id,
        acao_catalogo_id = EXCLUDED.acao_catalogo_id,
        jogador_id = EXCLUDED.jogador_id,
        timestamp_segundos = EXCLUDED.timestamp_segundos,
        deleted_at = NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM acoes_taggeadas
      WHERE sessao_id = '70000000-0000-0000-0000-000000000010'
    `);
    await queryRunner.query(`
      DELETE FROM sessoes
      WHERE id = '70000000-0000-0000-0000-000000000010'
    `);
    await queryRunner.query(`
      DELETE FROM jogadores
      WHERE id IN (
        '70000000-0000-4000-8000-000000000001',
        '70000000-0000-4000-8000-000000000002',
        '70000000-0000-4000-8000-000000000003',
        '70000000-0000-4000-8000-000000000004'
      )
      AND NOT EXISTS (
        SELECT 1 FROM acoes_taggeadas WHERE jogador_id = jogadores.id
      )
    `);
  }
}
