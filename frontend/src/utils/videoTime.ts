const formatVideoTime = (timeInSeconds: number | string | null | undefined): string => {
  if (timeInSeconds === null || timeInSeconds === undefined || timeInSeconds === "") {
    return "00:00:00";
  }

  const numericTime = typeof timeInSeconds === "number"
    ? timeInSeconds
    : Number(timeInSeconds);

  if (!Number.isFinite(numericTime) || numericTime < 0) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(numericTime);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
};

export {formatVideoTime};
