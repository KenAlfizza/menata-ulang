"use client"

import { StoryCard } from "./story-card.tsx";

export default function RecentStories() {
    return (
        <div className="grid grid-cols-4 gap-8 py-4">
            <StoryCard isNewStory/>
            <StoryCard isPublished/>
            <StoryCard/>
            <StoryCard/>
        </div>
    )
}
