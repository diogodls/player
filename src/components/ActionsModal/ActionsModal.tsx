import styles from './ActionsModal.module.scss';
import {useContext, useMemo} from "react";
import {ActionsContext} from "../../contexts/ActionsContext/ActionsContext.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBullseye, faMinus, faUser} from "@fortawesome/free-solid-svg-icons";
import type {Action} from "../../pages/IndividualAnalysis";

type ActionsModal = {
  actions: Action[];
}

const ActionsModal = ({actions}: ActionsModal) => {
  const {selectedPlayer} = useContext(ActionsContext);
  const groupedActions = useMemo(
    () =>
      actions.reduce((acc, action) => {
        const formattedAction = {
          label: action.label,
          key: action.key,
          goodAction: action.goodAction,
        };

        if (!acc[action.category]) {
          acc[action.category] = [formattedAction];
        } else {
          acc[action.category] = [...acc[action.category], formattedAction];
        }
        return acc;
      }, {} as Record<string, { label: string, key: string, goodAction: boolean}[]>),
    [actions]
  )

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.player}>
            <span>
              <FontAwesomeIcon icon={faUser} className={styles.playerIcon}/>
            </span>
            <span className={styles.playerInfos}>
              <span className={styles.title}>
                Taggear ação
              </span>
              <span className={styles.playerField}>
                Jogador: <span className={styles.playerName}>{selectedPlayer?.position} - {selectedPlayer?.name}</span>
              </span>
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          {Object.entries(groupedActions).map(([title, actions]) => (
            <div className={styles.actionsType} key={title}>
              <span className={styles.actionsTitle}>
                {title}
              </span>
              <div className={styles.tagActions}>
                {actions.map(({goodAction, label, key}) => (
                  <span className={`${styles.action} ${goodAction ? styles.goodAction : styles.badAction}`} title={key} key={key}>
                    <FontAwesomeIcon icon={goodAction ? faBullseye : faMinus} />
                    <span>{label}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionsModal;