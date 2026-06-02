import { useState } from "react";
import styles from "./SessionView.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPeopleGroup, faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router";
import SessionDetails from "../../components/elements/SessionDetails/SessionDetails.tsx";
import SessionSummary from "../../components/SessionDetails/SessionSummary/SessionSummary.tsx";
import SessionActions from "../../components/SessionDetails/SessionActions/SessionActions.tsx";
import { useApi } from "../../hooks/useApi";
import type {SessionViewRecordData, SessionViewData, ViewMode} from "./index";

const SessionView = () => {
  const navigate = useNavigate();
  const { id: sessionId } = useParams<{ id: string }>();
  const { data: detailsData, isLoading: isSessionLoading } = useApi<SessionViewRecordData>("session-view");
  const [viewMode, setViewMode] = useState<ViewMode>("individual");

  const sessionView: SessionViewData | undefined = sessionId ? detailsData?.[sessionId] : undefined; //todo: remover aqui quando fizer o back
  const activeView = sessionView?.analysis[viewMode];

  if (isSessionLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrap}>Carregando sessão...</div>
      </div>
    );
  }

  if (!sessionView || !activeView) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrap}>Sessão não encontrada.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrap}>
        <header className={styles.sessionHeader}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={() => navigate("/sessions")}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>

            <div className={styles.headerText}>
              <span className={styles.eyebrow}>Treino/Jogo selecionado</span>
              <h1 className={styles.title}>Detalhes da Sessão</h1>
              <p className={styles.subtitle}>Acesse o fluxo de análise e acompanhe os dados desta sessão.</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              className={`${styles.actionButton} ${styles.individualButton}`}
              onClick={() => navigate(`/sessions/${sessionId}/analysis/individual`)}
            >
              <div className={styles.actionIconWrap}>
                <FontAwesomeIcon icon={faUser} />
              </div>

              <div className={styles.actionText}>
                <strong>Fazer análise individual</strong>
              </div>
            </button>

            <button
              className={`${styles.actionButton} ${styles.teamButton}`}
              onClick={() => navigate(`/sessions/${sessionId}/analysis/team`)}
            >
              <div className={styles.actionIconWrap}>
                <FontAwesomeIcon icon={faPeopleGroup} />
              </div>

              <div className={styles.actionText}>
                <strong>Fazer análise de equipe</strong>
              </div>
            </button>
          </div>
        </header>

        <SessionDetails session={sessionView.session} />

        <section className={styles.viewerCard}>
          <div className={styles.viewerSwitch}>
            <button
              type="button"
              className={`${styles.switchButton} ${viewMode === "individual" ? styles.switchActive : ""}`}
              onClick={() => setViewMode("individual")}
            >
              Ver análise individual
            </button>
            <button
              type="button"
              className={`${styles.switchButton} ${viewMode === "team" ? styles.switchActive : ""}`}
              onClick={() => setViewMode("team")}
            >
              Ver análise de equipe
            </button>
          </div>

          {activeView && (
            <SessionSummary
              positives={activeView.summary.positives}
              negatives={activeView.summary.negatives}
              positivePercentage={activeView.summary.positivePercentage}
              negativePercentage={activeView.summary.negativePercentage}
            />
          )}

          <h3 className={styles.sectionTitle}>
            {viewMode === "individual" ? "Ações Individuais" : "Ações da Equipe"}
          </h3>

          <SessionActions
            viewMode={viewMode}
            view={activeView}
          />
        </section>
      </div>
    </div>
  );
};

export default SessionView;