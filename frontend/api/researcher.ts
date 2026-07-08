const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { authFetch } from "./auth.ts";

/**
 * Research record model returned by backend
 */
export interface ResearchRecord {
    id: string,
    title: string,
    description: string,
    published: boolean,
    updatedAt: string,
}
