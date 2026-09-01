import { ExplorePodcastRecord } from "@/types/explore/podcast.ts";
import { useIsMobile } from "@/hooks/use-mobile.ts";
import { ExplorePodcastSlugMobileView } from "./explore-podcast-slug-mobile.tsx";
import { ExplorePodcastSlugDesktopView } from "./explore-podcast-slug-desktop.tsx";
import { ExplorePodcastSlugSkeletonMobile, ExplorePodcastSlugSkeletonDesktop } from "./explore-podcast-slug-skeleton.tsx";

interface PodcastCardProps {
    podcast: ExplorePodcastRecord;
    isLoading?: boolean;
}

export function ExplorePodcastSlug({ podcast, isLoading = false }: PodcastCardProps) {
    const isMobile = useIsMobile();

    // Only show the full skeleton on the very first load. On subsequent
    // next/previous navigations, keep rendering the previous podcast's data
    // so the swipe transition isn't interrupted by a skeleton swap.
    if (isLoading && !podcast) {
        if (isMobile) {
            return <ExplorePodcastSlugSkeletonMobile />;
        } else {
            return <ExplorePodcastSlugSkeletonDesktop />;
        }
    }

    if (isMobile) {
        return <ExplorePodcastSlugMobileView podcast={podcast} />;
    } else {
        return <ExplorePodcastSlugDesktopView podcast={podcast} />;
    }
}
