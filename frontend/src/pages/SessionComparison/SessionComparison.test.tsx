import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionComparisonResponse } from "./index";
import SessionComparison from "./SessionComparison";

const useApiMock = vi.hoisted(() => vi.fn());

const indexes = {
  radj: 1,
  goalsRelations: 2,
  actionsRelations: 3,
  atd: 4,
  dto: 5,
  pgj: 6,
  ic: 7,
  tio: 8,
  gtj: 9,
  rf: 10,
  tid: 11,
};

afterEach(() => cleanup());

vi.mock("../../hooks/useApi", () => ({
  useApi: useApiMock,
}));

vi.mock("@mui/x-charts", () => ({
  LineChart: ({
    series,
    yAxis,
    sx,
    hideLegend,
  }: {
    series: Array<{
      data: Array<number | null>;
      color?: string;
      label?: string;
    }>;
    yAxis: Array<{ min?: number; max?: number }>;
    sx: Record<string, Record<string, string>>;
    hideLegend?: boolean;
  }) => (
    <div
      data-testid="line-chart"
      data-colors={series.map((item) => item.color).join(",")}
      data-scale={`${yAxis[0]?.min}:${yAxis[0]?.max}`}
      data-axis-color={
        sx["& .MuiChartsAxis-line, & .MuiChartsAxis-tick"]?.stroke
      }
      data-legend-color={sx["& text, & .MuiChartsLegend-label"]?.fill}
      data-hide-legend={String(hideLegend)}
    >
      {series.map((item) => item.label).join("|")}
    </div>
  ),
}));

const comparisonData: SessionComparisonResponse = {
  period: {
    startDate: "2026-02-15",
    endDate: "2026-02-19",
    typeId: null,
  },
  sessions: [
    {
      id: "session-1",
      date: "2026-02-15",
      type: "Treino",
      description: "Treino técnico",
      opponent: null,
    },
    {
      id: "session-2",
      date: "2026-02-19",
      type: "Jogo",
      description: "Adversário",
      opponent: "Adversário",
    },
  ],
  athletes: [
    {
      id: "athlete-1",
      name: "Ana",
      position: "Goleiro",
      points: [
        {
          sessionId: "session-1",
          metrics: {
            positiveActions: 3,
            negativeActions: 1,
            offensiveActions: 1,
            defensiveActions: 3,
            totalActions: 4,
            performancePercentage: 75,
          },
          indexes,
        },
      ],
    },
    {
      id: "athlete-2",
      name: "Bia",
      position: "Ala",
      points: [
        {
          sessionId: "session-2",
          metrics: {
            positiveActions: 4,
            negativeActions: 1,
            offensiveActions: 4,
            defensiveActions: 1,
            totalActions: 5,
            performancePercentage: 80,
          },
          indexes,
        },
      ],
    },
  ],
};

const comparisonWithFiveAthletes: SessionComparisonResponse = {
  ...comparisonData,
  athletes: [
    ...comparisonData.athletes,
    ...["Caio", "Duda", "Enzo"].map((name, index) => ({
      ...comparisonData.athletes[0],
      id: `athlete-${index + 3}`,
      name,
    })),
  ],
};

function LocationProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-testid="location">{location.search}</output>
      <button
        type="button"
        onClick={() =>
          navigate(
            "/sessions/comparison?startDate=2026-03-01&endDate=2026-03-10&typeId=2",
          )
        }
      >
        Alterar URL externamente
      </button>
    </>
  );
}

