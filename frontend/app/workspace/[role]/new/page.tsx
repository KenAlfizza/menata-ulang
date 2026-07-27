"use client";

import AuthGuard from "@/components/auth-guard";
import { use } from "react";
import NewStory from "@/components/workspace/new/new-story.tsx";
import NewResearch from "@/components/workspace/new/new-research.tsx";


type Role = "author" | "host" | "researcher" ;

interface WorkspaceNewPageProps {
  params: Promise<{ role: Role }>;
}

export default function WorkspaceNewPage({ params }: WorkspaceNewPageProps) {
    const { role } = use(params);

    const renderWorkspace = () => {
        switch (role) {
            case "author":
                return <NewStory/>
            case "researcher":
                return <NewResearch/>
            default:
                return "New View"
        }
    }

    return (
        <AuthGuard>
            {renderWorkspace()}
        </AuthGuard>
    );
}