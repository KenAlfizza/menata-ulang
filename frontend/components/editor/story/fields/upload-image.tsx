import { useState, useRef } from "react";
import { FieldLabel } from "@puckeditor/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, X, Check, Loader2 } from "lucide-react";
import { ImageUploadCustomField } from "./types";
import { uploadImage } from "@/services/editor/common.ts"; 
import { getFullImageUrl } from "@/utils/url.ts"

/** Image component default */
export const defaultUploadImageField = {
    url: "",
    alt: "Uploaded Image",
}

/** 
 * Image upload field factory.
 * Requires the accessToken to authenticate the upload request to your backend.
 */
export const createImageUploadField = (accessToken: string): ImageUploadCustomField => ({
    type: "custom",
    label: "Image Upload",
    render: ({ value, onChange }) => {
        // Current state applied to the component
        const data = value || { url: "", alt: "" };

        // Local state for the file upload process
        const [pendingFile, setPendingFile] = useState<File | null>(null);
        const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
        const [isUploading, setIsUploading] = useState(false);
        
        const fileInputRef = useRef<HTMLInputElement>(null);

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                setPendingFile(file); // Save the actual file for the upload
                setPendingPreviewUrl(URL.createObjectURL(file)); // Show local preview instantly
            }
        };

        const handleApply = async () => {
            if (!pendingFile) return;

            setIsUploading(true);
            try {
                // 1. Upload to backend
                const { imageUrl } = await uploadImage(accessToken, pendingFile);
                
                // 2. Save the permanent URL to Puck's state
                onChange({ ...data, url: imageUrl });
                
                // 3. Clear pending states
                setPendingFile(null);
                setPendingPreviewUrl(null);
            } catch (error: any) {
                console.error("Upload failed:", error);
                
                let alertMessage = "An unexpected error occurred";

                try {
                    // Extract the message string safely
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    
                    // Strip the "Error: " prefix
                    const errorString = errorMessage.replace(/^Error:\s*/, '');
                    
                    // Parse the JSON
                    const parsedError = JSON.parse(errorString);
                    
                    // 1st priority: Get the specific image validation error (e.g., "Image size is maximum 10MB")
                    // 2nd priority: Get the general message (e.g., "Validation failed")
                    if (parsedError?.fields?.image) {
                        alertMessage = parsedError.fields.image;
                    } else if (parsedError?.message) {
                        alertMessage = parsedError.message;
                    }
                } catch (parseError) {
                    // Fallback if the error isn't JSON or parsing fails
                    alertMessage = error?.response?.data?.message || (error instanceof Error ? error.message : "Something went wrong");
                }

                alert(`Upload failed: ${alertMessage}. Please try again.`);
            } finally {
                setIsUploading(false);
            }
        };
        
        return (
            <FieldLabel label="Image" icon={<ImageIcon size={16} />}>
                <div className="mt-1 flex w-full flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    
                    {/* Current Displayed Image (Only show if we aren't previewing a new upload) */}
                    {data.url && !pendingPreviewUrl && (
                        <div className="relative overflow-hidden rounded border border-slate-300 bg-white">
                            <img src={data.url} alt={data.alt} className="max-h-32 w-full object-contain" />
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute right-2 top-2 h-6 w-6"
                                onClick={() => onChange({ url: "", alt: "" })}
                                disabled={isUploading}
                            >
                                <X size={12} />
                            </Button>
                        </div>
                    )}

                    {/* Pending Local Preview */}
                    {pendingPreviewUrl && (
                        <div className="relative overflow-hidden rounded border border-slate-300 bg-white">
                            <img src={pendingPreviewUrl} alt="Pending upload preview" className="max-h-32 w-full object-contain opacity-75" />
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute right-2 top-2 h-6 w-6"
                                onClick={() => {
                                    setPendingFile(null);
                                    setPendingPreviewUrl(null);
                                }}
                                disabled={isUploading}
                            >
                                <X size={12} />
                            </Button>
                        </div>
                    )}

                    {/* Upload and Apply UI */}
                    <div className="flex flex-col gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full text-xs"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {pendingPreviewUrl || data.url ? "Change File" : "Select File"}
                        </Button>

                        {(pendingPreviewUrl || data.url) && (
                            <Input
                                type="text"
                                placeholder="Describe this image (Alt text)"
                                value={data.alt}
                                onChange={(e) => onChange({ ...data, alt: e.target.value })}
                                className="text-xs"
                                disabled={isUploading}
                            />
                        )}
                    </div>
                    
                    {pendingPreviewUrl && (
                        <Button 
                            type="button" 
                            size="sm" 
                            onClick={handleApply} 
                            disabled={isUploading} 
                            className="gap-1"
                        >
                            {isUploading ? "Uploading..." : <><Check size={14} /> Upload</>}
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
});