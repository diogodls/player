import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  PlayerEntity,
  SessionEntity,
  TaggedActionEntity,
  TeamEntity,
} from '../entities';
import { PlayersService } from '../players/players.service';
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
  categoryKey,
  acronym,
  impactId,
  seconds,
}: {
  id: string;
  playerId?: string;
  playerName?: string;
  title: string;
  categoryName: string;
  categoryKey?: string;
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
        chave: categoryKey ?? null,
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
    const findMock = jest.fn().mockResolvedValue(actions);
    const taggedActionsRepository = {
      find: findMock,
    } as unknown as Repository<TaggedActionEntity>;
    const sessionsService = new SessionsService(
      sessionsRepository,
      {} as Repository<TeamEntity>,
      taggedActionsRepository,
    );

    const response = await sessionsService.findView(SESSION_ID);

    expect(findMock).toHaveBeenCalledTimes(1);
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
      positives: 0,
      negatives: 1,
      positivePercentage: 0,
      negativePercentage: 100,
    });
    expect(response.analysis.team.entities).toHaveLength(1);
    expect(response.analysis.team.entities[0]).toEqual(
      expect.objectContaining({
        id: 'team',
        type: 'team',
        title: 'Equipe',
        stats: {
          positive: 0,
          negative: 1,
          total: 1,
        },
        metrics: {
          overall: 1,
          offensive: 1,
          defensive: 0,
          performance: 0,
        },
      }),
    );
    expect(response.analysis.team.entities[0].actions[0].time).toBe('61:01');
    expect(response.filters.individual).toEqual({
      athletes: [
        { value: 'player-1', label: 'Ana' },
        { value: 'player-2', label: 'Bia' },
      ],
      categories: [
        { value: 'RB', label: 'RB' },
        { value: 'FD', label: 'FD' },
        { value: 'ASS', label: 'ASS' },
      ],
    });
    expect(response.filters.team).toEqual({
      athletes: [],
      categories: [{ value: 'BPSE', label: 'BPSE' }],
    });
  });

  it('filters session view actions by outcome, player, category and phase', async () => {
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
        categoryKey: 'OFFENSIVE_ACTIONS',
        acronym: 'ASS',
        impactId: 1,
        seconds: 125,
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

    const response = await sessionsService.findView(SESSION_ID, {
      outcome: 'positive',
      playerId: 'player-2',
      categoryCode: 'ASS',
      phaseKey: 'OFFENSIVE_ACTIONS',
    });

    expect(response.analysis.individual.summary).toEqual({
      positives: 1,
      negatives: 0,
      positivePercentage: 100,
      negativePercentage: 0,
    });
    expect(response.analysis.individual.entities).toHaveLength(1);
    expect(response.analysis.individual.entities[0].id).toBe('player-2');
    expect(response.analysis.individual.entities[0].actions).toHaveLength(1);
    expect(response.analysis.individual.entities[0].actions[0].id).toBe(
      'action-3',
    );
    expect(response.analysis.team.entities).toEqual([]);
    expect(response.analysis.team.summary).toEqual({
      positives: 0,
      negatives: 0,
      positivePercentage: 0,
      negativePercentage: 0,
    });
    expect(response.filters.individual.athletes).toEqual([
      { value: 'player-1', label: 'Ana' },
      { value: 'player-2', label: 'Bia' },
    ]);
  });

  it('filters team actions by catalog phase', async () => {
    const session = buildSession();
    const actions = [
      buildTaggedAction({
        id: 'action-1',
        title: 'Gol de ataque posicional',
        categoryName: 'Organizacao ofensiva',
        categoryKey: 'OFFENSIVE_ORGANIZATION',
        acronym: 'GAP',
        impactId: 1,
        seconds: 24,
      }),
      buildTaggedAction({
        id: 'action-2',
        title: 'Gol em transicao ofensiva',
        categoryName: 'Transicao ofensiva',
        categoryKey: 'OFFENSIVE_TRANSITION',
        acronym: 'GT',
        impactId: 1,
        seconds: 63,
      }),
      buildTaggedAction({
        id: 'action-3',
        playerId: 'player-1',
        playerName: 'Ana',
        title: 'Roubada de bola',
        categoryName: 'Acoes defensivas',
        categoryKey: 'DEFENSIVE_ACTIONS',
        acronym: 'RB',
        impactId: 1,
        seconds: 80,
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

    const response = await sessionsService.findView(SESSION_ID, {
      phaseKey: 'OFFENSIVE_TRANSITION',
    });

    expect(response.analysis.team.entities).toHaveLength(1);
    expect(response.analysis.team.entities[0].actions).toHaveLength(1);
    expect(response.analysis.team.entities[0].actions[0].id).toBe('action-2');
    expect(response.analysis.individual.entities[0].actions[0].id).toBe(
      'action-3',
    );
  });
});

describe('SessionsService session rankings', () => {
  const player = (id: string, name: string, deletedAt: Date | null = null) =>
    ({
      id,
      nome: name,
      deletedAt,
      posicao: { id: 3, nome: 'Ala' },
    }) as PlayerEntity;
  const action = (id: string, jogador: PlayerEntity | null) =>
    ({
      id,
      sessaoId: SESSION_ID,
      jogadorId: jogador?.id ?? null,
      jogador,
    }) as TaggedActionEntity;
  const setup = (
    actions: TaggedActionEntity[],
    session: SessionEntity | null = buildSession(),
  ) => {
    const findOne = jest.fn().mockResolvedValue(session);
    const find = jest.fn().mockResolvedValue(actions);
    const buildRankingForPlayers = jest.fn((players, indexKey) => {
      if (indexKey === 'invalid') throw new BadRequestException();
      return {
        index: { key: indexKey, name: 'Ranking', sortDirection: 'DESC' },
        ranking: players,
      };
    });
    return {
      find,
      buildRankingForPlayers,
      service: new SessionsService(
        { findOne } as unknown as Repository<SessionEntity>,
        {} as Repository<TeamEntity>,
        { find } as unknown as Repository<TaggedActionEntity>,
        { buildRankingForPlayers } as unknown as PlayersService,
      ),
    };
  };

  it('rejects a missing session before loading actions', async () => {
    const { service, find } = setup([], null);
    await expect(service.findRanking(SESSION_ID, 'radj')).rejects.toThrow(
      NotFoundException,
    );
    expect(find).not.toHaveBeenCalled();
  });

  it('delegates invalid index validation to the centralized players ranking rules', async () => {
    const { service } = setup([]);
    await expect(service.findRanking(SESSION_ID, 'invalid')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns an empty ranking group when there are no individual actions', async () => {
    const { service, buildRankingForPlayers } = setup([action('team', null)]);
    await service.findRanking(SESSION_ID, 'radj');
    expect(buildRankingForPlayers).toHaveBeenCalledWith([], 'radj', SESSION_ID);
  });

  it('ignores team actions, inactive players and duplicate individual actions', async () => {
    const ana = player('ana', 'Ana');
    const removed = player('removed', 'Removida', new Date());
    const { service, buildRankingForPlayers, find } = setup([
      action('team', null),
      action('ana-1', ana),
      action('ana-2', ana),
      action('removed', removed),
    ]);
    await service.findRanking(SESSION_ID, 'gtj');
    expect(find).toHaveBeenCalledWith({
      where: { sessaoId: SESSION_ID },
      relations: { jogador: { posicao: true } },
    });
    expect(buildRankingForPlayers).toHaveBeenCalledWith(
      [ana],
      'gtj',
      SESSION_ID,
    );
  });
});
