import { ComponentConfig } from "@puckeditor/core";
import { Fields } from "@puckeditor/core";

import { RootComponentType } from "../components/types.tsx";
import { colorPickerField, getColor } from "../fields/color.tsx";
import { paddingField, resolvePaddingStyles } from "../fields/padding.tsx";

export const RootComponentFields: Fields<RootComponentType> = {
    padding: paddingField,
    color: colorPickerField,
};

export const RootComponent: ComponentConfig<RootComponentType>["render"] = ({
    padding,
    color,
    children,
}) => {
    return (
        <div
            className="h-full"
            style={{
                ...resolvePaddingStyles(padding),
                backgroundColor: getColor(color),
            }}
        >
            {children}
        </div>
    );
};