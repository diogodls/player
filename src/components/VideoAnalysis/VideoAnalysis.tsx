import styles from "./VideoAnalysis.module.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUpload} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";


const VideoAnalysis = () =>{

  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  return(
    <div className={styles.screen}>
      <div className={styles.above}>
        <span> Análise de Vídeo </span>
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

      </div>
      <video
        className={styles.video}
        src={videoUrl ?? undefined}
        controls
      ></video>
      <div>

      </div>
    </div>
  )
}

export default VideoAnalysis;