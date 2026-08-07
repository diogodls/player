export const PRESENTATION_DEMO_SEED_SQL = `
DO $$
DECLARE
  first_session_id uuid := 'a91e1d48-76c2-4d57-8f04-29ed25c8b001';
  second_session_id uuid := 'a91e1d48-76c2-4d57-8f04-29ed25c8b002';
  missing_actions text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM sessoes WHERE id = first_session_id) THEN
    RAISE EXCEPTION 'Sessao-base de demonstracao nao encontrada';
  END IF;

  SELECT string_agg(required.sigla, ', ' ORDER BY required.sigla)
  INTO missing_actions
  FROM (VALUES
    ('GAP'), ('FAP'), ('PPAP'), ('GSP'), ('PPSP'), ('GGL'), ('FGL'),
    ('PMGL'), ('GT'), ('FT'), ('PPT'), ('MBRP'), ('MBJI'), ('MBFS'),
    ('VRP'), ('VJI'), ('VFS'), ('PRP'), ('PJI'), ('PFS'), ('TRP'),
    ('TFS'), ('BPBE'), ('GBP'), ('BPSE')
  ) required(sigla)
  WHERE NOT EXISTS (
    SELECT 1 FROM acoes_catalogo action
    JOIN categorias_acao category ON category.id = action.categoria_acao_id
    WHERE lower(action.sigla) = lower(required.sigla)
      AND category.tipo_analise_id = 2
      AND action.deleted_at IS NULL AND category.deleted_at IS NULL
  );
  IF missing_actions IS NOT NULL THEN
    RAISE EXCEPTION 'Acoes coletivas ausentes no catalogo: %', missing_actions;
  END IF;

  UPDATE sessoes SET data = CURRENT_DATE WHERE id = first_session_id;
  INSERT INTO sessoes (
    id, equipe_id, session_type_id, session_location_id,
    session_court_size_id, data, descricao, deleted_at
  )
  SELECT second_session_id, equipe_id, session_type_id, session_location_id,
         session_court_size_id, CURRENT_DATE - 7, 'Russo Preto — retorno', NULL
  FROM sessoes WHERE id = first_session_id
  ON CONFLICT (id) DO UPDATE SET
    equipe_id = EXCLUDED.equipe_id,
    session_type_id = EXCLUDED.session_type_id,
    session_location_id = EXCLUDED.session_location_id,
    session_court_size_id = EXCLUDED.session_court_size_id,
    data = EXCLUDED.data,
    descricao = EXCLUDED.descricao,
    deleted_at = NULL;

  DELETE FROM acoes_taggeadas WHERE sessao_id = second_session_id;
  INSERT INTO acoes_taggeadas (
    id, sessao_id, acao_catalogo_id, jogador_id, timestamp_segundos
  )
  SELECT (
    substr(md5(second_session_id::text || ':' || source.id::text), 1, 8) || '-' ||
    substr(md5(second_session_id::text || ':' || source.id::text), 9, 4) || '-4' ||
    substr(md5(second_session_id::text || ':' || source.id::text), 14, 3) || '-8' ||
    substr(md5(second_session_id::text || ':' || source.id::text), 18, 3) || '-' ||
    substr(md5(second_session_id::text || ':' || source.id::text), 21, 12)
  )::uuid,
  second_session_id, source.acao_catalogo_id, source.jogador_id,
  source.timestamp_segundos
  FROM acoes_taggeadas source
  WHERE source.sessao_id = first_session_id
    AND source.jogador_id IS NOT NULL
    AND source.deleted_at IS NULL;

  DELETE FROM acoes_taggeadas
  WHERE sessao_id IN (first_session_id, second_session_id)
    AND jogador_id IS NULL;
  INSERT INTO acoes_taggeadas (
    id, sessao_id, acao_catalogo_id, jogador_id, timestamp_segundos
  )
  SELECT (
    substr(md5(seed_session.id::text || ':team:' || event.sigla), 1, 8) || '-' ||
    substr(md5(seed_session.id::text || ':team:' || event.sigla), 9, 4) || '-4' ||
    substr(md5(seed_session.id::text || ':team:' || event.sigla), 14, 3) || '-8' ||
    substr(md5(seed_session.id::text || ':team:' || event.sigla), 18, 3) || '-' ||
    substr(md5(seed_session.id::text || ':team:' || event.sigla), 21, 12)
  )::uuid,
  seed_session.id, action.id, NULL, event.timestamp_seconds
  FROM (VALUES
    ('GAP', 30), ('FAP', 60), ('PPAP', 90), ('GSP', 120), ('PPSP', 150),
    ('GGL', 180), ('FGL', 210), ('PMGL', 240), ('GT', 270), ('FT', 300),
    ('PPT', 330), ('MBRP', 360), ('MBJI', 390), ('MBFS', 420),
    ('VRP', 450), ('VJI', 480), ('VFS', 510), ('PRP', 540),
    ('PJI', 570), ('PFS', 600), ('TRP', 630), ('TFS', 660),
    ('BPBE', 690), ('GBP', 720), ('BPSE', 750)
  ) event(sigla, timestamp_seconds)
  CROSS JOIN (VALUES (first_session_id), (second_session_id)) seed_session(id)
  JOIN acoes_catalogo action ON lower(action.sigla) = lower(event.sigla)
  JOIN categorias_acao category ON category.id = action.categoria_acao_id
    AND category.tipo_analise_id = 2
  WHERE action.deleted_at IS NULL AND category.deleted_at IS NULL;
END $$;
`;
