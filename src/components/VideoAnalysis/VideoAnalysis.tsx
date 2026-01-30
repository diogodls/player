import styles from "./VideoAnalysis.module.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUpload, faPlay, faTrash} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const VideoAnalysis = () =>{

  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleRemoveVideo = () => {
    setVideoUrl(null);
  };

  return(
    <div className={styles.screen}>
      <div className={styles.above}>
        <span className={styles.text}>
          <FontAwesomeIcon className={styles.icon} icon={faPlay}/>
          Análise de Vídeo
        </span>
        <label className={styles.button}>
          <FontAwesomeIcon icon={faUpload}/>
          Upload Vídeo
          <input
            type="file"
            accept="video/*"
            hidden
            onChange={handleUpload}
          />
        </label>

        {videoUrl && (
          <button
            className={styles.removeButton}
            onClick={handleRemoveVideo}
          >
            <FontAwesomeIcon icon={faTrash}/>
            Excluir vídeo
          </button>
        )}
      </div>

      {videoUrl ? (
          <video
            className={styles.video}
            src={videoUrl}
            controls
          />
        ) : (
          <div className={styles.emptyState}>
            <FontAwesomeIcon
              icon={faUpload}
              className={styles.emptyIcon}
            />
            <span className={styles.title}>Nenhum vídeo carregado</span>
            <span className={styles.subtitle}>Use o botão acima para fazer upload</span>
          </div>
      )}
    </div>
  )
}

export default VideoAnalysis;