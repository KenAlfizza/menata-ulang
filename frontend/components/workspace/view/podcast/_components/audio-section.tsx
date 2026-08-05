// app/workspace/host/[podcastId]/_components/AudioSection.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Music, Upload, Check, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface AudioSectionProps {
    audioForm: UseFormReturn<any>;
    audioPreview: string | null;
    hasAudioChanges: boolean;
    handleAudioChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDiscardAudio: () => void;
    onSubmitAudio: () => void;
}

export function AudioSection({
    audioForm,
    audioPreview,
    hasAudioChanges,
    handleAudioChange,
    handleDiscardAudio,
    onSubmitAudio,
}: AudioSectionProps) {
    return (
        <Card className="shadow-sm">
            <CardContent className="space-y-4">
                <section className="flex flex-col gap-4 p-2">
                    <div className="w-full flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                            <Label className="text-lg">Audio Track</Label>
                            <span className="text-zinc-500">Upload or replace the primary audio file for this podcast episode.</span>
                        </div>
                        <div className="flex items-center">
                            {hasAudioChanges ? (
                                <div className="flex items-center gap-1 text-white animate-in fade-in duration-200">
                                    <Button className="bg-green-400/60 hover:bg-green-400/100" onClick={audioForm.handleSubmit(onSubmitAudio)}>
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button className="bg-red-400/60 hover:bg-red-400/100" onClick={handleDiscardAudio}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-8" />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-dashed rounded-lg bg-slate-50">
                        <input id="audio-file" type="file" className="hidden" accept="audio/*" onChange={handleAudioChange} />
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 shrink-0">
                                <Music size={20} />
                            </div>
                            <div className="w-full flex flex-col overflow-hidden">
                                {audioPreview ? (
                                    <audio key={audioPreview} src={audioPreview} controls preload="metadata" className="w-full" />
                                ) : (
                                    <span>No audio file</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <label htmlFor="audio-file">
                                <Button asChild variant="outline" className="cursor-pointer">
                                    <span><Upload className="w-4 h-4" /></span>
                                </Button>
                            </label>
                        </div>
                    </div>
                </section>
            </CardContent>
        </Card>
    );
}