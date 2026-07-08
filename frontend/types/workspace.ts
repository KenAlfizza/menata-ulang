import { ResearchRecord } from "./research";

/**
 * Workspace research record model optimized for lightweight card feeds
 */
export type WorkspaceResearchRecord = Pick<
    ResearchRecord, 
    "id" | "title" | "description" | "published" | "updatedAt"
>;
