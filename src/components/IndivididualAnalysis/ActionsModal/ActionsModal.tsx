import styles from './ActionsModal.module.scss';
import {useContext} from "react";
import {ActionsContext} from "../../../contexts/ActionsContext/ActionsContext.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser, faX} from "@fortawesome/free-solid-svg-icons";
import type {Action, ActionTagged} from "../../../pages/Analysis";
import {uid} from "uid";
import ActionsList from "../../elements/ActionsList/ActionsList.tsx";

type ActionsModal = {
  actions: Action[];
  closeModal: () => void;
};

const ActionsModal = ({actions, closeModal}: ActionsModal) => {
  const {selectedPlayer, setIndividualActions, currentVideoTime} = useContext(ActionsContext);

  const handleActionClick = (action: Action) => {
    if (!selectedPlayer) return;

    const actionTagged = {
      id: uid(),
      goodAction: action.goodAction,
      title: action.label,
      key: action.key,
      category: action.category,
      time: currentVideoTime,
      type: 'individual',
      player: selectedPlayer,
    } as ActionTagged;

    setIndividualActions((actions) => [...actions, actionTagged]);
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

        <ActionsList actions={actions} handleActionClick={handleActionClick}/>
      </div>
    </div>
  );
};

export default ActionsModal;
