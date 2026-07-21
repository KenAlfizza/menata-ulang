import type { ImageComponentType } from "./types";
import { Fields } from "@puckeditor/core";
import { resizeField } from "../fields/size.tsx";

// Import the static enabled/disabled fields
import { spacingField } from "../fields/spacing.tsx";
import { defaultSize } from "../fields/size";
import { resolvePixelStyles } from "../fields/spacing";
import { imageUploadField } from "../fields/upload-image.tsx";
import { Image } from "lucide-react";

/** Image component fields */
export const ImageComponentFields: Fields<ImageComponentType> = {
    imageUpload: imageUploadField,
    resize: resizeField,
    spacing: spacingField,
};

/** Image component render */
export function ImageComponent({ imageUpload, resize, spacing }: ImageComponentType) {
    const currentSize = resize || defaultSize;
    const r = currentSize.borderRadius || defaultSize.borderRadius;

    const containerWidth = currentSize.width || "100%";
    const hasExplicitHeight = Boolean(currentSize.height);

    const src = imageUpload.url
    const alt = imageUpload.alt
    
    return (
        <div className="flex justify-center items-center min-w-8 min-h-8">
            <div
                style={{
                    ...resolvePixelStyles(spacing),
                    width: containerWidth,
                    height: hasExplicitHeight ? currentSize.height : "auto",
                    flexShrink: 0,
                    overflow: "hidden",
                    position: "relative",
                    borderRadius: `${r.tl}px ${r.tr}px ${r.br}px ${r.bl}px`,
                }}
                className="bg-slate-100/10 inline-block"
            >
                {src && hasExplicitHeight && (
                    <div  
                        className="absolute inset-0 flex items-center justify-center h-full"
                    >
                        <img
                            src={src}
                            alt={alt}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center",
                            }}
                            className="transition-all duration-75 block"
                        />
                    </div>
                )}
                
                {src && !hasExplicitHeight && (
                    <div 
                        className="flex items-center justify-center"
                    >
                        <img
                            src={src}
                            alt={alt}
                            style={{ 
                                width: "100%", 
                                height: "auto", 
                                display: "block"
                            }}
                        />
                    </div>
                )}

                {!src && (
                    <div className="flex items-center justify-center p-8 text-zinc-200">
                        <Image size={64}/>
                    </div>
                )}
            </div>
        </div>
    );
}