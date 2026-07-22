"use client";

import "@puckeditor/core/puck.css";
import AuthGuard from "@/components/auth-guard";
import { StoryEditContent } from "./storyEditContent";

interface StoryEditPageProps {
  params: Promise<{ id: string }>;
}

export default function StoryEditPage({ params }: StoryEditPageProps) {
  return (
    <AuthGuard>
      <StoryEditContent params={params} />
    </AuthGuard>
  );
}