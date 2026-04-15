import { useState } from "react";
import styles from "./SessionView.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPeopleGroup, faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router";
import SessionAnalysisDetails from "../../components/elements/SessionDetails/SessionDetails.tsx";
import SessionAnalysisSummary from "../../components/SessionDetails/SessionSummary/SessionSummary.tsx";
import ActionLog from "../../components/SessionDetails/ActionLog/ActionLog";
import { useApi } from "../../hooks/useApi";
import type {SessionViewData, SessionViewRecordData, ViewMode} from "./index";

const SessionView = () => {
  const navigate = useNavigate();
  const { id: sessionId } = useParams<{ id: string }>();
  const { data: detailsData } = useApi<SessionViewRecordData>("session-view");
  const [viewMode, setViewMode] = useState<ViewMode>("individual");

  const sessionView: SessionViewData | undefined = sessionId ? detailsData?.[sessionId] : undefined; //todo: remover aqui quando fizer o back
  console.log(sessionId, sessionView, detailsData)
  if (!sessionView) throw Error('sessão não encontrada');

  const activeView = viewMode === "individual" ? sessionView?.individual : sessionView?.team;

  return (
    <div className={styles.container}>
      <div className={styles.contentWrap}>
        <header className={styles.sessionHeader}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={() => navigate("/session-screen")}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>

            <div className={styles.headerText}>
              <span className={styles.eyebrow}>Treino/Jogo selecionado</span>
              <h1 className={styles.title}>Detalhes da sessao</h1>
              <p className={styles.subtitle}>Acesse o fluxo de analise e acompanhe os dados desta sessao.</p>
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
                <strong>Fazer analise individual</strong>
              </div>
            </button>

            <button className={`${styles.actionButton} ${styles.teamButton}`}>
              <div className={styles.actionIconWrap}>
                <FontAwesomeIcon icon={faPeopleGroup} />
              </div>

              <div className={styles.actionText}>
                <strong>Fazer analise de equipe</strong>
              </div>
            </button>
          </div>
        </header>

        <SessionAnalysisDetails session={sessionView} />

        <section className={styles.viewerCard}>
          <div className={styles.viewerSwitch}>
            <button
              type="button"
              className={`${styles.switchButton} ${viewMode === "individual" ? styles.switchActive : ""}`}
              onClick={() => setViewMode("individual")}
            >
              Ver analise individual
            </button>
            <button
              type="button"
              className={`${styles.switchButton} ${viewMode === "team" ? styles.switchActive : ""}`}
              onClick={() => setViewMode("team")}
            >
              Ver analise de equipe
            </button>
          </div>

          {activeView && (
            <SessionAnalysisSummary
              positives={activeView.summary.positives}
              negatives={activeView.summary.negatives}
              positivePercentage={activeView.summary.positivePercentage}
              negativePercentage={activeView.summary.negativePercentage}
            />
          )}

          <h3 className={styles.sectionTitle}>
            {viewMode === "individual" ? "Acoes Individuais" : "Acoes da Equipe"}
          </h3>

          <ActionLog
            viewMode={viewMode}
            view={activeView}
            athleteOptions={sessionView?.individual.athleteOptions ?? []}
          />
        </section>
      </div>
    </div>
  );
};

export default SessionView;
