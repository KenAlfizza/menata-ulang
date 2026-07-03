"use client";

import { SearchBar } from "../../searchbar.tsx";
import MyStories from "./my-stories.tsx";
import RecentStories from "./recent-stories.tsx";

import { Button } from "../../ui/button.tsx";
import { Filter } from "lucide-react";

export default function AuthorWorkspace() {
    return (
        <main className="px-8 space-y-8 overflow-x-hidden">
            <section>
                <h2 className="text-2xl font-semibold">Recent Stories</h2>
                <RecentStories />
            </section>
            <section className="w-full">
                <div className="w-full flex flex-row">
                    { /** My Story Title */}
                    <div className="flex flex-row items-center gap-2">
                        <h2 className="text-2xl font-semibold">My Stories</h2>
                        <p>(Total: 42)</p>
                    </div>

                    { /** My Story Search and Filters */}
                    <div className=" flex flex-row gap-2 items-center justify-center ml-auto">
                        <div className="min-w-86">
                            <SearchBar/>
                        </div>
                        <Button className="bg-black h-full">
                            <Filter className="text-white"/>
                        </Button>
                    </div>
                </div>

                <MyStories />
            </section>
        </main>
    )
}