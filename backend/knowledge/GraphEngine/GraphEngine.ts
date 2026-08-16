// Sprint M7.1 — Knowledge Graph: Graph Engine (Core Operations)

import {
  GraphNode,
  GraphEdge,
  NodeType,
  EdgeRelation,
  GraphQueryOptions,
  GraphTraversalOptions,
  GraphPath,
  MediaNode,
  CategoryNode,
  SpeakerNode,
  TagNode,
  LanguageNode,
  AuthorNode,
  EventNode,
  PlaylistNode,
  UserNode,
} from './GraphNodes';

export interface GraphEngineConfig {
  maxNodes?: number;
  maxEdges?: number;
  enableIndexing?: boolean;
  cacheSize?: number;
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  nodesByType: Record<NodeType, number>;
  edgesByRelation: Record<EdgeRelation, number>;
  memoryUsageBytes: number;
  indexSize: number;
}

export interface NodeIndexEntry {
  nodeId: string;
  nodeType: NodeType;
  label: string;
  keywords: string[];
}

export class GraphEngine {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map(); // nodeId -> Set of edgeIds
  private reverseAdjacencyList: Map<string, Set<string>> = new Map(); // nodeId -> Set of edgeIds (incoming)
  private nodeIndex: Map<string, NodeIndexEntry[]> = new Map(); // keyword -> index entries
  private config: Required<GraphEngineConfig>;
  private nodeTypeIndex: Map<NodeType, Set<string>> = new Map();
  private relationIndex: Map<EdgeRelation, Set<string>> = new Map();

  constructor(config: GraphEngineConfig = {}) {
    this.config = {
      maxNodes: config.maxNodes ?? 1000000,
      maxEdges: config.maxEdges ?? 5000000,
      enableIndexing: config.enableIndexing ?? true,
      cacheSize: config.cacheSize ?? 10000,
    };
    this.initializeIndexes();
  }

  private initializeIndexes(): void {
    const nodeTypes: NodeType[] = [
      'media', 'bhajan', 'book', 'saint', 'event', 'speaker',
      'category', 'tag', 'language', 'author', 'playlist', 'user'
    ];
    for (const type of nodeTypes) {
      this.nodeTypeIndex.set(type, new Set());
    }

    const relations: EdgeRelation[] = [
      'HAS_CATEGORY', 'SPOKEN_BY', 'HAS_TAG', 'RELATED_TO', 'IN_PLAYLIST',
      'FAVORITED_BY', 'HAS_LANGUAGE', 'AUTHORED_BY', 'PART_OF_EVENT',
      'FEATURES_SPEAKER', 'SIMILAR_TO', 'CONTINUES_FROM', 'RECOMMENDED_WITH',
      'BELONGS_TO_PLAYLIST', 'CREATED_BY', 'TRANSLATED_TO'
    ];
    for (const rel of relations) {
      this.relationIndex.set(rel, new Set());
    }
  }

  // ==================== NODE OPERATIONS ====================

  public addNode(node: GraphNode): boolean {
    if (this.nodes.size >= this.config.maxNodes) {
      throw new Error('Graph node limit exceeded');
    }

    if (this.nodes.has(node.nodeId)) {
      return this.updateNode(node);
    }

    this.nodes.set(node.nodeId, { ...node, createdAt: node.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() });
    this.adjacencyList.set(node.nodeId, new Set());
    this.reverseAdjacencyList.set(node.nodeId, new Set());

    // Update type index
    const typeSet = this.nodeTypeIndex.get(node.nodeType);
    if (typeSet) typeSet.add(node.nodeId);

    // Update search index
    if (this.config.enableIndexing) {
      this.indexNode(node);
    }

    return true;
  }

  public updateNode(node: Partial<GraphNode> & { nodeId: string }): boolean {
    const existing = this.nodes.get(node.nodeId);
    if (!existing) return false;

    const updated: GraphNode = {
      ...existing,
      ...node,
      nodeId: existing.nodeId, // Prevent nodeId change
      nodeType: existing.nodeType, // Prevent type change
      updatedAt: new Date().toISOString(),
      version: (existing.version || 0) + 1,
    };

    this.nodes.set(node.nodeId, updated);

    // Re-index if label or attributes changed
    if (this.config.enableIndexing && (node.label || node.attributes)) {
      this.removeFromIndex(existing);
      this.indexNode(updated);
    }

    return true;
  }

