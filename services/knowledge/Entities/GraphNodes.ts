// Sprint M7.1 — Knowledge Graph: Entity Definitions

export type NodeType =
  | 'media'
  | 'bhajan'
  | 'book'
  | 'saint'
  | 'event'
  | 'speaker'
  | 'category'
  | 'tag'
  | 'language'
  | 'author'
  | 'playlist'
  | 'user';

export type EdgeRelation =
  | 'HAS_CATEGORY'
  | 'SPOKEN_BY'
  | 'HAS_TAG'
  | 'RELATED_TO'
  | 'IN_PLAYLIST'
  | 'FAVORITED_BY'
  | 'HAS_LANGUAGE'
  | 'AUTHORED_BY'
  | 'PART_OF_EVENT'
  | 'FEATURES_SPEAKER'
  | 'SIMILAR_TO'
  | 'CONTINUES_FROM'
  | 'RECOMMENDED_WITH'
  | 'BELONGS_TO_PLAYLIST'
  | 'CREATED_BY'
  | 'TRANSLATED_TO';

export interface GraphNode {
  nodeId: string;
  nodeType: NodeType;
  label: string;
  attributes?: Record<string, any>;
  embedding?: number[];
  weight?: number;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export interface GraphEdge {
  edgeId: string;
  sourceId: string;
  targetId: string;
  relation: EdgeRelation;
  weight: number;
  attributes?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export interface MediaNode extends GraphNode {
  nodeType: 'media' | 'bhajan' | 'book';
  attributes: {
    title: string;
    description?: string;
    category: string;
    type: 'audio' | 'video' | 'book' | 'article';
    language: string;
    tags: string[];
    eventId?: string;
    eventName?: string;
    speaker?: string;
    durationSeconds?: number;
    playCount?: number;
    likeCount?: number;
    viewCount?: number;
    trendingScore?: number;
    publishedAt?: string;
    thumbnailUrl?: string;
    mediaUrl?: string;
    author?: string;
    isPublished: boolean;
    metadata?: Record<string, any>;
  };
}

export interface CategoryNode extends GraphNode {
  nodeType: 'category';
  attributes: {
    name: string;
    displayName: string;
    description?: string;
    parentCategoryId?: string;
    itemCount: number;
    sortOrder: number;
    isActive: boolean;
    icon?: string;
    color?: string;
  };
}

export interface SpeakerNode extends GraphNode {
  nodeType: 'speaker' | 'saint';
  attributes: {
    name: string;
    displayName: string;
    bio?: string;
    imageUrl?: string;
    language?: string;
    totalMediaCount: number;
    totalPlayCount: number;
    isSaint: boolean;
    birthYear?: number;
    deathYear?: number;
    lineage?: string;
    associatedCategories: string[];
    tags: string[];
  };
}

export interface TagNode extends GraphNode {
  nodeType: 'tag';
  attributes: {
    name: string;
    displayName: string;
    category?: string;
    usageCount: number;
    isTrending: boolean;
    relatedTags: string[];
  };
}

export interface LanguageNode extends GraphNode {
  nodeType: 'language';
  attributes: {
    code: string;
    name: string;
    nativeName: string;
    script?: string;
    direction: 'ltr' | 'rtl';
    mediaCount: number;
    isActive: boolean;
    flagEmoji?: string;
  };
}

export interface AuthorNode extends GraphNode {
  nodeType: 'author';
  attributes: {
    name: string;
    displayName: string;
    bio?: string;
    imageUrl?: string;
    totalBooks: number;
    totalMedia: number;
    language?: string;
    birthYear?: number;
    deathYear?: number;
    categories: string[];
  };
}

export interface EventNode extends GraphNode {
  nodeType: 'event';
  attributes: {
    name: string;
    displayName: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    eventType: 'bhandara' | 'satsang' | 'katha' | 'festival' | 'anniversary' | 'other';
    totalMediaCount: number;
    totalAttendees?: number;
    isRecurring: boolean;
    bannerUrl?: string;
    tags: string[];
  };
}

export interface PlaylistNode extends GraphNode {
  nodeType: 'playlist';
  attributes: {
    name: string;
    description?: string;
    type: 'ai_generated' | 'user_created' | 'auto' | 'favorites' | 'shared' | 'offline';
    ownerId?: string;
    isPublic: boolean;
    itemCount: number;
    totalDurationSeconds: number;
    tags: string[];
    coverImageUrl?: string;
    isCollaborative: boolean;
    followersCount: number;
    createdBy?: string;
    metadata?: Record<string, any>;
  };
}

export interface UserNode extends GraphNode {
  nodeType: 'user';
  attributes: {
    userId: string;
    displayName?: string;
    email?: string;
    avatarUrl?: string;
    favoriteCategories: string[];
    favoriteSpeakers: string[];
    favoriteLanguages: string[];
    totalPlayCount: number;
    totalListenTimeSeconds: number;
    joinDate: string;
    tier: 'free' | 'premium' | 'supporter';
    preferences?: Record<string, any>;
  };
}

export interface GraphPath {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalWeight: number;
  pathLength: number;
}

export interface GraphQueryOptions {
  nodeTypes?: NodeType[];
  relations?: EdgeRelation[];
  maxDepth?: number;
  maxResults?: number;
  minWeight?: number;
  includeEmbeddings?: boolean;
  direction?: 'outgoing' | 'incoming' | 'both';
}

export interface GraphTraversalOptions {
  maxDepth: number;
  maxNodes: number;
  relationFilter?: EdgeRelation[];
  nodeTypeFilter?: NodeType[];
  weightThreshold?: number;
}

export type NodeConstructor<T extends GraphNode> = new (data: Partial<T>) => T;

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  media: 'Media',
  bhajan: 'Bhajan',
  book: 'Book',
  saint: 'Saint',
  event: 'Event',
  speaker: 'Speaker',
  category: 'Category',
  tag: 'Tag',
  language: 'Language',
  author: 'Author',
  playlist: 'Playlist',
  user: 'User',
};

export const EDGE_RELATION_LABELS: Record<EdgeRelation, string> = {
  HAS_CATEGORY: 'Has Category',
  SPOKEN_BY: 'Spoken By',
  HAS_TAG: 'Has Tag',
  RELATED_TO: 'Related To',
  IN_PLAYLIST: 'In Playlist',
  FAVORITED_BY: 'Favorited By',
  HAS_LANGUAGE: 'Has Language',
  AUTHORED_BY: 'Authored By',
  PART_OF_EVENT: 'Part Of Event',
  FEATURES_SPEAKER: 'Features Speaker',
  SIMILAR_TO: 'Similar To',
  CONTINUES_FROM: 'Continues From',
  RECOMMENDED_WITH: 'Recommended With',
  BELONGS_TO_PLAYLIST: 'Belongs To Playlist',
  CREATED_BY: 'Created By',
  TRANSLATED_TO: 'Translated To',
};