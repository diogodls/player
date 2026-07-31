import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { INDEXES_LABELS, INDEXES_META } from "../../constants/metrics";
import { useApi } from "../../hooks/useApi";
import CoachDashboard from "./CoachDashboard";

vi.mock("../../hooks/useApi", () => ({ useApi: vi.fn() }));
const mockedUseApi = vi.mocked(useApi);

describe("CoachDashboard", () => {
  beforeEach(() => mockedUseApi.mockReset());

  it("loads dashboard data exclusively from the backend endpoint", () => {
    mockedUseApi.mockReturnValue(apiState({ data: dashboardData() }));
    renderPage();

    expect(mockedUseApi).toHaveBeenCalledWith("/coach-dashboard", {
      keepPreviousData: false,
    });
    expect(mockedUseApi).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Ataque posicional")).toBeInTheDocument();
    expect(screen.getByText("77,8%")).toBeInTheDocument();
    expect(screen.getAllByText("Eficiência")).toHaveLength(4);
  });

  it("renders exactly one set-piece card and none of the old cards", () => {
    mockedUseApi.mockReturnValue(apiState({ data: dashboardData() }));
    renderPage();

    expect(screen.getAllByText("Bolas paradas")).toHaveLength(1);
    expect(screen.queryByText("Cantos")).not.toBeInTheDocument();
    expect(screen.queryByText("Lateral ofensivo")).not.toBeInTheDocument();
    expect(screen.queryByText("Faltas")).not.toBeInTheDocument();
  });

  it("formats null, zero, one hundred and decimal values correctly", () => {
    mockedUseApi.mockReturnValue(apiState({ data: dashboardData() }));
    renderPage();

    expect(screen.getByText("Nenhum dado registrado")).toBeInTheDocument();
    expect(screen.getByText("0,0%")).toBeInTheDocument();
    expect(screen.getByText("100,0%")).toBeInTheDocument();
    expect(screen.getByText("77,8%")).toBeInTheDocument();
    expect(screen.getAllByText("0,0%")).toHaveLength(1);
  });

  it("changes only the collective visible terminology", () => {
    mockedUseApi.mockReturnValue(apiState({ data: dashboardData() }));
    renderPage();

    expect(screen.queryByText(/^Índice$/)).not.toBeInTheDocument();
    expect(INDEXES_LABELS.general).toBe("Índices gerais");
    expect(INDEXES_LABELS.offensive).toBe("Índices ofensivos");
    expect(INDEXES_META.ic.label).toBe("Índice de criação");
    expect(Object.keys(dashboardData().players[0].indexes)).toEqual(
      expect.arrayContaining(["radj", "atd", "dto", "pgj", "gtj"]),
    );
  });

  it("renders the loading state without fallback cards", () => {
    mockedUseApi.mockReturnValue(apiState({ isLoading: true }));
    renderPage();
    expect(screen.getByText("Carregando dashboard...")).toBeInTheDocument();
    expect(screen.queryByText("Ataque posicional")).not.toBeInTheDocument();
    expect(screen.queryByText("0,0%")).not.toBeInTheDocument();
  });

  it("renders the error state without fallback cards", () => {
    mockedUseApi.mockReturnValue(apiState({ error: new Error("failed") }));
    renderPage();
    expect(
      screen.getByText("Não foi possível carregar a dashboard."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Ataque posicional")).not.toBeInTheDocument();
    expect(screen.queryByText("0,0%")).not.toBeInTheDocument();
  });

  it.each([
    ["empty teamIndexes", { ...dashboardData(), teamIndexes: [] }],
    ["missing teamIndexes", { ...dashboardData(), teamIndexes: undefined }],
  ])("renders the collective empty state for %s", (_case, data) => {
    mockedUseApi.mockReturnValue(apiState({ data }));
    renderPage();
    expect(
      screen.getByText("Nenhuma eficiência disponível para a equipe."),
    ).toBeInTheDocument();
  });

  it("renders an empty players state", () => {
    mockedUseApi.mockReturnValue(
      apiState({ data: { ...dashboardData(), players: [] } }),
    );
    renderPage();
    fireEvent.click(screen.getByText("Análise Individual"));
    expect(screen.getByText("Nenhum jogador disponível")).toBeInTheDocument();
  });
});

function renderPage() {
  return render(
    <MemoryRouter>
      <CoachDashboard />
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

function dashboardData() {
  return {
    averageTeamCards: [
      {
        name: "Média Geral da Equipe",
        color: "#000",
        value: 10,
        icon: "faTrophy",
      },
    ],
    metrics: [],
    players: [
      {
        id: "player-1",
        name: "Jogador",
        position: "Fixo",
        overall: 90,
        minutes: 10,
        defensiveActions: 2,
        offensiveActions: 3,
        goalsTaken: 1,
        goals: 2,
        indexes: {
          radj: 1,
          goalsRelations: 1,
          actionsRelations: 1,
          atd: 1,
          dto: 1,
          pgj: 1,
          ic: 1,
          tio: 1,
          gtj: 1,
          rf: 1,
          tid: 1,
        },
      },
    ],
    teamIndexes: [
      teamIndex("decimal", "Ataque posicional", 77.777),
      teamIndex("zero", "Transição ofensiva", 0),
      teamIndex("hundred", "Pressing", 100, "defensive"),
      teamIndex("set-piece", "Bolas paradas", null, "set-piece"),
    ],
  };
}

function teamIndex(
  id: string,
  title: string,
  value: number | null,
  phase: "offensive" | "defensive" | "set-piece" = "offensive",
) {
  return { id, title, value, phase, maxValue: 100, trend: "stable" as const };
}
