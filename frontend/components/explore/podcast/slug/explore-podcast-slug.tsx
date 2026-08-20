import { ExplorePodcastRecord } from "@/types/explore/podcast.ts";
import { useIsMobile } from "@/hooks/use-mobile.ts";
import { ExplorePodcastSlugMobileView } from "./explore-podcast-slug-mobile.tsx";
import { ExplorePodcastSlugDesktopView } from "./explore-podcast-slug-desktop.tsx";
import { ExplorePodcastSlugSkeletonMobile, ExplorePodcastSlugSkeletonDesktop } from "./explore-podcast-slug-skeleton.tsx";

interface PodcastCardProps {
    podcast?: ExplorePodcastRecord;
    isLoading?: boolean;
}

export function ExplorePodcastSlug({ podcast, isLoading = false }: PodcastCardProps) {
    const isMobile = useIsMobile();

    if (isLoading) {
        if (isMobile) {
            return <ExplorePodcastSlugSkeletonMobile />;
        } else {
            return <ExplorePodcastSlugSkeletonDesktop />;
        }
    }

    // Determine which view to render
    if (isMobile) {
        return <ExplorePodcastSlugMobileView podcast={podcast} />;
    } else {
        return <ExplorePodcastSlugDesktopView podcast={podcast} />;
    }
}
