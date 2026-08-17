import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  PlayerEntity,
  PlayerSessionMinutesEntity,
  SessionEntity,
  TaggedActionEntity,
  TeamEntity,
} from '../entities';
import { PlayersService } from '../players/players.service';
import { SessionsModule } from './sessions.module';
import { SessionsService } from './sessions.service';

describe('SessionsModule', () => {
  it('resolves SessionsService with PlayersService through Nest injection', async () => {
    const playersService = {
      buildRankingForPlayers: jest.fn(),
    } as unknown as PlayersService;

    const moduleRef = await Test.createTestingModule({
      imports: [SessionsModule],
    })
      .overrideProvider(getRepositoryToken(SessionEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(TeamEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(TaggedActionEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(PlayerEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(PlayerSessionMinutesEntity))
      .useValue({})
      .overrideProvider(PlayersService)
      .useValue(playersService)
      .compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    expect(moduleRef.get(PlayersService)).toBe(playersService);
    expect(moduleRef.get(SessionsService)).toBeInstanceOf(SessionsService);

    await app.close();
  });
});
