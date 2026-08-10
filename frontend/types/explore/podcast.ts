import { PodcastRecord } from "../podcast.ts";


/**
 * Explore podcast record
 */
export type ExplorePodcastRecord = Pick<
    PodcastRecord, 
    "slug" | 
    "title" | 
    "description" |
    "transcript" |
    'duration' |

    "audioUrl" |
    "imageUrl" | 

    "hostId" |
    "hostName" |

    "threadId" |
    
    "publishedAt" |
    "heartsCount"     
>;


/**
 * Explore podcast record model optimized for lightweight card feeds
 */
export type ExplorePodcastSummary = Pick<
    PodcastRecord, 
    "slug" | 
    "title" | 
    "description" |

    "hostId" |
    "hostName" |

    "imageUrl" | 
    "audioUrl" |
    'duration' |

    "publishedAt" |
    "heartsCount"
>;


