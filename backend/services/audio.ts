import { join } from "path";

/**
 * Executes ffprobe via Deno to get the duration of a media file.
 * Ffmpeg/ffprobe must be installed on the hosting system.
 * 
 * @param filePath The corresponding relative storage path or file path
 * @param uploadDir The base upload directory (defaults to "storage")
 * @returns A promise that resolves to the duration of the media file in seconds, or 0 if it fails.
 */
export const getAudioDuration = async (filePath: string, uploadDir: string = "storage"): Promise<number> => {
    try {
        const fullPath = join(uploadDir, filePath);
        const command = new Deno.Command("ffprobe", {
            args: [
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                fullPath,
            ],
            stdout: "piped",
            stderr: "piped",
        });

        const { stdout } = await command.output();
        const output = JSON.parse(new TextDecoder().decode(stdout));

        const duration = parseFloat(output?.format?.duration);
        return isNaN(duration) ? 0 : Math.round(duration);
    } catch (error) {
        console.warn("Could not read audio duration, defaulting to 0", error);
        return 0;
    }
}