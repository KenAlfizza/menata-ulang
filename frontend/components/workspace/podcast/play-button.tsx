import { Play } from "lucide-react";

export function PlayButton() {
    return (
        <div
            data-play-button
            className="relative z-50 pointer-events-auto bg-green-300 p-1.5 rounded-full shadow-sm transition-all duration-200 hover:bg-green-400 hover:scale-110 hover:shadow-md hover:cursor-pointer"
        >
            <Play size={24} className="text-white" />
        </div>
    );
}