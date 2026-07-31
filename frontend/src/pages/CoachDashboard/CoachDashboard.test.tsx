import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { useApi } from "../../hooks/useApi";
import CoachDashboard from "./CoachDashboard";

vi.mock("../../hooks/useApi", () => ({ useApi: vi.fn() }));
const mockedUseApi = vi.mocked(useApi);

describe("CoachDashboard", () => {
  beforeEach(() => mockedUseApi.mockReset());

  it("loads dashboard data from the backend endpoint", () => {
    mockedUseApi.mockReturnValue(apiState({ data: dashboardData() }));
    renderPage();
    expect(mockedUseApi).toHaveBeenCalledWith("/coach-dashboard", {
      keepPreviousData: false,
    });
    expect(screen.getByText("Média Geral da Equipe")).toBeInTheDocument();
  });

  it("renders the loading state", () => {
    mockedUseApi.mockReturnValue(apiState({ isLoading: true }));
    renderPage();
    expect(screen.getByText("Carregando dashboard...")).toBeInTheDocument();
  });

  it("renders the error state", () => {
    mockedUseApi.mockReturnValue(apiState({ error: new Error("failed") }));
    renderPage();
    expect(
      screen.getByText("Não foi possível carregar a dashboard."),
    ).toBeInTheDocument();
  });

  it("renders an empty players state", () => {
    mockedUseApi.mockReturnValue(apiState({ data: dashboardData() }));
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
    players: [],
    teamIndexes: [],
  };
}
