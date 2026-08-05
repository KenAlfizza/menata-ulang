// components/view/podcast/_components/delete-section.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteSectionProps {
    handleDeletePodcast: () => void;
}

export function DeleteSection({ handleDeletePodcast }: DeleteSectionProps) {
    return (
        <Card className="shadow-sm">
            <CardContent className="space-y-4">
                <section className="p-2 flex flex-row items-center gap-8 w-full">
                    <div className="flex flex-col">
                        <Label className="text-lg">Delete</Label>
                        <span className="text-zinc-500">Permanently delete this podcast from the website.</span>
                    </div>
                    <Button 
                        className="ml-auto bg-red-400/65 hover:bg-red-400 text-white" 
                        onClick={(e) => { e.stopPropagation(); handleDeletePodcast(); }}
                    >
                        <Trash2 className="w-4 h-4" /> <span>Delete</span>
                    </Button>
                </section>
            </CardContent>
        </Card>
    );
}