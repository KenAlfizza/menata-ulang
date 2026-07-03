"use client";

import AuthGuard from "@/components/auth-guard";
import { use } from "react";
import AuthorWorkspace from "@/components/workspace/author/author-workspace";


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
        }
    }

    return (
        <AuthGuard>
            {renderWorkspace()}
        </AuthGuard>
    );
}