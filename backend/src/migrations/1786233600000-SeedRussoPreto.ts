import { MigrationInterface, QueryRunner } from 'typeorm';

type SeedPlayer = {
  id: string;
  name: string;
  position: string;
  secondsPlayed: number;
  actions: Record<string, number>;
};

const SESSION_ID = 'a91e1d48-76c2-4d57-8f04-29ed25c8b001';

const PLAYERS: SeedPlayer[] = [
  { id: 'd10b7c3e-129a-4d1f-8a01-000000000001', name: 'MATEUS', position: 'Fixo', secondsPlayed: 1484, actions: { 'Gol GL': 1, 'GS OO': 2, 'GS BP': 1, CC: 8, PP: 6, FD: 5, RB: 2, DIA: 6 } },
  { id: 'd10b7c3e-129a-4d1f-8a01-000000000002', name: 'DUPIN', position: 'Fixo', secondsPlayed: 62, actions: { PP: 1 } },
  { id: 'd10b7c3e-129a-4d1f-8a01-000000000003', name: 'PET', position: 'Fixo', secondsPlayed: 1090, actions: { 'GS TO': 1, 'GS OO': 2, 'GS BP': 1, CC: 12, PP: 2, FD: 7, DIA: 7 } },
  { id: 'd10b7c3e-129a-4d1f-8a01-000000000004', name: 'BRESOLIN', position: 'Fixo', secondsPlayed: 32, actions: { FD: 1, DIA: 2 } },
  { id: 'd10b7c3e-129a-4d1f-8a01-000000000005', name: 'GARCIA', position: 'Ala', secondsPlayed: 1015, actions: { 'Gol GL': 1, 'GS OO': 2, CC: 9, PP: 3, FD: 3, DIA: 6 } },
  { id: 'd10b7c3e-129a-4d1f-8a01-000000000006', name: 'EVERTON', position: 'Ala', secondsPlayed: 1561, actions: { 'Gol GL': 1, 'GS OO': 2, 'GS BP': 1, ASS: 1, CC: 24, PP: 8, FD: 4, RB: 2, DIA: 2 } },
  { id: 'd10b7c3e-129a-4d1f-8a01-000000000007', name: 'PEPO', position: 'Ala', secondsPlayed: 704, actions: { 'Gol TO': 1, 'GS TO': 1, CC: 4, PP: 4, FD: 4, DIA: 10 } },
  { id: 'd10b7c3e-129a-4d1f-8a01-000000000008', name: 'SENNA', position: 'Ala', secondsPlayed: 851, actions: { 'Gol TO': 1, 'GS TO': 2, ASS: 1, CC: 10, PP: 9, FD: 2, RB: 1, DIA: 5 } },
  { id: 'd10b7c3e-129a-4d1f-8a01-000000000009', name: 'LORENZO', position: 'Ala', secondsPlayed: 606, actions: { 'Gol TO': 1, 'GS TO': 1, GM: 1, CC: 4, RB: 1, DIA: 4 } },
  { id: 'd10b7c3e-129a-4d1f-8a01-000000000010', name: 'NICO', position: 'Pivo', secondsPlayed: 422, actions: { 'GS TO': 1, PP: 3, FD: 1 } },
  { id: 'd10b7c3e-129a-4d1f-8a01-000000000011', name: 'LEO ELIAS', position: 'Pivo', secondsPlayed: 1183, actions: { 'Gol TO': 1, 'Gol GL': 1, 'GS TO': 2, GM: 1, CC: 4, PP: 2, FD: 3, DIA: 4 } },
  { id: 'd10b7c3e-129a-4d1f-8a01-000000000012', name: 'LUCAS LEMOS', position: 'Pivo', secondsPlayed: 991, actions: { 'Gol GL': 1, 'GS BP': 1, CC: 7, PP: 3, DIA: 2 } },
];

const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;

export class SeedRussoPreto1786233600000 implements MigrationInterface {
  name = 'SeedRussoPreto1786233600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (process.env.NODE_ENV === 'production') return;

    const playerValues = PLAYERS.map(
      (player) =>
        `(${quote(player.id)}::uuid, ${quote(player.name)}, ${quote(player.position)}, ${player.secondsPlayed})`,
    ).join(',\n');

    const events = PLAYERS.flatMap((player) => {
      const rawEvents = Object.entries(player.actions).flatMap(
        ([sigla, quantity]) => Array.from({ length: quantity }, () => sigla),
      );
      const actionEvents = rawEvents.map((sigla, index) => ({
        playerId: player.id,
        sigla,
        timestamp: Math.floor(
          (player.secondsPlayed * (index + 1)) / (rawEvents.length + 1),
        ),
        ordinal: index + 1,
      }));
      return [
        { playerId: player.id, sigla: 'ENTROU', timestamp: 0, ordinal: 0 },
        ...actionEvents,
        {
          playerId: player.id,
          sigla: 'SAIU',
          timestamp: player.secondsPlayed,
          ordinal: rawEvents.length + 1,
        },
      ];
    });
    const eventValues = events
      .map(
        (event) =>
          `(${quote(event.playerId)}::uuid, ${quote(event.sigla)}, ${event.timestamp}, ${event.ordinal})`,
      )
      .join(',\n');

