import { BadRequestException } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { SessionEntity, TeamEntity } from '../entities';
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

describe('SessionsService id validation', () => {
  const service = new SessionsService(
    {} as Repository<SessionEntity>,
    {} as Repository<TeamEntity>,
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
    );

    await sessionsService.create(buildSessionDto(null));

    expect(findTeam).toHaveBeenCalledWith({ take: 1 });
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({ equipeId: TEAM_ID }),
    );
  });

  it('filters and paginates sessions when listing sessions', async () => {
    let receivedFindOptions: Parameters<Repository<SessionEntity>['find']>[0];
    const countSessions = jest
      .fn<Repository<SessionEntity>['count']>()
      .mockResolvedValue(12);
    const findSessions = jest
      .fn<Repository<SessionEntity>['find']>()
      .mockImplementation(
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
      count: jest.fn<Repository<SessionEntity>['count']>().mockResolvedValue(6),
      find: jest
        .fn<Repository<SessionEntity>['find']>()
        .mockImplementation(
          (findOptions: Parameters<Repository<SessionEntity>['find']>[0]) => {
            receivedFindOptions = findOptions;
            return Promise.resolve([]);
          },
        ),
    } as unknown as Repository<SessionEntity>;
    const sessionsService = new SessionsService(
      sessionsRepository,
      {} as Repository<TeamEntity>,
    );

    const response = await sessionsService.findAll({ page: 4, limit: 5 });

    expect(receivedFindOptions?.skip).toBe(5);
    expect(response.page).toBe(2);
    expect(response.totalPages).toBe(2);
  });
});
