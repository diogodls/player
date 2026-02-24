import styles from "./SessionView.module.scss";
import HeaderSessionScreen from "../../components/RegistrationScreen/HeaderSessionScreen/HeaderSessionScreen";
import RegistrationScreen from "../../components/RegistrationScreen/RegistrationScreen";
import { useApi } from "../../hooks/useApi";
import type { SessionData } from "./index";

const SessionView = () => {
  const { data } = useApi<SessionData>("sessions");

  return (
    <div className={styles.container}>
      <HeaderSessionScreen />
      <RegistrationScreen sessions={data?.sessions ?? []} />
    </div>
  );
};

export default SessionView;