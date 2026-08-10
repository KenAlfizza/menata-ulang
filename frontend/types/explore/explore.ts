export interface ExploreFilter {
    search?: string;
    limit: number;
    page: number;
    sort?: "title" | "updatedAt";
    order?: "asc" | "desc";
}

