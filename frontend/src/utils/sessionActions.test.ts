import { backendApi } from './api';
import { persistSessionActions } from './sessionActions';

vi.mock('./api', () => ({
  backendApi: { post: vi.fn() },
}));

const mockedPost = vi.mocked(backendApi.post);

describe('persistSessionActions', () => {
  beforeEach(() => mockedPost.mockReset());

  it('sends only identifiers and the video timestamp', async () => {
    mockedPost.mockResolvedValue({ data: { actions: [] } });

    await persistSessionActions('session-id', [
      {
        id: 'temporary-id',
        sessionId: 'session-id',
        catalogActionId: 'catalog-id',
        type: 'individual',
        time: '12.98',
        title: 'Gol',
        key: 'GM',
        category: 'Ataque',
        goodAction: true,
        player: { id: 'player-id', name: 'Ana' } as never,
      },
    ]);

    expect(mockedPost).toHaveBeenCalledWith('/sessions/session-id/actions', {
      actions: [
        {
          catalogActionId: 'catalog-id',
          playerId: 'player-id',
          timestampSeconds: 12,
        },
      ],
    });
  });

  it('does not call the backend when an action has invalid persistence data', async () => {
    await expect(
      persistSessionActions('session-id', [
        {
          id: 'temporary-id',
          sessionId: 'session-id',
          type: 'team',
          time: 'invalid',
          title: 'Gol',
          goodAction: true,
        },
      ]),
    ).rejects.toThrow();

    expect(mockedPost).not.toHaveBeenCalled();
  });
});
