import { render, screen } from "@testing-library/react";
import type { TeamIndex } from "../../../../pages/CoachDashboard";
import TeamIndexCard from "./TeamIndexCard";

const baseIndex: TeamIndex = {
  id: "positional-attack",
  title: "Ataque posicional",
  phase: "offensive",
  value: null,
  maxValue: 100,
};

describe("TeamIndexCard", () => {
  it.each([
    [0, "0,0%"],
    [77.84, "77,8%"],
    [100, "100,0%"],
  ])("formats the finite value %s", (value, expected) => {
    const { container } = render(
      <TeamIndexCard index={{ ...baseIndex, value }} />,
    );

    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(
      container.querySelector('[style="width: ' + value + '%;"]'),
    ).toBeInTheDocument();
  });

  it.each([null, undefined, Number.NaN, "invalid"])(
    "renders the empty state for invalid value %s",
    (value) => {
      const index = { ...baseIndex };
      Reflect.set(index, "value", value);
      const { container } = render(<TeamIndexCard index={index} />);

      expect(screen.getByText("Nenhum dado registrado")).toBeInTheDocument();
      expect(screen.queryByText("NaN%")).not.toBeInTheDocument();
      expect(
        container.querySelector('[style="width: 0%;"]'),
      ).toBeInTheDocument();
    },
  );
});
