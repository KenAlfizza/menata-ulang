"use client";

import AuthGuard from "@/components/auth-guard";
import { use } from "react";
import WorkspaceViewStory from "@/components/workspace/view/view-story.tsx";
import WorkspaceViewResearch from "@/components/workspace/view/view-research.tsx";
import WorkspaceViewPodcast from "@/components/workspace/view/podcast/view-podcast.tsx";


type Role = "author" | "host" | "researcher" ;

interface WorkspaceViewPageProps {
  params: Promise<{ role: Role, id: string }>;
}

export default function WorkspaceNewPage({ params }: WorkspaceViewPageProps) {
    const { role, id } = use(params);

    const renderWorkspace = () => {
        switch (role) {
            case "author":
                return <WorkspaceViewStory storyId={id}/>
            case "researcher":
                return <WorkspaceViewResearch researchId={id}/>
            case "host":
                return <WorkspaceViewPodcast podcastId={id}/>
            default:
                return "View view"
        }
    }

    return (
        <AuthGuard>
            {renderWorkspace()}
        </AuthGuard>
    );
}