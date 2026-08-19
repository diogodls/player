import { fireEvent, render, screen } from "@testing-library/react";
import type { SessionEntityAction } from "../../../pages/SessionView";
import DeleteSessionActionModal from "./DeleteSessionActionModal";

const action = {
  id: "action-id",
  title: "Gol marcado",
} as SessionEntityAction;

describe("DeleteSessionActionModal", () => {
  it("confirms or cancels without changing the action itself", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <DeleteSessionActionModal
        action={action}
        isDeleting={false}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText(/Gol marcado/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("blocks repeated confirmation while deleting", () => {
    render(
      <DeleteSessionActionModal
        action={action}
        isDeleting
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Excluindo..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });
});
