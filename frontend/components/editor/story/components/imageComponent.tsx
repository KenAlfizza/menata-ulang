import { ImageProps } from "../types";

// Defaults and resolvers
import { defaultSize } from "../fields/size";
import { defaultCrop } from "../fields/crop";
import { resolvePixelStyles } from "../fields/spacing";

export function ImageComponent({ src, alt, resize, crop, spacing }: ImageProps) {
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