/**
 * Generic editor service result to handle Puck requests
 */
export type EditorServiceResult<T> = 
| { success: true, data: T }
| { success: false; 
    error: 
        'NOT_FOUND' |
        'UNAUTHORIZED' |
        'BAD_REQUEST' |
        'INTERNAL_ERROR'
  }