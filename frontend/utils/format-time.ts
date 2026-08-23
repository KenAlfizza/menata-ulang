export function formatTime(totalSeconds: number) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
    const safeSeconds = Math.round(totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatTimeSentence(totalSeconds: number) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0 sec";
    const safeSeconds = Math.round(totalSeconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    if (hours > 0) {
        return `${hours} h, ${minutes} min, ${seconds.toString().padStart(2, "0")} sec`
    }
    if (minutes > 0) {
        return `${minutes} min, ${seconds.toString().padStart(2, "0")} sec`
    }
    return `${seconds.toString().padStart(2, "0")} sec`;
}