"use client";

import MyStories from "./my-stories.tsx";
import RecentStories from "./recent-stories.tsx";

export default function AuthorWorkspace() {
    return (
        <main className="px-8 space-y-8 overflow-x-hidden mb-16">
            <section>
                <RecentStories />
            </section>
            <section className="w-full">
                <MyStories />
            </section>
        </main>
    )
}