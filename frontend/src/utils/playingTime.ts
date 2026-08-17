export function formatPlayingTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function parsePlayingTime(value: string) {
  const match = /^(\d+):([0-5]\d)$/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function displayedPlayingSeconds(
  totalSeconds: number,
  activeSince: string | null,
  isActive: boolean,
  nowMs = Date.now(),
) {
  if (!isActive || !activeSince) return totalSeconds;
  const activeSinceMs = Date.parse(activeSince);
  if (!Number.isFinite(activeSinceMs)) return totalSeconds;
  return (
    totalSeconds + Math.max(0, Math.floor((nowMs - activeSinceMs) / 1000))
  );
}
