import { PodcastRecord } from "../../podcast.ts";

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
    public publishedAt: PodcastRecord['publishedAt'],
    public heartsCount: PodcastRecord['heartsCount']
  ) { }
}

export class ExplorePodcastSummary {
  constructor(
    public slug: PodcastRecord['slug'],
    public title: PodcastRecord['title'],
    public description: PodcastRecord['description'],
    public duration: PodcastRecord['duration'],
    public hostName: PodcastRecord['hostName'],
    public hostId: PodcastRecord['hostId'],
    public audioUrl: PodcastRecord['audioUrl'],
    public imageUrl: PodcastRecord['imageUrl'],
    public publishedAt: PodcastRecord['publishedAt'],
    public heartsCount: PodcastRecord['heartsCount']
  ) { }
}
