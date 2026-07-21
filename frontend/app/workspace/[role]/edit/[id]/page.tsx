// app/workspace/author/edit/[id]/page.tsx
import { use } from "react";
import { StoryEditor } from "@/components/editor/story/story-editor.tsx";
import AuthGuard from "@/components/auth-guard.tsx";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  
  return (
    <AuthGuard>
        <StoryEditor pageId={resolvedParams.id} />
    </AuthGuard>);
}