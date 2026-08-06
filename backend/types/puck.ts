import { Prisma } from "../lib/prisma.ts";

export type PuckInputData = Prisma.InputJsonValue;
export type PuckOutputData = Prisma.JsonValue;

export function defaultPuckData(): PuckInputData {
    return {
        content: [],
        root: { props: {} }
    }
};