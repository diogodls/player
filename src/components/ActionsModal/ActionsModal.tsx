import styles from './ActionsModal.module.scss';
import {useContext, useMemo} from "react";
import {ActionsContext} from "../../contexts/ActionsContext/ActionsContext.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBullseye, faMinus, faUser, faX} from "@fortawesome/free-solid-svg-icons";
import type {Action, ActionTagged} from "../../pages/IndividualAnalysis";

type ActionsModal = {
  actions: Action[];
  closeModal: () => void
};

const ActionsModal = ({actions, closeModal}: ActionsModal) => {
  const {selectedPlayer, setActions} = useContext(ActionsContext);
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
      }, {} as Record<string, { label: string, key: string, goodAction: boolean }[]>),
    [actions]
  );

  const handleActionClick = (action: Action) => {
    const actionTagged = {
      player: selectedPlayer,
      goodAction: action.goodAction,
      title: action.label,
      time: '12:41', //todo: pegar tempo do vídeo
    } as ActionTagged;

    setActions((actions) => [...actions, actionTagged])
    closeModal();
  }

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
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

          <FontAwesomeIcon icon={faX} className={styles.exitIcon} onClick={closeModal}/>
        </div>

        <div className={styles.actions}>
          {Object.entries(groupedActions).map(([title, actions]) => (
            <div className={styles.actionsType} key={title}>
              <span className={styles.actionsTitle}>
                {title}
              </span>
              <div className={styles.tagActions}>
                {actions.map((action) => {
                  const actionTag = {
                    ...action,
                    category: title
                  };

                  return (
                    <span
                      className={`${styles.action} ${action.goodAction ? styles.goodAction : styles.badAction}`}
                      title={action.key}
                      key={action.key}
                      onClick={() => handleActionClick(actionTag)}
                    >
                    <FontAwesomeIcon icon={action.goodAction ? faBullseye : faMinus}/>
                    <span>{action.label}</span>
                  </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionsModal;