import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import {
  CatalogActionEntity,
  PlayerEntity,
  SessionEntity,
  TaggedActionEntity,
  TeamActionContextEntity,
} from '../entities';
import {
  INDIVIDUAL_ANALYSIS_TYPE_ID,
  TEAM_ANALYSIS_TYPE_ID,
} from '../catalog/catalog.constants';
import { isTeamCatalogV2CategoryKey } from '../catalog/team-catalog-v2.constants';
import { CreateSessionActionsDto } from './dto/create-session-actions.dto';
import {
  CreateSessionActionsResponseDto,
  TaggedActionResponseDto,
} from './dto/tagged-action-response.dto';

@Injectable()
export class TaggedActionsService {
  constructor(
    @InjectRepository(TaggedActionEntity)
    private readonly taggedActionsRepository: Repository<TaggedActionEntity>,
  ) {}

  async createForSession(
    sessionId: string,
    dto: CreateSessionActionsDto,
  ): Promise<CreateSessionActionsResponseDto> {
    return this.taggedActionsRepository.manager.transaction(async (manager) => {
      const sessionsRepository = manager.getRepository(SessionEntity);
      const catalogActionsRepository =
        manager.getRepository(CatalogActionEntity);
      const playersRepository = manager.getRepository(PlayerEntity);
      const teamContextsRepository = manager.getRepository(
        TeamActionContextEntity,
      );
      const taggedActionsRepository = manager.getRepository(TaggedActionEntity);

      const clientActionIds = dto.actions.map(
        (action) => action.clientActionId,
      );
      if (new Set(clientActionIds).size !== clientActionIds.length) {
        throw new BadRequestException(
          'Identificadores idempotentes não podem se repetir no mesmo lote',
        );
      }

      const session = await sessionsRepository.findOneBy({ id: sessionId });
      if (!session) throw new NotFoundException('Sessão não encontrada');

      const catalogActionIds = [
        ...new Set(dto.actions.map((action) => action.catalogActionId)),
      ];
      const catalogActions = await catalogActionsRepository.find({
        where: { id: In(catalogActionIds) },
        relations: { categoriaAcao: true },
      });
      if (catalogActions.length !== catalogActionIds.length) {
        throw new BadRequestException(
          'Uma ou mais ações do catálogo não foram encontradas',
        );
      }

      const playerIds = [
        ...new Set(
          dto.actions.flatMap((action) =>
            action.playerId ? [action.playerId] : [],
          ),
        ),
      ];
      const players = playerIds.length
        ? await playersRepository.findBy({ id: In(playerIds) })
        : [];
      if (players.length !== playerIds.length) {
        throw new BadRequestException(
          'Um ou mais jogadores não foram encontrados',
        );
      }
      if (players.some((player) => player.equipeId !== session.equipeId)) {
        throw new BadRequestException(
          'Jogador deve pertencer à mesma equipe da sessão',
        );
      }

      const teamContextIds = [
        ...new Set(
          dto.actions.flatMap((action) =>
            action.teamContextId ? [action.teamContextId] : [],
          ),
        ),
      ];
      const teamContexts = teamContextIds.length
        ? await teamContextsRepository.find({
            where: { id: In(teamContextIds), deletedAt: IsNull() },
          })
        : [];
      if (teamContexts.length !== teamContextIds.length) {
        throw new BadRequestException(
          'Um ou mais contextos de equipe não foram encontrados',
        );
      }

      const catalogActionsById = new Map(
        catalogActions.map((action) => [action.id, action]),
      );
      const teamContextsById = new Map(
        teamContexts.map((context) => [context.id, context]),
      );
      for (const action of dto.actions) {
        const catalogAction = catalogActionsById.get(action.catalogActionId);
        if (!catalogAction) {
          throw new BadRequestException(
            'Uma ou mais ações do catálogo não foram encontradas',
          );
        }
        const analysisTypeId = catalogAction.categoriaAcao?.tipoAnaliseId;
        const teamContext = action.teamContextId
          ? teamContextsById.get(action.teamContextId)
          : undefined;

        if (
          analysisTypeId === INDIVIDUAL_ANALYSIS_TYPE_ID &&
          !action.playerId
        ) {
          throw new BadRequestException(
            'Ação individual deve possuir um jogador',
          );
        }
        if (analysisTypeId === TEAM_ANALYSIS_TYPE_ID && action.playerId) {
          throw new BadRequestException(
            'Ação de equipe não deve possuir um jogador',
          );
        }
        if (
          analysisTypeId === INDIVIDUAL_ANALYSIS_TYPE_ID &&
          action.teamContextId
        ) {
          throw new BadRequestException(
            'Ação individual não deve possuir um contexto de equipe',
          );
        }
        if (
          analysisTypeId !== INDIVIDUAL_ANALYSIS_TYPE_ID &&
          analysisTypeId !== TEAM_ANALYSIS_TYPE_ID
        ) {
          throw new BadRequestException('Tipo de análise da ação inválido');
        }
        if (
          analysisTypeId === TEAM_ANALYSIS_TYPE_ID &&
          isTeamCatalogV2CategoryKey(catalogAction.categoriaAcao?.chave) &&
          !action.teamContextId
        ) {
          throw new BadRequestException(
            'Ação do novo catálogo de equipe deve possuir um contexto',
          );
        }
        if (
          teamContext &&
          teamContext.categoriaAcaoId !== catalogAction.categoriaAcaoId
        ) {
          throw new BadRequestException(
            'Contexto de equipe deve pertencer à mesma categoria da ação',
          );
        }
      }

      const entities = dto.actions.map((action) =>
        taggedActionsRepository.create({
          sessaoId: sessionId,
          acaoCatalogoId: action.catalogActionId,
          jogadorId: action.playerId ?? null,
          contextoAcaoEquipeId: action.teamContextId ?? null,
          timestampSegundos: action.timestampSeconds,
          clientActionId: action.clientActionId,
        }),
      );
      await taggedActionsRepository
        .createQueryBuilder()
        .insert()
        .into(TaggedActionEntity)
        .values(entities)
        .orIgnore()
        .execute();

      const persistedActions = await taggedActionsRepository.find({
        where: {
          sessaoId: sessionId,
          clientActionId: In(clientActionIds),
        },
      });
      const actionsByClientId = new Map(
        persistedActions.map((action) => [action.clientActionId, action]),
      );
      const savedActions = clientActionIds.map((clientActionId) => {
        const action = actionsByClientId.get(clientActionId);
        if (!action) {
          throw new Error('Ação idempotente não foi persistida');
        }
        return action;
      });

      return { actions: savedActions.map((action) => this.toResponse(action)) };
    });
  }

  private toResponse(action: TaggedActionEntity): TaggedActionResponseDto {
    return {
      id: action.id,
      sessionId: action.sessaoId,
      catalogActionId: action.acaoCatalogoId,
      playerId: action.jogadorId,
      teamContextId: action.contextoAcaoEquipeId ?? null,
      timestampSeconds: action.timestampSegundos,
    };
  }
}
