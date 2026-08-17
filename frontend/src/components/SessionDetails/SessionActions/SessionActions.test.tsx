import { fireEvent, render, screen } from "@testing-library/react";
import { useApi } from "../../../hooks/useApi";
import SessionActions from "./SessionActions";

vi.mock("../../../hooks/useApi", () => ({ useApi: vi.fn() }));
vi.mock("../SessionActionCard/SessionActionCard", () => ({
  default: () => <div />,
}));
vi.mock("../SessionSummary/SessionSummary", () => ({
  default: () => <div />,
}));

const mockedUseApi = vi.mocked(useApi);

describe("SessionActions team phase filter", () => {
  beforeEach(() => {
    mockedUseApi.mockReset();
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
});

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
