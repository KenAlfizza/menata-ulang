/**
 * Generic interface for paginated results.
 * @template T The type of items contained in the list.
 */
export interface PaginatedResult<T> {
    /** The paginated slice of data */
    items: T[];
    /** Total count of items available in the database matching the filter */
    total: number;
    /** Current page number */
    page: number;
    /** Number of items returned per page */
    limit: number;
    /** Total number of pages available */
    totalPages: number;
}