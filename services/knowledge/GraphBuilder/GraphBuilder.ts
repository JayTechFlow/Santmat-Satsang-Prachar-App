// Sprint M7.1 — Knowledge Graph: Graph Builder (Incremental Graph Construction)

import { GraphEngine } from '../GraphEngine/GraphEngine';
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

export interface DataSource {
  type: 'firestore' | 'api' | 'csv' | 'json' | 'database';
  config: Record<string, any>;
}

export interface BuildJob {
  jobId: string;
  sourceType: NodeType | 'all';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  itemsProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  errors: string[];
}

export interface BuildOptions {
  batchSize?: number;
  skipExisting?: boolean;
  updateExisting?: boolean;
  generateRelationships?: boolean;
  relationshipTypes?: EdgeRelation[];
  onProgress?: (progress: BuildProgress) => void;
}

export interface BuildProgress {
  jobId: string;
  phase: string;
  processed: number;
  total: number;
  percentage: number;
  currentItem?: string;
}

export interface MediaItemInput {
  id: string;
  title: string;
  description?: string;
  category: string;
  type: 'audio' | 'video' | 'book' | 'article';
  language: string;
  tags: string[];
  eventId?: string;
  eventName?: string;
  speaker?: string;
  author?: string;
  durationSeconds?: number;
  playCount?: number;
  likeCount?: number;
  viewCount?: number;
  trendingScore?: number;
  publishedAt?: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  isPublished: boolean;
  embedding?: number[];
  metadata?: Record<string, any>;
}

export interface CategoryItemInput {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  parentCategoryId?: string;
  itemCount: number;
  sortOrder: number;
  isActive: boolean;
  icon?: string;
  color?: string;
}

export interface SpeakerItemInput {
  id: string;
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
}

export interface TagItemInput {
  id: string;
  name: string;
  displayName: string;
  category?: string;
  usageCount: number;
  isTrending: boolean;
  relatedTags: string[];
}

export interface LanguageItemInput {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  script?: string;
  direction: 'ltr' | 'rtl';
  mediaCount: number;
  isActive: boolean;
  flagEmoji?: string;
}

export interface AuthorItemInput {
  id: string;
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
}

export interface EventItemInput {
  id: string;
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
}

export interface PlaylistItemInput {
  id: string;
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
}

export interface UserItemInput {
  id: string;
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
}

export class GraphBuilder {
  private graphEngine: GraphEngine;
  private buildJobs: Map<string, BuildJob> = new Map();
  private idMappings: Map<string, Map<string, string>> = new Map(); // sourceType -> (sourceId -> graphNodeId)

  constructor(graphEngine: GraphEngine) {
    this.graphEngine = graphEngine;
  }

  // ==================== MAIN BUILD METHODS ====================

