export function formatTeamActionTime(time: string): string {
  const totalSeconds = Number(time);

  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return time;
  }

  const wholeSeconds = Math.floor(totalSeconds);
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const seconds = wholeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}
