import { notFound } from "next/navigation";
import { ExplorePodcast } from "@/components/explore/podcast/explore-podcast.tsx";
import type { Metadata } from "next";

type PageType = 'story' | 'podcast' | 'research';

const isValidPageType = (value: string): value is PageType =>
    value === 'story' || value === 'podcast' || value === 'research';

const metaByPage: Record<PageType, Metadata> = {
    story: { title: "Short Stories | Explore" },
    podcast: { title: "Midnight Convos | Explore" },
    research: { title: "Research Articles | Explore" },
};

export function generateStaticParams() {
    return [{ page: 'story' }, { page: 'podcast' }, { page: 'research' }];
}

export async function generateMetadata(
    { params }: { params: Promise<{ page: string }> }
): Promise<Metadata> {
    const { page } = await params;
    return isValidPageType(page) ? metaByPage[page] : {};
}

export default async function ExplorePageContent(
    { params }: { params: Promise<{ page: string }> }
) {
    const { page } = await params;
    if (!isValidPageType(page)) notFound();

    switch (page) {
        case 'podcast':
            return <ExplorePodcast />;
        case 'story':
            return null; // <ExploreStory />
        case 'research':
            return null; // <ExploreResearch />
    }
}