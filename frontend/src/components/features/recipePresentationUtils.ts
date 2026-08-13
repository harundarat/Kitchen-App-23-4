export function getYouTubeEmbedUrl(video: string): string | null {
  const match = video.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([a-zA-Z0-9_-]+)/,
  );
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export function formatRecipeTime(totalTime: string): string {
  const minutes = Number(totalTime);
  if (!Number.isFinite(minutes)) return totalTime;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours && remainingMinutes) return `${hours} j ${remainingMinutes} m`;
  if (hours) return `${hours} j`;
  return `${remainingMinutes} m`;
}
