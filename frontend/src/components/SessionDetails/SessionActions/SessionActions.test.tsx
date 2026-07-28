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

const teamGroups = [
  { key: "SET_PIECE", title: "Bola parada", order: 1, actions: [] },
  {
    key: "OFFENSIVE_ORGANIZATION",
    title: "Organização ofensiva",
    order: 2,
    actions: [],
  },
  {
    key: "OFFENSIVE_TRANSITION",
    title: "Transição ofensiva",
    order: 3,
    actions: [],
  },
  {
    key: "DEFENSIVE_ORGANIZATION",
    title: "Organização defensiva",
    order: 4,
    actions: [],
  },
  {
    key: "DEFENSIVE_TRANSITION",
    title: "Transição defensiva",
    order: 5,
    actions: [],
  },
];

describe("SessionActions team phase filter", () => {
  beforeEach(() => {
    mockedUseApi.mockReset();
    mockedUseApi.mockImplementation((endpoint) => {
      if (endpoint === "/catalog/actions/team") {
        return apiState({
          data: { analysisType: "TEAM", groups: teamGroups },
        });
      }

      return apiState({ data: sessionView() });
    });
  });

  it("lists the team catalog phases and sends the selected phase to the session view", () => {
    render(<SessionActions sessionId="session-1" viewMode="team" />);

    const phaseFilter = screen.getByLabelText("Fase");
    expect(screen.getByRole("option", { name: "Todas as fases" })).toBeInTheDocument();
    teamGroups.forEach((group) => {
      expect(screen.getByRole("option", { name: group.title })).toBeInTheDocument();
    });

    fireEvent.change(phaseFilter, {
      target: { value: "OFFENSIVE_TRANSITION" },
    });

    expect(mockedUseApi).toHaveBeenCalledWith(
      "/sessions/session-1/view?phaseKey=OFFENSIVE_TRANSITION",
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
      individual: { athletes: [], categories: [] },
      team: { athletes: [], categories: [] },
    },
  };
}
