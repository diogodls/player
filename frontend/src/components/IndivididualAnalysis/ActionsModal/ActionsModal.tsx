import styles from './ActionsModal.module.scss';
import {useContext} from "react";
import {ActionsContext} from "../../../contexts/ActionsContext/ActionsContext.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBullseye, faMinus, faUser, faX} from "@fortawesome/free-solid-svg-icons";
import type {IndividualCatalogAction, IndividualCatalogGroup} from "../../../pages/Analysis";
import type {Session} from "../../../pages/Sessions";
import {ToastContext} from "../../../contexts/ToastContext/ToastContext.tsx";
import {createIndividualTaggedAction} from "./createIndividualTaggedAction.ts";

type ActionsModal = {
  groups: IndividualCatalogGroup[];
  session: Session;
  closeModal: () => void;
};

const ActionsModal = ({groups, closeModal, session}: ActionsModal) => {
  const {selectedPlayer, setIndividualActions, currentVideoTime, videoRef} = useContext(ActionsContext);
  const {error} = useContext(ToastContext);

  const handleActionClick = (action: IndividualCatalogAction, category: string) => {
    if (!videoRef.current) {
      error("O vídeo precisa estar definido");
      closeModal();
      return;
    }

    const actionTagged = createIndividualTaggedAction(
      action,
      category,
      session,
      selectedPlayer,
      currentVideoTime,
    );

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

        {groups.length === 0 ? (
          <div className={styles.emptyCatalog}>Nenhuma ação disponível.</div>
        ) : (
          <div className={styles.actionsListPadding}>
            {groups.map((group) => (
              <section className={styles.actionsType} key={group.key}>
                <span className={styles.actionsTitle}>{group.title}</span>
                <div className={styles.tagActions}>
                  {group.actions.map((action) => {
                    const isPositive = action.impact === 'POSITIVE';

                    return (
                      <button
                        type="button"
                        className={`${styles.action} ${isPositive ? styles.goodAction : styles.badAction}`}
                        title={action.key}
                        key={action.id}
                        onClick={() => handleActionClick(action, group.title)}
                      >
                        <FontAwesomeIcon icon={isPositive ? faBullseye : faMinus}/>
                        <span>{action.name}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionsModal;
