import axios from "axios";
import { useParams } from "react-router";
import IndividualPlayer from "../../components/PlayerView/IndividualPlayer.tsx";
import { useApi } from "../../hooks/useApi.ts";
import type { PlayerViewData } from "./index";
import styles from "./PlayerView.module.scss";

const PlayerView = () => {
  const { id } = useParams<{ id: string }>();
  const { data, error, isLoading } = useApi<PlayerViewData>(
    id ? `/players/${id}` : null,
    { keepPreviousData: false },
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>Carregando atleta...</div>
      </div>
    );
  }

  if (!id || (axios.isAxiosError(error) && error.response?.status === 404)) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>Atleta não encontrado.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          Não foi possível carregar o atleta. Verifique se o backend está
          disponível e tente novamente.
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={styles.container}>
      <IndividualPlayer player={data} />
    </div>
  );
};

export default PlayerView;
