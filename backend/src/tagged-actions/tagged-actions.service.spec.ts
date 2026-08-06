import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  CatalogActionEntity,
  PlayerEntity,
  SessionEntity,
  TaggedActionEntity,
} from '../entities';
import { CreateSessionActionsDto } from './dto/create-session-actions.dto';
import { TaggedActionsService } from './tagged-actions.service';

const SESSION_ID = '00000000-0000-0000-0000-000000000101';
const TEAM_ID = '00000000-0000-0000-0000-000000000001';
const PLAYER_ID = '00000000-0000-0000-0000-000000000201';
const INDIVIDUAL_ACTION_ID = '00000000-0000-0000-0000-000000000411';
const TEAM_ACTION_ID = '00000000-0000-0000-0000-000000000420';
const NEW_TEAM_ACTION_ID = '00000000-0000-0000-0000-000000000601';

describe('TaggedActionsService', () => {
  it('validates and saves the complete batch in one transaction', async () => {
    const { service, transaction, execute, orIgnore } = buildService();

    const result = await service.createForSession(SESSION_ID, {
      actions: [
        action(INDIVIDUAL_ACTION_ID, PLAYER_ID, 12),
        action(TEAM_ACTION_ID, null, 34),
      ],
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(orIgnore).toHaveBeenCalledTimes(1);
    expect(result.actions).toHaveLength(2);
  });

  it('rejects a missing session before saving', async () => {
    const setup = buildService({ session: null });

    await expect(
      setup.service.createForSession(SESSION_ID, dto()),
    ).rejects.toThrow(NotFoundException);
    expect(setup.execute).not.toHaveBeenCalled();
  });

  it('rejects catalog actions that do not exist', async () => {
    const setup = buildService({ catalogActions: [] });

    await expect(
      setup.service.createForSession(SESSION_ID, dto()),
    ).rejects.toThrow('Uma ou mais ações do catálogo não foram encontradas');
    expect(setup.execute).not.toHaveBeenCalled();
  });

  it('rejects players that do not exist or belong to another team', async () => {
    const missingPlayer = buildService({
      catalogActions: [individualCatalogAction()],
      players: [],
    });
    await expect(
      missingPlayer.service.createForSession(SESSION_ID, dto()),
    ).rejects.toThrow('Um ou mais jogadores não foram encontrados');

    const otherTeam = buildService({
      catalogActions: [individualCatalogAction()],
      players: [{ id: PLAYER_ID, equipeId: 'other-team' } as PlayerEntity],
    });
    await expect(
      otherTeam.service.createForSession(SESSION_ID, dto()),
    ).rejects.toThrow('Jogador deve pertencer à mesma equipe da sessão');
  });

  it('requires a player only for individual actions', async () => {
    const individualWithoutPlayer = buildService({
      catalogActions: [individualCatalogAction()],
    });
    await expect(
      individualWithoutPlayer.service.createForSession(SESSION_ID, {
        actions: [action(INDIVIDUAL_ACTION_ID, null, 12)],
      }),
    ).rejects.toThrow('Ação individual deve possuir um jogador');

    const teamWithPlayer = buildService({
      catalogActions: [teamCatalogAction()],
    });
    await expect(
      teamWithPlayer.service.createForSession(SESSION_ID, {
        actions: [action(TEAM_ACTION_ID, PLAYER_ID, 12)],
      }),
    ).rejects.toThrow('Ação de equipe não deve possuir um jogador');
  });

  it('saves a new team action without a player', async () => {
    const setup = buildService({
      catalogActions: [teamCatalogAction(NEW_TEAM_ACTION_ID)],
    });
    await setup.service.createForSession(SESSION_ID, {
      actions: [action(NEW_TEAM_ACTION_ID, null, 45)],
    });
    expect(setup.execute).toHaveBeenCalledTimes(1);
  });

  it('rejects a new team action with a player', async () => {
    const setup = buildService({
      catalogActions: [teamCatalogAction(NEW_TEAM_ACTION_ID)],
    });
    await expect(
      setup.service.createForSession(SESSION_ID, {
        actions: [action(NEW_TEAM_ACTION_ID, PLAYER_ID, 45)],
      }),
    ).rejects.toThrow('Ação de equipe não deve possuir um jogador');
    expect(setup.execute).not.toHaveBeenCalled();
  });

  it('returns the existing actions when the same idempotent batch is resent', async () => {
    const setup = buildService({
      catalogActions: [individualCatalogAction()],
    });

    const first = await setup.service.createForSession(SESSION_ID, dto());
    const retry = await setup.service.createForSession(SESSION_ID, dto());

    expect(first).toEqual(retry);
    expect(retry.actions).toHaveLength(1);
    expect(setup.persistedActions).toHaveLength(1);
  });

  it('rejects duplicate client action ids inside one batch', async () => {
    const setup = buildService();
    const duplicate = action(INDIVIDUAL_ACTION_ID, PLAYER_ID, 12);

    await expect(
      setup.service.createForSession(SESSION_ID, {
        actions: [duplicate, { ...duplicate }],
      }),
    ).rejects.toThrow('não podem se repetir no mesmo lote');
    expect(setup.execute).not.toHaveBeenCalled();
  });
});

function dto(): CreateSessionActionsDto {
  return { actions: [action(INDIVIDUAL_ACTION_ID, PLAYER_ID, 12)] };
}

function action(
  catalogActionId: string,
  playerId: string | null,
  timestampSeconds: number,
) {
  return {
    clientActionId: `client-${timestampSeconds}-${catalogActionId.slice(-4)}`,
    catalogActionId,
    playerId,
    timestampSeconds,
  };
}

function individualCatalogAction(): CatalogActionEntity {
  return {
    id: INDIVIDUAL_ACTION_ID,
    categoriaAcao: { tipoAnaliseId: 1 },
  } as CatalogActionEntity;
}

function teamCatalogAction(id = TEAM_ACTION_ID): CatalogActionEntity {
  return {
    id,
    categoriaAcao: { tipoAnaliseId: 2 },
  } as CatalogActionEntity;
}

function buildService(overrides?: {
  session?: SessionEntity | null;
  catalogActions?: CatalogActionEntity[];
  players?: PlayerEntity[];
}) {
  const session =
    overrides && 'session' in overrides
      ? overrides.session
      : ({ id: SESSION_ID, equipeId: TEAM_ID } as SessionEntity);
  const catalogActions = overrides?.catalogActions ?? [
    individualCatalogAction(),
    teamCatalogAction(),
  ];
  const players = overrides?.players ?? [
    { id: PLAYER_ID, equipeId: TEAM_ID } as PlayerEntity,
  ];
  const persistedActions: TaggedActionEntity[] = [];
  let valuesToInsert: TaggedActionEntity[] = [];
  const execute = jest.fn(async () => {
    for (const entity of valuesToInsert) {
      if (
        persistedActions.some(
          (persisted) =>
            persisted.sessaoId === entity.sessaoId &&
            persisted.clientActionId === entity.clientActionId,
        )
      )
        continue;
      persistedActions.push({
        ...entity,
        id: `saved-${persistedActions.length}`,
      });
    }
    return {};
  });
  const orIgnore = jest.fn().mockReturnThis();
  const queryBuilder = {
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn((entities: TaggedActionEntity[]) => {
      valuesToInsert = entities;
      return queryBuilder;
    }),
    orIgnore,
    execute,
  };
  const taggedRepository = {
    create: jest.fn((entity: TaggedActionEntity) => entity),
    createQueryBuilder: jest.fn(() => queryBuilder),
    find: jest.fn(async () => persistedActions),
  };
  const manager = {
    getRepository: jest.fn((entity) => {
      if (entity === SessionEntity)
        return { findOneBy: jest.fn().mockResolvedValue(session) };
      if (entity === CatalogActionEntity)
        return { find: jest.fn().mockResolvedValue(catalogActions) };
      if (entity === PlayerEntity)
        return { findBy: jest.fn().mockResolvedValue(players) };
      return taggedRepository;
    }),
  };
  const transaction = jest.fn(
    (callback: (transactionManager: typeof manager) => Promise<unknown>) =>
      callback(manager),
  );
  const repository = {
    manager: { transaction },
  } as unknown as Repository<TaggedActionEntity>;

  return {
    service: new TaggedActionsService(repository),
    transaction,
    execute,
    orIgnore,
    persistedActions,
  };
}
