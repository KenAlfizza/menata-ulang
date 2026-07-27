/**
 * Represents the standard error response structure returned by the backend API.
 */
export interface ApiErrorResponse {
    success: boolean;
    error: {
        /** A human-readable description of the error */
        message: string;
        /** A machine-readable error code */
        code: string;
        /** Optional map of specific field-level validation errors */
        fields?: Record<string, string>;
    };
}

export class ApiError extends Error {
    public readonly success: boolean;
    public readonly code: string;
    public readonly status: number; // The HTTP header status code
    public readonly fields?: Record<string, string>;

    constructor(
        public readonly response: ApiErrorResponse, 
        status: number // Accept the HTTP response status code here
    ) {
        super(response.error.message);
        this.name = "ApiError";
        this.success = response.success;
        this.code = response.error.code;
        this.status = status;
        this.fields = response.error.fields;
    }
}