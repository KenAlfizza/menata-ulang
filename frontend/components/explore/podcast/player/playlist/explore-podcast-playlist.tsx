"use client";

import { PageType } from "@/types/explore/explore.ts";
import { usePlayer } from "@/context/podcast/player-context.tsx";
import { 
    backgroundColorMap, 
} from "../explore-podcast-player-config.tsx";

import { ExplorePodcastPlaylistCard } from "./explore-podcast-playlist-card.tsx";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

export function ExplorePodcastPlaylist({page} : {page: PageType}) {
    const { 
        isActive, 
        isViewPlaylist, 
        toggleViewPlaylist, 
        tracks, 
        currentIndex, 
        playPlaylist, 
        clearPlaylist,
        hidePlayer,
    } = usePlayer();
    
    if (!isActive || !isViewPlaylist || hidePlayer) return null;
    
    const handleClosePlaylist = () => {
        toggleViewPlaylist();
    }

    const handleClearPlaylist = () => {
        clearPlaylist();
    }
    
    return (
        <div className={`rounded-lg flex flex-col gap-4 p-4 w-full h-70 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-500 scrollbar-track-transparent ${backgroundColorMap[page]}`}>
            <div className="flex justify-between">
                <div className="flex flex-row items-center gap-1">
                    <X size={18} onClick={handleClosePlaylist} className="hover:cursor-pointer hover:scale-110 transition-scale duration-200"/>
                    <p className="text-lg">Playlist ({tracks.length})</p>
                </div>
                <Button 
                    onClick={handleClearPlaylist} 
                    className="bg-white/50 hover:bg-white/100 hover:cursor-pointer"
                >
                    <p className="text-black">Clear</p>
                </Button>
            </div>
            <div className="flex flex-col gap-1">
                {tracks.length === 0 ? (
                    <p className="text-sm text-zinc-400 text-center py-4">No tracks in queue</p>
                ) : (
                    tracks.map((track, index) => (
                        <ExplorePodcastPlaylistCard
                            key={`${track.id}-${index}`}
                            track={track}
                            isCurrent={index === currentIndex}
                            onClick={() => playPlaylist(index)}
                            page={page}
                        />
                    ))
                )}
            </div>
        </div>
    )
}