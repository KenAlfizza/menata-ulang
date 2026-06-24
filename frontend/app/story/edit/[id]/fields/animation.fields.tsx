import { Fields } from "@puckeditor/core";
import { FlexContainerProps, ImageProps, SlotProps, TextProps, TitleProps } from "@/components/story/edit/types.tsx";
import { Mouse, Sparkles } from "lucide-react";

type TitleAnimationProps = Omit<TitleProps, "title" | "typography" | "spacing">;

export const animationFields: {
    Title: Fields<TitleAnimationProps>
    Text: Fields;
    Slot: Fields;
    Image: Fields;
    Container: Fields;
} = {
    Title: {
        clickAction: {
            type: "select",
            labelIcon: <Mouse size={16}/>,
            label: "Click Action",
            options: [{ label: "Confetti", value: "confetti" }],
        },
        hoverAction: {
            type: "select",
            labelIcon: <Sparkles size={16}/>,
            label: "Hover Action",
            options: [{ label: "Scale Up", value: "scale_up" }],
        },
    },
    Text: {},
    Slot: {},
    Image: {},
    Container: {},
}