function renderComparison(initialEntry = "/sessions/comparison") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/sessions/comparison"
          element={
            <>
              <SessionComparison />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SessionComparison", () => {
  it("writes valid filters to the URL before loading data", async () => {
    useApiMock.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
    renderComparison();

    fireEvent.change(screen.getByLabelText("Data inicial"), {
      target: { value: "2026-02-15" },
    });
    fireEvent.change(screen.getByLabelText("Data final"), {
      target: { value: "2026-02-19" },
    });
    fireEvent.change(screen.getByLabelText("Tipo de sessão"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Comparar" }));

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent(
        "startDate=2026-02-15",
      );
    });
    expect(screen.getByTestId("location")).toHaveTextContent(
      "endDate=2026-02-19",
    );
    expect(screen.getByTestId("location")).toHaveTextContent("typeId=1");
  });

  it("synchronizes the form when navigation changes the applied URL", async () => {
    useApiMock.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
    renderComparison(
      "/sessions/comparison?startDate=2026-02-15&endDate=2026-02-19&typeId=1",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Alterar URL externamente" }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Data inicial")).toHaveValue("2026-03-01");
    });
    expect(screen.getByLabelText("Data final")).toHaveValue("2026-03-10");
    expect(screen.getByLabelText("Tipo de sessão")).toHaveValue("2");
  });

  it("compares multiple athletes in three charts using PlayerView colors", () => {
    useApiMock.mockReturnValue({
      data: comparisonData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
    renderComparison(
      "/sessions/comparison?startDate=2026-02-15&endDate=2026-02-19",
    );

    expect(screen.queryByText("É necessária mais uma sessão")).not.toBeInTheDocument();
    expect(screen.getByText("Sessões analisadas").parentElement).toHaveTextContent("2");

    const table = screen.getByRole("table");
    expect(
      within(table).getByRole("button", { name: /^Ana/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", { name: "Comparação entre atletas" }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("line-chart")).toHaveLength(3);
    expect(screen.getAllByTestId("line-chart")[0]).toHaveTextContent(
      "Ana · RADJ",
    );
    expect(screen.getAllByTestId("line-chart")[0]).toHaveAttribute(
      "data-colors",
      "#60A5FA,#60A5FA,#60A5FA,#60A5FA,#60A5FA",
    );
    expect(screen.getAllByTestId("line-chart")[0]).toHaveAttribute(
      "data-axis-color",
      "#FFFFFF !important",
    );
    expect(screen.getAllByTestId("line-chart")[0]).toHaveAttribute(
      "data-legend-color",
      "#FFFFFF !important",
    );
    expect(screen.getAllByTestId("line-chart")[0]).toHaveAttribute(
      "data-hide-legend",
      "true",
    );
    const generalLegend = screen.getByRole("group", {
      name: "Legenda dos índices gerais",
    });
    expect(within(generalLegend).getByText("RADJ")).toBeInTheDocument();
    expect(
      within(generalLegend).getByText("Relação ataque-defesa por jogo"),
    ).toBeInTheDocument();

    fireEvent.click(
      within(table).getByRole("button", {
        name: "Adicionar Bia à comparação",
      }),
    );

    expect(
      within(table).getByRole("button", { name: /^Bia/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByTestId("line-chart")[0]).toHaveTextContent(
      "Bia · RADJ",
    );
    expect(screen.getByTestId("location")).toHaveTextContent(
      "athleteIds=athlete-1%2Cathlete-2",
    );
  });

  it("applies index filters only after confirmation and adapts the scale", () => {
    useApiMock.mockReturnValue({
      data: comparisonData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
    renderComparison(
      "/sessions/comparison?startDate=2026-02-15&endDate=2026-02-19",
    );

    const initialScale = screen.getAllByTestId("line-chart")[0].getAttribute(
      "data-scale",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Selecionar índices gerais" }),
    );
    fireEvent.click(screen.getByRole("checkbox", { name: /RADJ/ }));

    expect(screen.getAllByTestId("line-chart")[0]).toHaveTextContent(
      "Ana · +/- gols",
    );
    expect(screen.getAllByTestId("line-chart")[0]).toHaveAttribute(
      "data-scale",
      initialScale,
    );

    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    const generalChart = screen.getAllByTestId("line-chart")[0];
    expect(generalChart).toHaveTextContent("Ana · RADJ");
    expect(generalChart).not.toHaveTextContent("Ana · +/- gols");
    expect(generalChart).not.toHaveAttribute("data-scale", initialScale);
  });

  it("limits the comparison to four athletes", () => {
    useApiMock.mockReturnValue({
      data: comparisonWithFiveAthletes,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
    renderComparison(
      "/sessions/comparison?startDate=2026-02-15&endDate=2026-02-19",
    );

    const table = screen.getByRole("table");
    for (const name of ["Bia", "Caio", "Duda"]) {
      fireEvent.click(
        within(table).getByRole("button", {
          name: `Adicionar ${name} à comparação`,
        }),
      );
    }

    expect(screen.getByText("4/4 selecionados")).toBeInTheDocument();
    expect(
      within(table).getByRole("button", {
        name: "Adicionar Enzo à comparação",
      }),
    ).toBeDisabled();
  });

  it("shows the explicit single-session state", () => {
    useApiMock.mockReturnValue({
      data: {
        ...comparisonData,
        sessions: comparisonData.sessions.slice(0, 1),
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
    renderComparison(
      "/sessions/comparison?startDate=2026-02-15&endDate=2026-02-19",
    );

    expect(
      screen.getByText("É necessária mais uma sessão"),
    ).toBeInTheDocument();
  });
});
