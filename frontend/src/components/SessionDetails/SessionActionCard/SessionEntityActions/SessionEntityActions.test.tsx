import { render, screen } from "@testing-library/react";
import type { SessionEntityAction } from "../../../../pages/SessionView";
import SessionEntityActions from "./SessionEntityActions";

describe("SessionEntityActions", () => {
  it("shows v2 team actions with their contexts", () => {
    render(
      <SessionEntityActions
        actions={[
          action("Finalização", "Ataque posicional"),
          action("Recuperação de bola", "Pressão"),
        ]}
      />,
    );

    expect(
      screen.getByText("Finalização · Ataque posicional"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Recuperação de bola · Pressão"),
    ).toBeInTheDocument();
  });

  it("keeps legacy and individual actions readable without a context", () => {
    render(
      <SessionEntityActions
        actions={[
          action("Gol em transição ofensiva", null),
          action("Assistência", null),
        ]}
      />,
    );

    expect(screen.getByText("Gol em transição ofensiva")).toBeInTheDocument();
    expect(screen.getByText("Assistência")).toBeInTheDocument();
    expect(screen.queryByText(/·/)).not.toBeInTheDocument();
  });
});

function action(
  title: string,
  contextName: string | null,
): SessionEntityAction {
  return {
    id: `${title}-${contextName}`,
    catalogActionId: "catalog-action",
    actionKey: "ACTION",
    actionName: title,
    groupKey: "GROUP",
    groupName: "Grupo",
    impact: "POSITIVE",
    teamContextId: contextName ? "context-id" : null,
    contextKey: contextName ? "CONTEXT" : null,
    contextName,
    timestampSeconds: 80,
    title,
    category: { code: "ACTION", label: "ACTION" },
    time: "01:20",
    outcome: "positive",
  };
}
