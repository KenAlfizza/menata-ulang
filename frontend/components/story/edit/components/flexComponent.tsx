import { FlexContainerProps } from "../types";
import { useRef } from "react";

export function FlexComponent({ direction, slot: Slot }: FlexContainerProps) {
    const clickTimer = useRef<NodeJS.Timeout | null>(null);

    const handleClick = (e: React.MouseEvent) => {
        if (clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
            return;
        }

        clickTimer.current = setTimeout(() => {
            // Single click:
            // allow Puck to select this FlexContainer
            clickTimer.current = null;
        }, 200);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        // Let the child component receive the selection
        e.stopPropagation();

        const target = e.target as HTMLElement;
        const child = target.closest("[data-puck-component]");

        if (child) {
            child.dispatchEvent(
                new MouseEvent("click", {
                    bubbles: true,
                })
            );
        }
    };

    return (
        <div
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            style={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: direction,
                width: "100%",
                minHeight: "100px",
            }}
        >
            <Slot />
        </div>
    );
}