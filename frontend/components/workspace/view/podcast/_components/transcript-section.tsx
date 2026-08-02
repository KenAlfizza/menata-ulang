// app/workspace/host/[podcastId]/_components/TranscriptSection.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { TranscriptFormValues } from "../_hooks/use-podcast-workspace";

interface TranscriptSectionProps {
    transcriptForm: UseFormReturn<TranscriptFormValues>;
    isTranscriptDirty: boolean;
    handleDiscardTranscript: () => void;
    onSubmitTranscript: (data: TranscriptFormValues) => void;
}

export function TranscriptSection({
    transcriptForm,
    isTranscriptDirty,
    handleDiscardTranscript,
    onSubmitTranscript,
}: TranscriptSectionProps) {
    const { register, handleSubmit } = transcriptForm;

    return (
        <Card className="shadow-sm">
            <CardContent className="space-y-4">
                <section className="flex flex-col gap-4 p-2">
                    <div className="w-full h-8 flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                            <Label className="text-lg" htmlFor="transcript">Transcript</Label>
                            <span className="text-zinc-500">Add or edit the full-text transcript for this podcast episode.</span>
                        </div>
                        <div className="flex items-center">
                            {isTranscriptDirty ? (
                                <div className="flex items-center gap-1 text-white animate-in fade-in duration-200">
                                    <Button className="bg-green-400/60 hover:bg-green-400/100" onClick={handleSubmit(onSubmitTranscript)}>
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button className="bg-red-400/60 hover:bg-red-400/100" onClick={handleDiscardTranscript}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-8" />
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmitTranscript)} className="space-y-4">
                        <Textarea 
                            id="transcript" 
                            rows={8}
                            placeholder="Enter podcast transcript here..."
                            className="bg-transparent font-mono text-sm"
                            {...register("transcript")} 
                        />
                    </form>
                </section>
            </CardContent>
        </Card>
    );
}