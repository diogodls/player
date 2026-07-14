import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { SessionEntity, TaggedActionEntity, TeamEntity } from '../entities';
import { SessionDto } from './dto/session.dto';
import { SessionsService } from './sessions.service';

const SESSION_ID = '79fbbbe8-39b1-4b25-bd11-236a0f228cb0';
const OTHER_SESSION_ID = '9828b90e-6aa0-4d75-985d-f286802c3086';
const TEAM_ID = 'd62ec1e1-f762-45bd-a1e9-09ba8ef8d461';

const buildSessionDto = (id: string | null): SessionDto => ({
  id,
  typeId: 1,
  locationId: 1,
  courtSizeId: 2,
  date: '2026-02-15',
  description: 'Finalizacao e 1x1',
});

function buildSession(): SessionEntity {
  return {
    id: SESSION_ID,
    equipeId: TEAM_ID,
    sessionTypeId: 1,
    sessionLocationId: 1,
    sessionCourtSizeId: 2,
    data: new Date('2026-02-15T00:00:00.000Z'),
    descricao: 'Finalizacao e 1x1',
    equipe: { id: TEAM_ID, nome: 'Equipe Principal' },
    sessionType: { id: 1, nome: 'Treino' },
    sessionLocation: { id: 1, nome: 'Casa' },
    sessionCourtSize: { id: 2, nome: 'Grande' },
  } as SessionEntity;
}

function buildTaggedAction({
  id,
  playerId,
  playerName,
  title,
  categoryName,
  acronym,
  impactId,
  seconds,
}: {
  id: string;
  playerId?: string;
  playerName?: string;
  title: string;
  categoryName: string;
  acronym: string;
  impactId: number;
  seconds: number;
}): TaggedActionEntity {
  return {
    id,
    sessaoId: SESSION_ID,
    acaoCatalogoId: `catalog-${id}`,
    jogadorId: playerId ?? null,
    timestampSegundos: seconds,
    acaoCatalogo: {
      id: `catalog-${id}`,
      nome: title,
      sigla: acronym,
      impactoId: impactId,
      categoriaAcao: {
        id: `category-${id}`,
        nome: categoryName,
      },
    },
    jogador: playerId
      ? {
          id: playerId,
          nome: playerName,
        }
      : null,
  } as TaggedActionEntity;
}

