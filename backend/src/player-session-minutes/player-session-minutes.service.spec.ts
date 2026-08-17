import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  PlayerEntity,
  PlayerSessionMinutesEntity,
  SessionEntity,
} from '../entities';
import { PlayerSessionMinutesService } from './player-session-minutes.service';

const SESSION_ID = 'session-1';
const PLAYER_ID = 'player-1';

describe('PlayerSessionMinutesService', () => {
  afterEach(() => jest.useRealTimers());

  it('creates a missing record and sets manual minutes', async () => {
    const harness = buildHarness();

    const response = await harness.service.update(SESSION_ID, PLAYER_ID, {
      totalSeconds: 2130,
    });

    expect(response.totalSeconds).toBe(2130);
    expect(harness.record?.totalSeconds).toBe(2130);
  });

  it('edits an existing manual record', async () => {
    const harness = buildHarness({ totalSeconds: 60 });

    const response = await harness.service.update(SESSION_ID, PLAYER_ID, {
      totalSeconds: 120,
    });

    expect(response.totalSeconds).toBe(120);
  });

  it('rejects a player from another team', async () => {
    const harness = buildHarness(undefined, { playerTeamId: 'team-2' });

    await expect(harness.service.start(SESSION_ID, PLAYER_ID)).rejects.toThrow(
      BadRequestException,
    );
  });

  it.each([
    ['session', { sessionExists: false }],
    ['player', { playerExists: false }],
  ])('rejects a missing %s', async (_label, options) => {
    const harness = buildHarness(undefined, options);

    await expect(harness.service.start(SESSION_ID, PLAYER_ID)).rejects.toThrow(
      NotFoundException,
    );
  });

  it.each([-1, 1.5])(
    'rejects manual value %p at the service boundary',
    async (value) => {
      const harness = buildHarness();

      await expect(
        harness.service.update(SESSION_ID, PLAYER_ID, { totalSeconds: value }),
      ).rejects.toThrow(BadRequestException);
    },
  );

  it('starts using backend time and rejects a second start', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-17T12:00:00Z'));
    const harness = buildHarness();

    const response = await harness.service.start(SESSION_ID, PLAYER_ID);

    expect(response.activeSince).toEqual(new Date('2026-08-17T12:00:00Z'));
    expect(response.isActive).toBe(true);
    await expect(harness.service.start(SESSION_ID, PLAYER_ID)).rejects.toThrow(
      ConflictException,
    );
  });

  it('stops and accumulates elapsed whole seconds', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-17T12:00:10Z'));
    const harness = buildHarness({
      totalSeconds: 30,
      activeSince: new Date('2026-08-17T12:00:00Z'),
    });

    const response = await harness.service.stop(SESSION_ID, PLAYER_ID);

    expect(response.totalSeconds).toBe(40);
    expect(response.activeSince).toBeNull();
    expect(response.isActive).toBe(false);
  });

  it('rejects stop without start', async () => {
    const harness = buildHarness({ totalSeconds: 30, activeSince: null });

    await expect(harness.service.stop(SESSION_ID, PLAYER_ID)).rejects.toThrow(
      ConflictException,
    );
  });

  it('accumulates multiple start and stop cycles', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-17T12:00:00Z'));
    const harness = buildHarness();
    await harness.service.start(SESSION_ID, PLAYER_ID);
    jest.setSystemTime(new Date('2026-08-17T12:00:15Z'));
    await harness.service.stop(SESSION_ID, PLAYER_ID);
    jest.setSystemTime(new Date('2026-08-17T12:01:00Z'));
    await harness.service.start(SESSION_ID, PLAYER_ID);
    jest.setSystemTime(new Date('2026-08-17T12:01:20Z'));

    const response = await harness.service.stop(SESSION_ID, PLAYER_ID);

    expect(response.totalSeconds).toBe(35);
  });

  it('rejects manual editing while active', async () => {
    const harness = buildHarness({ activeSince: new Date(), totalSeconds: 10 });

    await expect(
      harness.service.update(SESSION_ID, PLAYER_ID, { totalSeconds: 20 }),
    ).rejects.toThrow(ConflictException);
  });

  it('lists team players even when they have no minutes record', async () => {
    const harness = buildHarness();
    harness.playersRepository.find = jest
      .fn()
      .mockResolvedValue([player(), player('player-2', 'Bia')]);
    harness.minutesRepository.find = jest
      .fn()
      .mockResolvedValue([minutesRecord({ totalSeconds: 90 })]);

    const response = await harness.service.findAll(SESSION_ID);

    expect(response).toEqual([
      expect.objectContaining({ playerId: PLAYER_ID, totalSeconds: 90 }),
      expect.objectContaining({
        playerId: 'player-2',
        totalSeconds: 0,
        activeSince: null,
        isActive: false,
      }),
    ]);
  });
});

type HarnessOptions = {
  sessionExists?: boolean;
  playerExists?: boolean;
  playerTeamId?: string;
};

function buildHarness(
  initial?: Partial<PlayerSessionMinutesEntity>,
  options: HarnessOptions = {},
) {
  let currentRecord = initial ? minutesRecord(initial) : undefined;
  const session =
    options.sessionExists === false
      ? null
      : ({ id: SESSION_ID, equipeId: 'team-1' } as SessionEntity);
  const currentPlayer =
    options.playerExists === false
      ? null
      : player(PLAYER_ID, 'Ana', options.playerTeamId ?? 'team-1');
  const insertExecute = jest.fn().mockImplementation(() => {
    currentRecord ??= minutesRecord();
    return Promise.resolve({});
  });
  const queryBuilder = {
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    orIgnore: jest.fn().mockReturnThis(),
    execute: insertExecute,
  };
  const manager = {
    transaction: jest.fn((callback) => callback(manager)),
    findOneBy: jest.fn().mockResolvedValue(session),
    findOne: jest
      .fn()
      .mockImplementation((entity) =>
        Promise.resolve(
          entity === PlayerEntity ? currentPlayer : (currentRecord ?? null),
        ),
      ),
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    save: jest.fn().mockImplementation((record) => {
      currentRecord = record;
      return Promise.resolve(record);
    }),
  };
  const minutesRepository = {
    manager,
    find: jest.fn().mockResolvedValue([]),
  } as unknown as Repository<PlayerSessionMinutesEntity>;
  const sessionsRepository = {
    findOneBy: jest.fn().mockResolvedValue(session),
  } as unknown as Repository<SessionEntity>;
  const playersRepository = {
    find: jest.fn().mockResolvedValue([]),
  } as unknown as Repository<PlayerEntity>;
  const service = new PlayerSessionMinutesService(
    minutesRepository,
    sessionsRepository,
    playersRepository,
  );

  return {
    service,
    minutesRepository,
    sessionsRepository,
    playersRepository,
    get record() {
      return currentRecord;
    },
  };
}

function player(id = PLAYER_ID, nome = 'Ana', equipeId = 'team-1') {
  return {
    id,
    nome,
    equipeId,
    posicao: { id: 1, nome: 'Fixo' },
  } as PlayerEntity;
}

function minutesRecord(
  overrides: Partial<PlayerSessionMinutesEntity> = {},
): PlayerSessionMinutesEntity {
  return {
    id: 'minutes-1',
    sessionId: SESSION_ID,
    playerId: PLAYER_ID,
    totalSeconds: 0,
    activeSince: null,
    ...overrides,
  } as PlayerSessionMinutesEntity;
}
