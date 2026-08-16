// Sprint M7.1 — Knowledge Graph: Graph Query Engine

import { GraphEngine } from '../GraphEngine/GraphEngine';
import {
  GraphNode,
  GraphEdge,
  GraphPath,
  NodeType,
  EdgeRelation,
  GraphQueryOptions,
  GraphTraversalOptions,
  MediaNode,
  CategoryNode,
  SpeakerNode,
  TagNode,
  LanguageNode,
  AuthorNode,
  EventNode,
  PlaylistNode,
  UserNode,
} from '../Entities/GraphNodes';

export interface QueryResult<T = GraphNode> {
  items: T[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    cursor?: string;
  };
  aggregations?: Record<string, any>;
}

export interface RecommendationQueryOptions {
  userId?: string;
  mediaId?: string;
  category?: string;
  language?: string;
  speaker?: string;
  eventId?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  strategy?: 'content' | 'collaborative' | 'hybrid' | 'trending' | 'continue' | 'similar';
  minScore?: number;
  excludeMediaIds?: string[];
  includeExplanations?: boolean;
}

export interface RecommendationExplanation {
  reason: string;
  factors: { factor: string; weight: number; value: number }[];
  confidence: number;
}

export interface RecommendedItem<T extends GraphNode = GraphNode> {
  item: T;
  score: number;
  explanation?: RecommendationExplanation;
  strategy: string;
}

export class GraphQueryEngine {
  private graphEngine: GraphEngine;

  constructor(graphEngine: GraphEngine) {
    this.graphEngine = graphEngine;
  }

  // ==================== NODE QUERIES ====================

  public findMediaById(mediaId: string): MediaNode | undefined {
    const nodeId = `media_${mediaId}`;
    return this.graphEngine.getNode(nodeId) as MediaNode | undefined;
  }

  public findMediaByIds(mediaIds: string[]): MediaNode[] {
    return mediaIds
      .map(id => this.findMediaById(id))
      .filter((m): m is MediaNode => m !== undefined);
  }

