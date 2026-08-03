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
    const { service, transaction, save } = buildService();

    const result = await service.createForSession(SESSION_ID, {
      actions: [
        action(INDIVIDUAL_ACTION_ID, PLAYER_ID, 12),
        action(TEAM_ACTION_ID, null, 34),
      ],
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith([
      expect.objectContaining({
        sessaoId: SESSION_ID,
        acaoCatalogoId: INDIVIDUAL_ACTION_ID,
        jogadorId: PLAYER_ID,
        timestampSegundos: 12,
      }),
      expect.objectContaining({
        sessaoId: SESSION_ID,
        acaoCatalogoId: TEAM_ACTION_ID,
        jogadorId: null,
        timestampSegundos: 34,
      }),
    ]);
    expect(result.actions).toHaveLength(2);
  });

  it('rejects a missing session before saving', async () => {
    const setup = buildService({ session: null });

    await expect(
      setup.service.createForSession(SESSION_ID, dto()),
    ).rejects.toThrow(NotFoundException);
    expect(setup.save).not.toHaveBeenCalled();
  });

  it('rejects catalog actions that do not exist', async () => {
    const setup = buildService({ catalogActions: [] });

    await expect(
      setup.service.createForSession(SESSION_ID, dto()),
    ).rejects.toThrow('Uma ou mais ações do catálogo não foram encontradas');
    expect(setup.save).not.toHaveBeenCalled();
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
    expect(setup.save).toHaveBeenCalledWith([
      expect.objectContaining({
        acaoCatalogoId: NEW_TEAM_ACTION_ID,
        jogadorId: null,
      }),
    ]);
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
    expect(setup.save).not.toHaveBeenCalled();
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
  return { catalogActionId, playerId, timestampSeconds };
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
  const savedEntities = (entities: TaggedActionEntity[]) =>
    entities.map((entity, index) => ({ ...entity, id: `saved-${index}` }));
  const save = jest.fn(
    (entities: TaggedActionEntity[]): Promise<TaggedActionEntity[]> =>
      Promise.resolve(savedEntities(entities)),
  );
  const taggedRepository = {
    create: jest.fn((entity: TaggedActionEntity) => entity),
    save,
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
    save,
  };
}
