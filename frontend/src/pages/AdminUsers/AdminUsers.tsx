import axios from "axios";
import { useContext, useRef, useState } from "react";
import { ToastContext } from "../../contexts/ToastContext/ToastContext";
import { useApi } from "../../hooks/useApi";
import { backendApi } from "../../utils/api";
import styles from "./AdminUsers.module.scss";

type AdminUser = {
  id: string;
  email: string;
  equipeId: string;
  equipeNome: string | null;
};

function PasswordForm({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const toast = useContext(ToastContext);

  return (
    <form
      className={styles.form}
      aria-label={`Alterar senha de ${user.email}`}
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending.current) return;
        if (!password || !confirmation) {
          setError("Preencha os dois campos de senha.");
          return;
        }
        if (password.length < 6) {
          setError("Senha deve ter ao menos 6 caracteres.");
          return;
        }
        if (password !== confirmation) {
          setError("As senhas devem ser iguais.");
          return;
        }
        pending.current = true;
        setSaving(true);
        setError("");
        try {
          await backendApi.put(`/auth/admin/users/${user.id}/password`, {
            password,
          });
          toast.success(`Senha de ${user.email} alterada com sucesso.`);
          onClose();
        } catch (caughtError) {
          const message = axios.isAxiosError(caughtError)
            ? caughtError.response?.data?.message
            : undefined;
          toast.error(
            Array.isArray(message)
              ? message.join("; ")
              : typeof message === "string"
                ? message
                : "Não foi possível alterar a senha.",
          );
        } finally {
          pending.current = false;
          setSaving(false);
        }
      }}
    >
      <h2>Alterar senha de {user.email}</h2>
      <label htmlFor="new-password">Nova senha</label>
      <input
        id="new-password"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
        autoFocus
        disabled={saving}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <label htmlFor="confirm-password">Confirmar nova senha</label>
      <input
        id="confirm-password"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
        disabled={saving}
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
      />
      {error && <p role="alert">{error}</p>}
      <div className={styles.actions}>
        <button type="button" onClick={onClose} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar senha"}
        </button>
      </div>
    </form>
  );
}

export default function AdminUsers() {
  const { data, error, isLoading, mutate } =
    useApi<AdminUser[]>("/auth/admin/users");
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <main className={styles.page}>
      <h1>Administrar Usuários</h1>
      {isLoading && <p role="status">Carregando usuários...</p>}
      {error ? (
        <div role="alert">
          Não foi possível carregar os usuários.{" "}
          <button onClick={() => void mutate()}>Tentar novamente</button>
        </div>
      ) : (
        <div className={styles.list}>
          {data?.map((user) => (
            <article className={styles.card} key={user.id}>
              <div className={styles.row}>
                <div>
                  <strong>{user.email}</strong>
                  <p>{user.equipeNome ?? "Equipe não disponível"}</p>
                </div>
                <button
                  onClick={() => setEditing(user.id)}
                  disabled={editing !== null}
                >
                  Alterar senha
                </button>
              </div>
              {editing === user.id && (
                <PasswordForm user={user} onClose={() => setEditing(null)} />
              )}
            </article>
          ))}
          {!isLoading && data?.length === 0 && (
            <p>Nenhum usuário encontrado.</p>
          )}
        </div>
      )}
    </main>
  );
}
