import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { ActionsProvider } from "../../../contexts/ActionsContext/ActionsContext";
import { useApi } from "../../../hooks/useApi";
import TeamAnalysis from "./TeamAnalysis";

vi.mock("../../../hooks/useApi", () => ({ useApi: vi.fn() }));
vi.mock("../../../hooks/useSessionExitGuard", () => ({
  useSessionExitGuard: () => ({
    requestExit: vi.fn(),
    isExitModalOpen: false,
    closeExitModal: vi.fn(),
    handleExitWithoutSaving: vi.fn(),
    handleSaveAndExit: vi.fn(),
  }),
}));
vi.mock("../../../components/elements/VideoAnalysis/VideoAnalysis", () => ({
  default: () => <div />,
}));
vi.mock("../../../components/elements/ActionLog/ActionLog", () => ({
  default: () => <div data-testid="team-action-log" />,
}));
vi.mock("../../../components/TeamAnalysis/TeamActions/TeamActions", () => ({
  default: () => <div data-testid="team-actions" />,
}));
vi.mock(
  "../../../components/elements/SessionAnalysisHeader/SessionAnalysisHeader",
  () => ({
    default: () => <div />,
  }),
);

const mockedUseApi = vi.mocked(useApi);

describe("TeamAnalysis real session loading", () => {
  beforeEach(() => mockedUseApi.mockReset());

  it("loads the session identified by the route instead of the analysis mock", () => {
    mockedUseApi
      .mockReturnValueOnce(apiState({ data: session() }))
      .mockReturnValueOnce(
        apiState({
          data: { analysisType: "TEAM", groups: [] },
        }),
      );

    renderPage();

    expect(mockedUseApi).toHaveBeenNthCalledWith(
      1,
      "/sessions/00000000-0000-0000-0000-000000000102",
    );
    expect(mockedUseApi).toHaveBeenNthCalledWith(2, "/catalog/actions/team");
    expect(screen.getByTestId("team-actions")).toBeInTheDocument();
    expect(
      screen.getByTestId("team-actions").parentElement?.parentElement,
    ).toContainElement(screen.getByTestId("team-action-log"));
  });
});

function renderPage() {
  return render(
    <MemoryRouter
      initialEntries={[
        "/sessions/00000000-0000-0000-0000-000000000102/analysis/team",
      ]}
    >
      <ActionsProvider>
        <Routes>
          <Route
            path="/sessions/:id/analysis/team"
            element={<TeamAnalysis />}
          />
        </Routes>
      </ActionsProvider>
    </MemoryRouter>,
  );
}

function apiState(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    isError: undefined,
    mutate: vi.fn(),
    ...overrides,
  };
}

function session() {
  return {
    id: "00000000-0000-0000-0000-000000000102",
    typeId: 2,
    type: "Jogo" as const,
    date: "2026-02-19",
    locationId: 2,
    local: "Fora" as const,
    courtSizeId: 2,
    courtSize: "Grande" as const,
  };
}
