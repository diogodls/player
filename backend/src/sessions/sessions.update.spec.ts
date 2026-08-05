import { Repository } from 'typeorm';
import { SessionEntity, TaggedActionEntity, TeamEntity } from '../entities';
import { PlayersService } from '../players/players.service';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionsService } from './sessions.service';

const SESSION_ID = '70000000-0000-4000-8000-000000000010';
const TEAM_ID = 'd62ec1e1-f762-45bd-a1e9-09ba8ef8d461';

function session(): SessionEntity {
  return {
    id: SESSION_ID,
    equipeId: TEAM_ID,
    sessionTypeId: 1,
    sessionLocationId: 1,
    sessionCourtSizeId: 2,
    data: new Date('2026-08-05T00:00:00.000Z'),
    descricao: 'Teste planilha Russo Preto',
    equipe: { id: TEAM_ID, nome: 'Equipe Principal' },
    sessionType: { id: 1, nome: 'Treino' },
    sessionLocation: { id: 1, nome: 'Casa' },
    sessionCourtSize: { id: 2, nome: 'Grande' },
  } as SessionEntity;
}

describe('SessionsService update', () => {
  it('updates only supplied fields without loading or replacing actions', async () => {
    const currentSession = session();
    const findOne = jest.fn().mockResolvedValue(currentSession);
    const update = jest.fn().mockResolvedValue({ affected: 1 });
    const taggedActionsRepository = {
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    const service = new SessionsService(
      { findOne, update } as unknown as Repository<SessionEntity>,
      {} as Repository<TeamEntity>,
      taggedActionsRepository as unknown as Repository<TaggedActionEntity>,
      {} as PlayersService,
    );
    const dto: UpdateSessionDto = {
      id: SESSION_ID,
      description: 'Treino editado',
      date: '2026-08-06',
      locationId: 2,
    };

    await service.update(SESSION_ID, dto);

    expect(update).toHaveBeenCalledWith(SESSION_ID, {
      sessionLocationId: 2,
      data: new Date('2026-08-06'),
      descricao: 'Treino editado',
    });
    expect(update).not.toHaveBeenCalledWith(
      SESSION_ID,
      expect.objectContaining({
        equipeId: expect.anything(),
        sessionTypeId: expect.anything(),
        sessionCourtSizeId: expect.anything(),
      }),
    );
    expect(taggedActionsRepository.find).not.toHaveBeenCalled();
    expect(taggedActionsRepository.save).not.toHaveBeenCalled();
    expect(taggedActionsRepository.delete).not.toHaveBeenCalled();
  });

  it('also updates a session without actions using the same direct update', async () => {
    const findOne = jest.fn().mockResolvedValue(session());
    const update = jest.fn().mockResolvedValue({ affected: 1 });
    const service = new SessionsService(
      { findOne, update } as unknown as Repository<SessionEntity>,
      {} as Repository<TeamEntity>,
      {} as Repository<TaggedActionEntity>,
      {} as PlayersService,
    );

    await expect(
      service.update(SESSION_ID, {
        id: SESSION_ID,
        typeId: 2,
        courtSizeId: 1,
      }),
    ).resolves.toEqual(expect.objectContaining({ id: SESSION_ID }));

    expect(update).toHaveBeenCalledWith(SESSION_ID, {
      sessionTypeId: 2,
      sessionCourtSizeId: 1,
    });
  });
});
