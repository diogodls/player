import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { INDEXES_META } from "../../constants/metrics.ts";
import type { PlayerViewData } from "../../pages/PlayerView";
import IndividualPlayer from "./IndividualPlayer";

const player: PlayerViewData = {
  id: "00000000-0000-0000-0000-000000000201",
  name: "Joao",
  age: 20,
  positionId: 2,
  position: "Fixo",
  preferredSideId: 1,
  preferredSide: "Destro",
  teamName: "Equipe Principal",
  indexes: {
    radj: 1.35,
    goalsRelations: 1.2,
    actionsRelations: 3.4,
    atd: 72,
    dto: 68,
    pgj: 1.1,
    ic: 74,
    tio: 78,
    gtj: 0.8,
    rf: 2.4,
    tid: 81,
  },
};

describe("IndividualPlayer indexes", () => {
  it("renders all index fields returned by the backend", () => {
    render(<MemoryRouter><IndividualPlayer player={player} /></MemoryRouter>);

    expect(screen.getByTitle(INDEXES_META.radj.label)).toHaveTextContent("1,35");
    expect(screen.getByTitle(INDEXES_META.goalsRelations.label)).toHaveTextContent("1,2");
    expect(screen.getByTitle(INDEXES_META.tid.label)).toHaveTextContent("81");
    expect(document.querySelectorAll('[title]').length).toBe(11);
  });

  it("keeps the page usable when a player has no indexes yet", () => {
    render(
      <MemoryRouter>
        <IndividualPlayer player={{ ...player, indexes: null }} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Nenhum .*ndice individual/)).toBeInTheDocument();
  });
});
