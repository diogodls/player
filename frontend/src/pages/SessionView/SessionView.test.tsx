import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { useApi } from "../../hooks/useApi";
import SessionView from "./SessionView";

vi.mock("../../hooks/useApi", () => ({ useApi: vi.fn() }));
vi.mock("../../components/SessionDetails/SessionActions/SessionActions", () => ({
  default: () => <div>Session actions</div>,
}));

const mockedUseApi = vi.mocked(useApi);

describe("SessionView minutes navigation", () => {
  beforeEach(() => {
    mockedUseApi.mockReturnValue({
      data: {
        session: {
          id: "session-1",
          typeId: 1,
          type: "Treino",
          date: "2026-08-17",
          locationId: 1,
          local: "Casa",
          courtSizeId: 1,
          courtSize: "Oficial",
        },
        analysis: {
          individual: { summary: {}, entities: [] },
          team: { summary: {}, entities: [] },
        },
      } as never,
      error: undefined,
      isError: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
  });

  it("shows the Minutagem action and navigates to its route", () => {
    render(
      <MemoryRouter initialEntries={["/sessions/session-1"]}>
        <Routes>
          <Route path="/sessions/:id" element={<SessionView />} />
          <Route
            path="/sessions/:id/minutes"
            element={<div>Tela de minutagem</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Minutagem" }));
    expect(screen.getByText("Tela de minutagem")).toBeInTheDocument();
  });
});
