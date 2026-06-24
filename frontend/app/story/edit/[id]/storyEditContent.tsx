"use client";

import { useEffect, useState, useTransition, use, useMemo } from "react";
import { Puck, Data } from "@puckeditor/core";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Layout, Sparkles } from "lucide-react";

// Import dynamic config factory and ViewMode type
import { createPuckConfig, ViewMode } from "./puck.config";
import { useAuth } from "@/context/auth-context";
import { createStoryPage, saveStoryPageData, loadStoryPageData } from "@/services/story";

// Import shadcn tabs primitives
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StoryEditContentProps {
  params: Promise<{ id: string }>;
}

export function StoryEditContent({ params }: StoryEditContentProps) {
  const resolvedParams = use(params);
  const pageId = resolvedParams.id;

  const { accessToken } = useAuth();

  // Manage active workspace view
  const [viewMode, setViewMode] = useState<ViewMode>("content");

  // Dynamically compute the Puck configuration when viewMode toggles
  const dynamicConfig = useMemo(() => createPuckConfig(viewMode), [viewMode]);


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
    <div className="relative w-full h-screen flex flex-col overflow-hidden bg-background select-none">
        <Puck
        config={dynamicConfig}
        data={data}
        onChange={(newData) => setData(newData)}
        onPublish={handleSaveWorkspace}
        overrides={{
            // 1. Unified Background: Match Puck's native sidebar/canvas tones instead of using pink
            puck: ({ children }) => (
            <div className="h-full max-h-full flex flex-col overflow-hidden bg-zinc-50/50">
                {children}
            </div>
            ),
            
            // 2. Professional Tool Header: Clean, single-row layout mimicking modern design apps
            header: () => (
            <div className="bg-white px-6 h-12 flex justify-between items-center text-zinc-950 border-b border-zinc-200 z-50">
              
              {/* Left: Brand & App Title Inline */}
              <div className="flex items-center gap-2 w-1/4">
                <Link href="/" className="flex items-center gap-2">
                  <Image
                    src="/logo-text.svg"
                    alt="Menata Ulang Logo"
                    width={128}
                    height={128}
                    priority
                    className="w-auto h-6 brightness-0"
                  />
                </Link>
                <span className="text-zinc-300 select-none text-xs">|</span>
                <span className="text-xs font-semibold text-zinc-900/50 uppercase">Story Editor</span>
              </div>
              
              {/* Center: Clean Text-Only Tabs */}
              {/** 
              <div className="flex justify-center w-2/4">
                <Tabs 
                    value={viewMode} 
                    onValueChange={(val) => setViewMode(val as ViewMode)}>
                    <TabsList className="bg-zinc-100 p-0.5 h-8">
                        <TabsTrigger 
                            value="content" 
                            className="text-xs font-medium h-7 px-4 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm"
                        >
                            <Layout size={13} />
                            Content
                        </TabsTrigger>
                        <TabsTrigger 
                            value="animation" 
                            className="text-xs font-medium h-7 px-4 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm"
                        >
                            <Sparkles size={13} />
                            Animation
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
              </div>
              */}

              {/* Right: Solid Minimal Utility Button */}
              <div className="flex items-center justify-end w-1/4">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveWorkspace(data)}
                  className="bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-medium h-8 px-4 rounded-md transition"
                >
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