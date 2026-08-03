/**
 * Host services data type
 * Shared data type between API and Author Services
 */

import { PodcastRecord } from "../podcast.ts";

// Services response data type
export type HostServiceResult<PodcastRecord> =
| { success: true; data: PodcastRecord }
| { success: false; 
    error: 
        'SLUG_TAKEN' | 
        'NOT_FOUND' |
        'UNAUTHORIZED' |
        'BAD_REQUEST' |
        'INTERNAL_ERROR'
  }

export interface CreatePodcastData extends Pick<
  PodcastRecord,
  'slug' |
  'title' |
  'description' |
  'transcript'
> {
    audio?: File,
    image?: File,
}

export interface UpdatePodcastData extends Partial<Pick<
    PodcastRecord,
    'slug' |
    'title' |
    'description' |
    'transcript' |
    'published'
>> {
    audio?: File,
    image?: File
}