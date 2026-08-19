import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { ToastProvider } from "../../contexts/ToastContext/ToastContext";
import { useApi } from "../../hooks/useApi";
import { backendApi } from "../../utils/api";
import type { PlayerSessionMinutes } from "./index";
import SessionMinutes from "./SessionMinutes";

vi.mock("../../hooks/useApi", () => ({ useApi: vi.fn() }));

const mockedUseApi = vi.mocked(useApi);
const mutate = vi.fn().mockResolvedValue(undefined);
const session = {
  id: "session-1",
  typeId: 2,
  type: "Jogo",
  date: "2026-08-17",
  locationId: 1,
  local: "Ginásio",
  courtSizeId: 1,
  courtSize: "Oficial",
  opponent: "Adversário",
};

describe("SessionMinutes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mutate.mockClear();
  });

  afterEach(() => vi.useRealTimers());

  it("lists athletes, including zero, and rebuilds multiple active timers", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-17T12:01:05.000Z"));
    renderPage([
      player({ playerId: "senna", name: "SENNA" }),
      player({
        playerId: "everton",
        name: "EVERTON",
        totalSeconds: 600,
        activeSince: "2026-08-17T12:00:00.000Z",
        isActive: true,
      }),
      player({
        playerId: "pet",
        name: "PET",
        totalSeconds: 30,
        activeSince: "2026-08-17T12:01:00.000Z",
        isActive: true,
      }),
    ]);

    expect(screen.getByText("SENNA")).toBeInTheDocument();
    expect(screen.getByLabelText("Minutagem de SENNA")).toHaveTextContent("00:00");
    expect(screen.getByLabelText("Minutagem de EVERTON")).toHaveTextContent("11:05");
    expect(screen.getByLabelText("Minutagem de PET")).toHaveTextContent("00:35");
    expect(screen.getAllByText("Em quadra")).toHaveLength(2);
  });

  it("calls start and stop endpoints and mutates after each success", async () => {
    const post = vi.spyOn(backendApi, "post").mockResolvedValue({} as never);
    renderPage([
      player({ playerId: "senna", name: "SENNA" }),
      player({
        playerId: "everton",
        name: "EVERTON",
        isActive: true,
        activeSince: "2026-08-17T12:00:00.000Z",
      }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    fireEvent.click(screen.getByRole("button", { name: "Sair" }));

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(post).toHaveBeenCalledWith("/sessions/session-1/minutes/senna/start");
    expect(post).toHaveBeenCalledWith("/sessions/session-1/minutes/everton/stop");
    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(2));
  });

  it("converts 35:30 to 2130 for manual editing and mutates", async () => {
    const put = vi.spyOn(backendApi, "put").mockResolvedValue({} as never);
    renderPage([player({ playerId: "senna", name: "SENNA" })]);

    fireEvent.click(screen.getByRole("button", { name: "Editar minutagem" }));
    fireEvent.change(screen.getByLabelText("Tempo (MM:SS)"), {
      target: { value: "35:30" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() =>
      expect(put).toHaveBeenCalledWith(
        "/sessions/session-1/minutes/senna",
        { totalSeconds: 2130 },
      ),
    );
    expect(mutate).toHaveBeenCalledOnce();
  });

  it("disables manual editing while the athlete is active", () => {
    renderPage([
      player({
        isActive: true,
        activeSince: "2026-08-17T12:00:00.000Z",
      }),
    ]);

    expect(screen.getByRole("button", { name: "Editar minutagem" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Editar minutagem" })).toHaveAttribute(
      "title",
      "Encerre o período ativo antes de editar",
    );
  });

  it("shows request errors through the Toast", async () => {
    vi.spyOn(backendApi, "post").mockRejectedValue(new Error("network"));
    renderPage([player()]);

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText("Não foi possível atualizar a minutagem."),
    ).toBeInTheDocument();
  });

  it("prevents duplicate submissions for the same athlete without blocking others", async () => {
    let resolveFirst!: (value: unknown) => void;
    const firstRequest = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    const post = vi
      .spyOn(backendApi, "post")
      .mockReturnValueOnce(firstRequest as never)
      .mockResolvedValue({} as never);
    renderPage([
      player({ playerId: "senna", name: "SENNA" }),
      player({ playerId: "everton", name: "EVERTON" }),
    ]);

    const enterButtons = screen.getAllByRole("button", { name: "Entrar" });
    fireEvent.click(enterButtons[0]);
    fireEvent.click(enterButtons[0]);
    fireEvent.click(enterButtons[1]);

    expect(post).toHaveBeenCalledTimes(2);
    expect(post).toHaveBeenNthCalledWith(2, "/sessions/session-1/minutes/everton/start");
    resolveFirst({});
    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(2));
  });
});

function renderPage(players: PlayerSessionMinutes[]) {
  mockedUseApi.mockImplementation((endpoint) => ({
    data: endpoint?.endsWith("/minutes") ? players : session,
    error: undefined,
    isError: undefined,
    isLoading: false,
    isValidating: false,
    mutate,
  }) as never);

  return render(
    <MemoryRouter initialEntries={["/sessions/session-1/minutes"]}>
      <ToastProvider>
        <Routes>
          <Route path="/sessions/:id/minutes" element={<SessionMinutes />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

function player(
  overrides: Partial<PlayerSessionMinutes> = {},
): PlayerSessionMinutes {
  return {
    playerId: "player-1",
    name: "Atleta",
    position: "Ala",
    totalSeconds: 0,
    activeSince: null,
    isActive: false,
    ...overrides,
  };
}
