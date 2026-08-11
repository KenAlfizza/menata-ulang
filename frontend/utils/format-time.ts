export function formatTime(totalSeconds: number) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
    const safeSeconds = Math.round(totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}