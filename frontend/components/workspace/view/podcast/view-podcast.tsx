// components/view/podcast/view-podcast.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePodcastWorkspaceView } from "@/hooks/workpace/podcast/use-podcast-workspace-view.ts";
import { AboutSection } from "./_components/about-section";
import { AudioSection } from "./_components/audio-section";
import { TranscriptSection } from "./_components/transcript-section";
import { VisibilitySection } from "./_components/visibility-section";
import { DeleteSection } from "./_components/delete-section";
import { Error } from "./_components/error.tsx";
import { PodcastSkeleton } from "./_components/podcast-skeleton.tsx";

export default function WorkspaceViewPodcast({ podcastId }: { podcastId: string }) {
    const workspace = usePodcastWorkspaceView(podcastId);

    if (workspace.error) return <Error statusCode={workspace.error.status} error={workspace.error.response} redirect="/workspace/host"/>

    if (workspace.isLoading) return <main className="min-h-screen bg-zinc-100 relative pb-20"><PodcastSkeleton /></main>

    return (
        <main className="min-h-screen bg-zinc-100 relative pb-20">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-50 bg-white px-2 h-12 border-b border-zinc-300 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Button onClick={() => workspace.router.back()} variant="ghost" className="h-8 w-8 p-0 bg-zinc-200/25 hover:bg-zinc-200/50">
                        <ArrowLeft size={16} />
                    </Button>
                    <Image src="/logo-text.svg" alt="Logo" width={96} height={20} className="brightness-0" priority />
                    <span className="text-black/50">|</span>
                    <span className="text-xs tracking-tight text-black/50">PODCAST</span>
                </div>
            </div>

            {/* Content Sections */}
            <div className="p-8 space-y-4">
                <AboutSection 
                    aboutForm={workspace.aboutForm}
                    imagePreview={workspace.imagePreview}
                    hasChanges={workspace.aboutForm.formState.isDirty || workspace.isImageDirty}
                    updatedAt={workspace.updatedAt}
                    error={workspace.error}
                    handleImageChange={workspace.handleImageChange}
                    handleDiscard={workspace.handleDiscardAbout}
                    onSubmit={workspace.onSubmitAbout}
                />

                <AudioSection 
                    audioForm={workspace.audioForm}
                    audioPreview={workspace.audioPreview}
                    hasAudioChanges={workspace.isAudioDirty}
                    handleAudioChange={workspace.handleAudioChange}
                    handleDiscardAudio={workspace.handleDiscardAudio}
                    onSubmitAudio={workspace.onSubmitAudio}
                />

                <TranscriptSection 
                    transcriptForm={workspace.transcriptForm}
                    isTranscriptDirty={workspace.transcriptForm.formState.isDirty}
                    handleDiscardTranscript={workspace.handleDiscardTranscript}
                    onSubmitTranscript={workspace.onSubmitTranscript}
                />

                <VisibilitySection 
                    isPublished={workspace.isPublished}
                    publishedAt={workspace.publishedAt}
                    handlePublishToggle={workspace.handlePublishToggle}
                />

                <DeleteSection 
                    handleDeletePodcast={workspace.handleDeletePodcast}
                />
            </div>

            {/* Floating Toast Notification */}
            {workspace.toastError && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg border border-red-500 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-lg w-[90%]">
                    <span className="text-sm flex-1">{workspace.toastError}</span>
                    <Button onClick={() => workspace.setToastError(null)} className="w-8 h-8 p-1 bg-red-600 hover:bg-red-700 rounded text-white">
                        ✕
                    </Button>
                </div>
            )}
        </main>
    );
}