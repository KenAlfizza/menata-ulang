import { Data } from "@puckeditor/core";

/**
 * `StoryPage` model returned by the backend.
 */
export interface StoryPageRecord {
  id: string;
  title: string;
  slug: string;
  puckData: Data;
  authorId: string;
  published: boolean;
}
