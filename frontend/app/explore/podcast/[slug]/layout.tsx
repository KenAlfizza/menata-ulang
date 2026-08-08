import { PlayerProvider } from "@/context/podcast/player-context.tsx";

export default function ExplorePodcastSlugLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-screen ">
            <PlayerProvider>
                <main>{children}</main>
            </PlayerProvider>
        </div>
    );
}