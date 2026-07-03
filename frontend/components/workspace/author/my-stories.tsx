"use client"

import { StoryCard } from "./story-card.tsx";

export default function MyStories() {
    return (
        <div className="grid grid-cols-5 gap-8 py-4 w-full">
            <StoryCard title="Kaset yang sudah usang"/>
            <StoryCard image="/window.svg"/>
            <StoryCard isPublished/>
            <StoryCard/>
            <StoryCard/>
            <StoryCard/>
        </div>
    )
}
