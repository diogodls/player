import { fireEvent, render, screen } from "@testing-library/react";
import type { Player } from "../../../pages/CoachDashboard";
import PlayerComparison from "./PlayerComparison";

vi.mock("../../elements/PlayerRadarChart/PlayerRadarChart.tsx", () => ({
  default: ({ players }: { players: Player[] }) => (
    <div data-testid="comparison-players">
      {players.map((player) => `${player.id}:${player.overall}`).join(",")}
    </div>
  ),
}));

vi.mock("./ComparativePlayerInfos/ComparativePlayerInfos.tsx", () => ({
  default: () => null,
}));

describe("PlayerComparison", () => {
  it("removes unavailable players and replaces valid selections with current data", () => {
    const initial = [player("ana", 40), player("bia", 50), player("carla", 60)];
    const { rerender } = render(<PlayerComparison players={initial} metrics={[]} />);

    fireEvent.change(screen.getByLabelText("Jogador 1"), {
      target: { value: "ana" },
    });
    fireEvent.change(screen.getByLabelText("Jogador 2"), {
      target: { value: "bia" },
    });
    expect(screen.getByTestId("comparison-players")).toHaveTextContent(
      "ana:40,bia:50",
    );

    rerender(
      <PlayerComparison
        players={[player("ana", 88), player("carla", 70)]}
        metrics={[]}
      />,
    );

    expect(screen.queryByText("bia")).not.toBeInTheDocument();
    expect(screen.getByText("Média: 88")).toBeInTheDocument();
    expect(screen.queryByTestId("comparison-players")).not.toBeInTheDocument();
  });
});

function player(id: string, overall: number): Player {
  return {
    id,
    name: id,
    position: "Ala",
    overall,
    minutes: 20,
    goals: 1,
    goalsTaken: 1,
    offensiveActions: 3,
    defensiveActions: 2,
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
