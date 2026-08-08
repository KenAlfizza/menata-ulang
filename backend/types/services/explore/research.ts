import { ResearchPageRecord, ResearchRecord } from "../../research.ts";

export class ExploreResearch {
    constructor(
        public puckData: ResearchPageRecord['puckData']
    ) { }
}

export class ExploreResearchSummary {
    constructor(
        public slug: ResearchRecord['slug'],
        public title: ResearchRecord['title'],
        public researcherName: ResearchRecord['researcherName'],
        public description: ResearchRecord['description'],
        public publishedAt: ResearchRecord['publishedAt'],
        public imageUrl: ResearchRecord['imageUrl'],
        public heartsCount: ResearchRecord['heartsCount']
    ) { }
}

