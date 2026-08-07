import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { ComponentProps } from "react";
import AthleteRegistrationCard from "./AthleteRegistrationCard";

const navigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));

describe("AthleteRegistrationCard", () => {
  beforeEach(() => navigate.mockReset());

  it("uses independent native buttons without nested interactive elements", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const { container } = renderCard(onEdit, onDelete);

    expect(container.querySelector("button button")).not.toBeInTheDocument();
    expect(container.querySelector('[role="button"]')).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver detalhes de Ana" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Editar Ana" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir Ana" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("exposes the primary action as a keyboard-accessible native button", () => {
    renderCard(vi.fn(), vi.fn());
    const primaryAction = screen.getByRole("button", { name: "Ver detalhes de Ana" });

    primaryAction.focus();
    expect(primaryAction).toHaveFocus();
    fireEvent.click(primaryAction);
    expect(navigate).toHaveBeenCalledWith("/player/athlete-1");
  });
});

type CardAction = ComponentProps<typeof AthleteRegistrationCard>["onEdit"];

function renderCard(onEdit: CardAction, onDelete: CardAction) {
  return render(
    <MemoryRouter>
      <AthleteRegistrationCard
        athlete={{ id: "athlete-1", name: "Ana", age: 22, position: "Ala" }}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </MemoryRouter>,
  );
}
