import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuLabel,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreVertical,
    FileText,
    ArrowUpRightFromSquare,
    Eye,
    Edit,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspacePodcastRecord } from "@/types/workspace";
import { useWorkspaceRefresh } from "../../../context/workspace/refresh-context.tsx";

interface PodcastDropdownProps {
    accessToken: string;
    podcast: WorkspacePodcastRecord;
    onPublishToggle: (publishState: boolean) => Promise<void>;
    onDelete: (podcastId: string) => Promise<void>;
}

export function PodcastCardDropdown({
    podcast,
    onPublishToggle,
    onDelete,
}: PodcastDropdownProps) {
    const id = podcast.id;
    const isPublished = podcast.published ?? false;
    const { triggerRefresh } = useWorkspaceRefresh();

    const handlePublishToggle = async (publishState: boolean) => {
        try {
            await onPublishToggle(publishState);
            triggerRefresh();
        } catch (error) {
            console.error("Failed to publish podcast:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await onDelete(id);
            triggerRefresh();
        } catch (error) {
            console.error("Failed to delete podcast:", error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full hover:bg-zinc-300/60 transition-colors focus-visible:ring-0"
                    aria-label="More options"
                >
                    <MoreVertical className="w-4 h-4 text-zinc-500" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Podcast</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link
                        href={`/workspace/host/view/${id}`}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <FileText className="w-4 h-4" />
                        <span>About</span>
                    </Link>
                </DropdownMenuItem>
                {!isPublished ? (
                    <DropdownMenuItem
                        asChild
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePublishToggle(true);
                        }}
                    >
                        <div className="flex items-center gap-2 cursor-pointer">
                            <ArrowUpRightFromSquare className="w-4 h-4" />
                            <span>Publish</span>
                        </div>
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        asChild
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePublishToggle(false);
                        }}
                    >
                        <div className="flex items-center gap-2 cursor-pointer">
                            <ArrowUpRightFromSquare className="w-4 h-4" />
                            <span>Unpublish</span>
                        </div>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                    }}
                >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}