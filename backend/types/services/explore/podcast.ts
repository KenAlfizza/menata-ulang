import { PodcastRecord } from "../../podcast.ts";

// 1. Data Structure Classes using type brackets []
export class ExplorePodcast {
  constructor(
    public slug: PodcastRecord['slug'],
    public title: PodcastRecord['title'],
    public description: PodcastRecord['description'],
    public transcript: PodcastRecord['transcript'],
    public duration: PodcastRecord['duration'],
    public audioUrl: PodcastRecord['audioUrl'],
    public imageUrl: PodcastRecord['imageUrl'],
    public hostName: PodcastRecord['hostName'],
    public hostId: PodcastRecord['hostId'],
    public threadId: PodcastRecord['threadId'],
    public heartsCount: PodcastRecord['heartsCount']
  ) { }
}

export class ExplorePodcastSummary {
  constructor(
    public slug: PodcastRecord['slug'],
    public title: PodcastRecord['title'],
    public description: PodcastRecord['description'],
    public hostName: PodcastRecord['hostName'],
    public hostId: PodcastRecord['hostId'],
    public imageUrl: PodcastRecord['imageUrl'],
    public audioUrl: PodcastRecord['audioUrl'],
    public publishedAt: PodcastRecord['publishedAt'],
    public heartsCount: PodcastRecord['heartsCount']
  ) { }
}
