import type { ImageComponentType } from "./types";

// Import fields
import { Fields } from "@puckeditor/core";
import { resizeField } from "../fields/size.tsx";
import { cropField } from "../fields/crop.tsx";
import { spacingField } from "../fields/spacing.tsx";

// Defaults and resolvers
import { defaultSize } from "../fields/size";
import { defaultCrop } from "../fields/crop";
import { resolvePixelStyles } from "../fields/spacing";

/** Image component fields */
export const ImageComponentFields: Fields<ImageComponentType> = {
    src: { type: "text", label: "Image URL" },
    alt: { type: "text", label: "Alt Text" },
    resize: resizeField,
    crop: cropField,
    spacing: spacingField,
}

/** Image component render */
export function ImageComponent({ src, alt, resize, crop, spacing }: ImageComponentType) {
    const currentSize = resize || defaultSize;
    const currentCrop = crop || defaultCrop;
    const r = currentSize.borderRadius || defaultSize.borderRadius;

    const containerWidth = currentSize.width || "100%";
    const containerHeight = currentSize.height || "100%";
    const zoom = parseFloat(currentCrop.zoom) || 1;
    const cropX = currentCrop.cropX || "50%";
    const cropY = currentCrop.cropY || "50%";

    return (
        <div className="w-full flex justify-center items-center">
            <div
                style={{
                    ...resolvePixelStyles(spacing),
                    width: containerWidth,
                    height: containerHeight,
                    flexShrink: 0,
                    overflow: "hidden",
                    position: "relative",
                    borderRadius: `${r.tl}px ${r.tr}px ${r.br}px ${r.bl}px`,
                }}
                className="bg-slate-100/10 inline-block"
            >
                {src && (
                    <img
                        src={src}
                        alt={alt || "Story image"}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            transformOrigin: `${cropX} ${cropY}`,
                            transform: `scale(${zoom})`,
                        }}
                        className="transition-all duration-75 block"
                    />
                )}
            </div>
        </div>
    );
}