"use client";

import { PageType } from "@/types/explore/explore.ts";
import { usePlayer } from "@/context/podcast/player-context.tsx";
import { 
    backgroundColorMap, 
} from "../explore-podcast-player-config.tsx";

import { ExplorePodcastPlaylistCard } from "./explore-podcast-playlist-card.tsx";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useIsMobile } from "@/hooks/use-mobile.ts";

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
    
    const isMobile = useIsMobile();
    // CHANGED: Use "flex-1" instead of "h-full" so it only takes remaining space
    const listHeight = isMobile ? "flex-1" : "h-70"; 
    
    if (!isActive || hidePlayer) return null;

    const isOpen = isViewPlaylist;
    
    const handleClosePlaylist = () => {
        toggleViewPlaylist();
    }

    const handleClearPlaylist = () => {
        clearPlaylist();
    }
    
    return (
        <div 
            className={`w-full rounded-lg bg-white/80 transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-y-0 pointer-events-auto mb-18" : "translate-y-full pointer-events-none"
            }`}
            aria-hidden={!isOpen}
        >
            <div className={`flex flex-col overflow-hidden rounded-lg ${backgroundColorMap[page]} h-full`}>
                
                {/* Header */}
                <div className="flex justify-between p-3 shrink-0">
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

                {/* Scrollable List */}
                <div className={`bg-white/20 flex flex-col gap-1 p-2 w-full ${listHeight} overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-500 scrollbar-track-transparent`}>
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
            </div>
        </div>
    )
}