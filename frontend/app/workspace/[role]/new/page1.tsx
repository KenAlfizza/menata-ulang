// app/workspace/author/new/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { createStoryPage } from "@/services/story";
import { Loader2 } from "lucide-react";

export default function NewStoryPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const hasCreated = useRef(false);

  useEffect(() => {
    async function generateDraft() {
      if (!accessToken || hasCreated.current) return;
      
      try {
        hasCreated.current = true; // Prevent double execution in React Strict Mode
        const fallbackSlug = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        
        const newPageRecord = await createStoryPage("Untitled Story Draft", fallbackSlug, accessToken);
        
        // Redirect directly to your dedicated /edit/[id] route
        router.replace(`/workspace/author/edit/${newPageRecord.id}`);
      } catch (err) {
        console.error("Failed to create draft:", err);
      }
    }

    generateDraft();
  }, [accessToken, router]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin" size={24} />
      <span>Creating your new story draft...</span>
    </div>
  );
}