  public removeNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    // Remove all connected edges
    const outgoingEdges = this.adjacencyList.get(nodeId) || new Set();
    const incomingEdges = this.reverseAdjacencyList.get(nodeId) || new Set();

    for (const edgeId of [...outgoingEdges, ...incomingEdges]) {
      this.removeEdge(edgeId);
    }

    // Remove from indexes
    if (this.config.enableIndexing) {
      this.removeFromIndex(node);
    }

    const typeSet = this.nodeTypeIndex.get(node.nodeType);
    if (typeSet) typeSet.delete(nodeId);

    this.nodes.delete(nodeId);
    this.adjacencyList.delete(nodeId);
    this.reverseAdjacencyList.delete(nodeId);

    return true;
  }

  public getNode(nodeId: string): GraphNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getNodesByType(nodeType: NodeType): GraphNode[] {
    const nodeIds = this.nodeTypeIndex.get(nodeType);
    if (!nodeIds) return [];
    return Array.from(nodeIds).map(id => this.nodes.get(id)!).filter(Boolean);
  }

  public hasNode(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }

  // ==================== EDGE OPERATIONS ====================

  public addEdge(edge: GraphEdge): boolean {
    if (this.edges.size >= this.config.maxEdges) {
      throw new Error('Graph edge limit exceeded');
    }

    const sourceExists = this.nodes.has(edge.sourceId);
    const targetExists = this.nodes.has(edge.targetId);
    if (!sourceExists || !targetExists) {
      throw new Error(`Source or target node not found: ${edge.sourceId} -> ${edge.targetId}`);
    }

    if (this.edges.has(edge.edgeId)) {
      return this.updateEdge(edge);
    }

    const newEdge: GraphEdge = {
      ...edge,
      createdAt: edge.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.edges.set(edge.edgeId, newEdge);

    // Update adjacency lists
    const outSet = this.adjacencyList.get(edge.sourceId) || new Set();
    outSet.add(edge.edgeId);
    this.adjacencyList.set(edge.sourceId, outSet);

    const inSet = this.reverseAdjacencyList.get(edge.targetId) || new Set();
    inSet.add(edge.edgeId);
    this.reverseAdjacencyList.set(edge.targetId, inSet);

    // Update relation index
    const relSet = this.relationIndex.get(edge.relation);
    if (relSet) relSet.add(edge.edgeId);

    return true;
  }

  public updateEdge(edge: Partial<GraphEdge> & { edgeId: string }): boolean {
    const existing = this.edges.get(edge.edgeId);
    if (!existing) return false;

    const updated: GraphEdge = {
      ...existing,
      ...edge,
      edgeId: existing.edgeId,
      sourceId: existing.sourceId,
      targetId: existing.targetId,
      updatedAt: new Date().toISOString(),
      version: (existing.version || 0) + 1,
    };

    this.edges.set(edge.edgeId, updated);

    // If relation changed, update relation index
    if (edge.relation && edge.relation !== existing.relation) {
      const oldRelSet = this.relationIndex.get(existing.relation);
      if (oldRelSet) oldRelSet.delete(edge.edgeId);
      const newRelSet = this.relationIndex.get(edge.relation);
      if (newRelSet) newRelSet.add(edge.edgeId);
    }

    return true;
  }

  public removeEdge(edgeId: string): boolean {
    const edge = this.edges.get(edgeId);
    if (!edge) return false;

    // Update adjacency lists
    const outSet = this.adjacencyList.get(edge.sourceId);
    if (outSet) outSet.delete(edgeId);

    const inSet = this.reverseAdjacencyList.get(edge.targetId);
    if (inSet) inSet.delete(edgeId);

    // Update relation index
    const relSet = this.relationIndex.get(edge.relation);
    if (relSet) relSet.delete(edgeId);

    this.edges.delete(edgeId);
    return true;
  }

  public getEdge(edgeId: string): GraphEdge | undefined {
    return this.edges.get(edgeId);
  }

  public getEdgesByRelation(relation: EdgeRelation): GraphEdge[] {
    const edgeIds = this.relationIndex.get(relation);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map(id => this.edges.get(id)!).filter(Boolean);
  }

  public getOutgoingEdges(nodeId: string, relation?: EdgeRelation): GraphEdge[] {
    const edgeIds = this.adjacencyList.get(nodeId) || new Set();
    const edges = Array.from(edgeIds).map(id => this.edges.get(id)!).filter(Boolean);
    if (relation) {
      return edges.filter(e => e.relation === relation);
    }
    return edges;
  }

  public getIncomingEdges(nodeId: string, relation?: EdgeRelation): GraphEdge[] {
    const edgeIds = this.reverseAdjacencyList.get(nodeId) || new Set();
    const edges = Array.from(edgeIds).map(id => this.edges.get(id)!).filter(Boolean);
    if (relation) {
      return edges.filter(e => e.relation === relation);
    }
    return edges;
  }

  // ==================== TRAVERSAL & QUERY ====================

  public getNeighbors(
    nodeId: string,
    options: GraphQueryOptions = {}
  ): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const {
      nodeTypes,
      relations,
      maxResults = 50,
      direction = 'both',
      minWeight = 0,
    } = options;

    const node = this.nodes.get(nodeId);
    if (!node) return { nodes: [], edges: [] };

    let edgeIds: Set<string> = new Set();
    if (direction === 'outgoing' || direction === 'both') {
      const out = this.adjacencyList.get(nodeId) || new Set();
      for (const id of out) edgeIds.add(id);
    }
    if (direction === 'incoming' || direction === 'both') {
      const inn = this.reverseAdjacencyList.get(nodeId) || new Set();
      for (const id of inn) edgeIds.add(id);
    }

    const edges: GraphEdge[] = [];
    const neighborNodeIds = new Set<string>();

    for (const edgeId of edgeIds) {
      const edge = this.edges.get(edgeId);
      if (!edge) continue;
      if (edge.weight < minWeight) continue;
      if (relations && !relations.includes(edge.relation)) continue;

      edges.push(edge);
      if (edge.sourceId !== nodeId) neighborNodeIds.add(edge.sourceId);
      if (edge.targetId !== nodeId) neighborNodeIds.add(edge.targetId);

      if (edges.length >= maxResults) break;
    }

    const nodes: GraphNode[] = [];
    for (const nId of neighborNodeIds) {
      const n = this.nodes.get(nId);
      if (n && (!nodeTypes || nodeTypes.includes(n.nodeType))) {
        nodes.push(n);
      }
    }

    return { nodes, edges };
  }

  public traverse(
    startNodeId: string,
    options: GraphTraversalOptions
  ): { nodes: GraphNode[]; edges: GraphEdge[]; paths: GraphPath[] } {
    const { maxDepth, maxNodes, relationFilter, nodeTypeFilter, weightThreshold = 0 } = options;

    const visitedNodes = new Set<string>();
    const visitedEdges = new Set<string>();
    const resultNodes: GraphNode[] = [];
    const resultEdges: GraphEdge[] = [];
    const paths: GraphPath[] = [];

    const queue: { nodeId: string; depth: number; path: GraphPath }[] = [
      { nodeId: startNodeId, depth: 0, path: { nodes: [], edges: [], totalWeight: 0, pathLength: 0 } }
    ];

    const startNode = this.nodes.get(startNodeId);
    if (startNode) {
      visitedNodes.add(startNodeId);
      resultNodes.push(startNode);
      queue[0].path.nodes.push(startNode);
    }

    while (queue.length > 0 && resultNodes.length < maxNodes) {
      const { nodeId, depth, path } = queue.shift()!;

      if (depth >= maxDepth) continue;

      const outEdges = this.getOutgoingEdges(nodeId);
      for (const edge of outEdges) {
        if (visitedEdges.has(edge.edgeId)) continue;
        if (edge.weight < weightThreshold) continue;
        if (relationFilter && !relationFilter.includes(edge.relation)) continue;

        const targetId = edge.targetId;
        if (visitedNodes.has(targetId)) continue;

        const targetNode = this.nodes.get(targetId);
        if (!targetNode) continue;
        if (nodeTypeFilter && !nodeTypeFilter.includes(targetNode.nodeType)) continue;

        visitedEdges.add(edge.edgeId);
        visitedNodes.add(targetId);
        resultEdges.push(edge);
        resultNodes.push(targetNode);

        const newPath: GraphPath = {
          nodes: [...path.nodes, targetNode],
          edges: [...path.edges, edge],
          totalWeight: path.totalWeight + edge.weight,
          pathLength: path.pathLength + 1,
        };
        paths.push(newPath);

        queue.push({ nodeId: targetId, depth: depth + 1, path: newPath });
      }
    }

    return { nodes: resultNodes, edges: resultEdges, paths };
  }

  public findShortestPath(
    sourceId: string,
    targetId: string,
    options: { maxDepth?: number; relationFilter?: EdgeRelation[] } = {}
  ): GraphPath | null {
    const { maxDepth = 6, relationFilter } = options;

    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) return null;
    if (sourceId === targetId) {
      const node = this.nodes.get(sourceId)!;
      return { nodes: [node], edges: [], totalWeight: 0, pathLength: 0 };
    }

    const queue: { nodeId: string; path: GraphPath }[] = [
      { nodeId: sourceId, path: { nodes: [this.nodes.get(sourceId)!], edges: [], totalWeight: 0, pathLength: 0 } }
    ];
    const visited = new Set<string>([sourceId]);

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;

      if (path.pathLength >= maxDepth) continue;

      const outEdges = this.getOutgoingEdges(nodeId);
      for (const edge of outEdges) {
        if (relationFilter && !relationFilter.includes(edge.relation)) continue;

        const targetId = edge.targetId;
        if (visited.has(targetId)) continue;

        const targetNode = this.nodes.get(targetId);
        if (!targetNode) continue;

        const newPath: GraphPath = {
          nodes: [...path.nodes, targetNode],
          edges: [...path.edges, edge],
          totalWeight: path.totalWeight + edge.weight,
          pathLength: path.pathLength + 1,
        };

        if (targetId === targetId) {
          return newPath;
        }

        visited.add(targetId);
        queue.push({ nodeId: targetId, path: newPath });
      }
    }

    return null;
  }

  // ==================== SEARCH & INDEX ====================

  private indexNode(node: GraphNode): void {
    const keywords = this.extractKeywords(node);
    for (const keyword of keywords) {
      const entries = this.nodeIndex.get(keyword) || [];
      entries.push({
        nodeId: node.nodeId,
        nodeType: node.nodeType,
        label: node.label,
        keywords,
      });
      this.nodeIndex.set(keyword, entries);
    }
  }

  private removeFromIndex(node: GraphNode): void {
    const keywords = this.extractKeywords(node);
    for (const keyword of keywords) {
      const entries = this.nodeIndex.get(keyword) || [];
      const filtered = entries.filter(e => e.nodeId !== node.nodeId);
      if (filtered.length > 0) {
        this.nodeIndex.set(keyword, filtered);
      } else {
        this.nodeIndex.delete(keyword);
      }
    }
  }

  private extractKeywords(node: GraphNode): string[] {
    const keywords = new Set<string>();

    // Add label tokens
    if (node.label) {
      node.label.toLowerCase().split(/\s+/).forEach(t => keywords.add(t));
    }

    // Add attribute keywords based on node type
    if (node.attributes) {
      const attrs = node.attributes as Record<string, any>;
      for (const [key, value] of Object.entries(attrs)) {
        if (typeof value === 'string') {
          value.toLowerCase().split(/\s+/).forEach(t => keywords.add(t));
        } else if (Array.isArray(value)) {
          value.forEach(v => {
            if (typeof v === 'string') v.toLowerCase().split(/\s+/).forEach(t => keywords.add(t));
          });
        }
      }
    }

    // Add nodeId parts
    node.nodeId.split(/[_\-]/).forEach(p => keywords.add(p.toLowerCase()));

    return Array.from(keywords).filter(k => k.length > 1);
  }

  public searchNodes(query: string, options: { nodeTypes?: NodeType[]; limit?: number } = {}): GraphNode[] {
    const { nodeTypes, limit = 20 } = options;
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

    const candidateScores = new Map<string, number>();

    for (const term of queryTerms) {
      // Exact match
      const exactEntries = this.nodeIndex.get(term) || [];
      for (const entry of exactEntries) {
        if (!nodeTypes || nodeTypes.includes(entry.nodeType)) {
          candidateScores.set(entry.nodeId, (candidateScores.get(entry.nodeId) || 0) + 2);
        }
      }

      // Prefix match
      for (const [indexTerm, entries] of this.nodeIndex.entries()) {
        if (indexTerm.startsWith(term)) {
          for (const entry of entries) {
            if (!nodeTypes || nodeTypes.includes(entry.nodeType)) {
              candidateScores.set(entry.nodeId, (candidateScores.get(entry.nodeId) || 0) + 1);
            }
          }
        }
      }
    }

    // Sort by score and return nodes
    const sorted = Array.from(candidateScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([nodeId]) => this.nodes.get(nodeId))
      .filter(Boolean) as GraphNode[];

    return sorted;
  }

  // ==================== UTILITY ====================

  public getStats(): GraphStats {
    const nodesByType: Record<NodeType, number> = {} as Record<NodeType, number>;
    for (const [type, set] of this.nodeTypeIndex.entries()) {
      nodesByType[type] = set.size;
    }

    const edgesByRelation: Record<EdgeRelation, number> = {} as Record<EdgeRelation, number>;
    for (const [rel, set] of this.relationIndex.entries()) {
      edgesByRelation[rel] = set.size;
    }

    // Estimate memory usage
    let memoryUsage = 0;
    for (const node of this.nodes.values()) {
      memoryUsage += JSON.stringify(node).length * 2; // rough estimate
    }
    for (const edge of this.edges.values()) {
      memoryUsage += JSON.stringify(edge).length * 2;
    }

    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size,
      nodesByType,
      edgesByRelation,
      memoryUsageBytes: memoryUsage,
      indexSize: this.nodeIndex.size,
    };
  }

  public clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();
    this.nodeIndex.clear();
    for (const set of this.nodeTypeIndex.values()) set.clear();
    for (const set of this.relationIndex.values()) set.clear();
  }

  public getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  // ==================== CONVENIENCE METHODS FOR M7 ENTITIES ====================

  public addMediaNode(media: Omit<MediaNode, 'nodeType'>): MediaNode {
    const node: MediaNode = {
      ...media,
      nodeType: media.nodeType || 'media',
    };
    this.addNode(node);
    return node;
  }

  public addCategoryNode(category: Omit<CategoryNode, 'nodeType'>): CategoryNode {
    const node: CategoryNode = { ...category, nodeType: 'category' };
    this.addNode(node);
    return node;
  }

  public addSpeakerNode(speaker: Omit<SpeakerNode, 'nodeType'>): SpeakerNode {
    const node: SpeakerNode = { ...speaker, nodeType: 'speaker' };
    this.addNode(node);
    return node;
  }

  public addTagNode(tag: Omit<TagNode, 'nodeType'>): TagNode {
    const node: TagNode = { ...tag, nodeType: 'tag' };
    this.addNode(node);
    return node;
  }

  public addLanguageNode(lang: Omit<LanguageNode, 'nodeType'>): LanguageNode {
    const node: LanguageNode = { ...lang, nodeType: 'language' };
    this.addNode(node);
    return node;
  }

  public addAuthorNode(author: Omit<AuthorNode, 'nodeType'>): AuthorNode {
    const node: AuthorNode = { ...author, nodeType: 'author' };
    this.addNode(node);
    return node;
  }

  public addEventNode(event: Omit<EventNode, 'nodeType'>): EventNode {
    const node: EventNode = { ...event, nodeType: 'event' };
    this.addNode(node);
    return node;
  }

  public addPlaylistNode(playlist: Omit<PlaylistNode, 'nodeType'>): PlaylistNode {
    const node: PlaylistNode = { ...playlist, nodeType: 'playlist' };
    this.addNode(node);
    return node;
  }

  public addUserNode(user: Omit<UserNode, 'nodeType'>): UserNode {
    const node: UserNode = { ...user, nodeType: 'user' };
    this.addNode(node);
    return node;
  }

  // ==================== RELATIONSHIP HELPERS ====================

  public linkMediaToCategory(mediaId: string, categoryId: string, weight: number = 1.0): GraphEdge {
    const edge: GraphEdge = {
      edgeId: `${mediaId}_HAS_CATEGORY_${categoryId}`,
      sourceId: mediaId,
      targetId: categoryId,
      relation: 'HAS_CATEGORY',
      weight,
    };
    this.addEdge(edge);
    return edge;
  }

  public linkMediaToSpeaker(mediaId: string, speakerId: string, weight: number = 1.0): GraphEdge {
    const edge: GraphEdge = {
      edgeId: `${mediaId}_SPOKEN_BY_${speakerId}`,
      sourceId: mediaId,
      targetId: speakerId,
      relation: 'SPOKEN_BY',
      weight,
    };
    this.addEdge(edge);
    return edge;
  }

  public linkMediaToTag(mediaId: string, tagId: string, weight: number = 1.0): GraphEdge {
    const edge: GraphEdge = {
      edgeId: `${mediaId}_HAS_TAG_${tagId}`,
      sourceId: mediaId,
      targetId: tagId,
      relation: 'HAS_TAG',
      weight,
    };
    this.addEdge(edge);
    return edge;
  }

  public linkMediaToLanguage(mediaId: string, languageId: string, weight: number = 1.0): GraphEdge {
    const edge: GraphEdge = {
      edgeId: `${mediaId}_HAS_LANGUAGE_${languageId}`,
      sourceId: mediaId,
      targetId: languageId,
      relation: 'HAS_LANGUAGE',
      weight,
    };
    this.addEdge(edge);
    return edge;
  }

  public linkMediaToAuthor(mediaId: string, authorId: string, weight: number = 1.0): GraphEdge {
    const edge: GraphEdge = {
      edgeId: `${mediaId}_AUTHORED_BY_${authorId}`,
      sourceId: mediaId,
      targetId: authorId,
      relation: 'AUTHORED_BY',
      weight,
    };
    this.addEdge(edge);
    return edge;
  }

  public linkMediaToEvent(mediaId: string, eventId: string, weight: number = 1.0): GraphEdge {
    const edge: GraphEdge = {
      edgeId: `${mediaId}_PART_OF_EVENT_${eventId}`,
      sourceId: mediaId,
      targetId: eventId,
      relation: 'PART_OF_EVENT',
      weight,
    };
    this.addEdge(edge);
    return edge;
  }

  public linkMediaToPlaylist(mediaId: string, playlistId: string, weight: number = 1.0): GraphEdge {
    const edge: GraphEdge = {
      edgeId: `${mediaId}_IN_PLAYLIST_${playlistId}`,
      sourceId: mediaId,
      targetId: playlistId,
      relation: 'IN_PLAYLIST',
      weight,
    };
    this.addEdge(edge);
    return edge;
  }

  public linkMediaSimilar(mediaIdA: string, mediaIdB: string, weight: number): GraphEdge {
    const edge: GraphEdge = {
      edgeId: `${mediaIdA}_SIMILAR_TO_${mediaIdB}`,
      sourceId: mediaIdA,
      targetId: mediaIdB,
      relation: 'SIMILAR_TO',
      weight,
    };
    this.addEdge(edge);
    return edge;
  }

  public linkUserFavoriteMedia(userId: string, mediaId: string, weight: number = 1.0): GraphEdge {
    const edge: GraphEdge = {
      edgeId: `${userId}_FAVORITED_BY_${mediaId}`,
      sourceId: userId,
      targetId: mediaId,
      relation: 'FAVORITED_BY',
      weight,
    };
    this.addEdge(edge);
    return edge;
  }

  public linkPlaylistCreatedBy(playlistId: string, userId: string): GraphEdge {
    const edge: GraphEdge = {
      edgeId: `${playlistId}_CREATED_BY_${userId}`,
      sourceId: playlistId,
      targetId: userId,
      relation: 'CREATED_BY',
      weight: 1.0,
    };
    this.addEdge(edge);
    return edge;
  }

  public linkMediaRecommendedWith(mediaIdA: string, mediaIdB: string, weight: number): GraphEdge {
    const edge: GraphEdge = {
      edgeId: `${mediaIdA}_RECOMMENDED_WITH_${mediaIdB}`,
      sourceId: mediaIdA,
      targetId: mediaIdB,
      relation: 'RECOMMENDED_WITH',
      weight,
    };
    this.addEdge(edge);
    return edge;
  }

  public linkMediaContinuesFrom(mediaIdA: string, mediaIdB: string, weight: number = 1.0): GraphEdge {
    const edge: GraphEdge = {
      edgeId: `${mediaIdA}_CONTINUES_FROM_${mediaIdB}`,
      sourceId: mediaIdA,
      targetId: mediaIdB,
      relation: 'CONTINUES_FROM',
      weight,
    };
    this.addEdge(edge);
    return edge;
  }
}