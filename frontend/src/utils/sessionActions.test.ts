import { backendApi } from "./api";
import { persistSessionActions } from "./sessionActions";

vi.mock("./api", () => ({
  backendApi: { post: vi.fn() },
}));

const mockedPost = vi.mocked(backendApi.post);
const CATALOG_ACTION_ID = "00000000-0000-0000-0000-000000000418";
const PLAYER_ID = "00000000-0000-0000-0000-000000000201";
const TEAM_CONTEXT_ID = "00000000-0000-0000-0000-000000000737";

describe("persistSessionActions", () => {
  beforeEach(() => mockedPost.mockReset());

  it("converts decimal time to integer and executes POST for a valid individual action", async () => {
    mockedPost.mockResolvedValue({ data: { actions: [] } });

    await persistSessionActions("session-id", [
      {
        id: "temporary-id",
        sessionId: "session-id",
        catalogActionId: CATALOG_ACTION_ID,
        type: "individual",
        time: "12.98",
        title: "Gol",
        goodAction: true,
        player: { id: PLAYER_ID, name: "Ana" } as never,
      },
    ]);

    expect(mockedPost).toHaveBeenCalledWith("/sessions/session-id/actions", {
      actions: [
        {
          clientActionId: "temporary-id",
          catalogActionId: CATALOG_ACTION_ID,
          playerId: PLAYER_ID,
          timestampSeconds: 12,
        },
      ],
    });
  });

  it("accepts a valid collective action with playerId null and executes POST", async () => {
    mockedPost.mockResolvedValue({ data: { actions: [] } });

    await persistSessionActions("session-id", [
      {
        id: "temporary-id",
        sessionId: "session-id",
        catalogActionId: CATALOG_ACTION_ID,
        type: "team",
        time: "4",
        title: "Pressão",
        goodAction: true,
      },
    ]);

    expect(mockedPost).toHaveBeenCalledWith("/sessions/session-id/actions", {
      actions: [
        {
          clientActionId: "temporary-id",
          catalogActionId: CATALOG_ACTION_ID,
          timestampSeconds: 4,
        },
      ],
    });
  });

  it("sends contextual team actions in one batch without playerId", async () => {
    mockedPost.mockResolvedValue({ data: { actions: [] } });

    await persistSessionActions("session-id", [
      {
        id: "temporary-team-1",
        sessionId: "session-id",
        catalogActionId: CATALOG_ACTION_ID,
        teamContextId: TEAM_CONTEXT_ID,
        type: "team",
        time: "80.99",
        title: "Finalização",
        contextName: "Ataque posicional",
        goodAction: true,
      },
      {
        id: "temporary-team-2",
        sessionId: "session-id",
        catalogActionId: "00000000-0000-0000-0000-000000000719",
        teamContextId: "00000000-0000-0000-0000-000000000743",
        type: "team",
        time: "92",
        title: "Gol sofrido",
        contextName: "Pressão",
        goodAction: false,
      },
    ]);

    expect(mockedPost).toHaveBeenCalledTimes(1);
    const payload = mockedPost.mock.calls[0][1] as {
      actions: Array<Record<string, unknown>>;
    };
    expect(payload.actions).toHaveLength(2);
    expect(payload.actions[0]).toEqual({
      clientActionId: "temporary-team-1",
      catalogActionId: CATALOG_ACTION_ID,
      teamContextId: TEAM_CONTEXT_ID,
      timestampSeconds: 80,
    });
    expect(payload.actions[0]).not.toHaveProperty("playerId");
    expect(payload.actions[1]).not.toHaveProperty("playerId");
  });

  it("rejects malformed identifiers and does not execute POST", async () => {
    await expect(
      persistSessionActions("session-id", [
        {
          id: "temporary-id",
          sessionId: "session-id",
          catalogActionId: "invalid",
          type: "individual",
          time: "1",
          title: "Gol",
          goodAction: true,
          player: { id: PLAYER_ID } as never,
        },
      ]),
    ).rejects.toThrow();
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it("requires a player for individual actions", async () => {
    await expect(
      persistSessionActions("session-id", [
        {
          id: "temporary-id",
          sessionId: "session-id",
          catalogActionId: CATALOG_ACTION_ID,
          type: "individual",
          time: "1",
          title: "Gol",
          goodAction: true,
        },
      ]),
    ).rejects.toThrow("deve possuir um jogador");
    expect(mockedPost).not.toHaveBeenCalled();
  });
});
