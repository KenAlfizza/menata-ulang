"use client";

import AuthGuard from "@/components/auth-guard";
import { use } from "react";
import ResearcherWorkspace from "@/components/workspace/research/researcher-workspace";


type Role = "author" | "host" | "researcher" ;

interface WorkspacePageProps {
  params: Promise<{ role: Role }>;
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
    const { role } = use(params);

    const renderWorkspace = () => {
        switch (role) {
            case "researcher":
                return <ResearcherWorkspace/>
        }
    }

    return (
        <AuthGuard>
            {renderWorkspace()}
        </AuthGuard>
    );
}