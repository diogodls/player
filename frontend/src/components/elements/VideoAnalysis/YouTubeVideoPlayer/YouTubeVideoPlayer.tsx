import {useCallback, useEffect, useRef, useState} from "react";
import styles from "./YouTubeVideoPlayer.module.scss";

type YouTubePlayer = {
  getCurrentTime: () => number;
  getPlayerState: () => number;
  pauseVideo: () => void;
  playVideo: () => void;
};

type YouTubePlayerReadyEvent = {
  target: YouTubePlayer;
};

type YouTubePlayerErrorEvent = {
  target: YouTubePlayer;
};

type YouTubeWindow = Window & {
  YT?: {
    Player: new (
      element: HTMLIFrameElement,
      options: {
        events: {
          onReady: (event: YouTubePlayerReadyEvent) => void;
          onError: (event: YouTubePlayerErrorEvent) => void;
        };
      }
    ) => YouTubePlayer;
    PlayerState: {
      PLAYING: number;
    };
  };
  onYouTubeIframeAPIReady?: () => void;
};

type YouTubeVideoPlayerProps = {
  videoId: string;
  isTagging: boolean;
  onReadyChange: (isReady: boolean) => void;
  onTimeChange: (timeInSeconds: number) => void;
};

const YOUTUBE_API_SCRIPT_ID = "youtube-iframe-api";

const loadYouTubeApi = (callback: () => void) => {
  const youtubeWindow = window as YouTubeWindow;

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

const YouTubeVideoPlayer = ({
  videoId,
  isTagging,
  onReadyChange,
  onTimeChange,
}: YouTubeVideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<number | null>(null);
  const playerGenerationRef = useRef(0);
  const activeVideoIdRef = useRef<string | null>(null);
  const isTaggingRef = useRef(isTagging);
  const wasPlayingBeforeTaggingRef = useRef(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const stopTimer = useCallback(() => {
    if (!intervalRef.current) return;

    window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const markPlayerUnavailable = useCallback(() => {
    stopTimer();
    setIsPlayerReady(false);
    onReadyChange(false);
  }, [onReadyChange, stopTimer]);

  const syncTime = useCallback((player: YouTubePlayer) => {
    try {
      const currentTime = player.getCurrentTime();
      if (!Number.isFinite(currentTime) || currentTime < 0) return false;

      onTimeChange(currentTime);
      return true;
    } catch {
      return false;
    }
  }, [onTimeChange]);

  const resetPlayerState = useCallback(() => {
    playerGenerationRef.current += 1;
    activeVideoIdRef.current = null;
    stopTimer();

    const player = playerRef.current;
    playerRef.current = null;

    setIsPlayerReady(false);
    onReadyChange(false);
    onTimeChange(0);
    wasPlayingBeforeTaggingRef.current = false;

    if (!player) return;

    try {
      player.pauseVideo();
    } catch {
      // The iframe may already have been removed while React is swapping sources.
    }
  }, [onReadyChange, onTimeChange, stopTimer]);

  const startTimeTracking = useCallback((
    player: YouTubePlayer,
    generation: number,
    activeVideoId: string,
  ) => {
    stopTimer();

    intervalRef.current = window.setInterval(() => {
      const isCurrentPlayer =
        playerGenerationRef.current === generation &&
        activeVideoIdRef.current === activeVideoId &&
        playerRef.current === player;

      if (!isCurrentPlayer) {
        stopTimer();
        return;
      }

      if (!syncTime(player)) {
        markPlayerUnavailable();
      }
    }, 500);
  }, [markPlayerUnavailable, stopTimer, syncTime]);

  useEffect(() => {
    isTaggingRef.current = isTagging;
  }, [isTagging]);

  useEffect(() => {
    if (!iframeRef.current) return;

    let isActive = true;
    const generation = playerGenerationRef.current + 1;
    playerGenerationRef.current = generation;
    activeVideoIdRef.current = videoId;

    loadYouTubeApi(() => {
      const iframe = iframeRef.current;
      const isCurrentVideo = () =>
        isActive &&
        playerGenerationRef.current === generation &&
        activeVideoIdRef.current === videoId;

      if (!isCurrentVideo() || !iframe) return;

      try {
        playerRef.current = new (window as YouTubeWindow).YT!.Player(iframe, {
          events: {
            onReady: (event) => {
              if (!isCurrentVideo()) {
                try {
                  event.target.pauseVideo();
                } catch {
                  // A stale player may already be unavailable.
                }
                return;
              }

              playerRef.current = event.target;
              if (!syncTime(event.target)) {
                markPlayerUnavailable();
                return;
              }

              setIsPlayerReady(true);
              onReadyChange(true);
              startTimeTracking(event.target, generation, videoId);

              if (isTaggingRef.current) {
                try {
                  event.target.pauseVideo();
                } catch {
                  markPlayerUnavailable();
                }
              }
            },
            onError: (event) => {
              if (!isCurrentVideo() || playerRef.current !== event.target) return;

              markPlayerUnavailable();
              onTimeChange(0);
            },
          },
        });
      } catch {
        if (!isCurrentVideo()) return;

        playerRef.current = null;
        markPlayerUnavailable();
        onTimeChange(0);
      }
    });

    return () => {
      isActive = false;
      if (playerGenerationRef.current === generation) {
        resetPlayerState();
      }
    };
  }, [markPlayerUnavailable, onReadyChange, onTimeChange, resetPlayerState, startTimeTracking, syncTime, videoId]);

  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;

    const youtubeWindow = window as YouTubeWindow;
    const player = playerRef.current;
    try {
      if (isTagging) {
        if (!syncTime(player)) {
          queueMicrotask(() => {
            if (playerRef.current === player) markPlayerUnavailable();
          });
          return;
        }

        wasPlayingBeforeTaggingRef.current =
          player.getPlayerState() === youtubeWindow.YT?.PlayerState.PLAYING;
        player.pauseVideo();
        return;
      }

      if (wasPlayingBeforeTaggingRef.current) {
        player.playVideo();
        wasPlayingBeforeTaggingRef.current = false;
      }
    } catch {
      queueMicrotask(() => {
        if (playerRef.current === player) markPlayerUnavailable();
      });
    }
  }, [isPlayerReady, isTagging, markPlayerUnavailable, syncTime]);

  return (
    <iframe
      ref={iframeRef}
      className={styles.video}
      src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
};

export default YouTubeVideoPlayer;
