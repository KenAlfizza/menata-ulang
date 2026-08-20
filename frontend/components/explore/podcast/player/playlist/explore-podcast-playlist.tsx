import { PageType } from "@/types/explore/explore.ts";
import { usePlayer } from "@/context/podcast/player-context.tsx";
import { 
    backgroundColorMap, 
} from "../explore-podcast-player-config.tsx";

import { ExplorePodcastPlaylistCard } from "./explore-podcast-playlist-card.tsx";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

export function ExplorePodcastPlaylist({page} : {page: PageType}) {
    const { isActive, isViewPlaylist, toggleViewPlaylist } = usePlayer();
    
    if (!isActive || !isViewPlaylist) return null;
    const handleClosePlaylist = () => {
        toggleViewPlaylist();
    }
    
    return (
        <div className={`rounded-lg flex flex-col gap-4 p-4 w-full h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-500 scrollbar-track-transparent ${backgroundColorMap[page]}`}>
            <div className="flex justify-between">
                <div className="flex flex-row items-center gap-1">
                    <X size={18} onClick={handleClosePlaylist} className="hover:cursor-pointer hover:scale-110 transition-scale duration-200"/>
                    <p className="text-lg">Playlist</p>
                </div>
                <Button className="bg-white/50 hover:bg-white/100 hover:cursor-pointer">
                    <p className="text-black">Clear</p>
                </Button>
            </div>
            <div className="flex flex-col gap-1">
                <ExplorePodcastPlaylistCard/>
                <ExplorePodcastPlaylistCard/>
                <ExplorePodcastPlaylistCard/>
                <ExplorePodcastPlaylistCard/>
                <ExplorePodcastPlaylistCard/>
            </div>
        </div>
    )
}