import styles from "./VideoAnalysis.module.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpFromBracket, faLink, faPlay, faTrash, faUpload, faXmark} from "@fortawesome/free-solid-svg-icons";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {ActionsContext} from "../../../contexts/ActionsContext/ActionsContext.tsx";
import {extractYoutubeVideoId} from "../../../utils/youtube.ts";

type VideoSourceType = "file" | "youtube" | null;

type YoutubePlayer = {
  getCurrentTime: () => number;
  getPlayerState: () => number;
  pauseVideo: () => void;
  playVideo: () => void;
  destroy: () => void;
};

type YoutubeWindow = Window & {
  YT?: {
    Player: new (
      element: HTMLIFrameElement,
      options: { events: { onReady: () => void } }
    ) => YoutubePlayer;
    PlayerState: {
      PLAYING: number;
    };
  };
  onYouTubeIframeAPIReady?: () => void;
};

const YOUTUBE_API_SCRIPT_ID = "youtube-iframe-api";

const loadYoutubeApi = (callback: () => void) => {
  const youtubeWindow = window as YoutubeWindow;

  if (youtubeWindow.YT?.Player) {
    callback();
    return;
  }

  const previousReadyCallback = youtubeWindow.onYouTubeIframeAPIReady;
  youtubeWindow.onYouTubeIframeAPIReady = () => {
    previousReadyCallback?.();
    callback();
  };

  if (document.getElementById(YOUTUBE_API_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = YOUTUBE_API_SCRIPT_ID;
  script.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(script);
};

const VideoAnalysis = () => {
  const { setCurrentVideoTime, isTagging, videoRef, setIsVideoLoaded } = useContext(ActionsContext);

  const wasPlayingBeforeTaggingRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const youtubePlayerRef = useRef<YoutubePlayer | null>(null);
  const youtubeIntervalRef = useRef<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoSourceType, setVideoSourceType] = useState<VideoSourceType>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [modalYoutubeUrl, setModalYoutubeUrl] = useState("");
  const [modalYoutubeError, setModalYoutubeError] = useState("");

  const youtubeEmbedUrl = youtubeVideoId
    ? `https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1`
    : "";

  const hasValidLocalVideo = videoSourceType === "file" && Boolean(selectedFile) && Boolean(videoUrl);
  const hasValidYoutubeVideo = videoSourceType === "youtube" && Boolean(youtubeVideoId) && Boolean(youtubeEmbedUrl);

  const stopYoutubeTimer = useCallback(() => {
    if (!youtubeIntervalRef.current) return;

    window.clearInterval(youtubeIntervalRef.current);
    youtubeIntervalRef.current = null;
  }, []);

  const resetYoutubePlayer = useCallback(() => {
    stopYoutubeTimer();

    if (!youtubePlayerRef.current) return;

    try {
      youtubePlayerRef.current.pauseVideo();
    } catch {
      // The iframe may already be gone while React is swapping sources.
    } finally {
      youtubePlayerRef.current = null;
    }
  }, [stopYoutubeTimer]);

  const clearLocalVideo = useCallback(() => {
    setVideoUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });
  }, []);

  const clearVideo = useCallback(() => {
    resetYoutubePlayer();
    clearLocalVideo();
    setSelectedFile(null);
    setVideoSourceType(null);
    setYoutubeUrl("");
    setYoutubeVideoId(null);
    setModalYoutubeError("");
    setIsVideoLoaded(false);
    setCurrentVideoTime("0");
    wasPlayingBeforeTaggingRef.current = false;
  }, [clearLocalVideo, resetYoutubePlayer, setCurrentVideoTime, setIsVideoLoaded]);

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setModalYoutubeError("");
  };

  const openUploadModal = () => {
    setModalYoutubeUrl(videoSourceType === "youtube" ? youtubeUrl : "");
    setModalYoutubeError("");
    setIsUploadModalOpen(true);
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
    setIsVideoLoaded(true);
    closeUploadModal();
  };

  useEffect(() => {
    return () => {
      resetYoutubePlayer();
      clearLocalVideo();
    };
  }, [clearLocalVideo, resetYoutubePlayer]);

  useEffect(() => {
    setIsVideoLoaded(hasValidLocalVideo || hasValidYoutubeVideo);
  }, [hasValidLocalVideo, hasValidYoutubeVideo, setIsVideoLoaded]);

  useEffect(() => {
    if (!hasValidYoutubeVideo || !youtubeVideoId || !iframeRef.current) return;

    let isActive = true;

    loadYoutubeApi(() => {
      if (!isActive || !iframeRef.current) return;

      resetYoutubePlayer();
      youtubePlayerRef.current = new (window as YoutubeWindow).YT!.Player(iframeRef.current, {
        events: {
          onReady: () => {
            stopYoutubeTimer();

            youtubeIntervalRef.current = window.setInterval(() => {
              const currentTime = youtubePlayerRef.current?.getCurrentTime() ?? 0;
              setCurrentVideoTime(currentTime.toFixed(2));
            }, 500);
          },
        },
      });
    });

    return () => {
      isActive = false;
      resetYoutubePlayer();
    };
  }, [hasValidYoutubeVideo, resetYoutubePlayer, setCurrentVideoTime, stopYoutubeTimer, youtubeVideoId]);

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

    if (hasValidYoutubeVideo && youtubePlayerRef.current) {
      const youtubeWindow = window as YoutubeWindow;
      if (isTagging) {
        wasPlayingBeforeTaggingRef.current =
          youtubePlayerRef.current.getPlayerState() === youtubeWindow.YT?.PlayerState.PLAYING;
        youtubePlayerRef.current.pauseVideo();
        return;
      }

      if (wasPlayingBeforeTaggingRef.current) {
        youtubePlayerRef.current.playVideo();
        wasPlayingBeforeTaggingRef.current = false;
      }
    }
  }, [hasValidLocalVideo, hasValidYoutubeVideo, isTagging, videoRef]);

  return (
    <div className={styles.screen}>
      <div className={styles.above}>
        <span className={styles.text}>
          <FontAwesomeIcon className={styles.icon} icon={faPlay}/>
          Análise de Vídeo
        </span>
        <div className={styles.actions}>
          <button className={styles.button} type="button" onClick={openUploadModal}>
            <FontAwesomeIcon icon={faUpload}/>
            Upload do vídeo
          </button>

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
      ) : hasValidYoutubeVideo ? (
        <iframe
          ref={iframeRef}
          className={styles.video}
          src={youtubeEmbedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
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

            <label className={styles.computerButton}>
              <FontAwesomeIcon icon={faUpload}/>
              Selecionar do computador

              <input
                type="file"
                accept="video/*"
                hidden
                onChange={handleUpload}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoAnalysis;
