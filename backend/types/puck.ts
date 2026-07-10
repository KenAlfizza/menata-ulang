import { Prisma } from "../lib/prisma.ts";

export type PuckData = Prisma.InputJsonValue;

export function defaultPuckData(title: string): PuckData {
    return {
        content: [],
        root: { props: { title: title } }
    }
};