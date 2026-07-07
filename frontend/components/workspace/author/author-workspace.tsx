"use client";

import { SearchBar } from "../../searchbar.tsx";
import MyStories from "./my-stories.tsx";
import RecentStories from "./recent-stories.tsx";

import { Button } from "../../ui/button.tsx";
import { Filter } from "lucide-react";

export default function AuthorWorkspace(accessToken: string) {
    return (
        <main className="px-8 space-y-8 overflow-x-hidden mb-16">
            <section>
                <h2 className="text-2xl font-semibold">Recent Stories</h2>
                <RecentStories />
            </section>
            <section className="w-full">
                <MyStories />
            </section>
        </main>
    )
}