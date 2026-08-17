import { useContext, useEffect } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import {
  ActionsContext,
  ActionsProvider,
} from "../../../contexts/ActionsContext/ActionsContext";
import { ToastProvider } from "../../../contexts/ToastContext/ToastContext";
import type { CatalogGroup } from "../../../pages/Analysis";
import type { Session } from "../../../pages/Sessions";
import ActionLog from "../../elements/ActionLog/ActionLog";
import TeamActions from "./TeamActions";

const session: Session = {
  id: "00000000-0000-0000-0000-000000000102",
  typeId: 2,
  type: "Jogo",
  date: "2026-08-17",
  locationId: 1,
  local: "Casa",
  courtSizeId: 1,
  courtSize: "Pequena",
};

describe("TeamActions v2", () => {
  it("renders the three ordered groups and all twelve backend actions", () => {
    const { container } = renderTeamActions();

    expect(screen.getByText("Bola parada")).toBeInTheDocument();
    expect(screen.getByText("Ataque")).toBeInTheDocument();
    expect(screen.getByText("Defesa")).toBeInTheDocument();
    expect(container.querySelectorAll("button[title]")).toHaveLength(12);

    const content = container.textContent ?? "";
    expect(content.indexOf("Bola parada")).toBeLessThan(
      content.indexOf("Ataque"),
    );
    expect(content.indexOf("Ataque")).toBeLessThan(content.indexOf("Defesa"));
  });

  it("opens the modal with only the selected group contexts and cancels without tagging", () => {
    renderTeamActions();

    fireEvent.click(screen.getByRole("button", { name: "Finalização" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Saída de pressão" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ataque posicional" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Pressão" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("team-action-count")).toHaveTextContent("0");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("team-action-count")).toHaveTextContent("0");
  });

  it("creates one contextual action using the timestamp captured on the initial click", () => {
    renderTeamActions(true);

    fireEvent.click(screen.getByRole("button", { name: "Finalização" }));
    fireEvent.click(screen.getByRole("button", { name: "Avançar vídeo" }));
    fireEvent.click(screen.getByRole("button", { name: "Ataque posicional" }));

    const pending = JSON.parse(
      screen.getByTestId("team-actions-json").textContent ?? "[]",
    );
    expect(pending).toHaveLength(1);
    expect(pending[0]).toMatchObject({
      catalogActionId: "00000000-0000-0000-0000-000000000716",
      teamContextId: "00000000-0000-0000-0000-000000000739",
      sessionId: session.id,
      time: "80.25",
      title: "Finalização",
      contextName: "Ataque posicional",
      type: "team",
    });
    expect(pending[0].id).toEqual(expect.any(String));
    expect(screen.getByTestId("team-action-count")).toHaveTextContent("1");
    expect(screen.getByTestId("team-action-description")).toHaveTextContent(
      "Finalização · Ataque posicional",
    );
  });
});

function TestState({ showLog }: { showLog: boolean }) {
  const { setCurrentVideoTime, setIsVideoLoaded, teamActions } =
    useContext(ActionsContext);

  useEffect(() => {
    setCurrentVideoTime("80.25");
    setIsVideoLoaded(true);
  }, [setCurrentVideoTime, setIsVideoLoaded]);

  return (
    <>
      <button type="button" onClick={() => setCurrentVideoTime("95.75")}>
        Avançar vídeo
      </button>
      <span data-testid="team-action-count">{teamActions.length}</span>
      <pre data-testid="team-actions-json">{JSON.stringify(teamActions)}</pre>
      {showLog && <ActionLog logType="team" session={session} />}
    </>
  );
}

function renderTeamActions(showLog = false) {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <ActionsProvider>
          <TestState showLog={showLog} />
          <TeamActions groups={groups} session={session} />
        </ActionsProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

function action(
  id: number,
  key: string,
  name: string,
  order: number,
  positive = true,
) {
  return {
    id: `00000000-0000-0000-0000-${String(id).padStart(12, "0")}`,
    key,
    name,
    impact: positive ? ("POSITIVE" as const) : ("NEGATIVE" as const),
    order,
  };
}

function context(id: number, key: string, name: string, order: number) {
  return {
    id: `00000000-0000-0000-0000-${String(id).padStart(12, "0")}`,
    key,
    name,
    order,
  };
}

const groups: CatalogGroup[] = [
  {
    key: "TEAM_V2_DEFENSE",
    title: "Defesa",
    order: 3,
    actions: [
      action(722, "DF_RECUPERACAO", "Recuperação de bola", 4),
      action(721, "DF_JOGADA_INTERCEPTADA", "Jogada interceptada", 3),
      action(720, "DF_FINALIZACAO_SOFRIDA", "Finalização sofrida", 2, false),
      action(719, "DF_GOL_SOFRIDO", "Gol sofrido", 1, false),
    ],
    contexts: [
      context(744, "DEFENSIVE_FLY_GOALKEEPER", "Goleiro linha defensivo", 5),
      context(743, "PRESSING", "Pressão", 4),
      context(742, "LOW_BLOCK", "Marcação baixa", 3),
      context(741, "VARIABLE_PRESSING", "Marcação variando pra pressão", 2),
      context(740, "DEFENSIVE_TRANSITION", "Transição defensiva", 1),
    ],
  },
  {
    key: "TEAM_V2_ATTACK",
    title: "Ataque",
    order: 2,
    actions: [
      action(718, "AT_POSSE_PERDIDA", "Posse perdida", 4, false),
      action(717, "AT_POSSE_MANTIDA", "Posse mantida", 3),
      action(716, "AT_FINALIZACAO", "Finalização", 2),
      action(715, "AT_GOL", "Gol", 1),
    ],
    contexts: [
      context(739, "POSITIONAL_ATTACK", "Ataque posicional", 4),
      context(738, "FLY_GOALKEEPER", "Goleiro linha", 3),
      context(737, "PRESSURE_EXIT", "Saída de pressão", 2),
      context(736, "OFFENSIVE_TRANSITION", "Transição ofensiva", 1),
    ],
  },
  {
    key: "TEAM_V2_SET_PIECE",
    title: "Bola parada",
    order: 1,
    actions: [
      action(714, "BP_SEM_EXEC", "Sem execução", 4, false),
      action(713, "BP_MAL_EXEC", "Jogada mal executada", 3, false),
      action(712, "BP_BEM_EXEC", "Jogada bem executada", 2),
      action(711, "BP_GOL", "Gol", 1),
    ],
    contexts: [
      context(735, "GOAL_CLEARANCE", "Arremesso de meta", 5),
      context(734, "DEFENSIVE_KICK_IN", "Lateral defensivo", 4),
      context(733, "FREE_KICK", "Falta", 3),
      context(732, "OFFENSIVE_KICK_IN", "Lateral ofensivo", 2),
      context(731, "CORNER", "Canto", 1),
    ],
  },
];
