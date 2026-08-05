// app/workspace/author/edit/[id]/page.tsx
import { use } from "react";

import { StoryEditor } from "@/components/editor/story/story-editor.tsx";
import { ResearchEditor } from "@/components/editor/research/research-editor.tsx";

import AuthGuard from "@/components/auth-guard.tsx";


type Role = "author" | "host" | "researcher" ;

interface EditorPageProps {
  params: Promise<{ role: Role, id: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
    const {role, id} = use(params);

    const renderEditor = () => {
        switch (role) {
            case "author": 
                return <StoryEditor pageId={id} />
            case "researcher":
                return <ResearchEditor pageId={id} />
            default:
                return "Editor View"
        }
    }
    
    return (
        <AuthGuard>
            {renderEditor()}
        </AuthGuard>
    );
}