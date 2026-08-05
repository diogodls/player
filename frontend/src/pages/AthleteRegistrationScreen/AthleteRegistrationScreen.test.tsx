import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ToastProvider } from "../../contexts/ToastContext/ToastContext";
import { useApi } from "../../hooks/useApi";
import { backendApi } from "../../utils/api";
import AthleteRegistrationScreen from "./AthleteRegistrationScreen";

vi.mock("../../hooks/useApi", () => ({ useApi: vi.fn() }));
vi.mock("../../utils/api", () => ({
  backendApi: {
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedUseApi = vi.mocked(useApi);
const mockedPut = vi.mocked(backendApi.put);
const playerId = "5e859c16-66a6-4d4f-b088-cd77f2f07d33";

describe("AthleteRegistrationScreen editing", () => {
  beforeEach(() => {
    mockedUseApi.mockReset();
    mockedPut.mockReset();
  });

  it("sends only the complete PUT payload with a numeric age and matching id", async () => {
    const mutate = vi.fn().mockResolvedValue(undefined);
    mockedUseApi.mockReturnValue(apiState(mutate) as never);
    mockedPut.mockResolvedValue({ data: player } as never);
    renderPage();

    openEditForm();
    fireEvent.change(screen.getByLabelText(/Idade/), {
      target: { value: "24" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Salvar/ }));

    await waitFor(() =>
      expect(mockedPut).toHaveBeenCalledWith(`/players/${playerId}`, {
        id: playerId,
        name: "Ana Silva",
        age: 24,
        positionId: 3,
        preferredSideId: 2,
      }),
    );
    expect(Object.keys(mockedPut.mock.calls[0][1] as object)).toEqual([
      "id",
      "name",
      "age",
      "positionId",
      "preferredSideId",
    ]);
  });

  it("shows the backend message when PUT responds with 400", async () => {
    mockedUseApi.mockReturnValue(apiState(vi.fn()) as never);
    mockedPut.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: "Id do jogador deve ser igual ao identificador da rota" },
      },
    });
    renderPage();

    openEditForm();
    fireEvent.click(screen.getByRole("button", { name: /Salvar/ }));

    expect(
      await screen.findByText(
        "Id do jogador deve ser igual ao identificador da rota",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Editar atleta/ })).toBeInTheDocument();
  });

  it("revalidates the current list before closing the modal after success", async () => {
    let finishMutation: (() => void) | undefined;
    const mutate = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishMutation = resolve;
        }),
    );
    mockedUseApi.mockReturnValue(apiState(mutate) as never);
    mockedPut.mockResolvedValue({ data: player } as never);
    renderPage();

    openEditForm();
    fireEvent.click(screen.getByRole("button", { name: /Salvar/ }));

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("heading", { name: /Editar atleta/ })).toBeInTheDocument();

    finishMutation?.();
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: /Editar atleta/ }),
      ).not.toBeInTheDocument(),
    );
    expect(mockedUseApi).toHaveBeenCalledWith("/players?page=1&limit=8");
  });
});

const player = {
  id: playerId,
  name: "Ana Silva",
  age: 23,
  positionId: 3,
  position: "Ala" as const,
  preferredSideId: 2,
  preferredSide: "Canhoto" as const,
};

function apiState(mutate: ReturnType<typeof vi.fn>) {
  return {
    data: {
      data: [player],
      total: 1,
      page: 1,
      limit: 8,
      totalPages: 1,
    },
    error: undefined,
    isLoading: false,
    isValidating: false,
    isError: undefined,
    mutate,
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <AthleteRegistrationScreen />
      </ToastProvider>
    </MemoryRouter>,
  );
}

function openEditForm() {
  fireEvent.click(screen.getByRole("button", { name: "Editar" }));
  expect(
    screen.getByRole("combobox", { name: "Posição *" }),
  ).toHaveValue("Ala");
  expect(
    screen.getByRole("combobox", { name: "Lado preferencial *" }),
  ).toHaveValue("Canhoto");
}
