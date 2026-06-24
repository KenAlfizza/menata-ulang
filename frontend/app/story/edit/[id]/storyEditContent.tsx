"use client";

import { useEffect, useState, useTransition, use } from "react";
import { Puck, Data } from "@puckeditor/core";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { createPuckConfig } from "./puck.config";
import { useAuth } from "@/context/auth-context";
import { createStoryPage, saveStoryPageData, loadStoryPageData } from "@/services/story";

interface StoryEditContentProps {
  params: Promise<{ id: string }>;
}

export function StoryEditContent({ params }: StoryEditContentProps) {
  const resolvedParams = use(params);
  const pageId = resolvedParams.id;

  const { accessToken } = useAuth();

  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initPageWorkspace() {
      if (!pageId || !accessToken) return;
      try {
        setIsLoading(true);

        if (pageId === "new") {
          const fallbackSlug = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const newPageRecord = await createStoryPage("Untitled Story Draft", fallbackSlug, accessToken);
          window.history.replaceState(null, "", `/story/edit/${newPageRecord.id}`);
          setData(newPageRecord.puckData);
          return;
        }

        const pageData = await loadStoryPageData(pageId, accessToken);
        setData(pageData || { content: [], root: { props: { title: "Untitled Page" } } });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to properly initialize editor data");
      } finally {
        setIsLoading(false);
      }
    }

    initPageWorkspace();
  }, [pageId, accessToken]);

  const handleSaveWorkspace = (currentData: Data) => {
    const actualId = window.location.pathname.split("/").pop();
    if (!actualId || actualId === "new" || !accessToken) return;

    startSaving(async () => {
      try {
        await saveStoryPageData(actualId, currentData, accessToken);
      } catch (err: any) {
        alert(`Error trying to update data record: ${err.message}`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#1A1A2E] flex items-center justify-center text-white gap-3">
        <Loader2 className="animate-spin" size={24} />
        <span>Syncing Canvas Workspace...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full h-screen bg-[#1A1A2E] flex flex-col items-center justify-center text-white p-6">
        <p className="text-red-400 font-semibold mb-4">{error}</p>
        <Link href="/" className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md transition">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden bg-[#1A1A2E]">
      <Puck
        config={createPuckConfig("content")}
        data={data}
        onChange={(newData) => setData(newData)}
        onPublish={handleSaveWorkspace}
        overrides={{
          puck: ({ children }) => (
            <div style={{ height: "100%", maxHeight: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: "#FFB7C3" }}>
              {children}
            </div>
          ),
          header: () => (
            <div className="bg-[#FFB7C3] p-3 flex justify-between items-center text-slate-800 border-b border-slate-200/20">
              <div className="w-full flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2">
                  <Image
                    src="/logo-text.svg"
                    alt="Menata Ulang Logo"
                    width={128}
                    height={128}
                    priority
                    className="w-auto h-8 brightness-0"
                  />
                </Link>
                <h1 className="font-bold text-lg">Story Editor</h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveWorkspace(data)}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-md flex items-center gap-2 transition cursor-pointer shadow-sm"
                >
                  {isSaving && <Loader2 className="animate-spin" size={14} />}
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ),
        }}
      />
    </div>
  );
}