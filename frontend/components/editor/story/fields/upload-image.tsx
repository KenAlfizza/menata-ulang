import { useState, useRef } from "react";
import { FieldLabel } from "@puckeditor/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, X, Check } from "lucide-react";
import { ImageUploadCustomField } from "./types";


/** Image component default */
export const defaultUploadImageField = {
    url: "",
    alt: "Uploaded Image",
}

/** Image upload field */
export const imageUploadField: ImageUploadCustomField = {
    type: "custom",
    label: "Image Upload",
    render: ({ value, onChange }) => {
        // Current state applied to the component
        const data = value || { url: "", alt: "" };

        // Local state for the file input selection before applying
        const [pendingUrl, setPendingUrl] = useState<string | null>(null);
        const fileInputRef = useRef<HTMLInputElement>(null);

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                setPendingUrl(URL.createObjectURL(file));
            }
        };

        const handleApply = () => {
            if (pendingUrl) {
                onChange({ ...data, url: pendingUrl });
                setPendingUrl(null); // Clear pending state after applying
            }
        };

        return (
            <FieldLabel label="Image" icon={<ImageIcon size={16} />}>
                <div className="mt-1 flex w-full flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    {/* Current Displayed Image */}
                    {data.url && (
                        <div className="relative overflow-hidden rounded border border-slate-300 bg-white">
                            <img src={data.url} alt={data.alt} className="max-h-32 w-full object-contain" />
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute right-2 top-2 h-6 w-6"
                                onClick={() => onChange({ url: "", alt: "" })}
                            >
                                <X size={12} />
                            </Button>
                        </div>
                    )}

                    {pendingUrl && !data.url && (
                        <div className="relative overflow-hidden rounded border border-slate-300 bg-white">
                            <img src={pendingUrl} alt={data.alt} className="max-h-32 w-full object-contain" />
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute right-2 top-2 h-6 w-6"
                                onClick={() => onChange({ url: "", alt: "" })}
                            >
                                <X size={12} />
                            </Button>
                        </div>
                    )}

                    {/* Upload and Apply UI */}
                    <div className="flex flex-cols gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {pendingUrl ? "Change File" : "Select File"}
                        </Button>

                        {pendingUrl && (
                            <Input
                                type="text"
                                placeholder="Describe this image"
                                value={data.alt}
                                onChange={(e) => onChange({ ...data, alt: e.target.value })}
                                className="text-xs"
                            />

                        )}
                    </div>
                    {pendingUrl && (
                        <Button type="button" size="sm" onClick={handleApply} className="gap-1">
                            <Check size={14} /> Apply
                        </Button>
                    )}



                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
            </FieldLabel>
        );
    },
};