describe('SessionsService id validation', () => {
  const service = new SessionsService(
    {} as Repository<SessionEntity>,
    {} as Repository<TeamEntity>,
    {} as Repository<TaggedActionEntity>,
  );

  it('rejects a non-null id when creating a session', async () => {
    await expect(service.create(buildSessionDto(SESSION_ID))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects an update when body and route ids differ', async () => {
    await expect(
      service.update(SESSION_ID, buildSessionDto(OTHER_SESSION_ID)),
    ).rejects.toThrow(BadRequestException);
  });

  it('assigns the only available team when creating a session', async () => {
    const session = buildSession();
    const createSession = jest.fn((data: Partial<SessionEntity>) => data);
    const findTeam = jest.fn().mockResolvedValue([session.equipe]);
    const sessionsRepository = {
      create: createSession,
      save: jest.fn().mockResolvedValue(session),
      findOne: jest.fn().mockResolvedValue(session),
    } as unknown as Repository<SessionEntity>;
    const teamsRepository = {
      find: findTeam,
    } as unknown as Repository<TeamEntity>;
    const sessionsService = new SessionsService(
      sessionsRepository,
      teamsRepository,
      {} as Repository<TaggedActionEntity>,
    );

    await sessionsService.create(buildSessionDto(null));

    expect(findTeam).toHaveBeenCalledWith({ take: 1 });
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({ equipeId: TEAM_ID }),
    );
  });

  it('filters and paginates sessions when listing sessions', async () => {
    let receivedFindOptions: Parameters<Repository<SessionEntity>['find']>[0];
    const countSessions = jest.fn().mockResolvedValue(12);
    const findSessions = jest.fn(
      (findOptions: Parameters<Repository<SessionEntity>['find']>[0]) => {
        receivedFindOptions = findOptions;
        return Promise.resolve([]);
      },
    );
    const sessionsRepository = {
      count: countSessions,
      find: findSessions,
    } as unknown as Repository<SessionEntity>;
    const sessionsService = new SessionsService(
      sessionsRepository,
      {} as Repository<TeamEntity>,
      {} as Repository<TaggedActionEntity>,
    );

    const response = await sessionsService.findAll({
      typeId: 1,
      locationId: 2,
      date: '2026-02-15',
      page: 2,
      limit: 5,
    });

    expect(countSessions).toHaveBeenCalledTimes(1);
    expect(findSessions).toHaveBeenCalledTimes(1);
    const where = receivedFindOptions?.where as FindOptionsWhere<SessionEntity>;
    expect(where.sessionTypeId).toBe(1);
    expect(where.sessionLocationId).toBe(2);
    expect(where.data).toBeDefined();
    expect(receivedFindOptions?.skip).toBe(5);
    expect(receivedFindOptions?.take).toBe(5);
    expect(response).toEqual({
      data: [],
      total: 12,
      page: 2,
      limit: 5,
      totalPages: 3,
    });
  });

  it('uses the last available page when the requested page is too high', async () => {
    let receivedFindOptions: Parameters<Repository<SessionEntity>['find']>[0];
    const sessionsRepository = {
      count: jest.fn().mockResolvedValue(6),
      find: jest.fn(
        (findOptions: Parameters<Repository<SessionEntity>['find']>[0]) => {
          receivedFindOptions = findOptions;
          return Promise.resolve([]);
        },
      ),
    } as unknown as Repository<SessionEntity>;
    const sessionsService = new SessionsService(
      sessionsRepository,
      {} as Repository<TeamEntity>,
      {} as Repository<TaggedActionEntity>,
    );

    const response = await sessionsService.findAll({ page: 4, limit: 5 });

    expect(receivedFindOptions?.skip).toBe(5);
    expect(response.page).toBe(2);
    expect(response.totalPages).toBe(2);
  });

  it('throws not found when building the session view for a missing session', async () => {
    const sessionsRepository = {
      findOne: jest.fn().mockResolvedValue(null),
    } as unknown as Repository<SessionEntity>;
    const sessionsService = new SessionsService(
      sessionsRepository,
      {} as Repository<TeamEntity>,
      {} as Repository<TaggedActionEntity>,
    );

    await expect(sessionsService.findView(SESSION_ID)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns a session view with empty analyses when there are no actions', async () => {
    const session = buildSession();
    const sessionsRepository = {
      findOne: jest.fn().mockResolvedValue(session),
    } as unknown as Repository<SessionEntity>;
    const findTaggedActions = jest.fn().mockResolvedValue([]);
    const taggedActionsRepository = {
      find: findTaggedActions,
    } as unknown as Repository<TaggedActionEntity>;
    const sessionsService = new SessionsService(
      sessionsRepository,
      {} as Repository<TeamEntity>,
      taggedActionsRepository,
    );

    const response = await sessionsService.findView(SESSION_ID);

    expect(findTaggedActions).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sessaoId: SESSION_ID },
      }),
    );
    expect(response.analysis.individual).toEqual({
      summary: {
        positives: 0,
        negatives: 0,
        positivePercentage: 0,
        negativePercentage: 0,
      },
      entities: [],
    });
    expect(response.analysis.team).toEqual({
      summary: {
        positives: 0,
        negatives: 0,
        positivePercentage: 0,
        negativePercentage: 0,
      },
      entities: [],
    });
  });

  it('groups actions by player and consolidates team actions in the session view', async () => {
    const session = buildSession();
    const actions = [
      buildTaggedAction({
        id: 'action-1',
        playerId: 'player-1',
        playerName: 'Ana',
        title: 'Roubada de bola',
        categoryName: 'Acoes defensivas',
        acronym: 'RB',
        impactId: 1,
        seconds: 24,
      }),
      buildTaggedAction({
        id: 'action-2',
        playerId: 'player-1',
        playerName: 'Ana',
        title: 'Falha defensiva',
        categoryName: 'Acoes defensivas',
        acronym: 'FD',
        impactId: 2,
        seconds: 63,
      }),
      buildTaggedAction({
        id: 'action-3',
        playerId: 'player-2',
        playerName: 'Bia',
        title: 'Assistencia',
        categoryName: 'Acoes ofensivas',
        acronym: 'ASS',
        impactId: 1,
        seconds: 125,
      }),
      buildTaggedAction({
        id: 'action-4',
        title: 'Bola parada sem execucao',
        categoryName: 'Acoes ofensivas',
        acronym: 'BPSE',
        impactId: 2,
        seconds: 3661,
      }),
    ];
    const sessionsRepository = {
      findOne: jest.fn().mockResolvedValue(session),
    } as unknown as Repository<SessionEntity>;
    const taggedActionsRepository = {
      find: jest.fn().mockResolvedValue(actions),
    } as unknown as Repository<TaggedActionEntity>;
    const sessionsService = new SessionsService(
      sessionsRepository,
      {} as Repository<TeamEntity>,
      taggedActionsRepository,
    );

    const response = await sessionsService.findView(SESSION_ID);

    expect(response.analysis.individual.summary).toEqual({
      positives: 2,
      negatives: 1,
      positivePercentage: 67,
      negativePercentage: 33,
    });
    expect(response.analysis.individual.entities).toHaveLength(2);
    expect(response.analysis.individual.entities[0]).toEqual(
      expect.objectContaining({
        id: 'player-1',
        type: 'player',
        title: 'Ana',
        stats: {
          positive: 1,
          negative: 1,
          total: 2,
        },
        metrics: {
          overall: 2,
          offensive: 0,
          defensive: 2,
          performance: 50,
        },
      }),
    );
    expect(response.analysis.individual.entities[0].actions[0]).toEqual({
      id: 'action-1',
      title: 'Roubada de bola',
      category: {
        code: 'RB',
        label: 'RB',
      },
      time: '00:24',
      outcome: 'positive',
    });
    expect(response.analysis.team.summary).toEqual({
      positives: 2,
      negatives: 2,
      positivePercentage: 50,
      negativePercentage: 50,
    });
    expect(response.analysis.team.entities).toHaveLength(1);
    expect(response.analysis.team.entities[0]).toEqual(
      expect.objectContaining({
        id: 'team',
        type: 'team',
        title: 'Equipe',
        stats: {
          positive: 2,
          negative: 2,
          total: 4,
        },
        metrics: {
          overall: 4,
          offensive: 2,
          defensive: 2,
          performance: 50,
        },
      }),
    );
    expect(response.analysis.team.entities[0].actions[3].time).toBe('61:01');
  });
});
