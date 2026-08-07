import { render, screen } from "@testing-library/react";
import AnalysisExitModal from "./AnalysisExitModal";

describe("AnalysisExitModal", () => {
  it("disables every decision while an exit action is processing", () => {
    render(
      <AnalysisExitModal
        onCancel={vi.fn()}
        onDiscard={vi.fn()}
        onSave={vi.fn()}
        isProcessing
      />,
    );

    expect(
      screen.getByRole("button", { name: "Continuar editando" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Sair sem salvar" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Processando..." }),
    ).toBeDisabled();
  });
});
