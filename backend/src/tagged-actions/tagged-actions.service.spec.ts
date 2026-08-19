import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  CatalogActionEntity,
  PlayerEntity,
  SessionEntity,
  TaggedActionEntity,
  TeamActionContextEntity,
} from '../entities';
import { CreateSessionActionsDto } from './dto/create-session-actions.dto';
import { TaggedActionsService } from './tagged-actions.service';

const SESSION_ID = '00000000-0000-0000-0000-000000000101';
const TEAM_ID = '00000000-0000-0000-0000-000000000001';
const PLAYER_ID = '00000000-0000-0000-0000-000000000201';
const INDIVIDUAL_ACTION_ID = '00000000-0000-0000-0000-000000000411';
const TEAM_ACTION_ID = '00000000-0000-0000-0000-000000000420';
const NEW_TEAM_ACTION_ID = '00000000-0000-0000-0000-000000000601';
const V2_TEAM_ACTION_ID = '00000000-0000-0000-0000-000000000716';
const V2_TEAM_ACTION_2_ID = '00000000-0000-0000-0000-000000000717';
const ATTACK_CATEGORY_ID = '00000000-0000-0000-0000-000000000702';
const DEFENSE_CATEGORY_ID = '00000000-0000-0000-0000-000000000703';
const ATTACK_CONTEXT_ID = '00000000-0000-0000-0000-000000000737';
const DEFENSE_CONTEXT_ID = '00000000-0000-0000-0000-000000000742';

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

  it('saves a v2 team action with a context from the same category', async () => {
    const setup = buildService({
      catalogActions: [v2TeamCatalogAction()],
      teamContexts: [teamContext(ATTACK_CONTEXT_ID, ATTACK_CATEGORY_ID)],
    });

    const result = await setup.service.createForSession(SESSION_ID, {
      actions: [action(V2_TEAM_ACTION_ID, null, 45, ATTACK_CONTEXT_ID)],
    });

    expect(setup.persistedActions[0].contextoAcaoEquipeId).toBe(
      ATTACK_CONTEXT_ID,
    );
    expect(result.actions[0].teamContextId).toBe(ATTACK_CONTEXT_ID);
  });

  it('rejects a v2 team action without context', async () => {
    const setup = buildService({ catalogActions: [v2TeamCatalogAction()] });

    await expect(
      setup.service.createForSession(SESSION_ID, {
        actions: [action(V2_TEAM_ACTION_ID, null, 45)],
      }),
    ).rejects.toThrow('deve possuir um contexto');
    expect(setup.execute).not.toHaveBeenCalled();
  });

  it('rejects a team context from another action category', async () => {
    const setup = buildService({
      catalogActions: [v2TeamCatalogAction()],
      teamContexts: [teamContext(DEFENSE_CONTEXT_ID, DEFENSE_CATEGORY_ID)],
    });

    await expect(
      setup.service.createForSession(SESSION_ID, {
        actions: [action(V2_TEAM_ACTION_ID, null, 45, DEFENSE_CONTEXT_ID)],
      }),
    ).rejects.toThrow('mesma categoria da ação');
    expect(setup.execute).not.toHaveBeenCalled();
  });

  it('rejects an individual action with a team context', async () => {
    const setup = buildService({
      catalogActions: [individualCatalogAction()],
      teamContexts: [teamContext(ATTACK_CONTEXT_ID, ATTACK_CATEGORY_ID)],
    });

    await expect(
      setup.service.createForSession(SESSION_ID, {
        actions: [
          action(INDIVIDUAL_ACTION_ID, PLAYER_ID, 45, ATTACK_CONTEXT_ID),
        ],
      }),
    ).rejects.toThrow('individual não deve possuir um contexto');
    expect(setup.execute).not.toHaveBeenCalled();
  });

  it('keeps accepting a legacy team action without context', async () => {
    const setup = buildService({ catalogActions: [teamCatalogAction()] });

    await setup.service.createForSession(SESSION_ID, {
      actions: [action(TEAM_ACTION_ID, null, 45)],
    });

    expect(setup.persistedActions[0].contextoAcaoEquipeId).toBeNull();
  });

  it('loads all contexts from a multi-action batch in one query', async () => {
    const setup = buildService({
      catalogActions: [
        v2TeamCatalogAction(V2_TEAM_ACTION_ID),
        v2TeamCatalogAction(V2_TEAM_ACTION_2_ID),
      ],
      teamContexts: [
        teamContext(ATTACK_CONTEXT_ID, ATTACK_CATEGORY_ID),
        teamContext('00000000-0000-0000-0000-000000000738', ATTACK_CATEGORY_ID),
      ],
    });

    await setup.service.createForSession(SESSION_ID, {
      actions: [
        action(V2_TEAM_ACTION_ID, null, 45, ATTACK_CONTEXT_ID),
        action(
          V2_TEAM_ACTION_2_ID,
          null,
          46,
          '00000000-0000-0000-0000-000000000738',
        ),
      ],
    });

    expect(setup.findTeamContexts).toHaveBeenCalledTimes(1);
    expect(setup.execute).toHaveBeenCalledTimes(1);
  });

  it('does not persist any item when one action in the batch is invalid', async () => {
    const setup = buildService({
      catalogActions: [
        v2TeamCatalogAction(V2_TEAM_ACTION_ID),
        v2TeamCatalogAction(V2_TEAM_ACTION_2_ID),
      ],
      teamContexts: [
        teamContext(ATTACK_CONTEXT_ID, ATTACK_CATEGORY_ID),
        teamContext(DEFENSE_CONTEXT_ID, DEFENSE_CATEGORY_ID),
      ],
    });

    await expect(
      setup.service.createForSession(SESSION_ID, {
        actions: [
          action(V2_TEAM_ACTION_ID, null, 45, ATTACK_CONTEXT_ID),
          action(V2_TEAM_ACTION_2_ID, null, 46, DEFENSE_CONTEXT_ID),
        ],
      }),
    ).rejects.toThrow('mesma categoria da ação');
    expect(setup.execute).not.toHaveBeenCalled();
    expect(setup.persistedActions).toHaveLength(0);
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

  it('does not duplicate a contextual team action when its client id is resent', async () => {
    const setup = buildService({
      catalogActions: [v2TeamCatalogAction()],
      teamContexts: [teamContext(ATTACK_CONTEXT_ID, ATTACK_CATEGORY_ID)],
    });
    const payload = {
      actions: [action(V2_TEAM_ACTION_ID, null, 45, ATTACK_CONTEXT_ID)],
    };

    const first = await setup.service.createForSession(SESSION_ID, payload);
    const retry = await setup.service.createForSession(SESSION_ID, payload);

    expect(retry).toEqual(first);
    expect(setup.persistedActions).toHaveLength(1);
    expect(setup.persistedActions[0].contextoAcaoEquipeId).toBe(
      ATTACK_CONTEXT_ID,
    );
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

describe('TaggedActionsService removal', () => {
  const ACTION_ID = '00000000-0000-0000-0000-000000000901';

  it.each([
    ['individual', PLAYER_ID],
    ['team', null],
  ])('soft deletes a valid %s action', async (_type, jogadorId) => {
    const actionEntity = {
      id: ACTION_ID,
      sessaoId: SESSION_ID,
      jogadorId,
      deletedAt: null,
    } as TaggedActionEntity;
    const setup = buildRemovalService({ action: actionEntity });

    await setup.service.removeFromSession(SESSION_ID, ACTION_ID);

    expect(setup.softRemove).toHaveBeenCalledWith(actionEntity);
    expect(setup.physicalDelete).not.toHaveBeenCalled();
    expect(actionEntity.deletedAt).toBeInstanceOf(Date);
    expect(await setup.findActive()).toEqual([]);
  });

  it('rejects an action from another session without deleting it', async () => {
    const setup = buildRemovalService({ action: null });
    await expect(
      setup.service.removeFromSession(SESSION_ID, ACTION_ID),
    ).rejects.toThrow('Ação registrada não encontrada');
    expect(setup.findOne).toHaveBeenCalledWith({
      where: { id: ACTION_ID, sessaoId: SESSION_ID },
    });
    expect(setup.softRemove).not.toHaveBeenCalled();
  });

  it('returns not found for an unknown action', async () => {
    const setup = buildRemovalService({ action: null });
    await expect(
      setup.service.removeFromSession(SESSION_ID, ACTION_ID),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('validates the session before looking up the action', async () => {
    const setup = buildRemovalService({ session: null });
    await expect(
      setup.service.removeFromSession(SESSION_ID, ACTION_ID),
    ).rejects.toThrow('Sessão não encontrada');
    expect(setup.findOne).not.toHaveBeenCalled();
  });

  it('does not delete an already removed action', async () => {
    const setup = buildRemovalService({ action: null });
    await expect(
      setup.service.removeFromSession(SESSION_ID, ACTION_ID),
    ).rejects.toThrow('Ação registrada não encontrada');
    expect(setup.softRemove).not.toHaveBeenCalled();
  });
});

function dto(): CreateSessionActionsDto {
  return { actions: [action(INDIVIDUAL_ACTION_ID, PLAYER_ID, 12)] };
}

function action(
  catalogActionId: string,
  playerId: string | null,
  timestampSeconds: number,
  teamContextId?: string,
) {
  return {
    clientActionId: `client-${timestampSeconds}-${catalogActionId.slice(-4)}`,
    catalogActionId,
    playerId,
    ...(teamContextId ? { teamContextId } : {}),
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
    categoriaAcaoId: '00000000-0000-0000-0000-000000000305',
    categoriaAcao: { tipoAnaliseId: 2, chave: 'SET_PIECE' },
  } as CatalogActionEntity;
}

function v2TeamCatalogAction(id = V2_TEAM_ACTION_ID): CatalogActionEntity {
  return {
    id,
    categoriaAcaoId: ATTACK_CATEGORY_ID,
    categoriaAcao: { tipoAnaliseId: 2, chave: 'TEAM_V2_ATTACK' },
  } as CatalogActionEntity;
}

function teamContext(
  id: string,
  categoriaAcaoId: string,
): TeamActionContextEntity {
  return { id, categoriaAcaoId, deletedAt: null } as TeamActionContextEntity;
}

type QueryBuilderMock = {
  insert: () => QueryBuilderMock;
  into: () => QueryBuilderMock;
  values: (entities: TaggedActionEntity[]) => QueryBuilderMock;
  orIgnore: () => QueryBuilderMock;
  execute: () => Promise<Record<string, never>>;
};

function buildService(overrides?: {
  session?: SessionEntity | null;
  catalogActions?: CatalogActionEntity[];
  players?: PlayerEntity[];
  teamContexts?: TeamActionContextEntity[];
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
  const teamContexts = overrides?.teamContexts ?? [];
  const findTeamContexts = jest.fn().mockResolvedValue(teamContexts);
  const persistedActions: TaggedActionEntity[] = [];
  let valuesToInsert: TaggedActionEntity[] = [];
  const execute = jest.fn(() => {
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
    return Promise.resolve({});
  });
  const queryBuilder: QueryBuilderMock = {
    insert: jest.fn(() => queryBuilder),
    into: jest.fn(() => queryBuilder),
    values: jest.fn((entities: TaggedActionEntity[]) => {
      valuesToInsert = entities;
      return queryBuilder;
    }),
    orIgnore: jest.fn(() => queryBuilder),
    execute,
  };
  const orIgnore = queryBuilder.orIgnore;
  const taggedRepository = {
    create: jest.fn((entity: TaggedActionEntity) => entity),
    createQueryBuilder: jest.fn(() => queryBuilder),
    find: jest.fn(() => Promise.resolve(persistedActions)),
  };
  const manager = {
    getRepository: jest.fn((entity) => {
      if (entity === SessionEntity)
        return { findOneBy: jest.fn().mockResolvedValue(session) };
      if (entity === CatalogActionEntity)
        return { find: jest.fn().mockResolvedValue(catalogActions) };
      if (entity === PlayerEntity)
        return { findBy: jest.fn().mockResolvedValue(players) };
      if (entity === TeamActionContextEntity) return { find: findTeamContexts };
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
    findTeamContexts,
  };
}

function buildRemovalService(overrides?: {
  session?: SessionEntity | null;
  action?: TaggedActionEntity | null;
}) {
  const session =
    overrides && 'session' in overrides
      ? overrides.session
      : ({ id: SESSION_ID } as SessionEntity);
  const actionEntity =
    overrides && 'action' in overrides
      ? overrides.action
      : ({
          id: '00000000-0000-0000-0000-000000000901',
          sessaoId: SESSION_ID,
          jogadorId: PLAYER_ID,
          deletedAt: null,
        } as TaggedActionEntity);
  const findOne = jest.fn().mockResolvedValue(actionEntity);
  const softRemove = jest.fn(async (action: TaggedActionEntity) => {
    action.deletedAt = new Date();
    return action;
  });
  const physicalDelete = jest.fn();
  const sessionsRepository = {
    findOneBy: jest.fn().mockResolvedValue(session),
  };
  const repository = {
    manager: {
      getRepository: jest.fn().mockReturnValue(sessionsRepository),
    },
    findOne,
    softRemove,
    delete: physicalDelete,
  } as unknown as Repository<TaggedActionEntity>;

  return {
    service: new TaggedActionsService(repository),
    findOne,
    softRemove,
    physicalDelete,
    findActive: async () =>
      actionEntity && actionEntity.deletedAt === null ? [actionEntity] : [],
  };
}
