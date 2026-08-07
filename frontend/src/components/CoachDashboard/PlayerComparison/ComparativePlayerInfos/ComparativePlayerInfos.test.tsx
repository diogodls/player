import { render, screen, within } from "@testing-library/react";
import type { Player } from "../../../../pages/CoachDashboard";
import ComparativePlayerInfos from "./ComparativePlayerInfos";

describe("ComparativePlayerInfos", () => {
  it("renders all athlete indexes using shared labels, formatting and direction", () => {
    const first = player("first", {
      pgj: 2,
      ic: 3,
      gtj: 4,
      rf: 1.5,
      radj: -2,
      goalsRelations: 1,
      actionsRelations: 1.5,
      atd: -10,
      dto: 2,
      tio: 30,
      tid: 20,
    });
    const second = player("second", {
      pgj: 1,
      ic: 2,
      gtj: 2,
      rf: 1,
      radj: -4,
      goalsRelations: 0.5,
      actionsRelations: 1,
      atd: -20,
      dto: 1,
      tio: 20,
      tid: 10,
    });

    const { container } = render(
      <ComparativePlayerInfos selectedPlayers={[first, second]} />,
    );

    for (const label of [
      "PGJ",
      "IC",
      "GTJ",
      "RF",
      "RADJ",
      "+/- gols",
      "+/- ações",
      "ATD",
      "DTO",
      "TIO",
      "TID",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    expect(screen.queryByText("Minutagem")).not.toBeInTheDocument();
    expect(screen.getByText("-10,00")).toBeInTheDocument();
    expect(screen.getByText("30,0%")).toBeInTheDocument();

    const gtjRow = screen.getByText("GTJ").closest("tr");
    expect(gtjRow).not.toBeNull();
    expect(
      within(gtjRow!).getByText("2,00").querySelector("svg"),
    ).not.toBeNull();
    expect(within(gtjRow!).getByText("4,00").querySelector("svg")).toBeNull();
    expect(
      Array.from(
        gtjRow!.querySelectorAll<HTMLElement>("[style*='width']"),
        (element) => element.style.width,
      ),
    ).toEqual(["0%", "100%"]);

    const dtoRow = screen.getByText("DTO").closest("tr");
    expect(dtoRow).not.toBeNull();
    expect(within(dtoRow!).getByText("1,00").querySelector("svg")).not.toBeNull();
    expect(
      Array.from(
        dtoRow!.querySelectorAll<HTMLElement>("[style*='width']"),
        (element) => element.style.width,
      ),
    ).toEqual(["0%", "100%"]);

    const barWidths = Array.from(
      container.querySelectorAll<HTMLElement>("[style*='width']"),
      (element) => element.style.width,
    );
    expect(barWidths).not.toContain(expect.stringMatching(/^-/));
  });
});

function player(id: string, indexes: Player["indexes"]): Player {
  return {
    id,
    name: id,
    position: "Ala",
    overall: 50,
    minutes: 20,
    goals: 1,
    goalsTaken: 1,
    offensiveActions: 1,
    defensiveActions: 1,
    indexes,
  };
}
