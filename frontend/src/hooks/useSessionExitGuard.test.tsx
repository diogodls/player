import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { ActionsContext } from "../contexts/ActionsContext/ActionsContext";
import { ToastProvider } from "../contexts/ToastContext/ToastContext";
import { persistSessionActions } from "../utils/sessionActions";
import { useSessionExitGuard } from "./useSessionExitGuard";

const navigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));
vi.mock("../utils/sessionActions", () => ({
  persistSessionActions: vi.fn(),
}));

const persist = vi.mocked(persistSessionActions);
const sessionId = "session-1";
const pendingAction = {
  id: "client-action-1",
  sessionId,
  catalogActionId: "00000000-0000-0000-0000-000000000418",
  type: "team" as const,
  time: "12",
  title: "Pressão",
  goodAction: true,
};

describe("useSessionExitGuard", () => {
  beforeEach(() => {
    persist.mockReset();
    navigate.mockReset();
  });

  it("allows only one save operation and blocks discard and continue while saving", async () => {
    let finishSave: (() => void) | undefined;
    persist.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishSave = () => resolve([]);
        }),
    );
    const state = contextState();
    const { result } = renderHook(
      () => useSessionExitGuard({ logType: "team", sessionId }),
      { wrapper: wrapper(state.value) },
    );

    act(() => result.current.requestExit());
    act(() => {
      void result.current.handleSaveAndExit();
      void result.current.handleSaveAndExit();
      result.current.handleExitWithoutSaving();
      result.current.closeExitModal();
    });

    expect(persist).toHaveBeenCalledTimes(1);
    expect(result.current.isProcessingExit).toBe(true);
    expect(result.current.isExitModalOpen).toBe(true);
    expect(state.setTeamActions).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();

    await act(async () => finishSave?.());

    expect(state.setTeamActions).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(`/sessions/${sessionId}`);
    expect(result.current.isProcessingExit).toBe(false);
  });

  it("keeps pending actions and releases the lock after a save error", async () => {
    persist.mockRejectedValue(new Error("failed"));
    const state = contextState();
    const addEventListener = vi.spyOn(window, "addEventListener");
    const { result } = renderHook(
      () => useSessionExitGuard({ logType: "team", sessionId }),
      { wrapper: wrapper(state.value) },
    );

    act(() => result.current.requestExit());
    await act(async () => result.current.handleSaveAndExit());

    expect(state.setTeamActions).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(result.current.hasUnsavedChanges).toBe(true);
    expect(result.current.isExitModalOpen).toBe(true);
    expect(result.current.isProcessingExit).toBe(false);
    expect(addEventListener).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );
    addEventListener.mockRestore();
  });
});

function contextState() {
  const setTeamActions = vi.fn();
  return {
    setTeamActions,
    value: {
      individualActions: [],
      teamActions: [pendingAction],
      setIndividualActions: vi.fn(),
      setTeamActions,
    } as never,
  };
}

function wrapper(value: never) {
  return ({ children }: { children: ReactNode }) => (
    <ToastProvider>
      <ActionsContext.Provider value={value}>
        {children}
      </ActionsContext.Provider>
    </ToastProvider>
  );
}
