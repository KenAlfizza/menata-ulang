"use client";

import { use, useEffect, useState } from "react";
import { ExploreBackground } from "@/components/explore/explore-background.tsx"; 
import { PlayerProvider } from "@/context/podcast/player-context.tsx";
import { ExplorePodcastSlug } from "@/components/explore/podcast/explore-podcast-slug.tsx";
import { ExploreNavbar } from "../../../../components/explore/explore-navbar.tsx";
import { getPodcast } from "@/services/explore/podcast.ts"; // Adjust path as needed
import { ExplorePodcastRecord } from "@/types/explore.ts";
import { ApiError } from "@/types/error.ts";

interface EditorPageProps {
  params: Promise<{ slug: string }>;
}

export default function ExplorePodcastSlugPage({ params }: EditorPageProps) {
    const { slug } = use(params);

    const [podcast, setPodcast] = useState<ExplorePodcastRecord | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchPodcastData() {
            try {
                setIsLoading(true);
                setErrorMessage(null);
                const data = await getPodcast(slug);
                if (isMounted) {
                    setPodcast(data);
                }
            } catch (err) {
                if (isMounted) {
                    if (err instanceof ApiError) {
                        setErrorMessage(err.message);
                    } else if (err instanceof Error) {
                        setErrorMessage(err.message);
                    } else {
                        setErrorMessage("An unexpected error occurred.");
                    }
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchPodcastData();

        return () => {
            isMounted = false;
        };
    }, [slug]);

    return (
        <div className="relative w-full min-h-screen">
            <ExploreNavbar page="podcast" route="explore"/>
            <ExploreBackground page="podcast">
                
                <div className="pt-20 p-8 space-y-8">
                    {errorMessage ? (
                        <div className="w-full p-6 bg-red-50 border border-red-200 rounded-md text-red-700 flex flex-col gap-2">
                            <h3 className="font-semibold text-lg">Unable to load podcast</h3>
                            <p>{errorMessage}</p>
                        </div>
                    ) : (
                        <ExplorePodcastSlug podcast={podcast ?? undefined} isLoading={isLoading} />
                    )}
                </div>
            </ExploreBackground>
        </div>
    );
}