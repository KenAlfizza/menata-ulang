"use client";

import AuthGuard from "@/components/auth-guard";
import { use } from "react";


type Role = "author" | "host" | "researcher" ;

interface WorkspacePageProps {
  params: Promise<{ role: Role }>;
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
    const { role } = use(params);

    const renderWorkspace = () => {
        return <p>Workspace View</p>;
    }

    return (
        <AuthGuard>
            {renderWorkspace()}
        </AuthGuard>
    );
}