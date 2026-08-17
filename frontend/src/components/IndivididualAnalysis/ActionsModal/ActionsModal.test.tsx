import { fireEvent, render, screen } from "@testing-library/react";
import { ActionsProvider } from "../../../contexts/ActionsContext/ActionsContext";
import { ToastProvider } from "../../../contexts/ToastContext/ToastContext";
import type { CatalogGroup } from "../../../pages/Analysis";
import type { Session } from "../../../pages/Sessions";
import ActionsModal from "./ActionsModal";
import { createIndividualTaggedAction } from "./createIndividualTaggedAction";

const session: Session = {
  id: "session-1",
  typeId: 1,
  type: "Treino",
  date: "2026-07-15",
  locationId: 1,
  local: "Casa",
  courtSizeId: 1,
  courtSize: "Pequena",
};
const groups: CatalogGroup[] = [
  {
    key: "COURT_GOALS_CONCEDED",
    title: "Gols tomados em quadra",
    order: 4,
    actions: [
      {
        id: "action-gs-bp",
        key: "GS BP",
        name: "Gol sofrido bola parada",
        impact: "NEGATIVE",
        order: 3,
      },
    ],
  },
];
const playingTimeGroup: CatalogGroup = {
  key: "PLAYING_TIME",
  title: "Minutagem",
  order: 5,
  actions: [
    {
      id: "action-entered",
      key: "ENTROU",
      name: "Entrou em quadra",
      impact: "NEUTRAL",
      order: 1,
    },
    {
      id: "action-left",
      key: "SAIU",
      name: "Saiu de quadra",
      impact: "NEUTRAL",
      order: 2,
    },
  ],
};

describe("ActionsModal", () => {
  it("renders the groups received from the backend without regrouping actions", () => {
    renderModal(groups);

    expect(screen.getByText("Gols tomados em quadra")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Gol sofrido bola parada" }),
    ).toHaveAttribute("title", "GS BP");
  });

  it("renders an empty catalog safely", () => {
    renderModal([]);
    expect(screen.getByText("Nenhuma ação disponível.")).toBeInTheDocument();
  });

  it("hides legacy playing-time actions but keeps all other actions", () => {
    renderModal([playingTimeGroup, ...groups]);

    expect(screen.queryByText("Entrou em quadra")).not.toBeInTheDocument();
    expect(screen.queryByText("Saiu de quadra")).not.toBeInTheDocument();
    expect(screen.queryByText("Minutagem")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Gol sofrido bola parada" }),
    ).toBeInTheDocument();
  });

  it("keeps the selected catalog action identity and impact when registering it", () => {
    const tagged = createIndividualTaggedAction(
      groups[0].actions[0],
      groups[0].title,
      session,
      null,
      "42",
    );

    expect(tagged).toMatchObject({
      sessionId: "session-1",
      key: "GS BP",
      title: "Gol sofrido bola parada",
      category: "Gols tomados em quadra",
      goodAction: false,
      impact: "NEGATIVE",
      time: "42",
      type: "individual",
    });
  });

  it("keeps the screen stable when an action is clicked before a video is available", () => {
    const closeModal = vi.fn();
    renderModal(groups, closeModal);
    fireEvent.click(
      screen.getByRole("button", { name: "Gol sofrido bola parada" }),
    );
    expect(closeModal).toHaveBeenCalledOnce();
  });
});

function renderModal(catalogGroups: CatalogGroup[], closeModal = vi.fn()) {
  return render(
    <ToastProvider>
      <ActionsProvider>
        <ActionsModal
          groups={catalogGroups}
          session={session}
          closeModal={closeModal}
        />
      </ActionsProvider>
    </ToastProvider>,
  );
}
