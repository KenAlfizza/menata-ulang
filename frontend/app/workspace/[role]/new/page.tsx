"use client";

import AuthGuard from "@/components/auth-guard";
import { use } from "react";
import NewStory from "@/components/new/new-story.tsx";


type Role = "author" | "host" | "researcher" ;

interface NewPageProps {
  params: Promise<{ role: Role }>;
}

export default function NewPage({ params }: NewPageProps) {
    const { role } = use(params);

    const renderWorkspace = () => {
        switch (role) {
            case "author":
                return <NewStory/>
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