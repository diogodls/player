import { BadRequestException } from '@nestjs/common';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import {
  PlayerSessionMinutesEntity,
  SessionEntity,
  TaggedActionEntity,
  TeamEntity,
} from '../entities';
import { PlayersService } from '../players/players.service';
import { SessionsService } from './sessions.service';

const TEAM_ID = '00000000-0000-0000-0000-000000000001';
const FIRST_SESSION_ID = '00000000-0000-0000-0000-000000000101';
const SECOND_SESSION_ID = '00000000-0000-0000-0000-000000000102';

function buildSession({
  id,
  date,
  typeId = 1,
}: {
  id: string;
  date: string;
  typeId?: number;
}): SessionEntity {
  return {
    id,
    equipeId: TEAM_ID,
    sessionTypeId: typeId,
    sessionLocationId: 1,
    sessionCourtSizeId: 1,
    data: date,
    descricao: typeId === 2 ? 'Adversario' : 'Treino tecnico',
    sessionType: { id: typeId, nome: typeId === 2 ? 'Jogo' : 'Treino' },
  } as SessionEntity;
}

function buildAction({
  id,
  sessionId,
  playerId,
  playerName,
  category,
  categoryKey,
  acronym,
  impactId,
  timestampSeconds = 10,
}: {
  id: string;
  sessionId: string;
  playerId?: string;
  playerName?: string;
  category: string;
  categoryKey?: string;
  acronym?: string;
  impactId: number;
  timestampSeconds?: number;
}): TaggedActionEntity {
  return {
    id,
    sessaoId: sessionId,
    jogadorId: playerId ?? null,
    timestampSegundos: timestampSeconds,
    acaoCatalogoId: `catalog-${id}`,
    acaoCatalogo: {
      id: `catalog-${id}`,
      categoriaAcaoId: `category-${id}`,
      impactoId: impactId,
      nome: `Acao ${id}`,
      sigla: acronym ?? id,
      categoriaAcao: {
        id: `category-${id}`,
        tipoAnaliseId: 1,
        nome: category,
        chave: categoryKey ?? null,
      },
    },
    jogador: playerId
      ? {
          id: playerId,
          nome: playerName,
          posicao: { id: 1, nome: 'Goleiro' },
        }
      : null,
  } as TaggedActionEntity;
}

function buildService({
  sessions,
  actions,
  minutes = [],
}: {
  sessions: SessionEntity[];
  actions: TaggedActionEntity[];
  minutes?: PlayerSessionMinutesEntity[];
}) {
  const findSessions = jest.fn(
    (options?: FindManyOptions<SessionEntity>): Promise<SessionEntity[]> => {
      void options;
      return Promise.resolve(sessions);
    },
  );
  const findActions = jest.fn().mockResolvedValue(actions);
  const service = new SessionsService(
    { find: findSessions } as unknown as Repository<SessionEntity>,
    {} as Repository<TeamEntity>,
    { find: findActions } as unknown as Repository<TaggedActionEntity>,
    {} as PlayersService,
    {
      find: jest.fn().mockResolvedValue(minutes),
    } as unknown as Repository<PlayerSessionMinutesEntity>,
  );

  return { service, findSessions, findActions };
}

