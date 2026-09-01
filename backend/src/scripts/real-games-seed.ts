type SeedPlayer = {
  id: string;
  name: string;
  position: 'Fixo' | 'Ala' | 'Pivo';
};

type SessionPlayerData = {
  seconds: number;
  actions: Record<string, number>;
};

type SeedSession = {
  id: string;
  description: string;
  date: string;
  players: Record<string, SessionPlayerData>;
};

const TEAM_ID = '00000000-0000-0000-0000-000000000001';

const PLAYERS: SeedPlayer[] = [
  {
    id: 'd10b7c3e-129a-4d1f-8a01-000000000013',
    name: 'ARTUR',
    position: 'Fixo',
  },
  {
    id: 'd10b7c3e-129a-4d1f-8a01-000000000004',
    name: 'BRESOLIN',
    position: 'Fixo',
  },
  {
    id: 'd10b7c3e-129a-4d1f-8a01-000000000002',
    name: 'DUPIN',
    position: 'Fixo',
  },
  {
    id: 'd10b7c3e-129a-4d1f-8a01-000000000006',
    name: 'EVERTON',
    position: 'Ala',
  },
  {
    id: 'd10b7c3e-129a-4d1f-8a01-000000000014',
    name: 'FERNANDO',
    position: 'Fixo',
  },
  {
    id: 'd10b7c3e-129a-4d1f-8a01-000000000005',
    name: 'GARCIA',
    position: 'Ala',
  },
  {
    id: 'd10b7c3e-129a-4d1f-8a01-000000000015',
    name: 'JUAN',
    position: 'Fixo',
  },
  {
    id: 'd10b7c3e-129a-4d1f-8a01-000000000016',
    name: 'LEDUAN',
    position: 'Fixo',
  },
  {
    id: 'd10b7c3e-129a-4d1f-8a01-000000000011',
    name: 'LEO ELIAS',
    position: 'Pivo',
  },
  {
    id: 'd10b7c3e-129a-4d1f-8a01-000000000009',
    name: 'LORENZO',
    position: 'Ala',
  },
  {
    id: 'd10b7c3e-129a-4d1f-8a01-000000000012',
    name: 'LUCAS LEMOS',
    position: 'Pivo',
  },
  {
    id: 'd10b7c3e-129a-4d1f-8a01-000000000001',
    name: 'MATEUS',
    position: 'Fixo',
  },
  {
    id: 'd10b7c3e-129a-4d1f-8a01-000000000010',
    name: 'NICO',
    position: 'Pivo',
  },
  { id: 'd10b7c3e-129a-4d1f-8a01-000000000007', name: 'PEPO', position: 'Ala' },
  { id: 'd10b7c3e-129a-4d1f-8a01-000000000003', name: 'PET', position: 'Fixo' },
  {
    id: 'd10b7c3e-129a-4d1f-8a01-000000000008',
    name: 'SENNA',
    position: 'Ala',
  },
];

