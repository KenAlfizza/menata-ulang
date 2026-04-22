/**
 * Ffprobe to get the duration of media files uisng ffmepg
 * Ffmpeg must be intalled on the hosting system
 * 
 * @param filePath The corresponding file path
 * 
 * Behaviour: Executes ffprobe command with deno 
 * and get the duration from the command output
 * 
 * Returns: duration of the media file
 */
export const getAudioDuration = async (filePath: string) => {
    const command = new Deno.Command("ffprobe", {
        args: [
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            filePath,
        ],
        stdout: "piped",
        stderr: "piped",
    });

    const { stdout } = await command.output();
    const output = JSON.parse(new TextDecoder().decode(stdout));

    return parseFloat(output.format.duration); // Duration in seconds
}