describe('SessionsService comparison', () => {
  it('rejects equal or reversed date ranges', async () => {
    const { service, findSessions } = buildService({
      sessions: [],
      actions: [],
    });

    await expect(
      service.compare({
        startDate: '2026-02-19',
        endDate: '2026-02-19',
      }),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.compare({
        startDate: '2026-02-20',
        endDate: '2026-02-19',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(findSessions).not.toHaveBeenCalled();
  });

  it('queries the inclusive period and optional session type', async () => {
    const { service, findSessions } = buildService({
      sessions: [],
      actions: [],
    });

    await service.compare({
      startDate: '2026-02-15',
      endDate: '2026-02-19',
      typeId: 1,
    });

    const receivedOptions = findSessions.mock.calls[0]?.[0];
    const where = receivedOptions?.where as FindOptionsWhere<SessionEntity>;
    expect(where.data).toBeDefined();
    expect(
      (where.data as unknown as { _value: [string, string] })._value,
    ).toEqual(['2026-02-15', '2026-02-19']);
    expect(where.sessionTypeId).toBe(1);
    expect(receivedOptions?.order).toEqual({
      data: 'ASC',
      createdAt: 'ASC',
      id: 'ASC',
    });
  });

  it('returns an empty response without querying actions', async () => {
    const { service, findActions } = buildService({
      sessions: [],
      actions: [],
    });

    const response = await service.compare({
      startDate: '2026-02-15',
      endDate: '2026-02-19',
    });

    expect(response.sessions).toEqual([]);
    expect(response.athletes).toEqual([]);
    expect(findActions).not.toHaveBeenCalled();
  });

  it('groups real metrics by athlete and keeps missing sessions as gaps', async () => {
    const playerId = '00000000-0000-0000-0000-000000000201';
    const sessions = [
      buildSession({ id: FIRST_SESSION_ID, date: '2026-02-15' }),
      buildSession({
        id: SECOND_SESSION_ID,
        date: '2026-02-19',
        typeId: 2,
      }),
    ];
    const actions = [
      buildAction({
        id: 'positive-offensive',
        sessionId: FIRST_SESSION_ID,
        playerId,
        playerName: 'Ana',
        category: 'Categoria renomeada',
        categoryKey: 'OFFENSIVE_ACTIONS',
        impactId: 1,
      }),
      buildAction({
        id: 'negative-defensive',
        sessionId: FIRST_SESSION_ID,
        playerId,
        playerName: 'Ana',
        category: 'Outra traducao',
        categoryKey: 'DEFENSIVE_ACTIONS',
        impactId: 2,
      }),
      buildAction({
        id: 'entered',
        sessionId: FIRST_SESSION_ID,
        playerId,
        playerName: 'Ana',
        category: 'Minutagem',
        categoryKey: 'PLAYING_TIME',
        acronym: 'ENTROU',
        impactId: 3,
        timestampSeconds: 0,
      }),
      buildAction({
        id: 'left',
        sessionId: FIRST_SESSION_ID,
        playerId,
        playerName: 'Ana',
        category: 'Minutagem',
        categoryKey: 'PLAYING_TIME',
        acronym: 'SAIU',
        impactId: 3,
        timestampSeconds: 1200,
      }),
      buildAction({
        id: 'team-action',
        sessionId: SECOND_SESSION_ID,
        category: 'Acoes ofensivas',
        impactId: 1,
      }),
    ];
    const { service } = buildService({ sessions, actions });

    const response = await service.compare({
      startDate: '2026-02-15',
      endDate: '2026-02-19',
    });

    expect(response.sessions).toEqual([
      expect.objectContaining({
        id: FIRST_SESSION_ID,
        date: '2026-02-15',
        type: 'Treino',
        opponent: null,
      }),
      expect.objectContaining({
        id: SECOND_SESSION_ID,
        date: '2026-02-19',
        type: 'Jogo',
        opponent: 'Adversario',
      }),
    ]);
    expect(response.athletes).toEqual([
      {
        id: playerId,
        name: 'Ana',
        position: 'Goleiro',
        points: [
          {
            sessionId: FIRST_SESSION_ID,
            metrics: {
              positiveActions: 1,
              negativeActions: 1,
              offensiveActions: 1,
              defensiveActions: 1,
              totalActions: 2,
              performancePercentage: 50,
            },
            indexes: {
              radj: 0,
              goalsRelations: 0,
              actionsRelations: 0,
              atd: 0,
              dto: 0,
              pgj: 0,
              ic: 0,
              tio: 0,
              gtj: 0,
              rf: 0,
              tid: 0,
            },
          },
        ],
      },
    ]);
  });

  it('keeps multiple sessions from the same day as separate points', async () => {
    const playerId = '00000000-0000-0000-0000-000000000201';
    const sessions = [
      buildSession({ id: FIRST_SESSION_ID, date: '2026-02-15' }),
      buildSession({ id: SECOND_SESSION_ID, date: '2026-02-15' }),
    ];
    const actions = sessions.map((session, index) =>
      buildAction({
        id: `action-${index}`,
        sessionId: session.id,
        playerId,
        playerName: 'Ana',
        category: 'Acoes ofensivas',
        impactId: 1,
      }),
    );
    const { service } = buildService({ sessions, actions });

    const response = await service.compare({
      startDate: '2026-02-14',
      endDate: '2026-02-16',
    });

    expect(
      response.athletes[0]?.points.map((point) => point.sessionId),
    ).toEqual([FIRST_SESSION_ID, SECOND_SESSION_ID]);
  });

  it('uses official player-session minutes for comparison indexes', async () => {
    const playerId = '00000000-0000-0000-0000-000000000201';
    const sessions = [
      buildSession({ id: FIRST_SESSION_ID, date: '2026-02-15' }),
    ];
    const actions = [
      buildAction({
        id: 'goal',
        sessionId: FIRST_SESSION_ID,
        playerId,
        playerName: 'Ana',
        category: 'Ações ofensivas',
        categoryKey: 'OFFENSIVE_ACTIONS',
        acronym: 'GM',
        impactId: 1,
      }),
    ];
    const minutes = [
      {
        sessionId: FIRST_SESSION_ID,
        playerId,
        totalSeconds: 2400,
        activeSince: null,
      } as PlayerSessionMinutesEntity,
    ];
    const { service } = buildService({ sessions, actions, minutes });

    const response = await service.compare({
      startDate: '2026-02-14',
      endDate: '2026-02-16',
    });

    expect(response.athletes[0]?.points[0]?.indexes.pgj).toBe(0.63);
  });
});
