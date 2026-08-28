import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { ListPlus, ListStart, Share2 } from "lucide-react";
import type { ReactNode } from "react";

interface ExplorePodcastSlugDropdownDesktopProps {
    children: ReactNode;
    onAddToPlaylist?: () => void;
    onPlayNext?: () => void;
    onShare?: () => void;
}

export function ExplorePodcastSlugDropdownDesktop({
    children,
    onAddToPlaylist,
    onPlayNext,
    onShare,
}: ExplorePodcastSlugDropdownDesktopProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                asChild
                className="data-[state=open]:bg-white/75 data-[state=open]:text-zinc-800 rounded-full p-1.5"
            >
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto min-w-max whitespace-nowrap ring-0 mt-2 bg-white/90">
                <DropdownMenuItem onClick={onAddToPlaylist}>
                    <ListPlus className="mr-2 h-4 w-4" />
                    Add to Playlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPlayNext}>
                    <ListStart className="mr-2 h-4 w-4" />
                    Play Next
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}