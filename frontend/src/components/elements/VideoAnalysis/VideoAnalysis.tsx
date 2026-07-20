import styles from "./VideoAnalysis.module.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpFromBracket, faLink, faPlay, faTrash, faUpload, faXmark} from "@fortawesome/free-solid-svg-icons";
import {faYoutube} from "@fortawesome/free-brands-svg-icons";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {ActionsContext} from "../../../contexts/ActionsContext/ActionsContext.tsx";
import {extractYoutubeVideoId} from "../../../utils/youtube.ts";
import YouTubeVideoPlayer from "./YouTubeVideoPlayer/YouTubeVideoPlayer.tsx";

type VideoSourceType = "file" | "youtube" | null;

const VideoAnalysis = () => {
  const { setCurrentVideoTime, isTagging, videoRef, setIsVideoLoaded } = useContext(ActionsContext);

  const wasPlayingBeforeTaggingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoSourceType, setVideoSourceType] = useState<VideoSourceType>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [modalYoutubeUrl, setModalYoutubeUrl] = useState("");
  const [modalYoutubeError, setModalYoutubeError] = useState("");

  const hasValidLocalVideo = videoSourceType === "file" && Boolean(selectedFile) && Boolean(videoUrl);
  const hasValidYoutubeVideo = videoSourceType === "youtube" && Boolean(youtubeVideoId);
  const hasSelectedVideo = hasValidLocalVideo || hasValidYoutubeVideo;

  const clearLocalVideo = useCallback(() => {
    setVideoUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });
  }, []);

  const clearVideo = useCallback(() => {
    clearLocalVideo();
    setSelectedFile(null);
    setVideoSourceType(null);
    setYoutubeUrl("");
    setYoutubeVideoId(null);
    setModalYoutubeError("");
    setIsVideoLoaded(false);
    setCurrentVideoTime("0");
    wasPlayingBeforeTaggingRef.current = false;
  }, [clearLocalVideo, setCurrentVideoTime, setIsVideoLoaded]);

  const handleYouTubeReadyChange = useCallback((isReady: boolean) => {
    setIsVideoLoaded(isReady);
  }, [setIsVideoLoaded]);

  const handleYouTubeTimeChange = useCallback((timeInSeconds: number) => {
    setCurrentVideoTime(timeInSeconds.toFixed(2));
  }, [setCurrentVideoTime]);

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setModalYoutubeError("");
  };

  const openUploadModal = () => {
    setModalYoutubeUrl(videoSourceType === "youtube" ? youtubeUrl : "");
    setModalYoutubeError("");
    setIsUploadModalOpen(true);
  };

  const openFileExplorer = () => {
    fileInputRef.current?.click();
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    setCurrentVideoTime(videoRef.current.currentTime.toFixed(2));
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    clearVideo();
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoSourceType("file");
    setIsVideoLoaded(true);
    closeUploadModal();
  };

  const handleYoutubeUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextUrl = event.target.value;
    setModalYoutubeUrl(nextUrl);
    setModalYoutubeError("");
  };

  const handleYoutubeSubmit = () => {
    const videoId = extractYoutubeVideoId(modalYoutubeUrl);
    if (!videoId) {
      setModalYoutubeError("Informe uma URL válida do YouTube.");
      return;
    }

    const nextYoutubeUrl = modalYoutubeUrl.trim();

    clearVideo();
    setYoutubeUrl(nextYoutubeUrl);
    setYoutubeVideoId(videoId);
    setVideoSourceType("youtube");
    closeUploadModal();
  };

  useEffect(() => {
    return () => {
      clearLocalVideo();
    };
  }, [clearLocalVideo]);

  useEffect(() => {
    setIsVideoLoaded(hasValidLocalVideo);
  }, [hasValidLocalVideo, setIsVideoLoaded]);

  useEffect(() => {
    if (hasValidLocalVideo && videoRef.current) {
      if (isTagging) {
        wasPlayingBeforeTaggingRef.current = !videoRef.current.paused;
        videoRef.current.pause();
        return;
      }

      if (wasPlayingBeforeTaggingRef.current) {
        const playPromise = videoRef.current.play();
        if (playPromise) {
          void playPromise.catch(() => {
            // Ignore autoplay/policy errors when resuming playback.
          });
        }
        wasPlayingBeforeTaggingRef.current = false;
      }
    }

  }, [hasValidLocalVideo, isTagging, videoRef]);

  return (
    <div className={styles.screen}>
      <div className={styles.above}>
        <span className={styles.text}>
          <FontAwesomeIcon className={styles.icon} icon={faPlay}/>
          Análise de Vídeo
        </span>
        <div className={styles.actions}>
          {!hasSelectedVideo && (
            <>
              <button className={styles.youtubeButton} type="button" onClick={openUploadModal}>
                <FontAwesomeIcon icon={faYoutube}/>
                Vídeo do YouTube
              </button>

              <button className={styles.button} type="button" onClick={openFileExplorer}>
                <FontAwesomeIcon icon={faUpload}/>
                Selecionar vídeo do PC
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                hidden
                onChange={handleUpload}
              />
            </>
          )}

          {videoSourceType && (
            <button
              className={styles.removeButton}
              type="button"
              onClick={clearVideo}
            >
              <FontAwesomeIcon icon={faTrash}/>
              Excluir vídeo
            </button>
          )}
        </div>
      </div>

      {hasValidLocalVideo && videoUrl ? (
        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          className={styles.video}
          src={videoUrl}
          controls
        />
      ) : hasValidYoutubeVideo && youtubeVideoId ? (
        <YouTubeVideoPlayer
          videoId={youtubeVideoId}
          isTagging={isTagging}
          onReadyChange={handleYouTubeReadyChange}
          onTimeChange={handleYouTubeTimeChange}
        />
      ) : (
        <div className={styles.emptyState}>
          <FontAwesomeIcon
            icon={faUpload}
            className={styles.emptyIcon}
          />
          <span className={styles.title}>Nenhum vídeo carregado</span>
          <span className={styles.subtitle}>Use o botão acima para escolher um arquivo ou link do YouTube</span>
        </div>
      )}

      {isUploadModalOpen && (
        <div className={styles.modalOverlay} onClick={closeUploadModal}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>Escolher vídeo</span>
              <button
                className={styles.closeButton}
                type="button"
                onClick={closeUploadModal}
                aria-label="Fechar modal"
              >
                <FontAwesomeIcon icon={faXmark}/>
              </button>
            </div>

            <div className={styles.youtubeRow}>
              <div className={styles.youtubeField}>
                <FontAwesomeIcon icon={faLink} className={styles.youtubeIcon}/>
                <input
                  type="url"
                  value={modalYoutubeUrl}
                  onChange={handleYoutubeUrlChange}
                  placeholder="Cole um link do YouTube"
                  aria-label="Link do YouTube"
                  autoFocus
                />
              </div>
              <button
                className={styles.youtubeSubmitButton}
                type="button"
                onClick={handleYoutubeSubmit}
                aria-label="Carregar vídeo do YouTube"
                title="Carregar vídeo do YouTube"
              >
                <FontAwesomeIcon icon={faArrowUpFromBracket}/>
              </button>
            </div>
            {modalYoutubeError && <span className={styles.inputError}>{modalYoutubeError}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoAnalysis;
