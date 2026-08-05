"use client";

import AuthGuard from "@/components/auth-guard.tsx";
import { use } from "react";
import ResearcherWorkspace from "@/components/workspace/research/researcher-workspace.tsx";
import AuthorWorkspace from "@/components/workspace/author/author-workspace.tsx";
import PodcastWorkspace from "@/components/workspace/podcast/podcast-workspace.tsx";


type Role = "author" | "host" | "researcher" ;

interface WorkspacePageProps {
  params: Promise<{ role: Role }>;
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
    const { role } = use(params);

    const renderWorkspace = () => {
        switch (role) {
            case "author":
                return <AuthorWorkspace/>
            case "researcher":
                return <ResearcherWorkspace/>
            case "host":
                return <PodcastWorkspace/>
            default:
                return "Workspace View"
        }
    }

    return (
        <AuthGuard>
            {renderWorkspace()}
        </AuthGuard>
    );
}