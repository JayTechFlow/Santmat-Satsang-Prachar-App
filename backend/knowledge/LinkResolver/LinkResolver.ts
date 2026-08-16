// Sprint M7.1 — Knowledge Graph: Link Resolver (Entity Resolution & Deep Linking)

import { GraphEngine } from '../GraphEngine/GraphEngine';
import { GraphQueryEngine } from '../GraphQueryEngine/GraphQueryEngine';
import {
  GraphNode,
  GraphEdge,
  NodeType,
  EdgeRelation,
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

export interface DeepLink {
  type: 'media' | 'category' | 'speaker' | 'tag' | 'language' | 'author' | 'event' | 'playlist' | 'user' | 'search';
  targetId: string;
  targetLabel: string;
  url: string;
  appRoute?: string;
  params?: Record<string, string>;
}

export interface ResolvedEntity {
  node: GraphNode;
  deepLinks: DeepLink[];
  relatedEntities: {
    categories: CategoryNode[];
    speakers: SpeakerNode[];
    tags: TagNode[];
    language: LanguageNode | undefined;
    author: AuthorNode | undefined;
    event: EventNode | undefined;
    playlists: PlaylistNode[];
  };
  breadcrumbs: Breadcrumb[];
}

export interface Breadcrumb {
  label: string;
  type: NodeType;
  nodeId: string;
  deepLink: DeepLink;
}

export interface SearchSuggestion {
  id: string;
  label: string;
  type: NodeType;
  nodeId: string;
  score: number;
  deepLink: DeepLink;
  metadata?: Record<string, any>;
}

export interface LinkResolutionOptions {
  includeRelated?: boolean;
  includeBreadcrumbs?: boolean;
  maxRelated?: number;
  locale?: string;
}

export class LinkResolver {
  private graphEngine: GraphEngine;
  private queryEngine: GraphQueryEngine;
  private baseUrl: string;
  private appScheme: string;

  constructor(
    graphEngine: GraphEngine,
    queryEngine: GraphQueryEngine,
    options: { baseUrl?: string; appScheme?: string } = {}
  ) {
    this.graphEngine = graphEngine;
    this.queryEngine = queryEngine;
    this.baseUrl = options.baseUrl || 'https://santmat-satsang-prachar.app';
    this.appScheme = options.appScheme || 'santmat://';
  }

  // ==================== MAIN RESOLUTION METHODS ====================

  public resolveMedia(mediaId: string, options: LinkResolutionOptions = {}): ResolvedEntity | null {
    const media = this.queryEngine.findMediaById(mediaId);
    if (!media) return null;

    return this.buildResolvedEntity(media, options);
  }

  public resolveByNodeId(nodeId: string, options: LinkResolutionOptions = {}): ResolvedEntity | null {
    const node = this.graphEngine.getNode(nodeId);
    if (!node) return null;

    switch (node.nodeType) {
      case 'media':
      case 'bhajan':
      case 'book':
        return this.buildResolvedEntity(node as MediaNode, options);
      case 'category':
        return this.resolveCategory(node.nodeId.replace('cat_', ''), options);
      case 'speaker':
      case 'saint':
        return this.resolveSpeaker(node.nodeId.replace('speaker_', ''), options);
      case 'tag':
        return this.resolveTag(node.nodeId.replace('tag_', ''), options);
      case 'language':
        return this.resolveLanguage(node.nodeId.replace('lang_', ''), options);
      case 'author':
        return this.resolveAuthor(node.nodeId.replace('author_', ''), options);
      case 'event':
        return this.resolveEvent(node.nodeId.replace('event_', ''), options);
      case 'playlist':
        return this.resolvePlaylist(node.nodeId.replace('playlist_', ''), options);
      case 'user':
        return this.resolveUser(node.nodeId.replace('user_', ''), options);
      default:
        return this.buildGenericResolvedEntity(node, options);
    }
  }

  public resolveCategory(categoryId: string, options: LinkResolutionOptions = {}): ResolvedEntity | null {
    const categoryNodeId = `cat_${categoryId}`;
    const category = this.graphEngine.getNode(categoryNodeId) as CategoryNode | undefined;
    if (!category) return null;

    const entity = this.buildGenericResolvedEntity(category, options);

    // Add category-specific related entities
    if (options.includeRelated !== false) {
      const media = this.queryEngine.getMediaByCategory(categoryId, { limit: options.maxRelated || 20 }).items;
      entity.relatedEntities = {
        ...entity.relatedEntities,
        media: media as any,
      };
    }

    return entity;
  }

  public resolveSpeaker(speakerId: string, options: LinkResolutionOptions = {}): ResolvedEntity | null {
    const speakerNodeId = `speaker_${speakerId.toLowerCase().replace(/\s+/g, '_')}`;
    const speaker = this.graphEngine.getNode(speakerNodeId) as SpeakerNode | undefined;
    if (!speaker) return null;

    const entity = this.buildGenericResolvedEntity(speaker, options);

    if (options.includeRelated !== false) {
      const media = this.queryEngine.getMediaBySpeaker(speakerId, { limit: options.maxRelated || 20 }).items;
      entity.relatedEntities = {
        ...entity.relatedEntities,
        media: media as any,
      };
    }

    return entity;
  }

  public resolveTag(tagId: string, options: LinkResolutionOptions = {}): ResolvedEntity | null {
    const tagNodeId = `tag_${tagId}`;
    const tag = this.graphEngine.getNode(tagNodeId) as TagNode | undefined;
    if (!tag) return null;

    const entity = this.buildGenericResolvedEntity(tag, options);

    if (options.includeRelated !== false) {
      const media = this.queryEngine.getMediaByTag(tagId, { limit: options.maxRelated || 20 }).items;
      entity.relatedEntities = {
        ...entity.relatedEntities,
        media: media as any,
      };
    }

    return entity;
  }

  public resolveLanguage(languageId: string, options: LinkResolutionOptions = {}): ResolvedEntity | null {
    const langNodeId = `lang_${languageId}`;
    const language = this.graphEngine.getNode(langNodeId) as LanguageNode | undefined;
    if (!language) return null;

    const entity = this.buildGenericResolvedEntity(language, options);

    if (options.includeRelated !== false) {
      const media = this.queryEngine.getMediaByLanguage(languageId, { limit: options.maxRelated || 20 }).items;
      entity.relatedEntities = {
        ...entity.relatedEntities,
        media: media as any,
      };
    }

    return entity;
  }

  public resolveAuthor(authorId: string, options: LinkResolutionOptions = {}): ResolvedEntity | null {
    const authorNodeId = `author_${authorId}`;
    const author = this.graphEngine.getNode(authorNodeId) as AuthorNode | undefined;
    if (!author) return null;

    const entity = this.buildGenericResolvedEntity(author, options);

    if (options.includeRelated !== false) {
      const media = this.queryEngine.getMediaByAuthor(authorId, { limit: options.maxRelated || 20 }).items;
      entity.relatedEntities = {
        ...entity.relatedEntities,
        media: media as any,
      };
    }

    return entity;
  }

  public resolveEvent(eventId: string, options: LinkResolutionOptions = {}): ResolvedEntity | null {
    const eventNodeId = `event_${eventId}`;
    const event = this.graphEngine.getNode(eventNodeId) as EventNode | undefined;
    if (!event) return null;

    const entity = this.buildGenericResolvedEntity(event, options);

    if (options.includeRelated !== false) {
      const media = this.queryEngine.getMediaByEvent(eventId, { limit: options.maxRelated || 20 }).items;
      entity.relatedEntities = {
        ...entity.relatedEntities,
        media: media as any,
      };
    }

    return entity;
  }

  public resolvePlaylist(playlistId: string, options: LinkResolutionOptions = {}): ResolvedEntity | null {
    const playlistNodeId = `playlist_${playlistId}`;
    const playlist = this.graphEngine.getNode(playlistNodeId) as PlaylistNode | undefined;
    if (!playlist) return null;

    const entity = this.buildGenericResolvedEntity(playlist, options);

    if (options.includeRelated !== false) {
      const media = this.queryEngine.getPlaylistContents(playlistId);
      entity.relatedEntities = {
        ...entity.relatedEntities,
        media: media as any,
      };
    }

    return entity;
  }

  public resolveUser(userId: string, options: LinkResolutionOptions = {}): ResolvedEntity | null {
    const userNodeId = `user_${userId}`;
    const user = this.graphEngine.getNode(userNodeId) as UserNode | undefined;
    if (!user) return null;

    const entity = this.buildGenericResolvedEntity(user, options);

    if (options.includeRelated !== false) {
      const favorites = this.queryEngine.getUserFavorites(userId);
      entity.relatedEntities = {
        ...entity.relatedEntities,
        media: favorites as any,
      };
    }

    return entity;
  }

  // ==================== DEEP LINK GENERATION ====================

  public generateDeepLink(node: GraphNode, params: Record<string, string> = {}): DeepLink {
    const typeMap: Record<NodeType, DeepLink['type']> = {
      media: 'media',
      bhajan: 'media',
      book: 'media',
      category: 'category',
      speaker: 'speaker',
      saint: 'speaker',
      tag: 'tag',
      language: 'language',
      author: 'author',
      event: 'event',
      playlist: 'playlist',
      user: 'user',
    };

    const type = typeMap[node.nodeType] || 'media';
    const baseId = this.extractBaseId(node.nodeId, node.nodeType);

    const routeMap: Record<DeepLink['type'], string> = {
      media: '/media',
      category: '/category',
      speaker: '/speaker',
      tag: '/tag',
      language: '/language',
      author: '/author',
      event: '/event',
      playlist: '/playlist',
      user: '/profile',
      search: '/search',
    };

    const appRouteMap: Record<DeepLink['type'], string> = {
      media: 'media-detail',
      category: 'category-detail',
      speaker: 'speaker-detail',
      tag: 'tag-detail',
      language: 'language-detail',
      author: 'author-detail',
      event: 'event-detail',
      playlist: 'playlist-detail',
      user: 'profile',
      search: 'search',
    };

    return {
      type,
      targetId: baseId,
      targetLabel: node.label,
      url: `${this.baseUrl}${routeMap[type]}/${baseId}`,
      appRoute: appRouteMap[type],
      params: { id: baseId, ...params },
    };
  }

  public generateSearchDeepLink(query: string, filters?: Record<string, string>): DeepLink {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();

    return {
      type: 'search',
      targetId: query,
      targetLabel: `Search: ${query}`,
      url: `${this.baseUrl}/search?${queryString}`,
      appRoute: 'search',
      params,
    };
  }

  public generateShareLink(node: GraphNode, shareText?: string): string {
    const deepLink = this.generateDeepLink(node);
    const text = shareText || `Check out ${node.label} on Sant Mat Satsang Prachar`;
    return `${deepLink.url}?share=true&text=${encodeURIComponent(text)}`;
  }

  public generateQRCodeData(node: GraphNode): string {
    return this.generateDeepLink(node).url;
  }

  // ==================== BREADCRUMB GENERATION ====================

  public generateBreadcrumbs(node: GraphNode): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [];

    // Home
    breadcrumbs.push({
      label: 'Home',
      type: 'media' as NodeType,
      nodeId: 'home',
      deepLink: {
        type: 'media',
        targetId: 'home',
        targetLabel: 'Home',
        url: `${this.baseUrl}/`,
        appRoute: 'home',
      },
    });

    // Type-specific breadcrumbs
    switch (node.nodeType) {
      case 'media':
      case 'bhajan':
      case 'book': {
        const media = node as MediaNode;
        // Category
        if (media.attributes.category) {
          const catNode = this.graphEngine.getNode(`cat_${media.attributes.category}`);
          if (catNode) {
            breadcrumbs.push({
              label: (catNode as CategoryNode).attributes.displayName || media.attributes.category,
              type: 'category',
              nodeId: catNode.nodeId,
              deepLink: this.generateDeepLink(catNode),
            });
          }
        }
        // Event
        if (media.attributes.eventId) {
          const eventNode = this.graphEngine.getNode(`event_${media.attributes.eventId}`);
          if (eventNode) {
            breadcrumbs.push({
              label: (eventNode as EventNode).attributes.displayName || media.attributes.eventId,
              type: 'event',
              nodeId: eventNode.nodeId,
              deepLink: this.generateDeepLink(eventNode),
            });
          }
        }
        // Speaker
        if (media.attributes.speaker) {
          const speakerId = media.attributes.speaker.toLowerCase().replace(/\s+/g, '_');
          const speakerNode = this.graphEngine.getNode(`speaker_${speakerId}`);
          if (speakerNode) {
            breadcrumbs.push({
              label: (speakerNode as SpeakerNode).attributes.displayName || media.attributes.speaker,
              type: 'speaker',
              nodeId: speakerNode.nodeId,
              deepLink: this.generateDeepLink(speakerNode),
            });
          }
        }
        break;
      }
      case 'category': {
        const cat = node as CategoryNode;
        if (cat.attributes.parentCategoryId) {
          const parentNode = this.graphEngine.getNode(`cat_${cat.attributes.parentCategoryId}`);
          if (parentNode) {
            breadcrumbs.push({
              label: (parentNode as CategoryNode).attributes.displayName || cat.attributes.parentCategoryId,
              type: 'category',
              nodeId: parentNode.nodeId,
              deepLink: this.generateDeepLink(parentNode),
            });
          }
        }
        break;
      }
      case 'playlist': {
        const playlist = node as PlaylistNode;
        if (playlist.attributes.ownerId) {
          const userNode = this.graphEngine.getNode(`user_${playlist.attributes.ownerId}`);
          if (userNode) {
            breadcrumbs.push({
              label: (userNode as UserNode).attributes.displayName || playlist.attributes.ownerId,
              type: 'user',
              nodeId: userNode.nodeId,
              deepLink: this.generateDeepLink(userNode),
            });
          }
        }
        break;
      }
    }

    // Current item
    breadcrumbs.push({
      label: node.label,
      type: node.nodeType,
      nodeId: node.nodeId,
      deepLink: this.generateDeepLink(node),
    });

    return breadcrumbs;
  }

  // ==================== SEARCH SUGGESTIONS ====================

  public getSearchSuggestions(query: string, options: {
    limit?: number;
    types?: NodeType[];
    userId?: string;
  } = {}): SearchSuggestion[] {
    const { limit = 10, types, userId } = options;

    const results = this.graphEngine.searchNodes(query, {
      nodeTypes: types,
      limit: limit * 2,
    });

    const suggestions: SearchSuggestion[] = [];

    for (const node of results) {
      const deepLink = this.generateDeepLink(node);
      const score = this.calculateSuggestionScore(node, query, userId);

      suggestions.push({
        id: node.nodeId,
        label: node.label,
        type: node.nodeType,
        nodeId: node.nodeId,
        score,
        deepLink,
        metadata: this.extractSuggestionMetadata(node),
      });
    }

    // Sort by score
    suggestions.sort((a, b) => b.score - a.score);

    return suggestions.slice(0, limit);
  }

  private calculateSuggestionScore(node: GraphNode, query: string, userId?: string): number {
    let score = 0;

    // Label match
    const labelLower = node.label.toLowerCase();
    const queryLower = query.toLowerCase();

    if (labelLower === queryLower) score += 100;
    else if (labelLower.startsWith(queryLower)) score += 80;
    else if (labelLower.includes(queryLower)) score += 60;

    // Popularity boost (play count for media)
    if (node.nodeType === 'media' || node.nodeType === 'bhajan' || node.nodeType === 'book') {
      const media = node as MediaNode;
      const plays = media.attributes.playCount || 0;
      score += Math.min(20, Math.log10(plays + 1) * 5);
    }

    // User preference boost
    if (userId) {
      const userNode = this.graphEngine.getNode(`user_${userId}`) as UserNode | undefined;
      if (userNode) {
        if (node.nodeType === 'media' || node.nodeType === 'bhajan' || node.nodeType === 'book') {
          const media = node as MediaNode;
          if (media.attributes.category && userNode.attributes.favoriteCategories.includes(media.attributes.category)) {
            score += 15;
          }
          if (media.attributes.speaker && userNode.attributes.favoriteSpeakers.includes(media.attributes.speaker)) {
            score += 15;
          }
          if (media.attributes.language && userNode.attributes.favoriteLanguages.includes(media.attributes.language)) {
            score += 10;
          }
        }
      }
    }

    // Trending boost
    if (node.nodeType === 'tag') {
      const tag = node as TagNode;
      if (tag.attributes.isTrending) score += 10;
    }

    return score;
  }

  private extractSuggestionMetadata(node: GraphNode): Record<string, any> {
    const metadata: Record<string, any> = {};

    switch (node.nodeType) {
      case 'media':
      case 'bhajan':
      case 'book': {
        const m = node as MediaNode;
        metadata.type = m.attributes.type;
        metadata.category = m.attributes.category;
        metadata.language = m.attributes.language;
        metadata.speaker = m.attributes.speaker;
        metadata.playCount = m.attributes.playCount;
        metadata.durationSeconds = m.attributes.durationSeconds;
        metadata.thumbnailUrl = m.attributes.thumbnailUrl;
        break;
      }
      case 'speaker':
      case 'saint': {
        const s = node as SpeakerNode;
        metadata.isSaint = s.attributes.isSaint;
        metadata.totalMediaCount = s.attributes.totalMediaCount;
        metadata.totalPlayCount = s.attributes.totalPlayCount;
        break;
      }
      case 'category': {
        const c = node as CategoryNode;
        metadata.itemCount = c.attributes.itemCount;
        break;
      }
      case 'playlist': {
        const p = node as PlaylistNode;
        metadata.type = p.attributes.type;
        metadata.itemCount = p.attributes.itemCount;
        metadata.isPublic = p.attributes.isPublic;
        break;
      }
    }

    return metadata;
  }

  // ==================== HELPER METHODS ====================

  private buildResolvedEntity(media: MediaNode, options: LinkResolutionOptions): ResolvedEntity {
    const deepLinks = [
      this.generateDeepLink(media),
      ...(media.attributes.eventId ? [this.generateEventDeepLink(media.attributes.eventId)] : []),
      ...(media.attributes.speaker ? [this.generateSpeakerDeepLink(media.attributes.speaker)] : []),
    ];

    const relatedEntities = {
      categories: this.queryEngine.getMediaCategories(media.nodeId.replace('media_', '')),
      speakers: this.queryEngine.getMediaSpeakers(media.nodeId.replace('media_', '')),
      tags: this.queryEngine.getMediaTags(media.nodeId.replace('media_', '')),
      language: this.queryEngine.getMediaLanguage(media.nodeId.replace('media_', '')),
      author: this.queryEngine.getMediaAuthor(media.nodeId.replace('media_', '')),
      event: this.queryEngine.getMediaEvent(media.nodeId.replace('media_', '')),
      playlists: this.queryEngine.getMediaPlaylists(media.nodeId.replace('media_', '')),
    };

    const breadcrumbs = options.includeBreadcrumbs !== false
      ? this.generateBreadcrumbs(media)
      : [];

    return {
      node: media,
      deepLinks,
      relatedEntities,
      breadcrumbs,
    };
  }

  private buildGenericResolvedEntity(node: GraphNode, options: LinkResolutionOptions): ResolvedEntity {
    const deepLinks = [this.generateDeepLink(node)];
    const breadcrumbs = options.includeBreadcrumbs !== false
      ? this.generateBreadcrumbs(node)
      : [];

    return {
      node,
      deepLinks,
      relatedEntities: {
        categories: [],
        speakers: [],
        tags: [],
        language: undefined,
        author: undefined,
        event: undefined,
        playlists: [],
      },
      breadcrumbs,
    };
  }

  private extractBaseId(nodeId: string, nodeType: NodeType): string {
    const prefixes: Record<NodeType, string> = {
      media: 'media_',
      bhajan: 'bhajan_',
      book: 'book_',
      saint: 'saint_',
      event: 'event_',
      speaker: 'speaker_',
      category: 'cat_',
      tag: 'tag_',
      language: 'lang_',
      author: 'author_',
      playlist: 'playlist_',
      user: 'user_',
    };
    const prefix = prefixes[nodeType] || '';
    return nodeId.startsWith(prefix) ? nodeId.slice(prefix.length) : nodeId;
  }

  private generateEventDeepLink(eventId: string): DeepLink {
    const eventNode = this.graphEngine.getNode(`event_${eventId}`);
    if (eventNode) return this.generateDeepLink(eventNode);
    return {
      type: 'event',
      targetId: eventId,
      targetLabel: eventId,
      url: `${this.baseUrl}/event/${eventId}`,
      appRoute: 'event-detail',
      params: { id: eventId },
    };
  }

  private generateSpeakerDeepLink(speakerName: string): DeepLink {
    const speakerId = speakerName.toLowerCase().replace(/\s+/g, '_');
    const speakerNode = this.graphEngine.getNode(`speaker_${speakerId}`);
    if (speakerNode) return this.generateDeepLink(speakerNode);
    return {
      type: 'speaker',
      targetId: speakerId,
      targetLabel: speakerName,
      url: `${this.baseUrl}/speaker/${speakerId}`,
      appRoute: 'speaker-detail',
      params: { id: speakerId },
    };
  }

  // ==================== BATCH RESOLUTION ====================

  public resolveBatch(nodeIds: string[], options: LinkResolutionOptions = {}): (ResolvedEntity | null)[] {
    return nodeIds.map(id => this.resolveByNodeId(id, options));
  }

  public generateDeepLinksBatch(nodes: GraphNode[]): DeepLink[] {
    return nodes.map(node => this.generateDeepLink(node));
  }

  public generateShareLinksBatch(nodes: GraphNode[], shareText?: string): string[] {
    return nodes.map(node => this.generateShareLink(node, shareText));
  }
}