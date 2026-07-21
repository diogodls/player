export const extractYoutubeVideoId = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url.trim());
    const host = parsedUrl.hostname.replace(/^www\./, "");
    let videoId: string | null = null;

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsedUrl.pathname === "/watch") {
        videoId = parsedUrl.searchParams.get("v");
      } else if (parsedUrl.pathname.startsWith("/embed/")) {
        videoId = parsedUrl.pathname.split("/")[2] ?? null;
      }
    }

    if (host === "youtu.be") {
      videoId = parsedUrl.pathname.split("/")[1] ?? null;
    }

    if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      return null;
    }

    return videoId;
  } catch {
    return null;
  }
};
