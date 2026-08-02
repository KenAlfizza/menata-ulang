// components/view/podcast/_components/visibility-section.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowUpRightFromSquare, ArrowDownLeftFromSquare } from "lucide-react";

interface VisibilitySectionProps {
    isPublished: boolean;
    publishedAt: string;
    handlePublishToggle: (publishState: boolean) => void;
}

export function VisibilitySection({
    isPublished,
    publishedAt,
    handlePublishToggle,
}: VisibilitySectionProps) {
    return (
        <Card className="shadow-sm">
            <CardContent className="space-y-4">
                <section className="p-2 flex flex-row items-center gap-8 w-full">
                    <div className="flex flex-col">
                        <Label className="text-lg">Visibility</Label>
                        <span className="text-zinc-500">Publish this podcast for everyone to see, or keep it hidden as a private draft.</span>
                        {publishedAt && (
                           <div className="mt-1 flex items-center gap-1.5 text-xs tracking-tight text-zinc-400">
                                <ArrowUpRightFromSquare className="w-3.5 h-3.5" /> 
                                <span>Published: {publishedAt}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex items-center gap-1.5 font-medium tracking-tight">
                            {isPublished ? (
                                <>
                                    <span className="text-green-600">Published</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 animate-pulse" />
                                </>
                            ) : (
                                <>
                                    <span className="text-yellow-600">Draft</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                                </>
                            )}
                        </div>
                        <div>
                            {!isPublished ? (
                                <Button className="bg-yellow-400/65 hover:bg-yellow-400 text-black" onClick={(e) => { e.stopPropagation(); handlePublishToggle(true); }}>
                                    <ArrowUpRightFromSquare className="w-4 h-4" /> <span>Publish</span>
                                </Button>
                            ) : (
                                <Button className="bg-red-400/65 hover:bg-red-400 text-white" onClick={(e) => { e.stopPropagation(); handlePublishToggle(false); }}>
                                    <ArrowDownLeftFromSquare className="w-4 h-4" /> <span>Unpublish</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </section>
            </CardContent>
        </Card>
    );
}