import {useApi} from "../../hooks/useApi.ts";
import IndividualPlayer from "../../components/IndividualPlayer/IndividualPlayer.tsx";
import type {PlayerViewData} from "./index";
import styles from './PlayerView.module.scss';

const PlayerView = () => {
  const { data } = useApi<PlayerViewData>("player-view");

  if (!data) return;

  return (
    <div className={styles.container}>
      <IndividualPlayer player={data.player} team={data.team} metrics={data.metrics} />
    </div>
  );
};

export default PlayerView;