import type { KeyboardEvent, MouseEvent } from "react";
import styles from "./AthleteRegistrationCard.module.scss";

type AthleteRegistrationCardProps = {
  athlete: {
    id: string;
    name: string;
    age: number;
    position: string;
    isPersisted: boolean;
  };
  onOpen?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  onEdit: (event: MouseEvent<HTMLButtonElement>) => void;
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void;
};

const AthleteRegistrationCard = ({
  athlete,
  onOpen,
  onKeyDown,
  onEdit,
  onDelete,
}: AthleteRegistrationCardProps) => {
  const isInteractive = athlete.isPersisted && (onOpen || onKeyDown);
  const cardClassName = [
    styles.card,
    athlete.isPersisted ? "" : styles.draft,
    isInteractive ? styles.interactive : "",
  ].filter(Boolean).join(" ");

  const content = (
    <>
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
    </>
  );

  if (isInteractive) {
    return (
      <article
        className={cardClassName}
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={onKeyDown}
      >
        {content}
      </article>
    );
  }

  return <article className={cardClassName}>{content}</article>;
};

export default AthleteRegistrationCard;
