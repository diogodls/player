import styles from "./ActionsList.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faClock,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import type { CatalogAction, CatalogGroup } from "../../../pages/Analysis";

type ActionsList = {
  groups: CatalogGroup[];
  handleActionClick: (action: CatalogAction, category: string) => void;
  className?: string;
};

const ActionsList = ({ groups, handleActionClick, className }: ActionsList) => {
  return (
    <div className={`${styles.actions} ${className}`}>
      {groups.map((group) => (
        <div className={styles.actionsType} key={group.key}>
          <span className={styles.actionsTitle}>{group.title}</span>
          <div className={styles.tagActions}>
            {group.actions.map((action) => {
              const isPositive = action.impact === "POSITIVE";
              const isNeutral = action.impact === "NEUTRAL";
              return (
                <button
                  type={"button"}
                  className={`${styles.action} ${
                    isNeutral
                      ? styles.neutralAction
                      : isPositive
                        ? styles.goodAction
                        : styles.badAction
                  }`}
                  title={action.key}
                  key={action.id}
                  onClick={() => handleActionClick(action, group.title)}
                >
                  <FontAwesomeIcon
                    icon={
                      isNeutral ? faClock : isPositive ? faBullseye : faMinus
                    }
                  />
                  <span>{action.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActionsList;