  public searchMedia(query: string, options: {
    categories?: string[];
    languages?: string[];
    speakers?: string[];
    tags?: string[];
    types?: ('audio' | 'video' | 'book' | 'article')[];
    publishedOnly?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'relevance' | 'popularity' | 'recent' | 'trending';
  } = {}): QueryResult<MediaNode> {
    const {
      categories,
      languages,
      speakers,
      tags,
      types,
      publishedOnly = true,
      limit = 20,
      offset = 0,
      sortBy = 'relevance',
    } = options;

    // Start with text search
    let results = this.graphEngine.searchNodes(query, {
      nodeTypes: ['media', 'bhajan', 'book'],
      limit: limit * 3, // Get more for filtering
    });

    // Apply filters
    if (categories && categories.length > 0) {
      results = results.filter(m => categories.includes((m as MediaNode).attributes.category));
    }
    if (languages && languages.length > 0) {
      results = results.filter(m => languages.includes((m as MediaNode).attributes.language));
    }
    if (speakers && speakers.length > 0) {
      results = results.filter(m => speakers.includes((m as MediaNode).attributes.speaker || ''));
    }
    if (tags && tags.length > 0) {
      results = results.filter(m => {
        const mediaTags = (m as MediaNode).attributes.tags || [];
        return tags.some(t => mediaTags.includes(t));
      });
    }
    if (types && types.length > 0) {
      results = results.filter(m => types.includes((m as MediaNode).attributes.type));
    }
    if (publishedOnly) {
      results = results.filter(m => (m as MediaNode).attributes.isPublished !== false);
    }

    // Sort
    switch (sortBy) {
      case 'popularity':
        results.sort((a, b) =>
          ((b as MediaNode).attributes.playCount || 0) - ((a as MediaNode).attributes.playCount || 0)
        );
        break;
      case 'recent':
        results.sort((a, b) => {
          const dateA = (a as MediaNode).attributes.publishedAt ? new Date((a as MediaNode).attributes.publishedAt!).getTime() : 0;
          const dateB = (b as MediaNode).attributes.publishedAt ? new Date((b as MediaNode).attributes.publishedAt!).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'trending':
        results.sort((a, b) =>
          ((b as MediaNode).attributes.trendingScore || 0) - ((a as MediaNode).attributes.trendingScore || 0)
        );
        break;
      case 'relevance':
      default:
        // Already sorted by search relevance
        break;
    }

    const totalCount = results.length;
    const paginated = results.slice(offset, offset + limit);

    return {
      items: paginated,
      totalCount,
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
        cursor: offset + limit < totalCount ? String(offset + limit) : undefined,
      },
    };
  }

  public getMediaByCategory(categoryId: string, options: {
    limit?: number;
    offset?: number;
    language?: string;
    type?: string;
    sortBy?: 'popularity' | 'recent' | 'trending';
  } = {}): QueryResult<MediaNode> {
    const { limit = 20, offset = 0, language, type, sortBy = 'popularity' } = options;

    const categoryNodeId = `cat_${categoryId}`;
    const neighbors = this.graphEngine.getNeighbors(categoryNodeId, {
      relations: ['HAS_CATEGORY'],
      direction: 'incoming',
      nodeTypes: ['media', 'bhajan', 'book'],
      maxResults: limit * 3,
    });

    let media = neighbors.nodes as MediaNode[];

    if (language) {
      media = media.filter(m => m.attributes.language === language);
    }
    if (type) {
      media = media.filter(m => m.attributes.type === type);
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        media.sort((a, b) => {
          const dateA = a.attributes.publishedAt ? new Date(a.attributes.publishedAt).getTime() : 0;
          const dateB = b.attributes.publishedAt ? new Date(b.attributes.publishedAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'trending':
        media.sort((a, b) =>
          (b.attributes.trendingScore || 0) - (a.attributes.trendingScore || 0)
        );
        break;
      case 'popularity':
      default:
        media.sort((a, b) =>
          (b.attributes.playCount || 0) - (a.attributes.playCount || 0)
        );
        break;
    }

    const totalCount = media.length;
    const paginated = media.slice(offset, offset + limit);

    return {
      items: paginated,
      totalCount,
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
      },
    };
  }

  public getMediaBySpeaker(speakerId: string, options: {
    limit?: number;
    offset?: number;
    category?: string;
    language?: string;
  } = {}): QueryResult<MediaNode> {
    const { limit = 20, offset = 0, category, language } = options;

    const speakerNodeId = `speaker_${speakerId.toLowerCase().replace(/\s+/g, '_')}`;
    const neighbors = this.graphEngine.getNeighbors(speakerNodeId, {
      relations: ['SPOKEN_BY'],
      direction: 'incoming',
      nodeTypes: ['media', 'bhajan', 'book'],
      maxResults: limit * 3,
    });

    let media = neighbors.nodes as MediaNode[];

    if (category) {
      media = media.filter(m => m.attributes.category === category);
    }
    if (language) {
      media = media.filter(m => m.attributes.language === language);
    }

    media.sort((a, b) =>
      (b.attributes.playCount || 0) - (a.attributes.playCount || 0)
    );

    const totalCount = media.length;
    const paginated = media.slice(offset, offset + limit);

    return {
      items: paginated,
      totalCount,
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
      },
    };
  }

  public getMediaByTag(tagId: string, options: {
    limit?: number;
    offset?: number;
  } = {}): QueryResult<MediaNode> {
    const { limit = 20, offset = 0 } = options;

    const tagNodeId = `tag_${tagId}`;
    const neighbors = this.graphEngine.getNeighbors(tagNodeId, {
      relations: ['HAS_TAG'],
      direction: 'incoming',
      nodeTypes: ['media', 'bhajan', 'book'],
      maxResults: limit * 2,
    });

    const media = neighbors.nodes as MediaNode[];
    media.sort((a, b) =>
      (b.attributes.playCount || 0) - (a.attributes.playCount || 0)
    );

    const totalCount = media.length;
    const paginated = media.slice(offset, offset + limit);

    return {
      items: paginated,
      totalCount,
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
      },
    };
  }

  public getMediaByLanguage(languageId: string, options: {
    limit?: number;
    offset?: number;
    category?: string;
  } = {}): QueryResult<MediaNode> {
    const { limit = 20, offset = 0, category } = options;

    const langNodeId = `lang_${languageId}`;
    const neighbors = this.graphEngine.getNeighbors(langNodeId, {
      relations: ['HAS_LANGUAGE'],
      direction: 'incoming',
      nodeTypes: ['media', 'bhajan', 'book'],
      maxResults: limit * 3,
    });

    let media = neighbors.nodes as MediaNode[];

    if (category) {
      media = media.filter(m => m.attributes.category === category);
    }

    media.sort((a, b) =>
      (b.attributes.playCount || 0) - (a.attributes.playCount || 0)
    );

    const totalCount = media.length;
    const paginated = media.slice(offset, offset + limit);

    return {
      items: paginated,
      totalCount,
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
      },
    };
  }

