import type { MouseEvent } from "react";
import styles from "./AthleteRegistrationCard.module.scss";
import {useNavigate} from "react-router";
import {classNames} from "../../../utils/classNames.ts";

type AthleteRegistrationCardProps = {
  athlete: {
    id: string;
    name: string;
    age: number;
    position: string;
  };
  onEdit: (event: MouseEvent<HTMLButtonElement>) => void;
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void;
};

const AthleteRegistrationCard = ({
  athlete,
  onEdit,
  onDelete,
}: AthleteRegistrationCardProps) => {
  const navigate = useNavigate();

  return (
    <article
      className={classNames([styles.card, styles.interactive])}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/player/${athlete.id}`)}
    >
      <div className={styles.topRow}>
        <span className={styles.position}>{athlete.position}</span>
        <span className={styles.age}>{athlete.age} anos</span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{athlete.name}</h3>
      </div>

      <div className={styles.actions}>
        <button className={styles.secondaryAction} type="button" onClick={onEdit}>
          Editar
        </button>
        <button className={styles.dangerAction} type="button" onClick={onDelete}>
          Excluir
        </button>
      </div>
    </article>
  );
};

export default AthleteRegistrationCard;
