import { backendApi } from "./api";
import { persistSessionActions } from "./sessionActions";

vi.mock("./api", () => ({
  backendApi: { post: vi.fn() },
}));

const mockedPost = vi.mocked(backendApi.post);
const CATALOG_ACTION_ID = "00000000-0000-0000-0000-000000000418";
const PLAYER_ID = "00000000-0000-0000-0000-000000000201";

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
          catalogActionId: CATALOG_ACTION_ID,
          playerId: null,
          timestampSeconds: 4,
        },
      ],
    });
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
