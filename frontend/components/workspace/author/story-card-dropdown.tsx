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
import { WorkspaceStoryRecord } from "@/types/workspace";

interface StoryDropdownProps {
    story: WorkspaceStoryRecord;
    onPublishToggle: (publishState: boolean) => Promise<void>;
    onDelete: (storyId: string) => Promise<void>;
    accessToken: string;
    triggerRefresh: () => void;
}

export function StoryCardDropdown({
    story,
    onPublishToggle,
    onDelete,
    triggerRefresh,
}: StoryDropdownProps) {
    const id = story.id;
    const isPublished = story.published ?? false;

    const handlePublishToggle = async (publishState: boolean) => {
        try {
            await onPublishToggle(publishState);
            triggerRefresh();
        } catch (error) {
            console.error("Failed to publish story:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await onDelete(id);
            triggerRefresh();
        } catch (error) {
            console.error("Failed to delete story:", error);
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
                <DropdownMenuLabel>Story</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link
                        href={`/workspace/author/view/${id}`}
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
                <DropdownMenuLabel>Page</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link
                        href="/"
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href="/"
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                    </Link>
                </DropdownMenuItem>
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
