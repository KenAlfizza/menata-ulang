import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExplorePodcastRecord } from "@/types/explore/podcast.ts";
import { usePlayer } from "@/context/podcast/player-context.tsx";
import { formatDate } from "@/utils/format-date.ts";
import { useIsMobile } from "../../use-mobile.ts";

export function useExplorePodcastSlug(podcast: ExplorePodcastRecord) {

    // Data extraction
    const slug = podcast?.slug ?? "";
    const title = podcast?.title ?? "Untitled Podcast";
    const imageUrl =
        (podcast?.imageUrl && podcast.imageUrl.trim() !== "")
            ? podcast.imageUrl
            : "/logo-icon.svg";
    const hostName = podcast?.hostName ?? "Menata Ulang";
    const alt = podcast?.title ?? "Podcast Image";
    const description = podcast?.description ?? "A description describing the main point of the podcast";
    const date = podcast?.publishedAt
        ? formatDate(new Date(podcast.publishedAt))
        : formatDate(new Date());
    const audioUrl = podcast?.audioUrl ?? "";
    const durationSeconds = podcast?.duration ?? 0;
    const transcript = podcast?.transcript ??
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eget odio varius, rutrum mauris sed, auctor enim. Sed consequat, quam ut volutpat imperdiet, nunc sem pulvinar nulla, in mollis nisl odio vitae metus. Cras a eleifend sapien. Quisque blandit ante odio. Vivamus fringilla elit ac consequat vehicula. Vivamus laoreet rhoncus turpis in commodo. Pellentesque fermentum nisl in sagittis euismod. Integer vel vehicula dolor. Nam a urna vel sem tempus ultricies. Vestibulum ut tortor interdum, pharetra libero eget, commodo ipsum. Pellentesque posuere sem at arcu hendrerit, eget porta elit posuere. Nullam sagittis pulvinar nunc, a fermentum lectus egestas in.";

    const router = useRouter();
    const [isLoading, startTransition] = useTransition();

    const {
        currentTrack,
        buildPlayerTrack,
        setVisibility,
        isActive,
        addToPlaylist,
        addToPlaylistNext,
        playTrackKeepPlaylist,
        next,
        previous,
    } = usePlayer();

    const isPlayerActive = isActive;
    const playerTrack = currentTrack;
    const setPlayerVisibility = setVisibility;

    const isLive = currentTrack?.slug === slug;

    // Create the Track data for the loaded page
    const pageTrack = useMemo(
        () => (podcast ? buildPlayerTrack(podcast) : null),
        [podcast?.slug]
    );

    // Mobile view
    const handlePlayMobile = () => {
        setPlayerVisibility(false);
        if (!pageTrack) return;
        playTrackKeepPlaylist(pageTrack);
    }

    const handleNextMobile = () => {
        setPlayerVisibility(false);
        startTransition(() => {
            const nextTrack = next();
            if (nextTrack) {
                router.push(`/explore/podcast/${nextTrack.slug}`);
            }
        });
    };
    const handlePreviousMobile = () => {
        setPlayerVisibility(false);
        startTransition(() => {
            const prevTrack = previous();
            if (prevTrack) {
                router.push(`/explore/podcast/${prevTrack.slug}`);
            }
        });
    };

    // Desktop view
    const handlePlay = () => {
        if (!pageTrack) return;
        playTrackKeepPlaylist(pageTrack);
    }

    const handleAddToPlaylist = () => {
        if (!pageTrack) return;
        addToPlaylist(pageTrack);
    }

    const handlePlayNext = () => {
        if (!pageTrack) return;
        addToPlaylistNext(pageTrack);
    }

    const handleNext = () => {next()};
    const handlePrevious = () => {previous()};

    return {
        slug,
        title,
        imageUrl,
        hostName,
        alt,
        description,
        date,
        audioUrl,
        durationSeconds,
        transcript,
        pageTrack,
        playerTrack,
        isPlayerActive,
        isLoading,
        isLive,
        setPlayerVisibility,
        handlePlay,
        handlePlayMobile,
        handleAddToPlaylist,
        handlePlayNext,
        handleNext,
        handleNextMobile,
        handlePrevious,
        handlePreviousMobile,
    };
}