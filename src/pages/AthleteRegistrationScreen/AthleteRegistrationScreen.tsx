import { useState } from "react";
import AthleteForm from "../../components/AthleteRegistration/AthleteForm/AthleteForm";
import { PLAYERS_POSITIONS } from "../../constants/players";
import styles from "./AthleteRegistrationScreen.module.scss";

type Athlete = {
  id: string;
  name: string;
  age: number;
  position: (typeof PLAYERS_POSITIONS)[number];
};

const AthleteRegistrationScreen = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleCreateAthlete = (values: Omit<Athlete, "id">) => {
    setAthletes((currentAthletes) => [
      {
        id: crypto.randomUUID(),
        ...values,
      },
      ...currentAthletes,
    ]);
    setIsModalOpen(false);
  };

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Cadastro</span>
            <h1 className={styles.title}>Atletas</h1>
            <p className={styles.description}>
              Cadastre novos atletas
            </p>
          </div>

          <button className={styles.openButton} type="button" onClick={() => setIsModalOpen(true)}>
            Novo atleta
          </button>
        </div>

        {athletes.length === 0 ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>Nenhum atleta cadastrado</h2>
            <p className={styles.emptyDescription}>
              Abra o modal para salvar o primeiro atleta e comecar a montar a lista local.
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {athletes.map((athlete) => (
              <article key={athlete.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h2 className={styles.cardTitle}>{athlete.name}</h2>
                    <span className={styles.cardPosition}>{athlete.position}</span>
                  </div>
                  <span className={styles.cardAge}>{athlete.age} anos</span>
                </div>
                <p className={styles.cardMeta}>ID local: {athlete.id}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      <AthleteForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAthlete}
      />
    </section>
  );
};

export default AthleteRegistrationScreen;
