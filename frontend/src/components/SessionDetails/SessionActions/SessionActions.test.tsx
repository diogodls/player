import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useApi } from "../../../hooks/useApi";
import { backendApi } from "../../../utils/api";
import { ToastContext } from "../../../contexts/ToastContext/ToastContext";
import SessionActions from "./SessionActions";

vi.mock("../../../hooks/useApi", () => ({ useApi: vi.fn() }));
vi.mock("../../../utils/api", () => ({ backendApi: { delete: vi.fn() } }));
vi.mock("../SessionActionCard/SessionActionCard", () => ({
  default: ({ entity, onDeleteAction, deletingActionId }: any) => (
    <button
      type="button"
      disabled={deletingActionId === entity.actions[0].id}
      onClick={() => onDeleteAction(entity.actions[0])}
    >
      Excluir ação exibida
    </button>
  ),
}));
vi.mock("../SessionSummary/SessionSummary", () => ({
  default: () => <div />,
}));

const mockedUseApi = vi.mocked(useApi);
const mockedDelete = vi.mocked(backendApi.delete);
const toast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  clearAll: vi.fn(),
};

describe("SessionActions team phase filter", () => {
  beforeEach(() => {
    mockedUseApi.mockReset();
    mockedDelete.mockReset();
    Object.values(toast).forEach((mock) => mock.mockReset());
    mockedUseApi.mockImplementation(() => apiState({ data: sessionView() }));
  });

  it("lists the team catalog phases and sends the selected phase to the session view", () => {
    render(<SessionActions sessionId="session-1" viewMode="team" />);

    const phaseFilter = screen.getByLabelText("Fase");
    expect(
      screen.getByRole("option", { name: "Todas as fases" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Ataque posicional" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Pressão" })).toBeInTheDocument();

    fireEvent.change(phaseFilter, {
      target: { value: "POSITIONAL_ATTACK" },
    });

    expect(mockedUseApi).toHaveBeenCalledWith(
      "/sessions/session-1/view?phaseKey=POSITIONAL_ATTACK",
    );
  });

  it("shows actual v2 action filters and sends neutral outcome", () => {
    render(<SessionActions sessionId="session-1" viewMode="team" />);

    expect(
      screen.getByRole("option", { name: "Finalização" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Neutras" }));

    expect(mockedUseApi).toHaveBeenCalledWith(
      "/sessions/session-1/view?outcome=neutral",
    );
  });

  it("sends the selected v2 action key through the existing category filter", () => {
    render(<SessionActions sessionId="session-1" viewMode="team" />);

    fireEvent.change(screen.getByLabelText("Ação"), {
      target: { value: "AT_FINALIZACAO" },
    });

    expect(mockedUseApi).toHaveBeenCalledWith(
      "/sessions/session-1/view?categoryCode=AT_FINALIZACAO",
    );
  });

  it("confirms deletion, calls the scoped endpoint and revalidates the view", async () => {
    const mutate = vi.fn().mockResolvedValue(undefined);
    mockedUseApi.mockReturnValue(
      apiState({ data: sessionViewWithAction(), mutate }) as never,
    );
    mockedDelete.mockResolvedValue({} as never);
    renderWithToast(<SessionActions sessionId="session-1" viewMode="team" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Excluir ação exibida" }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() =>
      expect(mockedDelete).toHaveBeenCalledWith(
        "/sessions/session-1/actions/action-1",
      ),
    );
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith("Ação excluída com sucesso");
  });

  it("keeps the action and reports feedback when deletion fails", async () => {
    const mutate = vi.fn();
    mockedUseApi.mockReturnValue(
      apiState({ data: sessionViewWithAction(), mutate }) as never,
    );
    mockedDelete.mockRejectedValue(new Error("failed"));
    renderWithToast(<SessionActions sessionId="session-1" viewMode="team" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Excluir ação exibida" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Não foi possível excluir a ação",
      ),
    );
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

function renderWithToast(children: React.ReactNode) {
  return render(
    <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>,
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

function sessionView() {
  const emptyAnalysis = {
    summary: {
      positives: 0,
      negatives: 0,
      positivePercentage: 0,
      negativePercentage: 0,
    },
    entities: [],
  };

  return {
    session: {
      id: "session-1",
      typeId: 1,
      type: "Treino",
      date: "2026-07-28",
      locationId: 1,
      local: "Casa",
      courtSizeId: 1,
      courtSize: "Pequena",
    },
    analysis: {
      individual: emptyAnalysis,
      team: emptyAnalysis,
    },
    filters: {
      individual: {
        athletes: [],
        categories: [],
        outcomes: [],
        phases: [],
      },
      team: {
        athletes: [],
        categories: [{ value: "AT_FINALIZACAO", label: "Finalização" }],
        outcomes: [
          { value: "positive", label: "Positivas" },
          { value: "neutral", label: "Neutras" },
        ],
        phases: [
          { value: "POSITIONAL_ATTACK", label: "Ataque posicional" },
          { value: "PRESSING", label: "Pressão" },
        ],
      },
    },
  };
}

function sessionViewWithAction() {
  const data = sessionView();
  const entity = {
    id: "team",
    title: "Equipe",
    type: "team",
    stats: { positive: 1, negative: 0, neutral: 0, total: 1 },
    metrics: { offensive: 1, defensive: 0, performance: 100 },
    actions: [{ id: "action-1", title: "Gol", outcome: "positive" }],
  };
  return {
    ...data,
    analysis: {
      ...data.analysis,
      team: { ...data.analysis.team, entities: [entity] },
    },
  };
}