const SESSIONS: SeedSession[] = [
  {
    id: 'a91e1d48-76c2-4d57-8f04-29ed25c8b001',
    description: 'Russo Preto',
    date: '2026-08-01',
    players: {
      MATEUS: {
        seconds: 1484,
        actions: {
          'Gol GL': 1,
          'GS OO': 2,
          'GS BP': 1,
          CC: 8,
          PP: 6,
          FD: 5,
          RB: 2,
          DIA: 6,
        },
      },
      DUPIN: { seconds: 62, actions: { PP: 1 } },
      PET: {
        seconds: 1090,
        actions: {
          'GS TO': 1,
          'GS OO': 2,
          'GS BP': 1,
          CC: 12,
          PP: 2,
          FD: 7,
          DIA: 7,
        },
      },
      BRESOLIN: { seconds: 32, actions: { FD: 1, DIA: 2 } },
      GARCIA: {
        seconds: 1015,
        actions: { 'Gol GL': 1, 'GS OO': 2, CC: 9, PP: 3, FD: 3, DIA: 6 },
      },
      EVERTON: {
        seconds: 1561,
        actions: {
          'Gol GL': 1,
          'GS OO': 2,
          'GS BP': 1,
          ASS: 1,
          CC: 24,
          PP: 8,
          FD: 4,
          RB: 2,
          DIA: 2,
        },
      },
      PEPO: {
        seconds: 704,
        actions: { 'Gol TO': 1, 'GS TO': 1, CC: 4, PP: 4, FD: 4, DIA: 10 },
      },
      SENNA: {
        seconds: 851,
        actions: {
          'Gol TO': 1,
          'GS TO': 2,
          ASS: 1,
          CC: 10,
          PP: 9,
          FD: 2,
          RB: 1,
          DIA: 5,
        },
      },
      LORENZO: {
        seconds: 606,
        actions: { 'Gol TO': 1, 'GS TO': 1, GM: 1, CC: 4, RB: 1, DIA: 4 },
      },
      NICO: { seconds: 422, actions: { 'GS TO': 1, PP: 3, FD: 1 } },
      'LEO ELIAS': {
        seconds: 1183,
        actions: {
          'Gol TO': 1,
          'Gol GL': 1,
          'GS TO': 2,
          GM: 1,
          CC: 4,
          PP: 2,
          FD: 3,
          DIA: 4,
        },
      },
      'LUCAS LEMOS': {
        seconds: 991,
        actions: { 'Gol GL': 1, 'GS BP': 1, CC: 7, PP: 3, DIA: 2 },
      },
    },
  },
  {
    id: 'a91e1d48-76c2-4d57-8f04-29ed25c8b002',
    description: 'Passo Fundo',
    date: '2026-08-08',
    players: {
      MATEUS: {
        seconds: 1321,
        actions: {
          'Gol TO': 1,
          'Gol BP': 1,
          AD: 1,
          CC: 19,
          PP: 8,
          FD: 3,
          RB: 1,
          DIA: 16,
        },
      },
      JUAN: {
        seconds: 254,
        actions: { 'Gol BP': 1, 'GS OO': 1, PP: 1, GP: 1, FD: 2, DIA: 2 },
      },
      GARCIA: { seconds: 432, actions: { 'Gol BP': 2, CC: 2, PP: 2, FD: 3 } },
      FERNANDO: {
        seconds: 505,
        actions: {
          'Gol BP': 1,
          'GS OO': 1,
          GM: 1,
          CC: 9,
          PP: 3,
          FD: 1,
          DIA: 2,
        },
      },
      EVERTON: {
        seconds: 2134,
        actions: {
          'Gol BP': 1,
          'GS OO': 2,
          ASS: 1,
          CC: 22,
          PP: 14,
          FD: 6,
          RB: 2,
          DIA: 7,
        },
      },
      PEPO: { seconds: 935, actions: { CC: 7, PP: 7, FD: 5, RB: 1, DIA: 8 } },
      LORENZO: {
        seconds: 435,
        actions: {
          'Gol TO': 1,
          'GS OO': 2,
          ASS: 1,
          CC: 3,
          PP: 3,
          FD: 1,
          RB: 1,
          DIA: 6,
        },
      },
      LEDUAN: {
        seconds: 396,
        actions: { 'Gol TO': 1, 'GS OO': 1, CC: 2, PP: 1, FD: 3, DIA: 1 },
      },
      ARTUR: {
        seconds: 1122,
        actions: { 'GS OO': 1, CC: 10, PP: 8, FD: 4, DIA: 9 },
      },
      NICO: {
        seconds: 781,
        actions: { 'Gol BP': 1, GM: 1, CC: 11, PP: 3, DIA: 3 },
      },
      'LEO ELIAS': {
        seconds: 1072,
        actions: {
          'Gol TO': 1,
          'GS OO': 3,
          GM: 1,
          CC: 10,
          PP: 6,
          GP: 1,
          FD: 7,
          RB: 1,
          DIA: 6,
        },
      },
      'LUCAS LEMOS': {
        seconds: 235,
        actions: { 'Gol BP': 1, 'GS OO': 1, CC: 2, PP: 1, FD: 1, DIA: 1 },
      },
    },
  },
];

const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;

const playerByName = new Map(PLAYERS.map((player) => [player.name, player]));
const playerValues = PLAYERS.map(
  (player) =>
    `(${quote(player.id)}::uuid, ${quote(player.name)}, ${quote(player.position)})`,
).join(',\n');
const sessionValues = SESSIONS.map(
  (session) =>
    `(${quote(session.id)}::uuid, ${quote(session.description)}, ${quote(session.date)}::date)`,
).join(',\n');
const minuteValues = SESSIONS.flatMap((session) =>
  Object.entries(session.players).map(([name, data]) => {
    const player = playerByName.get(name);
    if (!player) throw new Error(`Jogador ausente no cadastro: ${name}`);
    return `(${quote(session.id)}::uuid, ${quote(player.id)}::uuid, ${data.seconds}, NULL)`;
  }),
).join(',\n');

const events = SESSIONS.flatMap((session) => {
  const raw = Object.entries(session.players).flatMap(([name, data]) => {
    const player = playerByName.get(name);
    if (!player) throw new Error(`Jogador ausente no cadastro: ${name}`);
    return Object.entries(data.actions).flatMap(([sigla, quantity]) =>
      Array.from({ length: quantity }, (_, occurrence) => ({
        sessionId: session.id,
        playerId: player.id,
        sigla,
        occurrence: occurrence + 1,
      })),
    );
  });
  return raw.map((event, index) => ({
    ...event,
    timestamp: Math.floor(10 + (2380 * index) / Math.max(1, raw.length - 1)),
  }));
});

const expectedTotals = new Map([
  ['Russo Preto', 240],
  ['Passo Fundo', 289],
]);
for (const session of SESSIONS) {
  const total = events.filter((event) => event.sessionId === session.id).length;
  if (total !== expectedTotals.get(session.description)) {
    throw new Error(`Total inconsistente em ${session.description}: ${total}`);
  }
}