  public async buildFullGraph(
    dataSources: {
      media?: MediaItemInput[];
      categories?: CategoryItemInput[];
      speakers?: SpeakerItemInput[];
      tags?: TagItemInput[];
      languages?: LanguageItemInput[];
      authors?: AuthorItemInput[];
      events?: EventItemInput[];
      playlists?: PlaylistItemInput[];
      users?: UserItemInput[];
    },
    options: BuildOptions = {}
  ): Promise<BuildJob> {
    const jobId = `build_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job: BuildJob = {
      jobId,
      sourceType: 'all',
      status: 'pending',
      itemsProcessed: 0,
      itemsCreated: 0,
      itemsUpdated: 0,
      errors: [],
    };
    this.buildJobs.set(jobId, job);

    try {
      job.status = 'running';
      job.startedAt = new Date().toISOString();

      const allItems = [
        ...(dataSources.categories || []).map(c => ({ type: 'category' as NodeType, data: c })),
        ...(dataSources.languages || []).map(l => ({ type: 'language' as NodeType, data: l })),
        ...(dataSources.speakers || []).map(s => ({ type: 'speaker' as NodeType, data: s })),
        ...(dataSources.authors || []).map(a => ({ type: 'author' as NodeType, data: a })),
        ...(dataSources.tags || []).map(t => ({ type: 'tag' as NodeType, data: t })),
        ...(dataSources.events || []).map(e => ({ type: 'event' as NodeType, data: e })),
        ...(dataSources.media || []).map(m => ({ type: 'media' as NodeType, data: m })),
        ...(dataSources.playlists || []).map(p => ({ type: 'playlist' as NodeType, data: p })),
        ...(dataSources.users || []).map(u => ({ type: 'user' as NodeType, data: u })),
      ];

      const total = allItems.length;
      let processed = 0;

      // Build nodes in dependency order
      for (const { type, data } of allItems) {
        await this.buildNodeType(type, [data], { ...options, onProgress: undefined });
        processed++;
        if (options.onProgress) {
          options.onProgress({
            jobId,
            phase: `Building ${type} nodes`,
            processed,
            total,
            percentage: Math.round((processed / total) * 100),
            currentItem: data.id,
          });
        }
      }

      // Generate relationships
      if (options.generateRelationships !== false) {
        await this.generateRelationships(dataSources, options);
      }

      job.status = 'completed';
      job.completedAt = new Date().toISOString();
    } catch (error: any) {
      job.status = 'failed';
      job.errors.push(error.message);
      job.completedAt = new Date().toISOString();
    }

    return job;
  }

  public async buildNodeType(
    nodeType: NodeType,
    items: any[],
    options: BuildOptions = {}
  ): Promise<{ created: number; updated: number; errors: string[] }> {
    const { batchSize = 100, skipExisting = false, updateExisting = true } = options;
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    const mapping = this.idMappings.get(nodeType) || new Map();
    this.idMappings.set(nodeType, mapping);

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      for (const item of batch) {
        try {
          const graphNodeId = this.getGraphNodeId(nodeType, item.id);
          const existing = this.graphEngine.hasNode(graphNodeId);

          if (existing && skipExisting) {
            continue;
          }

          const node = this.createNodeFromInput(nodeType, item, graphNodeId);

          if (existing && updateExisting) {
            this.graphEngine.updateNode(node);
            updated++;
          } else {
            this.graphEngine.addNode(node);
            created++;
          }

          mapping.set(item.id, graphNodeId);
        } catch (error: any) {
          errors.push(`Failed to build ${nodeType} ${item.id}: ${error.message}`);
        }
      }
    }

    return { created, updated, errors };
  }

  public async generateRelationships(
    dataSources: {
      media?: MediaItemInput[];
      categories?: CategoryItemInput[];
      speakers?: SpeakerItemInput[];
      tags?: TagItemInput[];
      languages?: LanguageItemInput[];
      authors?: AuthorItemInput[];
      events?: EventItemInput[];
      playlists?: PlaylistItemInput[];
      users?: UserItemInput[];
    },
    options: BuildOptions = {}
  ): Promise<{ created: number; errors: string[] }> {
    const { relationshipTypes = [
      'HAS_CATEGORY', 'SPOKEN_BY', 'HAS_TAG', 'HAS_LANGUAGE',
      'AUTHORED_BY', 'PART_OF_EVENT', 'IN_PLAYLIST', 'SIMILAR_TO',
      'FAVORITED_BY', 'CREATED_BY'
    ] } = options;

    let created = 0;
    const errors: string[] = [];

    const mediaItems = dataSources.media || [];

    for (const media of mediaItems) {
      const mediaNodeId = this.getGraphNodeId('media', media.id);

      // HAS_CATEGORY
      if (relationshipTypes.includes('HAS_CATEGORY') && media.category) {
        const catNodeId = this.getGraphNodeId('category', media.category);
        if (this.graphEngine.hasNode(catNodeId)) {
          this.graphEngine.linkMediaToCategory(mediaNodeId, catNodeId);
          created++;
        }
      }

      // SPOKEN_BY / FEATURES_SPEAKER
      if (relationshipTypes.includes('SPOKEN_BY') && media.speaker) {
        const speakerNodeId = this.getGraphNodeId('speaker', media.speaker);
        if (this.graphEngine.hasNode(speakerNodeId)) {
          this.graphEngine.linkMediaToSpeaker(mediaNodeId, speakerNodeId);
          created++;
        }
      }

      // HAS_TAG
      if (relationshipTypes.includes('HAS_TAG') && media.tags) {
        for (const tag of media.tags) {
          const tagNodeId = this.getGraphNodeId('tag', tag);
          if (this.graphEngine.hasNode(tagNodeId)) {
            this.graphEngine.linkMediaToTag(mediaNodeId, tagNodeId);
            created++;
          }
        }
      }

      // HAS_LANGUAGE
      if (relationshipTypes.includes('HAS_LANGUAGE') && media.language) {
        const langNodeId = this.getGraphNodeId('language', media.language);
        if (this.graphEngine.hasNode(langNodeId)) {
          this.graphEngine.linkMediaToLanguage(mediaNodeId, langNodeId);
          created++;
        }
      }

      // AUTHORED_BY
      if (relationshipTypes.includes('AUTHORED_BY') && media.author) {
        const authorNodeId = this.getGraphNodeId('author', media.author);
        if (this.graphEngine.hasNode(authorNodeId)) {
          this.graphEngine.linkMediaToAuthor(mediaNodeId, authorNodeId);
          created++;
        }
      }

      // PART_OF_EVENT
      if (relationshipTypes.includes('PART_OF_EVENT') && media.eventId) {
        const eventNodeId = this.getGraphNodeId('event', media.eventId);
        if (this.graphEngine.hasNode(eventNodeId)) {
          this.graphEngine.linkMediaToEvent(mediaNodeId, eventNodeId);
          created++;
        }
      }
    }

    // Playlist relationships
    const playlists = dataSources.playlists || [];
    for (const playlist of playlists) {
      const playlistNodeId = this.getGraphNodeId('playlist', playlist.id);

      // CREATED_BY
      if (relationshipTypes.includes('CREATED_BY') && playlist.createdBy) {
        const userNodeId = this.getGraphNodeId('user', playlist.createdBy);
        if (this.graphEngine.hasNode(userNodeId)) {
          this.graphEngine.linkPlaylistCreatedBy(playlistNodeId, userNodeId);
          created++;
        }
      }

      // IN_PLAYLIST (would need playlist items - skipping for now)
    }

    // User favorites
    const users = dataSources.users || [];
    for (const user of users) {
      const userNodeId = this.getGraphNodeId('user', user.id);
      // Would need user's favorite media - skipping for now
    }

    return { created, errors };
  }

  // ==================== INCREMENTAL UPDATES ====================

  public async incrementalUpdate(
    changes: {
      added?: { nodeType: NodeType; data: any }[];
      updated?: { nodeType: NodeType; data: any }[];
      removed?: { nodeType: NodeType; id: string }[];
      relationshipsAdded?: { sourceId: string; targetId: string; relation: EdgeRelation; weight?: number }[];
      relationshipsRemoved?: { sourceId: string; targetId: string; relation: EdgeRelation }[];
    }
  ): Promise<{ nodesUpdated: number; edgesUpdated: number; errors: string[] }> {
    let nodesUpdated = 0;
    let edgesUpdated = 0;
    const errors: string[] = [];

    // Handle removals first
    if (changes.removed) {
      for (const { nodeType, id } of changes.removed) {
        try {
          const graphNodeId = this.getGraphNodeId(nodeType, id);
          this.graphEngine.removeNode(graphNodeId);
          const mapping = this.idMappings.get(nodeType);
          if (mapping) mapping.delete(id);
          nodesUpdated++;
        } catch (error: any) {
          errors.push(`Failed to remove ${nodeType} ${id}: ${error.message}`);
        }
      }
    }

    // Handle additions
    if (changes.added) {
      for (const { nodeType, data } of changes.added) {
        try {
          const graphNodeId = this.getGraphNodeId(nodeType, data.id);
          const node = this.createNodeFromInput(nodeType, data, graphNodeId);
          this.graphEngine.addNode(node);

          const mapping = this.idMappings.get(nodeType) || new Map();
          mapping.set(data.id, graphNodeId);
          this.idMappings.set(nodeType, mapping);

          nodesUpdated++;
        } catch (error: any) {
          errors.push(`Failed to add ${nodeType} ${data.id}: ${error.message}`);
        }
      }
    }

    // Handle updates
    if (changes.updated) {
      for (const { nodeType, data } of changes.updated) {
        try {
          const graphNodeId = this.getGraphNodeId(nodeType, data.id);
          const node = this.createNodeFromInput(nodeType, data, graphNodeId);
          this.graphEngine.updateNode(node);
          nodesUpdated++;
        } catch (error: any) {
          errors.push(`Failed to update ${nodeType} ${data.id}: ${error.message}`);
        }
      }
    }

    // Handle relationship additions
    if (changes.relationshipsAdded) {
      for (const { sourceId, targetId, relation, weight = 1.0 } of changes.relationshipsAdded) {
        try {
          const edgeId = `${sourceId}_${relation}_${targetId}`;
          this.graphEngine.addEdge({
            edgeId,
            sourceId,
            targetId,
            relation,
            weight,
          });
          edgesUpdated++;
        } catch (error: any) {
          errors.push(`Failed to add edge ${sourceId} -> ${targetId}: ${error.message}`);
        }
      }
    }

    // Handle relationship removals
    if (changes.relationshipsRemoved) {
      for (const { sourceId, targetId, relation } of changes.relationshipsRemoved) {
        try {
          const edgeId = `${sourceId}_${relation}_${targetId}`;
          this.graphEngine.removeEdge(edgeId);
          edgesUpdated++;
        } catch (error: any) {
          errors.push(`Failed to remove edge ${sourceId} -> ${targetId}: ${error.message}`);
        }
      }
    }

    return { nodesUpdated, edgesUpdated, errors };
  }

  // ==================== SIMILARITY EDGE GENERATION ====================

  public async generateSimilarityEdges(
    options: {
      minSimilarity?: number;
      maxEdgesPerNode?: number;
      mediaTypes?: ('media' | 'bhajan' | 'book')[];
      useEmbeddings?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<{ edgesCreated: number; errors: string[] }> {
    const {
      minSimilarity = 0.3,
      maxEdgesPerNode = 10,
      mediaTypes = ['media', 'bhajan', 'book'],
      useEmbeddings = true,
      batchSize = 100,
    } = options;

    let edgesCreated = 0;
    const errors: string[] = [];

    // Collect all media nodes
    const allMedia: MediaNode[] = [];
    for (const type of mediaTypes) {
      allMedia.push(...this.graphEngine.getNodesByType(type) as MediaNode[]);
    }

    // Process in batches to avoid O(n^2) memory issues
    for (let i = 0; i < allMedia.length; i += batchSize) {
      const batch = allMedia.slice(i, i + batchSize);

      for (const mediaA of batch) {
        let similarities: { media: MediaNode; score: number }[] = [];

        if (useEmbeddings && mediaA.embedding) {
          // Use embedding similarity
          for (const mediaB of allMedia) {
            if (mediaA.nodeId === mediaB.nodeId) continue;
            if (!mediaB.embedding) continue;

            const similarity = this.cosineSimilarity(mediaA.embedding, mediaB.embedding);
            if (similarity >= minSimilarity) {
              similarities.push({ media: mediaB, score: similarity });
            }
          }
        } else {
          // Use metadata similarity (category, tags, speaker, language)
          for (const mediaB of allMedia) {
            if (mediaA.nodeId === mediaB.nodeId) continue;

            const similarity = this.computeMetadataSimilarity(mediaA, mediaB);
            if (similarity >= minSimilarity) {
              similarities.push({ media: mediaB, score: similarity });
            }
          }
        }

        // Sort and take top K
        similarities.sort((a, b) => b.score - a.score);
        const topSimilar = similarities.slice(0, maxEdgesPerNode);

        for (const { media: mediaB, score } of topSimilar) {
          try {
            this.graphEngine.linkMediaSimilar(mediaA.nodeId, mediaB.nodeId, score);
            edgesCreated++;
          } catch (error: any) {
            errors.push(`Failed to create similarity edge: ${error.message}`);
          }
        }
      }
    }

    return { edgesCreated, errors };
  }

  private computeMetadataSimilarity(mediaA: MediaNode, mediaB: MediaNode): number {
    let score = 0;
    let factors = 0;

    // Category match
    if (mediaA.attributes.category === mediaB.attributes.category) {
      score += 0.3;
      factors++;
    }

    // Language match
    if (mediaA.attributes.language === mediaB.attributes.language) {
      score += 0.2;
      factors++;
    }

    // Speaker match
    if (mediaA.attributes.speaker && mediaA.attributes.speaker === mediaB.attributes.speaker) {
      score += 0.25;
      factors++;
    }

    // Tag overlap (Jaccard)
    const tagsA = new Set(mediaA.attributes.tags || []);
    const tagsB = new Set(mediaB.attributes.tags || []);
    if (tagsA.size > 0 && tagsB.size > 0) {
      const intersection = new Set([...tagsA].filter(x => tagsB.has(x)));
      const union = new Set([...tagsA, ...tagsB]);
      score += 0.15 * (intersection.size / union.size);
      factors++;
    }

    // Event match
    if (mediaA.attributes.eventId && mediaA.attributes.eventId === mediaB.attributes.eventId) {
      score += 0.1;
      factors++;
    }

    return factors > 0 ? score : 0;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length !== b.length) return 0;
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  // ==================== RECOMMENDATION EDGE GENERATION ====================

  public async generateRecommendationEdges(
    userInteractions: Map<string, { mediaId: string; weight: number }[]>,
    options: { minCooccurrence?: number; maxRecommendationsPerMedia?: number } = {}
  ): Promise<{ edgesCreated: number; errors: string[] }> {
    const { minCooccurrence = 2, maxRecommendationsPerMedia = 5 } = options;
    let edgesCreated = 0;
    const errors: string[] = [];

    // Build co-occurrence matrix
    const coOccurrence = new Map<string, Map<string, number>>();

    for (const [userId, interactions] of userInteractions.entries()) {
      const mediaIds = interactions.map(i => i.mediaId);
      for (let i = 0; i < mediaIds.length; i++) {
        for (let j = i + 1; j < mediaIds.length; j++) {
          const a = mediaIds[i], b = mediaIds[j];
          const weightA = interactions.find(x => x.mediaId === a)?.weight || 1;
          const weightB = interactions.find(x => x.mediaId === b)?.weight || 1;
          const combinedWeight = Math.sqrt(weightA * weightB);

          if (!coOccurrence.has(a)) coOccurrence.set(a, new Map());
          if (!coOccurrence.has(b)) coOccurrence.set(b, new Map());

          coOccurrence.get(a)!.set(b, (coOccurrence.get(a)!.get(b) || 0) + combinedWeight);
          coOccurrence.get(b)!.set(a, (coOccurrence.get(b)!.get(a) || 0) + combinedWeight);
        }
      }
    }

    // Create RECOMMENDED_WITH edges
    for (const [mediaId, coMap] of coOccurrence.entries()) {
      const sorted = Array.from(coMap.entries())
        .filter(([, count]) => count >= minCooccurrence)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxRecommendationsPerMedia);

      for (const [targetId, weight] of sorted) {
        try {
          // Normalize weight
          const normalizedWeight = Math.min(1.0, weight / 10);
          this.graphEngine.linkMediaRecommendedWith(mediaId, targetId, normalizedWeight);
          edgesCreated++;
        } catch (error: any) {
          errors.push(`Failed to create recommendation edge: ${error.message}`);
        }
      }
    }

    return { edgesCreated, errors };
  }

  // ==================== CONTINUATION EDGE GENERATION ====================

  public async generateContinuationEdges(
    playbackSequences: Map<string, string[]>, // userId -> ordered mediaIds
    options: { minSequenceCount?: number; maxContinuationsPerMedia?: number } = {}
  ): Promise<{ edgesCreated: number; errors: string[] }> {
    const { minSequenceCount = 3, maxContinuationsPerMedia = 3 } = options;
    let edgesCreated = 0;
    const errors: string[] = [];

    // Count transitions
    const transitions = new Map<string, Map<string, number>>();

    for (const [userId, sequence] of playbackSequences.entries()) {
      for (let i = 1; i < sequence.length; i++) {
        const from = sequence[i - 1];
        const to = sequence[i];

        if (!transitions.has(from)) transitions.set(from, new Map());
        transitions.get(from)!.set(to, (transitions.get(from)!.get(to) || 0) + 1);
      }
    }

    // Create CONTINUES_FROM edges
    for (const [fromId, toMap] of transitions.entries()) {
      const sorted = Array.from(toMap.entries())
        .filter(([, count]) => count >= minSequenceCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxContinuationsPerMedia);

      for (const [toId, count] of sorted) {
        try {
          const weight = Math.min(1.0, count / 20);
          this.graphEngine.linkMediaContinuesFrom(fromId, toId, weight);
          edgesCreated++;
        } catch (error: any) {
          errors.push(`Failed to create continuation edge: ${error.message}`);
        }
      }
    }

    return { edgesCreated, errors };
  }

  // ==================== HELPER METHODS ====================

  private getGraphNodeId(nodeType: NodeType, sourceId: string): string {
    const prefixes: Record<NodeType, string> = {
      media: 'media',
      bhajan: 'bhajan',
      book: 'book',
      saint: 'saint',
      event: 'event',
      speaker: 'speaker',
      category: 'cat',
      tag: 'tag',
      language: 'lang',
      author: 'author',
      playlist: 'playlist',
      user: 'user',
    };
    return `${prefixes[nodeType]}_${sourceId}`;
  }

  private createNodeFromInput(nodeType: NodeType, item: any, nodeId: string): GraphNode {
    const baseNode = {
      nodeId,
      nodeType,
      label: item.title || item.name || item.displayName || item.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    switch (nodeType) {
      case 'media':
      case 'bhajan':
      case 'book':
        return {
          ...baseNode,
          label: item.title,
          attributes: {
            title: item.title,
            description: item.description,
            category: item.category,
            type: item.type,
            language: item.language,
            tags: item.tags || [],
            eventId: item.eventId,
            eventName: item.eventName,
            speaker: item.speaker,
            durationSeconds: item.durationSeconds,
            playCount: item.playCount || 0,
            likeCount: item.likeCount || 0,
            viewCount: item.viewCount || 0,
            trendingScore: item.trendingScore || 0,
            publishedAt: item.publishedAt,
            thumbnailUrl: item.thumbnailUrl,
            mediaUrl: item.mediaUrl,
            author: item.author,
            isPublished: item.isPublished,
            metadata: item.metadata || {},
          },
          embedding: item.embedding,
        } as MediaNode;

      case 'category':
        return {
          ...baseNode,
          label: item.displayName || item.name,
          attributes: {
            name: item.name,
            displayName: item.displayName,
            description: item.description,
            parentCategoryId: item.parentCategoryId,
            itemCount: item.itemCount || 0,
            sortOrder: item.sortOrder || 0,
            isActive: item.isActive !== false,
            icon: item.icon,
            color: item.color,
          },
        } as CategoryNode;

      case 'speaker':
      case 'saint':
        return {
          ...baseNode,
          label: item.displayName || item.name,
          attributes: {
            name: item.name,
            displayName: item.displayName,
            bio: item.bio,
            imageUrl: item.imageUrl,
            language: item.language,
            totalMediaCount: item.totalMediaCount || 0,
            totalPlayCount: item.totalPlayCount || 0,
            isSaint: nodeType === 'saint' || item.isSaint === true,
            birthYear: item.birthYear,
            deathYear: item.deathYear,
            lineage: item.lineage,
            associatedCategories: item.associatedCategories || [],
            tags: item.tags || [],
          },
        } as SpeakerNode;

      case 'tag':
        return {
          ...baseNode,
          label: item.displayName || item.name,
          attributes: {
            name: item.name,
            displayName: item.displayName,
            category: item.category,
            usageCount: item.usageCount || 0,
            isTrending: item.isTrending === true,
            relatedTags: item.relatedTags || [],
          },
        } as TagNode;

      case 'language':
        return {
          ...baseNode,
          label: item.name,
          attributes: {
            code: item.code,
            name: item.name,
            nativeName: item.nativeName,
            script: item.script,
            direction: item.direction || 'ltr',
            mediaCount: item.mediaCount || 0,
            isActive: item.isActive !== false,
            flagEmoji: item.flagEmoji,
          },
        } as LanguageNode;

      case 'author':
        return {
          ...baseNode,
          label: item.displayName || item.name,
          attributes: {
            name: item.name,
            displayName: item.displayName,
            bio: item.bio,
            imageUrl: item.imageUrl,
            totalBooks: item.totalBooks || 0,
            totalMedia: item.totalMedia || 0,
            language: item.language,
            birthYear: item.birthYear,
            deathYear: item.deathYear,
            categories: item.categories || [],
          },
        } as AuthorNode;

      case 'event':
        return {
          ...baseNode,
          label: item.displayName || item.name,
          attributes: {
            name: item.name,
            displayName: item.displayName,
            description: item.description,
            startDate: item.startDate,
            endDate: item.endDate,
            location: item.location,
            eventType: item.eventType,
            totalMediaCount: item.totalMediaCount || 0,
            totalAttendees: item.totalAttendees,
            isRecurring: item.isRecurring === true,
            bannerUrl: item.bannerUrl,
            tags: item.tags || [],
          },
        } as EventNode;

      case 'playlist':
        return {
          ...baseNode,
          label: item.name,
          attributes: {
            name: item.name,
            description: item.description,
            type: item.type,
            ownerId: item.ownerId,
            isPublic: item.isPublic !== false,
            itemCount: item.itemCount || 0,
            totalDurationSeconds: item.totalDurationSeconds || 0,
            tags: item.tags || [],
            coverImageUrl: item.coverImageUrl,
            isCollaborative: item.isCollaborative === true,
            followersCount: item.followersCount || 0,
            createdBy: item.createdBy,
            metadata: item.metadata || {},
          },
        } as PlaylistNode;

      case 'user':
        return {
          ...baseNode,
          label: item.displayName || item.userId,
          attributes: {
            userId: item.userId,
            displayName: item.displayName,
            email: item.email,
            avatarUrl: item.avatarUrl,
            favoriteCategories: item.favoriteCategories || [],
            favoriteSpeakers: item.favoriteSpeakers || [],
            favoriteLanguages: item.favoriteLanguages || [],
            totalPlayCount: item.totalPlayCount || 0,
            totalListenTimeSeconds: item.totalListenTimeSeconds || 0,
            joinDate: item.joinDate,
            tier: item.tier || 'free',
            preferences: item.preferences || {},
          },
        } as UserNode;

      default:
        return { ...baseNode, attributes: item };
    }
  }

  // ==================== JOB MANAGEMENT ====================

  public getJob(jobId: string): BuildJob | undefined {
    return this.buildJobs.get(jobId);
  }

  public getAllJobs(): BuildJob[] {
    return Array.from(this.buildJobs.values());
  }

  public getIdMapping(nodeType: NodeType): Map<string, string> | undefined {
    return this.idMappings.get(nodeType);
  }

  public clearJobs(): void {
    this.buildJobs.clear();
  }
}