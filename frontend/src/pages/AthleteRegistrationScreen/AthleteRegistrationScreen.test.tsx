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
const mockedPost = vi.mocked(backendApi.post);
const playerId = "5e859c16-66a6-4d4f-b088-cd77f2f07d33";

describe("AthleteRegistrationScreen editing", () => {
  beforeEach(() => {
    mockedUseApi.mockReset();
    mockedPut.mockReset();
    mockedPost.mockReset();
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
        data: {
          message: "Id do jogador deve ser igual ao identificador da rota",
        },
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
    expect(
      screen.getByRole("heading", { name: /Editar atleta/ }),
    ).toBeInTheDocument();
  });

  it("closes after POST success without waiting for list revalidation", async () => {
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
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: /Editar atleta/ }),
      ).not.toBeInTheDocument(),
    );
    finishMutation?.();
    expect(mockedUseApi).toHaveBeenCalledWith("/players?page=1&limit=8");
  });

  it("does not repeat the create POST on a double click", async () => {
    let finishPost: (() => void) | undefined;
    mockedUseApi.mockReturnValue(apiState(vi.fn()) as never);
    mockedPost.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishPost = () => resolve({ data: player } as never);
        }),
    );
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Novo atleta" }));
    fireEvent.change(screen.getByLabelText("Nome *"), {
      target: { value: "Nova atleta" },
    });
    const saveButton = screen.getByRole("button", { name: "Salvar atleta" });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    await waitFor(() => expect(mockedPost).toHaveBeenCalledTimes(1));
    expect(saveButton).toBeDisabled();
    finishPost?.();
  });

  it("reports only the list refresh failure after a successful create", async () => {
    const mutate = vi.fn().mockRejectedValue(new Error("refresh failed"));
    mockedUseApi.mockReturnValue(apiState(mutate) as never);
    mockedPost.mockResolvedValue({ data: player } as never);
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Novo atleta" }));
    fireEvent.change(screen.getByLabelText("Nome *"), {
      target: { value: "Nova atleta" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar atleta" }));

    expect(
      await screen.findByText("Atleta criado!", { exact: false }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Atleta salvo, mas não foi possível atualizar a lista/,
      ),
    ).toBeInTheDocument();
    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("heading", { name: /Cadastrar atleta/ }),
    ).not.toBeInTheDocument();
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
  fireEvent.click(screen.getByRole("button", { name: /^Editar Ana Silva$/ }));
  expect(screen.getByRole("combobox", { name: "Posição *" })).toHaveValue(
    "Ala",
  );
  expect(
    screen.getByRole("combobox", { name: "Lado preferencial *" }),
  ).toHaveValue("Canhoto");
}