  public getMediaByEvent(eventId: string, options: {
    limit?: number;
    offset?: number;
  } = {}): QueryResult<MediaNode> {
    const { limit = 20, offset = 0 } = options;

    const eventNodeId = `event_${eventId}`;
    const neighbors = this.graphEngine.getNeighbors(eventNodeId, {
      relations: ['PART_OF_EVENT'],
      direction: 'incoming',
      nodeTypes: ['media', 'bhajan', 'book'],
      maxResults: limit * 2,
    });

    const media = neighbors.nodes as MediaNode[];
    media.sort((a, b) => {
      const dateA = a.attributes.publishedAt ? new Date(a.attributes.publishedAt).getTime() : 0;
      const dateB = b.attributes.publishedAt ? new Date(b.attributes.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

    const totalCount = media.length;
    const paginated = media.slice(offset, offset + limit);

    return {
      items: paginated,
      totalCount,
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
      },
    };
  }

  public getMediaByAuthor(authorId: string, options: {
    limit?: number;
    offset?: number;
  } = {}): QueryResult<MediaNode> {
    const { limit = 20, offset = 0 } = options;

    const authorNodeId = `author_${authorId}`;
    const neighbors = this.graphEngine.getNeighbors(authorNodeId, {
      relations: ['AUTHORED_BY'],
      direction: 'incoming',
      nodeTypes: ['media', 'bhajan', 'book'],
      maxResults: limit * 2,
    });

    const media = neighbors.nodes as MediaNode[];
    media.sort((a, b) =>
      (b.attributes.playCount || 0) - (a.attributes.playCount || 0)
    );

    const totalCount = media.length;
    const paginated = media.slice(offset, offset + limit);

    return {
      items: paginated,
      totalCount,
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
      },
    };
  }

  // ==================== RELATIONSHIP QUERIES ====================

  public getMediaCategories(mediaId: string): CategoryNode[] {
    const mediaNodeId = `media_${mediaId}`;
    const neighbors = this.graphEngine.getNeighbors(mediaNodeId, {
      relations: ['HAS_CATEGORY'],
      direction: 'outgoing',
      nodeTypes: ['category'],
    });
    return neighbors.nodes as CategoryNode[];
  }

  public getMediaSpeakers(mediaId: string): SpeakerNode[] {
    const mediaNodeId = `media_${mediaId}`;
    const neighbors = this.graphEngine.getNeighbors(mediaNodeId, {
      relations: ['SPOKEN_BY'],
      direction: 'outgoing',
      nodeTypes: ['speaker', 'saint'],
    });
    return neighbors.nodes as SpeakerNode[];
  }

  public getMediaTags(mediaId: string): TagNode[] {
    const mediaNodeId = `media_${mediaId}`;
    const neighbors = this.graphEngine.getNeighbors(mediaNodeId, {
      relations: ['HAS_TAG'],
      direction: 'outgoing',
      nodeTypes: ['tag'],
    });
    return neighbors.nodes as TagNode[];
  }

  public getMediaLanguage(mediaId: string): LanguageNode | undefined {
    const mediaNodeId = `media_${mediaId}`;
    const neighbors = this.graphEngine.getNeighbors(mediaNodeId, {
      relations: ['HAS_LANGUAGE'],
      direction: 'outgoing',
      nodeTypes: ['language'],
    });
    return neighbors.nodes[0] as LanguageNode | undefined;
  }

  public getMediaAuthor(mediaId: string): AuthorNode | undefined {
    const mediaNodeId = `media_${mediaId}`;
    const neighbors = this.graphEngine.getNeighbors(mediaNodeId, {
      relations: ['AUTHORED_BY'],
      direction: 'outgoing',
      nodeTypes: ['author'],
    });
    return neighbors.nodes[0] as AuthorNode | undefined;
  }

  public getMediaEvent(mediaId: string): EventNode | undefined {
    const mediaNodeId = `media_${mediaId}`;
    const neighbors = this.graphEngine.getNeighbors(mediaNodeId, {
      relations: ['PART_OF_EVENT'],
      direction: 'outgoing',
      nodeTypes: ['event'],
    });
    return neighbors.nodes[0] as EventNode | undefined;
  }

  public getMediaPlaylists(mediaId: string): PlaylistNode[] {
    const mediaNodeId = `media_${mediaId}`;
    const neighbors = this.graphEngine.getNeighbors(mediaNodeId, {
      relations: ['IN_PLAYLIST'],
      direction: 'outgoing',
      nodeTypes: ['playlist'],
    });
    return neighbors.nodes as PlaylistNode[];
  }

  // ==================== RECOMMENDATION QUERIES ====================

  public getSimilarMedia(mediaId: string, options: {
    limit?: number;
    minScore?: number;
    excludeMediaIds?: string[];
    useEmbeddings?: boolean;
  } = {}): RecommendedItem<MediaNode>[] {
    const { limit = 10, minScore = 0.1, excludeMediaIds = [], useEmbeddings = false } = options;

    const mediaNodeId = `media_${mediaId}`;
    const targetMedia = this.graphEngine.getNode(mediaNodeId) as MediaNode | undefined;
    if (!targetMedia) return [];

    const neighbors = this.graphEngine.getNeighbors(mediaNodeId, {
      relations: ['SIMILAR_TO'],
      direction: 'outgoing',
      nodeTypes: ['media', 'bhajan', 'book'],
      minWeight: minScore,
      maxResults: limit * 2,
    });

    let similar = neighbors.nodes as MediaNode[];
    similar = similar.filter(m => !excludeMediaIds.includes(m.nodeId.replace('media_', '')));

    return similar.slice(0, limit).map((media, index) => ({
      item: media,
      score: neighbors.edges[index]?.weight || 0,
      strategy: 'similar',
      explanation: {
        reason: `Similar to ${targetMedia.attributes.title}`,
        factors: [
          { factor: 'metadata_similarity', weight: 1.0, value: neighbors.edges[index]?.weight || 0 },
        ],
        confidence: neighbors.edges[index]?.weight || 0,
      },
    }));
  }

  public getTrendingMedia(options: {
    category?: string;
    language?: string;
    limit?: number;
    timeWindowDays?: number;
  } = {}): RecommendedItem<MediaNode>[] {
    const { category, language, limit = 10, timeWindowDays = 7 } = options;

    let candidates = this.graphEngine.getNodesByType('media') as MediaNode[];
    candidates = candidates.concat(this.graphEngine.getNodesByType('bhajan') as MediaNode[]);
    candidates = candidates.concat(this.graphEngine.getNodesByType('book') as MediaNode[]);

    if (category) {
      candidates = candidates.filter(m => m.attributes.category === category);
    }
    if (language) {
      candidates = candidates.filter(m => m.attributes.language === language);
    }

    const now = Date.now();
    const windowMs = timeWindowDays * 24 * 60 * 60 * 1000;

    const scored = candidates.map(media => {
      const views = media.attributes.viewCount || 0;
      const plays = media.attributes.playCount || 0;
      const likes = media.attributes.likeCount || 0;
      const pubTime = media.attributes.publishedAt ? new Date(media.attributes.publishedAt).getTime() : now;
      const ageHours = Math.max(1, (now - pubTime) / (1000 * 3600));

      // Recency boost
      const recencyBoost = ageHours < (timeWindowDays * 24) ? 1.5 : 1.0;

      // Velocity formula
      const rawScore = (views * 1.0 + plays * 2.0 + likes * 3.0 + 5.0) / Math.pow(ageHours + 2, 0.5) * recencyBoost;

      return { media, score: rawScore };
    });

    let maxScore = 1;
    for (const s of scored) {
      if (s.score > maxScore) maxScore = s.score;
    }

    return scored
      .map(s => ({
        item: s.media,
        score: Math.min(1.0, s.score / maxScore),
        strategy: 'trending',
        explanation: {
          reason: 'Trending in the community',
          factors: [
            { factor: 'velocity', weight: 0.6, value: s.score / maxScore },
            { factor: 'recency', weight: 0.4, value: s.media.attributes.publishedAt ? 1 : 0 },
          ],
          confidence: Math.min(1.0, s.score / maxScore),
        },
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  public getContinueListening(userId: string, options: {
    limit?: number;
  } = {}): RecommendedItem<MediaNode>[] {
    const { limit = 10 } = options;

    const userNodeId = `user_${userId}`;
    const neighbors = this.graphEngine.getNeighbors(userNodeId, {
      relations: ['FAVORITED_BY'],
      direction: 'outgoing',
      nodeTypes: ['media', 'bhajan', 'book'],
      maxResults: limit * 2,
    });

    // Filter to items with progress between 5% and 95%
    // This would need playback state - for now return favorites
    return neighbors.nodes.slice(0, limit).map((media, index) => ({
      item: media as MediaNode,
      score: neighbors.edges[index]?.weight || 0.8,
      strategy: 'continue_listening',
      explanation: {
        reason: 'Continue where you left off',
        factors: [
          { factor: 'playback_progress', weight: 1.0, value: neighbors.edges[index]?.weight || 0.8 },
        ],
        confidence: 0.8,
      },
    }));
  }

  public getFrequentlyPlayedTogether(mediaId: string, options: {
    limit?: number;
  } = {}): RecommendedItem<MediaNode>[] {
    const { limit = 5 } = options;

    const mediaNodeId = `media_${mediaId}`;
    const neighbors = this.graphEngine.getNeighbors(mediaNodeId, {
      relations: ['RECOMMENDED_WITH'],
      direction: 'outgoing',
      nodeTypes: ['media', 'bhajan', 'book'],
      maxResults: limit,
    });

    return neighbors.nodes.map((media, index) => ({
      item: media as MediaNode,
      score: neighbors.edges[index]?.weight || 0,
      strategy: 'collaborative',
      explanation: {
        reason: 'Frequently played together',
        factors: [
          { factor: 'co_occurrence', weight: 1.0, value: neighbors.edges[index]?.weight || 0 },
        ],
        confidence: neighbors.edges[index]?.weight || 0,
      },
    }));
  }

  public getPersonalizedRecommendations(userId: string, options: RecommendationQueryOptions = {}): RecommendedItem<MediaNode>[] {
    const {
      limit = 10,
      category,
      language,
      speaker,
      tags,
      excludeMediaIds = [],
      minScore = 0.05,
    } = options;

    const userNodeId = `user_${userId}`;
    const userNode = this.graphEngine.getNode(userNodeId) as UserNode | undefined;

    // Get user's favorite categories, speakers, languages from graph
    const favoriteCategories = userNode?.attributes.favoriteCategories || [];
    const favoriteSpeakers = userNode?.attributes.favoriteSpeakers || [];
    const favoriteLanguages = userNode?.attributes.favoriteLanguages || [];

    // Collect candidate media from multiple signals
    const candidateScores = new Map<string, { media: MediaNode; score: number; reasons: string[] }>();

    // 1. Category-based candidates
    for (const cat of favoriteCategories) {
      const catResults = this.getMediaByCategory(cat, { limit: 20 });
      for (const media of catResults.items) {
        if (excludeMediaIds.includes(media.nodeId.replace('media_', ''))) continue;
        const entry = candidateScores.get(media.nodeId) || { media, score: 0, reasons: [] };
        entry.score += 0.3;
        entry.reasons.push(`Matches your interest in ${cat}`);
        candidateScores.set(media.nodeId, entry);
      }
    }

    // 2. Speaker-based candidates
    for (const spk of favoriteSpeakers) {
      const spkResults = this.getMediaBySpeaker(spk, { limit: 15 });
      for (const media of spkResults.items) {
        if (excludeMediaIds.includes(media.nodeId.replace('media_', ''))) continue;
        const entry = candidateScores.get(media.nodeId) || { media, score: 0, reasons: [] };
        entry.score += 0.25;
        entry.reasons.push(`Features ${spk}`);
        candidateScores.set(media.nodeId, entry);
      }
    }

    // 3. Language-based candidates
    for (const lang of favoriteLanguages) {
      const langResults = this.getMediaByLanguage(lang, { limit: 15 });
      for (const media of langResults.items) {
        if (excludeMediaIds.includes(media.nodeId.replace('media_', ''))) continue;
        const entry = candidateScores.get(media.nodeId) || { media, score: 0, reasons: [] };
        entry.score += 0.15;
        entry.reasons.push(`In ${lang}`);
        candidateScores.set(media.nodeId, entry);
      }
    }

    // 4. Similar to favorited media
    const favorited = this.graphEngine.getNeighbors(userNodeId, {
      relations: ['FAVORITED_BY'],
      direction: 'outgoing',
      nodeTypes: ['media', 'bhajan', 'book'],
      maxResults: 20,
    });

    for (const favMedia of favorited.nodes) {
      const similar = this.getSimilarMedia(favMedia.nodeId.replace('media_', ''), { limit: 5 });
      for (const rec of similar) {
        if (excludeMediaIds.includes(rec.item.nodeId.replace('media_', ''))) continue;
        const entry = candidateScores.get(rec.item.nodeId) || { media: rec.item, score: 0, reasons: [] };
        entry.score += rec.score * 0.2;
        entry.reasons.push(`Similar to ${favMedia.label}`);
        candidateScores.set(rec.item.nodeId, entry);
      }
    }

    // Apply filters
    let results = Array.from(candidateScores.values())
      .filter(e => e.score >= minScore)
      .filter(e => {
        if (category && e.media.attributes.category !== category) return false;
        if (language && e.media.attributes.language !== language) return false;
        if (speaker && e.media.attributes.speaker !== speaker) return false;
        if (tags && tags.length > 0) {
          const mediaTags = e.media.attributes.tags || [];
          if (!tags.some(t => mediaTags.includes(t))) return false;
        }
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(e => ({
        item: e.media,
        score: Math.min(1.0, e.score),
        strategy: 'hybrid',
        explanation: {
          reason: e.reasons.join('; ') || 'Recommended for you',
          factors: e.reasons.map(r => ({ factor: r, weight: 1, value: 1 })),
          confidence: Math.min(1.0, e.score),
        },
      }));

    return results;
  }

  // ==================== GRAPH ANALYTICS ====================

  public getCategoryStats(): { category: CategoryNode; mediaCount: number; totalPlays: number }[] {
    const categories = this.graphEngine.getNodesByType('category') as CategoryNode[];
    return categories.map(cat => {
      const media = this.getMediaByCategory(cat.nodeId.replace('cat_', ''), { limit: 1000 }).items;
      const totalPlays = media.reduce((sum, m) => sum + (m.attributes.playCount || 0), 0);
      return { category: cat, mediaCount: media.length, totalPlays };
    }).sort((a, b) => b.totalPlays - a.totalPlays);
  }

  public getSpeakerStats(): { speaker: SpeakerNode; mediaCount: number; totalPlays: number }[] {
    const speakers = this.graphEngine.getNodesByType('speaker') as SpeakerNode[];
    return speakers.map(spk => {
      const media = this.getMediaBySpeaker(spk.nodeId.replace('speaker_', ''), { limit: 1000 }).items;
      const totalPlays = media.reduce((sum, m) => sum + (m.attributes.playCount || 0), 0);
      return { speaker: spk, mediaCount: media.length, totalPlays };
    }).sort((a, b) => b.totalPlays - a.totalPlays);
  }

  public getLanguageStats(): { language: LanguageNode; mediaCount: number; totalPlays: number }[] {
    const languages = this.graphEngine.getNodesByType('language') as LanguageNode[];
    return languages.map(lang => {
      const media = this.getMediaByLanguage(lang.nodeId.replace('lang_', ''), { limit: 1000 }).items;
      const totalPlays = media.reduce((sum, m) => sum + (m.attributes.playCount || 0), 0);
      return { language: lang, mediaCount: media.length, totalPlays };
    }).sort((a, b) => b.totalPlays - a.totalPlays);
  }

  public getPlaylistContents(playlistId: string): MediaNode[] {
    const playlistNodeId = `playlist_${playlistId}`;
    const neighbors = this.graphEngine.getNeighbors(playlistNodeId, {
      relations: ['IN_PLAYLIST'],
      direction: 'incoming', // Media -> Playlist
      nodeTypes: ['media', 'bhajan', 'book'],
      maxResults: 1000,
    });
    return neighbors.nodes as MediaNode[];
  }

  public getUserFavorites(userId: string): MediaNode[] {
    const userNodeId = `user_${userId}`;
    const neighbors = this.graphEngine.getNeighbors(userNodeId, {
      relations: ['FAVORITED_BY'],
      direction: 'outgoing',
      nodeTypes: ['media', 'bhajan', 'book'],
      maxResults: 1000,
    });
    return neighbors.nodes as MediaNode[];
  }

  public getConnectedComponents(nodeType?: NodeType): GraphNode[][] {
    const nodes = nodeType
      ? this.graphEngine.getNodesByType(nodeType)
      : this.graphEngine.getAllNodes();

    const visited = new Set<string>();
    const components: GraphNode[][] = [];

    for (const node of nodes) {
      if (visited.has(node.nodeId)) continue;

      const component: GraphNode[] = [];
      const stack = [node.nodeId];

      while (stack.length > 0) {
        const currentId = stack.pop()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const currentNode = this.graphEngine.getNode(currentId);
        if (currentNode) component.push(currentNode);

        // Get all neighbors (both directions)
        const neighbors = this.graphEngine.getNeighbors(currentId, { direction: 'both', maxResults: 1000 });
        for (const n of neighbors.nodes) {
          if (!visited.has(n.nodeId)) {
            stack.push(n.nodeId);
          }
        }
      }

      if (component.length > 0) {
        components.push(component);
      }
    }

    return components.sort((a, b) => b.length - a.length);
  }

  public getGraphCentrality(nodeType?: NodeType): Map<string, number> {
    const nodes = nodeType
      ? this.graphEngine.getNodesByType(nodeType)
      : this.graphEngine.getAllNodes();

    const centrality = new Map<string, number>();

    for (const node of nodes) {
      const outDegree = this.graphEngine.getOutgoingEdges(node.nodeId).length;
      const inDegree = this.graphEngine.getIncomingEdges(node.nodeId).length;
      centrality.set(node.nodeId, outDegree + inDegree);
    }

    return centrality;
  }

  // ==================== EXPORT / IMPORT ====================

  public exportSubgraph(nodeIds: string[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodeSet = new Set(nodeIds);
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    for (const nodeId of nodeIds) {
      const node = this.graphEngine.getNode(nodeId);
      if (node) nodes.push(node);
    }

    for (const edge of this.graphEngine.getAllEdges()) {
      if (nodeSet.has(edge.sourceId) && nodeSet.has(edge.targetId)) {
        edges.push(edge);
      }
    }

    return { nodes, edges };
  }

  public async importSubgraph(data: { nodes: GraphNode[]; edges: GraphEdge[] }): Promise<{ imported: number; errors: string[] }> {
    let imported = 0;
    const errors: string[] = [];

    for (const node of data.nodes) {
      try {
        this.graphEngine.addNode(node);
        imported++;
      } catch (error: any) {
        errors.push(`Failed to import node ${node.nodeId}: ${error.message}`);
      }
    }

    for (const edge of data.edges) {
      try {
        this.graphEngine.addEdge(edge);
      } catch (error: any) {
        errors.push(`Failed to import edge ${edge.edgeId}: ${error.message}`);
      }
    }

    return { imported, errors };
  }
}