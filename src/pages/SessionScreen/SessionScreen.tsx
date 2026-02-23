import styles from "../CoachDashboard/CoachDashboard.module.scss";
import HeaderSessionScreen from "../../components/HeaderSessionScreen/HeaderSessionScreen";
import RegistrationScreen from "../../components/RegistrationScreen/RegistrationScreen";
import { useApi } from "../../hooks/useApi";
import type { SessionData } from "./index";

const SessionScreen = () => {
  const { data } = useApi<SessionData[]>("sessions");

  return (
    <div className={styles.container}>
      <HeaderSessionScreen />
      <RegistrationScreen sessions={data ?? []} />
    </div>
  );
};

export default SessionScreen;