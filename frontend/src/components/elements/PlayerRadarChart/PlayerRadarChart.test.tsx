import { render, screen } from "@testing-library/react";
import type { Player } from "../../../pages/CoachDashboard";
import PlayerRadarChart from "./PlayerRadarChart";

vi.mock("@mui/x-charts", () => ({
  RadarChart: ({
    series,
    radar,
  }: {
    series: Array<{
      id: string;
      data: number[];
      valueFormatter: (value: number, context: { dataIndex: number }) => string;
    }>;
    radar: { metrics: Array<{ name: string; max: number }> };
  }) => (
    <div data-testid="radar-chart">
      {radar.metrics.map((metric) => (
        <span key={metric.name} data-testid={`metric-${metric.name}`}>
          {metric.name}:{metric.max}
        </span>
      ))}
      {series.map((item) => (
        <output key={item.id} data-testid={`series-${item.id}`}>
          {item.data.join(",")}
          <span data-testid={`minutes-tooltip-${item.id}`}>
            {item.valueFormatter(item.data[0], { dataIndex: 0 })}
          </span>
          <span data-testid={`offensive-tooltip-${item.id}`}>
            {item.valueFormatter(item.data[3], { dataIndex: 3 })}
          </span>
        </output>
      ))}
    </div>
  ),
}));

describe("PlayerRadarChart", () => {
  it("uses raw values, independent metric maxima and real tooltip values", () => {
    render(
      <PlayerRadarChart
        players={[
          player("everton", 26.02, 1, 3, 33, 8),
          player("leo", 19.72, 2, 2, 7, 7),
        ]}
        metrics={[
          "Minutagem",
          "Gols em quadra",
          "Gols tomados em quadra",
          "A\u00e7\u00f5es ofensivas",
          "A\u00e7\u00f5es defensivas",
        ]}
        showButtons={false}
      />,
    );

    expect(screen.getByTestId("series-everton")).toHaveTextContent(
      "26.02,1,3,33,8",
    );
    expect(screen.getByTestId("series-leo")).toHaveTextContent("19.72,2,2,7,7");
    expect(screen.getByTestId("metric-Minutagem")).toHaveTextContent(
      "Minutagem:28.622",
    );
    expect(screen.getByTestId("metric-Gols em quadra")).toHaveTextContent(
      "Gols em quadra:2.2",
    );
    expect(
      screen.getByTestId("metric-Gols tomados em quadra"),
    ).toHaveTextContent("Gols tomados em quadra:3.3000000000000003");
    expect(
      screen.getByTestId("metric-A\u00e7\u00f5es ofensivas"),
    ).toHaveTextContent("A\u00e7\u00f5es ofensivas:36.300000000000004");
    expect(
      screen.getByTestId("metric-A\u00e7\u00f5es defensivas"),
    ).toHaveTextContent("A\u00e7\u00f5es defensivas:8.8");
    expect(screen.getByTestId("minutes-tooltip-everton")).toHaveTextContent(
      "Minutagem: 26,02 min",
    );
    expect(screen.getByTestId("offensive-tooltip-everton")).toHaveTextContent(
      "A\u00e7\u00f5es ofensivas: 33",
    );
  });

  it("uses a safe axis maximum when both raw values are zero", () => {
    render(
      <PlayerRadarChart
        players={[
          player("first", 0, 0, 0, 0, 0),
          player("second", 0, 0, 0, 0, 0),
        ]}
        metrics={["Minutagem", "Gols", "Tomados", "Ofensivas", "Defensivas"]}
        showButtons={false}
      />,
    );

    expect(screen.getByTestId("series-first")).toHaveTextContent("0,0,0,0,0");
    expect(screen.getByTestId("metric-Minutagem")).toHaveTextContent(
      "Minutagem:1",
    );
  });
});

function player(
  id: string,
  minutes: number,
  goals: number,
  goalsTaken: number,
  offensiveActions: number,
  defensiveActions: number,
): Player {
  return {
    id,
    name: id,
    position: "Ala",
    overall: 50,
    minutes,
    goals,
    goalsTaken,
    offensiveActions,
    defensiveActions,
    indexes: {
      radj: 0,
      goalsRelations: 0,
      actionsRelations: 0,
      atd: 0,
      dto: 0,
      pgj: 0,
      ic: 0,
      tio: 0,
      gtj: 0,
      rf: 0,
      tid: 0,
    },
  };
}