    await queryRunner.query(`
      DO $$
      DECLARE
        seed_team_id uuid;
        seed_type_id smallint;
        seed_location_id smallint;
        seed_court_size_id smallint;
        seed_side_id smallint;
        missing_actions text;
      BEGIN
        SELECT id INTO seed_team_id FROM equipes
        WHERE deleted_at IS NULL ORDER BY created_at, id LIMIT 1;
        SELECT id INTO seed_type_id FROM session_types
        WHERE lower(nome) = lower('Jogo') LIMIT 1;
        SELECT id INTO seed_location_id FROM session_locations
        WHERE lower(nome) = lower('Casa') LIMIT 1;
        SELECT id INTO seed_court_size_id FROM session_court_sizes
        WHERE lower(nome) = lower('Grande') LIMIT 1;
        SELECT id INTO seed_side_id FROM lados_preferenciais
        WHERE lower(nome) = lower('Destro') LIMIT 1;

        IF seed_team_id IS NULL OR seed_type_id IS NULL OR
           seed_location_id IS NULL OR seed_court_size_id IS NULL OR
           seed_side_id IS NULL THEN
          RAISE EXCEPTION 'Configuracoes-base obrigatorias nao encontradas';
        END IF;

        SELECT string_agg(required.sigla, ', ' ORDER BY required.sigla)
        INTO missing_actions
        FROM (SELECT DISTINCT sigla FROM (VALUES ${eventValues})
              AS event(player_id, sigla, timestamp_seconds, ordinal)) required
        WHERE NOT EXISTS (
          SELECT 1 FROM acoes_catalogo action
          JOIN categorias_acao category ON category.id = action.categoria_acao_id
          JOIN tipos_analise analysis_type ON analysis_type.id = category.tipo_analise_id
          WHERE lower(action.sigla) = lower(required.sigla)
            AND analysis_type.nome = 'Individual'
            AND action.deleted_at IS NULL AND category.deleted_at IS NULL
        );
        IF missing_actions IS NOT NULL THEN
          RAISE EXCEPTION 'Acoes individuais ausentes no catalogo: %', missing_actions;
        END IF;

        INSERT INTO sessoes (
          id, equipe_id, session_type_id, session_location_id,
          session_court_size_id, data, descricao, deleted_at
        ) VALUES (
          ${quote(SESSION_ID)}::uuid, seed_team_id, seed_type_id,
          seed_location_id, seed_court_size_id, CURRENT_DATE, 'Russo Preto', NULL
        )
        ON CONFLICT (id) DO UPDATE SET
          equipe_id = EXCLUDED.equipe_id,
          session_type_id = EXCLUDED.session_type_id,
          session_location_id = EXCLUDED.session_location_id,
          session_court_size_id = EXCLUDED.session_court_size_id,
          descricao = EXCLUDED.descricao,
          deleted_at = NULL;

        INSERT INTO jogadores (
          id, equipe_id, posicao_id, lado_preferencial_id, nome, idade, deleted_at
        )
        SELECT player.id, seed_team_id, position.id, seed_side_id,
               player.name, 18, NULL
        FROM (VALUES ${playerValues}) AS player(id, name, position_name, seconds_played)
        JOIN posicoes position ON lower(position.nome) = lower(player.position_name)
        ON CONFLICT (id) DO UPDATE SET
          equipe_id = EXCLUDED.equipe_id,
          posicao_id = EXCLUDED.posicao_id,
          lado_preferencial_id = EXCLUDED.lado_preferencial_id,
          nome = EXCLUDED.nome,
          deleted_at = NULL;

        DELETE FROM acoes_taggeadas WHERE sessao_id = ${quote(SESSION_ID)}::uuid;

        INSERT INTO acoes_taggeadas (
          id, sessao_id, acao_catalogo_id, jogador_id, timestamp_segundos
        )
        SELECT (
          substr(md5(event.player_id::text || ':' || event.sigla || ':' || event.ordinal), 1, 8) || '-' ||
          substr(md5(event.player_id::text || ':' || event.sigla || ':' || event.ordinal), 9, 4) || '-4' ||
          substr(md5(event.player_id::text || ':' || event.sigla || ':' || event.ordinal), 14, 3) || '-8' ||
          substr(md5(event.player_id::text || ':' || event.sigla || ':' || event.ordinal), 18, 3) || '-' ||
          substr(md5(event.player_id::text || ':' || event.sigla || ':' || event.ordinal), 21, 12)
        )::uuid,
        ${quote(SESSION_ID)}::uuid, action.id, event.player_id, event.timestamp_seconds
        FROM (VALUES ${eventValues})
          AS event(player_id, sigla, timestamp_seconds, ordinal)
        JOIN acoes_catalogo action ON lower(action.sigla) = lower(event.sigla)
        JOIN categorias_acao category ON category.id = action.categoria_acao_id
        JOIN tipos_analise analysis_type ON analysis_type.id = category.tipo_analise_id
          AND analysis_type.nome = 'Individual'
        WHERE action.deleted_at IS NULL AND category.deleted_at IS NULL
        ON CONFLICT (id) DO UPDATE SET
          sessao_id = EXCLUDED.sessao_id,
          acao_catalogo_id = EXCLUDED.acao_catalogo_id,
          jogador_id = EXCLUDED.jogador_id,
          timestamp_segundos = EXCLUDED.timestamp_segundos,
          deleted_at = NULL;
      END $$;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (process.env.NODE_ENV === 'production') return;
    const playerIds = PLAYERS.map((player) => `${quote(player.id)}::uuid`).join(', ');
    await queryRunner.query(`
      DELETE FROM acoes_taggeadas
      WHERE sessao_id = ${quote(SESSION_ID)}::uuid
         OR jogador_id IN (${playerIds});
      DELETE FROM sessoes WHERE id = ${quote(SESSION_ID)}::uuid;
      DELETE FROM jogadores WHERE id IN (${playerIds});
    `);
  }
}
