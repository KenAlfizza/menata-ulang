import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExplorePodcastRecord } from "@/types/explore/podcast.ts";
import { usePlayer } from "@/context/podcast/player-context.tsx";
import { formatDate } from "@/utils/format-date.ts";
import { useIsMobile } from "../../use-mobile.ts";

export function useExplorePodcastSlug(podcast: ExplorePodcastRecord) {
    const isMobile = useIsMobile();

    // Navigation between tracks (in Mobile)
    const router = useRouter();
    const pendingNavRef = useRef(false);
    // True until the first sync effect below has run at least once, with a
    // resolved isMobile value. Lets the consumer delay rendering (e.g. show a
    // skeleton) instead of flashing the wrong inline/visibility state on the
    // very first render, before isMobile and isInlineActive have settled.
    const [isLoading, setIsLoading] = useState(true);
    // True from the moment a mobile next/previous tap fires until this page's
    // own slug catches up to the new track. Used to keep the inline player
    // forced active and the floating mobile player forced hidden through the
    // transition, instead of flickering based on the not-yet-updated slug.
    const [isNavigating, setIsNavigating] = useState(false);
    const [isInlineActive, setIsInlineActive] = useState(false);

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
    
    useEffect(() => {
        if (isMobile === undefined) return;

        if (!isMobile) {
            setIsInlineActive(false);
            setIsLoading(false);
            return;
        }

        if (isNavigating) {
            setIsInlineActive(true);
            setPlayerVisibility(false);
        } else {
            setIsInlineActive(currentTrack?.slug === slug);
            setPlayerVisibility(currentTrack?.slug !== slug);
        }

        setIsLoading(false);
    }, [isMobile, isNavigating, currentTrack?.slug, slug, setPlayerVisibility]);

    useEffect(() => {
        if (currentTrack && pendingNavRef.current) {
            router.push(`/explore/podcast/${currentTrack.slug}`);
            pendingNavRef.current = false;
        }
    }, [currentTrack?.slug, router]);

    useEffect(() => {
        setIsNavigating(false);
    }, [slug]);

    const pageTrack = useMemo(
        () => (podcast ? buildPlayerTrack(podcast) : null),
        [podcast?.slug]
    );

    // Desktop view
    const handlePlay = () => {
        if (!pageTrack) return;
        setPlayerVisibility(true);
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

    // Mobile view
    const handlePlayMobile = () => {
        if (!pageTrack) return;
        setIsInlineActive(true);
        playTrackKeepPlaylist(pageTrack);
    }

    const handleNextMobile = () => {
        pendingNavRef.current = true;
        setIsNavigating(true);
        next();
    };
    const handlePreviousMobile = () => {
        pendingNavRef.current = true;
        setIsNavigating(true);
        previous();
    };

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
        isInlineActive,
        isLoading,
        setVisibility,
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