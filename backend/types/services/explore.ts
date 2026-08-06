/**
 * Explore services data type
 * A shared data type between API and Explore Services
 */

export type ExploreServiceResult<T> = 
| { succes: true; data: T }
| { succes: false;
    error: 
        'NOT_FOUND' |
        'BAD_REQUEST ' |
        'INTERNAL_ERROR'
  }