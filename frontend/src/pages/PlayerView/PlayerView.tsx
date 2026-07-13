import {useApi} from "../../hooks/useApi.ts";
import IndividualPlayer from "../../components/PlayerView/IndividualPlayer.tsx";
import type {PlayerViewData} from "./index";
import styles from './PlayerView.module.scss';
import {mockApi} from "../../utils/api.ts";

const PlayerView = () => {
  // const { id } = useParams<{ id: string }>(); //todo: usar depois pra req do back
  const { data } = useApi<PlayerViewData>("player-view", { client: mockApi });

  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          Atleta nao encontrado.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <IndividualPlayer
        player={data.player}
        team={data.team}
        metrics={data.metrics}
      />
    </div>
  );
};

export default PlayerView;
