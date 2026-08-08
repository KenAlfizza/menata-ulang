import { StoryPageRecord, StoryRecord } from "../../story.ts";

export class ExploreStory {
    constructor(
        public puckData: StoryPageRecord['puckData']
    ) { }
}

export class ExploreStorySummary {
    constructor(
        public slug: StoryRecord['slug'],
        public title: StoryRecord['title'],
        public authorName: StoryRecord['authorName'],
        public description: StoryRecord['description'],
        public publishedAt: StoryRecord['publishedAt'],
        public imageUrl: StoryRecord['imageUrl'],
        public heartsCount: StoryRecord['heartsCount']
    ) { }
}

