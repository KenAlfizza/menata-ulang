import type { ImageComponentType } from "./types";
import { Fields } from "@puckeditor/core";
import { resizeField } from "../fields/size.tsx";

// Import the static enabled/disabled fields
import { spacingField } from "../fields/spacing.tsx";
import { defaultSize } from "../fields/size";
import { resolvePixelStyles } from "../fields/spacing";
import { cropField, resolveCropClipPath } from "../fields/crop.tsx";

/** Image component fields */
export const ImageComponentFields: Fields<ImageComponentType> = {
    src: { type: "text", label: "Image URL" },
    alt: { type: "text", label: "Alt Text" },
    resize: resizeField,
    spacing: spacingField,
    crop: cropField,
};

/** Image component render */
export function ImageComponent({ src, alt, resize, spacing, crop }: ImageComponentType) {
    const currentSize = resize || defaultSize;
    const r = currentSize.borderRadius || defaultSize.borderRadius;

    const containerWidth = currentSize.width || "100%";
    const hasExplicitHeight = Boolean(currentSize.height);
    
    // Generate the CSS clip-path inset rule based on side inputs
    const clipPathStyle = resolveCropClipPath(crop);

    return (
        <div className="w-full flex justify-center items-center">
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
                        style={{ clipPath: clipPathStyle }} 
                        className="absolute inset-0 flex items-center justify-center w-full h-full"
                    >
                        <img
                            src={src}
                            alt={alt || "Story image"}
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
                        style={{ clipPath: clipPathStyle }}
                        className="w-full flex items-center justify-center"
                    >
                        <img
                            src={src}
                            alt={alt || "Story image"}
                            style={{ 
                                width: "100%", 
                                height: "auto", 
                                display: "block"
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}