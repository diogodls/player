import styles from "./VideoAnalysis.module.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUpload, faPlay, faTrash} from "@fortawesome/free-solid-svg-icons";
import {useContext, useEffect, useRef, useState} from "react";
import {ActionsContext} from "../../../contexts/ActionsContext/ActionsContext.tsx";

const VideoAnalysis = () => {
  const { setCurrentVideoTime, isTagging } = useContext(ActionsContext);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    setCurrentVideoTime(videoRef.current.currentTime.toFixed(2));
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleRemoveVideo = () => {
    setVideoUrl(null);
  };

  useEffect(() => {
    console.log('era pra chegar aq');
    if (isTagging) videoRef.current?.pause();
    videoRef.current?.play();
  }, [isTagging]);

  return (
    <div className={styles.screen}>
      <div className={styles.above}>
        <span className={styles.text}>
          <FontAwesomeIcon className={styles.icon} icon={faPlay}/>
          Análise de Vídeo
        </span>
        <div className={styles.actions}>
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
      </div>

      {videoUrl ? (
          <video
            ref={videoRef}
            onTimeUpdate={handleTimeUpdate}
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