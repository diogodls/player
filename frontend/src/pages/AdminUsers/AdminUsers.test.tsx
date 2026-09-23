import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { useAuth } from "../../contexts/AuthContext/AuthContext";
import { ToastProvider } from "../../contexts/ToastContext/ToastContext";
import { useApi } from "../../hooks/useApi";
import { backendApi } from "../../utils/api";
import Navbar from "../../components/layout/Navbar/Navbar";
import AdminRoute from "../../components/layout/AdminRoute/AdminRoute";
import AdminUsers from "./AdminUsers";

vi.mock("../../contexts/AuthContext/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../../hooks/useApi", () => ({ useApi: vi.fn() }));
vi.mock("../../utils/api", () => ({ backendApi: { put: vi.fn() } }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(useAuth).mockReturnValue({
    user: { email: "pranke@player.ufsm" },
    isLoading: false,
  } as ReturnType<typeof useAuth>);
  vi.mocked(useApi).mockReturnValue({
    data: [
      { id: "user-id", email: "new@team.example", equipeNome: "Feminina" },
    ],
    isLoading: false,
  } as ReturnType<typeof useApi>);
});

it.each(["pranke@player.ufsm", "analista@player.ufsm", "Pranke@player.ufsm"])(
  "shows the admin button only for the exact admin email: %s",
  (email) => {
    vi.mocked(useAuth).mockReturnValue({ user: { email } } as ReturnType<
      typeof useAuth
    >);
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    expect(
      screen.queryByRole("button", { name: "Administrar Usuários" }) !== null,
    ).toBe(email === "pranke@player.ufsm");
  },
);

it("redirects another authenticated user without rendering or fetching the admin page", () => {
  vi.mocked(useAuth).mockReturnValue({
    user: { email: "analista@player.ufsm" },
    isLoading: false,
  } as ReturnType<typeof useAuth>);
  render(
    <MemoryRouter initialEntries={["/admin/users"]}>
      <Routes>
        <Route path="/" element={<p>Home autenticada</p>} />
        <Route element={<AdminRoute />}>
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByText("Home autenticada")).toBeInTheDocument();
  expect(useApi).not.toHaveBeenCalled();
});

function openForm() {
  render(
    <ToastProvider>
      <AdminUsers />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Alterar senha" }));
}
function fill(password: string, confirmation: string) {
  fireEvent.change(screen.getByLabelText("Nova senha"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText("Confirmar nova senha"), {
    target: { value: confirmation },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar senha" }));
}
it.each([
  ["", "", "Preencha"],
  ["short", "short", "6 caracteres"],
  ["password-one", "password-two", "iguais"],
])("rejects invalid password fields", (password, confirmation, message) => {
  openForm();
  fill(password, confirmation);
  expect(screen.getByRole("alert")).toHaveTextContent(message);
  expect(backendApi.put).not.toHaveBeenCalled();
});
it("saves the selected user and shows a success toast, removing password fields", async () => {
  vi.mocked(backendApi.put).mockResolvedValue({});
  openForm();
  fill("new-password", "new-password");
  expect(backendApi.put).toHaveBeenCalledWith(
    "/auth/admin/users/user-id/password",
    { password: "new-password" },
  );
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Senha de new@team.example alterada com sucesso.",
  );
  await waitFor(() =>
    expect(screen.queryByLabelText("Nova senha")).not.toBeInTheDocument(),
  );
});
it("shows backend errors and keeps the form available", async () => {
  vi.mocked(backendApi.put).mockRejectedValue({
    isAxiosError: true,
    response: { data: { message: "Usuário não encontrado." } },
  });
  openForm();
  fill("new-password", "new-password");
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Usuário não encontrado.",
  );
  expect(screen.getByLabelText("Nova senha")).toBeInTheDocument();
});
