import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { INDEXES_LABELS, INDEXES_META } from "../../constants/metrics";
import { useApi } from "../../hooks/useApi";
import CoachDashboard from "./CoachDashboard";

vi.mock("../../hooks/useApi", () => ({ useApi: vi.fn() }));
const mockedUseApi = vi.mocked(useApi);

describe("CoachDashboard", () => {
  beforeEach(() => {
    mockedUseApi.mockReset();
    vi.restoreAllMocks();
  });

  it("does not render the temporarily unavailable export action", () => {
    mockedUseApi.mockReturnValue(apiState({ data: dashboardData() }));
    renderPage();

    expect(
      screen.queryByRole("button", { name: "Exportar dados" }),
    ).not.toBeInTheDocument();
  });

  it("loads dashboard data exclusively from the backend endpoint", () => {
    mockedUseApi.mockReturnValue(apiState({ data: dashboardData() }));
    renderPage();

    expect(mockedUseApi).toHaveBeenCalledWith("/coach-dashboard", {
      keepPreviousData: false,
    });
    expect(mockedUseApi).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Ataque posicional")).toBeInTheDocument();
    expect(screen.getByText("77,8%")).toBeInTheDocument();
    expect(screen.getAllByText("Eficiência")).toHaveLength(14);
  });

  it("renders the 14 V2 cards in one collective carousel", () => {
    mockedUseApi.mockReturnValue(apiState({ data: dashboardData() }));
    renderPage();

    expect(screen.getAllByLabelText("Índices coletivos")).toHaveLength(1);
    expect(screen.getAllByText("Eficiência")).toHaveLength(14);
    expect(screen.getByText("Lateral ofensivo")).toBeInTheDocument();
    expect(screen.getByText("Goleiro linha defensivo")).toBeInTheDocument();
    expect(screen.getByText("Arremesso de meta")).toBeInTheDocument();
    expect(screen.queryByText("Bolas paradas")).not.toBeInTheDocument();
  });

  it("formats null, zero, one hundred and decimal values correctly", () => {
    mockedUseApi.mockReturnValue(apiState({ data: dashboardData() }));
    renderPage();

    expect(screen.getAllByText("Nenhum dado registrado")).toHaveLength(11);
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

  it("renders the collective empty state for an empty list", () => {
    const data = { ...dashboardData(), teamIndexes: [] };
    mockedUseApi.mockReturnValue(apiState({ data }));
    renderPage();
    expect(
      screen.getByText("Nenhuma eficiência disponível para a equipe."),
    ).toBeInTheDocument();
  });

  it("reports a malformed response instead of silently hiding it", () => {
    mockedUseApi.mockReturnValue(
      apiState({ data: { ...dashboardData(), teamIndexes: undefined } }),
    );
    renderPage();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "A dashboard recebeu dados inválidos.",
    );
  });

  it("reports malformed players without crashing while filtering", () => {
    mockedUseApi.mockReturnValue(
      apiState({ data: { ...dashboardData(), players: {} } }),
    );

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "A dashboard recebeu dados inválidos.",
    );
  });

  it("renders an empty players state", () => {
    mockedUseApi.mockReturnValue(
      apiState({ data: { ...dashboardData(), players: [] } }),
    );
    renderPage();
    fireEvent.click(screen.getByText("Análise Individual"));
    expect(screen.getByText("Nenhum jogador disponível")).toBeInTheDocument();
  });

  it("shows the backend rating on the player card and removes OFF and DEF", () => {
    mockedUseApi.mockReturnValue(apiState({ data: dashboardData() }));
    renderPage();
    fireEvent.click(screen.getByText("Análise Individual"));

    expect(screen.getByText("NOTA MÉDIA")).toBeInTheDocument();
    expect(screen.getByText("8,4")).toBeInTheDocument();
    expect(screen.queryByText("OFF")).not.toBeInTheDocument();
    expect(screen.queryByText("DEF")).not.toBeInTheDocument();
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
        rating: 8.4,
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
      teamIndex("offensive-transition", "Transição ofensiva", 0),
      teamIndex("playing-out-pressure", "Saída de pressão", null),
      teamIndex("positional-attack", "Ataque posicional", 77.777),
      teamIndex("fly-goalkeeper", "Goleiro linha", null),
      teamIndex(
        "defensive-fly-goalkeeper",
        "Goleiro linha defensivo",
        null,
        "defensive",
      ),
      teamIndex(
        "variable-pressing",
        "Marcação variando pra pressão",
        null,
        "defensive",
      ),
      teamIndex("pressing", "Pressão", 100, "defensive"),
      teamIndex("low-block", "Marcação baixa", null, "defensive"),
      teamIndex(
        "defensive-transition",
        "Transição defensiva",
        null,
        "defensive",
      ),
      teamIndex("corner", "Canto", null, "set-piece"),
      teamIndex("offensive-kick-in", "Lateral ofensivo", null, "set-piece"),
      teamIndex("defensive-kick-in", "Lateral defensivo", null, "set-piece"),
      teamIndex("free-kick", "Falta", null, "set-piece"),
      teamIndex("goal-clearance", "Arremesso de meta", null, "set-piece"),
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