const eventValues = events
  .map(
    (event) =>
      `(${quote(event.sessionId)}::uuid, ${quote(event.playerId)}::uuid, ${quote(event.sigla)}, ${event.occurrence}, ${event.timestamp})`,
  )
  .join(',\n');

export const REAL_GAMES_SEED_SQL = `
DO $$
DECLARE
  seed_type_id smallint;
  seed_location_id smallint;
  seed_court_size_id smallint;
  seed_side_id smallint;
  missing_actions text;
BEGIN
  SELECT id INTO seed_type_id FROM session_types WHERE lower(nome) = lower('Jogo') LIMIT 1;
  SELECT id INTO seed_location_id FROM session_locations WHERE lower(nome) = lower('Casa') LIMIT 1;
  SELECT id INTO seed_court_size_id FROM session_court_sizes WHERE lower(nome) = lower('Grande') LIMIT 1;
  SELECT id INTO seed_side_id FROM lados_preferenciais WHERE lower(nome) = lower('Destro') LIMIT 1;
  IF seed_type_id IS NULL OR seed_location_id IS NULL OR
     seed_court_size_id IS NULL OR seed_side_id IS NULL THEN
    RAISE EXCEPTION 'Configuracoes-base obrigatorias nao encontradas';
  END IF;

  SELECT string_agg(required.sigla, ', ' ORDER BY required.sigla)
  INTO missing_actions
  FROM (SELECT DISTINCT sigla FROM (VALUES ${eventValues})
        AS event(session_id, player_id, sigla, occurrence, timestamp_seconds)) required
  WHERE (SELECT count(*) FROM acoes_catalogo action
         JOIN categorias_acao category ON category.id = action.categoria_acao_id
         WHERE lower(action.sigla) = lower(required.sigla)
           AND category.tipo_analise_id = 1
           AND action.deleted_at IS NULL AND category.deleted_at IS NULL) <> 1;
  IF missing_actions IS NOT NULL THEN
    RAISE EXCEPTION 'Acoes individuais ausentes ou ambiguas no catalogo: %', missing_actions;
  END IF;

  DELETE FROM acoes_taggeadas;
  DELETE FROM player_session_minutes;
  IF to_regclass('public.indices_jogadores') IS NOT NULL THEN
    DELETE FROM indices_jogadores;
  END IF;
  DELETE FROM sessoes;
  DELETE FROM jogadores;
  DELETE FROM equipes;

  INSERT INTO equipes (id, nome) VALUES (${quote(TEAM_ID)}::uuid, 'Equipe Principal');

  INSERT INTO jogadores (
    id, equipe_id, posicao_id, lado_preferencial_id, nome, idade, deleted_at
  )
  SELECT player.id, ${quote(TEAM_ID)}::uuid, position.id, seed_side_id,
         player.name, 18, NULL
  FROM (VALUES ${playerValues}) AS player(id, name, position_name)
  JOIN posicoes position ON lower(position.nome) = lower(player.position_name);

  INSERT INTO sessoes (
    id, equipe_id, session_type_id, session_location_id,
    session_court_size_id, data, descricao, deleted_at
  )
  SELECT session.id, ${quote(TEAM_ID)}::uuid, seed_type_id,
         seed_location_id, seed_court_size_id, session.date, session.description, NULL
  FROM (VALUES ${sessionValues}) AS session(id, description, date);

  INSERT INTO player_session_minutes (
    session_id, player_id, total_seconds, active_since
  ) VALUES ${minuteValues};

  INSERT INTO acoes_taggeadas (
    id, sessao_id, acao_catalogo_id, jogador_id, timestamp_segundos,
    contexto_acao_equipe_id, client_action_id, deleted_at
  )
  SELECT (
    substr(md5(event.session_id::text || ':' || event.player_id::text || ':' || event.sigla || ':' || event.occurrence), 1, 8) || '-' ||
    substr(md5(event.session_id::text || ':' || event.player_id::text || ':' || event.sigla || ':' || event.occurrence), 9, 4) || '-4' ||
    substr(md5(event.session_id::text || ':' || event.player_id::text || ':' || event.sigla || ':' || event.occurrence), 14, 3) || '-8' ||
    substr(md5(event.session_id::text || ':' || event.player_id::text || ':' || event.sigla || ':' || event.occurrence), 18, 3) || '-' ||
    substr(md5(event.session_id::text || ':' || event.player_id::text || ':' || event.sigla || ':' || event.occurrence), 21, 12)
  )::uuid,
  event.session_id, action.id, event.player_id, event.timestamp_seconds,
  NULL, NULL, NULL
  FROM (VALUES ${eventValues})
    AS event(session_id, player_id, sigla, occurrence, timestamp_seconds)
  JOIN acoes_catalogo action ON lower(action.sigla) = lower(event.sigla)
  JOIN categorias_acao category ON category.id = action.categoria_acao_id
    AND category.tipo_analise_id = 1
  WHERE action.deleted_at IS NULL AND category.deleted_at IS NULL;
END $$;
`;
